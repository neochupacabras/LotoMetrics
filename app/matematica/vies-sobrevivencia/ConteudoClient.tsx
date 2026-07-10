"use client";

import { useState, useMemo } from "react";

export function SimuladorSobrevivencia() {
  const [totalJogadores, setTotalJogadores] = useState(1_000_000);

  const resultado = useMemo(() => {
    const chanceGanhar = 1 / 3_268_760; // faixa principal Lotofácil, aposta mínima
    const ganhadoresEsperados = totalJogadores * chanceGanhar;
    const visiveis = Math.max(1, Math.round(ganhadoresEsperados));
    const invisiveis = totalJogadores - visiveis;
    return { visiveis, invisiveis };
  }, [totalJogadores]);

  const pctVisivel = (resultado.visiveis / totalJogadores) * 100;

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">✈️ Quantas pessoas você "veria" ganhar?</p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>Pessoas que jogaram as mesmas 15 dezenas</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={100_000} max={5_000_000} step={100_000} value={totalJogadores}
              onChange={e => setTotalJogadores(+e.target.value)} />
            <span className="mat-interativo__valor">{totalJogadores.toLocaleString("pt-BR")}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", height: 28, borderRadius: 6, overflow: "hidden", margin: "16px 0", border: "1px solid var(--line)" }}>
        <div style={{ width: `${Math.max(pctVisivel, 0.3)}%`, background: "var(--pine)" }} title="Ganhadores (visíveis)" />
        <div style={{ flex: 1, background: "var(--rust)", opacity: 0.35 }} title="Não ganhadores (invisíveis nas manchetes)" />
      </div>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", fontSize: "0.78rem", color: "var(--ink-soft)" }}>
        <span>🟢 Aparecem no noticiário</span>
        <span>🟥 Nunca viram notícia nenhuma</span>
      </div>

      <div className="mat-interativo__resultado">
        <div className="mat-resultado-numero">{resultado.visiveis.toLocaleString("pt-BR")} visíveis</div>
        <div className="mat-resultado-desc">contra {resultado.invisiveis.toLocaleString("pt-BR")} que você nunca vai ouvir falar</div>
        <div className="mat-resultado-extra">
          A história de quem ganhou é sempre contada. A de quem não ganhou nunca vira notícia — mas ela é a esmagadora maioria.
        </div>
      </div>
    </div>
  );
}
