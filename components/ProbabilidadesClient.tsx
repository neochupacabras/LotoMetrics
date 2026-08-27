"use client";

import { useState } from "react";
import { calcularProbabilidades, FaixaProbabilidade } from "@/lib/probabilidades";
import { qtdSorteiosPorSemana } from "@/lib/calendario";
import InsightCallout from "./InsightCallout";

const QTD_EXTRA_DEZENAS_MAX = 5;

export default function ProbabilidadesClient({
  codigoLoteria,
  dezenaMin,
  dezenaMax,
  qtdDezenasSorteadas,
  qtdDezenasPadrao,
  faixasPremiadas,
}: {
  codigoLoteria: string;
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenasSorteadas: number;
  qtdDezenasPadrao: number;
  faixasPremiadas: number[];
}) {
  const [qtdApostada, setQtdApostada] = useState(qtdDezenasPadrao);

  // Tamanho real do universo de dezenas — dezenaMax sozinho só coincide com
  // isso quando a loteria começa em 1 (todas, menos a Lotomania, que vai de
  // 0 a 99: 100 dezenas possíveis, não 99).
  const universoTotal = dezenaMax - dezenaMin + 1;

  const faixas: FaixaProbabilidade[] = calcularProbabilidades(
    universoTotal,
    qtdDezenasSorteadas,
    qtdApostada,
    faixasPremiadas
  );

  const faixaPrincipal = Math.max(...faixasPremiadas);
  const dadosFaixaPrincipal = faixas.find((f) => f.acertos === faixaPrincipal);

  // Traduz "1 em X" pra uma escala de tempo real, usando a frequência real
  // de sorteios da loteria — não é uma comparação externa (raio, avião),
  // é a própria matemática do site (mesma ideia de estimarDiasCorridos do
  // Atraso), então não precisa de nenhum fato novo pra verificar.
  const sorteiosPorSemana = qtdSorteiosPorSemana(codigoLoteria);
  const anosParaEsperarAcerto = dadosFaixaPrincipal
    ? dadosFaixaPrincipal.umEm / sorteiosPorSemana / 52
    : 0;

  return (
    <div>
      {dadosFaixaPrincipal && (
        <InsightCallout kicker="Pra sair da tabela e virar sensação">
          Apostando esse mesmo jogo em <strong>todo sorteio</strong> — sem pular nenhum —
          seriam necessários, em média,{" "}
          <strong>
            {anosParaEsperarAcerto >= 1000
              ? `${Math.round(anosParaEsperarAcerto).toLocaleString("pt-BR")} anos`
              : `${anosParaEsperarAcerto.toFixed(1)} anos`}
          </strong>{" "}
          pra esperar acertar a faixa principal uma única vez.
        </InsightCallout>
      )}
      <div className="campo-filtro" style={{ margin: "24px 0" }}>
        <label htmlFor="qtdApostada">Dezenas apostadas</label>
        <input
          id="qtdApostada"
          type="number"
          min={qtdDezenasPadrao}
          max={Math.min(universoTotal, qtdDezenasPadrao + QTD_EXTRA_DEZENAS_MAX)}
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
                  <span className="celula-acertos__pontos">{f.acertos} pontos</span>
                  {f.acertos === faixaPrincipal && (
                    <span className="chip chip--destaque chip--bloco">prêmio principal</span>
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
