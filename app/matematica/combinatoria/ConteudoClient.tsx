"use client";

import Link from "next/link";
import { useState } from "react";
// ─── Componente interativo: calculadora de combinações de roupa ───────────────
// ─── Calculadora de combinações C(n,k) ───────────────────────────────────────
// ─── Artigo ──────────────────────────────────────────────────────────────────

function BrincadeiraGuardaRoupa() {
  const [camisas, setCamisas] = useState(5);
  const [calcas, setCalcas]   = useState(4);
  const [tenis, setTenis]     = useState(3);

  const total = camisas * calcas * tenis;
  const diasDeAnos = Math.floor(total / 365);

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🎽 Quantas combinações de roupa você tem?</p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>Camisas</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={1} max={20} value={camisas}
              onChange={e => setCamisas(+e.target.value)} />
            <span className="mat-interativo__valor">{camisas}</span>
          </div>
        </div>
        <div className="mat-interativo__campo">
          <label>Calças / shorts</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={1} max={15} value={calcas}
              onChange={e => setCalcas(+e.target.value)} />
            <span className="mat-interativo__valor">{calcas}</span>
          </div>
        </div>
        <div className="mat-interativo__campo">
          <label>Tênis / sapatos</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={1} max={10} value={tenis}
              onChange={e => setTenis(+e.target.value)} />
            <span className="mat-interativo__valor">{tenis}</span>
          </div>
        </div>
      </div>
      <div className="mat-interativo__resultado">
        <div className="mat-resultado-numero">{total.toLocaleString("pt-BR")}</div>
        <div className="mat-resultado-desc">combinações diferentes</div>
        {diasDeAnos >= 1 && (
          <div className="mat-resultado-extra">
            = {diasDeAnos} ano{diasDeAnos > 1 ? "s" : ""} usando roupa diferente todo dia
          </div>
        )}
        {diasDeAnos === 0 && (
          <div className="mat-resultado-extra">
            = {total} dias usando roupa diferente todo dia
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Calculadora de combinações C(n,k) ───────────────────────────────────────

function fat(n: number): number {
  if (n <= 1) return 1;
  return n * fat(n - 1);
}

function comb(n: number, k: number): number {
  if (k > n) return 0;
  return fat(n) / (fat(k) * fat(n - k));
}

function CalculadoraCnk() {
  const [n, setN] = useState(25);
  const [k, setK] = useState(15);

  const resultado = comb(n, k);
  const formatado = resultado > 1e15
    ? resultado.toExponential(2)
    : resultado.toLocaleString("pt-BR");

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🔢 Calculadora C(n, k)</p>
      <p style={{ fontSize: "0.88rem", color: "var(--ink-soft)", marginBottom: 16 }}>
        Quantas formas de escolher <strong>k</strong> itens de um grupo de <strong>n</strong>, sem se importar com a ordem?
      </p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>n — total de opções</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={1} max={80} value={n}
              onChange={e => { const v = +e.target.value; setN(v); if (k > v) setK(v); }} />
            <span className="mat-interativo__valor">{n}</span>
          </div>
        </div>
        <div className="mat-interativo__campo">
          <label>k — quantos escolher</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={1} max={n} value={k}
              onChange={e => setK(+e.target.value)} />
            <span className="mat-interativo__valor">{k}</span>
          </div>
        </div>
      </div>
      <div className="mat-interativo__resultado">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", color: "var(--ink-soft)", marginBottom: 4 }}>
          C({n}, {k}) =
        </div>
        <div className="mat-resultado-numero">{formatado}</div>
        {n === 25 && k === 15 && (
          <div className="mat-resultado-extra">← combinações possíveis da Lotofácil</div>
        )}
        {n === 60 && k === 6 && (
          <div className="mat-resultado-extra">← combinações possíveis da Mega-Sena</div>
        )}
      </div>
    </div>
  );
}

