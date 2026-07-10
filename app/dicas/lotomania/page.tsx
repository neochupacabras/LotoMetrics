import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Lotomania: marque 50, acerte 20 (ou zero)";
const DESCRICAO =
  "Na Lotomania, o apostador marca 50 de 100 números e a Caixa sorteia 20 — e ganha tanto quem acerta muitos quanto quem não acerta nenhum. Entenda a lógica invertida dessa loteria.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/lotomania` },
  openGraph: {
    title: TITULO, description: DESCRICAO,
    url: `${SITE_URL}/dicas/lotomania`,
    siteName: SITE_NAME, locale: "pt_BR", type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoLotomaniaPage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          A Lotomania tem a mecânica mais incomum entre as loterias da Caixa: o
          apostador marca 50 números de um universo de 100, e ganha tanto
          acertando muitas das 20 dezenas sorteadas quanto não acertando nenhuma.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Como funciona</h2>
        <p>
          O apostador marca exatamente 50 números de 1 a 100 (não há opção de
          apostar menos ou mais). A Caixa sorteia 20 dezenas. As faixas premiadas
          vão de 15 a 20 acertos — e também incluem a faixa de 0 acertos.
        </p>
        <p>
          Os sorteios acontecem aos sábados, às 20h. A aposta custa R$3,00.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Faixas de premiação</h2>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Faixa</th>
                <th className="num">Condição</th>
                <th className="num">Probabilidade</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1ª</td><td className="num">20 acertos</td><td className="num">1 em 11.372.636</td></tr>
              <tr><td>2ª</td><td className="num">19 acertos</td><td className="num">1 em 352.552</td></tr>
              <tr><td>3ª</td><td className="num">18 acertos</td><td className="num">1 em 24.236</td></tr>
              <tr><td>4ª</td><td className="num">17 acertos</td><td className="num">1 em 2.777</td></tr>
              <tr><td>5ª</td><td className="num">16 acertos</td><td className="num">1 em 473</td></tr>
              <tr><td>6ª</td><td className="num">15 acertos</td><td className="num">1 em 112</td></tr>
              <tr><td>7ª</td><td className="num">0 acertos</td><td className="num">1 em 11.372.636</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>A simetria entre 0 e 20 acertos</h2>
        <p>
          Um detalhe curioso: acertar zero das 20 dezenas sorteadas tem exatamente
          a mesma probabilidade que acertar as 20 — ambas em torno de 1 em
          11.372.636. Isso é consequência direta de marcar exatamente metade do
          universo (50 de 100): cada dezena sorteada tem a mesma chance de cair
          dentro ou fora do seu cartão, criando uma distribuição simétrica.
        </p>
        <p>
          Isso significa que não existe uma "estratégia para acertar zero" mais
          eficaz do que escolher os números normalmente — as duas probabilidades
          são idênticas e nenhuma escolha de dezenas muda esse fato.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>A faixa mais acessível</h2>
        <p>
          Com probabilidade de 1 em 112, a faixa de 15 acertos é, disparada, a mais
          alcançável da Lotomania — mais próxima da faixa de 11 acertos da
          Lotofácil do que de qualquer faixa principal de outras loterias. Isso
          explica por que a Lotomania costuma ter volumes altos de ganhadores nas
          faixas intermediárias a cada concurso.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Explorando o histórico</h2>
        <p>
          Acompanhe a distribuição real das dezenas na{" "}
          <Link href="/lotomania/tabelas/frequencia">tabela de frequência</Link>{" "}
          e o histórico de acúmulos na{" "}
          <Link href="/lotomania/acumulos">linha do tempo de acúmulos</Link> —
          ambos úteis para entender o passado da Lotomania, sem prever o próximo
          resultado.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Probabilidades calculadas para a aposta única de 50 dezenas.
        </div>
        <p style={{ marginTop: "24px" }}>
          <Link href="/dicas" className="breadcrumb">← Voltar para Dicas e estratégias</Link>
        </p>
      </main>
    </>
  );
}
