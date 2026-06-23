"use client";

import { useState } from "react";
import { formatarDezena } from "@/lib/format";
import type { Loteria } from "@/lib/types";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface PeriodoData {
  id: string;
  label: string;
  totalConcursos: number;
  frequencias: { dezena: number; frequencia: number }[];
  bloqueado?: boolean;
}

interface Props {
  loteria: Loteria;
  periodos: PeriodoData[];
  premium?: boolean;
  logado?: boolean;
}

// ─── Cores (hex do design system, hardcoded pois CSS vars não chegam ao JS) ──
// --paper: #efeee6  --ochre: #b9802c  --pine: #1e4b3c  --ink: #1c1b17
const COR_FRIA  = [239, 238, 230] as const; // --paper
const COR_MORNA = [228, 193, 137] as const; // --ochre-soft
const COR_QUENTE= [185, 128,  44] as const; // --ochre

function interpolarCor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  // 0–0.5: paper → ochre-soft; 0.5–1: ochre-soft → ochre
  const [a, b] = clamped < 0.5
    ? [COR_FRIA, COR_MORNA]
    : [COR_MORNA, COR_QUENTE];
  const k = clamped < 0.5 ? clamped * 2 : (clamped - 0.5) * 2;
  return `rgb(${Math.round(a[0]+(b[0]-a[0])*k)},${Math.round(a[1]+(b[1]-a[1])*k)},${Math.round(a[2]+(b[2]-a[2])*k)})`;
}

function corTexto(t: number): string {
  return t > 0.6 ? "#1c1b17" : "#1c1b17";  // sempre escuro nessa escala
}

// ─── Insight dinâmico baseado no período selecionado ─────────────────────────
function insightTexto(periodo: PeriodoData, loteria: Loteria): string {
  const { totalConcursos, frequencias } = periodo;
  const taxaSorteio = loteria.qtdDezenasSorteadas / (loteria.dezenaMax - loteria.dezenaMin + 1);
  const esperado = totalConcursos * taxaSorteio;
  const freqs = frequencias.map((f) => f.frequencia);
  const minFreq = Math.min(...freqs);
  const maxFreq = Math.max(...freqs);
  const variacaoPct = ((maxFreq - minFreq) / esperado * 100).toFixed(1);
  const dpEsperado = Math.sqrt(totalConcursos * taxaSorteio * (1 - taxaSorteio));

  if (totalConcursos >= 500) {
    return `Com ${totalConcursos.toLocaleString("pt-BR")} concursos, a variação entre a dezena mais e menos frequente é de apenas ${variacaoPct}% em relação à média — exatamente o esperado pela teoria estatística (±${(dpEsperado * 2).toFixed(0)} aparições dentro de 2 desvios padrão).`;
  } else {
    return `Com apenas ${totalConcursos} concursos, a variação aparente é de ${variacaoPct}% — bem maior do que o histórico completo. Isso não é uma tendência: é ruído estatístico. Períodos curtos sempre parecem mais "desiguais" mesmo num sorteio perfeitamente honesto.`;
  }
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function HeatmapPageClient({ loteria, periodos, premium = false, logado = false }: Props) {
  const [periodoId, setPeriodoId] = useState(periodos[0].id);
  const [hoverId, setHoverId] = useState<number | null>(null);

  const periodo = periodos.find((p) => p.id === periodoId) ?? periodos[0];
  const freqMap = new Map(periodo.frequencias.map((f) => [f.dezena, f.frequencia]));

  const allFreqs = periodo.frequencias.map((f) => f.frequencia);
  const minF = Math.min(...allFreqs);
  const maxF = Math.max(...allFreqs);
  const intervalo = maxF - minF || 1;

  const taxaSorteio = loteria.qtdDezenasSorteadas / (loteria.dezenaMax - loteria.dezenaMin + 1);
  const esperadoPorDezena = periodo.totalConcursos * taxaSorteio;
  const dpEsperado = Math.sqrt(periodo.totalConcursos * taxaSorteio * (1 - taxaSorteio));

  const todasDezenas = Array.from(
    { length: loteria.dezenaMax - loteria.dezenaMin + 1 },
    (_, i) => i + loteria.dezenaMin
  );

  const hoverData = hoverId != null ? freqMap.get(hoverId) : null;
  const hoverPct = hoverData != null ? (hoverData / periodo.totalConcursos * 100) : null;
  const hoverZ = hoverData != null ? (hoverData - esperadoPorDezena) / dpEsperado : null;

  return (
    <div className="heatmap-page">

      {/* Seletor de período */}
      <div className="heatmap-periodos">
        {periodos.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`heatmap-periodo-btn${p.bloqueado ? " heatmap-periodo-btn--bloqueado" : ""}`}
            data-ativo={p.id === periodoId}
            onClick={() => {
              if (!p.bloqueado) { setPeriodoId(p.id); setHoverId(null); }
              else { setPeriodoId(p.id); } // mostra overlay
            }}
          >
            {p.label}
            {p.bloqueado
              ? <span className="heatmap-periodo-meta">✦ Premium</span>
              : <span className="heatmap-periodo-meta">{p.totalConcursos.toLocaleString("pt-BR")} sorteios</span>
            }
          </button>
        ))}
      </div>

      {/* Overlay premium para períodos bloqueados */}
      {periodo.bloqueado && (
        <div className="heatmap-premium-overlay">
          <div className="heatmap-premium-overlay__card">
            <p className="heatmap-premium-overlay__icone">✦</p>
            <p className="heatmap-premium-overlay__titulo">Período Premium</p>
            <p className="heatmap-premium-overlay__desc">
              Compare a frequência das dezenas em períodos curtos — últimos 500, 100 e 50
              concursos — e observe como a variação muda conforme o tamanho da amostra.
            </p>
            <a href="/assinar" className="botao-gerar">
              Assinar Premium →
            </a>
            {!logado && (
              <a href="/entrar" className="heatmap-premium-overlay__entrar">
                Já tenho uma conta
              </a>
            )}
          </div>
        </div>
      )}

      {/* Painel de informação da dezena selecionada */}
      <div className="heatmap-info" data-visivel={hoverId != null}>
        {hoverId != null && hoverData != null && hoverPct != null && hoverZ != null ? (
          <>
            <span className="heatmap-info-dezena">Dezena {formatarDezena(hoverId)}</span>
            <div className="heatmap-info-dados">
              <div className="heatmap-info-item">
                <span className="heatmap-info-rotulo">Aparições</span>
                <span className="heatmap-info-valor">{hoverData.toLocaleString("pt-BR")}</span>
              </div>
              <div className="heatmap-info-item">
                <span className="heatmap-info-rotulo">% dos sorteios</span>
                <span className="heatmap-info-valor">{hoverPct.toFixed(1)}%</span>
              </div>
              <div className="heatmap-info-item">
                <span className="heatmap-info-rotulo">Esperado</span>
                <span className="heatmap-info-valor">{esperadoPorDezena.toFixed(0)} ({(taxaSorteio * 100).toFixed(1)}%)</span>
              </div>
              <div className="heatmap-info-item">
                <span className="heatmap-info-rotulo">Diferença</span>
                <span className="heatmap-info-valor" data-positivo={hoverData >= esperadoPorDezena}>
                  {hoverData >= esperadoPorDezena ? "+" : ""}
                  {(hoverData - esperadoPorDezena).toFixed(0)} ({hoverZ.toFixed(1)} dp)
                </span>
              </div>
            </div>
          </>
        ) : (
          <span className="heatmap-info-vazio">Passe o mouse sobre uma dezena para ver os detalhes</span>
        )}
      </div>

      {/* Grade do heatmap */}
      <div
        className="heatmap-grade"
        style={{ gridTemplateColumns: `repeat(${loteria.gridColunas}, 1fr)` }}
        onMouseLeave={() => setHoverId(null)}
      >
        {todasDezenas.map((d) => {
          const f = freqMap.get(d) ?? 0;
          const t = (f - minF) / intervalo;
          const bg = interpolarCor(t);
          const active = d === hoverId;
          return (
            <button
              key={d}
              type="button"
              className="heatmap-celula"
              data-ativa={active}
              style={{ background: bg, color: corTexto(t) }}
              onMouseEnter={() => setHoverId(d)}
              onClick={() => setHoverId(d === hoverId ? null : d)}
              aria-label={`Dezena ${d}: ${f} aparições`}
            >
              <span className="heatmap-celula-numero">{formatarDezena(d)}</span>
              <span className="heatmap-celula-freq">{f}</span>
            </button>
          );
        })}
      </div>

      {/* Legenda da escala de cores */}
      <div className="heatmap-legenda">
        <span className="heatmap-legenda-label">Menos frequente</span>
        <div className="heatmap-legenda-barra" />
        <span className="heatmap-legenda-label">Mais frequente</span>
        <span className="heatmap-legenda-media">
          Média esperada: {esperadoPorDezena.toFixed(0)} aparições ({(taxaSorteio * 100).toFixed(0)}% dos sorteios)
        </span>
      </div>

      {/* Insight educativo dinâmico */}
      <div className="heatmap-insight">
        <p>{insightTexto(periodo, loteria)}</p>
      </div>

    </div>
  );
}
