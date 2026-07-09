"use client";
import Link from "next/link";
import { useState, useCallback } from "react";
import Masthead from "@/components/Masthead";

function SimuladorLGN() {
  const [resultados, setResultados] = useState<number[]>([]);
  const [rodando, setRodando] = useState(false);

  const simular = useCallback(async (total: number) => {
    setRodando(true);
    setResultados([]);
    const lote = 50;
    let soma = 0;
    const novos: number[] = [];
    for (let i = 0; i < total; i += lote) {
      const ate = Math.min(i + lote, total);
      for (let j = i; j < ate; j++) {
        soma += Math.random() < 1/6 ? 1 : 0;
        if (j % Math.max(1, Math.floor(total/40)) === 0 || j === total - 1) {
          novos.push(soma / (j + 1));
        }
      }
      setResultados([...novos]);
      await new Promise(r => setTimeout(r, 10));
    }
    setRodando(false);
  }, []);

  const ultimo = resultados[resultados.length - 1];
  const pct = ultimo !== undefined ? (ultimo * 100).toFixed(2) : "—";

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🎲 Dado honesto — frequência do número 1</p>
      <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginBottom: 14 }}>
        A chance teórica de sair 1 num dado é 1/6 ≈ 16,67%. Veja como a frequência
        real converge para esse valor conforme o número de lançamentos aumenta.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {[100, 1000, 10000, 100000].map(n => (
          <button key={n} type="button" className="botao-copiar"
            onClick={() => simular(n)} disabled={rodando}
            style={{ fontSize: "0.82rem" }}>
            {n.toLocaleString("pt-BR")} lançamentos
          </button>
        ))}
      </div>
      {resultados.length > 0 && (
        <>
          <div style={{ position: "relative", height: 120, background: "color-mix(in srgb, var(--pine) 5%, transparent)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
            {/* Linha de referência 1/6 */}
            <div style={{ position: "absolute", left: 0, right: 0, top: `${(1 - 1/6) * 100}%`, borderTop: "2px dashed var(--pine)", opacity: 0.5 }} />
            <div style={{ position: "absolute", right: 8, top: `${(1 - 1/6) * 100}%`, transform: "translateY(-14px)", fontSize: "0.7rem", color: "var(--pine)", fontFamily: "var(--font-mono)" }}>16,67%</div>
            {/* Linha do histórico */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="none" viewBox={`0 0 ${resultados.length} 1`}>
              <polyline
                points={resultados.map((v, i) => `${i},${1 - v}`).join(" ")}
                fill="none" stroke="var(--rust)" strokeWidth="0.015"
              />
            </svg>
          </div>
          <div className="mat-interativo__resultado">
            <div className="mat-resultado-numero" style={{ color: Math.abs((ultimo ?? 0) - 1/6) < 0.01 ? "var(--pine)" : "var(--ochre)" }}>
              {pct}%
            </div>
            <div className="mat-resultado-desc">frequência do 1 (esperado: 16,67%)</div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ArtigoLGNPage() {
  return (
    <>
      <Masthead matematicaAtiva />
      <main className="container secao" style={{ maxWidth: 760 }}>
        <p className="eyebrow"><Link href="/matematica" className="breadcrumb">← Matemática sem mistério</Link></p>
        <div className="mat-artigo-header mat-artigo-header--pine">
          <span className="mat-artigo-emoji">📊</span>
          <div>
            <p className="mat-artigo-conceito">Convergência e grandes amostras</p>
            <h1 className="titulo-edicao">Lei dos Grandes Números</h1>
          </div>
        </div>
        <p className="subtitulo-edicao">Por que o McDonald's sabe quantos hambúrgueres vender amanhã — mas você não sabe o que vai querer almoçar.</p>

        <SimuladorLGN />

        <h2 className="mat-h2">O que diz a lei</h2>
        <p>A Lei dos Grandes Números diz que, conforme o número de tentativas aumenta, a frequência observada se aproxima cada vez mais da probabilidade teórica. Com 10 lançamentos de dado, sair 1 em 20% ou 10% é normal — variação esperada. Com 100.000 lançamentos, a frequência vai estar muito próxima de 16,67%.</p>
        <div className="mat-box mat-box--pine">
          <p className="mat-box__titulo">📐 A lei formal</p>
          <p>Se X₁, X₂, ... são variáveis aleatórias independentes e identicamente distribuídas com esperança μ, então a média amostral (X₁ + X₂ + ... + Xₙ) / n converge para μ conforme n → ∞.</p>
          <p style={{ marginTop: 8 }}>Em português: tire a média de muitas tentativas e ela vai se aproximar do valor esperado.</p>
        </div>

        <h2 className="mat-h2">Por que o McDonald's sabe, e você não</h2>
        <p>Você, individualmente, é imprevisível. Às vezes quer pizza, às vezes salada. Mas o McDonald's serve milhões de pessoas por dia — e com números tão grandes, a média se estabiliza. Eles sabem com precisão razoável quantos Big Macs vão vender na próxima sexta à noite num restaurante específico, porque já viram esse padrão se repetir milhares de vezes.</p>
        <p>É o mesmo princípio que faz seguradoras funcionarem: ninguém sabe se você vai bater o carro esse ano, mas a seguradora sabe com precisão que X% da frota vai acionar o seguro — e cobra o prêmio baseada nisso.</p>

        <h2 className="mat-h2">A confusão mais comum</h2>
        <p>A LGN <strong>não</strong> diz que os desvios se cancelam. Se você jogar cara 10 vezes seguidas, a LGN não diz que virão 10 coroas para "compensar" — ela diz que 10 caras vão se tornar irrelevantes quando você tiver 100.000 lançamentos no total.</p>
        <div className="mat-box mat-box--rust">
          <p className="mat-box__titulo">⚠️ LGN e loteria</p>
          <p>A Lei dos Grandes Números garante que, em milhares de sorteios, cada dezena vai aparecer aproximadamente com a mesma frequência. Mas não diz <em>quando</em> uma dezena atrasada vai sair — só que eventualmente vai convergir. Um número que não saiu em 50 concursos não está "devendo".</p>
        </div>

        <div className="mat-resumo">
          <p className="mat-resumo__titulo">Resumindo em 3 pontos</p>
          <ol className="mat-resumo__lista">
            <li>Com poucos eventos, os resultados são imprevisíveis. Com muitos, a média converge.</li>
            <li>É a base de seguros, controle de qualidade industrial e previsão de demanda.</li>
            <li>Não cancela desvios passados — só os dilui numa amostra grande.</li>
          </ol>
        </div>
        <p style={{ marginTop: 24 }}><Link href="/matematica" className="breadcrumb">← Voltar para Matemática sem mistério</Link></p>
      </main>
    </>
  );
}
