"use client";

import { useState, useTransition, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { simularHistorico, type ResultadoSimulacao } from "@/lib/simulador-actions";
import { formatarDezena } from "@/lib/format";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatarReais(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${v < 0 ? "-" : ""}R$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${v < 0 ? "-" : ""}R$${(abs / 1_000).toFixed(0)}K`;
  return `${v < 0 ? "-" : ""}R$${abs.toFixed(2)}`;
}

function formatarReaisSimples(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Tooltip personalizado do gráfico ────────────────────────────────────────
function TooltipGrafico({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const saldo = payload[0]?.value as number;
  return (
    <div style={{
      background: "#1c1b17", color: "#efeee6",
      padding: "10px 14px", borderRadius: "4px",
      fontFamily: "var(--font-mono)", fontSize: "0.78rem",
    }}>
      <div style={{ marginBottom: 4, opacity: 0.65 }}>Concurso {label}</div>
      <div style={{ color: saldo >= 0 ? "#b9802c" : "#e4c189", fontWeight: 700 }}>
        {formatarReais(saldo)}
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  codigoLoteria: string;
  nomeLoteria: string;
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenasSorteadas: number;
  limiteHistorico?: number | null; // null = histórico completo (premium)
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function SimuladorHistoricoClient({
  codigoLoteria,
  nomeLoteria,
  dezenaMin,
  dezenaMax,
  qtdDezenasSorteadas,
  limiteHistorico = null,
}: Props) {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const todasDezenas = useMemo(
    () => Array.from({ length: dezenaMax - dezenaMin + 1 }, (_, i) => i + dezenaMin),
    [dezenaMin, dezenaMax]
  );

  function toggle(d: number) {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else if (next.size < qtdDezenasSorteadas) next.add(d);
      return next;
    });
  }

  function limpar() {
    setSelecionadas(new Set());
    setResultado(null);
    setErro(null);
  }

  function handleSimular() {
    const dezenas = Array.from(selecionadas).sort((a, b) => a - b);
    startTransition(async () => {
      setErro(null);
      const res = await simularHistorico(codigoLoteria, dezenas, limiteHistorico ?? undefined);
      if ("erro" in res) {
        setErro(res.erro);
      } else {
        setResultado(res);
      }
    });
  }

  const dezenas = Array.from(selecionadas).sort((a, b) => a - b);
  const completo = selecionadas.size === qtdDezenasSorteadas;

  // Amostrar o gráfico para melhor performance (1 em cada N pontos)
  const graficoAmostrado = useMemo(() => {
    if (!resultado) return [];
    const { grafico } = resultado;
    if (grafico.length <= 500) return grafico;
    const passo = Math.ceil(grafico.length / 500);
    const amostrado = grafico.filter((_, i) => i % passo === 0);
    // Garantir que o último ponto aparece
    if (amostrado[amostrado.length - 1] !== grafico[grafico.length - 1]) {
      amostrado.push(grafico[grafico.length - 1]);
    }
    return amostrado;
  }, [resultado]);

  const yMin = useMemo(
    () => resultado ? Math.min(0, ...graficoAmostrado.map((p) => p.saldo)) : 0,
    [resultado, graficoAmostrado]
  );

  return (
    <div className="simulador-hist-wrapper">

      {/* ── Seleção de dezenas ──────────────────────────────────────── */}
      {!resultado && (
        <div className="bloco">
          <p className="analisador-instrucao">
            Escolha as {qtdDezenasSorteadas} dezenas que você jogaria em todo
            concurso — a simulação verifica esse jogo em cada sorteio da história
            da {nomeLoteria}.
          </p>

          <div className="grade-dezenas">
            {todasDezenas.map((d) => (
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

          {erro && <p style={{ color: "var(--rust)", fontFamily: "var(--font-mono)", fontSize: "0.85rem", marginTop: "12px" }}>{erro}</p>}

          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button
              type="button"
              className="botao-gerar"
              disabled={!completo || pending}
              onClick={handleSimular}
            >
              {pending ? "Simulando…" : "Simular →"}
            </button>
            {selecionadas.size > 0 && (
              <button type="button" className="botao-copiar" onClick={limpar}>
                Limpar
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Resultados ──────────────────────────────────────────────── */}
      {resultado && (
        <>
          {/* Dezenas usadas */}
          <div className="simulador-hist-jogo">
            <span className="simulador-hist-jogo-label">Jogo simulado:</span>
            {dezenas.map((d) => (
              <span key={d} className="simulador-hist-dezena">
                {formatarDezena(d)}
              </span>
            ))}
            <button type="button" className="botao-copiar simulador-hist-refazer" onClick={limpar}>
              Simular outro jogo
            </button>
          </div>

          {/* Cards de resumo */}
          <div className="simulador-hist-cards">
            <div className="simulador-hist-card">
              <span className="simulador-hist-card-rotulo">Total gasto</span>
              <span className="simulador-hist-card-valor" style={{ color: "var(--rust)" }}>
                {formatarReaisSimples(resultado.totalGasto)}
              </span>
              <span className="simulador-hist-card-detalhe">
                {resultado.totalConcursos.toLocaleString("pt-BR")} concursos × {formatarReaisSimples(resultado.precoAposta)}
              </span>
            </div>
            <div className="simulador-hist-card">
              <span className="simulador-hist-card-rotulo">Total ganho</span>
              <span className="simulador-hist-card-valor" style={{ color: "var(--pine)" }}>
                {formatarReaisSimples(resultado.totalGanho)}
              </span>
              <span className="simulador-hist-card-detalhe">
                em {resultado.porFaixa.reduce((s, f) => s + f.qtd, 0)} prêmios recebidos
              </span>
            </div>
            <div className="simulador-hist-card">
              <span className="simulador-hist-card-rotulo">Saldo final</span>
              <span
                className="simulador-hist-card-valor"
                style={{ color: resultado.saldoFinal >= 0 ? "var(--pine)" : "var(--rust)" }}
              >
                {formatarReaisSimples(resultado.saldoFinal)}
              </span>
              <span className="simulador-hist-card-detalhe">
                {resultado.saldoFinal < 0 ? "prejuízo acumulado" : "lucro acumulado"}
              </span>
            </div>
            <div className="simulador-hist-card">
              <span className="simulador-hist-card-rotulo">Retorno</span>
              <span className="simulador-hist-card-valor">
                {resultado.retornoPct.toFixed(1)}%
              </span>
              <span className="simulador-hist-card-detalhe">
                média teórica: ~43%
              </span>
            </div>
          </div>

          {/* Gráfico de evolução do saldo */}
          <div className="simulador-hist-chart-section">
            <h2 className="bloco__titulo">Evolução do saldo</h2>
            <p className="simulador-hist-chart-nota">
              Saldo cumulativo ao longo de todos os {resultado.totalConcursos.toLocaleString("pt-BR")} concursos.
              Cada pico para cima é um prêmio recebido.
            </p>
            <div className="simulador-hist-chart">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart
                  data={graficoAmostrado}
                  margin={{ top: 10, right: 16, bottom: 20, left: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#d8d4c5" />
                  <XAxis
                    dataKey="numero"
                    tick={{ fontSize: 11, fill: "#8c8874", fontFamily: "var(--font-mono)" }}
                    label={{ value: "Concurso", position: "insideBottomRight", offset: -4, fill: "#8c8874", fontSize: 11 }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#8c8874", fontFamily: "var(--font-mono)" }}
                    tickFormatter={(v) => formatarReais(v)}
                    domain={[yMin * 1.05, "auto"]}
                    width={72}
                  />
                  <Tooltip content={<TooltipGrafico />} />
                  <ReferenceLine y={0} stroke="#1e4b3c" strokeWidth={1.5} strokeDasharray="6 3" />
                  <Line
                    type="monotone"
                    dataKey="saldo"
                    stroke="#b9802c"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Prêmios por faixa */}
          <div className="simulador-hist-faixas">
            <h2 className="bloco__titulo">Prêmios recebidos por faixa</h2>
            <div className="tabela-scroll">
              <table className="tabela-dados">
                <thead>
                  <tr>
                    <th>Faixa</th>
                    <th className="num">Vezes</th>
                    <th className="num">Total recebido</th>
                    <th className="num">Média por prêmio</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.porFaixa.map((f) => (
                    <tr key={f.acertos}>
                      <td>{f.descricao}</td>
                      <td className="num" style={{ fontFamily: "var(--font-mono)" }}>
                        {f.qtd > 0 ? f.qtd.toLocaleString("pt-BR") : "—"}
                      </td>
                      <td className="num" style={{ fontFamily: "var(--font-mono)", color: f.ganhoTotal > 0 ? "var(--pine)" : "var(--ink-faint)" }}>
                        {f.ganhoTotal > 0 ? formatarReaisSimples(f.ganhoTotal) : "—"}
                      </td>
                      <td className="num" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-soft)" }}>
                        {f.qtd > 0 ? formatarReaisSimples(f.ganhoTotal / f.qtd) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Melhores jogadas */}
          {resultado.melhores.length > 0 && (
            <div className="simulador-hist-melhores">
              <h2 className="bloco__titulo">Maiores prêmios recebidos</h2>
              <div className="tabela-scroll">
                <table className="tabela-dados">
                  <thead>
                    <tr>
                      <th className="num">Concurso</th>
                      <th>Faixa</th>
                      <th className="num">Prêmio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.melhores.map((m) => (
                      <tr key={m.numero}>
                        <td className="num" style={{ fontFamily: "var(--font-mono)" }}>
                          #{m.numero}
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                          {m.acertos} acertos
                        </td>
                        <td className="num" style={{ fontFamily: "var(--font-mono)", color: "var(--pine)", fontWeight: 700 }}>
                          {formatarReaisSimples(m.premio)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="aviso-legal">
            Esta simulação usa os prêmios históricos reais pagos em cada concurso.
            Nenhuma combinação específica tem chance maior de ganhar do que qualquer
            outra — o resultado acima reflete o custo real de jogar consistentemente,
            aplicado a essa combinação específica no passado.
          </div>
        </>
      )}
    </div>
  );
}
