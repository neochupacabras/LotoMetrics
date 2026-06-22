import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Apostar mais dezenas vale a pena? Custo e probabilidade na mesma conta";
const DESCRICAO =
  "Jogar 16 dezenas na Lotofácil custa R$56 e aumenta a probabilidade de ganhar na mesma proporção exata. A probabilidade por real gasto nunca muda.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/mais-dezenas-vale-a-pena` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/dicas/mais-dezenas-vale-a-pena`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoMaisDezenasPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          Apostas com mais dezenas são apresentadas como uma forma de "aumentar as
          chances". É verdade — mas de uma forma muito específica, com uma consequência
          que raramente é dita junto: o custo sobe na exata mesma proporção que a
          probabilidade. Nunca melhor, nunca pior.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O que acontece quando você aposta mais dezenas
        </h2>
        <p>
          Uma aposta de 16 dezenas na Lotofácil não é uma única aposta especial — é a
          Caixa jogando por você todas as C(16,15) = 16 combinações de 15 dezenas
          possíveis dentro das 16 que você escolheu. O preço é 16 × R$3,50 = R$56,00.
          Uma aposta de 17 dezenas são C(17,15) = 136 combinações, a R$476,00.
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Dezenas</th>
                <th className="num">Combinações cobertas</th>
                <th className="num">Preço</th>
                <th className="num">Probabilidade de 15 acertos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>15</td>
                <td className="num">1</td>
                <td className="num">R$ 3,50</td>
                <td className="num">1 em 3.268.760</td>
              </tr>
              <tr>
                <td>16</td>
                <td className="num">16</td>
                <td className="num">R$ 56,00</td>
                <td className="num">1 em 204.298</td>
              </tr>
              <tr>
                <td>17</td>
                <td className="num">136</td>
                <td className="num">R$ 476,00</td>
                <td className="num">1 em 24.035</td>
              </tr>
              <tr>
                <td>18</td>
                <td className="num">816</td>
                <td className="num">R$ 2.856,00</td>
                <td className="num">1 em 4.006</td>
              </tr>
              <tr>
                <td>19</td>
                <td className="num">3.876</td>
                <td className="num">R$ 13.566,00</td>
                <td className="num">1 em 843</td>
              </tr>
              <tr>
                <td>20</td>
                <td className="num">15.504</td>
                <td className="num">R$ 54.264,00</td>
                <td className="num">1 em 211</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          A probabilidade melhora dramaticamente. Mas o preço sobe na mesma proporção.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O número que nunca muda
        </h2>
        <p>
          Calcule a probabilidade de ganhar a faixa 1 por real gasto em qualquer linha
          da tabela acima. Com 15 dezenas: 1/3.268.760 ÷ R$3,50. Com 16 dezenas:
          16/3.268.760 ÷ R$56,00. O resultado é sempre o mesmo número: você obtém
          exatamente a mesma "quantidade de probabilidade por real" em qualquer uma
          dessas apostas.
        </p>
        <p>
          Isso não é coincidência — é uma consequência direta de como o preço é
          calculado (cada combinação custando o mesmo valor base). Jogar 16 dezenas por
          R$56 é matematicamente idêntico a jogar 16 apostas simples de R$3,50 cada
          com 16 combinações diferentes. Você está pagando pelo número de combinações
          que está cobrindo, sempre ao mesmo preço por combinação.
        </p>

        <div className="bloco" style={{ marginTop: "28px" }}>
          <p>
            <strong>Por que isso importa na prática.</strong> Se alguém argumentar que
            "apostar 16 dezenas é mais eficiente" ou "dá mais retorno por real", está
            errado — a eficiência por real apostado é exatamente a mesma. A única
            diferença real entre apostar 15 ou 16 dezenas é que com 16 dezenas você
            apostou 16 vezes mais dinheiro e tem 16 vezes mais chance de ganhar na faixa
            principal. Isso é tudo.
          </p>
        </div>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          O mesmo raciocínio na Mega-Sena
        </h2>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Dezenas</th>
                <th className="num">Combinações cobertas</th>
                <th className="num">Preço</th>
                <th className="num">Probabilidade de sena</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>6</td>
                <td className="num">1</td>
                <td className="num">R$ 6,00</td>
                <td className="num">1 em 50.063.860</td>
              </tr>
              <tr>
                <td>7</td>
                <td className="num">7</td>
                <td className="num">R$ 42,00</td>
                <td className="num">1 em 7.151.980</td>
              </tr>
              <tr>
                <td>8</td>
                <td className="num">28</td>
                <td className="num">R$ 168,00</td>
                <td className="num">1 em 1.787.995</td>
              </tr>
              <tr>
                <td>9</td>
                <td className="num">84</td>
                <td className="num">R$ 504,00</td>
                <td className="num">1 em 595.998</td>
              </tr>
              <tr>
                <td>10</td>
                <td className="num">210</td>
                <td className="num">R$ 1.260,00</td>
                <td className="num">1 em 238.399</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Mesma lógica: a probabilidade por real gasto é sempre idêntica, independente
          de quantas dezenas você escolher.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>
          Onde mais dezenas <em>podem</em> fazer diferença
        </h2>
        <p>
          Há uma situação onde apostas maiores têm uma vantagem real sobre jogar várias
          apostas simples separadas: as faixas intermediárias. Quando você aposta 17
          dezenas e 14 das 15 sorteadas estão entre as suas 17, você ganha prêmios de
          faixa 2 (14 acertos) em várias das suas 136 combinações ao mesmo tempo —
          não só uma. Isso é diferente de ter jogado 136 apostas simples ao acaso, onde
          provavelmente só uma delas teria 14 acertos.
        </p>
        <p>
          Esse é o princípio por trás do{" "}
          <Link href="/dicas/fechamento">fechamento</Link>: quando você cobre um pool
          específico de dezenas de forma sistemática, há correlação entre seus bilhetes
          que pode resultar em múltiplos prêmios de faixas intermediárias se seu pool
          estiver certo. Mas isso não muda o retorno esperado total — só a distribuição
          entre faixas.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Os preços acima são os vigentes desde julho de 2025 (Lotofácil: R$3,50 por
          aposta simples de 15 dezenas; Mega-Sena: R$6,00 por aposta simples de 6
          dezenas). Este artigo é conteúdo educativo.
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
