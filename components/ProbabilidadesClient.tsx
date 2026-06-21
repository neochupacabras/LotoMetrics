"use client";

import { useState } from "react";
import { calcularProbabilidades, FaixaProbabilidade } from "@/lib/probabilidades";

const QTD_EXTRA_DEZENAS_MAX = 5;

export default function ProbabilidadesClient({
  dezenaMax,
  qtdDezenasSorteadas,
  qtdDezenasPadrao,
  faixasPremiadas,
}: {
  dezenaMax: number;
  qtdDezenasSorteadas: number;
  qtdDezenasPadrao: number;
  faixasPremiadas: number[];
}) {
  const [qtdApostada, setQtdApostada] = useState(qtdDezenasPadrao);

  const faixas: FaixaProbabilidade[] = calcularProbabilidades(
    dezenaMax,
    qtdDezenasSorteadas,
    qtdApostada,
    faixasPremiadas
  );

  const faixaPrincipal = Math.max(...faixasPremiadas);

  return (
    <div>
      <div className="campo-filtro" style={{ margin: "24px 0" }}>
        <label htmlFor="qtdApostada">Dezenas apostadas</label>
        <input
          id="qtdApostada"
          type="number"
          min={qtdDezenasPadrao}
          max={Math.min(dezenaMax, qtdDezenasPadrao + QTD_EXTRA_DEZENAS_MAX)}
          value={qtdApostada}
          onChange={(e) => setQtdApostada(Number(e.target.value))}
        />
        <span className="campo-filtro__nota">
          Aposta mínima: {qtdDezenasPadrao} — apostas com mais dezenas custam mais caro, mas
          melhoram a chance
        </span>
      </div>

      <div className="tabela-scroll">
        <table className="tabela-dados">
        <thead>
          <tr>
            <th>Acertos</th>
            <th className="num">Combinações favoráveis</th>
            <th className="num">Total de combinações possíveis</th>
            <th className="num">Chance</th>
          </tr>
        </thead>
        <tbody>
          {faixas
            .slice()
            .sort((a, b) => b.acertos - a.acertos)
            .map((f) => (
              <tr key={f.acertos}>
                <td>
                  {f.acertos} pontos
                  {f.acertos === faixaPrincipal && (
                    <span className="chip chip--destaque" style={{ marginLeft: "8px" }}>
                      prêmio principal
                    </span>
                  )}
                </td>
                <td className="num">{f.combinacoesFavoraveis.toLocaleString("pt-BR")}</td>
                <td className="num">{f.totalCombinacoes.toLocaleString("pt-BR")}</td>
                <td className="num">1 em {f.umEm.toLocaleString("pt-BR")}</td>
              </tr>
            ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
