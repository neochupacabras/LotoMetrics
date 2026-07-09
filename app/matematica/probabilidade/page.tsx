import Link from "next/link";
import { useState, useCallback } from "react";
import Masthead from "@/components/Masthead";
import { SimuladorMoeda } from "./ConteudoClient";
export default function ArtigoProbabilidadePage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow">
          <Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link>
        </p>
        <div className="mat-artigo-header mat-artigo-header--ochre">
          <span className="mat-artigo-emoji">🎲</span>
          <div>
            <p className="mat-artigo-conceito">Probabilidade clássica e frequentista</p>
            <h1 className="titulo-edicao">Probabilidade</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">
          O que significa "50% de chance" — e por que jogar cara ou coroa 10 vezes
          sem sair nenhuma coroa não significa que a próxima vai ser coroa.
        </p>

        <SimuladorMoeda />

        <h2 className="mat-h2">O que é probabilidade, de verdade?</h2>
        <p>
          Probabilidade é uma forma de medir <strong>incerteza</strong>. Quando
          dizemos que uma moeda justa tem 50% de chance de dar cara, estamos
          dizendo que, em muitos lançamentos, esperamos que metade seja cara.
        </p>
        <p>
          Existem duas formas de pensar nisso:
        </p>
        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📐 Duas definições de probabilidade</p>
          <p>
            <strong>Clássica (teórica):</strong> P(evento) = casos favoráveis ÷ casos possíveis.
            Uma moeda tem 1 face cara de 2 faces totais → P(cara) = 1/2 = 50%.
            Funciona quando todos os resultados são igualmente prováveis.
          </p>
          <p style={{ marginTop: 8 }}>
            <strong>Frequentista (empírica):</strong> P(evento) ≈ vezes que aconteceu ÷ total de tentativas.
            Você lança a moeda 1.000 vezes e conta quantas foram cara.
            Funciona para estimar probabilidades quando não sabemos a teoria.
          </p>
        </div>

        <h2 className="mat-h2">A moeda não tem memória</h2>
        <p>
          Você lançou uma moeda 10 vezes e saiu cara todas as vezes. Qual é a
          probabilidade de sair coroa no 11º lançamento?
        </p>
        <p>
          Resposta: <strong>50%</strong>. Exatamente a mesma de sempre.
        </p>
        <p>
          A moeda não sabe que saiu cara 10 vezes seguidas. Ela não tem memória.
          Cada lançamento é um evento independente — o resultado anterior não
          influencia o próximo. Isso tem um nome: <strong>independência de eventos</strong>.
        </p>
        <div className="mat-box mat-box--rust">
          <p className="mat-box__titulo">⚠️ Falácia do apostador</p>
          <p>
            Acreditar que "coroa está devendo" depois de muitas caras seguidas é
            a <strong>falácia do apostador</strong> — um dos erros mais comuns
            em probabilidade. A moeda não tem conta para acertar.
          </p>
          <p style={{ marginTop: 8 }}>
            Na Lotofácil, a dezena 17 não tem mais chance de sair por não ter
            saído nos últimos 30 concursos. O sorteio é independente de tudo
            que aconteceu antes.
          </p>
        </div>

        <h2 className="mat-h2">Probabilidade não é certeza</h2>
        <p>
          "70% de chance de chuva" não significa que vai chover 70% do dia.
          Significa que, em situações meteorológicas idênticas a essa, choveu
          em 70 de cada 100 casos históricos.
        </p>
        <p>
          Probabilidade descreve o <em>longo prazo</em>. Em eventos únicos,
          ela apenas quantifica nossa incerteza — 70% quer dizer "mais provável
          que sim do que não", nada mais.
        </p>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>P(evento) = casos favoráveis ÷ casos possíveis (quando tudo é igualmente provável).</li>
            <li>Eventos independentes não se influenciam — a moeda não tem memória.</li>
            <li>Probabilidade descreve o longo prazo, não garante nada num evento único.</li>
          </ol>
        </div>

        <p style={{ marginTop: 24 }}>
          <Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link>
        </p>
      </main>
    </>
  );
}
