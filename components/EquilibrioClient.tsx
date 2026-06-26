"use client";

import { useState, useTransition, useMemo } from "react";
import { calcularEquilibrioAction, type ResultadoEquilibrio } from "@/lib/equilibrio-actions";
import { formatarDezena } from "@/lib/format";

// ── Gauge SVG semicircular ────────────────────────────────────────────────────

function Gauge({ nota, cor }: { nota: number; cor: string }) {
  const cx = 120, cy = 120, r = 90;
  const strokeW = 16;

  // Semicírculo: de 180° (esquerda) até 0° (direita), passando pelo topo
  // Em SVG: ângulo 0 = direita, crescente clockwise
  // Queremos de -180° a 0° (metade superior)
  const angStart = Math.PI;       // 180° = esquerda
  const angEnd   = 0;             // 0° = direita

  function polar(angRad: number, raio: number) {
    return {
      x: cx + raio * Math.cos(angRad),
      y: cy + raio * Math.sin(angRad),
    };
  }

  // Trilha de fundo (semicírculo cinza)
  const ps = polar(angStart, r);
  const pe = polar(angEnd, r);
  const trackPath = `M ${ps.x} ${ps.y} A ${r} ${r} 0 0 1 ${pe.x} ${pe.y}`;

  // Arco preenchido proporcional à nota
  const angFill = angStart + (angEnd - angStart) * (nota / 100); // de 180° → 0°, angEnd < angStart
  const fillAngle = Math.PI - (Math.PI * nota / 100); // de 180° até 0°
  const pFill = polar(fillAngle, r);
  const largeArc = nota > 50 ? 1 : 0;
  const fillPath = `M ${ps.x} ${ps.y} A ${r} ${r} 0 ${largeArc} 1 ${pFill.x} ${pFill.y}`;

  // Marcadores de zona (0, 35, 55, 75, 100)
  const marcadores = [0, 35, 55, 75, 100].map(v => {
    const ang = Math.PI - (Math.PI * v / 100);
    const inner = polar(ang, r - strokeW / 2 - 4);
    const outer = polar(ang, r + strokeW / 2 + 4);
    return { inner, outer, v };
  });

  // Ponteiro (agulha)
  const angAgulha = Math.PI - (Math.PI * nota / 100);
  const pAgulhaTip = polar(angAgulha, r - 4);
  const pAgulhaBase1 = polar(angAgulha + Math.PI / 2, 8);
  const pAgulhaBase2 = polar(angAgulha - Math.PI / 2, 8);

  return (
    <svg viewBox="0 0 240 140" className="equilibrio-gauge" aria-label={`Nota ${nota} de 100`}>
      {/* Definições de gradiente */}
      <defs>
        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#8e3a2a" />
          <stop offset="35%"  stopColor="#b9802c" />
          <stop offset="55%"  stopColor="#1e4b3c" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
      </defs>

      {/* Trilha de fundo */}
      <path
        d={trackPath}
        fill="none"
        stroke="#e8e6dc"
        strokeWidth={strokeW}
        strokeLinecap="round"
      />

      {/* Arco colorido */}
      {nota > 0 && (
        <path
          d={fillPath}
          fill="none"
          stroke={cor}
          strokeWidth={strokeW}
          strokeLinecap="round"
          style={{ transition: "all 0.6s ease" }}
        />
      )}

      {/* Marcadores de zona */}
      {marcadores.slice(1, -1).map(({ inner, outer, v }) => (
        <line
          key={v}
          x1={inner.x} y1={inner.y}
          x2={outer.x} y2={outer.y}
          stroke="#ffffff"
          strokeWidth={2}
        />
      ))}

      {/* Agulha */}
      <polygon
        points={`${pAgulhaTip.x},${pAgulhaTip.y} ${pAgulhaBase1.x},${pAgulhaBase1.y} ${pAgulhaBase2.x},${pAgulhaBase2.y}`}
        fill={cor}
        style={{ transition: "all 0.6s ease" }}
      />
      <circle cx={cx} cy={cy} r={7} fill={cor} />
      <circle cx={cx} cy={cy} r={4} fill="#ffffff" />

      {/* Nota central */}
      <text
        x={cx} y={cy + 30}
        textAnchor="middle"
        fontSize="32"
        fontWeight="bold"
        fontFamily="Georgia, serif"
        fill={cor}
        style={{ transition: "fill 0.4s ease" }}
      >
        {nota}
      </text>
      <text
        x={cx} y={cy + 46}
        textAnchor="middle"
        fontSize="10"
        fontFamily="monospace"
        fill="#8c8874"
        textDecoration="none"
      >
        de 100
      </text>

      {/* Labels das zonas */}
      <text x="14"  y={cy + 20} fontSize="9" fill="#8c8874" fontFamily="monospace">0</text>
      <text x="218" y={cy + 20} fontSize="9" fill="#8c8874" fontFamily="monospace" textAnchor="end">100</text>
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
