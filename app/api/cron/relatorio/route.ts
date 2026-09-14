import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { gerarRelatorioPdf, type DadosRelatorio, type JogoRelatorio, type ResumoLoteria } from "@/lib/relatorio-pdf";
import { emailRelatorioMensal } from "@/lib/email-templates";
import pool from "@/lib/db";
import { calcularIsPremium } from "@/lib/plano";
import { logJobRun } from "@/lib/telemetry";
import { enviarEmail } from "@/lib/notificacoes/enviar";
import { urlDescadastro } from "@/lib/notificacoes/unsubscribe";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lotoanalitica.com.br";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutos — pode ser pesado com muitos usuários

// PRECO/FAIXAS/MAPA_FAIXA_BANCO cobrem só lotofacil/megasena — limitação
// pré-existente do relatório mensal (não introduzida nem expandida aqui).
// Fora do escopo da tarefa 1.5 do plano de implementação, que corrige só
// o listUsers() e a falta de idempotência.
const PRECO: Record<string, number> = { lotofacil: 3.0, megasena: 5.0 };
const FAIXAS: Record<string, Record<number, string>> = {
  lotofacil: { 15: "15 pontos", 14: "14 pontos", 13: "13 pontos", 12: "12 pontos", 11: "11 pontos" },
  megasena:  { 6: "Sena", 5: "Quina", 4: "Quadra" },
};
const MAPA_FAIXA_BANCO: Record<string, Record<number, number>> = {
  lotofacil: { 15: 1, 14: 2, 13: 3, 12: 4, 11: 5 },
  megasena:  { 6: 1, 5: 2, 4: 3 },
};

function autorizado(request: Request): boolean {
  const auth = request.headers.get("authorization");
  return !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`;
}

// Mesmo padrão de segurança de lib/notificacoes/handler-http.ts — permite
// testar sem enviar de verdade antes de liberar geral (aceite da tarefa 1.5).
function ehDryRun(request: Request): boolean {
  const url = new URL(request.url);
  const query = url.searchParams.get("dryRun");
  return query !== null ? query === "1" : process.env.NOTIFICACOES_DRY_RUN === "1";
}

async function getConcursosDoMes(loteriaId: number, mes: number, ano: number) {
  const { rows } = await pool.query(
    `SELECT c.numero, c.data_sorteio, c.dezenas,
       json_object_agg(pf.faixa, pf.valor_premio) AS premios
     FROM concurso c
     JOIN premiacao_faixa pf ON pf.concurso_id = c.id
     WHERE c.loteria_id = $1
       AND EXTRACT(MONTH FROM c.data_sorteio) = $2
       AND EXTRACT(YEAR FROM c.data_sorteio) = $3
     GROUP BY c.numero, c.data_sorteio, c.dezenas
     ORDER BY c.numero`,
    [loteriaId, mes, ano]
  );
  return rows;
}

async function getLoteriaId(codigo: string): Promise<number | null> {
  const { rows } = await pool.query("SELECT id FROM loteria WHERE codigo = $1", [codigo]);
  return rows[0]?.id ?? null;
}

// Retenção de product_events (tarefa 2.3 do plano de implementação) —
// junto deste cron mensal em vez de um cron novo dedicado: o Hobby da
// Vercel (plano atual, decisão do usuário na Fase 0) tem limite de cron
// jobs, e uma faxina mensal é granularidade de sobra pra uma retenção de
// 90 dias. Best-effort e isolado num try/catch próprio — nunca deve
// impedir o relatório de rodar.
const RETENCAO_DIAS = 90;

async function limparEventosAntigos(): Promise<void> {
  const startedAt = new Date();
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM product_events WHERE created_at < now() - make_interval(days => $1::int)`,
      [RETENCAO_DIAS]
    );
    await logJobRun({
      jobName: "limpar_eventos_antigos",
      status: "success",
      startedAt,
      details: { linhasApagadas: rowCount, retencaoDias: RETENCAO_DIAS },
    });
  } catch (err) {
    await logJobRun({
      jobName: "limpar_eventos_antigos",
      status: "failed",
      startedAt,
      error: (err as Error).message,
    });
  }
}

export async function GET(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await limparEventosAntigos();

  const startedAt = new Date();
  const dryRun = ehDryRun(request);
  try {
    return await executarRelatorio(startedAt, dryRun);
  } catch (err) {
    await logJobRun({
      jobName: "cron_relatorio",
      status: "failed",
      startedAt,
      error: (err as Error).message,
    });
    throw err;
  }
}

async function executarRelatorio(startedAt: Date, dryRun: boolean) {
  const supabase = createAdminClient();

  // Mês de referência = mês anterior
  const agora = new Date();
  const mesRef = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
  const mes = mesRef.getMonth() + 1;
  const ano = mesRef.getFullYear();

  // Buscar todos os usuários premium com jogos ativos
  const { data: jogosAtivos } = await supabase
    .from("user_games")
    .select(`
      id, user_id, loteria, dezenas, label,
      profiles!inner(plan, plan_expires_at, display_name, email, receber_emails)
    `)
    .eq("ativo", true);

  if (!jogosAtivos || jogosAtivos.length === 0) {
    await logJobRun({ jobName: "cron_relatorio", status: "success", startedAt, details: { motivo: "nenhum jogo ativo" } });
    return NextResponse.json({ message: "Nenhum jogo ativo." });
  }

  const jogosPremium = jogosAtivos.filter(j => {
    const perfil = j.profiles as any;
    return calcularIsPremium(perfil) && perfil.email && perfil.receber_emails !== false;
  });

  // Agrupar por usuário
  const porUsuario = new Map<string, typeof jogosPremium>();
  for (const j of jogosPremium) {
    const lista = porUsuario.get(j.user_id) ?? [];
    lista.push(j);
    porUsuario.set(j.user_id, lista);
  }

  // Chave de deduplicação deste mês — impede reenvio se o cron rodar duas
  // vezes (achado crítico #2 da auditoria de 13/09/2026, mesma correção de
  // notificacoes_enviadas usada em lib/notificacoes/processar-concursos.ts).
  const chaveRelatorio = `relatorio:${ano}-${String(mes).padStart(2, "0")}`;

  // Pré-carregar concursos do mês por loteria
  const concursosPorLoteria: Record<string, any[]> = {};
  for (const lc of ["lotofacil", "megasena"]) {
    const id = await getLoteriaId(lc);
    if (id) concursosPorLoteria[lc] = await getConcursosDoMes(id, mes, ano);
  }

  let enviados = 0;
  const erros: string[] = [];

  for (const [userId, jogos] of porUsuario) {
    const profile = jogos[0].profiles as any;
    const email: string = profile.email;

    // Reivindica a chave ANTES de gastar tempo gerando o PDF — se já foi
    // enviado esse mês pra esse usuário, nem gera de novo.
    let notificacaoId: number | null = null;
    if (!dryRun) {
      const { rows } = await pool.query<{ id: number }>(
        `INSERT INTO notificacoes_enviadas (user_id, tipo, chave)
         VALUES ($1, 'relatorio_mensal', $2)
         ON CONFLICT (user_id, tipo, chave) DO NOTHING
         RETURNING id`,
        [userId, chaveRelatorio]
      );
      notificacaoId = rows[0]?.id ?? null;
      if (!notificacaoId) continue; // já enviado esse mês
    }
    const loteriasCom = [...new Set(jogos.map(j => j.loteria))];

    // Calcular resultados
    const jogosRelatorio: JogoRelatorio[] = [];

    for (const jogo of jogos) {
      const concursos = concursosPorLoteria[jogo.loteria] ?? [];
      const dezenas = jogo.dezenas as number[];
      const setDezenas = new Set(dezenas);
      const mapaFaixa = MAPA_FAIXA_BANCO[jogo.loteria] ?? {};
      const minAc = jogo.loteria === "megasena" ? 4 : 11;
      const premiosNoMes: JogoRelatorio["premiosNoMes"] = [];
      let ganhoTotal = 0;

      for (const c of concursos) {
        const sorteio = c.dezenas as number[];
        const acertos = sorteio.filter(d => setDezenas.has(d)).length;
        if (acertos >= minAc) {
          const faixaBanco = mapaFaixa[acertos];
          if (faixaBanco !== undefined && c.premios) {
            const premio = parseFloat(c.premios[faixaBanco] ?? "0");
            if (premio > 0) {
              ganhoTotal += premio;
              premiosNoMes.push({
                concurso: c.numero,
                acertos,
                faixa: FAIXAS[jogo.loteria]?.[acertos] ?? `${acertos} acertos`,
                premio,
              });
            }
          }
        }
      }

      jogosRelatorio.push({
        id: jogo.id,
        loteria: jogo.loteria,
        dezenas,
        label: jogo.label,
        concursosNoMes: concursos.length,
        premiosNoMes,
        ganhoTotal,
      });
    }

    const resumos: ResumoLoteria[] = loteriasCom.map(lc => {
      const concursos = concursosPorLoteria[lc] ?? [];
      const jogosDaLoteria = jogosRelatorio.filter(j => j.loteria === lc);
      const preco = PRECO[lc] ?? 3.0;
      const totalJogos = jogosDaLoteria.length;
      const totalGasto = concursos.length * preco * totalJogos;
      const totalGanho = jogosDaLoteria.reduce((s, j) => s + j.ganhoTotal, 0);
      const faixasDef = FAIXAS[lc] ?? {};
      const faixaMap = new Map<number, { qtd: number; ganhoTotal: number }>();
      for (const ac of Object.keys(faixasDef).map(Number)) faixaMap.set(ac, { qtd: 0, ganhoTotal: 0 });
      for (const j of jogosDaLoteria)
        for (const p of j.premiosNoMes) {
          const e = faixaMap.get(p.acertos);
          if (e) { e.qtd++; e.ganhoTotal += p.premio; }
        }

      return {
        nomeLoteria: lc === "lotofacil" ? "Lotofácil" : "Mega-Sena",
        concursosNoMes: concursos.length,
        precoAposta: preco,
        totalJogos,
        totalGasto,
        totalGanho,
        saldoFinal: totalGanho - totalGasto,
        porFaixa: Array.from(faixaMap.entries()).map(([acertos, { qtd, ganhoTotal }]) => ({
          descricao: faixasDef[acertos] ?? `${acertos} acertos`,
          qtd,
          ganhoTotal,
        })),
      };
    });

    const nomeMes = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
      "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][mes - 1];
    const nomeUsuario = profile.display_name ?? email.split("@")[0];

    if (dryRun) {
      enviados++; // conta como "seria enviado" pro relato do dry-run
      continue;
    }

    // Gerar PDF
    const pdfBytes = await gerarRelatorioPdf({
      nomeUsuario,
      email,
      mes,
      ano,
      geradoEm: new Date(),
      resumos,
      jogos: jogosRelatorio,
    });

    const nomeArquivo = `lotoanalitica-relatorio-${String(mes).padStart(2, "0")}-${ano}.pdf`;
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");
    const loterias = loteriasCom.map(lc => lc === "lotofacil" ? "Lotofácil" : "Mega-Sena");
    const totalJogos = jogosRelatorio.length;

    const htmlCorpo = emailRelatorioMensal(
      nomeUsuario, nomeMes, ano, totalJogos, loterias,
      `${BASE_URL}/conta/jogos`, urlDescadastro(userId, BASE_URL)
    );

    const resultado = await enviarEmail({
      to: email,
      subject: `Seu relatório de ${nomeMes} de ${ano} está pronto — LotoAnalítica`,
      html: htmlCorpo,
      attachments: [{ filename: nomeArquivo, content: pdfBase64 }],
    });

    if (resultado.ok) {
      enviados++;
    } else {
      erros.push(`${email}: ${resultado.erro}`);
      if (notificacaoId) {
        await pool.query(`UPDATE notificacoes_enviadas SET status = 'falhou', erro = $2 WHERE id = $1`, [notificacaoId, resultado.erro ?? "erro desconhecido"]);
      }
    }
  }

  await logJobRun({
    jobName: "cron_relatorio",
    status: erros.length > 0 ? "partial" : "success",
    startedAt,
    details: { mes, ano, usuariosProcessados: porUsuario.size, emailsEnviados: enviados, qtdErros: erros.length },
    error: erros.length > 0 ? erros.join("; ") : null,
  });

  return NextResponse.json({
    ok: true,
    mes,
    ano,
    usuariosProcessados: porUsuario.size,
    emailsEnviados: enviados,
    erros: erros.length > 0 ? erros : undefined,
  });
}
