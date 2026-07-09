import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const TITULO = "Super Sete: a lógica das 7 colunas independentes de 0 a 9";
const DESCRICAO =
  "Na Super Sete, cada coluna é um sorteio independente de 0 a 9 — a mesma dezena pode aparecer em colunas diferentes. Entenda por que isso é diferente de todas as outras loterias.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/dicas/super-sete` },
  openGraph: {
    title: TITULO, description: DESCRICAO,
    url: `${SITE_URL}/dicas/super-sete`,
    siteName: SITE_NAME, locale: "pt_BR", type: "article",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ArtigoSuperSetePage() {
  return (
    <>
      <Masthead dicasAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Dicas e estratégias</p>
        <h1 className="titulo-edicao">{TITULO}</h1>
        <p className="subtitulo-edicao">
          A Super Sete, criada em 2020, tem uma mecânica completamente diferente de
          todas as outras loterias federais. Em vez de escolher dezenas de um universo
          único, você preenche 7 colunas — cada coluna tem um dígito de 0 a 9, e
          cada coluna é sorteada independentemente das outras.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Como funciona</h2>
        <p>
          O volante tem 7 colunas (C1 a C7), cada uma com os dígitos de 0 a 9. Para
          cada coluna, o apostador escolhe 1 a 3 números. A Caixa sorteia 1 número
          por coluna, totalizando 7 números sorteados. Para ganhar, você precisa
          acertar o número certo na coluna certa.
        </p>
        <p>
          Os sorteios acontecem segunda, quarta e sexta às 20h. A aposta simples
          (1 número por coluna) custa R$2,50.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>A consequência mais importante: repetição</h2>
        <p>
          Como cada coluna é independente, o mesmo dígito pode aparecer em várias
          colunas no mesmo concurso. O resultado "8, 7, 4, 3, 9, 6, 6" é perfeitamente
          válido — o 6 apareceu nas colunas C6 e C7 no mesmo sorteio. Isso nunca
          acontece em outras loterias onde cada dezena só pode sair uma vez por
          concurso.
        </p>
        <p>
          Isso tem implicações diretas para a análise estatística: ferramentas como
          "dezenas repetidas do concurso anterior" e "ciclos" não fazem sentido para
          a Super Sete, porque os dígitos são amostrados com reposição.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>As probabilidades</h2>
        <p>
          Com 10 possibilidades por coluna e 7 colunas independentes, o total de
          combinações possíveis é 10⁷ = 10.000.000. Para a aposta simples:
        </p>
        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Faixa</th>
                <th className="num">Acertos necessários</th>
                <th className="num">Probabilidade</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1ª</td><td className="num">7 colunas certas</td><td className="num">1 em 10.000.000</td></tr>
              <tr><td>2ª</td><td className="num">6 colunas certas</td><td className="num">1 em 142.857</td></tr>
              <tr><td>3ª</td><td className="num">5 colunas certas</td><td className="num">1 em 3.858</td></tr>
              <tr><td>4ª</td><td className="num">4 colunas certas</td><td className="num">1 em 204</td></tr>
              <tr><td>5ª</td><td className="num">3 colunas certas</td><td className="num">1 em 19</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>Apostar mais números por coluna</h2>
        <p>
          Na Super Sete, você pode escolher 2 ou 3 números por coluna. Escolher 2
          números na coluna 1 significa que, para aquela coluna, você acerta se
          qualquer um dos dois números sorteados for o da C1. Isso aumenta a
          probabilidade de acerto daquela coluna de 10% para 20%.
        </p>
        <p>
          O custo sobe proporcionalmente: uma aposta com 2 números em todas as 7
          colunas custa 2⁷ = 128 vezes mais do que uma aposta simples. A probabilidade
          por real gasto é a mesma — o mesmo princípio das apostas com mais dezenas
          em outras loterias.
        </p>

        <h2 className="bloco__titulo" style={{ marginTop: "36px" }}>O heatmap da Super Sete</h2>
        <p>
          O <Link href="/supersete/heatmap">heatmap do Super Sete</Link> neste site
          tem uma visualização especial: em vez de colorir dezenas num volante linear,
          ele mostra a frequência de cada dígito (0-9) por coluna (C1-C7), o que é
          a forma mais informativa de ver os dados históricos desta loteria.
        </p>

        <div className="aviso-legal" style={{ marginTop: "36px" }}>
          Probabilidades calculadas para aposta simples de 1 número por coluna.
        </div>
        <p style={{ marginTop: "24px" }}>
          <Link href="/dicas" className="breadcrumb">← Voltar para Dicas e estratégias</Link>
        </p>
      </main>
    </>
  );
}
