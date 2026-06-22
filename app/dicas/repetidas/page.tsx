import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Repetidas: quantas dezenas se repetem de um concurso pro outro";
const DESCRICAO =
  "Em média, 9 das 15 dezenas de um concurso da Lotofácil já tinham saído no concurso anterior — e isso também não é coincidência, é matemática.";

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
          Compare o resultado de dois concursos seguidos da Lotofácil e normalmente boa
          parte das dezenas se repete — o que parece estranho à primeira vista (não
          deveria ser tudo diferente, já que é "aleatório"?), mas tem uma explicação
          puramente combinatória.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Por que repetir tanto é esperado
        </h2>
        <p>
          A Lotofácil sorteia 15 das 25 dezenas a cada concurso — ou seja, 60% de todas
          as dezenas possíveis saem em todo sorteio. Isso, sozinho, já garante uma
          sobreposição grande entre concursos seguidos: tratando o concurso anterior
          como um conjunto fixo de 15 "marcadas" e o concurso atual como um novo
          sorteio independente de 15 dentro das mesmas 25, a distribuição da
          sobreposição é:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Dezenas repetidas do concurso anterior</th>
                <th className="num">Combinações possíveis</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>9</td>
                <td className="num">1.051.050</td>
                <td className="num">32,15%</td>
              </tr>
              <tr>
                <td>8</td>
                <td className="num">772.200</td>
                <td className="num">23,62%</td>
              </tr>
              <tr>
                <td>10</td>
                <td className="num">756.756</td>
                <td className="num">23,15%</td>
              </tr>
              <tr>
                <td>7</td>
                <td className="num">289.575</td>
                <td className="num">8,86%</td>
              </tr>
              <tr>
                <td>11</td>
                <td className="num">286.650</td>
                <td className="num">8,77%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A média esperada é <strong>9 dezenas repetidas</strong> de um concurso pro
          próximo — ou seja, 60% das 15 dezenas, exatamente a mesma proporção de
          dezenas sorteadas a cada concurso. Faz sentido: se 60% de todas as dezenas
          saem em qualquer sorteio, 60% de overlap entre dois sorteios consecutivos é
          justamente o que se espera, sem nenhuma "memória" entre os concursos
          envolvida.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O erro comum de interpretação
        </h2>
        <p>
          É tentador achar que, como muitas dezenas se repetem, "jogar os mesmos
          números do concurso anterior" é uma estratégia razoável. Não é — a tabela
          acima já mostra <em>qualquer</em> conjunto de 15 dezenas tendo essa mesma
          distribuição de sobreposição esperada com o sorteio anterior, porque é uma
          propriedade da combinatória do jogo, não uma característica das dezenas que
          saíram da última vez especificamente. Jogar os mesmos 15 números de novo tem
          exatamente a mesma chance de ganhar que jogar qualquer outra combinação de 15
          dezenas.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Pra que serve
        </h2>
        <p>
          A tabela de{" "}
          <Link href="/lotofacil/tabelas/repetidas">repetidas</Link> mostra o histórico
          real dessa sobreposição concurso a concurso — útil pra confirmar que o padrão
          observado bate com o esperado matematicamente (geralmente bate), não pra
          escolher quais dezenas repetir.
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
