"use client";

import { useState, useMemo } from "react";

export function SimuladorRegressao() {
  const [notaProva1, setNotaProva1] = useState(95);
  const media = 70;
  const correlacao = 0.5; // quanto da nota é "habilidade" vs "sorte do dia"

  const notaEsperadaProva2 = useMemo(() => {
    const desvio = notaProva1 - media;
    return media + desvio * correlacao;
  }, [notaProva1]);

  const desvioOriginal = notaProva1 - media;
  const desvioNovo = notaEsperadaProva2 - media;
  const percentualQueSobrou = desvioOriginal !== 0 ? Math.round((desvioNovo / desvioOriginal) * 100) : 100;

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🎯 Nota na Prova 1 → nota esperada na Prova 2</p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>Nota na Prova 1 (média da turma: {media})</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={20} max={100} value={notaProva1}
              onChange={e => setNotaProva1(+e.target.value)} />
            <span className="mat-interativo__valor">{notaProva1}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 24, margin: "16px 0", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-faint)" }}>Prova 1</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.6rem", fontWeight: 700, color: "var(--rust)" }}>{notaProva1}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", color: "var(--ink-faint)" }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-faint)" }}>Prova 2 (esperada)</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.6rem", fontWeight: 700, color: "var(--ochre)" }}>{notaEsperadaProva2.toFixed(0)}</div>
        </div>
      </div>

      <div className="mat-interativo__resultado">
        <div className="mat-resultado-numero">{Math.abs(percentualQueSobrou)}% do desvio</div>
        <div className="mat-resultado-desc">da distância até a média que se mantém na próxima prova</div>
        <div className="mat-resultado-extra">
          {notaProva1 > media
            ? "Quem tira uma nota muito acima da média tende a 'cair' na próxima — não porque ficou pior, mas porque parte daquela nota foi sorte do dia"
            : notaProva1 < media
            ? "Quem tira uma nota muito abaixo da média tende a 'subir' na próxima — não porque melhorou de repente, mas pelo mesmo motivo"
            : "Na média exata, não há regressão a esperar — já está no centro"}
        </div>
      </div>
    </div>
  );
}
