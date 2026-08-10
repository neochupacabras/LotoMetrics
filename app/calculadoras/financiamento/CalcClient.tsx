"use client";
import { useState, useMemo } from "react";

function fmtBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CalcFinanciamento() {
  const [sistema, setSistema] = useState<"price" | "sac">("price");
  const [valor, setValor] = useState("300000");
  const [taxa, setTaxa] = useState("0,95");
  const [parcelas, setParcelas] = useState("360");

  const pv = parseFloat(valor.replace(",", ".")) || 0;
  const i = (parseFloat(taxa.replace(",", ".")) || 0) / 100;
  const n = Math.max(1, Math.min(600, parseInt(parcelas) || 1));

  const resultado = useMemo(() => {
    if (pv <= 0 || n <= 0) return null;

    if (sistema === "price") {
      const pmt = i === 0 ? pv / n : (pv * i) / (1 - Math.pow(1 + i, -n));
      const totalPago = pmt * n;
      const totalJuros = totalPago - pv;
      return {
        primeiraParcela: pmt,
        ultimaParcela: pmt,
        totalPago,
        totalJuros,
      };
    } else {
      const amortizacao = pv / n;
      let saldo = pv;
      let totalPago = 0;
      let primeiraParcela = 0;
      let ultimaParcela = 0;
      for (let k = 1; k <= n; k++) {
        const jurosDaParcela = saldo * i;
        const parcela = amortizacao + jurosDaParcela;
        if (k === 1) primeiraParcela = parcela;
        if (k === n) ultimaParcela = parcela;
        totalPago += parcela;
        saldo -= amortizacao;
      }
      const totalJuros = totalPago - pv;
      return { primeiraParcela, ultimaParcela, totalPago, totalJuros };
    }
  }, [pv, i, n, sistema]);

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button type="button" className="botao-copiar" onClick={() => setSistema("price")}
            style={{ background: sistema === "price" ? "var(--pine)" : undefined, color: sistema === "price" ? "var(--paper)" : undefined, fontSize: "0.85rem" }}>
            Price (parcelas fixas)
          </button>
          <button type="button" className="botao-copiar" onClick={() => setSistema("sac")}
            style={{ background: sistema === "sac" ? "var(--pine)" : undefined, color: sistema === "sac" ? "var(--paper)" : undefined, fontSize: "0.85rem" }}>
            SAC (parcelas decrescentes)
          </button>
        </div>

        <div className="calc-campos">
          <div className="calc-campo">
            <label>Valor financiado (R$)</label>
            <input className="calc-input calc-input--destaque" type="text" inputMode="decimal" value={valor} onChange={e => setValor(e.target.value)} />
          </div>
          <div className="calc-campo">
            <label>Taxa de juros (% ao mês)</label>
            <input className="calc-input calc-input--destaque" type="text" inputMode="decimal" value={taxa} onChange={e => setTaxa(e.target.value)} />
          </div>
        </div>
        <div className="calc-campo">
          <label>Número de parcelas (meses)</label>
          <input className="calc-input calc-input--destaque" type="number" min={1} max={600} value={parcelas} onChange={e => setParcelas(e.target.value)} />
        </div>
      </div>

      {resultado && (
        <div className="calc-painel__resultado calc-painel__resultado--pine">
          <div className="calc-resultado-label">
            {sistema === "price" ? "Parcela fixa" : "Primeira parcela"}
          </div>
          <div className="calc-resultado-numero calc-resultado-numero--pine">
            {fmtBRL(resultado.primeiraParcela)}
          </div>
          {sistema === "sac" && (
            <div className="calc-resultado-extra">
              Última parcela: {fmtBRL(resultado.ultimaParcela)} — as parcelas caem gradualmente até lá
            </div>
          )}
          <div className="calc-metricas" style={{ marginTop: 16 }}>
            <div className="calc-metrica"><div className="calc-metrica__valor">{fmtBRL(pv)}</div><div className="calc-metrica__label">Valor financiado</div></div>
            <div className="calc-metrica"><div className="calc-metrica__valor" style={{ color: "var(--rust)" }}>{fmtBRL(resultado.totalJuros)}</div><div className="calc-metrica__label">Total de juros</div></div>
            <div className="calc-metrica"><div className="calc-metrica__valor">{fmtBRL(resultado.totalPago)}</div><div className="calc-metrica__label">Total pago ao final</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
