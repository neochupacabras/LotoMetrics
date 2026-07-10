import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SimuladorExponencial } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Crescimento e Decaimento Exponencial — Matemática sem mistério | LotoAnalítica",
  description: "A mesma matemática por trás de uma pandemia se espalhando, da radioatividade e de um remédio sumindo do seu corpo — entenda tempo de duplicação e meia-vida.",
  alternates: { canonical: `${SITE_URL}/matematica/crescimento-decaimento-exponencial` },
  openGraph: { title: "Crescimento e Decaimento Exponencial", description: "A mesma matemática por trás de pandemias, radioatividade e remédios no corpo.", url: `${SITE_URL}/matematica/crescimento-decaimento-exponencial`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoExponencialPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--ochre">
          <span className="mat-artigo-emoji">🦠</span>
          <div>
            <p className="mat-artigo-conceito">Funções exponenciais, meia-vida e tempo de duplicação</p>
            <h1 className="titulo-edicao">Crescimento e Decaimento Exponencial</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">A mesma matemática por trás de uma pandemia se espalhando, de um material radioativo perdendo intensidade, e de um remédio sumindo aos poucos do seu corpo.</p>

        <SimuladorExponencial />

        <h2 className="mat-h2">O que crescimento exponencial realmente significa</h2>
        <p>Crescimento exponencial acontece quando algo aumenta (ou diminui) a uma <strong>taxa proporcional ao valor atual</strong> — não uma quantidade fixa por período, mas uma porcentagem fixa. É o mesmo princípio dos <Link href="/matematica/juros-compostos" className="breadcrumb">juros compostos</Link>, só que aplicado a fenômenos bem além das finanças: infecções, população de bactérias, radioatividade, e a eliminação de substâncias do corpo humano.</p>
        <p>A característica mais importante — e mais contraintuitiva — desse tipo de crescimento é que o <strong>tempo de duplicação</strong> (quanto tempo leva para o valor dobrar) é sempre o mesmo, não importa o ponto de partida. Se algo dobra a cada 3 dias, leva 3 dias para ir de 10 para 20, e também leva exatamente 3 dias para ir de 10 milhões para 20 milhões.</p>

        <h2 className="mat-h2">Por que pandemias "explodem" de repente</h2>
        <p>No início de uma epidemia, os números parecem pequenos e a preocupação parece exagerada — 100, depois 200, depois 400 casos. É fácil subestimar o crescimento exponencial porque, em termos absolutos, os primeiros aumentos parecem modestos. Mas se o tempo de duplicação for de, digamos, uma semana, esses 400 casos viram 800 na semana seguinte, 1.600 na outra, e 100 mil em pouco mais de dois meses — o mesmo padrão que tornou a matemática de epidemias um campo de estudo essencial em saúde pública.</p>

        <h2 className="mat-h2">Meia-vida: o espelho do crescimento</h2>
        <p>Decaimento exponencial é o processo inverso: em vez de dobrar, o valor cai pela metade a cada intervalo fixo de tempo — chamado de <strong>meia-vida</strong> (em inglês: <em>half-life</em>). É o conceito usado para descrever:</p>
        <p><strong>Radioatividade:</strong> a meia-vida do Carbono-14, por exemplo, é de cerca de 5.730 anos — o princípio por trás da datação por carbono usada em arqueologia.</p>
        <p><strong>Remédios no corpo:</strong> cada medicamento tem uma meia-vida biológica — o tempo que o corpo leva para eliminar metade da substância da corrente sanguínea. É essa meia-vida que determina de quanto em quanto tempo você deve tomar uma próxima dose.</p>
        <p><strong>Resfriamento de líquidos:</strong> uma xícara de café quente esfria mais rápido no início e mais devagar conforme se aproxima da temperatura ambiente — um decaimento exponencial na diferença de temperatura, descrito pela Lei do Resfriamento de Newton.</p>

        <h2 className="mat-h2">A fórmula por trás do simulador</h2>
        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">📐 Tempo de duplicação (ou meia-vida)</p>
          <p style={{ fontFamily: "var(--font-mono)" }}>t = ln(2) / ln(1 + r)</p>
          <p style={{ marginTop: 8 }}>
            Onde r é a taxa de crescimento (ou decaimento) por período, em decimal. Repare que o resultado não depende do valor inicial — só da taxa. É por isso que, no simulador, mudar a taxa muda o tempo de duplicação, mas o formato da curva continua o mesmo em qualquer escala.
          </p>
        </div>

        <h2 className="mat-h2">O erro comum: confundir com crescimento linear</h2>
        <p>Uma forma simples de testar sua intuição: um crescimento linear que soma 10 unidades por período e um crescimento exponencial de 10% por período começam parecidos, mas divergem rapidamente. Após 20 períodos, o linear terá somado 200 unidades ao valor inicial; o exponencial já terá multiplicado o valor inicial por mais de 6 vezes. Diferenciar os dois tipos de crescimento é essencial para interpretar corretamente notícias sobre epidemias, crescimento populacional ou crises financeiras.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Crescimento exponencial é uma taxa proporcional ao valor atual — a mesma lógica dos juros compostos, aplicada além das finanças.</li>
            <li>O tempo de duplicação (ou meia-vida, no decaimento) é constante, independentemente do valor de partida.</li>
            <li>Explica desde a propagação de epidemias até a eliminação de remédios do corpo e a datação por carbono-14.</li>
            <li>É fácil subestimar crescimento exponencial no início — os primeiros aumentos parecem pequenos, mas a curva acelera rápido.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
