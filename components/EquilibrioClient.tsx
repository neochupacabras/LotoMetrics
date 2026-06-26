"use client";

import { useState, useTransition, useMemo } from "react";
import { calcularEquilibrioAction } from "@/lib/equilibrio-actions";
import type { ResultadoEquilibrio } from "@/lib/equilibrio";
import { formatarDezena } from "@/lib/format";

// ── Gauge SVG semicircular ────────────────────────────────────────────────────

function Gauge({ nota, cor }: { nota: number; cor: string }) {
  // Geometria: cx=120, cy=96, r=80, strokeW=16
  // viewBox 0 0 240 162 garante que topo (y=8) e texto (y~155) ficam visíveis
  const cx = 120, cy = 96, r = 80, sw = 16;

  function pt(angRad: number, raio: number) {
    return { x: cx + raio * Math.cos(angRad), y: cy + raio * Math.sin(angRad) };
  }

  // Arco de 180° (esquerda) a 0° (direita) — semicírculo superior
  const ps   = pt(Math.PI, r);                                // ponto esquerdo
  const pe   = pt(0, r);                                      // ponto direito
  const ang  = Math.PI - (Math.PI * nota / 100);             // ângulo da nota
  const pf   = pt(ang, r);                                    // ponto do arco preenchido
  const big  = nota > 50 ? 1 : 0;

  const track = `M ${ps.x} ${ps.y} A ${r} ${r} 0 0 1 ${pe.x} ${pe.y}`;
  const fill  = `M ${ps.x} ${ps.y} A ${r} ${r} 0 ${big} 1 ${pf.x} ${pf.y}`;

  // Agulha
  const tip  = pt(ang, r - 6);
  const b1   = pt(ang + Math.PI / 2, 9);
  const b2   = pt(ang - Math.PI / 2, 9);

  // Marcadores de zona nos limites das classificações
  const zonas = [35, 55, 75].map(v => {
    const a = Math.PI - (Math.PI * v / 100);
    return { i: pt(a, r - sw / 2 - 2), o: pt(a, r + sw / 2 + 2) };
  });

  return (
    <svg
      viewBox="0 0 240 162"
      className="equilibrio-gauge"
      aria-label={`Nota ${nota} de 100`}
      overflow="visible"
    >
      {/* Trilha cinza */}
      <path d={track} fill="none" stroke="#e8e6dc" strokeWidth={sw} strokeLinecap="round" />

      {/* Arco colorido */}
      {nota > 0 && (
        <path
          d={fill} fill="none" stroke={cor} strokeWidth={sw} strokeLinecap="round"
          style={{ transition: "stroke 0.5s ease" }}
        />
      )}

      {/* Divisores de zona */}
      {zonas.map((z, i) => (
        <line key={i} x1={z.i.x} y1={z.i.y} x2={z.o.x} y2={z.o.y} stroke="#fff" strokeWidth={2.5} />
      ))}

      {/* Agulha */}
      <polygon
        points={`${tip.x},${tip.y} ${b1.x},${b1.y} ${b2.x},${b2.y}`}
        fill={cor}
        style={{ transition: "all 0.5s ease" }}
      />
      <circle cx={cx} cy={cy} r={8} fill={cor} />
      <circle cx={cx} cy={cy} r={4} fill="#fff" />

      {/* Nota numérica abaixo do centro */}
      <text
        x={cx} y={cy + 34}
        textAnchor="middle" fontSize="34" fontWeight="bold"
        fontFamily="Georgia,serif" fill={cor}
        style={{ transition: "fill 0.4s" }}
      >
        {nota}
      </text>
      <text
        x={cx} y={cy + 50}
        textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#8c8874"
      >
        de 100
      </text>

      {/* Labels extremos */}
      <text x={ps.x + 6}  y={cy + 20} fontSize="9" fill="#8c8874" fontFamily="monospace">0</text>
      <text x={pe.x - 6}  y={cy + 20} fontSize="9" fill="#8c8874" fontFamily="monospace" textAnchor="end">100</text>
    </svg>
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

          {/* Gauge + nota */}
          <div className="equilibrio-gauge-section">
            <Gauge nota={resultado.nota} cor={resultado.cor} />
            <div className="equilibrio-classificacao">
              <span
                className="equilibrio-classificacao__badge"
                style={{ background: resultado.cor }}
              >
                {resultado.classificacao === "tipico"      && "Muito típico"}
                {resultado.classificacao === "equilibrado" && "Equilibrado"}
                {resultado.classificacao === "razoavel"    && "Razoável"}
                {resultado.classificacao === "atipico"     && "Atípico"}
              </span>
              <p className="equilibrio-classificacao__desc">
                {resultado.descricaoClassificacao}
              </p>
              <p className="equilibrio-classificacao__base">
                Baseado em {resultado.totalConcursosHistorico.toLocaleString("pt-BR")} concursos históricos da {nomeLoteria}
              </p>
            </div>
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
