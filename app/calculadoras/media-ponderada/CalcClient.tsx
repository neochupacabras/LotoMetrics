"use client";
import { useState, Fragment } from "react";

export function CalcMediaPonderada() {
  const [itens, setItens] = useState([
    { valor: "7.5", peso: "3" },
    { valor: "8.0", peso: "4" },
    { valor: "6.0", peso: "2" },
  ]);

  const parsedItens = itens.map(i => ({ v: parseFloat(i.valor.replace(",",".")), p: parseFloat(i.peso.replace(",",".")) })).filter(i => !isNaN(i.v) && !isNaN(i.p) && i.p > 0);
  const somaPesos = parsedItens.reduce((s, i) => s + i.p, 0);
  const somaVP = parsedItens.reduce((s, i) => s + i.v * i.p, 0);
  const media = somaPesos > 0 ? somaVP / somaPesos : null;
  const mediaSimples = parsedItens.length > 0 ? parsedItens.reduce((s,i) => s+i.v, 0) / parsedItens.length : null;

  const addItem = () => setItens([...itens, { valor: "", peso: "1" }]);
  const removeItem = (i: number) => setItens(itens.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: "valor" | "peso", val: string) => {
    const novo = [...itens]; novo[i] = { ...novo[i], [field]: val }; setItens(novo);
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 40px", gap: "6px 8px", marginBottom: 12, alignItems: "end" }}>
          <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--ink-faint)" }}>Valor / Nota</span>
          <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", color: "var(--ink-faint)" }}>Peso / Crédito</span>
          <span />
          {itens.map((item, i) => (
            <Fragment key={i}>
              <input className="calc-input" type="number" step="0.1" placeholder="0" value={item.valor} onChange={e => updateItem(i, "valor", e.target.value)} style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }} />
              <input className="calc-input" type="number" step="0.5" placeholder="1" value={item.peso} onChange={e => updateItem(i, "peso", e.target.value)} style={{ fontFamily: "var(--font-mono)" }} />
              <button type="button" onClick={() => removeItem(i)} style={{ border: "1px solid var(--rust)", borderRadius: 4, background: "transparent", color: "var(--rust)", cursor: "pointer", fontSize: "1rem", height: 40 }} title="Remover">×</button>
            </Fragment>
          ))}
        </div>
        <button type="button" className="botao-copiar" onClick={addItem} style={{ fontSize: "0.82rem" }}>+ Adicionar item</button>
      </div>

      <div className="calc-painel__resultado calc-painel__resultado--pine">
        {media !== null ? (
          <>
            <div className="calc-resultado-label">Média ponderada</div>
            <div className="calc-resultado-numero">{fmt(media)}</div>
            <div className="calc-metricas" style={{ marginTop: 16 }}>
              <div className="calc-metrica"><div className="calc-metrica__valor">{parsedItens.length}</div><div className="calc-metrica__label">Itens</div></div>
              <div className="calc-metrica"><div className="calc-metrica__valor">{fmt(somaPesos)}</div><div className="calc-metrica__label">Soma dos pesos</div></div>
              {mediaSimples !== null && <div className="calc-metrica"><div className="calc-metrica__valor" style={{ color: "var(--ink-soft)", fontSize: "1rem" }}>{fmt(mediaSimples)}</div><div className="calc-metrica__label">Média simples</div></div>}
            </div>
            {mediaSimples !== null && Math.abs(media - mediaSimples) > 0.01 && (
              <div className="calc-resultado-extra" style={{ marginTop: 12 }}>
                Diferença da média simples: {media > mediaSimples ? "+" : ""}{fmt(media - mediaSimples)} ({media > mediaSimples ? "pesos maiores puxam para cima" : "pesos maiores puxam para baixo"})
              </div>
            )}
          </>
        ) : (
          <div style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>Preencha valores e pesos para calcular</div>
        )}
      </div>
    </div>
  );
}
