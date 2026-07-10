"use client";
import { useState, useMemo } from "react";

function fmtBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 4 });
}

const EXEMPLOS = [
  { label: "Mega-Sena (sena)", custo: 6, premio: 50_000_000, umEm: 50_063_860 },
  { label: "Lotofácil (15 pontos)", custo: 3.5, premio: 1_500_000, umEm: 3_268_760 },
  { label: "Aposta com amigo 50/50", custo: 20, premio: 40, umEm: 2 },
];

export function CalcValorEsperado() {
  const [custo, setCusto] = useState("6");
  const [premio, setPremio] = useState("50000000");
  const [umEm, setUmEm] = useState("50063860");

  const vCusto = parseFloat(custo.replace(",", ".")) || 0;
  const vPremio = parseFloat(premio.replace(",", ".")) || 0;
  const vUmEm = parseFloat(umEm.replace(",", ".")) || 1;

  const { probabilidade, valorEsperado, evLiquido, retornoPorReal } = useMemo(() => {
    const p = 1 / vUmEm;
    const ve = p * vPremio;
    const evL = ve - vCusto;
    const rpr = vCusto > 0 ? ve / vCusto : 0;
    return { probabilidade: p, valorEsperado: ve, evLiquido: evL, retornoPorReal: rpr };
  }, [vCusto, vPremio, vUmEm]);

  function aplicarExemplo(ex: typeof EXEMPLOS[number]) {
    setCusto(String(ex.custo));
    setPremio(String(ex.premio));
    setUmEm(String(ex.umEm));
  }

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div className="calc-campos">
          <div className="calc-campo">
            <label>Custo da aposta (R$)</label>
            <input className="calc-input calc-input--destaque" type="text" inputMode="decimal" value={custo} onChange={e => setCusto(e.target.value)} />
          </div>
          <div className="calc-campo">
            <label>Prêmio, se ganhar (R$)</label>
            <input className="calc-input calc-input--destaque" type="text" inputMode="decimal" value={premio} onChange={e => setPremio(e.target.value)} />
          </div>
        </div>
        <div className="calc-campo">
          <label>Probabilidade — 1 em quantos</label>
          <input className="calc-input calc-input--destaque" type="text" inputMode="decimal" value={umEm} onChange={e => setUmEm(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          {EXEMPLOS.map(ex => (
            <button key={ex.label} type="button" className="botao-copiar" onClick={() => aplicarExemplo(ex)} style={{ fontSize: "0.78rem" }}>
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="calc-painel__resultado calc-painel__resultado--ochre">
        <div className="calc-resultado-label">Valor esperado da aposta</div>
        <div className="calc-resultado-numero calc-resultado-numero--ochre">{fmtBRL(valorEsperado)}</div>
        <div className="calc-resultado-extra">
          {evLiquido < 0
            ? `Em média, você perde ${fmtBRL(Math.abs(evLiquido))} a cada aposta dessas`
            : `Em média, você ganha ${fmtBRL(evLiquido)} a cada aposta dessas`}
        </div>
        <div className="calc-metricas" style={{ marginTop: 16 }}>
          <div className="calc-metrica"><div className="calc-metrica__valor">{(probabilidade * 100).toFixed(8)}%</div><div className="calc-metrica__label">Probabilidade</div></div>
          <div className="calc-metrica"><div className="calc-metrica__valor" style={{ color: evLiquido < 0 ? "var(--rust)" : "var(--pine)" }}>{fmtBRL(evLiquido)}</div><div className="calc-metrica__label">Valor esperado líquido</div></div>
          <div className="calc-metrica"><div className="calc-metrica__valor">{(retornoPorReal * 100).toFixed(1)}%</div><div className="calc-metrica__label">Retorno por real gasto</div></div>
        </div>
      </div>
    </div>
  );
}
