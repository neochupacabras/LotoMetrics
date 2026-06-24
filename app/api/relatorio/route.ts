import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gerarRelatorioPdf, type DadosRelatorio, type JogoRelatorio, type ResumoLoteria } from "@/lib/relatorio-pdf";
import pool from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

// Preços por loteria
const PRECO: Record<string, number> = { lotofacil: 3.0, megasena: 5.0 };

// Descrições de faixa
const FAIXAS: Record<string, Record<number, string>> = {
  lotofacil: { 15: "15 pontos", 14: "14 pontos", 13: "13 pontos", 12: "12 pontos", 11: "11 pontos" },
  megasena:  { 6: "Sena", 5: "Quina", 4: "Quadra" },
};

const MAPA_FAIXA_BANCO: Record<string, Record<number, number>> = {
  lotofacil: { 15: 1, 14: 2, 13: 3, 12: 4, 11: 5 },
  megasena:  { 6: 1, 5: 2, 4: 3 },
};

function minAcertos(loteria: string): number {
  return loteria === "megasena" ? 4 : 11;
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at, display_name")
    .eq("id", user.id)
    .single();

  const isPremium =
    profile?.plan === "premium" &&
    (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date());

  if (!isPremium) {
    return NextResponse.json({ erro: "Recurso exclusivo para assinantes Premium." }, { status: 403 });
  }

  // Período: default = mês anterior, ou ?mes=M&ano=A na query
  const url = new URL(request.url);
  const agora = new Date();
  const mesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);

  const mes = parseInt(url.searchParams.get("mes") ?? String(mesAnterior.getMonth() + 1));
  const ano = parseInt(url.searchParams.get("ano") ?? String(mesAnterior.getFullYear()));

  // Buscar jogos ativos do usuário
  const { data: jogosRaw } = await supabase
    .from("user_games")
    .select("id, loteria, dezenas, label")
    .eq("user_id", user.id)
    .eq("ativo", true);

  if (!jogosRaw || jogosRaw.length === 0) {
    return NextResponse.json({ erro: "Nenhum jogo ativo encontrado. Salve seus jogos primeiro." }, { status: 404 });
  }

  // Agrupar jogos por loteria
  const loteriasCom = [...new Set(jogosRaw.map(j => j.loteria))];
  const concursosPorLoteria: Record<string, any[]> = {};
  const idsPorLoteria: Record<string, number> = {};

  for (const lc of loteriasCom) {
    const id = await getLoteriaId(lc);
    if (id) {
      idsPorLoteria[lc] = id;
      concursosPorLoteria[lc] = await getConcursosDoMes(id, mes, ano);
    }
  }

  // Calcular resultados por jogo
  const jogosRelatorio: JogoRelatorio[] = [];

  for (const jogo of jogosRaw) {
    const concursos = concursosPorLoteria[jogo.loteria] ?? [];
    const dezenas = jogo.dezenas as number[];
    const setDezenas = new Set(dezenas);
    const mapaFaixa = MAPA_FAIXA_BANCO[jogo.loteria] ?? {};
    const minAc = minAcertos(jogo.loteria);

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

  // Montar resumos por loteria
  const resumos: ResumoLoteria[] = loteriasCom.map(lc => {
    const nomeLoteria = lc === "lotofacil" ? "Lotofácil" : "Mega-Sena";
    const concursos = concursosPorLoteria[lc] ?? [];
    const jogosDaLoteria = jogosRelatorio.filter(j => j.loteria === lc);
    const preco = PRECO[lc] ?? 3.0;
    const totalJogos = jogosDaLoteria.length;
    const totalGasto = concursos.length * preco * totalJogos;
    const totalGanho = jogosDaLoteria.reduce((s, j) => s + j.ganhoTotal, 0);

    // Tabela de faixas agregada
    const faixaMap = new Map<number, { qtd: number; ganhoTotal: number }>();
    const faixasDef = FAIXAS[lc] ?? {};
    for (const ac of Object.keys(faixasDef).map(Number).sort((a, b) => b - a)) {
      faixaMap.set(ac, { qtd: 0, ganhoTotal: 0 });
    }

    for (const jogo of jogosDaLoteria) {
      for (const p of jogo.premiosNoMes) {
        const entry = faixaMap.get(p.acertos);
        if (entry) { entry.qtd++; entry.ganhoTotal += p.premio; }
      }
    }

    const porFaixa = Array.from(faixaMap.entries()).map(([acertos, { qtd, ganhoTotal }]) => ({
      descricao: faixasDef[acertos] ?? `${acertos} acertos`,
      qtd,
      ganhoTotal,
    }));

    return {
      nomeLoteria,
      concursosNoMes: concursos.length,
      precoAposta: preco,
      totalJogos,
      totalGasto,
      totalGanho,
      saldoFinal: totalGanho - totalGasto,
      porFaixa,
    };
  });

  // Gerar PDF
  const pdfBytes = await gerarRelatorioPdf({
    nomeUsuario: profile.display_name ?? user.email?.split("@")[0] ?? "Assinante",
    email: user.email ?? "",
    mes,
    ano,
    geradoEm: new Date(),
    resumos,
    jogos: jogosRelatorio,
  });

  const nomeArquivo = `lotoanalitica-relatorio-${String(mes).padStart(2, "0")}-${ano}.pdf`;

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
      "Cache-Control": "no-store",
    },
  });
}
