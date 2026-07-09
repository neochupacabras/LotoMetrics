import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { ComparadorPizza } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Geometria no Cotidiano — Matemática sem mistério | LotoAnalítica",
  description: "Por que uma pizza grande é quase sempre melhor negócio que duas pequenas. A área cresce com o quadrado do raio — e isso muda tudo no dia a dia.",
  alternates: { canonical: `${SITE_URL}/matematica/geometria-cotidiano` },
  openGraph: { title: "Geometria no Cotidiano", description: "A matemática das pizzas, embalagens, escalas e mapas.", url: `${SITE_URL}/matematica/geometria-cotidiano`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
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
            <p className="mat-artigo-conceito">Área, volume e razão de escala (em inglês: <em>geometry in everyday life</em>)</p>
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
          Nossa intuição erra sistematicamente ao comparar objetos circulares.
          Uma pizza com o dobro do diâmetro parece ter o dobro de pizza —
          mas tem quatro vezes mais. Isso porque a área de um círculo cresce
          com o <strong>quadrado</strong> do raio:
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">Área = π × r²</div>
          <div className="mat-formula__exemplo">
            Pizza 25cm (raio=12,5cm): π × 12,5² ≈ 491 cm²{"\n"}
            Pizza 35cm (raio=17,5cm): π × 17,5² ≈ 962 cm² — quase o dobro!{"\n"}
            Pizza 50cm (raio=25cm): π × 25² ≈ 1.963 cm² — quatro vezes a de 25cm
          </div>
        </div>
        <p>
          Use o comparador acima e experimente: uma pizza G de 35cm por R$45
          versus uma pizza P de 25cm por R$25. Qual é melhor negócio? A resposta
          pode surpreender.
        </p>

        <h2 className="mat-h2">A razão de escala — dobrar uma dimensão muda tudo</h2>
        <p>
          Quando você escala um objeto, comprimento, área e volume se comportam
          de formas completamente diferentes:
        </p>
        <div className="mat-box mat-box--rust">
          <p className="mat-box__titulo">📐 Como cada dimensão escala</p>
          <p><strong>Comprimento (1D):</strong> escala linearmente. Dobrar o tamanho dobra o comprimento.</p>
          <p style={{ marginTop: 6 }}><strong>Área (2D):</strong> escala com o quadrado. Dobrar o tamanho quadruplica a área.</p>
          <p style={{ marginTop: 6 }}><strong>Volume (3D):</strong> escala com o cubo. Dobrar o tamanho multiplica o volume por 8.</p>
          <p style={{ marginTop: 10 }}>
            Consequência biológica fascinante: elefantes precisam de pernas muito
            mais grossas proporcionalmente do que formigas porque o peso cresce
            com o cubo (volume × densidade), mas a resistência das pernas cresce
            apenas com o quadrado da seção transversal.
          </p>
        </div>

        <h2 className="mat-h2">Geometria em embalagens</h2>
        <p>
          A forma mais eficiente (menor superfície para dado volume) é a esfera
          — por isso bolhas de sabão são esféricas e muitos frutos também.
          O cilindro (lata) é um compromisso entre esfericidade e empilhabilidade.
        </p>
        <p>
          Uma lata mais alta com mesmo volume que uma mais baixa pode parecer maior —
          mas contém a mesma quantidade. Comparar preço por mililitro (não por
          embalagem) é o hábito correto ao fazer compras.
        </p>
        <p>
          Caixas cúbicas têm a melhor razão superfície/volume entre sólidos
          retangulares — por isso embalagens de produtos caros tendem a ser mais
          cúbicas. Isso minimiza o custo do material de embalagem por unidade
          de produto.
        </p>

        <h2 className="mat-h2">Escalas em mapas</h2>
        <p>
          Um mapa com escala 1:100.000 significa que 1 cm no mapa representa
          100.000 cm = 1 km na realidade. Mas para <em>áreas</em>, a escala é
          ao quadrado: 1 cm² no mapa = 100.000² cm² = 10 km² na realidade.
        </p>
        <p>
          Esse erro é muito comum: ao estimar o tamanho de um território num mapa,
          tendemos a pensar em escala linear — mas a área cresce com o quadrado.
          A Groenlândia parece maior que a África no mapa de projeção Mercator —
          mas a África tem 14 vezes a área da Groenlândia. A distorção visual
          das projeções de mapa é um problema geométrico clássico.
        </p>

        <h2 className="mat-h2">Bolões e custo por combinação</h2>
        <p>
          Na loteria, bolões maiores não apenas dividem o custo — eles cobrem
          mais combinações possíveis. O raciocínio é idêntico ao da pizza:
          o "custo por cobertura" diminui conforme o grupo cresce, porque
          cada participante extra adiciona cotas marginais a um custo fixo
          já distribuído.
        </p>
        <p>
          Um bolão de 20 pessoas na Mega-Sena pagando R$6 cada cobre
          aproximadamente 20 apostas. Se fosse individualmente, cada pessoa
          cobriria 20 combinações de 50.063.860 — uma fração mínima.
          Juntas, cobrem 20× mais, mas pagam o mesmo por cabeça.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Área = πr². Dobrar o diâmetro quadruplica a área — não dobra. Sempre compare preço por área.</li>
            <li>Comprimento escala linearmente; área com o quadrado; volume com o cubo da dimensão linear.</li>
            <li>Forma mais eficiente (menor superfície por volume) é a esfera — por isso bolhas e frutas redondas.</li>
            <li>Em mapas, a escala de área é o quadrado da escala linear — países grandes são frequentemente subestimados.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
