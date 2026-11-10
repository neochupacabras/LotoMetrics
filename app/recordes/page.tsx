import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import TelemetriaBeacon from "@/components/TelemetriaBeacon";
import { getMaioresPremiosPorLoteria } from "@/lib/recordes";
import { formatarMoedaCompacta } from "@/lib/resumo-concurso";
import { formatarData, formatarMoeda, LOTERIAS } from "@/lib/format";
import { NOME_LOTERIA, SITE_NAME, SITE_URL } from "@/lib/seo";
import "../recordes.css";

// Hub de recordes (semana 5 do roadmap): o maior prêmio por aposta de cada
// loteria, com link para a página de recordes de cada uma. Dados até o
// último concurso importado, em valores nominais.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const lista = await getMaioresPremiosPorLoteria();
  const topo = lista[0];
  const titulo = topo
    ? `Maiores prêmios das loterias da Caixa: recorde é de ${formatarMoedaCompacta(topo.valor)}`
    : "Recordes das loterias da Caixa";
  const descricao = topo
    ? `O maior prêmio por aposta das loterias da Caixa é da ${NOME_LOTERIA[topo.codigo] ?? topo.codigo}: ${formatarMoedaCompacta(topo.valor)} no concurso ${topo.numero}. Veja o recorde de cada loteria, com data, concurso e número de ganhadores.`
    : "O maior prêmio de cada loteria da Caixa, com data, concurso e número de ganhadores.";
  const url = `${SITE_URL}/recordes`;
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: url },
    openGraph: {
      title: titulo,
      description: descricao,
      url,
      siteName: SITE_NAME,
      locale: "pt_BR",
      type: "website",
      images: [`${SITE_URL}/opengraph-image`],
    },
  };
}

export default async function RecordesHubPage() {
  const lista = await getMaioresPremiosPorLoteria();
  const codigos = Object.keys(LOTERIAS);
  const semPremio = codigos.filter((c) => !lista.some((l) => l.codigo === c));

  return (
    <>
      <TelemetriaBeacon tool="recordes" />
      <BreadcrumbJsonLd itens={[{ nome: "Recordes", caminho: "/recordes" }]} />
      <Masthead />
      <main className="container secao">
        <p className="eyebrow">Recordes</p>
        <h1 className="titulo-edicao">Os maiores prêmios das loterias da Caixa</h1>
        <p className="subtitulo-edicao" style={{ maxWidth: 640 }}>
          O maior prêmio por aposta ganhadora na faixa principal de cada loteria, atualizado a cada
          concurso. Valores da época, sem correção pela inflação.
        </p>

        <div className="tabela-scroll">
          <table className="tabela-dados recordes-hub">
            <thead>
              <tr>
                <th>Loteria</th>
                <th className="num">Maior prêmio por aposta</th>
                <th>Concurso</th>
                <th>Data</th>
                <th className="num">Ganhadores</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((r) => (
                <tr key={r.codigo}>
                  <td>
                    <Link href={`/${r.codigo}/recordes`}>{NOME_LOTERIA[r.codigo] ?? r.codigo}</Link>
                  </td>
                  <td className="num">{formatarMoeda(r.valor)}</td>
                  <td>
                    <Link href={`/${r.codigo}/resultados/${r.numero}`}>{r.numero}</Link>
                  </td>
                  <td>{formatarData(r.data)}</td>
                  <td className="num">{r.ganhadores}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {semPremio.length > 0 && (
          <p className="bloco__nota">
            Ainda sem prêmio pago na faixa principal: {semPremio.map((c) => NOME_LOTERIA[c] ?? c).join(", ")}.
          </p>
        )}

        <div className="ferramenta-explicacao" style={{ maxWidth: 680, marginTop: 36 }}>
          <h2 className="bloco__titulo">Recordes de cada loteria</h2>
          <p>
            Cada página traz os 10 maiores prêmios, o concurso que mais pagou, o que teve mais
            ganhadores, a maior sequência sem ganhador e os recordes das dezenas:{" "}
            {codigos.map((c, i) => (
              <span key={c}>
                <Link href={`/${c}/recordes`}>{NOME_LOTERIA[c] ?? c}</Link>
                {i < codigos.length - 2 ? ", " : i === codigos.length - 2 ? " e " : "."}
              </span>
            ))}
          </p>
          <p>
            Os dados são os resultados oficiais da Caixa. Na Dupla Sena, a faixa principal considera
            os dois sorteios de cada concurso. Pode citar estes números com um link para esta página.
            Para a Mega da Virada, veja a <Link href="/mega-da-virada">página com todas as edições</Link>.
          </p>
        </div>
      </main>
    </>
  );
}
