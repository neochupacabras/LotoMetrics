import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Repetidas: quantas dezenas se repetem de um concurso pro outro";
const DESCRICAO =
  "Na Lotofácil, a média é 9 dezenas repetidas do concurso anterior. Na Mega-Sena, mais da metade dos sorteios não repete nenhuma. O motivo é o mesmo.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/repetidas` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/repetidas`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoRepetidasPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          Compare os resultados de dois concursos seguidos e o número de dezenas em
          comum é bem diferente dependendo da loteria — na Lotofácil, bastante; na
          Mega-Sena, quase nenhuma. O cálculo é o mesmo nos dois casos; o que muda é
          a proporção de dezenas sorteadas por vez.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Lotofácil: repetir muito é esperado
        </h2>
        <p>
          A Lotofácil sorteia 15 das 25 dezenas a cada concurso — 60% do total. Isso,
          sozinho, já garante sobreposição grande entre concursos seguidos. Tratando o
          concurso anterior como um conjunto fixo de 15 "marcadas" e o concurso atual
          como um novo sorteio independente de 15 dentro das mesmas 25, a distribuição
          da sobreposição é:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Repetidas do concurso anterior — Lotofácil</th>
                <th className="num">Combinações</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>9 dezenas repetidas</td>
                <td className="num">1.051.050</td>
                <td className="num">32,15%</td>
              </tr>
              <tr>
                <td>8 dezenas repetidas</td>
                <td className="num">772.200</td>
                <td className="num">23,62%</td>
              </tr>
              <tr>
                <td>10 dezenas repetidas</td>
                <td className="num">756.756</td>
                <td className="num">23,15%</td>
              </tr>
              <tr>
                <td>7 dezenas repetidas</td>
                <td className="num">289.575</td>
                <td className="num">8,86%</td>
              </tr>
              <tr>
                <td>11 dezenas repetidas</td>
                <td className="num">286.650</td>
                <td className="num">8,77%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A média esperada é <strong>9 dezenas repetidas</strong> de um concurso pro
          próximo — 60% das 15 dezenas, exatamente a proporção de dezenas sorteadas a
          cada concurso. Sorteios com apenas 5 ou menos repetidas, ou com 13 ou mais,
          são matematicamente possíveis mas raros.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Mega-Sena: repetir é a exceção
        </h2>
        <p>
          A Mega-Sena sorteia 6 das 60 dezenas — apenas 10% do total. Com uma
          proporção tão pequena, a sobreposição entre concursos seguidos é bem menor.
          A distribuição esperada:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Repetidas do concurso anterior — Mega-Sena</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0 repetidas</td>
                <td className="num">51,59%</td>
              </tr>
              <tr>
                <td>1 repetida</td>
                <td className="num">37,90%</td>
              </tr>
              <tr>
                <td>2 repetidas</td>
                <td className="num">9,48%</td>
              </tr>
              <tr>
                <td>3 ou mais repetidas</td>
                <td className="num">1,03%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Em mais da metade dos sorteios possíveis da Mega-Sena (51,6%),
          nenhuma dezena se repete do concurso anterior.</strong> A média esperada é
          só 0,6 repetidas por concurso — em contraste com as 9 da Lotofácil.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O mesmo mecanismo, dois resultados opostos
        </h2>
        <p>
          A formula é simples: a média de repetidas entre dois concursos é sempre igual
          a (dezenas sorteadas)² ÷ (total de dezenas disponíveis). Na Lotofácil: 15² ÷
          25 = 9. Na Mega-Sena: 6² ÷ 60 = 0,6. Não tem história acumulada envolvida —
          é uma propriedade fixa da loteria, calculável antes de qualquer sorteio
          acontecer.
        </p>
        <p>
          A conclusão prática é diferente pras duas loterias. Na Lotofácil, se você
          jogar os mesmos 15 números do concurso anterior, em média 9 deles vão repetir
          — mas isso não é estratégia, é só reflexo de que em qualquer combinação de 15
          dezenas, em média 9 delas já saíram no concurso anterior. Na Mega-Sena, em
          mais da metade dos concursos, o resultado não repete absolutamente nada do
          sorteio anterior — o que pode parecer sugestivo, mas é simplesmente o que a
          matemática prevê.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve
        </h2>
        <p>
          A tabela de{" "}
          <Link href="/lotofacil/tabelas/repetidas">repetidas da Lotofácil</Link> (e{" "}
          <Link href="/megasena/tabelas/repetidas">da Mega-Sena</Link>) mostra o
          histórico real dessa sobreposição concurso a concurso — útil pra confirmar
          que o padrão observado bate com o esperado matematicamente (geralmente bate),
          não pra escolher quais dezenas repetir.
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
