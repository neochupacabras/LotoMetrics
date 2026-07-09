"use client";
import { useState, useMemo } from "react";

type Modo = "montante" | "taxa" | "prazo";

export function CalcJurosCompostos() {
  const [modo, setModo] = useState<Modo>("montante");
  const [capital, setCapital] = useState("");
  const [taxa, setTaxa] = useState("");
  const [periodos, setPeriodos] = useState("");
  const [montante, setMontante] = useState("");

  const vc = parseFloat(capital.replace(",", "."));
  const vt = parseFloat(taxa.replace(",", ".")) / 100;
  const vp = parseFloat(periodos.replace(",", "."));
  const vm = parseFloat(montante.replace(",", "."));

  const resultado = useMemo(() => {
    if (modo === "montante" && !isNaN(vc) && !isNaN(vt) && !isNaN(vp)) {
      const m = vc * Math.pow(1 + vt, vp);
      return { valor: m, juros: m - vc, label: "Montante final" };
    }
    if (modo === "taxa" && !isNaN(vc) && !isNaN(vm) && !isNaN(vp) && vc > 0 && vp > 0) {
      const t = (Math.pow(vm / vc, 1 / vp) - 1) * 100;
      return { valor: t, juros: vm - vc, label: "Taxa por período (%)" };
    }
    if (modo === "prazo" && !isNaN(vc) && !isNaN(vm) && !isNaN(vt) && vc > 0 && vt > 0) {
      const n = Math.log(vm / vc) / Math.log(1 + vt);
      return { valor: n, juros: vm - vc, label: "Períodos necessários" };
    }
    return null;
  }, [modo, vc, vt, vp, vm]);

  // Tabela de evolução
  const tabela = useMemo(() => {
    if (modo !== "montante" || !resultado || isNaN(vc) || isNaN(vt) || isNaN(vp)) return [];
    const linhas = [];
    const maxP = Math.min(vp, 24);
    for (let i = 1; i <= maxP; i++) {
      const m = vc * Math.pow(1 + vt, i);
      linhas.push({ periodo: i, montante: m, jurosAcum: m - vc });
    }
    return linhas;
  }, [modo, resultado, vc, vt, vp]);

  const fmt = (v: number, dec = 2) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const fmtBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const modos = [
    { id: "montante" as Modo, label: "Calcular montante" },
    { id: "taxa"     as Modo, label: "Calcular taxa"     },
    { id: "prazo"    as Modo, label: "Calcular prazo"    },
  ];

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div className="calc-modos">
          {modos.map(m => (
            <button key={m.id} type="button" className="calc-modo-btn"
              data-ativo={modo === m.id} onClick={() => setModo(m.id)}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="calc-campos">
          {(modo === "montante" || modo === "taxa" || modo === "prazo") && (
            <div className="calc-campo">
              <label>Capital inicial (R$)</label>
              <input className="calc-input calc-input--destaque" type="number"
                placeholder="1000" value={capital} onChange={e => setCapital(e.target.value)} />
            </div>
          )}
          {(modo === "montante" || modo === "prazo") && (
            <div className="calc-campo">
              <label>Taxa por período (%)</label>
              <input className="calc-input calc-input--destaque" type="number"
                placeholder="10" value={taxa} onChange={e => setTaxa(e.target.value)} />
            </div>
          )}
          {(modo === "montante" || modo === "taxa") && (
            <div className="calc-campo">
              <label>Número de períodos</label>
              <input className="calc-input calc-input--destaque" type="number"
                placeholder="12" value={periodos} onChange={e => setPeriodos(e.target.value)} />
            </div>
          )}
          {(modo === "taxa" || modo === "prazo") && (
            <div className="calc-campo">
              <label>Montante final (R$)</label>
              <input className="calc-input calc-input--destaque" type="number"
                placeholder="2000" value={montante} onChange={e => setMontante(e.target.value)} />
            </div>
          )}
        </div>
      </div>

      <div className="calc-painel__resultado calc-painel__resultado--pine">
        {resultado ? (
          <>
            <div className="calc-resultado-label">{resultado.label}</div>
            <div className="calc-resultado-numero">
              {modo === "montante" ? fmtBRL(resultado.valor)
               : modo === "taxa"   ? `${fmt(resultado.valor, 4)}%`
               : `${fmt(resultado.valor, 2)} períodos`}
            </div>
            {!isNaN(resultado.juros) && resultado.juros > 0 && (
              <div className="calc-metricas" style={{ marginTop: 16 }}>
                <div className="calc-metrica">
                  <div className="calc-metrica__valor">{fmtBRL(vc)}</div>
                  <div className="calc-metrica__label">Capital</div>
                </div>
                <div className="calc-metrica">
                  <div className="calc-metrica__valor" style={{ color: "var(--ochre)" }}>{fmtBRL(resultado.juros)}</div>
                  <div className="calc-metrica__label">Juros totais</div>
                </div>
                <div className="calc-metrica">
                  <div className="calc-metrica__valor">{fmt((resultado.juros / vc) * 100)}%</div>
                  <div className="calc-metrica__label">Rendimento</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
            Preencha os campos para calcular
          </div>
        )}
      </div>

      {tabela.length > 0 && (
        <div style={{ padding: "0 28px 24px", overflowX: "auto" }}>
          <table className="calc-tabela">
            <thead>
              <tr>
                <th>Período</th>
                <th className="num">Montante</th>
                <th className="num">Juros acumulados</th>
              </tr>
            </thead>
            <tbody>
              {tabela.map(l => (
                <tr key={l.periodo} className={l.periodo === tabela.length ? "destaque" : ""}>
                  <td style={{ fontWeight: l.periodo === tabela.length ? 700 : 400 }}>{l.periodo}</td>
                  <td className="num" style={{ fontWeight: l.periodo === tabela.length ? 700 : 400, color: l.periodo === tabela.length ? "var(--pine)" : undefined }}>
                    {fmtBRL(l.montante)}
                  </td>
                  <td className="num">{fmtBRL(l.jurosAcum)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
