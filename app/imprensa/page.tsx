import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { getEdicoesVirada } from "@/lib/queries";
import { getMaioresPremiosPorLoteria } from "@/lib/recordes";
import { getTaxasBcb } from "@/lib/taxas-bcb";
import { calcularRendimentos } from "@/lib/rendimento-premio";
import { anoDaEdicao, destaquesVirada, frequenciaNaVirada, resumirEdicao } from "@/lib/mega-da-virada";
import { formatarMoedaCompacta } from "@/lib/resumo-concurso";
import { formatarData, formatarDezena, LOTERIAS, preposicaoLoteria } from "@/lib/format";
import { NOME_LOTERIA, SITE_NAME, SITE_URL } from "@/lib/seo";
import "../recordes.css";

// Kit de dados para a imprensa (semana 5 do roadmap de growth): números da
// Mega da Virada, recordes das loterias, rendimento de um prêmio, CSVs e
// imagens para usar com crédito. Tudo calculado do banco e das taxas do
// Banco Central a cada hora; nada escrito à mão.
export const revalidate = 3600;

const CONTATO = "contato@lotoanalitica.com.br";
const numeroBr = (n: number) => new Intl.NumberFormat("pt-BR").format(n);

export const metadata: Metadata = {
  title: "Dados da Mega da Virada e recordes das loterias para a imprensa",
  description:
    "Números da Mega da Virada desde 2009, o maior prêmio de cada loteria e quanto rende um prêmio de R$ 1 bilhão, com dados oficiais da Caixa, CSV para baixar e imagens para usar com crédito.",
  alternates: { canonical: `${SITE_URL}/imprensa` },
  openGraph: {
    title: "Dados de loteria para a imprensa",
    description: "Mega da Virada, recordes das loterias e rendimento do prêmio, com CSV e imagens para usar com crédito.",
    url: `${SITE_URL}/imprensa`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
    images: [`${SITE_URL}/megasena/recordes/opengraph-image`],
  },
};

export default async function ImprensaPage() {
  const [edicoes, recordes, taxas] = await Promise.all([getEdicoesVirada(), getMaioresPremiosPorLoteria(), getTaxasBcb()]);

  const virada = edicoes.length > 0 ? destaquesVirada(edicoes) : null;
  const ordenadas = [...edicoes].sort((a, b) => a.numero - b.numero);
  const primeira = ordenadas[0];
  const ultima = ordenadas[ordenadas.length - 1];
  const maisSaem = frequenciaNaVirada(edicoes).slice(0, 3);
  const rende = calcularRendimentos(1_000_000_000, true, taxas);
  const poupanca = rende.linhas.find((l) => l.id === "poupanca")!;
  const topo = recordes[0];

  return (
    <>
      <BreadcrumbJsonLd itens={[{ nome: "Imprensa", caminho: "/imprensa" }]} />
      <Masthead />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Imprensa</p>
        <h1 className="titulo-edicao">Dados de loteria para a imprensa</h1>
        <p className="subtitulo-edicao">
          Números organizados a partir dos resultados oficiais da Caixa, atualizados a cada concurso. Pode usar
          com o crédito &ldquo;LotoAnalítica&rdquo; e um link para a página de onde o dado saiu.
        </p>

        {virada && primeira && ultima && (
          <section style={{ marginTop: 32 }}>
            <h2 className="bloco__titulo">Mega da Virada em números</h2>
            <ul className="recordes-lista">
              <li>
                {edicoes.length} edições com dados completos, de {anoDaEdicao(primeira.dataSorteio)} a{" "}
                {anoDaEdicao(ultima.dataSorteio)}, somando {numeroBr(virada.totalGanhadoresSena)} apostas ganhadoras da sena.
              </li>
              {virada.maiorPremioTotal && (
                <li>
                  Maior prêmio total: {formatarMoedaCompacta(resumirEdicao(virada.maiorPremioTotal).premioTotalSena)} na
                  Virada de {anoDaEdicao(virada.maiorPremioTotal.dataSorteio)} (concurso {virada.maiorPremioTotal.numero}),
                  dividido entre {resumirEdicao(virada.maiorPremioTotal).ganhadoresSena} apostas.
                </li>
              )}
              {virada.maiorPremioIndividual && (
                <li>
                  Maior prêmio por aposta: {formatarMoedaCompacta(resumirEdicao(virada.maiorPremioIndividual).premioPorGanhador)} na
                  Virada de {anoDaEdicao(virada.maiorPremioIndividual.dataSorteio)}.
                </li>
              )}
              {virada.maisGanhadores && (
                <li>
                  Mais ganhadores numa edição: {resumirEdicao(virada.maisGanhadores).ganhadoresSena} apostas na Virada de{" "}
                  {anoDaEdicao(virada.maisGanhadores.dataSorteio)}.
                </li>
              )}
              {maisSaem.length > 0 && (
                <li>
                  Dezenas que mais saíram na Virada:{" "}
                  {maisSaem.map((m) => `${formatarDezena(m.dezena)} (${m.vezes} vezes)`).join(", ")}. Isso descreve o
                  passado e não muda a chance de nenhum número.
                </li>
              )}
            </ul>
            <p className="bloco__nota">
              Todas as edições, com dezenas e premiação: <Link href="/mega-da-virada">Mega da Virada</Link> ·{" "}
              <a href="/imprensa/mega-da-virada.csv" download>
                baixar CSV
              </a>
            </p>
          </section>
        )}

        <section style={{ marginTop: 32 }}>
          <h2 className="bloco__titulo">Quanto rende um prêmio de R$ 1 bilhão</h2>
          <p>
            Um prêmio anunciado de R$ 1 bilhão vira {formatarMoedaCompacta(rende.liquido)} depois dos 30% de imposto
            retidos pela Caixa. Na poupança, isso rende cerca de {formatarMoedaCompacta(poupanca.mensal)} por mês, com a
            taxa de {taxas.data}{taxas.fonte === "reserva" ? " (taxa de referência)" : " do Banco Central"}. Outros valores e
            aplicações na <Link href="/calculadoras/quanto-rende-o-premio">calculadora de rendimento do prêmio</Link>.
          </p>
        </section>

        {recordes.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <h2 className="bloco__titulo">O maior prêmio de cada loteria</h2>
            {topo && (
              <p>
                O maior prêmio por aposta já pago nas loterias da Caixa é da {NOME_LOTERIA[topo.codigo] ?? topo.codigo}:{" "}
                {formatarMoedaCompacta(topo.valor)} no concurso {topo.numero}, em {formatarData(topo.data)}.
              </p>
            )}
            <div className="tabela-scroll">
              <table className="tabela-dados recordes-hub">
                <thead>
                  <tr>
                    <th>Loteria</th>
                    <th className="num">Maior prêmio</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recordes.map((r) => (
                    <tr key={r.codigo}>
                      <td>
                        <Link href={`/${r.codigo}/recordes`}>{NOME_LOTERIA[r.codigo] ?? r.codigo}</Link>
                      </td>
                      <td className="num">{formatarMoedaCompacta(r.valor)}</td>
                      <td>{formatarData(r.data)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="bloco__nota">
              Valores da época, sem correção pela inflação. Detalhes em <Link href="/recordes">recordes das loterias</Link> ·{" "}
              <a href="/imprensa/recordes.csv" download>
                baixar CSV
              </a>
            </p>
          </section>
        )}

        <section style={{ marginTop: 32 }}>
          <h2 className="bloco__titulo">Imagens para usar com crédito</h2>
          <p>Cards com o recorde de cada loteria, atualizados a cada concurso (1200 × 630 px):</p>
          <ul className="recordes-lista">
            {Object.keys(LOTERIAS).map((c) => (
              <li key={c}>
                <a href={`/${c}/recordes/opengraph-image`} target="_blank" rel="noopener">
                  Recordes {preposicaoLoteria(c).de} {NOME_LOTERIA[c] ?? c}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div className="ferramenta-explicacao" style={{ marginTop: 32 }}>
          <h2 className="bloco__titulo">Como citar e de onde vêm os dados</h2>
          <p>
            Sugestão de crédito: &ldquo;segundo levantamento do LotoAnalítica (lotoanalitica.com.br) com dados da
            Caixa&rdquo;, com link para a página do dado. Os resultados vêm da Caixa e são importados logo depois de
            cada sorteio. Valores em reais da época, sem correção pela inflação; os concursos da Quina de 1994
            anteriores ao Real foram convertidos de cruzeiros reais pela taxa oficial (CR$ 2.750 = R$ 1). Estatísticas
            descrevem o passado e não mudam as chances de nenhum sorteio.
          </p>
          <p>
            Precisa de outro recorte, uma série histórica ou uma confirmação de número? Escreva para{" "}
            <a href={`mailto:${CONTATO}?subject=Imprensa`}>{CONTATO}</a> com o assunto &ldquo;Imprensa&rdquo;.
          </p>
        </div>
      </main>
    </>
  );
}
