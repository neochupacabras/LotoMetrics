"use client";

import { useState } from "react";
import Link from "next/link";
import { formatarDezena } from "@/lib/format";

function gerarCombinacao(): number[] {
  const universo: number[] = [];
  for (let i = 1; i <= 25; i++) universo.push(i);
  const sorteadas: number[] = [];
  for (let i = 0; i < 15; i++) {
    const idx = Math.floor(Math.random() * universo.length);
    sorteadas.push(universo[idx]);
    universo.splice(idx, 1);
  }
  return sorteadas.sort((a, b) => a - b);
}

export default function GeradorRelampago() {
  const [dezenas, setDezenas] = useState<number[] | null>(null);
  const [contador, setContador] = useState(0);

  function gerar() {
    setDezenas(gerarCombinacao());
    setContador((c) => c + 1);
  }

  return (
    <div className="gerador-relampago">
      <div className="gerador-relampago__texto">
        <p className="eyebrow">Experimente</p>
        <h2 className="gerador-relampago__titulo">Gere uma combinação em 1 clique</h2>
        <p className="gerador-relampago__desc">
          Uma prévia do <Link href="/lotofacil/gerador">gerador de jogos</Link> — 15
          dezenas da Lotofácil, sorteadas na hora, sem repetição.
        </p>
      </div>

      <div className="gerador-relampago__caixa">
        <div className="gerador-relampago__bolinhas" aria-live="polite">
          {dezenas ? (
            dezenas.map((d, i) => (
              <span
                key={`${contador}-${d}`}
                className="dezena-bola dezena-bola--pequena"
                style={{ animationDelay: `${i * 35}ms` }}
              >
                {formatarDezena(d)}
              </span>
            ))
          ) : (
            <span className="gerador-relampago__placeholder">
              Clique em gerar pra ver sua combinação
            </span>
          )}
        </div>

        <button type="button" className="botao-gerar" onClick={gerar}>
          🎲 Gerar dezenas
        </button>

        {dezenas && (
          <p className="gerador-relampago__info">
            Essa é a <strong>{contador}ª</strong> combinação que você gerou aqui — entre{" "}
            <strong>3.268.760</strong> possíveis, todas com exatamente a mesma chance.
          </p>
        )}
      </div>
    </div>
  );
}
