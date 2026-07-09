"use client";
import { useState } from "react";

type Escolha = "cooperar" | "trair";

const PAYOFF: Record<string, Record<string, [number, number]>> = {
  cooperar: { cooperar: [3, 3], trair: [0, 5] },
  trair:    { cooperar: [5, 0], trair: [1, 1] },
};

export function DilemaJogavel() {
  const [minhaEscolha, setMinhaEscolha] = useState<Escolha | null>(null);
  const [computadorEscolha, setComputadorEscolha] = useState<Escolha | null>(null);
  const [placarMeu, setPlacarMeu] = useState(0);
  const [placarComp, setPlacarComp] = useState(0);
  const [rodadas, setRodadas] = useState(0);
  const [historico, setHistorico] = useState<Array<[Escolha, Escolha]>>([]);

  // Computador usa estratégia "tit-for-tat": coopera na 1ª rodada, depois copia a última jogada do humano
  function jogar(minha: Escolha) {
    const comp: Escolha = rodadas === 0 ? "cooperar"
      : historico[historico.length - 1][0] === "cooperar" ? "cooperar" : "trair";

    const [ganhoMeu, ganhoComp] = PAYOFF[minha][comp];
    setMinhaEscolha(minha);
    setComputadorEscolha(comp);
    setPlacarMeu(p => p + ganhoMeu);
    setPlacarComp(p => p + ganhoComp);
    setRodadas(r => r + 1);
    setHistorico(h => [...h, [minha, comp]]);
  }

  function reiniciar() {
    setMinhaEscolha(null); setComputadorEscolha(null);
    setPlacarMeu(0); setPlacarComp(0);
    setRodadas(0); setHistorico([]);
  }

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🎯 Dilema do prisioneiro — jogue contra o computador</p>
      <p style={{ fontSize: "0.82rem", color: "var(--ink-soft)", marginBottom: 14 }}>
        Você e o computador escolhem simultaneamente. A matriz de payoff:
      </p>
      <div className="tabela-scroll" style={{ marginBottom: 16 }}>
        <table className="tabela-dados" style={{ fontSize: "0.82rem" }}>
          <thead>
            <tr><th></th><th className="num">Comp. coopera</th><th className="num">Comp. trai</th></tr>
          </thead>
          <tbody>
            <tr><td>Você coopera</td><td className="num" style={{ color: "var(--pine)", fontWeight: 700 }}>Você 3 / Comp 3</td><td className="num" style={{ color: "var(--rust)" }}>Você 0 / Comp 5</td></tr>
            <tr><td>Você trai</td><td className="num" style={{ color: "var(--rust)" }}>Você 5 / Comp 0</td><td className="num" style={{ color: "var(--ochre)" }}>Você 1 / Comp 1</td></tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
        <button type="button" className="botao-gerar"
          onClick={() => jogar("cooperar")} style={{ background: "var(--pine)", borderColor: "var(--pine)" }}>
          🤝 Cooperar
        </button>
        <button type="button" className="botao-gerar"
          onClick={() => jogar("trair")} style={{ background: "var(--rust)", borderColor: "var(--rust)" }}>
          🗡️ Trair
        </button>
        {rodadas > 0 && (
          <button type="button" className="botao-copiar" onClick={reiniciar}>
            Reiniciar
          </button>
        )}
      </div>

      {minhaEscolha && computadorEscolha && (
        <div className="mat-interativo__resultado">
          <p style={{ marginBottom: 8, fontSize: "0.9rem" }}>
            Rodada {rodadas}: Você <strong>{minhaEscolha}</strong> / Computador <strong>{computadorEscolha}</strong>
          </p>
          <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div className="mat-resultado-numero" style={{ color: "var(--pine)" }}>{placarMeu}</div>
              <div className="mat-resultado-desc">seu placar</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="mat-resultado-numero" style={{ color: "var(--rust)" }}>{placarComp}</div>
              <div className="mat-resultado-desc">computador</div>
            </div>
          </div>
          {rodadas >= 5 && (
            <div className="mat-resultado-extra" style={{ marginTop: 10 }}>
              O computador usa Tit-for-Tat: coopera se você cooperou na rodada anterior.
              {placarMeu > placarComp ? " Você está ganhando — cooperação funciona!" :
               placarComp > placarMeu ? " O computador está ganhando — tente cooperar mais." :
               " Empate — o jogo está equilibrado."}
            </div>
          )}
        </div>
      )}

      {historico.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", gap: 4, flexWrap: "wrap" }}>
          {historico.map(([m, c], i) => (
            <div key={i} title={`R${i+1}: você ${m} / comp ${c}`}
              style={{ width: 20, height: 20, borderRadius: 3, fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center",
                background: m === "cooperar" && c === "cooperar" ? "var(--pine)" :
                            m === "trair" && c === "trair" ? "var(--rust)" : "var(--ochre)",
                color: "#fff", opacity: 0.85 }}>
              {m === c ? "=" : m === "trair" ? "↑" : "↓"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
