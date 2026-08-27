import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Dezenas from "@/components/Dezenas";
import HeatmapVolante from "@/components/HeatmapVolante";
import GraficoBarras from "@/components/GraficoBarras";
import InsightCallout from "@/components/InsightCallout";
import AnelProgresso from "@/components/AnelProgresso";
import SomaCalculadora from "@/components/SomaCalculadora";
import { SimuladorFrequenciaAleatoria } from "@/components/SimuladorFrequenciaAleatoria";
import { getCategoriaPorSlug, getCategoriasParaLoteria } from "@/lib/categorias";
import { getLoteriaPorCodigo, getUltimoConcurso } from "@/lib/queries";
import { formatarDezena, isCodigoLoteriaValido } from "@/lib/format";
import { compararTempoComMundoReal, estimarDiasCorridos } from "@/lib/insights";
import { AGENDA } from "@/lib/calendario";
import * as Estat from "@/lib/estatisticas";
import { NOME_LOTERIA, metadataPagina } from "@/lib/seo";

// Essas tabelas recalculam distribuições estatísticas sobre todo o histórico
// da loteria a cada acesso. Só existe 1 concurso novo por dia por loteria,
// então cachear por 1h evita recomputar isso a cada visita/rastreamento sem
// deixar a tabela desatualizada por muito tempo depois de um novo sorteio.
export const revalidate = 3600; // 1 hora

// Necessário para o `revalidate` acima realmente funcionar: um segmento
// dinâmico aninhado (aqui, [categoria] dentro de [loteria]) só é elegível
// para cache se ele mesmo declarar generateStaticParams — o do layout pai
// cobre só o parâmetro `loteria`, não este.
export async function generateStaticParams({
  params,
}: {
  params: { loteria: string };
}) {
  return getCategoriasParaLoteria(params.loteria).map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ loteria: string; categoria: string }>;
}): Promise<Metadata> {
  const { loteria: codigoLoteria, categoria: slugCategoria } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) return {};
  const categoria = getCategoriaPorSlug(slugCategoria);
  if (!categoria) return {};
  const nome = NOME_LOTERIA[codigoLoteria] ?? codigoLoteria;
  return metadataPagina(
    codigoLoteria,
    `/tabelas/${categoria.slug}`,
    `${categoria.titulo} — Tabela estatística da ${nome}`,
    categoria.descricao
  );
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ loteria: string; categoria: string }>;
}) {
  const { loteria: codigoLoteria, categoria: slugCategoria } = await params;

  if (!isCodigoLoteriaValido(codigoLoteria)) {
    notFound();
  }

  const categoria = getCategoriaPorSlug(slugCategoria);
  if (!categoria) {
    notFound();
  }

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) {
    notFound();
  }

  // Verificar se a categoria está disponível para esta loteria
  const categoriasDisponiveis = getCategoriasParaLoteria(codigoLoteria);
  if (!categoriasDisponiveis.find((c) => c.slug === slugCategoria)) {
    notFound();
  }

  // Todas as estatísticas abaixo assumem pelo menos 1 concurso no histórico
  // (ex: "dezena mais frequente" precisa de um primeiro lugar). Sem isso —
  // só possível numa loteria recém-cadastrada, antes da primeira importação
  // — mostra um estado vazio em vez de quebrar.
  const ultimoConcurso = await getUltimoConcurso(loteria.id);

  return (
    <div className="container secao">
      <Link href={`/${codigoLoteria}/tabelas`} className="breadcrumb">
        ← Todas as tabelas
      </Link>
      <p className="eyebrow">{loteria.nome}</p>
      <h1 className="titulo-edicao">{categoria.titulo}</h1>
      <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
        {categoria.descricao}
      </p>

      {ultimoConcurso ? (
        <ConteudoCategoria
          slug={slugCategoria}
          codigoLoteria={codigoLoteria}
          loteriaId={loteria.id}
          dezenaMin={loteria.dezenaMin}
          dezenaMax={loteria.dezenaMax}
          gridColunas={loteria.gridColunas}
          qtdDezenasSorteadas={loteria.qtdDezenasSorteadas}
        />
      ) : (
        <div className="bloco">
          <p className="bloco__nota">
            Ainda não há concursos suficientes de {loteria.nome} pra montar essa
            estatística. Volte depois do primeiro sorteio.
          </p>
        </div>
      )}

      <div className="aviso-legal">
        <strong>Lembrete:</strong> esta tabela descreve o histórico, não prevê o
        futuro. Cada sorteio é um evento independente — o que já aconteceu não
        altera a probabilidade do próximo concurso.
      </div>
    </div>
  );
}

async function ConteudoCategoria({
  slug,
  codigoLoteria,
  loteriaId,
  dezenaMin,
  dezenaMax,
  gridColunas,
  qtdDezenasSorteadas,
}: {
  slug: string;
  codigoLoteria: string;
  loteriaId: number;
  dezenaMin: number;
  dezenaMax: number;
  gridColunas: number;
  qtdDezenasSorteadas: number;
}) {
  switch (slug) {
    case "frequencia":
      return (
        <ConteudoFrequencia
          loteriaId={loteriaId}
          dezenaMin={dezenaMin}
          dezenaMax={dezenaMax}
          gridColunas={gridColunas}
          qtdDezenasSorteadas={qtdDezenasSorteadas}
        />
      );
    case "atraso":
      return (
        <ConteudoAtraso
          codigoLoteria={codigoLoteria}
          loteriaId={loteriaId}
          dezenaMin={dezenaMin}
          dezenaMax={dezenaMax}
          gridColunas={gridColunas}
        />
      );
    case "ciclos":
      return <ConteudoCiclos loteriaId={loteriaId} />;
    case "sequencias":
      return <ConteudoSequencias loteriaId={loteriaId} />;
    case "pares-impares":
      return <ConteudoParesImpares loteriaId={loteriaId} />;
    case "primos":
      return (
        <ConteudoCategoriaBinaria
          loteriaId={loteriaId}
          qtdDezenasSorteadas={qtdDezenasSorteadas}
          getFrequencia={Estat.getPrimosFrequencia}
          getDistribuicao={Estat.getPrimosDistribuicao}
          rotuloPositivo="primo"
          rotuloQuantidade="primos"
        />
      );
    case "soma":
      return (
        <ConteudoSoma
          loteriaId={loteriaId}
          dezenaMin={dezenaMin}
          dezenaMax={dezenaMax}
          qtdDezenasSorteadas={qtdDezenasSorteadas}
        />
      );
    case "fibonacci":
      return (
        <ConteudoCategoriaBinaria
          loteriaId={loteriaId}
          qtdDezenasSorteadas={qtdDezenasSorteadas}
          getFrequencia={Estat.getFibonacciFrequencia}
          getDistribuicao={Estat.getFibonacciDistribuicao}
          rotuloPositivo="fibonacci"
          rotuloQuantidade="números de Fibonacci"
        />
      );
    case "multiplos-de-3":
      return (
        <ConteudoCategoriaBinaria
          loteriaId={loteriaId}
          qtdDezenasSorteadas={qtdDezenasSorteadas}
          getFrequencia={Estat.getMultiplos3Frequencia}
          getDistribuicao={Estat.getMultiplos3Distribuicao}
          rotuloPositivo="multiplo_de_3"
          rotuloQuantidade="múltiplos de 3"
        />
      );
    case "repetidas":
      return <ConteudoRepetidas loteriaId={loteriaId} />;
    case "moldura-centro":
      return <ConteudoMolduraCentro loteriaId={loteriaId} />;
    case "linhas-colunas":
      return <ConteudoLinhasColunas loteriaId={loteriaId} />;
    case "duques-trincas":
      return (
        <ConteudoDuquesTrincas
          loteriaId={loteriaId}
          dezenaMin={dezenaMin}
          dezenaMax={dezenaMax}
          qtdDezenasSorteadas={qtdDezenasSorteadas}
        />
      );
    default:
      notFound();
  }
}

// ---------------------------------------------------------------
// FREQUÊNCIA
// ---------------------------------------------------------------
async function ConteudoFrequencia({
  loteriaId,
  dezenaMin,
  dezenaMax,
  gridColunas,
  qtdDezenasSorteadas,
}: {
  loteriaId: number;
  dezenaMin: number;
  dezenaMax: number;
  gridColunas: number;
  qtdDezenasSorteadas: number;
}) {
  const dados = await Estat.getFrequencia(loteriaId);
  const maisFrequentes = dados.slice(0, 10);
  const menosFrequentes = [...dados].sort((a, b) => a.frequencia - b.frequencia).slice(0, 10);
  const valoresPorDezena = Object.fromEntries(dados.map((d) => [d.dezena, d.frequencia]));

  const campea = dados[0];
  const mediaFreq = dados.reduce((s, d) => s + d.frequencia, 0) / dados.length;
  const diffPct = Math.round(((campea.frequencia - mediaFreq) / mediaFreq) * 100);

  return (
    <>
      <InsightCallout kicker="A campeã do histórico">
        A dezena <strong>{formatarDezena(campea.dezena)}</strong> é a mais sorteada
        de toda a história: já saiu <strong>{campea.frequencia} vezes</strong>,{" "}
        {diffPct}% acima da média das demais dezenas.
      </InsightCallout>
      <SimuladorFrequenciaAleatoria
        dezenaMin={dezenaMin}
        dezenaMax={dezenaMax}
        qtdDezenasSorteadas={qtdDezenasSorteadas}
        frequenciaReal={dados}
      />
      <div className="bloco">
        <h2 className="bloco__titulo">Mapa de calor</h2>
        <p className="bloco__nota">
          Mesmo layout do volante — quanto mais vermelho, mais vezes a dezena já saiu.
        </p>
        <HeatmapVolante
          dezenaMin={dezenaMin}
          dezenaMax={dezenaMax}
          gridColunas={gridColunas}
          valores={valoresPorDezena}
          rotuloValor="vezes sorteada"
        />
      </div>
      <div className="bloco">
        <h2 className="bloco__titulo">As 10 mais sorteadas</h2>
        <GraficoBarras
          dados={maisFrequentes.map((d) => ({
            rotulo: formatarDezena(d.dezena),
            valor: d.frequencia,
          }))}
          rotuloValor="vezes"
          vertical
          altura={220}
        />
        <TabelaDezenaValor linhas={maisFrequentes.map((d) => [d.dezena, d.frequencia])} rotuloValor="Vezes sorteada" />
      </div>
      <div className="bloco">
        <h2 className="bloco__titulo">As 10 menos sorteadas</h2>
        <GraficoBarras
          dados={menosFrequentes.map((d) => ({
            rotulo: formatarDezena(d.dezena),
            valor: d.frequencia,
          }))}
          rotuloValor="vezes"
          vertical
          altura={220}
        />
        <TabelaDezenaValor linhas={menosFrequentes.map((d) => [d.dezena, d.frequencia])} rotuloValor="Vezes sorteada" />
      </div>
    </>
  );
}

// ---------------------------------------------------------------
// ATRASO
// ---------------------------------------------------------------
async function ConteudoAtraso({
  codigoLoteria,
  loteriaId,
  dezenaMin,
  dezenaMax,
  gridColunas,
}: {
  codigoLoteria: string;
  loteriaId: number;
  dezenaMin: number;
  dezenaMax: number;
  gridColunas: number;
}) {
  const dados = await Estat.getAtraso(loteriaId);
  const valoresPorDezena = Object.fromEntries(dados.map((d) => [d.dezena, d.atraso]));

  const maisAtrasada = dados[0];
  const sorteiosPorSemana = AGENDA.find((a) => a.codigo === codigoLoteria)?.dias.length ?? 3;
  const diasEstimados = estimarDiasCorridos(maisAtrasada.atraso, sorteiosPorSemana);
  const comparacao = compararTempoComMundoReal(diasEstimados);

  return (
    <div className="bloco">
      <InsightCallout kicker="A mais sumida do momento">
        A dezena <strong>{formatarDezena(maisAtrasada.dezena)}</strong> não aparece
        há <strong>{maisAtrasada.atraso} concursos</strong> — cerca de{" "}
        {diasEstimados} dias corridos, ou seja, {comparacao}.
      </InsightCallout>
      <h2 className="bloco__titulo">Mapa de calor</h2>
      <p className="bloco__nota">
        Mesmo layout do volante — quanto mais vermelho, mais concursos a dezena está sem
        sair.
      </p>
      <HeatmapVolante
        dezenaMin={dezenaMin}
        dezenaMax={dezenaMax}
        gridColunas={gridColunas}
        valores={valoresPorDezena}
        rotuloValor="concursos sem sair"
      />
      <h2 className="bloco__titulo" style={{ marginTop: "28px" }}>
        Atraso por dezena
      </h2>
      <p className="bloco__nota">Ordenado da mais atrasada para a mais recente.</p>
      <GraficoBarras
        dados={dados.slice(0, 15).map((d) => ({
          rotulo: formatarDezena(d.dezena),
          valor: d.atraso,
        }))}
        rotuloValor="concursos sem sair"
        vertical
        altura={300}
      />
      <div className="tabela-scroll">
        <table className="tabela-dados">
        <thead>
          <tr>
            <th>Dezena</th>
            <th className="num">Atraso atual</th>
            <th className="num">Último concurso em que saiu</th>
            <th className="num">Maior atraso já registrado</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((d) => (
            <tr key={d.dezena}>
              <td>{formatarDezena(d.dezena)}</td>
              <td className="num">{d.atraso}</td>
              <td className="num">#{d.ultimoConcurso}</td>
              <td className="num">{d.maiorAtraso}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// CICLOS
// ---------------------------------------------------------------
async function ConteudoCiclos({ loteriaId }: { loteriaId: number }) {
  const { atual, historico } = await Estat.getCiclos(loteriaId);
  const totalNoCicloAtual = atual
    ? atual.dezenasSorteadas.length + atual.dezenasFaltantes.length
    : 0;
  const pctCompleto = atual && totalNoCicloAtual > 0
    ? Math.round((atual.dezenasSorteadas.length / totalNoCicloAtual) * 100)
    : 0;

  return (
    <>
      {atual && (
        <div className="bloco">
          <h2 className="bloco__titulo">Ciclo atual</h2>
          <p className="bloco__nota">
            Em andamento desde o concurso #{atual.concursoInicio} ({atual.concursosNoCiclo}{" "}
            concursos até agora).
          </p>

          <AnelProgresso
            percentual={pctCompleto}
            texto={
              <>
                {atual.dezenasFaltantes.length > 0 ? (
                  <>
                    Faltam apenas <strong>{atual.dezenasFaltantes.length} dezenas</strong> pra
                    fechar esse ciclo — depois disso, todas as {totalNoCicloAtual} dezenas terão
                    saído ao menos uma vez desde o concurso #{atual.concursoInicio}.
                  </>
                ) : (
                  <>O ciclo está prestes a fechar no próximo concurso.</>
                )}
              </>
            }
          />

          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--ink-soft)" }}>
            Já saíram neste ciclo:
          </p>
          <Dezenas dezenas={atual.dezenasSorteadas} tamanho="pequena" />

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              color: "var(--ink-soft)",
              marginTop: "16px",
            }}
          >
            Faltam para fechar o ciclo:
          </p>
          {atual.dezenasFaltantes.length > 0 ? (
            <Dezenas dezenas={atual.dezenasFaltantes} tamanho="pequena" />
          ) : (
            <p>Nenhuma — o ciclo está prestes a fechar no próximo concurso.</p>
          )}
        </div>
      )}

      <div className="bloco">
        <h2 className="bloco__titulo">Últimos ciclos fechados</h2>
        {historico.length > 0 && (
          <p className="bloco__nota">
            Em média, um ciclo leva{" "}
            <strong>
              {Math.round(historico.reduce((s, c) => s + c.qtdConcursos, 0) / historico.length)}
            </strong>{" "}
            concursos pra fechar — o mais rápido levou{" "}
            {Math.min(...historico.map((c) => c.qtdConcursos))} e o mais demorado,{" "}
            {Math.max(...historico.map((c) => c.qtdConcursos))}.
          </p>
        )}
        <GraficoBarras
          dados={[...historico]
            .reverse()
            .map((c) => ({ rotulo: `#${c.ciclo}`, valor: c.qtdConcursos }))}
          rotuloValor="concursos"
          altura={240}
        />
        <div className="tabela-scroll">
        <table className="tabela-dados">
          <thead>
            <tr>
              <th>Ciclo</th>
              <th className="num">Concurso inicial</th>
              <th className="num">Concurso final</th>
              <th className="num">Duração (concursos)</th>
            </tr>
          </thead>
          <tbody>
            {historico.map((c) => (
              <tr key={c.ciclo}>
                <td>#{c.ciclo}</td>
                <td className="num">{c.concursoInicio}</td>
                <td className="num">{c.concursoFim}</td>
                <td className="num">{c.qtdConcursos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------
// SEQUÊNCIAS
// ---------------------------------------------------------------
async function ConteudoSequencias({ loteriaId }: { loteriaId: number }) {
  const { distribuicao, consecutivasPorDezena } = await Estat.getSequencias(loteriaId);

  const recordeSequencia = [...distribuicao]
    .filter((d) => d.ocorrencias > 0)
    .sort((a, b) => b.maiorSequencia - a.maiorSequencia)[0];
  const recordistaConcursos = [...consecutivasPorDezena].sort(
    (a, b) => b.maiorSequenciaConcursos - a.maiorSequenciaConcursos
  )[0];

  return (
    <>
      {recordeSequencia && (
        <InsightCallout kicker="O maior encontro já visto">
          A maior sequência dentro de um único sorteio já registrada foi de{" "}
          <strong>{recordeSequencia.maiorSequencia} dezenas seguidas</strong> — algo
          que aconteceu em {recordeSequencia.percentual}% dos concursos.
          {recordistaConcursos && (
            <>
              {" "}Já a dezena <strong>{formatarDezena(recordistaConcursos.dezena)}</strong> detém
              o outro recorde: saiu em{" "}
              <strong>{recordistaConcursos.maiorSequenciaConcursos} concursos seguidos</strong>,
              sem faltar um único.
            </>
          )}
        </InsightCallout>
      )}
      <div className="bloco">
        <h2 className="bloco__titulo">Maior sequência dentro de um sorteio</h2>
        <p className="bloco__nota">
          Ex.: se 7, 8, 9 e 10 saíram no mesmo concurso, isso é uma sequência de 4.
        </p>
        <GraficoBarras
          dados={[...distribuicao]
            .sort((a, b) => a.maiorSequencia - b.maiorSequencia)
            .map((d) => ({ rotulo: String(d.maiorSequencia), valor: d.percentual }))}
          rotuloValor="% do histórico"
          altura={240}
        />
        <TabelaDistribuicao
          rotuloPrimeiraColuna="Tamanho da maior sequência"
          linhas={distribuicao.map((d) => [d.maiorSequencia, d.ocorrencias, d.percentual])}
        />
      </div>
      <div className="bloco">
        <h2 className="bloco__titulo">Maior sequência de concursos seguidos por dezena</h2>
        <p className="bloco__nota">
          Quantos concursos seguidos, sem interrupção, uma mesma dezena já chegou a sair.
        </p>
        <div className="tabela-scroll">
        <table className="tabela-dados">
          <thead>
            <tr>
              <th>Dezena</th>
              <th className="num">Maior sequência (concursos seguidos)</th>
            </tr>
          </thead>
          <tbody>
            {consecutivasPorDezena.map((d) => (
              <tr key={d.dezena}>
                <td>{formatarDezena(d.dezena)}</td>
                <td className="num">{d.maiorSequenciaConcursos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------
// PARES E ÍMPARES
// ---------------------------------------------------------------
async function ConteudoParesImpares({ loteriaId }: { loteriaId: number }) {
  const dados = await Estat.getParesImpares(loteriaId);
  const maisComum = [...dados].sort((a, b) => b.ocorrencias - a.ocorrencias)[0];
  return (
    <div className="bloco">
      {maisComum && (
        <InsightCallout kicker="O equilíbrio mais frequente">
          A combinação mais comum de todas é{" "}
          <strong>{maisComum.pares} pares e {maisComum.impares} ímpares</strong> no
          mesmo sorteio — presente em <strong>{maisComum.percentual}%</strong> de
          todos os concursos já realizados.
        </InsightCallout>
      )}
      <GraficoBarras
        dados={[...dados]
          .sort((a, b) => a.pares - b.pares)
          .map((d) => ({
            rotulo: `${d.pares}p/${d.impares}i`,
            valor: d.percentual,
          }))}
        rotuloValor="% do histórico"
        altura={260}
      />
      <div className="tabela-scroll">
        <table className="tabela-dados">
        <thead>
          <tr>
            <th>Pares</th>
            <th>Ímpares</th>
            <th className="num">Ocorrências</th>
            <th className="num">% do histórico</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((d, i) => (
            <tr key={i}>
              <td>{d.pares}</td>
              <td>{d.impares}</td>
              <td className="num">{d.ocorrencias}</td>
              <td className="num">{d.percentual}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// CATEGORIA BINÁRIA (primos / fibonacci / múltiplos de 3)
// ---------------------------------------------------------------
async function ConteudoCategoriaBinaria({
  loteriaId,
  qtdDezenasSorteadas,
  getFrequencia,
  getDistribuicao,
  rotuloPositivo,
  rotuloQuantidade,
}: {
  loteriaId: number;
  qtdDezenasSorteadas: number;
  getFrequencia: (id: number) => Promise<Estat.FrequenciaCategoria[]>;
  getDistribuicao: (id: number) => Promise<Estat.DistribuicaoQuantidade[]>;
  rotuloPositivo: string;
  rotuloQuantidade: string;
}) {
  const [frequencia, distribuicao] = await Promise.all([
    getFrequencia(loteriaId),
    getDistribuicao(loteriaId),
  ]);
  const positiva = frequencia.find((f) => f.categoria === rotuloPositivo);
  const negativa = frequencia.find((f) => f.categoria !== rotuloPositivo);
  const mediaPorJogo = positiva ? (positiva.percentual / 100) * qtdDezenasSorteadas : 0;

  return (
    <>
      {positiva && (
        <InsightCallout kicker="Na balança">
          Ao longo de toda a história, <strong>{positiva.percentual}%</strong> de
          todas as dezenas já sorteadas eram {rotuloQuantidade} — isso dá, em
          média, <strong>{mediaPorJogo.toFixed(1).replace(".0", "")}</strong> a cada{" "}
          {qtdDezenasSorteadas} dezenas de um sorteio típico.
        </InsightCallout>
      )}
      <div className="bloco">
        <h2 className="bloco__titulo">Frequência geral</h2>
        <div className="tabela-scroll">
        <table className="tabela-dados">
          <thead>
            <tr>
              <th>Categoria</th>
              <th className="num">Frequência</th>
              <th className="num">% do total sorteado</th>
            </tr>
          </thead>
          <tbody>
            {positiva && (
              <tr>
                <td style={{ textTransform: "capitalize" }}>{rotuloPositivo.replace(/_/g, " ")}</td>
                <td className="num">{positiva.frequencia}</td>
                <td className="num">{positiva.percentual}%</td>
              </tr>
            )}
            {negativa && (
              <tr>
                <td style={{ textTransform: "capitalize" }}>{negativa.categoria.replace(/_/g, " ")}</td>
                <td className="num">{negativa.frequencia}</td>
                <td className="num">{negativa.percentual}%</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
      <div className="bloco">
        <h2 className="bloco__titulo">Quantidade de {rotuloQuantidade} por concurso</h2>
        <GraficoBarras
          dados={[...distribuicao]
            .sort((a, b) => a.quantidade - b.quantidade)
            .map((d) => ({ rotulo: String(d.quantidade), valor: d.percentual }))}
          rotuloValor="% do histórico"
          altura={240}
        />
        <TabelaDistribuicao
          rotuloPrimeiraColuna={`Quantidade de ${rotuloQuantidade}`}
          linhas={distribuicao.map((d) => [d.quantidade, d.ocorrencias, d.percentual])}
        />
      </div>
    </>
  );
}

// ---------------------------------------------------------------
// SOMA
// ---------------------------------------------------------------
async function ConteudoSoma({
  loteriaId,
  dezenaMin,
  dezenaMax,
  qtdDezenasSorteadas,
}: {
  loteriaId: number;
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenasSorteadas: number;
}) {
  const { estatisticas, histograma } = await Estat.getSoma(loteriaId);
  const totalConcursos = histograma.reduce((s, h) => s + h.ocorrencias, 0);

  return (
    <>
      {estatisticas && (
        <dl className="ficha">
          <div>
            <dt>Soma mínima já registrada</dt>
            <dd>{estatisticas.minimo}</dd>
          </div>
          <div>
            <dt>Soma máxima já registrada</dt>
            <dd>{estatisticas.maximo}</dd>
          </div>
          <div>
            <dt>Soma média</dt>
            <dd>{estatisticas.media}</dd>
          </div>
          <div>
            <dt>Soma mediana</dt>
            <dd>{estatisticas.mediana}</dd>
          </div>
        </dl>
      )}

      {estatisticas && (
        <SomaCalculadora
          histograma={histograma}
          totalConcursos={totalConcursos}
          somaMinima={estatisticas.minimo}
          somaMaxima={estatisticas.maximo}
          dezenaMin={dezenaMin}
          dezenaMax={dezenaMax}
          qtdDezenasSorteadas={qtdDezenasSorteadas}
        />
      )}
      <div className="bloco">
        <h2 className="bloco__titulo">Distribuição da soma (faixas de 10)</h2>
        <GraficoBarras
          dados={histograma.map((h) => ({
            rotulo: `${h.faixaInicio}–${h.faixaFim}`,
            valor: h.ocorrencias,
            destaque: estatisticas
              ? estatisticas.media >= h.faixaInicio && estatisticas.media <= h.faixaFim
              : false,
          }))}
          rotuloValor="concursos"
          altura={260}
        />
        <p className="bloco__nota">
          A barra em destaque é a faixa que contém a soma média
          {estatisticas ? ` (${estatisticas.media})` : ""}.
        </p>
        <div className="tabela-scroll">
        <table className="tabela-dados">
          <thead>
            <tr>
              <th>Faixa</th>
              <th className="num">Ocorrências</th>
            </tr>
          </thead>
          <tbody>
            {histograma.map((h) => (
              <tr key={h.faixaInicio}>
                <td>
                  {h.faixaInicio}–{h.faixaFim}
                </td>
                <td className="num">{h.ocorrencias}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------
// REPETIDAS DO CONCURSO ANTERIOR
// ---------------------------------------------------------------
async function ConteudoRepetidas({ loteriaId }: { loteriaId: number }) {
  const dados = await Estat.getRepetidas(loteriaId);
  const maisComum = [...dados].sort((a, b) => b.ocorrencias - a.ocorrencias)[0];
  return (
    <div className="bloco">
      {maisComum && (
        <InsightCallout kicker="O padrão que mais se repete">
          O mais comum é <strong>{maisComum.quantidade} dezena{maisComum.quantidade === 1 ? "" : "s"}</strong>{" "}
          repetida{maisComum.quantidade === 1 ? "" : "s"} do concurso anterior — isso
          acontece em <strong>{maisComum.percentual}%</strong> dos sorteios.
        </InsightCallout>
      )}
      <GraficoBarras
        dados={[...dados]
          .sort((a, b) => a.quantidade - b.quantidade)
          .map((d) => ({ rotulo: String(d.quantidade), valor: d.percentual }))}
        rotuloValor="% do histórico"
        altura={240}
      />
      <TabelaDistribuicao
        rotuloPrimeiraColuna="Dezenas repetidas do concurso anterior"
        linhas={dados.map((d) => [d.quantidade, d.ocorrencias, d.percentual])}
      />
    </div>
  );
}

// ---------------------------------------------------------------
// MOLDURA E CENTRO
// ---------------------------------------------------------------
async function ConteudoMolduraCentro({ loteriaId }: { loteriaId: number }) {
  const { frequencia, distribuicao } = await Estat.getMolduraCentro(loteriaId);
  const moldura = frequencia.find((f) => f.categoria.toLowerCase() === "moldura");
  const centro = frequencia.find((f) => f.categoria.toLowerCase() === "centro");
  return (
    <>
      {moldura && centro && (
        <InsightCallout kicker="Moldura vs. centro">
          As dezenas da <strong>moldura</strong> (bordas do volante) saem em{" "}
          <strong>{moldura.percentual}%</strong> das vezes, contra{" "}
          <strong>{centro.percentual}%</strong> das dezenas do{" "}
          <strong>centro</strong> — {moldura.percentual > centro.percentual
            ? "a borda leva vantagem."
            : "o miolo do volante leva vantagem."}
        </InsightCallout>
      )}
      <div className="bloco">
        <h2 className="bloco__titulo">Frequência geral</h2>
        <GraficoBarras
          dados={frequencia.map((f) => ({
            rotulo: f.categoria.charAt(0).toUpperCase() + f.categoria.slice(1),
            valor: f.percentual,
          }))}
          rotuloValor="% do total sorteado"
          altura={200}
        />
        <div className="tabela-scroll">
        <table className="tabela-dados">
          <thead>
            <tr>
              <th>Zona</th>
              <th className="num">Frequência</th>
              <th className="num">% do total sorteado</th>
            </tr>
          </thead>
          <tbody>
            {frequencia.map((f) => (
              <tr key={f.categoria}>
                <td style={{ textTransform: "capitalize" }}>{f.categoria}</td>
                <td className="num">{f.frequencia}</td>
                <td className="num">{f.percentual}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
      <div className="bloco">
        <h2 className="bloco__titulo">Combinações mais comuns por concurso</h2>
        <div className="tabela-scroll">
        <table className="tabela-dados">
          <thead>
            <tr>
              <th className="num">Moldura</th>
              <th className="num">Centro</th>
              <th className="num">Ocorrências</th>
              <th className="num">%</th>
            </tr>
          </thead>
          <tbody>
            {distribuicao.map((d, i) => (
              <tr key={i}>
                <td className="num">{d.qtdMoldura}</td>
                <td className="num">{d.qtdCentro}</td>
                <td className="num">{d.ocorrencias}</td>
                <td className="num">{d.percentual}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------
// LINHAS E COLUNAS
// ---------------------------------------------------------------
async function ConteudoLinhasColunas({ loteriaId }: { loteriaId: number }) {
  const { linhas, colunas } = await Estat.getLinhasColunas(loteriaId);
  const linhaTop = [...linhas].sort((a, b) => b.frequencia - a.frequencia)[0];
  const colunaTop = [...colunas].sort((a, b) => b.frequencia - a.frequencia)[0];
  return (
    <>
      {linhaTop && colunaTop && (
        <InsightCallout kicker="O ponto quente do volante">
          A <strong>linha {linhaTop.posicao}</strong> e a{" "}
          <strong>coluna {colunaTop.posicao}</strong> são as que mais entregam
          dezenas sorteadas — {linhaTop.frequencia} e {colunaTop.frequencia}{" "}
          ocorrências, respectivamente, ao longo de todo o histórico.
        </InsightCallout>
      )}
      <div className="bloco">
        <h2 className="bloco__titulo">Frequência por linha do volante</h2>
        <GraficoBarras
          dados={linhas.map((l) => ({ rotulo: `Linha ${l.posicao}`, valor: l.frequencia }))}
          rotuloValor="ocorrências"
          altura={220}
        />
        <div className="tabela-scroll">
        <table className="tabela-dados">
          <thead>
            <tr>
              <th>Linha</th>
              <th className="num">Frequência</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.posicao}>
                <td>{l.posicao}</td>
                <td className="num">{l.frequencia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
      <div className="bloco">
        <h2 className="bloco__titulo">Frequência por coluna do volante</h2>
        <GraficoBarras
          dados={colunas.map((c) => ({ rotulo: `Col. ${c.posicao}`, valor: c.frequencia }))}
          rotuloValor="ocorrências"
          altura={220}
        />
        <div className="tabela-scroll">
        <table className="tabela-dados">
          <thead>
            <tr>
              <th>Coluna</th>
              <th className="num">Frequência</th>
            </tr>
          </thead>
          <tbody>
            {colunas.map((c) => (
              <tr key={c.posicao}>
                <td>{c.posicao}</td>
                <td className="num">{c.frequencia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------
// DUQUES E TRINCAS
// ---------------------------------------------------------------
async function ConteudoDuquesTrincas({
  loteriaId,
  dezenaMin,
  dezenaMax,
  qtdDezenasSorteadas,
}: {
  loteriaId: number;
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenasSorteadas: number;
}) {
  const [duques, trincas, ultimoConcurso] = await Promise.all([
    Estat.getDuques(loteriaId, 20),
    Estat.getTrincas(loteriaId, 20),
    getUltimoConcurso(loteriaId),
  ]);

  const duqueTop = duques[0];
  const totalConcursos = ultimoConcurso?.numero ?? 0;
  const n = dezenaMax - dezenaMin + 1;
  const k = qtdDezenasSorteadas;
  // Probabilidade de duas dezenas específicas saírem juntas num sorteio de k
  // entre n: C(n-2,k-2) / C(n,k), que simplifica pra k(k-1) / (n(n-1)).
  const probParDeterminado = n > 1 ? (k * (k - 1)) / (n * (n - 1)) : 0;
  const esperadoPorAcaso = probParDeterminado * totalConcursos;
  const vezesMais = duqueTop && esperadoPorAcaso > 0
    ? duqueTop.ocorrencias / esperadoPorAcaso
    : 0;

  return (
    <>
      {duqueTop && esperadoPorAcaso > 0 && (
        <InsightCallout kicker="A dupla mais grudenta">
          A dupla <strong>{duqueTop.dezenas.map(formatarDezena).join(" - ")}</strong> já
          saiu junta <strong>{duqueTop.ocorrencias} vezes</strong>. Pela pura
          matemática da chance, o esperado seria algo perto de{" "}
          {esperadoPorAcaso.toFixed(1)} vezes — ou seja, essa dupla apareceu
          cerca de <strong>{vezesMais.toFixed(1)}x</strong> o esperado, o tipo de
          desvio normal que a aleatoriedade produz em qualquer amostra grande.
        </InsightCallout>
      )}
      <div className="bloco">
        <h2 className="bloco__titulo">Duques mais frequentes</h2>
        <GraficoBarras
          dados={duques.slice(0, 10).map((d) => ({
            rotulo: d.dezenas.map(formatarDezena).join("-"),
            valor: d.ocorrencias,
          }))}
          rotuloValor="vezes juntas"
          vertical
          altura={260}
        />
        <ListaCombinacoes itens={duques} />
      </div>
      <div className="bloco">
        <h2 className="bloco__titulo">Trincas mais frequentes</h2>
        <GraficoBarras
          dados={trincas.slice(0, 10).map((t) => ({
            rotulo: t.dezenas.map(formatarDezena).join("-"),
            valor: t.ocorrencias,
          }))}
          rotuloValor="vezes juntas"
          vertical
          altura={260}
        />
        <ListaCombinacoes itens={trincas} />
      </div>
    </>
  );
}

function ListaCombinacoes({ itens }: { itens: Estat.DuqueOuTrinca[] }) {
  return (
    <div className="tabela-scroll">
        <table className="tabela-dados">
      <thead>
        <tr>
          <th>Dezenas</th>
          <th className="num">Vezes juntas</th>
        </tr>
      </thead>
      <tbody>
        {itens.map((item, i) => (
          <tr key={i}>
            <td>
              <Dezenas
                dezenas={item.dezenas}
                tamanho="pequena"
                wrapperClassName="ledger__dezenas"
              />
            </td>
            <td className="num">{item.ocorrencias}</td>
          </tr>
        ))}
      </tbody>
    </table>
      </div>
  );
}

// ---------------------------------------------------------------
// Helpers de tabela genéricos
// ---------------------------------------------------------------
function TabelaDezenaValor({
  linhas,
  rotuloValor,
}: {
  linhas: [number, number][];
  rotuloValor: string;
}) {
  return (
    <div className="tabela-scroll">
        <table className="tabela-dados">
      <thead>
        <tr>
          <th>Dezena</th>
          <th className="num">{rotuloValor}</th>
        </tr>
      </thead>
      <tbody>
        {linhas.map(([dezena, valor]) => (
          <tr key={dezena}>
            <td>{formatarDezena(dezena)}</td>
            <td className="num">{valor}</td>
          </tr>
        ))}
      </tbody>
    </table>
      </div>
  );
}

function TabelaDistribuicao({
  rotuloPrimeiraColuna,
  linhas,
}: {
  rotuloPrimeiraColuna: string;
  linhas: [number, number, number][];
}) {
  return (
    <div className="tabela-scroll">
        <table className="tabela-dados">
      <thead>
        <tr>
          <th>{rotuloPrimeiraColuna}</th>
          <th className="num">Ocorrências</th>
          <th className="num">% do histórico</th>
        </tr>
      </thead>
      <tbody>
        {linhas.map(([rotulo, ocorrencias, percentual]) => (
          <tr key={rotulo}>
            <td>{rotulo}</td>
            <td className="num">{ocorrencias}</td>
            <td className="num">{percentual}%</td>
          </tr>
        ))}
      </tbody>
    </table>
      </div>
  );
}
