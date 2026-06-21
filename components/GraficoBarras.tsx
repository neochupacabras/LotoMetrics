"use client";

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
const COR_PINE = "#1e4b3c";
const COR_OCHRE = "#b9802c";
const COR_LINE = "#d8d4c5";
const COR_INK_SOFT = "#5b5847";
const COR_PAPEL_ELEVADO = "#f7f6f0";

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
        borderRadius: 4,
        padding: "6px 10px",
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
        color: "#1c1b17",
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

export default function GraficoBarras({
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
  if (vertical) {
    return (
      <ResponsiveContainer width="100%" height={Math.max(altura, dados.length * 26)}>
        <BarChart
          data={dados}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={COR_LINE} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: COR_INK_SOFT }}
            axisLine={{ stroke: COR_LINE }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="rotulo"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: COR_INK_SOFT }}
            axisLine={{ stroke: COR_LINE }}
            tickLine={false}
            width={70}
          />
          <Tooltip content={<TooltipPersonalizado rotuloValor={rotuloValor} />} cursor={{ fill: "rgba(30,75,60,0.06)" }} />
          <Bar dataKey="valor" radius={[0, 3, 3, 0]} maxBarSize={18}>
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
      <BarChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COR_LINE} vertical={false} />
        <XAxis
          dataKey="rotulo"
          tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: COR_INK_SOFT }}
          axisLine={{ stroke: COR_LINE }}
          tickLine={false}
          interval={dados.length > 20 ? Math.floor(dados.length / 12) : 0}
        />
        <YAxis
          tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: COR_INK_SOFT }}
          axisLine={{ stroke: COR_LINE }}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<TooltipPersonalizado rotuloValor={rotuloValor} />} cursor={{ fill: "rgba(30,75,60,0.06)" }} />
        {linhaReferencia && (
          <ReferenceLine
            y={linhaReferencia.valor}
            stroke={COR_OCHRE}
            strokeDasharray="4 4"
            label={{
              value: linhaReferencia.rotulo,
              position: "insideTopRight",
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              fill: COR_OCHRE,
            }}
          />
        )}
        <Bar dataKey="valor" radius={[3, 3, 0, 0]} maxBarSize={36}>
          {dados.map((d, i) => (
            <Cell key={i} fill={d.destaque ? COR_OCHRE : COR_PINE} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
