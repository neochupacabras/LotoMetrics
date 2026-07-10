import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Quina: 5 de 80 dezenas, 5 sorteios por semana";
const DESCRICAO =
  "A Quina sorteia 5 dezenas entre 80 números, cinco vezes por semana, e paga prêmio a partir de apenas 2 acertos — entenda as probabilidades reais de cada faixa.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/quina` },
  openGraph: {
    title: TITULO, description: DESCRICAO,
    url: `${SITE_URL}/dicas/quina`,
    siteName: SITE_NAME, locale: "pt_BR", type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoQuinaPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          A Quina existe desde 1994 e é uma das loterias mais antigas da Caixa.
          Sorteando 5 de 80 dezenas seis dias por semana, ela tem a maior
          frequência de sorteios entre as grandes loterias — e uma das faixas de
          entrada mais acessíveis.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Como funciona</h2>
        <p>
          O apostador escolhe entre 5 e 15 números de 1 a 80. A Caixa sorteia 5
          dezenas. Diferente da maioria das loterias, não existe "aposta mínima
          maior que o sorteado" obrigatória — apostar as 5 dezenas mínimas já
          concorre a todas as faixas.
        </p>
        <p>
          Os sorteios acontecem de segunda a sábado, às 20h. A aposta simples de
          5 dezenas custa R$2,50.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Faixas de premiação</h2>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Faixa</th>
                <th className="num">Condição</th>
                <th className="num">Probabilidade (aposta 5 dezenas)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1ª</td><td className="num">5 acertos (quina)</td><td className="num">1 em 24.040.016</td></tr>
              <tr><td>2ª</td><td className="num">4 acertos (quadra)</td><td className="num">1 em 64.107</td></tr>
              <tr><td>3ª</td><td className="num">3 acertos (terno)</td><td className="num">1 em 866</td></tr>
              <tr><td>4ª</td><td className="num">2 acertos (duque)</td><td className="num">1 em 36</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          A faixa de 2 acertos, com probabilidade de 1 em 36, é a mais acessível
          entre todas as loterias de dezenas da Caixa — mais fácil até que a faixa
          equivalente da Lotofácil (11 acertos, 1 em 11,4 na aposta mínima, mas
          calculada sobre uma base bem diferente).
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Por que ela acumula pouco</h2>
        <p>
          Com 5 sorteios por semana e décadas de histórico, a Quina raramente passa
          muitos concursos seguidos sem um ganhador na faixa principal — não porque
          a faixa seja fácil (ela não é), mas porque o volume de apostas e a
          frequência de sorteios criam mais "tentativas" por semana do que
          loterias com menos sorteios, como a Mega-Sena.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Universo grande, histórico longo</h2>
        <p>
          Com quase 6.900 concursos desde 1994, a Quina tem um dos maiores
          históricos entre as loterias federais — dados suficientes para que a
          frequência de cada dezena já esteja bem próxima da média esperada. Use o{" "}
          <Link href="/quina/heatmap">Heatmap</Link> e as{" "}
          <Link href="/quina/tabelas/frequencia">tabelas de frequência</Link> para
          explorar esse histórico — sem esperar nenhuma vantagem preditiva dele.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Probabilidades calculadas para aposta simples de 5 dezenas.
        </div>
        <p style={{ marginTop: "24px" }}>
          <Link href="/dicas" className="breadcrumb">← Voltar para Dicas e estratégias</Link>
        </p>
      </main>
    </>
  );
}
