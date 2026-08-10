import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SimuladorPesquisaEleitoral } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Pesquisas Eleitorais e Margem de Erro — Matemática sem mistério | LotoAnalítica",
  description: "Como 2 mil entrevistas conseguem representar mais de 150 milhões de eleitores, e o que 'empate técnico' realmente significa. Entenda amostragem e margem de erro com um simulador interativo.",
  alternates: { canonical: `${SITE_URL}/matematica/pesquisas-eleitorais-margem-de-erro` },
  openGraph: { title: "Pesquisas Eleitorais e Margem de Erro", description: "Como uma amostra pequena consegue representar milhões de eleitores.", url: `${SITE_URL}/matematica/pesquisas-eleitorais-margem-de-erro`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoPesquisasEleitoraisPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--rust">
          <span className="mat-artigo-emoji">🗳️</span>
          <div>
            <p className="mat-artigo-conceito">Amostragem, margem de erro e intervalo de confiança</p>
            <h1 className="titulo-edicao">Pesquisas Eleitorais e Margem de Erro</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">Como 2 mil entrevistas conseguem representar mais de 150 milhões de eleitores — e o que "empate técnico" realmente significa. Sem entrar em quem está na frente de quem: aqui o assunto é só a matemática por trás do número.</p>

        <SimuladorPesquisaEleitoral />

        <h2 className="mat-h2">Como uma amostra pequena representa uma população enorme</h2>
        <p>Com eleições gerais em outubro de 2026, pesquisas eleitorais voltam a aparecer o tempo todo — e junto com elas, a pergunta mais comum: como uma pesquisa com <strong>2 mil pessoas</strong> consegue dizer algo confiável sobre mais de 150 milhões de eleitores?</p>
        <p>A resposta não tem a ver com o <em>tamanho</em> da amostra em relação à população — tem a ver com <strong>aleatoriedade e representatividade</strong>. Se cada pessoa da população tem a mesma chance de ser sorteada para a amostra (e a amostra reflete a distribuição real de idade, região, renda etc.), o tamanho da população total quase não importa para a precisão — o que importa é o tamanho da própria amostra.</p>

        <h2 className="mat-h2">De onde vem a margem de erro</h2>
        <p>A margem de erro mede o quanto a estimativa de uma pesquisa pode se afastar do valor real da população, só por causa do acaso de quem foi sorteado para a amostra. Para uma pesquisa com nível de confiança de 95% (o padrão do setor):</p>
        <div className="mat-box mat-box--rust">
          <p className="mat-box__titulo">📐 Margem de erro (caso mais conservador, p = 50%)</p>
          <p style={{ fontFamily: "var(--font-mono)" }}>margem ≈ 1,96 × √(0,25 / n)</p>
          <p style={{ marginTop: 8 }}>
            Onde <em>n</em> é o tamanho da amostra. Para n = 2.000, isso dá
            aproximadamente <strong>±2,2 pontos percentuais</strong> — o número que
            você vê estampado em quase toda pesquisa eleitoral divulgada no Brasil.
          </p>
        </div>
        <p>Repare que a fórmula depende só de <em>n</em>, não do tamanho da população. É por isso que uma pesquisa nacional com 2.000 entrevistados e uma pesquisa estadual também com 2.000 entrevistados têm, aproximadamente, a mesma margem de erro — mesmo representando populações de tamanhos completamente diferentes.</p>
        <p>Use o simulador acima para ver isso na prática: defina um valor "real" arbitrário, ajuste o tamanho da amostra, e simule pesquisas repetidas. Quanto maior a amostra, mais estreita a margem — mas o ganho fica cada vez menor (dobrar a amostra não reduz o erro pela metade, reduz por um fator de √2).</p>

        <h2 className="mat-h2">O que "empate técnico" realmente significa</h2>
        <p>Quando a diferença entre dois candidatos numa pesquisa é menor que a margem de erro, a imprensa costuma chamar de "empate técnico". A interpretação correta não é "os dois estão exatamente iguais" — é: <strong>com os dados dessa amostra, não dá para afirmar com confiança estatística qual dos dois está à frente</strong>. Pode ser que um esteja genuinamente à frente do outro na população real, mas a amostra não teve "poder" suficiente para detectar essa diferença com segurança.</p>
        <p>Um detalhe técnico que a cobertura jornalística costuma simplificar demais: a margem de erro de <em>cada candidato individualmente</em> não é exatamente a margem de erro da <em>diferença entre os dois</em> — calcular a margem da diferença corretamente exige levar em conta a correlação entre as duas respostas (quem não vota em A tende a votar em B), o que normalmente resulta numa margem um pouco diferente da soma simples das margens individuais.</p>

        <h2 className="mat-h2">Erro amostral não é o único erro possível</h2>
        <p>A margem de erro cobre só o <strong>erro amostral</strong> — a variação que aconteceria mesmo numa pesquisa perfeitamente bem feita, só por causa do acaso de quem foi entrevistado. Ela não cobre outras fontes de erro, igualmente importantes:</p>
        <p><strong>Viés de metodologia ("house effects"):</strong> institutos diferentes, mesmo com o mesmo tamanho de amostra, podem ter resultados sistematicamente diferentes por causa de como fazem as perguntas, como ponderam os dados demográficos, ou o método de coleta (telefone, presencial, internet).</p>
        <p><strong>Não resposta e indecisos:</strong> como distribuir os "não sei" ou "não responderam" entre os candidatos muda o resultado final — e diferentes institutos fazem isso de formas diferentes.</p>
        <p><strong>Erro de amostragem não-aleatória:</strong> se a amostra não for verdadeiramente aleatória (por exemplo, pesquisas feitas só pela internet excluem quem não tem acesso), o resultado pode ter um viés sistemático que nenhuma fórmula de margem de erro consegue capturar.</p>

        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📚 O caso clássico: a pesquisa de 1936 com 2 milhões de pessoas que errou feio</p>
          <p>Em 1936, a revista americana <em>Literary Digest</em> enviou 10 milhões de cartas e recebeu 2,4 milhões de respostas — uma amostra gigantesca — prevendo a vitória de um candidato à presidência dos EUA. O instituto Gallup, com uma amostra de apenas 50 mil pessoas, mas escolhida de forma muito mais representativa, previu corretamente o resultado oposto. A lição, válida até hoje: uma amostra representativa de 50 mil vale mais que uma amostra enviesada de 2,4 milhões. Tamanho não substitui representatividade.</p>
        </div>

        <h2 className="mat-h2">Como ler uma pesquisa eleitoral com mais cuidado</h2>
        <ul>
          <li>Verifique o tamanho da amostra e a margem de erro divulgada — pesquisas menores têm margens maiores</li>
          <li>Diferenças menores que a margem de erro pedem cautela na interpretação, não descarte automático</li>
          <li>Compare a tendência de várias pesquisas ao longo do tempo, não o resultado isolado de uma única pesquisa</li>
          <li>Pesquisas de institutos diferentes podem ter pequenos viés sistemáticos próprios — olhar várias fontes ajuda a identificar isso</li>
        </ul>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Uma amostra aleatória e representativa pode estimar uma população inteira com boa precisão — o tamanho da população quase não importa, o que importa é o tamanho da amostra.</li>
            <li>A margem de erro (±2,2 pontos para n=2.000, no caso mais conservador) mede a variação esperada só por causa do acaso da amostragem.</li>
            <li>"Empate técnico" significa que a amostra não tem confiança estatística suficiente para apontar um líder — não que os dois estejam exatamente iguais.</li>
            <li>Erro amostral não é o único erro possível: viés de metodologia, indecisos e amostras não-representativas também afetam o resultado, e a margem de erro não cobre isso.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
