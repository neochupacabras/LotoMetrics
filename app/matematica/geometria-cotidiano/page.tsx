import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { ComparadorPizza } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Geometria no Cotidiano — Matemática sem mistério | LotoAnalítica",
  description: "Por que uma pizza grande é quase sempre melhor negócio que duas pequenas? A área cresce com o quadrado do raio — e isso muda tudo no dia a dia.",
  alternates: { canonical: `${SITE_URL}/matematica/geometria-cotidiano` },
  openGraph: { title: "Geometria no Cotidiano", description: "A matemática das pizzas, embalagens e mapas que você usa todo dia.", url: `${SITE_URL}/matematica/geometria-cotidiano`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoGeometriaCotidianoPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--rust">
          <span className="mat-artigo-emoji">🍕</span>
          <div>
            <p className="mat-artigo-conceito">Área, volume e razão de escala</p>
            <h1 className="titulo-edicao">Geometria no Cotidiano</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          Por que uma pizza grande é quase sempre melhor negócio que duas pequenas —
          e a matemática por trás de embalagens, mapas e muito mais.
        </p>

        <ComparadorPizza />

        <h2 className="mat-h2">Por que a pizza grande surpreende</h2>
        <p>
          Intuitivamente, uma pizza com o dobro do diâmetro parece ter o dobro de
          pizza. Mas a área de um círculo cresce com o <strong>quadrado</strong> do raio:
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">Área = π × r²</div>
          <div className="mat-formula__exemplo">Pizza 25cm: π × 12,5² ≈ 491 cm²</div>
          <div className="mat-formula__exemplo">Pizza 35cm: π × 17,5² ≈ 962 cm² — quase o dobro!</div>
        </div>
        <p>
          Uma pizza de 35cm tem quase o dobro da área de uma de 25cm — mas raramente
          custa o dobro. Use o comparador acima para ver isso em qualquer combinação
          de tamanho e preço.
        </p>

        <div className="mat-box mat-box--rust">
          <p className="mat-box__titulo">📐 A razão de escala</p>
          <p>
            Quando você dobra uma dimensão linear (diâmetro, lado), a área
            quadruplica (2²=4) e o volume multiplica por 8 (2³=8). Isso tem
            consequências práticas em tudo que envolve escala:
          </p>
          <p style={{ marginTop: 8 }}>
            Elefantes têm pernas muito mais grossas proporcionalmente que formigas
            porque o peso cresce com o cubo do tamanho, mas a resistência dos ossos
            só cresce com o quadrado da seção transversal.
          </p>
        </div>

        <h2 className="mat-h2">Embalagens e volume</h2>
        <p>
          Fabricantes de alimentos usam a geometria a seu favor. Uma lata mais
          comprida pode ter o mesmo volume que uma mais larga — mas parecendo maior.
          A relação entre área superficial e volume também determina por que
          cubos grandes são mais eficientes para armazenar do que pequenos: menos
          "parede" por unidade de conteúdo.
        </p>
        <p>
          A forma mais eficiente (menor superfície para dado volume) é a esfera —
          é por isso que bolhas de sabão são esféricas e muitos frutos também.
        </p>

        <h2 className="mat-h2">Mapas e escala</h2>
        <p>
          Um mapa com escala 1:100.000 significa que 1 cm no mapa = 100.000 cm
          (= 1 km) na realidade. A área, porém, escala com o quadrado: 1 cm² no
          mapa = 1 km² na realidade. Confundir escala linear com escala de área
          é um erro comum ao estimar tamanho de territórios em mapas.
        </p>

        <h2 className="mat-h2">Bolões e tamanho de grupos</h2>
        <p>
          Na loteria, bolões maiores têm custo por cota menor — a mesma lógica
          da pizza. Um bolão de 20 pessoas pagando R$5 cada cobre 10 jogos completos.
          Dividido por 20, o custo por combinação extra é menor. A geometria não
          aparece diretamente, mas a <em>razão de escala</em> — menos custo fixo
          por unidade conforme o grupo cresce — é o mesmo princípio.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Área = π × r². Dobrar o diâmetro quadruplica a área — não apenas dobra.</li>
            <li>Volume cresce com o cubo da dimensão linear — razão de escala explica por que grandes são mais eficientes.</li>
            <li>Sempre compare preço por área (ou volume), não por tamanho linear.</li>
          </ol>
        </div>

        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
