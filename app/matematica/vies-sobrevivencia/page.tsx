import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SimuladorSobrevivencia } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Viés de Sobrevivência — Matemática sem mistério | LotoAnalítica",
  description: "Por que todo mundo conhece um ganhador da loteria e ninguém lembra dos milhões que perderam. Entenda o viés de sobrevivência com o clássico exemplo dos aviões da 2ª guerra.",
  alternates: { canonical: `${SITE_URL}/matematica/vies-sobrevivencia` },
  openGraph: { title: "Viés de Sobrevivência", description: "Os dados que faltam contam mais da história do que os que sobraram.", url: `${SITE_URL}/matematica/vies-sobrevivencia`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoViesSobrevivenciaPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--rust">
          <span className="mat-artigo-emoji">✈️</span>
          <div>
            <p className="mat-artigo-conceito">Viés de sobrevivência (em inglês: <em>survivorship bias</em>)</p>
            <h1 className="titulo-edicao">Viés de Sobrevivência</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">Por que todo mundo conhece um ganhador da loteria — e ninguém lembra dos milhões que jogaram e perderam.</p>

        <SimuladorSobrevivencia />

        <h2 className="mat-h2">O exemplo que nomeou o viés: os aviões da 2ª Guerra</h2>
        <p>Durante a Segunda Guerra Mundial, a força aérea dos EUA queria saber onde reforçar a blindagem dos bombardeiros. Analisaram os aviões que <strong>voltaram</strong> de missões e mapearam onde estavam os buracos de bala — principalmente nas asas e na fuselagem traseira. A conclusão óbvia seria reforçar exatamente esses pontos.</p>
        <p>O estatístico Abraham Wald discordou: os pontos com <em>menos</em> buracos nos aviões que voltaram — como o motor e a cabine — eram exatamente onde reforçar, porque os aviões atingidos ali provavelmente <strong>não voltaram</strong> para serem contados. Os dados disponíveis só mostravam os sobreviventes; os dados que realmente importavam tinham desaparecido junto com os aviões que caíram.</p>

        <h2 className="mat-h2">Por que isso engana tanto</h2>
        <p>O viés de sobrevivência acontece sempre que analisamos apenas os casos que "sobreviveram" a algum filtro — e ignoramos, muitas vezes sem perceber, que os casos que não sobreviveram simplesmente não aparecem nos dados. A ausência não é um "zero" visível — é um buraco invisível na amostra.</p>
        <p><strong>Empresas de sucesso:</strong> livros de negócios estudam empresas que deram certo e extraem "lições" delas — mas raramente comparam com empresas que fizeram exatamente as mesmas coisas e faliram. Sem o grupo de comparação, é impossível saber se a lição realmente causou o sucesso.</p>
        <p><strong>Fundos de investimento:</strong> rankings de "melhores fundos da década" costumam incluir só fundos que ainda existem — os que tiveram desempenho ruim e foram fechados simplesmente somem da lista, inflando artificialmente a rentabilidade média aparente do mercado.</p>

        <div className="mat-box mat-box--rust">
          <p className="mat-box__titulo">🎓 "Todo mundo que eu conheço que não estudou ficou rico"</p>
          <p>Uma versão comum do viés de sobrevivência aparece em frases como "vários bilionários largaram a faculdade, então faculdade não é essencial para o sucesso". A frase ignora os milhões de pessoas que também largaram a faculdade e não ficaram ricas — elas simplesmente não viram uma biografia escrita sobre si.</p>
        </div>

        <h2 className="mat-h2">O viés de sobrevivência na loteria</h2>
        <p>Quase todo mundo já ouviu falar de "um conhecido de um conhecido" que ganhou algum prêmio de loteria. É natural — histórias de quem ganha se espalham, viram notícia, são compartilhadas. Histórias de quem joga há 20 anos e nunca ganhou nada relevante não têm motivo para virar notícia — e por isso parecem não existir, mesmo sendo, de longe, o resultado mais comum.</p>
        <p>Use o simulador acima para visualizar essa proporção real: mesmo com centenas de milhares de pessoas jogando as mesmas dezenas, a fração que efetivamente "aparece" como ganhadora da faixa principal é minúscula — o resto, a esmagadora maioria, simplesmente não gera história nenhuma para contar.</p>
        <p>Isso não significa que ganhar seja impossível — significa que julgar a probabilidade real de ganhar pela quantidade de histórias de sucesso que você ouve é um erro sistemático. As histórias que chegam até você já foram filtradas pelo próprio resultado que você está tentando estimar.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Viés de sobrevivência: tirar conclusões olhando só para os casos que "sobreviveram" a um filtro, ignorando os que não sobreviveram.</li>
            <li>O exemplo clássico: blindar onde os aviões que voltaram <em>não</em> tinham buracos, não onde tinham.</li>
            <li>Aparece em rankings de empresas, fundos de investimento e histórias de sucesso genéricas.</li>
            <li>Histórias de ganhadores de loteria são visíveis; a esmagadora maioria de quem não ganha simplesmente não vira notícia.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
