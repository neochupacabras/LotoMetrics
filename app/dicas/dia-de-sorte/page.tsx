import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Dia de Sorte: como funciona, probabilidades e o Mês da Sorte";
const DESCRICAO =
  "7 dezenas de 1 a 31 mais um mês sorteado — a mecânica do Dia de Sorte explicada com probabilidades exatas e o papel do Mês da Sorte nas faixas de premiação.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/dia-de-sorte` },
  openGraph: {
    title: TITULO, description: DESCRICAO,
    url: `${SITE_URL}/dicas/dia-de-sorte`,
    siteName: SITE_NAME, locale: "pt_BR", type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoDiaDeSortePage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          O Dia de Sorte combina um sorteio de dezenas com um elemento extra — o
          Mês da Sorte — que abre uma faixa de premiação adicional. É uma loteria com
          mecânica simples mas com mais camadas do que parece à primeira vista.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Como funciona</h2>
        <p>
          O apostador escolhe entre 7 e 15 números de 1 a 31 e um mês do ano (janeiro
          a dezembro). A Caixa sorteia 7 dezenas de 1 a 31 e um mês. As faixas de
          premiação são baseadas na quantidade de dezenas acertadas — e o mês entra
          como elemento adicional em algumas faixas.
        </p>
        <p>
          Os sorteios acontecem três vezes por semana (terça, quinta e sábado), às 20h.
          O Dia de Sorte existe desde maio de 2018.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>As faixas de premiação</h2>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Faixa</th>
                <th className="num">Condição</th>
                <th className="num">Probabilidade (aposta simples)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1ª</td><td className="num">7 acertos + mês correto</td><td className="num">1 em 14.348.907</td></tr>
              <tr><td>2ª</td><td className="num">7 acertos (sem o mês)</td><td className="num">1 em 1.196.576</td></tr>
              <tr><td>3ª</td><td className="num">6 acertos</td><td className="num">1 em 14.502</td></tr>
              <tr><td>4ª</td><td className="num">5 acertos</td><td className="num">1 em 524</td></tr>
              <tr><td>5ª</td><td className="num">4 acertos</td><td className="num">1 em 40</td></tr>
              <tr><td>6ª</td><td className="num">Mês correto (sem acertos)</td><td className="num">1 em 12</td></tr>
              <tr><td>7ª</td><td className="num">2 acertos + mês correto</td><td className="num">1 em 18</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          A faixa do mês (6ª) é interessante: mesmo sem acertar nenhuma dezena, acertar
          o mês sorteado paga um prêmio fixo pequeno. Com probabilidade de 1 em 12, é
          a faixa mais acessível da loteria — em média, quem joga regularmente acerta
          o mês uma vez a cada 4 semanas.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>O papel do Mês da Sorte</h2>
        <p>
          O mês funciona como um multiplicador de faixas: acertar 7 dezenas sem o mês
          paga a 2ª faixa. Acertar 7 dezenas <em>e</em> o mês paga a 1ª faixa, que
          é aproximadamente 12 vezes mais rara (e por isso tem um prêmio maior).
        </p>
        <p>
          A probabilidade de acertar o mês é sempre 1 em 12, independente de qual mês
          você escolheu ou de qual saiu nos concursos anteriores. O Mês da Sorte não
          tem memória — janeiro não fica "devendo" por não ter saído nos últimos 5
          concursos. Cada sorteio é independente.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Universo menor, probabilidades mais acessíveis</h2>
        <p>
          Com dezenas de 1 a 31 (apenas 31 números), o Dia de Sorte tem o menor universo
          entre as loterias de dezenas da Caixa. Isso torna as probabilidades das faixas
          intermediárias bem mais acessíveis que a Mega-Sena:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Loteria</th>
                <th className="num">Universo</th>
                <th className="num">Probabilidade faixa 4 acertos</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Dia de Sorte</td><td className="num">1–31</td><td className="num">1 em 40</td></tr>
              <tr><td>Quina</td><td className="num">1–80</td><td className="num">1 em 65.000</td></tr>
              <tr><td>Mega-Sena</td><td className="num">1–60</td><td className="num">1 em 2.332</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Estratégia do mês</h2>
        <p>
          Escolher o mês com base no histórico ("agosto não sai há 3 concursos") não
          tem base matemática — cada mês tem a mesma probabilidade de 1/12 em todo
          concurso. A única decisão real é escolher um mês e mantê-lo (ou trocar a
          cada concurso), o que tem o mesmo valor esperado.
        </p>
        <p>
          Acompanhe os resultados na <Link href="/diadesorte/resultados">página de
          resultados do Dia de Sorte</Link>, com o Mês da Sorte sorteado exibido em
          destaque após as dezenas.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Este artigo é conteúdo educativo. As probabilidades acima são para aposta
          simples de 7 dezenas.
        </div>
        <p style={{ marginTop: "24px" }}>
          <Link href="/dicas" className="breadcrumb">← Voltar para Dicas e estratégias</Link>
        </p>
      </main>
    </>
  );
}
