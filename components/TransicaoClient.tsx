"use client";

import { useState, useTransition } from "react";
import { analisarTransicaoAction, TransicaoActionResult } from "@/lib/markov-actions";
import { formatarDezena } from "@/lib/format";

export default function TransicaoClient({
  codigoLoteria,
  dezenaMin,
  dezenaMax,
}: {
  codigoLoteria: string;
  dezenaMin: number;
  dezenaMax: number;
}) {
  const [dezenaOrigem, setDezenaOrigem] = useState(dezenaMin);
  const [resultado, setResultado] = useState<TransicaoActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const todasDezenas = Array.from({ length: dezenaMax - dezenaMin + 1 }, (_, i) => dezenaMin + i);

  function handleAnalisar(dezena: number) {
    setDezenaOrigem(dezena);
    startTransition(async () => {
      const r = await analisarTransicaoAction(codigoLoteria, dezena);
      setResultado(r);
    });
  }

  const maiorPercentual = resultado?.dados
    ? Math.max(
        ...resultado.dados.transicoes.map((t) =>
          Math.max(t.percentualCondicional, t.percentualBase)
        )
      )
    : 1;

  return (
    <div>
      <p className="bloco__nota">
        Escolha uma dezena. Vamos olhar todos os concursos em que ela já saiu e checar o
        que realmente aconteceu no concurso seguinte — comparado ao que se espera só pelo
        acaso.
      </p>

      <div className="grade-dezenas" style={{ maxWidth: 480 }}>
        {todasDezenas.map((d) => (
          <button
            key={d}
            type="button"
            className="dezena-selecionavel"
            data-selecionada={dezenaOrigem === d && resultado !== null}
            onClick={() => handleAnalisar(d)}
          >
            {formatarDezena(d)}
          </button>
        ))}
      </div>

      {pending && <p className="bloco__nota">Calculando...</p>}

      {resultado?.ok && resultado.dados && (
        <div className="bloco">
          <div className="transicao-resumo">
            <div className="transicao-resumo__item">
              <p className="analise-cartao__rotulo">Transições analisadas</p>
              <p className="transicao-resumo__valor">{resultado.dados.totalTransicoes}</p>
            </div>
            <div className="transicao-resumo__item">
              <p className="analise-cartao__rotulo">Diferença média vs. o esperado por acaso</p>
              <p className="transicao-resumo__valor">{resultado.dados.diferencaMediaAbsoluta}pp</p>
            </div>
          </div>

          <p className="bloco__nota">
            Uma diferença média de <strong>{resultado.dados.diferencaMediaAbsoluta} pontos
            percentuais</strong> é exatamente o tipo de ruído que se espera de uma amostra
            desse tamanho — não evidência de padrão. Se a dezena {formatarDezena(dezenaOrigem)}{" "}
            realmente influenciasse o concurso seguinte, as barras abaixo seriam bem
            diferentes entre si; em vez disso, ficam quase idênticas para as 25 dezenas.
          </p>

          <div className="transicao-legenda">
            <span>
              <span
                className="transicao-legenda__chip"
                style={{ background: "var(--ochre)" }}
              />
              O que aconteceu de fato (condicional)
            </span>
            <span>
              <span className="transicao-legenda__chip" style={{ background: "var(--pine)" }} />
              O que se espera por acaso (frequência geral)
            </span>
          </div>

          {resultado.dados.transicoes.map((t) => (
            <div key={t.dezena} className="transicao-linha">
              <span className="transicao-linha__dezena">{formatarDezena(t.dezena)}</span>
              <div className="transicao-barra-wrap">
                <div
                  className="transicao-barra transicao-barra--condicional"
                  style={{ width: `${(t.percentualCondicional / maiorPercentual) * 100}%` }}
                />
              </div>
              <div className="transicao-barra-wrap">
                <div
                  className="transicao-barra transicao-barra--base"
                  style={{ width: `${(t.percentualBase / maiorPercentual) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
