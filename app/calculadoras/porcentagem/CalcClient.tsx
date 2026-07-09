"use client";
import { useState } from "react";

type Modo = "xPercDeY" | "xEQuantoPercDeY" | "aumentar" | "diminuir" | "diferenca";

export function CalcPorcentagem() {
  const [modo, setModo] = useState<Modo>("xPercDeY");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const va = parseFloat(a.replace(",", "."));
  const vb = parseFloat(b.replace(",", "."));

  const resultado = (): { valor: number | null; frase: string } => {
    if (isNaN(va) || isNaN(vb)) return { valor: null, frase: "" };
    switch (modo) {
      case "xPercDeY":
        return { valor: (va / 100) * vb, frase: `${va}% de ${vb} =` };
      case "xEQuantoPercDeY":
        if (vb === 0) return { valor: null, frase: "Divisão por zero" };
        return { valor: (va / vb) * 100, frase: `${va} é` };
      case "aumentar":
        return { valor: vb * (1 + va / 100), frase: `${vb} + ${va}% =` };
      case "diminuir":
        return { valor: vb * (1 - va / 100), frase: `${vb} − ${va}% =` };
      case "diferenca":
        if (va === 0) return { valor: null, frase: "Divisão por zero" };
        return { valor: ((vb - va) / va) * 100, frase: `De ${va} para ${vb}: variação de` };
    }
  };

  const res = resultado();
  const fmt = (v: number) =>
    Number.isInteger(v) ? v.toLocaleString("pt-BR") : v.toLocaleString("pt-BR", { maximumFractionDigits: 4 });

  const modos: { id: Modo; label: string; aLabel: string; bLabel: string }[] = [
    { id: "xPercDeY",        label: "X% de Y",          aLabel: "Porcentagem (%)", bLabel: "Valor (Y)" },
    { id: "xEQuantoPercDeY", label: "X é % de Y",       aLabel: "Valor (X)",        bLabel: "Total (Y)" },
    { id: "aumentar",        label: "Aumentar por %",   aLabel: "Aumento (%)",      bLabel: "Valor original" },
    { id: "diminuir",        label: "Diminuir por %",   aLabel: "Desconto (%)",     bLabel: "Valor original" },
    { id: "diferenca",       label: "Variação %",       aLabel: "Valor inicial",    bLabel: "Valor final" },
  ];

  const modoAtual = modos.find(m => m.id === modo)!;
  const unidade = modo === "xEQuantoPercDeY" || modo === "diferenca" ? "%" : "";

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div className="calc-modos">
          {modos.map(m => (
            <button key={m.id} type="button"
              className="calc-modo-btn" data-ativo={modo === m.id}
              onClick={() => { setModo(m.id); setA(""); setB(""); }}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="calc-campos">
          <div className="calc-campo">
            <label>{modoAtual.aLabel}</label>
            <input className="calc-input calc-input--destaque" type="number"
              placeholder="0" value={a} onChange={e => setA(e.target.value)} />
          </div>
          <div className="calc-campo">
            <label>{modoAtual.bLabel}</label>
            <input className="calc-input calc-input--destaque" type="number"
              placeholder="0" value={b} onChange={e => setB(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="calc-painel__resultado calc-painel__resultado--ochre">
        {res.valor !== null ? (
          <>
            <div style={{ fontSize: "0.88rem", color: "var(--ink-faint)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>
              {res.frase}
            </div>
            <div className="calc-resultado-numero calc-resultado-numero--ochre">
              {fmt(res.valor)}{unidade}
            </div>
            {modo === "aumentar" && res.valor !== null && (
              <div className="calc-resultado-extra">
                Diferença: +{fmt(res.valor - vb)} ({va}% a mais)
              </div>
            )}
            {modo === "diminuir" && res.valor !== null && (
              <div className="calc-resultado-extra">
                Economia: −{fmt(vb - res.valor)} ({va}% a menos)
              </div>
            )}
            {modo === "xEQuantoPercDeY" && res.valor !== null && !isNaN(vb) && (
              <div className="calc-barra-wrap">
                <div className="calc-barra-fundo">
                  <div className="calc-barra-fill calc-barra-fill--ochre"
                    style={{ width: `${Math.min(res.valor, 100)}%` }} />
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
            Preencha os campos acima para calcular
          </div>
        )}
      </div>
    </div>
  );
}
