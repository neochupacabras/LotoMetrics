"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import Masthead from "@/components/Masthead";

function SimuladorSalarios() {
  const [funcionarios, setFuncionarios] = useState([3000, 3200, 2800, 4000, 3500, 3100, 2900, 150000]);

  const sorted = useMemo(() => [...funcionarios].sort((a, b) => a - b), [funcionarios]);
  const media = funcionarios.reduce((a, b) => a + b, 0) / funcionarios.length;
  const mediana = funcionarios.length % 2 === 0
    ? (sorted[funcionarios.length / 2 - 1] + sorted[funcionarios.length / 2]) / 2
    : sorted[Math.floor(funcionarios.length / 2)];
  const mapa = new Map<number, number>();
  funcionarios.forEach(v => mapa.set(v, (mapa.get(v) ?? 0) + 1));
  const moda = [...mapa.entries()].sort((a, b) => b[1] - a[1])[0][0];

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">📏 Uma empresa com 8 funcionários</p>
      <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginBottom: 12 }}>
        7 funcionários ganham entre R$2.800 e R$4.000. O dono ganha R$150.000.
        Observe como cada medida se comporta.
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
        {[
          { label: "Média", valor: fmt(media), desc: "puxa para cima pelo salário do dono", cor: "var(--rust)" },
          { label: "Mediana", valor: fmt(mediana), desc: "valor do meio — ignora extremos", cor: "var(--pine)" },
          { label: "Moda", valor: fmt(moda), desc: "valor mais frequente", cor: "var(--ochre)" },
        ].map(item => (
          <div key={item.label} style={{ textAlign: "center", minWidth: 160 }}>
            <div style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-faint)", marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: item.cor }}>{item.valor}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--ink-soft)", maxWidth: 160, margin: "4px auto 0" }}>{item.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
        {sorted.map((s, i) => (
          <div key={i} style={{
            padding: "6px 10px", borderRadius: 4, fontFamily: "var(--font-mono)", fontSize: "0.82rem",
            background: s > 10000 ? "color-mix(in srgb, var(--rust) 15%, transparent)" : "color-mix(in srgb, var(--pine) 10%, transparent)",
            border: `1px solid ${s > 10000 ? "var(--rust)" : "var(--pine)"}`,
            color: s > 10000 ? "var(--rust)" : "var(--pine)",
          }}>
            {fmt(s)}
          </div>
        ))}
      </div>
    </div>
  );
}

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
