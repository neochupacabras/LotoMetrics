"use client";
import { useMemo, useState } from "react";

const ALIQUOTA = 0.30;

function fmtBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseValor(texto: string): number {
  const limpo = texto.replace(/[^\d,]/g, "").replace(",", ".");
  const n = parseFloat(limpo);
  return Number.isFinite(n) ? n : 0;
}

export function CalcImpostoPremio() {
  const [valorTexto, setValorTexto] = useState("1.000.000");

  const { bruto, imposto, liquido } = useMemo(() => {
    const bruto = parseValor(valorTexto);
    const imposto = bruto * ALIQUOTA;
    return { bruto, imposto, liquido: bruto - imposto };
  }, [valorTexto]);

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div className="calc-campo">
          <label htmlFor="valorPremio">Valor do prêmio (antes do imposto)</label>
          <input
            id="valorPremio"
            className="calc-input calc-input--destaque"
            type="text"
            inputMode="decimal"
            placeholder="ex: 1.000.000"
            value={valorTexto}
            onChange={(e) => setValorTexto(e.target.value)}
          />
          <span className="campo-filtro__nota">
            Use o valor estimado que costuma ser anunciado antes do sorteio — é sobre ele que os 30% incidem.
          </span>
        </div>
      </div>
      <div className="calc-painel__resultado calc-painel__resultado--rust">
        <div className="calc-resultado-label">Desse prêmio, você recebe líquido</div>
        <div className="calc-resultado-numero calc-resultado-numero--rust">{fmtBRL(liquido)}</div>
        <div className="calc-resultado-extra">70% do valor bruto — os outros 30% ficam retidos na fonte</div>
        <div className="calc-metricas" style={{ marginTop: 16 }}>
          <div className="calc-metrica">
            <div className="calc-metrica__valor">{fmtBRL(bruto)}</div>
            <div className="calc-metrica__label">Prêmio bruto</div>
          </div>
          <div className="calc-metrica">
            <div className="calc-metrica__valor" style={{ color: "var(--rust)" }}>{fmtBRL(imposto)}</div>
            <div className="calc-metrica__label">Imposto retido (30%)</div>
          </div>
          <div className="calc-metrica">
            <div className="calc-metrica__valor" style={{ color: "var(--pine)" }}>{fmtBRL(liquido)}</div>
            <div className="calc-metrica__label">Valor líquido</div>
          </div>
        </div>
      </div>
    </div>
  );
}
