import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Timemania: 7 de 80 dezenas e o Time do Coração";
const DESCRICAO =
  "A Timemania sorteia 7 de 80 dezenas mais um time de futebol. A faixa do Time do Coração paga um prêmio fixo independente das dezenas — entenda como funciona.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/timemania` },
  openGraph: {
    title: TITULO, description: DESCRICAO,
    url: `${SITE_URL}/dicas/timemania`,
    siteName: SITE_NAME, locale: "pt_BR", type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoTimemaniaPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          A Timemania existe desde 2008 e tem uma característica que a diferencia
          das outras loterias: além das dezenas, você escolhe um time de futebol.
          Se o time sorteado for o seu, você ganha um prêmio fixo — independente
          de quantas dezenas acertou.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Como funciona</h2>
        <p>
          O apostador escolhe 10 números de 1 a 80 e um time de futebol da lista
          oficial da Caixa. A Caixa sorteia 7 dezenas de 1 a 80 e um time. Os prêmios
          dependem de quantas dezenas você acertou, mais a faixa especial do time.
        </p>
        <p>
          Os sorteios acontecem terça, quinta e sábado às 20h. A aposta simples de
          10 dezenas custa R$3,00.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Faixas de premiação</h2>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Faixa</th>
                <th className="num">Condição</th>
                <th className="num">Probabilidade (aposta 10 dezenas)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1ª</td><td className="num">7 acertos</td><td className="num">1 em 9.082.432</td></tr>
              <tr><td>2ª</td><td className="num">6 acertos</td><td className="num">1 em 115.474</td></tr>
              <tr><td>3ª</td><td className="num">5 acertos</td><td className="num">1 em 4.198</td></tr>
              <tr><td>4ª</td><td className="num">4 acertos</td><td className="num">1 em 277</td></tr>
              <tr><td>5ª</td><td className="num">3 acertos</td><td className="num">1 em 31</td></tr>
              <tr><td>6ª</td><td className="num">Time do Coração correto</td><td className="num">1 em ~80 times</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>A faixa do Time do Coração</h2>
        <p>
          A 6ª faixa paga um prêmio fixo (geralmente na faixa de R$5 a R$15) quando
          o time sorteado é o mesmo que você escolheu — independente das dezenas. A
          probabilidade depende de quantos times estão na lista oficial, que varia ao
          longo dos anos conforme clubes entram e saem do programa.
        </p>
        <p>
          O time do Dia de Sorte e o da Timemania usam o mesmo campo `nomeTimeCoracaoMesSorte`
          na API da Caixa — a diferença é que no Dia de Sorte é um mês, e na Timemania
          é um nome de clube.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Universo grande, probabilidades baixas</h2>
        <p>
          Com 80 dezenas disponíveis e apenas 7 sorteadas por concurso, a Timemania tem
          uma das menores proporções de dezenas sorteadas entre as loterias federais —
          apenas 8,75%. Para comparação, a Lotofácil sorteia 60% das suas dezenas.
        </p>
        <p>
          Isso significa que sequências consecutivas são mais raras, a frequência por
          dezena cresce mais lentamente e os acúmulos tendem a durar mais. Para a
          análise estatística, o <Link href="/timemania/analisador">Analisador</Link>{" "}
          e o <Link href="/timemania/heatmap">Heatmap</Link> mostram como as dezenas
          se distribuem ao longo do histórico completo da Timemania.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Probabilidades calculadas para aposta simples de 10 dezenas.
        </div>
        <p style={{ marginTop: "24px" }}>
          <Link href="/dicas" className="breadcrumb">← Voltar para Dicas e estratégias</Link>
        </p>
      </main>
    </>
  );
}
