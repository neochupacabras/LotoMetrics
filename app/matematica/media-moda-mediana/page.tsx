import Link from "next/link";
import { useState, useMemo } from "react";
import Masthead from "@/components/Masthead";
import { SimuladorSalarios } from "./ConteudoClient";
export default function ArtigoMediaModaMedianaPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--rust">
          <span className="mat-artigo-emoji">📏</span>
          <div>
            <p className="mat-artigo-conceito">Medidas de tendência central</p>
            <h1 className="titulo-edicao">Média, Moda e Mediana</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">Por que a "média salarial" de uma empresa pode ser completamente enganosa — e qual medida usar em cada situação.</p>

        <SimuladorSalarios />

        <h2 className="mat-h2">Três formas de resumir um conjunto de dados</h2>
        <p>Quando temos muitos números, queremos um jeito de resumi-los num valor representativo. Existem três medidas clássicas, e cada uma conta uma história diferente:</p>
        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📐 As três medidas</p>
          <p><strong>Média:</strong> some todos os valores e divida pelo total. Sensível a valores extremos (outliers). Funciona bem quando os dados são homogêneos.</p>
          <p style={{ marginTop: 8 }}><strong>Mediana:</strong> valor do meio quando ordenados. Ignora extremos. Melhor para dados com outliers (renda, preço de imóveis).</p>
          <p style={{ marginTop: 8 }}><strong>Moda:</strong> valor que aparece mais vezes. Útil para dados categóricos (cor preferida, tamanho de roupa) ou quando há um valor claramente dominante.</p>
        </div>

        <h2 className="mat-h2">Qual usar em cada situação</h2>
        <p><strong>Salário / renda:</strong> mediana. Um bilionário numa sala eleva a média para um valor que ninguém recebe de verdade.</p>
        <p><strong>Temperatura:</strong> média. Os valores são homogêneos e a média representa bem o "centro".</p>
        <p><strong>Tamanho de roupa mais vendido:</strong> moda. O varejista quer saber qual tamanho pedir mais — não a média ou mediana dos tamanhos.</p>
        <p><strong>Soma das dezenas na Lotofácil:</strong> média e mediana são quase iguais (~210), pois a distribuição é simétrica. A tabela de soma do LotoAnalítica mostra exatamente isso.</p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Média é fácil de calcular mas sensível a outliers — um valor extremo distorce tudo.</li>
            <li>Mediana representa o "centro real" quando há valores muito diferentes no conjunto.</li>
            <li>Moda diz qual valor é mais comum — útil para categorias e decisões de estoque.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
