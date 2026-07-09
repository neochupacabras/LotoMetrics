"use client";
import { useState, useCallback } from "react";

export function TesteAleatoriedade() {
  const [sequencia, setSequencia] = useState<number[]>([]);
  const [modo, setModo] = useState<"humano" | "computador">("humano");
  const [analisando, setAnalisando] = useState(false);

  const addNum = useCallback((n: number) => {
    setSequencia(prev => [...prev.slice(-49), n]);
  }, []);

  const gerarComputador = useCallback(() => {
    setAnalisando(true);
    const nova = Array.from({ length: 50 }, () => Math.floor(Math.random() * 10));
    setSequencia(nova);
    setTimeout(() => setAnalisando(false), 300);
  }, []);

  // Análise de viés humano: humanos evitam repetições
  const repeticoes = sequencia.filter((n, i) => i > 0 && n === sequencia[i - 1]).length;
  const totalPares = sequencia.length - 1;
  const pctRep = totalPares > 0 ? (repeticoes / totalPares * 100).toFixed(1) : "—";
  const esperadoRep = 10; // com 10 dígitos, 10% de chance de repetir

  // Contagem de frequência
  const freq = Array.from({ length: 10 }, (_, i) =>
    sequencia.filter(n => n === i).length
  );
  const maxFreq = Math.max(...freq, 1);

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🎰 Você consegue ser aleatório?</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button type="button"
          className={modo === "humano" ? "botao-gerar" : "botao-copiar"}
          onClick={() => { setModo("humano"); setSequencia([]); }}
          style={{ fontSize: "0.85rem" }}>
          ✋ Modo humano
        </button>
        <button type="button"
          className={modo === "computador" ? "botao-gerar" : "botao-copiar"}
          onClick={() => { setModo("computador"); gerarComputador(); }}
          style={{ fontSize: "0.85rem" }}>
          💻 Gerar com computador
        </button>
      </div>

      {modo === "humano" && (
        <>
          <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)", marginBottom: 10 }}>
            Clique nos botões abaixo na ordem que parecer mais aleatória possível ({sequencia.length}/50):
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {Array.from({ length: 10 }, (_, i) => (
              <button key={i} type="button"
                onClick={() => addNum(i)}
                disabled={sequencia.length >= 50}
                style={{
                  width: 44, height: 44, borderRadius: 6,
                  border: "2px solid var(--pine)", background: "transparent",
                  fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-mono)",
                  color: "var(--pine)", cursor: "pointer",
                }}>
                {i}
              </button>
            ))}
            <button type="button" className="botao-copiar"
              onClick={() => setSequencia([])} style={{ fontSize: "0.82rem" }}>
              Limpar
            </button>
          </div>
        </>
      )}

      {sequencia.length > 0 && (
        <>
          {/* Sequência visual */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 16 }}>
            {sequencia.map((n, i) => (
              <span key={i} style={{
                width: 22, height: 22, borderRadius: 3, display: "inline-flex",
                alignItems: "center", justifyContent: "center",
                background: n === sequencia[i-1] ? "var(--rust)" : "var(--pine)",
                color: "#fff", fontSize: "0.68rem", fontFamily: "var(--font-mono)", fontWeight: 700,
              }}>
                {n}
              </span>
            ))}
          </div>

          {/* Histograma de frequência */}
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 60, marginBottom: 8 }}>
            {freq.map((f, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ width: "100%", height: `${(f / maxFreq) * 50}px`, background: "var(--pine)", opacity: 0.7, borderRadius: "2px 2px 0 0" }} />
                <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>{i}</span>
              </div>
            ))}
          </div>

          <div className="mat-interativo__resultado">
            <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div className="mat-resultado-numero" style={{ fontSize: "1.6rem",
                  color: Math.abs(+pctRep - esperadoRep) < 5 ? "var(--pine)" : "var(--rust)" }}>
                  {pctRep}%
                </div>
                <div className="mat-resultado-desc">repetições consecutivas</div>
                <div style={{ fontSize: "0.72rem", color: "var(--ink-faint)", marginTop: 2 }}>esperado: ~{esperadoRep}%</div>
              </div>
            </div>
            {sequencia.length >= 20 && (
              <div className="mat-resultado-extra" style={{ marginTop: 10 }}>
                {+pctRep < 5
                  ? "⚠️ Poucas repetições — humanos evitam repetir o mesmo número!"
                  : +pctRep > 18
                  ? "⚠️ Muitas repetições para o esperado."
                  : "✓ Distribuição próxima do aleatório verdadeiro."}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
