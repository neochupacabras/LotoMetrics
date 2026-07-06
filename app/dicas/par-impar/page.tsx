import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Distribuição par/ímpar: por que 7-8 é mais comum que 0-15";
const DESCRICAO =
  "Toda combinação específica tem a mesma chance — mas nem toda distribuição par/ímpar tem o mesmo número de combinações possíveis. Com os números reais da Lotofácil e da Mega-Sena.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/par-impar` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/par-impar`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoParImparPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          Essa é a análise que mais confunde gente que entende um pouco de
          probabilidade — porque a explicação "correta" parece contradizer o fato
          observado. Os dois são verdadeiros ao mesmo tempo, e a diferença está numa
          pergunta que parece igual mas não é.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Duas perguntas muito diferentes
        </h2>
        <p>
          <strong>Pergunta 1:</strong> "Qual a chance de o próximo sorteio ser
          exatamente as dezenas 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14 e
          15?" <strong>Pergunta 2:</strong> "Qual a chance de o próximo sorteio ter
          entre 7 e 8 dezenas pares?"
        </p>
        <p>
          A resposta da pergunta 1 é: exatamente a mesma chance que qualquer outra
          combinação específica de 15 dezenas — 1 em 3.268.760, sem exceção. Isso vale
          pra essa sequência "óbvia" tanto quanto pra qualquer combinação
          aparentemente aleatória. A loteria não sabe, e não se importa, que uma
          sequência parece mais "especial" que a outra pra um ser humano.
        </p>
        <p>
          A resposta da pergunta 2 é completamente diferente — e tem uma resposta real,
          calculável, que não é 50/50. A razão é simples: existem <em>muito mais</em>{" "}
          combinações de 15 dezenas com distribuição 7-8 do que combinações com
          distribuição 0-15. Cada combinação individual tem a mesma chance, mas há
          muito mais delas levando ao resultado "7 pares" do que ao resultado "0 pares".
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Os números reais da Lotofácil
        </h2>
        <p>
          Entre 1 e 25 existem 12 dezenas pares (2, 4, 6, ..., 24) e 13 ímpares
          (1, 3, 5, ..., 25). Contando quantas combinações de 15 dezenas existem pra
          cada divisão par/ímpar possível (combinatória pura, sem nenhum dado histórico
          envolvido):
        </p>

        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Pares / Ímpares</th>
                <th className="num">Combinações possíveis</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>7 pares / 8 ímpares</td>
                <td className="num">1.019.304</td>
                <td className="num">31,18%</td>
              </tr>
              <tr>
                <td>8 pares / 7 ímpares</td>
                <td className="num">849.420</td>
                <td className="num">25,99%</td>
              </tr>
              <tr>
                <td>6 pares / 9 ímpares</td>
                <td className="num">660.660</td>
                <td className="num">20,21%</td>
              </tr>
              <tr>
                <td>9 pares / 6 ímpares</td>
                <td className="num">377.520</td>
                <td className="num">11,55%</td>
              </tr>
              <tr>
                <td>5 pares / 10 ímpares</td>
                <td className="num">226.512</td>
                <td className="num">6,93%</td>
              </tr>
              <tr>
                <td>10 pares / 5 ímpares</td>
                <td className="num">84.942</td>
                <td className="num">2,60%</td>
              </tr>
              <tr>
                <td>Demais (0–4 ou 11–12 pares)</td>
                <td className="num">50.402</td>
                <td className="num">1,54%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Repare: 7-8 e 8-7 juntos somam 57,2% de todas as 3.268.760 combinações
          possíveis. Distribuições extremas como 0 pares/15 ímpares ou 12 pares/3
          ímpares somam, juntas, bem menos de 1%. É por isso que jogos montados
          aleatoriamente "tendem" a sair com distribuição próxima de 7-8: não porque
          a loteria prefira esse padrão, mas porque a maioria absoluta das combinações
          que existem tem essa cara.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O histórico confirma a teoria
        </h2>
        <p>
          Nos mais de 3.700 concursos da Lotofácil, a distribuição par/ímpar dos
          resultados reais segue quase exatamente as proporções calculadas acima pela
          combinatória. Concursos com 7 ou 8 dezenas pares aparecem em cerca de 56-58%
          dos sorteios — praticamente idêntico aos 57,2% teóricos. Essa concordância
          não é coincidência: é a confirmação de que o sorteio é honesto e que a
          combinatória descreve bem o comportamento esperado.
        </p>
        <p>
          Da mesma forma, sorteios com distribuição extrema (0 pares ou 12 pares) são
          raríssimos no histórico — e quando aparecem, não indicam nenhuma tendência
          para o sorteio seguinte. São apenas os eventos raros que a combinatória prevê
          que vão acontecer eventualmente em um histórico longo.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Mega-Sena: proporções muito diferentes
        </h2>
        <p>
          Na Mega-Sena há 30 dezenas pares e 30 ímpares entre 1 e 60, e são sorteadas
          6 dezenas por concurso. Com uma divisão perfeitamente simétrica entre pares e
          ímpares, o resultado mais provável é 3 pares/3 ímpares — e a combinatória
          confirma:
        </p>

        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Pares / Ímpares — Mega-Sena</th>
                <th className="num">Combinações possíveis</th>
                <th className="num">% do total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>3 pares / 3 ímpares</td>
                <td className="num">16.471.950</td>
                <td className="num">32,93%</td>
              </tr>
              <tr>
                <td>2 pares / 4 ímpares</td>
                <td className="num">12.890.700</td>
                <td className="num">25,77%</td>
              </tr>
              <tr>
                <td>4 pares / 2 ímpares</td>
                <td className="num">12.890.700</td>
                <td className="num">25,77%</td>
              </tr>
              <tr>
                <td>1 par / 5 ímpares</td>
                <td className="num">4.272.048</td>
                <td className="num">8,54%</td>
              </tr>
              <tr>
                <td>5 pares / 1 ímpar</td>
                <td className="num">4.272.048</td>
                <td className="num">8,54%</td>
              </tr>
              <tr>
                <td>0 pares / 6 ímpares</td>
                <td className="num">593.775</td>
                <td className="num">1,19%</td>
              </tr>
              <tr>
                <td>6 pares / 0 ímpares</td>
                <td className="num">593.775</td>
                <td className="num">1,19%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          As três distribuições centrais (2-4, 3-3 e 4-2) juntas somam 84,5% de todas
          as combinações. Sorteios com todos pares ou todos ímpares aparecem em apenas
          1,2% dos casos — raros, mas não impossíveis.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que fazer com essa informação
        </h2>
        <p>
          Nada que mude sua chance de ganhar — vale repetir: toda combinação específica
          tem exatamente a mesma probabilidade. O que essa análise explica é por que
          combinações com distribuição muito desbalanceada são raras de{" "}
          <em>aparecer</em> nos resultados — não porque sejam azaradas, mas porque
          existem matematicamente menos delas no universo total de combinações.
        </p>
        <p>
          Há quem argumente que jogar com distribuição par/ímpar próxima da típica
          (7-8 na Lotofácil, 3-3 na Mega-Sena) reduz o risco de dividir o prêmio com
          outros apostadores — já que apostadores que montam jogos no olho tendem a
          escolher distribuições próximas da média. Esse raciocínio é plausível, mas
          difícil de quantificar com precisão.
        </p>
        <p>
          Se você gosta de montar jogos com uma distribuição "típica" por preferência
          pessoal, o{" "}
          <Link href="/lotofacil/gerador">gerador de jogos</Link> deste site tem um
          filtro para isso no modo avançado. É uma escolha estética, não uma estratégia
          que aumenta probabilidade de acerto.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Este artigo é conteúdo educativo. Os números acima são combinatória pura
          (quantas combinações existem de cada tipo), não uma previsão de
          comportamento futuro do sorteio.
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
