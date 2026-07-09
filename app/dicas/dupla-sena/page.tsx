import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Dupla Sena: dois sorteios por aposta e o que isso muda na prática";
const DESCRICAO =
  "Na Dupla Sena, cada bilhete é conferido em dois sorteios distintos — 1º e 2º. As chances dobram? Nem tanto. Entenda como funciona a matemática dos dois sorteios.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/dupla-sena` },
  openGraph: {
    title: TITULO, description: DESCRICAO,
    url: `${SITE_URL}/dicas/dupla-sena`,
    siteName: SITE_NAME, locale: "pt_BR", type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoDuplaSenaPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          A Dupla Sena existe desde 2001 e tem uma mecânica única entre as loterias
          federais: cada aposta é conferida em dois sorteios independentes realizados
          no mesmo concurso. Isso muda as probabilidades de ganhar — mas não da forma
          que a maioria imagina.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Como funciona</h2>
        <p>
          O apostador escolhe 6 números de 1 a 50. A Caixa realiza dois sorteios de
          6 dezenas de 1 a 50 no mesmo concurso — o 1º sorteio e o 2º sorteio. O
          bilhete é conferido contra os dois resultados separadamente, e pode ganhar
          prêmios em um ou em ambos os sorteios.
        </p>
        <p>
          Os sorteios acontecem terça, quinta e sábado às 20h. Cada concurso tem 8
          faixas de premiação — 4 para o 1º sorteio e 4 para o 2º.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>As faixas por sorteio</h2>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Faixa</th>
                <th className="num">Sorteio</th>
                <th className="num">Acertos necessários</th>
                <th className="num">Probabilidade</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1ª</td><td className="num">1º</td><td className="num">6 (sena)</td><td className="num">1 em 15.890.700</td></tr>
              <tr><td>2ª</td><td className="num">1º</td><td className="num">5 (quina)</td><td className="num">1 em 52.969</td></tr>
              <tr><td>3ª</td><td className="num">1º</td><td className="num">4 (quadra)</td><td className="num">1 em 798</td></tr>
              <tr><td>4ª</td><td className="num">1º</td><td className="num">3 (terno)</td><td className="num">1 em 30</td></tr>
              <tr><td>5ª</td><td className="num">2º</td><td className="num">6 (sena)</td><td className="num">1 em 15.890.700</td></tr>
              <tr><td>6ª</td><td className="num">2º</td><td className="num">5 (quina)</td><td className="num">1 em 52.969</td></tr>
              <tr><td>7ª</td><td className="num">2º</td><td className="num">4 (quadra)</td><td className="num">1 em 798</td></tr>
              <tr><td>8ª</td><td className="num">2º</td><td className="num">3 (terno)</td><td className="num">1 em 30</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Os dois sorteios dobram as chances?</h2>
        <p>
          Tecnicamente, sim — mas não de forma simples. A probabilidade de acertar
          a sena em <em>pelo menos um</em> dos dois sorteios é:
        </p>
        <p>
          P(pelo menos uma sena) = 1 − P(nenhuma sena) = 1 − (1 − 1/15.890.700)² ≈ 1 em 7.945.350
        </p>
        <p>
          Isso é aproximadamente o dobro da chance em relação a um único sorteio —
          o que faz sentido, já que são dois eventos independentes com a mesma
          probabilidade. É equivalente a jogar duas apostas simples de 6 dezenas
          diferentes num sorteio normal.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Comparação com a Mega-Sena</h2>
        <p>
          A Dupla Sena usa o mesmo universo de dezenas (1-50, 6 sorteadas) que a
          +Milionária, mas com 50 dezenas em vez de 60 da Mega-Sena. O resultado:
          a probabilidade de acertar a sena é mais do que 3x maior na Dupla Sena
          (1 em 15,9 milhões) do que na Mega-Sena (1 em 50 milhões) — antes de
          considerar o segundo sorteio.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>O simulador confere só o 1º sorteio</h2>
        <p>
          O <Link href="/duplasena/simulador">simulador histórico da Dupla Sena</Link>{" "}
          confere o jogo contra o 1º sorteio de cada concurso. O 2º sorteio é exibido
          nos resultados mas não entra no cálculo histórico de pontuação — isso é
          indicado na interface do simulador.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Probabilidades calculadas para aposta simples de 6 dezenas.
        </div>
        <p style={{ marginTop: "24px" }}>
          <Link href="/dicas" className="breadcrumb">← Voltar para Dicas e estratégias</Link>
        </p>
      </main>
    </>
  );
}
