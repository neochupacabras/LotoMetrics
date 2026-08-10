"use client";
import { useState, useMemo } from "react";

export function SimuladorPesquisaEleitoral() {
  const [percentualReal, setPercentualReal] = useState(50); // % real do Candidato A na população
  const [tamanhoAmostra, setTamanhoAmostra] = useState(2000);
  const [semente, setSemente] = useState(0); // força re-simular

  const { estimativa, margemErro, intervaloBaixo, intervaloAlto } = useMemo(() => {
    // Simula uma amostra aleatória de `tamanhoAmostra` pessoas de uma população
    // com percentualReal% preferindo o Candidato A.
    let votosA = 0;
    const p = percentualReal / 100;
    for (let i = 0; i < tamanhoAmostra; i++) {
      if (Math.random() < p) votosA++;
    }
    const estimativaAmostral = (votosA / tamanhoAmostra) * 100;

    // Margem de erro para 95% de confiança (aproximação para p=0.5, o pior caso)
    const erro = 1.96 * Math.sqrt(0.25 / tamanhoAmostra) * 100;

    return {
      estimativa: estimativaAmostral,
      margemErro: erro,
      intervaloBaixo: Math.max(0, estimativaAmostral - erro),
      intervaloAlto: Math.min(100, estimativaAmostral + erro),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentualReal, tamanhoAmostra, semente]);

  return (
    <div className="mat-interativo">
      <p className="mat-interativo__titulo">🗳️ Simulador: uma amostra reflete a população?</p>
      <div className="mat-interativo__controles">
        <div className="mat-interativo__campo">
          <label>% real do Candidato A na população (você define, como um "gabarito")</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={20} max={80} value={percentualReal} onChange={e => setPercentualReal(+e.target.value)} />
            <span className="mat-interativo__valor">{percentualReal}%</span>
          </div>
        </div>
        <div className="mat-interativo__campo">
          <label>Tamanho da amostra (pessoas entrevistadas)</label>
          <div className="mat-interativo__slider-wrap">
            <input type="range" min={100} max={5000} step={100} value={tamanhoAmostra} onChange={e => setTamanhoAmostra(+e.target.value)} />
            <span className="mat-interativo__valor">{tamanhoAmostra.toLocaleString("pt-BR")}</span>
          </div>
        </div>
      </div>

      <button type="button" className="botao-copiar" onClick={() => setSemente(s => s + 1)} style={{ fontSize: "0.82rem", marginTop: 4 }}>
        🎲 Simular nova pesquisa
      </button>

      <div className="mat-interativo__resultado">
        <div className="mat-resultado-numero">{estimativa.toFixed(1)}%</div>
        <div className="mat-resultado-desc">estimativa desta pesquisa simulada para o Candidato A</div>
        <div className="mat-resultado-extra">
          Margem de erro: ±{margemErro.toFixed(1)} pontos (intervalo de {intervaloBaixo.toFixed(1)}% a {intervaloAlto.toFixed(1)}%) —
          o valor real que você definiu foi <strong>{percentualReal}%</strong>.
          {" "}Clique em &quot;simular nova pesquisa&quot; várias vezes: a estimativa varia a cada simulação,
          mas fica quase sempre dentro da margem de erro do valor real.
        </div>
      </div>
    </div>
  );
}
