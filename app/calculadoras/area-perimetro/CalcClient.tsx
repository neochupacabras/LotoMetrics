"use client";
import { useState, type ReactNode } from "react";

type Forma = "circulo" | "retangulo" | "quadrado" | "triangulo";

export function CalcAreaPerimetro() {
  const [forma, setForma] = useState<Forma>("circulo");
  const [a, setA] = useState(""); const [b, setB] = useState(""); const [c, setC] = useState("");
  const va = parseFloat(a.replace(",",".")), vb = parseFloat(b.replace(",",".")), vc = parseFloat(c.replace(",","."));
  const fmt = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 4 });

  type Resultado = { area: number; perimetro: number; formula: string; svgEl: ReactNode } | null;
  let res: Resultado = null;
  if (forma === "circulo" && !isNaN(va) && va > 0) {
    res = { area: Math.PI*va*va, perimetro: 2*Math.PI*va, formula: `A = π × ${va}² = ${fmt(Math.PI*va*va)} | P = 2π × ${va} = ${fmt(2*Math.PI*va)}`,
      svgEl: <ellipse cx="80" cy="60" rx={Math.min(va*8,54)} ry={Math.min(va*8,54)} fill="color-mix(in srgb, var(--pine) 20%, transparent)" stroke="var(--pine)" strokeWidth="2"/> };
  } else if (forma === "retangulo" && !isNaN(va) && !isNaN(vb) && va > 0 && vb > 0) {
    const maxD = Math.max(va,vb), rw = (va/maxD)*120, rh = (vb/maxD)*80;
    res = { area: va*vb, perimetro: 2*(va+vb), formula: `A = ${va} × ${vb} = ${fmt(va*vb)} | P = 2×(${va}+${vb}) = ${fmt(2*(va+vb))}`,
      svgEl: <rect x={(160-rw)/2} y={(120-rh)/2} width={rw} height={rh} fill="color-mix(in srgb, var(--ochre) 20%, transparent)" stroke="var(--ochre)" strokeWidth="2"/> };
  } else if (forma === "quadrado" && !isNaN(va) && va > 0) {
    const s = Math.min(va*10, 90);
    res = { area: va*va, perimetro: 4*va, formula: `A = ${va}² = ${fmt(va*va)} | P = 4 × ${va} = ${fmt(4*va)}`,
      svgEl: <rect x={(160-s)/2} y={(120-s)/2} width={s} height={s} fill="color-mix(in srgb, var(--rust) 20%, transparent)" stroke="var(--rust)" strokeWidth="2"/> };
  } else if (forma === "triangulo" && !isNaN(va) && !isNaN(vb) && !isNaN(vc) && va > 0 && vb > 0 && vc > 0) {
    const s2 = (va+vb+vc)/2;
    const area = Math.sqrt(s2*(s2-va)*(s2-vb)*(s2-vc));
    if (!isNaN(area) && area > 0) {
      res = { area, perimetro: va+vb+vc, formula: `Heron: s=${fmt(s2)}, A=√(s(s-a)(s-b)(s-c))=${fmt(area)} | P=${fmt(va+vb+vc)}`,
        svgEl: <polygon points="80,20 140,100 20,100" fill="color-mix(in srgb, var(--pine) 20%, transparent)" stroke="var(--pine)" strokeWidth="2"/> };
    }
  }

  const formas: { id: Forma; label: string; campos: string[] }[] = [
    { id: "circulo",    label: "Círculo",    campos: ["Raio"] },
    { id: "retangulo",  label: "Retângulo",  campos: ["Largura","Altura"] },
    { id: "quadrado",   label: "Quadrado",   campos: ["Lado"] },
    { id: "triangulo",  label: "Triângulo",  campos: ["Lado a","Lado b","Lado c"] },
  ];
  const formaAtual = formas.find(f => f.id === forma)!;
  const inputs = [a,b,c]; const setInputs = [setA,setB,setC];

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div className="calc-modos">
          {formas.map(f => <button key={f.id} type="button" className="calc-modo-btn" data-ativo={forma===f.id} onClick={() => { setForma(f.id); setA(""); setB(""); setC(""); }}>{f.label}</button>)}
        </div>
        <div className="calc-campos">
          {formaAtual.campos.map((label, i) => (
            <div key={i} className="calc-campo"><label>{label}</label><input className="calc-input calc-input--destaque" type="number" placeholder="0" value={inputs[i]} onChange={e => setInputs[i](e.target.value)} /></div>
          ))}
        </div>
      </div>
      <div className="calc-painel__resultado calc-painel__resultado--pine">
        {res ? (
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <svg viewBox="0 0 160 120" style={{ width: 120, flexShrink: 0 }}>{res.svgEl}</svg>
            <div>
              <div className="calc-resultado-label">Área</div>
              <div className="calc-resultado-numero" style={{ fontSize: "2rem" }}>{fmt(res.area)} u²</div>
              <div className="calc-resultado-label" style={{ marginTop: 10 }}>Perímetro</div>
              <div className="calc-resultado-numero" style={{ fontSize: "1.5rem", color: "var(--ochre)" }}>{fmt(res.perimetro)} u</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--ink-faint)", marginTop: 10 }}>{res.formula}</div>
            </div>
          </div>
        ) : (
          <div style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>Preencha os campos para calcular</div>
        )}
      </div>
    </div>
  );
}
