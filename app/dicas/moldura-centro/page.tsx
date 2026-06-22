import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Moldura e centro: o volante também é uma grade de números";
const DESCRICAO =
  "Olhar o volante como uma grade 5×5 (Lotofácil) revela outra distribuição combinatória — com a borda quase sempre dominando o centro, por pura geometria.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/moldura-centro` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/moldura-centro`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoMolduraCentroPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          O volante da Lotofácil organiza as 25 dezenas numa grade de 5 linhas por 5
          colunas. Separar essa grade em "moldura" (a borda) e "centro" (o miolo) é só
          uma forma geométrica de olhar pros números — mas, como qualquer divisão
          desigual, ela já nasce com uma distribuição esperada diferente, sem nenhum
          comportamento especial da loteria envolvido.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Por que a divisão já é desigual de cara
        </h2>
        <p>
          Numa grade 5×5, a borda (primeira e última linha, primeira e última coluna)
          tem 16 das 25 posições. O centro — só o quadrado interno de 3×3 — tem as 9
          restantes: 7, 8, 9, 12, 13, 14, 17, 18 e 19.
        </p>
        <p>
          Como a moldura já começa com quase o dobro de posições do centro (16 contra
          9), é esperado que, em qualquer sorteio, mais dezenas saiam da moldura do que
          do centro — não porque a moldura seja "favorecida", mas porque ela
          simplesmente tem mais números disponíveis pra sair.
        </p>

        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Moldura / Centro no sorteio</th>
                <th className="num">Combinações possíveis</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10 moldura / 5 centro</td>
                <td className="num">1.009.008</td>
                <td className="num">30,87%</td>
              </tr>
              <tr>
                <td>9 moldura / 6 centro</td>
                <td className="num">960.960</td>
                <td className="num">29,40%</td>
              </tr>
              <tr>
                <td>11 moldura / 4 centro</td>
                <td className="num">550.368</td>
                <td className="num">16,84%</td>
              </tr>
              <tr>
                <td>8 moldura / 7 centro</td>
                <td className="num">463.320</td>
                <td className="num">14,17%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A média esperada é <strong>9,6 dezenas da moldura</strong> e{" "}
          <strong>5,4 do centro</strong> por concurso (15 × 16 ÷ 25 e 15 × 9 ÷ 25). Não
          é coincidência o 5,4 aparecer de novo — é a mesma conta de "quantos números
          de um grupo de N saem, em média, dado que esse grupo tem N elementos dentro
          de 25" que já apareceu no artigo sobre{" "}
          <Link href="/dicas/primos">primos</Link> (que também tem 9 números). Centro e
          primos têm o mesmo tamanho de grupo (9), por isso a mesma média.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve
        </h2>
        <p>
          A tabela de{" "}
          <Link href="/lotofacil/tabelas/moldura-centro">moldura e centro</Link>{" "}
          mostra o histórico real dessa distribuição — uma forma a mais de visualizar o
          comportamento passado, sem nenhuma capacidade de prever onde as próximas
          dezenas vão cair na grade.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Este artigo é conteúdo educativo. Os números acima são combinatória exata, não
          uma previsão do próximo sorteio.
        </div>

        <p style={{ marginTop: "24px" }}>
          <Link href="/dicas" className="breadcrumb">
            ← Voltar para Dicas e estratégias
          </Link>
        </p>
      </main>
    </>
  );
}
