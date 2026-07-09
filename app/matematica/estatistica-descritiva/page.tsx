import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { BoxplotInterativo } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Estatística Descritiva — Matemática sem mistério | LotoAnalítica",
  description: "Como resumir qualquer conjunto de dados em 5 números com quartis e boxplot. Entenda o que a média esconde e quando usar cada medida estatística.",
  alternates: { canonical: `${SITE_URL}/matematica/estatistica-descritiva` },
  openGraph: { title: "Estatística Descritiva", description: "Quartis, boxplot e o resumo de cinco números.", url: `${SITE_URL}/matematica/estatistica-descritiva`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoEstatisticaDescritivaPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--pine">
          <span className="mat-artigo-emoji">📦</span>
          <div>
            <p className="mat-artigo-conceito">Quartis e boxplot (em inglês: <em>descriptive statistics</em>)</p>
            <h1 className="titulo-edicao">Estatística Descritiva</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">Como resumir qualquer conjunto de dados em 5 números — e o que esses 5 números revelam que a média esconde.</p>

        <BoxplotInterativo />

        <h2 className="mat-h2">O problema de resumir dados com um único número</h2>
        <p>A <Link href="/matematica/media-moda-mediana" className="breadcrumb">média</Link> é útil, mas conta apenas parte da história. Dois conjuntos de dados completamente diferentes podem ter a mesma média. A estatística descritiva (em inglês: <em>descriptive statistics</em>) fornece ferramentas para resumir dados de forma mais completa: onde está o centro, como estão distribuídos, e se há valores extremos que distorcem o quadro.</p>

        <h2 className="mat-h2">O resumo de cinco números</h2>
        <p>Proposto pelo estatístico americano John Tukey nos anos 1970, o <strong>resumo de cinco números</strong> (em inglês: <em>five-number summary</em>) captura a distribuição completa de um conjunto:</p>
        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📐 Os cinco números</p>
          <p><strong>Mínimo:</strong> menor valor (excluindo discrepantes extremos).</p>
          <p style={{ marginTop: 6 }}><strong>Q1 — 1º quartil:</strong> 25% dos dados estão abaixo deste valor.</p>
          <p style={{ marginTop: 6 }}><strong>Q2 — Mediana:</strong> 50% abaixo, 50% acima.</p>
          <p style={{ marginTop: 6 }}><strong>Q3 — 3º quartil:</strong> 75% dos dados estão abaixo deste valor.</p>
          <p style={{ marginTop: 6 }}><strong>Máximo:</strong> maior valor (excluindo discrepantes extremos).</p>
          <p style={{ marginTop: 8 }}><strong>IQR = Q3 − Q1</strong> (intervalo interquartil, em inglês: <em>interquartile range</em>): onde se concentram os 50% centrais dos dados.</p>
        </div>

        <h2 className="mat-h2">O boxplot — cinco números num gráfico</h2>
        <p>O diagrama de caixa (em inglês: <em>box plot</em>), criado também por Tukey, representa os cinco números visualmente. A <strong>caixa</strong> vai de Q1 a Q3, com uma linha marcando a mediana. Os <strong>bigodes</strong> (em inglês: <em>whiskers</em>) se estendem até o mínimo e máximo não-discrepantes. Pontos fora dos bigodes são marcados individualmente como discrepantes (em inglês: <em>outliers</em>).</p>
        <p>Experimente os três conjuntos no visualizador. Em "Salários (empresa)", a média (linha vermelha) fica muito à direita da mediana (linha verde) — puxada pelo salário extremo do CEO. O boxplot revela isso instantaneamente.</p>

        <h2 className="mat-h2">Identificando e tratando discrepantes</h2>
        <p>Um discrepante (em inglês: <em>outlier</em>) é formalmente definido como qualquer ponto fora do intervalo [Q1 − 1,5×IQR, Q3 + 1,5×IQR]. Podem ser erros de medição (deve corrigir) ou valores legítimos mas extremos (deve manter e reportar). A regra: nunca remova um discrepante sem investigar a causa. Ao reportar resultados, sempre informe se discrepantes foram excluídos e por quê.</p>

        <h2 className="mat-h2">Assimetria — quando a distribuição pende para um lado</h2>
        <p>Quando a média é muito maior que a mediana, a distribuição tem <strong>assimetria positiva</strong> (em inglês: <em>right skew</em>) — a cauda dos valores altos puxa a média para cima. Renda, patrimônio e preços de imóveis são exemplos clássicos.</p>
        <p>Quando a média é muito menor que a mediana, temos <strong>assimetria negativa</strong> (em inglês: <em>left skew</em>). Notas de provas muito fáceis tendem a ter essa distribuição — a maioria tira notas altas, poucos tiram muito baixo.</p>
        <p>O coeficiente de assimetria (em inglês: <em>skewness</em>) mede formalmente essa inclinação. Qualquer valor diferente de zero indica assimetria; valores extremos indicam distribuições muito distorcidas onde a média não representa bem o conjunto.</p>

        <h2 className="mat-h2">Estatística descritiva e frequências de loteria</h2>
        <p>O boxplot das frequências das dezenas da Lotofácil ao longo de 3.700+ concursos mostra uma distribuição compacta com IQR pequeno — Q1 e Q3 próximos da mediana. Isso é esperado: a <Link href="/matematica/lei-dos-grandes-numeros" className="breadcrumb">Lei dos Grandes Números</Link> garante convergência para frequências similares. Discrepantes reais (dezenas com frequência muito acima ou abaixo) seriam evidência de possível viés — mas com 25 dezenas e 3.700 sorteios, alguma variação residual é estatisticamente normal.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Resumo de cinco números: mín, Q1, mediana, Q3, máx — descreve distribuição sem depender apenas da média.</li>
            <li>IQR = Q3 − Q1: dispersão dos 50% centrais, robusto a discrepantes.</li>
            <li>Boxplot expõe assimetria e discrepantes visualmente — ferramenta essencial para explorar dados.</li>
            <li>Assimetria positiva (média &gt; mediana) é comum em renda, patrimônio e preços.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
