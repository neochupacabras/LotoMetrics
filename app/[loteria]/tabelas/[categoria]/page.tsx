import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Dezenas from "@/components/Dezenas";
import HeatmapVolante from "@/components/HeatmapVolante";
import GraficoBarras from "@/components/GraficoBarras";
import { getCategoriaPorSlug } from "@/lib/categorias";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { formatarDezena, isCodigoLoteriaValido } from "@/lib/format";
import * as Estat from "@/lib/estatisticas";
import { NOME_LOTERIA, metadataPagina } from "@/lib/seo";

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

      <ConteudoCategoria
        slug={slugCategoria}
        loteriaId={loteria.id}
        dezenaMin={loteria.dezenaMin}
        dezenaMax={loteria.dezenaMax}
        gridColunas={loteria.gridColunas}
      />

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
  loteriaId,
  dezenaMin,
  dezenaMax,
  gridColunas,
}: {
  slug: string;
  loteriaId: number;
  dezenaMin: number;
  dezenaMax: number;
  gridColunas: number;
}) {
  switch (slug) {
    case "frequencia":
      return (
        <ConteudoFrequencia
          loteriaId={loteriaId}
          dezenaMin={dezenaMin}
          dezenaMax={dezenaMax}
          gridColunas={gridColunas}
        />
      );
    case "atraso":
      return (
        <ConteudoAtraso
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
          getFrequencia={Estat.getPrimosFrequencia}
          getDistribuicao={Estat.getPrimosDistribuicao}
          rotuloPositivo="primo"
          rotuloQuantidade="primos"
        />
      );
    case "soma":
      return <ConteudoSoma loteriaId={loteriaId} />;
    case "fibonacci":
      return (
        <ConteudoCategoriaBinaria
          loteriaId={loteriaId}
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
      return <ConteudoDuquesTrincas loteriaId={loteriaId} />;
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
}: {
  loteriaId: number;
  dezenaMin: number;
  dezenaMax: number;
  gridColunas: number;
}) {
  const dados = await Estat.getFrequencia(loteriaId);
  const maisFrequentes = dados.slice(0, 10);
  const menosFrequentes = [...dados].sort((a, b) => a.frequencia - b.frequencia).slice(0, 10);
  const valoresPorDezena = Object.fromEntries(dados.map((d) => [d.dezena, d.frequencia]));

  return (
    <>
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
  loteriaId,
  dezenaMin,
  dezenaMax,
  gridColunas,
}: {
  loteriaId: number;
  dezenaMin: number;
  dezenaMax: number;
  gridColunas: number;
}) {
  const dados = await Estat.getAtraso(loteriaId);
  const valoresPorDezena = Object.fromEntries(dados.map((d) => [d.dezena, d.atraso]));
  return (
    <div className="bloco">
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
  return (
    <>
      {atual && (
        <div className="bloco">
          <h2 className="bloco__titulo">Ciclo atual</h2>
          <p className="bloco__nota">
            Em andamento desde o concurso #{atual.concursoInicio} ({atual.concursosNoCiclo}{" "}
            concursos até agora).
          </p>

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
  return (
    <>
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
  return (
    <div className="bloco">
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
  getFrequencia,
  getDistribuicao,
  rotuloPositivo,
  rotuloQuantidade,
}: {
  loteriaId: number;
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

  return (
    <>
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
async function ConteudoSoma({ loteriaId }: { loteriaId: number }) {
  const { estatisticas, histograma } = await Estat.getSoma(loteriaId);
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
  return (
    <div className="bloco">
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
  return (
    <>
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
  return (
    <>
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
async function ConteudoDuquesTrincas({ loteriaId }: { loteriaId: number }) {
  const [duques, trincas] = await Promise.all([
    Estat.getDuques(loteriaId, 20),
    Estat.getTrincas(loteriaId, 20),
  ]);
  return (
    <>
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
