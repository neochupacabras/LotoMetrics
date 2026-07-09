export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProbabilidadesClient from "@/components/ProbabilidadesClient";
import ProjecaoAcumuloCard from "@/components/ProjecaoAcumuloCard";
import { getLoteriaPorCodigo, getUltimoConcurso, getConcursosAcumulados } from "@/lib/queries";
import { FAIXAS_PREMIADAS, calcularProjecao, PARAMS_LOTERIA } from "@/lib/probabilidades";
import { isCodigoLoteriaValido } from "@/lib/format";
import { NOME_LOTERIA, metadataPagina } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ loteria: string }>;
}): Promise<Metadata> {
  const { loteria: codigoLoteria } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) return {};
  const nome = NOME_LOTERIA[codigoLoteria] ?? codigoLoteria;
  return metadataPagina(
    codigoLoteria,
    "/probabilidades",
    `Probabilidades reais da ${nome} — chance exata por faixa`,
    `As chances matemáticas exatas de cada faixa de premiação da ${nome}, calculadas por combinatória — a mesma chance em todo concurso, sem depender do histórico.`
  );
}

export default async function ProbabilidadesPage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) notFound();

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) notFound();

  const faixasPremiadas = FAIXAS_PREMIADAS[codigoLoteria] ?? [];

  // Dados para a projeção de acúmulo (só se a loteria tiver params configurados)
  const temProjecao = codigoLoteria in PARAMS_LOTERIA;
  let projecao = null;
  let ultimoConcurso = null;

  if (temProjecao) {
    const [ultimo, acumulados] = await Promise.all([
      getUltimoConcurso(loteria.id),
      getConcursosAcumulados(loteria.id),
    ]);
    ultimoConcurso = ultimo;

    if (ultimo) {
      projecao = calcularProjecao(
        codigoLoteria as keyof typeof PARAMS_LOTERIA,
        ultimo.valorAcumuladoProximo,
        ultimo.valorEstimadoProximo,
        ultimo.valorArrecadado,
        acumulados
      );
    }
  }

  return (
    <div className="container secao">
      <p className="eyebrow">{loteria.nome}</p>
      <h1 className="titulo-edicao">Probabilidades reais</h1>
      <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
        As chances matemáticas exatas de cada faixa de premiação — calculadas por
        combinatória, sem depender de nenhum dado histórico. Isso não muda com
        frequência, atraso ou qualquer outra tabela estatística do site.
      </p>

      {/* ── Projeção de acúmulo ao vivo ─────────────────────────────────── */}
      {projecao && ultimoConcurso && (
        <ProjecaoAcumuloCard
          projecao={projecao}
          nomeLoteria={loteria.nome}
          numeroConcurso={ultimoConcurso.numero + 1}
          dataProximo={ultimoConcurso.dataProximoConcurso}
          acumulado={ultimoConcurso.acumulado}
        />
      )}

      {/* ── Tabela de probabilidades ─────────────────────────────────────── */}
      <ProbabilidadesClient
        dezenaMax={loteria.dezenaMax}
        qtdDezenasSorteadas={loteria.qtdDezenasSorteadas}
        qtdDezenasPadrao={loteria.qtdDezenasSorteadas}
        faixasPremiadas={faixasPremiadas}
      />

      {/* ── Seção especial: trevos da +Milionária ───────────────────────── */}
      {codigoLoteria === "maismilionaria" && (
        <div className="ferramenta-explicacao" style={{ maxWidth: 680, marginTop: 32, marginBottom: 24 }}>
          <h2 className="bloco__titulo">Os trevos da +Milionária</h2>
          <p>
            Além das 6 dezenas de 1 a 50, cada aposta inclui 2 trevos escolhidos de 1
            a 6. A Caixa sorteia 2 trevos. As faixas de premiação combinam acertos de
            dezenas <em>e</em> de trevos — o que cria as 10 faixas exibidas acima.
          </p>
          <p>
            As probabilidades dos trevos são calculadas independentemente das dezenas:
          </p>
          <div className="tabela-scroll">
            <table className="tabela-dados">
              <thead>
                <tr>
                  <th>Acertos de trevos</th>
                  <th className="num">Probabilidade</th>
                  <th className="num">% das apostas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2 trevos certos</td>
                  <td className="num">1 em 15</td>
                  <td className="num">6,67%</td>
                </tr>
                <tr>
                  <td>1 trevo certo</td>
                  <td className="num">8 em 15</td>
                  <td className="num">53,33%</td>
                </tr>
                <tr>
                  <td>0 trevos certos</td>
                  <td className="num">6 em 15</td>
                  <td className="num">40,00%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            A probabilidade de acertar os 2 trevos certos é apenas 1 em 15 — o que
            significa que, em média, apenas 6,7% das apostas acertam os dois trevos.
            Por isso as faixas que exigem "2 trevos" são muito mais raras do que as
            equivalentes com "0 ou 1 trevo".
          </p>
          <p>
            A faixa 1 (6 dezenas + 2 trevos) combina as duas probabilidades independentes:
            P(6 dezenas) × P(2 trevos) = (1/15.890.700) × (1/15) = 1 em 238.360.656.
            Por isso a +Milionária tem o prêmio principal mais raro entre todas as loterias
            federais — e por isso ele tende a acumular mais e chegar a valores recordes.
          </p>
          <p>
            Use o <a href="/maismilionaria/conferidor" className="breadcrumb">
              conferidor da +Milionária
            </a> para checar como seu jogo (dezenas + trevos) teria se saído em todo
            o histórico disponível.
          </p>
        </div>
      )}

      <div className="ferramenta-explicacao" style={{ maxWidth: 680, marginTop: 40, marginBottom: 24 }}>
        <h2 className="bloco__titulo">Por que as probabilidades não mudam</h2>
        <p>
          As chances que aparecem nessa página são calculadas pela combinatória — o ramo
          da matemática que conta quantas combinações possíveis existem para {loteria.nome}.
          A chance de acertar a faixa principal é sempre a mesma fração — 1 dividido pelo
          número total de combinações possíveis — independente de quais dezenas você escolheu,
          quais saíram nos últimos concursos, ou qual estratégia você usou para montar
          o jogo.
        </p>
        <p>
          Isso é diferente de outros jogos onde a probabilidade pode mudar com o
          contexto. Em poker, sua chance de vencer depende das cartas dos outros
          jogadores. Aqui não: o sorteio não sabe e não se importa com o que você
          escolheu. A chance é sempre a mesma fração — 1 dividido pelo número total
          de combinações possíveis.
        </p>
        <p>
          A única forma de melhorar a probabilidade matematicamente é comprar mais
          combinações — seja jogando mais bilhetes separados, seja jogando apostas com
          mais dezenas (que incluem múltiplas combinações). Mas como explicado no artigo
          sobre{" "}
          <a href="/dicas/mais-dezenas-vale-a-pena" className="breadcrumb">
            apostar mais dezenas
          </a>, o custo sobe na exata mesma proporção que a probabilidade — a
          probabilidade por real gasto nunca muda.
        </p>
      </div>

      <div className="aviso-legal">
        <strong>Por que mostrar isso:</strong> nenhuma tabela estatística do site —
        frequência, atraso, ciclos, ou qualquer filtro do gerador de jogos — altera os
        números acima. Eles vêm exclusivamente da quantidade de combinações possíveis,
        que é fixa. Apostar com mais dezenas melhora a chance (você pode comparar acima),
        mas custa proporcionalmente mais caro — e mesmo assim, a chance do prêmio
        principal continua extremamente baixa.
      </div>
    </div>
  );
}
