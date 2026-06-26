"use client";

import { useState, useTransition, useMemo } from "react";
import { calcularEquilibrioAction } from "@/lib/equilibrio-actions";
import type { ResultadoEquilibrio } from "@/lib/equilibrio";
import { formatarDezena } from "@/lib/format";

// ── Gauge SVG semicircular ────────────────────────────────────────────────────

function ScoreCard({ nota, cor, classificacao, descricao }: {
  nota: number;
  cor: string;
  classificacao: string;
  descricao: string;
}) {
  const labels: Record<string, string> = {
    tipico:      "Muito típico",
    equilibrado: "Equilibrado",
    razoavel:    "Razoável",
    atipico:     "Atípico",
  };

  return (
    <div className="equilibrio-scorecard">
      <div className="equilibrio-scorecard__nota" style={{ color: cor }}>
        {nota}
        <span className="equilibrio-scorecard__de100">/100</span>
      </div>
      <div className="equilibrio-scorecard__badge" style={{ background: cor }}>
        {labels[classificacao] ?? classificacao}
      </div>
      <p className="equilibrio-scorecard__desc">{descricao}</p>
    </div>
  );
}

// ── Barra de métrica ──────────────────────────────────────────────────────────

function BarraMetrica({ metrica }: { metrica: ResultadoEquilibrio["metricas"][0] }) {
  const cor =
    metrica.score >= 75 ? "#166534" :
    metrica.score >= 55 ? "#1e4b3c" :
    metrica.score >= 35 ? "#b9802c" : "#8e3a2a";

  return (
    <div className="equilibrio-metrica">
      <div className="equilibrio-metrica__header">
        <span className="equilibrio-metrica__nome">{metrica.nome}</span>
        <span className="equilibrio-metrica__descricao">{metrica.descricao}</span>
        <span className="equilibrio-metrica__score" style={{ color: cor }}>
          {metrica.score}
        </span>
      </div>
      <div className="equilibrio-metrica__barra-track">
        <div
          className="equilibrio-metrica__barra-fill"
          style={{ width: `${metrica.score}%`, background: cor }}
        />
      </div>
      <div className="equilibrio-metrica__pct">
        {metrica.percentilHistorico > 0
          ? `${metrica.percentilHistorico.toFixed(1)}% dos sorteios históricos têm este valor`
          : "Valor raro no histórico"}
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  codigoLoteria: string;
  nomeLoteria: string;
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenasSorteadas: number;
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function EquilibrioClient({
  codigoLoteria, nomeLoteria, dezenaMin, dezenaMax, qtdDezenasSorteadas,
}: Props) {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [resultado, setResultado] = useState<ResultadoEquilibrio | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const todas = useMemo(
    () => Array.from({ length: dezenaMax - dezenaMin + 1 }, (_, i) => dezenaMin + i),
    [dezenaMin, dezenaMax]
  );

  function toggle(d: number) {
    setSelecionadas(prev => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else if (next.size < qtdDezenasSorteadas) next.add(d);
      return next;
    });
    // Limpar resultado ao mudar as dezenas
    setResultado(null);
    setErro(null);
  }

  function handleCalcular() {
    const dezenas = Array.from(selecionadas).sort((a, b) => a - b);
    startTransition(async () => {
      setErro(null);
      const res = await calcularEquilibrioAction(codigoLoteria, dezenas);
      if ("erro" in res) setErro(res.erro);
      else setResultado(res);
    });
  }

  const completo = selecionadas.size === qtdDezenasSorteadas;

  return (
    <div className="equilibrio-wrapper">
      {/* Seletor de dezenas */}
      <div className="bloco">
        <p className="bloco__nota">
          Selecione as {qtdDezenasSorteadas} dezenas do jogo que quer analisar.
        </p>
        <div className="grade-dezenas">
          {todas.map(d => (
            <button
              key={d}
              type="button"
              className="dezena-selecionavel"
              data-selecionada={selecionadas.has(d)}
              disabled={!selecionadas.has(d) && selecionadas.size >= qtdDezenasSorteadas}
              onClick={() => toggle(d)}
            >
              {formatarDezena(d)}
            </button>
          ))}
        </div>

        {/* Progresso */}
        <div className="analisador-progresso-wrapper">
          <div className="analisador-progresso-fundo">
            <div
              className="analisador-progresso-fill"
              data-completo={completo}
              style={{ width: `${(selecionadas.size / qtdDezenasSorteadas) * 100}%` }}
            />
          </div>
          <span className="analisador-progresso-label">
            {selecionadas.size} de {qtdDezenasSorteadas} dezenas
          </span>
        </div>

        {erro && <p className="simulador-erro">{erro}</p>}

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button
            type="button"
            className="botao-gerar"
            disabled={!completo || pending}
            onClick={handleCalcular}
          >
            {pending ? "Calculando…" : "Calcular índice →"}
          </button>
          {selecionadas.size > 0 && (
            <button
              type="button"
              className="botao-copiar"
              onClick={() => { setSelecionadas(new Set()); setResultado(null); }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="equilibrio-resultado">

          {/* Score card */}
          <div className="equilibrio-score-section">
            <ScoreCard
              nota={resultado.nota}
              cor={resultado.cor}
              classificacao={resultado.classificacao}
              descricao={resultado.descricaoClassificacao}
            />
            <p className="equilibrio-classificacao__base">
              Baseado em {resultado.totalConcursosHistorico.toLocaleString("pt-BR")} concursos históricos da {nomeLoteria}
            </p>
          </div>

          {/* Detalhamento por métrica */}
          <div className="bloco equilibrio-metricas-secao">
            <h2 className="bloco__titulo">Detalhamento por critério</h2>
            <p className="bloco__nota" style={{ marginBottom: 20 }}>
              Cada barra mostra o quão comum é aquela característica no histórico.
              100 = característca muito frequente nos sorteios; 0 = raramente observada.
            </p>
            <div className="equilibrio-metricas-lista">
              {resultado.metricas.map(m => (
                <BarraMetrica key={m.nome} metrica={m} />
              ))}
            </div>
          </div>

          {/* Aviso educativo */}
          <div className="aviso-legal">
            <strong>Lembre-se:</strong> um índice alto não aumenta a probabilidade de
            premiação. Um jogo "atípico" com nota 10 tem exatamente a mesma chance de
            ganhar que um "muito típico" com nota 95 — porque cada sorteio é um evento
            aleatório e independente. O índice descreve o padrão histórico, não o futuro.
          </div>
        </div>
      )}
    </div>
  );
}
