"use client";

import { memo, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";

// Paleta derivada diretamente dos tokens de app/globals.css — não usar
// var(--...) aqui porque o Recharts define fill como atributo SVG puro,
// que não resolve custom properties de forma confiável entre navegadores.
const COR_PINE = "#c23b22";
const COR_OCHRE = "#b9802c";
const COR_LINE = "#d4d2c8";
const COR_INK_SOFT = "#4a4a45";
const COR_PAPEL_ELEVADO = "#faf9f4";

// Props do Recharts com identidade estável. No Recharts 3 eixos e ticks
// ficam num store interno (redux): objeto novo em `tick`, `axisLine` ou
// `margin` a cada render faz os efeitos de layout despacharem de novo
// (setRenderedTicks/removeRenderedTicks). Em alguns celulares a medição
// dos ticks não estabiliza e isso virava "Maximum update depth exceeded"
// no Conferidor (LOTOANALITICA-5 e LOTOANALITICA-H).
const TICK = { fontSize: 11, fontFamily: "var(--font-mono)", fill: COR_INK_SOFT };
const AXIS_LINE = { stroke: COR_LINE };
const CURSOR = { fill: "rgba(30,75,60,0.06)" };
const MARGEM_VERTICAL = { top: 4, right: 24, left: 4, bottom: 4 };
const MARGEM_HORIZONTAL = { top: 8, right: 8, left: 0, bottom: 8 };
const RAIO: [number, number, number, number] = [0, 0, 0, 0];

export interface BarraDado {
  rotulo: string;
  valor: number;
  destaque?: boolean;
}

function TooltipPersonalizado({
  active,
  payload,
  rotuloValor,
}: {
  active?: boolean;
  payload?: { payload: BarraDado }[];
  rotuloValor?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const dado = payload[0].payload;
  return (
    <div
      style={{
        background: COR_PAPEL_ELEVADO,
        border: `1px solid ${COR_LINE}`,
        borderRadius: 0,
        padding: "6px 10px",
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
        color: "#17171a",
      }}
    >
      <div>{dado.rotulo}</div>
      <div style={{ color: COR_INK_SOFT }}>
        {dado.valor}
        {rotuloValor ? ` ${rotuloValor}` : ""}
      </div>
    </div>
  );
}

function GraficoBarras({
  dados,
  altura = 260,
  rotuloValor,
  linhaReferencia,
  vertical = false,
}: {
  dados: BarraDado[];
  altura?: number;
  rotuloValor?: string;
  linhaReferencia?: { valor: number; rotulo: string };
  vertical?: boolean;
}) {
  const tooltip = useMemo(() => <TooltipPersonalizado rotuloValor={rotuloValor} />, [rotuloValor]);
  const rotuloReferencia = useMemo(
    () =>
      linhaReferencia
        ? {
            value: linhaReferencia.rotulo,
            position: "insideTopRight" as const,
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            fill: COR_OCHRE,
          }
        : undefined,
    [linhaReferencia?.rotulo] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (vertical) {
    return (
      <ResponsiveContainer width="100%" height={Math.max(altura, dados.length * 26)}>
        <BarChart
          data={dados}
          layout="vertical"
          margin={MARGEM_VERTICAL}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={COR_LINE} horizontal={false} />
          <XAxis
            type="number"
            tick={TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="rotulo"
            tick={TICK}
            axisLine={AXIS_LINE}
            tickLine={false}
            width={70}
          />
          <Tooltip content={tooltip} cursor={CURSOR} />
          <Bar dataKey="valor" radius={RAIO} maxBarSize={18}>
            {dados.map((d, i) => (
              <Cell key={i} fill={d.destaque ? COR_OCHRE : COR_PINE} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={dados} margin={MARGEM_HORIZONTAL}>
        <CartesianGrid strokeDasharray="3 3" stroke={COR_LINE} vertical={false} />
        <XAxis
          dataKey="rotulo"
          tick={TICK}
          axisLine={AXIS_LINE}
          tickLine={false}
          interval={dados.length > 20 ? Math.floor(dados.length / 12) : 0}
        />
        <YAxis
          tick={TICK}
          axisLine={AXIS_LINE}
          tickLine={false}
          width={36}
        />
        <Tooltip content={tooltip} cursor={CURSOR} />
        {linhaReferencia && (
          <ReferenceLine
            y={linhaReferencia.valor}
            stroke={COR_OCHRE}
            strokeDasharray="4 4"
            label={rotuloReferencia}
          />
        )}
        <Bar dataKey="valor" radius={RAIO} maxBarSize={36}>
          {dados.map((d, i) => (
            <Cell key={i} fill={d.destaque ? COR_OCHRE : COR_PINE} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default memo(GraficoBarras);
