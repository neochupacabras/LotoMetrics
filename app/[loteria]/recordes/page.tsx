import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Subnav from "@/components/Subnav";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import TelemetriaBeacon from "@/components/TelemetriaBeacon";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { getRecordesLoteria } from "@/lib/recordes";
import { descricaoRecordes, temRecordesDeDezenas, tituloRecordes } from "@/lib/recordes-regras";
import { formatarData, formatarDezena, formatarMoeda, isCodigoLoteriaValido, preposicaoLoteria } from "@/lib/format";
import { NOME_LOTERIA, SITE_URL, metadataPagina } from "@/lib/seo";
import "../../recordes.css";

// Recordes de cada loteria (semana 5 do roadmap de growth): página de dados
// citável, para a busca ("maior prêmio da lotofácil") e para a imprensa.
// Dados até o último concurso, em valores nominais; cache renovado a cada
// concurso novo (lib/recordes.ts).
export const revalidate = 3600;

const numeroBr = (n: number) => new Intl.NumberFormat("pt-BR").format(n);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ loteria: string }>;
}): Promise<Metadata> {
  const { loteria: codigo } = await params;
  if (!isCodigoLoteriaValido(codigo)) return {};
  const loteria = await getLoteriaPorCodigo(codigo);
  if (!loteria) return {};
  const nome = NOME_LOTERIA[codigo] ?? loteria.nome;
  const r = await getRecordesLoteria(loteria.id, codigo);
  const resumo = {
    nomeLoteria: nome,
    codigoLoteria: codigo,
    ultimoConcurso: r?.ultimo.numero ?? 0,
    maiorPremio: r?.maioresPremios[0]
      ? { numero: r.maioresPremios[0].numero, data: r.maioresPremios[0].data, valor: r.maioresPremios[0].valor }
      : null,
  };
  const base = metadataPagina(codigo, "/recordes", tituloRecordes(resumo), descricaoRecordes(resumo));
  // O card desta página (opengraph-image.tsx ao lado), não a imagem genérica
  // que metadataPagina coloca.
  const imagem = `${SITE_URL}/${codigo}/recordes/opengraph-image`;
  return {
    ...base,
    openGraph: { ...base.openGraph, images: [imagem] },
    twitter: { card: "summary_large_image", images: [imagem] },
  };
}

export default async function RecordesPage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigo } = await params;
  if (!isCodigoLoteriaValido(codigo)) notFound();
  const loteria = await getLoteriaPorCodigo(codigo);
  if (!loteria) notFound();

  const nome = NOME_LOTERIA[codigo] ?? loteria.nome;
  const { de } = preposicaoLoteria(codigo);
  const r = await getRecordesLoteria(loteria.id, codigo);
  if (!r) notFound();

  const maior = r.maioresPremios[0] ?? null;
  const superSete = codigo === "supersete";
  const linkConcurso = (n: number) => `/${codigo}/resultados/${n}`;

  return (
    <>
      <TelemetriaBeacon tool="recordes" lottery={codigo} />
      <BreadcrumbJsonLd
        itens={[
          { nome: loteria.nome, caminho: `/${codigo}/resultados` },
          { nome: "Recordes", caminho: `/${codigo}/recordes` },
        ]}
      />
      <Subnav codigoLoteria={codigo} ativa="recordes" />
      <div className="container secao">
        <p className="eyebrow">Recordes {de} {nome}</p>
        <h1 className="titulo-edicao">Recordes {de} {nome}</h1>
        <p className="subtitulo-edicao" style={{ maxWidth: 640 }}>
          Atualizado até o concurso {r.ultimo.numero} ({formatarData(r.ultimo.data)}), com os{" "}
          {numeroBr(r.totalConcursos)} concursos sorteados desde {formatarData(r.primeiraData)}.
          Valores em reais da época, sem correção pela inflação.
        </p>

        <div className="recordes-grid">
          {maior && (
            <div className="recorde-cartao cartao-elevado">
              <p className="recorde-cartao__rotulo">Maior prêmio por aposta</p>
              <p className="recorde-cartao__valor">{formatarMoeda(maior.valor)}</p>
              <p className="recorde-cartao__contexto">
                <Link href={linkConcurso(maior.numero)}>Concurso {maior.numero}</Link>, {formatarData(maior.data)}
                {maior.ganhadores > 1 ? `, para cada uma das ${maior.ganhadores} apostas ganhadoras` : ", 1 aposta ganhadora"}
                {maior.sorteio ? ` (${maior.sorteio}º sorteio)` : ""}
              </p>
            </div>
          )}
          {r.maiorTotalConcurso && (
            <div className="recorde-cartao cartao-elevado">
              <p className="recorde-cartao__rotulo">Maior valor pago num concurso</p>
              <p className="recorde-cartao__valor">{formatarMoeda(r.maiorTotalConcurso.total)}</p>
              <p className="recorde-cartao__contexto">
                <Link href={linkConcurso(r.maiorTotalConcurso.numero)}>Concurso {r.maiorTotalConcurso.numero}</Link>,{" "}
                {formatarData(r.maiorTotalConcurso.data)}, somando{" "}
                {r.maiorTotalConcurso.ganhadores === 1 ? "1 aposta" : `${numeroBr(r.maiorTotalConcurso.ganhadores)} apostas`} na faixa principal
              </p>
            </div>
          )}
          {r.maisGanhadores && (
            <div className="recorde-cartao cartao-elevado">
              <p className="recorde-cartao__rotulo">Mais ganhadores na faixa principal</p>
              <p className="recorde-cartao__valor">{numeroBr(r.maisGanhadores.ganhadores)}</p>
              <p className="recorde-cartao__contexto">
                <Link href={linkConcurso(r.maisGanhadores.numero)}>Concurso {r.maisGanhadores.numero}</Link>,{" "}
                {formatarData(r.maisGanhadores.data)}
              </p>
            </div>
          )}
          {r.maiorSequencia && (
            <div className="recorde-cartao cartao-elevado">
              <p className="recorde-cartao__rotulo">Maior sequência sem ganhador</p>
              <p className="recorde-cartao__valor">{r.maiorSequencia.concursosSemGanhador} concursos</p>
              <p className="recorde-cartao__contexto">
                Do {r.maiorSequencia.primeiroSemGanhador} ao {r.maiorSequencia.ultimoSemGanhador}; o{" "}
                <Link href={linkConcurso(r.maiorSequencia.concursoComGanhador)}>concurso {r.maiorSequencia.concursoComGanhador}</Link>{" "}
                pagou {formatarMoeda(r.maiorSequencia.premio)} por aposta
              </p>
            </div>
          )}
        </div>

        {r.maioresPremios.length > 0 && (
          <>
            <h2 className="bloco__titulo" style={{ marginTop: 36 }}>Os {r.maioresPremios.length} maiores prêmios {de} {nome}</h2>
            <p className="bloco__nota">Prêmio por aposta ganhadora na faixa principal, em valores da época.</p>
            <div className="tabela-scroll">
              <table className="tabela-dados">
                <thead>
                  <tr>
                    <th className="num">#</th>
                    <th>Concurso</th>
                    <th>Data</th>
                    <th className="num">Ganhadores</th>
                    <th className="num">Prêmio por aposta</th>
                  </tr>
                </thead>
                <tbody>
                  {r.maioresPremios.map((p, i) => (
                    <tr key={`${p.numero}-${p.sorteio ?? 0}`}>
                      <td className="num">{i + 1}º</td>
                      <td>
                        <Link href={linkConcurso(p.numero)}>{p.numero}</Link>
                        {p.sorteio ? ` (${p.sorteio}º sorteio)` : ""}
                      </td>
                      <td>{formatarData(p.data)}</td>
                      <td className="num">{p.ganhadores}</td>
                      <td className="num">{formatarMoeda(p.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {temRecordesDeDezenas(codigo) && (r.maisSorteada || r.maiorAtraso) && (
          <>
            <h2 className="bloco__titulo" style={{ marginTop: 36 }}>Recordes das dezenas</h2>
            <ul className="recordes-lista">
              {r.maisSorteada && (
                <li>
                  A dezena que mais saiu é a <strong>{formatarDezena(r.maisSorteada.dezena)}</strong>, em{" "}
                  {numeroBr(r.maisSorteada.vezes)} concursos. Veja a{" "}
                  <Link href={`/${codigo}/tabelas/frequencia`}>frequência de todas as dezenas</Link>.
                </li>
              )}
              {r.menosSorteada && (
                <li>
                  A que menos saiu é a <strong>{formatarDezena(r.menosSorteada.dezena)}</strong>, em{" "}
                  {numeroBr(r.menosSorteada.vezes)} concursos.
                </li>
              )}
              {r.maiorAtraso && (
                <li>
                  O maior intervalo sem sair foi da dezena <strong>{formatarDezena(r.maiorAtraso.dezena)}</strong>:{" "}
                  {numeroBr(r.maiorAtraso.concursos)} concursos seguidos. Veja as{" "}
                  <Link href={`/${codigo}/tabelas/atraso`}>dezenas atrasadas hoje</Link>.
                </li>
              )}
            </ul>
          </>
        )}

        <h2 className="bloco__titulo" style={{ marginTop: 36 }}>Em números</h2>
        <ul className="recordes-lista">
          <li>
            {numeroBr(r.totalConcursos)} concursos {de} {nome} desde {formatarData(r.primeiraData)}.
          </li>
          {r.concursosComGanhador > 0 && (
            <li>
              {formatarMoeda(r.totalPagoPrincipal)} pagos na faixa principal, em {numeroBr(r.concursosComGanhador)}{" "}
              concursos com ganhador (soma de valores nominais de épocas diferentes).
            </li>
          )}
          <li>
            Veja também: <Link href={`/${codigo}/acumulos`}>linha do tempo dos acúmulos</Link>
            {codigo === "megasena" && (
              <>, <Link href="/mega-da-virada">todas as edições da Mega da Virada</Link></>
            )}
            {" "}e <Link href="/recordes">recordes de todas as loterias</Link>.
          </li>
        </ul>

        <div className="ferramenta-explicacao" style={{ maxWidth: 680, marginTop: 36 }}>
          <h2 className="bloco__titulo">Como estes recordes são calculados</h2>
          <p>
            Os números vêm dos resultados oficiais da Caixa e são atualizados a cada concurso.
            A faixa principal é a de mais acertos{codigo === "duplasena" ? ", nos dois sorteios de cada concurso" : ""}
            {superSete ? " (as 7 colunas)" : ""}. Os valores são os da época, sem correção pela inflação:
            um prêmio de 2005 e um de 2025 aparecem lado a lado pelo valor nominal.
            {codigo === "quina" && " Os concursos de 1994 anteriores ao Real foram convertidos de cruzeiros reais pela taxa oficial (CR$ 2.750 = R$ 1)."}
          </p>
          <p>
            Pode citar estes dados com um link para esta página. Recordes descrevem o passado e não
            mudam as chances de nenhum sorteio futuro.
          </p>
        </div>
      </div>
    </>
  );
}
