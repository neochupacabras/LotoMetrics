"use client";

import { useMemo, useState } from "react";

interface Faixa {
  faixaInicio: number;
  faixaFim: number;
  ocorrencias: number;
}

export default function SomaCalculadora({
  histograma,
  totalConcursos,
  somaMinima,
  somaMaxima,
  dezenaMin,
  dezenaMax,
  qtdDezenasSorteadas,
}: {
  histograma: Faixa[];
  totalConcursos: number;
  somaMinima: number;
  somaMaxima: number;
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenasSorteadas: number;
}) {
  const somaTeoricaMin = somarMenores(dezenaMin, qtdDezenasSorteadas);
  const somaTeoricaMax = somarMaiores(dezenaMax, qtdDezenasSorteadas);

  const [valor, setValor] = useState<string>("");

  const resultado = useMemo(() => {
    const soma = Number(valor);
    if (!valor || Number.isNaN(soma)) return null;

    const faixa = histograma.find((h) => soma >= h.faixaInicio && soma <= h.faixaFim);
    const percentual = faixa && totalConcursos > 0
      ? Math.round((faixa.ocorrencias / totalConcursos) * 1000) / 10
      : 0;

    let reacao: string;
    if (soma < somaTeoricaMin || soma > somaTeoricaMax) {
      reacao = "essa soma é impossível para essa loteria — confira as dezenas escolhidas.";
    } else if (!faixa || faixa.ocorrencias === 0) {
      reacao = "uma soma raríssima: nenhum concurso da história terminou com um total parecido com esse.";
    } else if (soma >= somaMinima && soma <= somaMaxima && percentual >= 8) {
      reacao = "bem dentro do miolo do padrão histórico — uma soma bastante comum.";
    } else if (percentual > 0) {
      reacao = "uma soma incomum, mas não inédita — já apareceu algumas vezes.";
    } else {
      reacao = "fora do que já foi registrado até hoje nessa faixa exata, mas ainda dentro do possível.";
    }

    const posicaoPct = clamp(
      ((soma - somaTeoricaMin) / (somaTeoricaMax - somaTeoricaMin)) * 100,
      0,
      100
    );

    return { faixa, percentual, reacao, posicaoPct };
  }, [valor, histograma, totalConcursos, somaMinima, somaMaxima, somaTeoricaMin, somaTeoricaMax]);

  return (
    <div className="soma-calc">
      <p className="soma-calc__titulo">Onde a sua soma cairia?</p>
      <p className="soma-calc__nota">
        Some as dezenas do seu jogo e digite o total abaixo — a gente te mostra
        onde ele se encaixa no histórico de todos os concursos já sorteados.
      </p>
      <div className="soma-calc__form">
        <div className="soma-calc__campo">
          <label htmlFor="soma-input">Soma do seu jogo</label>
          <input
            id="soma-input"
            type="number"
            inputMode="numeric"
            placeholder={`ex.: ${Math.round((somaTeoricaMin + somaTeoricaMax) / 2)}`}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            min={somaTeoricaMin}
            max={somaTeoricaMax}
          />
        </div>
      </div>

      {resultado && (
        <div className="soma-calc__resultado">
          {resultado.faixa ? (
            <p>
              Somas entre <strong>{resultado.faixa.faixaInicio}</strong> e{" "}
              <strong>{resultado.faixa.faixaFim}</strong> já apareceram em{" "}
              <strong>{resultado.percentual}%</strong> de todos os concursos —{" "}
              {resultado.reacao}
            </p>
          ) : (
            <p>{resultado.reacao}</p>
          )}
          <div className="soma-calc__barra-track">
            <div
              className="soma-calc__barra-marcador"
              style={{ left: `${resultado.posicaoPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function somarMenores(dezenaMin: number, qtd: number): number {
  let soma = 0;
  for (let i = 0; i < qtd; i++) soma += dezenaMin + i;
  return soma;
}

function somarMaiores(dezenaMax: number, qtd: number): number {
  let soma = 0;
  for (let i = 0; i < qtd; i++) soma += dezenaMax - i;
  return soma;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
