"use client";
import { useState, useMemo } from "react";

export function CalcParcelamento() {
  const [vista, setVista] = useState(""); const [parcelas, setParcelas] = useState(""); const [valor, setValor] = useState("");
  const vv = parseFloat(vista.replace(",",".")), vp = parseInt(parcelas), vval = parseFloat(valor.replace(",","."));

  const res = useMemo(() => {
    if (isNaN(vv)||isNaN(vp)||isNaN(vval)||vp<=0||vv<=0) return null;
    const total = vp * vval;
    const juros_total = total - vv;
    const taxa_mensal = (Math.pow(total / vv, 1/vp) - 1) * 100;
    const taxa_anual = (Math.pow(1 + taxa_mensal/100, 12) - 1) * 100;
    return { total, juros_total, taxa_mensal, taxa_anual, pct_juros: (juros_total/vv)*100 };
  }, [vv, vp, vval]);

  const fmtBRL = (v: number) => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  const fmt = (v: number, d=2) => v.toLocaleString("pt-BR",{minimumFractionDigits:d,maximumFractionDigits:d});

  const cor = res ? (res.taxa_mensal < 2 ? "var(--pine)" : res.taxa_mensal < 5 ? "var(--ochre)" : "var(--rust)") : "var(--pine)";
  const aviso = res ? (res.taxa_mensal < 2 ? "Taxa razoável" : res.taxa_mensal < 5 ? "Taxa moderada — avalie bem" : "⚠️ Taxa alta — considere pagar à vista") : "";

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div className="calc-campos">
          <div className="calc-campo"><label>Preço à vista (R$)</label><input className="calc-input calc-input--destaque" type="number" placeholder="1000" value={vista} onChange={e => setVista(e.target.value)} /></div>
          <div className="calc-campo"><label>Número de parcelas</label><input className="calc-input calc-input--destaque" type="number" placeholder="12" value={parcelas} onChange={e => setParcelas(e.target.value)} /></div>
          <div className="calc-campo"><label>Valor de cada parcela (R$)</label><input className="calc-input calc-input--destaque" type="number" placeholder="100" value={valor} onChange={e => setValor(e.target.value)} /></div>
        </div>
      </div>
      <div className="calc-painel__resultado calc-painel__resultado--ochre">
        {res ? (
          <>
            <div className="calc-resultado-label">Taxa de juros mensal embutida</div>
            <div className="calc-resultado-numero" style={{ color: cor }}>{fmt(res.taxa_mensal, 2)}% a.m.</div>
            <div className="calc-metricas" style={{ marginTop: 16 }}>
              <div className="calc-metrica"><div className="calc-metrica__valor" style={{ color: "var(--ochre)" }}>{fmt(res.taxa_anual, 1)}%</div><div className="calc-metrica__label">Taxa anual</div></div>
              <div className="calc-metrica"><div className="calc-metrica__valor">{fmtBRL(res.total)}</div><div className="calc-metrica__label">Total pago</div></div>
              <div className="calc-metrica"><div className="calc-metrica__valor" style={{ color: "var(--rust)" }}>{fmtBRL(res.juros_total)}</div><div className="calc-metrica__label">Juros totais</div></div>
              <div className="calc-metrica"><div className="calc-metrica__valor">{fmt(res.pct_juros, 1)}%</div><div className="calc-metrica__label">Custo extra</div></div>
            </div>
            <div className="calc-info calc-info--ochre" style={{ marginTop: 12 }}>{aviso}</div>
          </>
        ) : (
          <div style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>Preencha os três campos para calcular os juros embutidos</div>
        )}
      </div>
    </div>
  );
}
