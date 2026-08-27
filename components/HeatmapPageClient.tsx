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
// Densidade de tinta em cor única — do papel (--paper) ao destaque
// (--pine, agora terracota/coral) — em vez da antiga escala de 3 matizes.
// --paper: #f3f1ea  --pine: #c23b22  --ink: #17171a
const PAPEL = [243, 241, 234] as const; // --paper
const TINTA = [194,  59,  34] as const; // --pine

function interpolarCor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const r = PAPEL[0] + (TINTA[0] - PAPEL[0]) * clamped;
  const g = PAPEL[1] + (TINTA[1] - PAPEL[1]) * clamped;
  const b = PAPEL[2] + (TINTA[2] - PAPEL[2]) * clamped;
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

function corTexto(t: number): string {
  return t > 0.5 ? "#f3f1ea" : "#17171a"; // texto claro sobre tinta densa, escuro sobre papel
}

// ─── Insight dinâmico baseado no período selecionado ─────────────────────────
function insightTexto(periodo: PeriodoData, loteria: Loteria): string {
  const { totalConcursos, frequencias } = periodo;
  if (totalConcursos === 0) {
    return `Ainda não há concursos suficientes da ${loteria.nome} pra calcular essa estatística.`;
  }
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

// Mesma ideia do insightTexto acima, mas com a mecânica certa da Super
// Sete: cada concurso sorteia 7 dígitos independentes (um por coluna,
// 0-9 cada, com reposição) — não 1 dezena entre N como nas outras
// loterias. O "esperado" e o desvio padrão usam n = totalConcursos × 7
// tentativas com p = 1/10, não totalConcursos com a taxa da loteria.
function insightTextoSuperSete(periodo: PeriodoData): string {
  const { totalConcursos, frequencias } = periodo;
  if (totalConcursos === 0) {
    return "Ainda não há concursos suficientes da Super Sete pra calcular essa estatística.";
  }
  const n = totalConcursos * 7;
  const p = 1 / 10;
  const esperado = n * p;
  const dpEsperado = Math.sqrt(n * p * (1 - p));
  const freqs = frequencias.map((f) => f.frequencia);
  const minFreq = Math.min(...freqs);
  const maxFreq = Math.max(...freqs);
  const variacaoPct = ((maxFreq - minFreq) / esperado * 100).toFixed(1);

  if (totalConcursos >= 500) {
    return `Com ${totalConcursos.toLocaleString("pt-BR")} concursos — ${n.toLocaleString("pt-BR")} dígitos sorteados ao todo, contando as 7 colunas — a variação entre o valor mais e menos frequente é de apenas ${variacaoPct}% em relação à média — exatamente o esperado pela teoria estatística (±${(dpEsperado * 2).toFixed(0)} aparições dentro de 2 desvios padrão).`;
  }
  return `Com apenas ${totalConcursos} concursos, a variação aparente é de ${variacaoPct}% — bem maior do que o histórico completo. Isso não é uma tendência: é ruído estatístico. Períodos curtos sempre parecem mais "desiguais" mesmo num sorteio perfeitamente honesto.`;
}

// ─── Componente ──────────────────────────────────────────────────────────────


// ─── Heatmap especial para Super Sete: 7 colunas × 10 valores ────────────────
// Para a Super Sete, a análise relevante é por coluna (C1-C7), não por dezena.
// Cada coluna tem 10 valores possíveis (0-9) e a frequência de cada valor
// em cada coluna é o que tem significado estatístico.

function HeatmapSuperSete({
  periodo,
  totalConcursos,
}: {
  periodo: PeriodoData;
  totalConcursos: number;
}) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  // Para Super Sete precisamos das frequências por coluna
  // O banco armazena as 7 dezenas em ordem de coluna (C1=idx0 ... C7=idx6)
  // Mas getFrequenciaHeatmap retorna a frequência agregada por valor (0-9)
  // A visualização mais correta mostra: para cada coluna, qual valor saiu mais
  // Nota: a query atual soma todas as posições — para Super Sete precisamos de
  // uma nota explicando isso e mostrar o que temos disponível

  const freqMap = new Map(periodo.frequencias.map((f) => [f.dezena, f.frequencia]));
  const valores = Array.from({ length: 10 }, (_, i) => i); // 0-9
  const colunas = ["C1","C2","C3","C4","C5","C6","C7"];

  const allFreqs = periodo.frequencias.map((f) => f.frequencia);
  const minF = Math.min(...allFreqs, 0);
  const maxF = Math.max(...allFreqs, 1);
  const intervalo = maxF - minF || 1;

  // Cada concurso sorteia 7 dígitos (um por coluna) — o esperado por
  // valor soma as 7 chances, não só uma.
  const esperado = totalConcursos * 7 * (1/10);

  return (
    <div className="heatmap-supersete">
      <div className="heatmap-supersete__aviso">
        <strong>Como ler:</strong> cada linha representa um valor (0 a 9). A intensidade
        mostra com que frequência aquele valor saiu <em>em qualquer</em> das 7 colunas.
        Para análise por coluna individual, consulte as{" "}
        <a href="/supersete/tabelas/frequencia" className="breadcrumb">tabelas de frequência</a>.
      </div>
      <div className="heatmap-supersete__grid">
        {/* Cabeçalho */}
        <div className="heatmap-supersete__header-cell" />
        {colunas.map((c) => (
          <div key={c} className="heatmap-supersete__col-label">{c}</div>
        ))}
        {/* Linhas de valores */}
        {valores.map((v) => {
          const freq = freqMap.get(v) ?? 0;
          const t = (freq - minF) / intervalo;
          const bg = interpolarCor(t);
          const id = `v${v}`;
          return (
            <>
              <div key={`label-${v}`} className="heatmap-supersete__row-label">{v}</div>
              {colunas.map((_, ci) => (
                <button
                  key={`${v}-${ci}`}
                  type="button"
                  className="heatmap-supersete__cell"
                  data-ativa={hoverId === id}
                  style={{ background: bg }}
                  onMouseEnter={() => setHoverId(id)}
                  onMouseLeave={() => setHoverId(null)}
                  title={`Valor ${v}: ${freq} aparições total`}
                >
                  <span className="heatmap-supersete__freq">{freq}</span>
                </button>
              ))}
            </>
          );
        })}
      </div>
      <p className="heatmap-supersete__media">
        Média esperada por valor: {esperado.toFixed(0)} aparições — cada concurso sorteia 7
        dígitos (um por coluna), cada um com 10% de chance de ser esse valor.
      </p>

      {/* Insight educativo dinâmico — mesma ideia do heatmap principal,
          adaptado pra mecânica de 7 colunas independentes da Super Sete. */}
      <div className="heatmap-insight">
        <p>{insightTextoSuperSete(periodo)}</p>
      </div>
    </div>
  );
}

export default function HeatmapPageClient({ loteria, periodos, premium = false, logado = false }: Props) {
  const [periodoId, setPeriodoId] = useState(periodos[0].id);
  const [invertido, setInvertido] = useState(false);
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

      {/* Toggle quente / frio */}
      <div className="heatmap-toggle-wrapper">
        <div className="modo-toggle" style={{ alignSelf: "flex-start", marginBottom: 12 }}>
          <button
            type="button"
            className="modo-toggle__botao"
            data-ativo={!invertido}
            onClick={() => setInvertido(false)}
          >
            Mais frequentes
          </button>
          <button
            type="button"
            className="modo-toggle__botao"
            data-ativo={invertido}
            onClick={() => setInvertido(true)}
          >
            Menos frequentes
          </button>
        </div>
        {invertido && (
          <p className="heatmap-invertido-aviso">
            Dezenas frias não têm mais chance de sair do que quentes —
            a loteria não tem memória. Isso mostra o passado recente, não o futuro.
          </p>
        )}
      </div>

      {/* Grade do heatmap — Super Sete tem visualização especial por colunas */}
      {loteria.codigo === "supersete" ? (
        <HeatmapSuperSete periodo={periodo} totalConcursos={periodo.totalConcursos} />
      ) : (
      <div
        className="heatmap-grade"
        style={{ gridTemplateColumns: `repeat(${loteria.gridColunas}, 1fr)` }}
        onMouseLeave={() => setHoverId(null)}
      >
        {todasDezenas.map((d) => {
          const f = freqMap.get(d) ?? 0;
          const tBase = (f - minF) / intervalo;
          // Modo frio: menos frequente (tBase baixo) → t alto → azul mais intenso
          const t = invertido ? 1 - tBase : tBase;
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
      )}

      {/* Legenda da escala de cores */}
      <div className="heatmap-legenda">
        <span className="heatmap-legenda-label">
          {invertido ? "Mais frequente" : "Menos frequente"}
        </span>
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
