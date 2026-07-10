"use client";
import { useState, useMemo } from "react";

type Categoria = "comprimento" | "peso" | "volume" | "temperatura";

const UNIDADES: Record<Categoria, { label: string; fatores: Record<string, number> }> = {
  comprimento: {
    label: "Comprimento",
    fatores: { // em metros
      "milímetro (mm)": 0.001,
      "centímetro (cm)": 0.01,
      "metro (m)": 1,
      "quilômetro (km)": 1000,
      "polegada (in)": 0.0254,
      "pé (ft)": 0.3048,
      "jarda (yd)": 0.9144,
      "milha (mi)": 1609.344,
    },
  },
  peso: {
    label: "Peso",
    fatores: { // em gramas
      "miligrama (mg)": 0.001,
      "grama (g)": 1,
      "quilograma (kg)": 1000,
      "tonelada (t)": 1_000_000,
      "onça (oz)": 28.3495,
      "libra (lb)": 453.592,
    },
  },
  volume: {
    label: "Volume",
    fatores: { // em litros
      "mililitro (mL)": 0.001,
      "litro (L)": 1,
      "metro cúbico (m³)": 1000,
      "galão americano (gal)": 3.78541,
      "xícara (cup)": 0.236588,
    },
  },
  temperatura: {
    label: "Temperatura",
    fatores: {}, // tratada à parte
  },
};

function converterTemperatura(valor: number, de: string, para: string): number {
  // tudo passa por Celsius
  let celsius: number;
  if (de === "Celsius (°C)") celsius = valor;
  else if (de === "Fahrenheit (°F)") celsius = (valor - 32) * (5 / 9);
  else celsius = valor - 273.15; // Kelvin

  if (para === "Celsius (°C)") return celsius;
  if (para === "Fahrenheit (°F)") return celsius * (9 / 5) + 32;
  return celsius + 273.15; // Kelvin
}

const UNIDADES_TEMPERATURA = ["Celsius (°C)", "Fahrenheit (°F)", "Kelvin (K)"];

export function CalcConversorUnidades() {
  const [categoria, setCategoria] = useState<Categoria>("comprimento");
  const unidadesDaCategoria = categoria === "temperatura"
    ? UNIDADES_TEMPERATURA
    : Object.keys(UNIDADES[categoria].fatores);

  const [de, setDe] = useState(unidadesDaCategoria[1] ?? unidadesDaCategoria[0]);
  const [para, setPara] = useState(unidadesDaCategoria[2] ?? unidadesDaCategoria[0]);
  const [valor, setValor] = useState("1");

  function trocarCategoria(cat: Categoria) {
    setCategoria(cat);
    const novas = cat === "temperatura" ? UNIDADES_TEMPERATURA : Object.keys(UNIDADES[cat].fatores);
    setDe(novas[1] ?? novas[0]);
    setPara(novas[2] ?? novas[0]);
  }

  const vValor = parseFloat(valor.replace(",", ".")) || 0;

  const resultado = useMemo(() => {
    if (categoria === "temperatura") {
      return converterTemperatura(vValor, de, para);
    }
    const fatores = UNIDADES[categoria].fatores;
    const emBase = vValor * (fatores[de] ?? 1);
    return emBase / (fatores[para] ?? 1);
  }, [categoria, de, para, vValor]);

  function formatarResultado(v: number): string {
    if (Math.abs(v) >= 1000 || (Math.abs(v) < 0.001 && v !== 0)) {
      return v.toLocaleString("pt-BR", { maximumFractionDigits: 4 });
    }
    return v.toLocaleString("pt-BR", { maximumFractionDigits: 6 });
  }

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {(Object.keys(UNIDADES) as Categoria[]).map(cat => (
            <button
              key={cat}
              type="button"
              className="botao-copiar"
              onClick={() => trocarCategoria(cat)}
              style={{
                fontSize: "0.82rem",
                background: categoria === cat ? "var(--pine)" : undefined,
                color: categoria === cat ? "var(--paper)" : undefined,
              }}
            >
              {UNIDADES[cat].label}
            </button>
          ))}
        </div>

        <div className="calc-campo">
          <label>Valor</label>
          <input className="calc-input calc-input--destaque" type="text" inputMode="decimal" value={valor} onChange={e => setValor(e.target.value)} />
        </div>

        <div className="calc-campos">
          <div className="calc-campo">
            <label>De</label>
            <select className="calc-select" value={de} onChange={e => setDe(e.target.value)}>
              {unidadesDaCategoria.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="calc-campo">
            <label>Para</label>
            <select className="calc-select" value={para} onChange={e => setPara(e.target.value)}>
              {unidadesDaCategoria.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="calc-painel__resultado calc-painel__resultado--pine">
        <div className="calc-resultado-label">{vValor.toLocaleString("pt-BR")} {de} equivale a</div>
        <div className="calc-resultado-numero calc-resultado-numero--pine">{formatarResultado(resultado)}</div>
        <div className="calc-resultado-extra">{para}</div>
      </div>
    </div>
  );
}
