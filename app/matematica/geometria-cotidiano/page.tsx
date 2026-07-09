import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { ComparadorPizza } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Geometria no Cotidiano — Matemática sem mistério | LotoAnalítica",
  description: "Artigo educativo sobre geometria no cotidiano com exemplos práticos e componentes interativos. Parte da seção Matemática sem mistério do LotoAnalítica.",
  alternates: { canonical:  },
  openGraph: { title: "Geometria no Cotidiano", description: "Por que uma pizza grande é quase sempre melhor negócio que duas pequenas — e a matemática por trás de embalagens, mapas e escalas.", url: , siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [] },
};

export default function Page() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--rust">
          <span className="mat-artigo-emoji">🍕</span>
          <div>
            <p className="mat-artigo-conceito">Área, volume e escala (em inglês: <em>geometry in everyday life</em>)</p>
            <h1 className="titulo-edicao">Geometria no Cotidiano</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">Por que uma pizza grande é quase sempre melhor negócio que duas pequenas — e a matemática por trás de embalagens, mapas e escalas.</p>
        <ComparadorPizza />
        
        <h2 className="mat-h2">Por que a pizza grande surpreende</h2>
        <p>Nossa intuição erra sistematicamente ao comparar tamanhos de objetos circulares. Uma pizza com o dobro do diâmetro parece ter o dobro de pizza — mas tem quatro vezes mais. Isso porque a área de um círculo cresce com o quadrado do raio:

<div class='mat-formula'><div class='mat-formula__linha'>Área = π × r²</div><div class='mat-formula__exemplo'>Pizza 25cm (raio=12,5cm): π × 12,5² ≈ 491 cm²<br/>Pizza 35cm (raio=17,5cm): π × 17,5² ≈ 962 cm² — quase o dobro!<br/>Pizza 50cm (raio=25cm): π × 25² ≈ 1.963 cm² — quatro vezes a de 25cm!</div></div>

Uma pizzaria que vende pizza G por R5 e pizza P por R5 pode estar cobrando um preço justo ou uma armadilha — depende dos diâmetros exatos. Use o comparador acima para descobrir.</p>

        <h2 className="mat-h2">A razão de escala — dobrar uma dimensão muda tudo</h2>
        <p>Quando você escala um objeto, as dimensões se comportam de formas diferentes dependendo do que está medindo:

<strong>Comprimento (1D):</strong> dobra na mesma proporção. Uma estrada 2× mais longa tem 2× mais extensão.

<strong>Área (2D):</strong> cresce com o quadrado da escala. Dobrar o tamanho quadruplica a área. Uma pizza com 2× o diâmetro tem 4× a área — não 2×.

<strong>Volume (3D):</strong> cresce com o cubo da escala. Dobrar o tamanho multiplica o volume por 8. Por isso um caminhão com o dobro das dimensões de um carro carrega 8 vezes mais volume.

Essa razão de escala tem consequências biológicas profundas. Elefantes precisam de pernas muito mais grossas proporcionalmente do que formigas porque o peso cresce com o cubo do tamanho (volume × densidade), mas a resistência das pernas cresce apenas com o quadrado da seção transversal.</p>

        <h2 className="mat-h2">Geometria em embalagens</h2>
        <p>Fabricantes usam geometria para maximizar conteúdo e minimizar material de embalagem — ou para criar a percepção de quantidade maior do que existe.

A forma mais eficiente (menor superfície para dado volume) é a esfera — por isso bolhas de sabão são esféricas. Mas esferas não empilham bem. O cilindro (lata) é um compromisso eficiente entre esfericidade e empilhabilidade.

Uma lata mais alta com mesmo volume que uma mais baixa pode parecer maior — mas contém o mesmo quantidade. Comparar preço por mililitro (não por embalagem) é o hábito correto.

Caixas cúbicas têm a melhor razão superfície/volume entre sólidos retangulares — por isso embalagens de produtos caros tendem a ser mais cúbicas. Isso minimiza o custo do material de embalagem por unidade de produto.</p>

        <h2 className="mat-h2">Escalas em mapas</h2>
        <p>Um mapa escala 1:100.000 significa que 1 cm no mapa representa 100.000 cm = 1 km na realidade. Mas para áreas, a escala é ao quadrado: 1 cm² no mapa = 100.000² cm² = 10 km² na realidade.

Esse erro é muito comum: ao estimar o tamanho de um território num mapa, tendemos a pensar em escala linear — mas a área cresce com o quadrado. Um território que parece ocupar 4× mais espaço num mapa ocupa 4× mais área real, não 4× mais perímetro.

Por isso países como Brasil e Rússia, com grandes extensões, são frequentemente subestimados em tamanho quando vistos em mapas de projeção Mercator (que distorce áreas próximas aos polos). O Groenlândia parece maior que a África no Mercator — mas a África tem 14× a área da Groenlândia.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Área de círculo = πr². Dobrar o diâmetro quadruplica a área — não dobra.</li>
            <li>Comprimento escala linearmente; área com o quadrado; volume com o cubo da dimensão linear.</li>
            <li>Forma mais eficiente (menor superfície por volume) é a esfera — por isso bolhas e frutas.</li>
            <li>Em mapas, a escala de área é o quadrado da escala linear — países grandes são frequentemente subestimados.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
