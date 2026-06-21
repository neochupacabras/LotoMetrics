"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  classificarJogo,
  compararComHistorico,
  TabelasComparacao,
} from "@/lib/classificacao";
import { formatarDezena } from "@/lib/format";

interface CartaoIndicador {
  rotulo: string;
  valor: string;
  percentual: number | null;
  link: string;
}

export default function SimuladorClient({
  codigoLoteria,
  dezenaMin,
  dezenaMax,
  qtdDezenasSorteadas,
  gridColunas,
  dados,
}: {
  codigoLoteria: string;
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenasSorteadas: number;
  gridColunas: number;
  dados: TabelasComparacao & {
    somaEstatisticas: { minimo: number; maximo: number; media: number; mediana: number } | null;
  };
}) {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());

  const todasDezenas = Array.from({ length: dezenaMax - dezenaMin + 1 }, (_, i) => dezenaMin + i);

  function toggleDezena(d: number) {
    setSelecionadas((prev) => {
      const novo = new Set(prev);
      if (novo.has(d)) {
        novo.delete(d);
      } else if (novo.size < qtdDezenasSorteadas) {
        novo.add(d);
      }
      return novo;
    });
  }

  function limpar() {
    setSelecionadas(new Set());
  }

  const dezenasArray = useMemo(
    () => Array.from(selecionadas).sort((a, b) => a - b),
    [selecionadas]
  );

  const classificacao = useMemo(
    () => classificarJogo(dezenasArray, { dezenaMax, gridColunas }),
    [dezenasArray, dezenaMax, gridColunas]
  );

  const completo = dezenasArray.length === qtdDezenasSorteadas;

  const comparacao = useMemo(
    () => (completo ? compararComHistorico(classificacao, dados) : null),
    [completo, classificacao, dados]
  );

  const qtdPopulares = dezenaMax > 31 ? dezenasArray.filter((d) => d <= 31).length : null;

  const cartoes: CartaoIndicador[] = [
    {
      rotulo: "Pares / Ímpares",
      valor: `${classificacao.pares}/${classificacao.impares}`,
      percentual: comparacao?.percentualParImpar ?? null,
      link: `/${codigoLoteria}/tabelas/pares-impares`,
    },
    {
      rotulo: "Soma das dezenas",
      valor: String(classificacao.soma),
      percentual: comparacao?.percentualSoma ?? null,
      link: `/${codigoLoteria}/tabelas/soma`,
    },
    {
      rotulo: "Números primos",
      valor: String(classificacao.primos),
      percentual: comparacao?.percentualPrimos ?? null,
      link: `/${codigoLoteria}/tabelas/primos`,
    },
    {
      rotulo: "Números de Fibonacci",
      valor: String(classificacao.fibonacci),
      percentual: comparacao?.percentualFibonacci ?? null,
      link: `/${codigoLoteria}/tabelas/fibonacci`,
    },
    {
      rotulo: "Múltiplos de 3",
      valor: String(classificacao.multiplos3),
      percentual: comparacao?.percentualMultiplos3 ?? null,
      link: `/${codigoLoteria}/tabelas/multiplos-de-3`,
    },
    {
      rotulo: "Moldura / Centro",
      valor: `${classificacao.moldura}/${classificacao.centro}`,
      percentual: comparacao?.percentualMolduraCentro ?? null,
      link: `/${codigoLoteria}/tabelas/moldura-centro`,
    },
    {
      rotulo: "Maior sequência",
      valor: String(classificacao.maiorSequencia),
      percentual: comparacao?.percentualSequencia ?? null,
      link: `/${codigoLoteria}/tabelas/sequencias`,
    },
  ];

  return (
    <div>
      <div className="grade-dezenas" style={{ maxWidth: gridColunas <= 6 ? 420 : 560 }}>
        {todasDezenas.map((d) => (
          <button
            key={d}
            type="button"
            className="dezena-selecionavel"
            data-selecionada={selecionadas.has(d)}
            disabled={!selecionadas.has(d) && selecionadas.size >= qtdDezenasSorteadas}
            onClick={() => toggleDezena(d)}
          >
            {formatarDezena(d)}
          </button>
        ))}
      </div>

      <p className="fechamento-resumo">
        {dezenasArray.length} de {qtdDezenasSorteadas} dezenas selecionadas
        {!completo && dezenasArray.length > 0
          ? ` — selecione mais ${qtdDezenasSorteadas - dezenasArray.length} para ver a comparação completa com o histórico`
          : ""}
      </p>

      {dezenasArray.length > 0 && (
        <button type="button" className="botao-copiar" onClick={limpar}>
          Limpar seleção
        </button>
      )}

      {dezenasArray.length > 0 && (
        <div className="bloco" style={{ marginTop: "20px" }}>
          <h2 className="bloco__titulo">
            {completo ? "Como esse jogo se compara ao histórico" : "Acompanhando ao vivo"}
          </h2>
          <div className="analise-grid">
            {cartoes.map((c) => (
              <Link key={c.rotulo} href={c.link} className="analise-cartao">
                <p className="analise-cartao__rotulo">{c.rotulo}</p>
                <p className="analise-cartao__valor">{c.valor}</p>
                {c.percentual !== null && (
                  <p className="analise-cartao__contexto">{c.percentual}% do histórico</p>
                )}
              </Link>
            ))}
          </div>

          {completo && qtdPopulares !== null && (
            <p className="bloco__nota" style={{ marginTop: "8px" }}>
              {qtdPopulares} de {qtdDezenasSorteadas} números estão entre 1 e 31 — a faixa
              mais escolhida por quem usa datas de aniversário. Isso não muda sua chance de
              ganhar, mas se você ganhar, pode aumentar a chance de dividir o prêmio com
              outros apostadores.{" "}
              <Link href="/dicas#o-que-faz-diferenca" style={{ textDecoration: "underline" }}>
                Mais em Dicas
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}
