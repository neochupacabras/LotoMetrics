import { ImageResponse } from "next/og";
import CardSimulador, { TAMANHO_CARD, type FormatoCard } from "@/components/og/CardSimulador";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { simularHistoricoInterno } from "@/lib/simulador-actions";
import { montarTextoCard } from "@/lib/card-simulador";
import { lerJogoDigitado } from "@/lib/jogo-digitado";
import { isCodigoLoteriaValido, preposicaoLoteria } from "@/lib/format";
import { NOME_LOTERIA } from "@/lib/seo";

// Card "meu jogo teria ganho" (semana 4 do roadmap, entrega b).
//   GET /api/simulador/card?l=megasena&j=05-12-23-34-41-60[&t=1-4][&f=og]
//
// A simulação é refeita aqui, nos últimos 100 concursos (o mesmo recorte do
// plano grátis), a partir só do jogo: nenhum valor vem do navegador, então
// não dá para montar um card com prêmio inventado e o nome do site.
//
// O resultado só muda quando sai concurso novo: cache de 1 hora na CDN, e
// até 1 dia servindo a versão anterior enquanto revalida.
const CONCURSOS_CARD = 100;
const CABECALHO_CACHE = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";

function respostaInvalida(motivo: string): Response {
  return new Response(motivo, { status: 400, headers: { "Cache-Control": "public, s-maxage=86400" } });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const codigoLoteria = params.get("l") ?? "";
  const textoJogo = (params.get("j") ?? "").slice(0, 200);
  const textoTrevos = (params.get("t") ?? "").slice(0, 10);
  const formato: FormatoCard = params.get("f") === "og" ? "og" : "quadrado";

  if (!isCodigoLoteriaValido(codigoLoteria)) return respostaInvalida("Loteria inválida");
  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) return respostaInvalida("Loteria não encontrada");

  const superSete = codigoLoteria === "supersete";
  const { de } = preposicaoLoteria(codigoLoteria);
  const nomeLoteria = NOME_LOTERIA[codigoLoteria] ?? loteria.nome;

  // Lê o jogo sem limitar a quantidade: quem confere o tamanho do jogo é a
  // simulação (assim o card acompanha qualquer mudança de regra lá).
  const jogo = lerJogoDigitado(textoJogo.replace(/-/g, " "), {
    dezenaMin: superSete ? 0 : loteria.dezenaMin,
    dezenaMax: superSete ? 9 : loteria.dezenaMax,
    qtd: superSete ? 7 : loteria.dezenaMax - loteria.dezenaMin + 1,
    superSete,
    ondeLoteria: nomeLoteria,
  });
  if (jogo.erro || jogo.numeros.length === 0) return respostaInvalida("Jogo inválido");

  const trevos = codigoLoteria === "maismilionaria"
    ? (textoTrevos.match(/\d/g) ?? []).map(Number).filter((n) => n >= 1 && n <= 6)
    : undefined;
  if (trevos && (trevos.length !== 2 || trevos[0] === trevos[1])) return respostaInvalida("Trevos inválidos");

  const dezenas = superSete ? jogo.numeros : [...jogo.numeros].sort((a, b) => a - b);
  const resultado = await simularHistoricoInterno(codigoLoteria, dezenas, CONCURSOS_CARD, trevos);
  if ("erro" in resultado) return respostaInvalida(resultado.erro);
  if (resultado.totalConcursos === 0) return respostaInvalida("Sem concursos para simular");

  const texto = montarTextoCard({
    nomeLoteria,
    deLoteria: `${de} ${nomeLoteria}`,
    superSete,
    totalConcursos: resultado.totalConcursos,
    totalGasto: resultado.totalGasto,
    totalGanho: resultado.totalGanho,
    saldoFinal: resultado.saldoFinal,
    maiorPremio: resultado.melhores[0] ?? null,
  });

  return new ImageResponse(
    (
      <CardSimulador
        nomeLoteria={nomeLoteria}
        numeros={dezenas.map((n) => (superSete ? String(n) : String(n).padStart(2, "0")))}
        trevos={(trevos ?? []).sort((a, b) => a - b).map(String)}
        texto={texto}
        formato={formato}
        enderecoSimulador={`lotoanalitica.com.br/${codigoLoteria}/simulador`}
      />
    ),
    { ...TAMANHO_CARD[formato], headers: { "Cache-Control": CABECALHO_CACHE } }
  );
}
