import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { SimuladorSalarios } from "./ConteudoClient";

export const metadata: Metadata = {
  title: "Média, Moda e Mediana — Matemática sem mistério | LotoAnalítica",
  description: "Por que a média salarial de uma empresa pode ser completamente enganosa. Entenda média, moda e mediana com exemplos reais e veja quando usar cada uma.",
  alternates: { canonical: `${SITE_URL}/matematica/media-moda-mediana` },
  openGraph: { title: "Média, Moda e Mediana", description: "Três formas de resumir dados — e quando cada uma é a certa.", url: `${SITE_URL}/matematica/media-moda-mediana`, siteName: SITE_NAME, locale: "pt_BR", type: "article", images: [`${SITE_URL}/opengraph-image`] },
};

export default function ArtigoMediaModaMedianaPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--rust">
          <span className="mat-artigo-emoji">📏</span>
          <div>
            <p className="mat-artigo-conceito">Medidas de tendência central (em inglês: <em>measures of central tendency</em>)</p>
            <h1 className="titulo-edicao">Média, Moda e Mediana</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          Por que a "média salarial" de uma empresa pode ser completamente
          enganosa — e qual das três medidas você deve usar em cada situação.
        </p>

        <SimuladorSalarios />

        <h2 className="mat-h2">Três formas de resumir um conjunto de dados</h2>
        <p>
          Quando temos um conjunto de números, muitas vezes queremos resumir
          tudo em um único valor representativo. Essas medidas de resumo
          são chamadas de <strong>medidas de tendência central</strong>{" "}
          (em inglês: <em>measures of central tendency</em>) — elas tentam
          capturar o "centro" ou o valor típico dos dados. Há três principais:
          média, moda e mediana. Cada uma conta uma história diferente sobre
          os mesmos dados.
        </p>

        <div className="mat-box mat-box--rust">
          <p className="mat-box__titulo">📐 As três medidas definidas</p>
          <p>
            <strong>Média aritmética (em inglês: <em>arithmetic mean</em>):</strong>{" "}
            some todos os valores e divida pelo total de elementos. É a mais
            usada, mas sensível a valores extremos (chamados de discrepantes
            ou, em inglês, <em>outliers</em>).
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>Mediana (em inglês: <em>median</em>):</strong>{" "}
            o valor do meio quando os dados estão ordenados. Se o número
            de elementos for par, é a média dos dois valores centrais.
            Não é afetada por valores extremos.
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>Moda (em inglês: <em>mode</em>):</strong>{" "}
            o valor que aparece com maior frequência. Um conjunto pode ter
            mais de uma moda (bimodal, trimodal) ou nenhuma (se todos os
            valores forem diferentes).
          </p>
        </div>

        <h2 className="mat-h2">O problema da média: um bilionário na sala</h2>
        <p>
          Imagine uma sala com 9 pessoas ganhando R$3.000 por mês e uma
          pessoa ganhando R$150.000 por mês. A média salarial é:
          (9 × R$3.000 + R$150.000) ÷ 10 = R$17.700.
        </p>
        <p>
          Essa média não representa <em>ninguém</em> na sala: 90% das pessoas
          ganham muito menos, e a única que ganha mais ganha muito mais.
          A média foi "puxada" pelo valor extremo do dono.
        </p>
        <p>
          A mediana, nesse caso, seria R$3.000 — o valor que realmente divide
          o grupo ao meio. É muito mais representativa da realidade da maioria.
          Por isso o IBGE e economistas preferem a mediana ao discutir renda
          e desigualdade no Brasil.
        </p>

        <h2 className="mat-h2">Quando usar cada uma</h2>
        <p>
          <strong>Use a média quando:</strong> os dados são homogêneos e não
          há valores extremos discrepantes. Temperatura média de uma cidade,
          altura de atletas da mesma modalidade, tempo médio de resposta de
          um servidor — todos são contextos onde a média funciona bem.
        </p>
        <p>
          <strong>Use a mediana quando:</strong> há valores extremos ou a
          distribuição é assimétrica (em inglês: <em>skewed distribution</em>).
          Renda, preço de imóveis, patrimônio — qualquer coisa em que alguns
          valores são muito maiores que a maioria.
        </p>
        <p>
          <strong>Use a moda quando:</strong> você quer saber o valor mais
          comum, especialmente com dados categóricos. Tamanho de roupa mais
          vendido, cor de carro mais popular, nota mais frequente em uma prova.
        </p>

        <div className="mat-box mat-box--ochre">
          <p className="mat-box__titulo">🗺️ Um exemplo clássico: renda nos EUA</p>
          <p>
            Em 2023, a renda média familiar nos EUA era de aproximadamente
            US$80.000 por ano. A renda mediana era de aproximadamente US$56.000.
            A diferença de US$24.000 entre as duas reflete a assimetria da
            distribuição de renda: os super-ricos puxam a média para cima,
            mas não afetam a mediana.
          </p>
          <p style={{ marginTop: 8 }}>
            Se alguém te disser que "a renda média nos EUA é US$80.000",
            está tecnicamente correto — mas a mediana conta a verdade
            sobre a maioria das famílias americanas.
          </p>
        </div>

        <h2 className="mat-h2">Média vs mediana nas somas de loteria</h2>
        <p>
          O histograma de somas das dezenas sorteadas na Lotofácil tem uma
          distribuição quase simétrica (em forma de sino), com média e mediana
          próximas de 210. Nesse caso, as duas medidas concordam — o que é
          sinal de que a distribuição é bem comportada e não tem viés.
        </p>
        <p>
          O heatmap de frequências das dezenas individuais, por sua vez, tem
          uma distribuição mais uniforme. A <strong>moda</strong> (dezena mais
          frequente) e a <strong>mediana de frequências</strong> ficam próximas,
          o que confirma que o sorteio é justo — nenhuma dezena está sendo
          sistematicamente favorecida.
        </p>

        <h2 className="mat-h2">A média ponderada — uma variação importante</h2>
        <p>
          Em alguns contextos, os valores têm pesos diferentes. A{" "}
          <strong>média ponderada</strong> (em inglês: <em>weighted average</em>)
          multiplica cada valor pelo seu peso antes de somar:
        </p>
        <div className="mat-formula">
          <div className="mat-formula__linha">MP = Σ(valor × peso) ÷ Σ(pesos)</div>
          <div className="mat-formula__exemplo">
            Notas: 7,5 (peso 3) + 8,0 (peso 4) + 6,0 (peso 2){"\n"}
            MP = (7,5×3 + 8,0×4 + 6,0×2) ÷ (3+4+2) = (22,5 + 32 + 12) ÷ 9 = 66,5 ÷ 9 ≈ 7,39
          </div>
        </div>
        <p>
          Use a{" "}
          <Link href="/calculadoras/media-ponderada" className="breadcrumb">
            calculadora de média ponderada
          </Link>{" "}
          para calcular médias com quantos itens e pesos quiser.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 4 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Média: soma ÷ total. Rápida e fácil, mas distorcida por valores extremos.</li>
            <li>Mediana: valor do meio. Robusta a valores extremos — melhor para renda e preços.</li>
            <li>Moda: valor mais frequente. Ideal para dados categóricos e decisões de estoque.</li>
            <li>Quando média ≠ mediana, há assimetria nos dados — pergunte por qual motivo.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
