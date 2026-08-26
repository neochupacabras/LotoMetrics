"use client";

import { useMemo, useState } from "react";
import { formatarDezena } from "@/lib/format";

interface Props {
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenasSorteadas: number;
  frequenciaReal: { dezena: number; frequencia: number }[];
}

function sortearUmConcurso(min: number, max: number, qtd: number): number[] {
  const universo: number[] = [];
  for (let i = min; i <= max; i++) universo.push(i);
  const sorteadas: number[] = [];
  for (let i = 0; i < qtd; i++) {
    const idx = Math.floor(Math.random() * universo.length);
    sorteadas.push(universo[idx]);
    universo.splice(idx, 1);
  }
  return sorteadas;
}

export function SimuladorFrequenciaAleatoria({
  dezenaMin,
  dezenaMax,
  qtdDezenasSorteadas,
  frequenciaReal,
}: Props) {
  const [qtdSimulacoes, setQtdSimulacoes] = useState(1000);
  const [contagem, setContagem] = useState<Record<number, number> | null>(null);
  const [rodando, setRodando] = useState(false);

  const totalReal = useMemo(
    () => frequenciaReal.reduce((s, d) => s + d.frequencia, 0),
    [frequenciaReal]
  );

  function simular() {
    setRodando(true);
    setTimeout(() => {
      const tally: Record<number, number> = {};
      for (let d = dezenaMin; d <= dezenaMax; d++) tally[d] = 0;
      for (let i = 0; i < qtdSimulacoes; i++) {
        const sorteio = sortearUmConcurso(dezenaMin, dezenaMax, qtdDezenasSorteadas);
        sorteio.forEach((d) => { tally[d]++; });
      }
      setContagem(tally);
      setRodando(false);
    }, 10);
  }

  const totalSimulado = qtdSimulacoes * qtdDezenasSorteadas;

  // Compara top 5 do real com o mesmo conjunto no simulado
  const top5Real = [...frequenciaReal].sort((a, b) => b.frequencia - a.frequencia).slice(0, 5);

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">O padrão real é diferente de um sorteio aleatório?</p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>Concursos aleatórios a simular</label>
          <div className="mat-interativo__slider-wrap">
            <input
              type="range" min={100} max={5000} step={100}
              value={qtdSimulacoes}
              onChange={(e) => setQtdSimulacoes(+e.target.value)}
            />
            <span className="mat-interativo__valor">{qtdSimulacoes.toLocaleString("pt-BR")}</span>
          </div>
        </div>
      </div>

      <button type="button" className="botao-copiar" onClick={simular} disabled={rodando} style={{ fontSize: "0.82rem", marginTop: 4 }}>
        {rodando ? "Simulando…" : "Simular sorteios aleatórios"}
      </button>

      {contagem && (
        <div className="mat-interativo__resultado" style={{ marginTop: 16 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--ink-soft)", marginBottom: 10 }}>
            Comparando as 5 dezenas mais frequentes no histórico real (concursos: {Math.round(totalReal / qtdDezenasSorteadas).toLocaleString("pt-BR")}) com a mesma dezena nesta simulação aleatória:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {top5Real.map((d) => {
              const pctReal = (d.frequencia / totalReal) * 100;
              const pctSimulado = ((contagem[d.dezena] ?? 0) / totalSimulado) * 100;
              return (
                <div key={d.dezena} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem" }}>
                  <span style={{ fontFamily: "var(--font-mono)", width: 32, flexShrink: 0 }}>{formatarDezena(d.dezena)}</span>
                  <span style={{ color: "var(--pine)", width: 90, flexShrink: 0 }}>real: {pctReal.toFixed(2)}%</span>
                  <span style={{ color: "var(--rust)" }}>simulado: {pctSimulado.toFixed(2)}%</span>
                </div>
              );
            })}
          </div>
          <div className="mat-resultado-extra" style={{ marginTop: 12 }}>
            Repare como os percentuais ficam próximos — a leve diferença nas dezenas "mais frequentes" do histórico real é o tipo de variação natural que também aparece numa simulação puramente aleatória, não sinal de que essas dezenas sejam favorecidas.
          </div>
        </div>
      )}
    </div>
  );
}
