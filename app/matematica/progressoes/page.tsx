import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SimuladorProgressoes } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Progressões Aritméticas e Geométricas — Matemática sem mistério | LotoAnalítica",
  description: "Qual a diferença entre ganhar R$100 por mês e dobrar seu dinheiro todo mês? A diferença entre PA e PG é a diferença entre crescimento linear e exponencial.",
  alternates: { canonical: `${SITE_URL}/matematica/progressoes` },
  openGraph: { title: "Progressões — PA e PG", description: "Por que crescimento exponencial parece lento no início e absurdo no final.", url: `${SITE_URL}/matematica/progressoes`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoProgressoesPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--rust">
          <span className="mat-artigo-emoji">🪜</span>
          <div>
            <p className="mat-artigo-conceito">PA, PG e crescimento linear vs exponencial</p>
            <h1 className="titulo-edicao">Progressões Aritméticas e Geométricas</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          Qual a diferença entre ganhar R$100 por mês e dobrar seu dinheiro todo
          mês — e por que a diferença entre as duas é absurda a partir de um certo ponto.
        </p>

        <SimuladorProgressoes />

        <h2 className="mat-h2">Progressão Aritmética — crescimento linear</h2>
        <p>
          Numa PA, a diferença entre termos consecutivos é sempre a mesma (a razão).
          Ganhar R$100 a mais por mês: R$100, R$200, R$300, R$400... A razão é R$100.
          O crescimento é constante — uma linha reta num gráfico.
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">aₙ = a₁ + (n−1) × r</div>
          <div className="mat-formula__exemplo">5º termo de PA com a₁=100, r=50: a₅ = 100 + 4×50 = 300</div>
        </div>

        <h2 className="mat-h2">Progressão Geométrica — crescimento exponencial</h2>
        <p>
          Numa PG, a razão entre termos consecutivos é constante — ou seja, cada
          termo é o anterior multiplicado pela mesma taxa. Dobrar por mês:
          R$1, R$2, R$4, R$8, R$16... A razão é 2. O crescimento acelera sem parar.
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">aₙ = a₁ × qⁿ⁻¹</div>
          <div className="mat-formula__exemplo">5º termo de PG com a₁=1, q=2: a₅ = 1 × 2⁴ = 16</div>
        </div>

        <div className="mat-box mat-box--rust">
          <p className="mat-box__titulo">🦠 O exemplo do tabuleiro de xadrez</p>
          <p>
            A lenda diz que o inventor do xadrez pediu ao rei 1 grão de arroz na
            primeira casa, 2 na segunda, 4 na terceira, dobrando até a 64ª casa.
            O total? 2⁶⁴ − 1 ≈ 18,4 quintilhões de grãos — mais do que toda a
            produção de arroz da história da humanidade. Isso é uma PG com q=2 e 64 termos.
          </p>
        </div>

        <h2 className="mat-h2">A comparação prática</h2>
        <p>
          Um emprego que aumenta R$500 por mês (PA) parece ótimo. Um investimento
          que rende 5% ao mês (PG) parece menos impressionante no início — mas
          use o simulador acima com 24 meses e veja o que acontece. A PG explode.
        </p>
        <p>
          Viral nas redes sociais funciona como PG: um vídeo com 10 compartilhamentos
          por visualização que começa com 1 visualização — em 5 "gerações" são 100.000
          visualizações. É por isso que conteúdo viral cresce de forma tão assustadora.
        </p>

        <h2 className="mat-h2">PA e PG na loteria</h2>
        <p>
          A soma dos termos de uma PA cresce quadraticamente — o histograma de somas
          das dezenas sorteadas tem formato de sino (distribuição normal) porque é
          a soma de variáveis aleatórias, não uma PA. Mas os prêmios acumulados da
          Mega-Sena crescem de forma que pode lembrar uma PG: cada sorteio sem ganhador
          adiciona uma fração da arrecadação ao prêmio.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>PA: cada termo soma uma constante. Crescimento linear — linha reta no gráfico.</li>
            <li>PG: cada termo multiplica por uma constante. Crescimento exponencial — curva que explode.</li>
            <li>PG parece menor que PA no começo — mas a partir de certo ponto a supera de forma absurda.</li>
          </ol>
        </div>

        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
