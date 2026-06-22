"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import type { AcumuloData } from "@/lib/queries";

// ─── Cores do design system (hardcoded para JS) ───────────────────────────────
const COR_PAPER  = "#efeee6";
const COR_OCHRE_SOFT = "#e4c189";
const COR_OCHRE  = "#b9802c";
const COR_PINE   = "#1e4b3c";
const COR_INK_FAINT = "#8c8874";

function corDuracao(dur: number): string {
  if (dur === 1)  return COR_OCHRE_SOFT;
  if (dur <= 3)   return "#d4a45a";
  if (dur <= 7)   return COR_OCHRE;
  if (dur <= 14)  return "#8c5e1a";
  return COR_PINE;
}

function formatarMilhoes(v: number): string {
  if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`;
  return `R$${(v / 1_000).toFixed(0)}K`;
}

function formatarData(s: string): string {
  if (!s) return "";
  const [ano, mes, dia] = s.split("-");
  return `${dia}/${mes}/${ano}`;
}

// ─── Tooltip personalizado ────────────────────────────────────────────────────
function TooltipPersonalizado({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d: AcumuloData = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="acumulos-tooltip">
      <p className="acumulos-tooltip-premio">{formatarMilhoes(d.premio)}</p>
      <div className="acumulos-tooltip-linha">
        <span>Concurso {d.concursoFim}</span>
        <span>{formatarData(d.dataFim)}</span>
      </div>
      <div className="acumulos-tooltip-linha">
        <span>{d.duracao} sorteio{d.duracao > 1 ? "s" : ""} acumulando</span>
        <span>{d.ganhadores} ganhador{d.ganhadores > 1 ? "es" : ""}</span>
      </div>
      {d.duracao > 1 && (
        <div className="acumulos-tooltip-periodo">
          {formatarData(d.dataInicio)} → {formatarData(d.dataFim)}
        </div>
      )}
    </div>
  );
}

// ─── Dot personalizado (tamanho e cor por duração) ────────────────────────────
function DotPersonalizado(props: any) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  const r = Math.max(3, Math.sqrt(payload.duracao) * 2.5);
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={corDuracao(payload.duracao)}
      fillOpacity={payload.duracao === 1 ? 0.5 : 0.85}
      stroke={payload.duracao > 7 ? COR_PINE : "none"}
      strokeWidth={1}
    />
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  acumulos: AcumuloData[];
  nomeLoteria: string;
  codigoLoteria: string;
}

type Filtro = "todos" | "3+" | "7+";

// ─── Componente principal ─────────────────────────────────────────────────────
export default function AcumulosClient({ acumulos, nomeLoteria }: Props) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [vistaRanking, setVistaRanking] = useState<"duracao" | "premio">("duracao");

  const acumulosFiltrados = useMemo(
    () =>
      filtro === "todos"
        ? acumulos
        : filtro === "3+"
        ? acumulos.filter((a) => a.duracao >= 3)
        : acumulos.filter((a) => a.duracao >= 7),
    [acumulos, filtro]
  );

  const top20 = useMemo(() => {
    const copia = [...acumulos];
    if (vistaRanking === "duracao") {
      return copia.sort((a, b) => b.duracao - a.duracao || b.premio - a.premio).slice(0, 20);
    } else {
      return copia.sort((a, b) => b.premio - a.premio).slice(0, 20);
    }
  }, [acumulos, vistaRanking]);

  // Estatísticas gerais
  const stats = useMemo(() => {
    if (!acumulos.length) return null;
    const maiorDuracao = Math.max(...acumulos.map((a) => a.duracao));
    const maiorPremio = Math.max(...acumulos.map((a) => a.premio));
    const mediaDuracao = acumulos.reduce((s, a) => s + a.duracao, 0) / acumulos.length;
    const acumulosMaisDeUm = acumulos.filter((a) => a.duracao > 1).length;
    return { maiorDuracao, maiorPremio, mediaDuracao, acumulosMaisDeUm };
  }, [acumulos]);

  const premioMax = useMemo(
    () => Math.max(...acumulos.map((a) => a.premio)),
    [acumulos]
  );

  const yTickFormatter = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return String(v);
  };

  if (!acumulos.length) {
    return (
      <p className="analisador-vazio">Nenhum dado de acúmulo disponível.</p>
    );
  }

  return (
    <div className="acumulos-wrapper">

      {/* ── Estatísticas rápidas ───────────────────────────────────────── */}
      {stats && (
        <div className="acumulos-stats">
          <div className="acumulos-stat">
            <span className="acumulos-stat-valor">{acumulos.length.toLocaleString("pt-BR")}</span>
            <span className="acumulos-stat-rotulo">acúmulos fechados</span>
          </div>
          <div className="acumulos-stat">
            <span className="acumulos-stat-valor">{stats.maiorDuracao}</span>
            <span className="acumulos-stat-rotulo">maior sequência (sorteios)</span>
          </div>
          <div className="acumulos-stat">
            <span className="acumulos-stat-valor">{formatarMilhoes(stats.maiorPremio)}</span>
            <span className="acumulos-stat-rotulo">maior prêmio pago</span>
          </div>
          <div className="acumulos-stat">
            <span className="acumulos-stat-valor">{stats.mediaDuracao.toFixed(1)}</span>
            <span className="acumulos-stat-rotulo">duração média (sorteios)</span>
          </div>
        </div>
      )}

      {/* ── Legenda de cores ───────────────────────────────────────────── */}
      <div className="acumulos-legenda-cores">
        {[1, 3, 7, 14, 20].map((n, i) => {
          const labels = ["1 sorteio", "2–3", "4–7", "8–14", "15+"];
          return (
            <span key={n} className="acumulos-legenda-item">
              <span
                className="acumulos-legenda-bolha"
                style={{
                  background: corDuracao(n),
                  width: `${Math.max(8, Math.sqrt(n) * 5)}px`,
                  height: `${Math.max(8, Math.sqrt(n) * 5)}px`,
                }}
              />
              {labels[i]}
            </span>
          );
        })}
        <span className="acumulos-legenda-hint">Tamanho = duração do acúmulo</span>
      </div>

      {/* ── Filtros do gráfico ─────────────────────────────────────────── */}
      <div className="acumulos-filtros">
        <span className="acumulos-filtros-label">Mostrar:</span>
        {(["todos", "3+", "7+"] as Filtro[]).map((f) => (
          <button
            key={f}
            type="button"
            className="heatmap-periodo-btn"
            data-ativo={filtro === f}
            onClick={() => setFiltro(f)}
            style={{ padding: "6px 12px" }}
          >
            {f === "todos"
              ? `Todos (${acumulos.length})`
              : f === "3+"
              ? `≥ 3 sorteios (${acumulos.filter((a) => a.duracao >= 3).length})`
              : `≥ 7 sorteios (${acumulos.filter((a) => a.duracao >= 7).length})`}
          </button>
        ))}
      </div>

      {/* ── Scatter chart ─────────────────────────────────────────────── */}
      <div className="acumulos-chart-wrapper">
        <ResponsiveContainer width="100%" height={380}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COR_PAPER} />
            <XAxis
              dataKey="concursoFim"
              type="number"
              domain={["dataMin", "dataMax"]}
              name="Concurso"
              tick={{ fontSize: 11, fill: COR_INK_FAINT, fontFamily: "var(--font-mono)" }}
              label={{ value: "Concurso", position: "insideBottomRight", offset: -4, fill: COR_INK_FAINT, fontSize: 11 }}
            />
            <YAxis
              dataKey="premio"
              type="number"
              name="Prêmio"
              tickFormatter={yTickFormatter}
              tick={{ fontSize: 11, fill: COR_INK_FAINT, fontFamily: "var(--font-mono)" }}
              width={48}
            />
            <Tooltip content={<TooltipPersonalizado />} cursor={{ strokeDasharray: "3 3" }} />
            <ReferenceLine
              y={premioMax * 0.5}
              stroke={COR_OCHRE_SOFT}
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <Scatter
              data={acumulosFiltrados}
              shape={<DotPersonalizado />}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <p className="acumulos-chart-nota">
        Cada ponto = um acúmulo fechado. Posição horizontal = momento histórico (número do concurso). Altura = prêmio pago. Tamanho e cor = duração do acúmulo.
      </p>

      {/* ── Ranking ────────────────────────────────────────────────────── */}
      <div className="acumulos-ranking">
        <div className="acumulos-ranking-header">
          <h2 className="bloco__titulo" style={{ margin: 0 }}>Recordes</h2>
          <div className="acumulos-ranking-toggle">
            <button
              type="button"
              className="heatmap-periodo-btn"
              data-ativo={vistaRanking === "duracao"}
              onClick={() => setVistaRanking("duracao")}
              style={{ padding: "5px 12px" }}
            >
              Mais longos
            </button>
            <button
              type="button"
              className="heatmap-periodo-btn"
              data-ativo={vistaRanking === "premio"}
              onClick={() => setVistaRanking("premio")}
              style={{ padding: "5px 12px" }}
            >
              Maiores prêmios
            </button>
          </div>
        </div>

        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th className="num">#</th>
                <th>Período</th>
                <th className="num">Sorteios</th>
                <th className="num">Prêmio</th>
                <th className="num">Ganhadores</th>
              </tr>
            </thead>
            <tbody>
              {top20.map((a, i) => (
                <tr key={`${a.concursoFim}-${i}`}>
                  <td className="num" style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>
                    {i + 1}
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
                      {a.duracao > 1
                        ? `${formatarData(a.dataInicio)} → ${formatarData(a.dataFim)}`
                        : formatarData(a.dataFim)}
                    </span>
                    <span style={{ color: "var(--ink-faint)", fontSize: "0.75rem", marginLeft: "8px", fontFamily: "var(--font-mono)" }}>
                      #{a.concursoFim}
                    </span>
                  </td>
                  <td className="num">
                    <span
                      className="acumulos-duracao-badge"
                      style={{ background: corDuracao(a.duracao) }}
                    >
                      {a.duracao}
                    </span>
                  </td>
                  <td className="num" style={{ fontFamily: "var(--font-mono)", color: "var(--ochre)" }}>
                    {formatarMilhoes(a.premio)}
                  </td>
                  <td className="num" style={{ fontFamily: "var(--font-mono)" }}>
                    {a.ganhadores}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
