import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { gerarRelatorioPdf, type DadosRelatorio, type JogoRelatorio, type ResumoLoteria } from "@/lib/relatorio-pdf";
import pool from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutos — pode ser pesado com muitos usuários

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

export async function GET(request: Request) {
  if (!autorizado(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

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
      profiles!inner(plan, plan_expires_at, display_name)
    `)
    .eq("ativo", true);

  if (!jogosAtivos || jogosAtivos.length === 0) {
    return NextResponse.json({ message: "Nenhum jogo ativo." });
  }

  const jogosPremium = jogosAtivos.filter(j => {
    const p = j.profiles as any;
    return p?.plan === "premium" && (!p.plan_expires_at || new Date(p.plan_expires_at) > new Date());
  });

  // Agrupar por usuário
  const porUsuario = new Map<string, typeof jogosPremium>();
  for (const j of jogosPremium) {
    const lista = porUsuario.get(j.user_id) ?? [];
    lista.push(j);
    porUsuario.set(j.user_id, lista);
  }

  // Pré-carregar concursos do mês por loteria
  const concursosPorLoteria: Record<string, any[]> = {};
  for (const lc of ["lotofacil", "megasena"]) {
    const id = await getLoteriaId(lc);
    if (id) concursosPorLoteria[lc] = await getConcursosDoMes(id, mes, ano);
  }

  let enviados = 0;
  const erros: string[] = [];

  for (const [userId, jogos] of porUsuario) {
    // Buscar e-mail do usuário
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const userAuth = users.find(u => u.id === userId);
    if (!userAuth?.email) continue;

    const profile = jogos[0].profiles as any;
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

    // Gerar PDF
    const pdfBytes = await gerarRelatorioPdf({
      nomeUsuario: profile.display_name ?? userAuth.email.split("@")[0],
      email: userAuth.email,
      mes,
      ano,
      geradoEm: new Date(),
      resumos,
      jogos: jogosRelatorio,
    });

    // Enviar via Resend com anexo
    const nomeArquivo = `lotoanalitica-relatorio-${String(mes).padStart(2, "0")}-${ano}.pdf`;
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

    const nomeMes = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
      "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][mes - 1];

    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "LotoAnalítica <noreply@lotoanalitica.com.br>",
          to: [userAuth.email],
          subject: `Seu relatório de ${nomeMes} ${ano} está pronto — LotoAnalítica`,
          text: `Olá, ${profile.display_name ?? ""}!\n\nSegue em anexo seu relatório mensal de ${nomeMes} ${ano} com o desempenho de todos os seus jogos cadastrados.\n\nVocê também pode baixar relatórios anteriores a qualquer momento em:\nhttps://lotoanalitica.com.br/conta/jogos\n\nBoa sorte!\nEquipe LotoAnalítica`,
          attachments: [
            {
              filename: nomeArquivo,
              content: pdfBase64,
            },
          ],
        }),
      });

      if (resp.ok) enviados++;
      else erros.push(`${userAuth.email}: ${await resp.text()}`);
    } catch (err) {
      erros.push(`${userAuth.email}: ${String(err)}`);
    }
  }

  return NextResponse.json({
    ok: true,
    mes,
    ano,
    usuariosProcessados: porUsuario.size,
    emailsEnviados: enviados,
    erros: erros.length > 0 ? erros : undefined,
  });
}
