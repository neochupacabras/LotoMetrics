"use client";
import { useMemo, useState } from "react";

const BENFORD = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => ({
  digito: d,
  esperado: Math.log10(1 + 1 / d) * 100,
}));

// Conjuntos de exemplo — frequência real (aproximada) do 1º dígito
const CONJUNTOS = {
  populacao: {
    label: "População de países",
    frequencias: [30.1, 17.6, 12.9, 9.6, 8.0, 6.6, 5.8, 5.1, 4.3],
  },
  potencias2: {
    label: "Potências de 2 (2¹, 2², 2³...)",
    frequencias: [30.5, 17.5, 12.5, 9.8, 7.8, 6.8, 5.6, 5.0, 4.5],
  },
  aleatorioUniforme: {
    label: "Números aleatórios uniformes (1-999)",
    frequencias: [11.1, 11.1, 11.1, 11.1, 11.1, 11.1, 11.1, 11.1, 11.2],
  },
};

type Conjunto = keyof typeof CONJUNTOS;

export function VisualizadorBenford() {
  const [conjunto, setConjunto] = useState<Conjunto>("populacao");
  const dados = CONJUNTOS[conjunto];

  const maxValor = 32;

  const desvioMedio = useMemo(() => {
    const diffs = BENFORD.map((b, i) => Math.abs(b.esperado - dados.frequencias[i]));
    return diffs.reduce((s, v) => s + v, 0) / diffs.length;
  }, [dados]);

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🕵️ Frequência do primeiro dígito</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {(Object.keys(CONJUNTOS) as Conjunto[]).map(k => (
          <button
            key={k}
            type="button"
            onClick={() => setConjunto(k)}
            className="botao-copiar"
            style={{
              fontSize: "0.78rem",
              background: conjunto === k ? "var(--pine)" : undefined,
              color: conjunto === k ? "var(--paper)" : undefined,
            }}
          >
            {CONJUNTOS[k].label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 140, padding: "0 4px" }}>
        {BENFORD.map((b, i) => {
          const real = dados.frequencias[i];
          const hEsperado = (b.esperado / maxValor) * 100;
          const hReal = (real / maxValor) * 100;
          return (
            <div key={b.digito} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ position: "relative", width: "100%", height: 110, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 2 }}>
                <div style={{ width: "45%", height: `${hReal}%`, background: "var(--pine)", borderRadius: "2px 2px 0 0" }} title={`Real: ${real.toFixed(1)}%`} />
                <div style={{ width: "45%", height: `${hEsperado}%`, background: "var(--ochre)", opacity: 0.6, borderRadius: "2px 2px 0 0" }} title={`Benford: ${b.esperado.toFixed(1)}%`} />
              </div>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>{b.digito}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", fontSize: "0.78rem", color: "var(--ink-soft)", marginTop: 8 }}>
        <span>🟢 Frequência real</span>
        <span>🟡 Previsto pela Lei de Benford</span>
      </div>

      <div className="mat-interativo__resultado">
        <div className="mat-resultado-numero" style={{ fontSize: "1.6rem" }}>
          {desvioMedio < 1.5 ? "Segue Benford ✓" : "Não segue Benford"}
        </div>
        <div className="mat-resultado-extra">
          Desvio médio de {desvioMedio.toFixed(2)} pontos percentuais em relação à curva prevista
        </div>
      </div>
    </div>
  );
}
