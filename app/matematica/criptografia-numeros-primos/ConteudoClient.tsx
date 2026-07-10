"use client";
import { useMemo, useState } from "react";

const PRIMOS = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

export function SimuladorCriptografia() {
  const [pIdx, setPIdx] = useState(3);
  const [qIdx, setQIdx] = useState(15);
  const p = PRIMOS[pIdx];
  const q = PRIMOS[qIdx];

  const produto = p * q;

  const tentativasNecessarias = useMemo(() => Math.floor(Math.sqrt(produto)) - 1, [produto]);

  // Escala ilustrativa: tempo relativo caso os primos tivessem centenas de dígitos
  const digitosReais = 150; // dígitos de cada primo usado de verdade em RSA
  const digitosAtual = String(p).length;

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🔐 Multiplicar é fácil. Desfazer, nem tanto.</p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>Primo p</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={0} max={PRIMOS.length - 1} value={pIdx} onChange={e => setPIdx(+e.target.value)} />
            <span className="mat-interativo__valor">{p}</span>
          </div>
        </div>
        <div className="mat-interativo__campo">
          <label>Primo q</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={0} max={PRIMOS.length - 1} value={qIdx} onChange={e => setQIdx(+e.target.value)} />
            <span className="mat-interativo__valor">{q}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 24, margin: "16px 0", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--ink-faint)" }}>p × q (instantâneo)</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.6rem", fontWeight: 700, color: "var(--pine)" }}>{produto.toLocaleString("pt-BR")}</div>
        </div>
      </div>

      <div className="mat-interativo__resultado">
        <div className="mat-resultado-numero" style={{ fontSize: "1.3rem" }}>~{tentativasNecessarias} tentativas</div>
        <div className="mat-resultado-desc">para descobrir p e q testando divisores, um por um, a partir de {produto.toLocaleString("pt-BR")}</div>
        <div className="mat-resultado-extra">
          Com primos de {digitosAtual} dígito(s), isso é trivial para um computador. Primos reais usados em criptografia têm cerca de {digitosReais} dígitos cada — tornando essa mesma busca inviável mesmo para os supercomputadores mais rápidos do mundo, por bilhões de anos.
        </div>
      </div>
    </div>
  );
}
