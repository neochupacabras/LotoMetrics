"use client";

import { useState, useTransition, useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid, Legend,
} from "recharts";
import {
  compararEstrategias,
  type FiltroEstrategia,
  type ResultadoEstrategia,
  type ResultadoComparacao,
} from "@/lib/estrategia-actions";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatarReais(v: number): string {
  const abs = Math.abs(v);
  const s = v < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${s}R$${(abs/1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${s}R$${(abs/1_000).toFixed(0)}K`;
  return `${s}R$${abs.toFixed(2)}`;
}

function formatarReaisSimples(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ── Tooltip do gráfico ────────────────────────────────────────────────────────

function TooltipComparado({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1c1b17", color:"#efeee6", padding:"10px 14px", borderRadius:"4px", fontFamily:"var(--font-mono)", fontSize:"0.78rem", minWidth:140 }}>
      <div style={{ marginBottom:6, opacity:0.65 }}>Concurso {label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.stroke, marginBottom:2 }}>
          {p.name}: {formatarReais(p.value)}
        </div>
      ))}
    </div>
  );
}

// ── Formulário de uma estratégia ──────────────────────────────────────────────

interface PropsForm {
  id: "A" | "B";
  cor: string;
  nome: string;
  setNome: (v: string) => void;
  filtro: FiltroEstrategia;
  setFiltro: (f: FiltroEstrategia) => void;
  dezenaMin: number;
  dezenaMax: number;
  qtd: number;
}

function FormEstrategia({ id, cor, nome, setNome, filtro, setFiltro, dezenaMin, dezenaMax, qtd }: PropsForm) {
  function campo(label: string, minKey: keyof FiltroEstrategia, maxKey: keyof FiltroEstrategia, minPossivel: number, maxPossivel: number) {
    return (
      <div className="estrategia-campo">
        <label className="estrategia-label">{label} <span style={{color:"var(--ink-faint)",fontWeight:400}}>(0–{maxPossivel})</span></label>
        <div className="estrategia-range">
          <input
            type="number"
            placeholder="mín"
            min={minPossivel}
            max={maxPossivel}
            value={filtro[minKey] ?? ""}
            onChange={e => {
              const v = e.target.value ? Math.min(Number(e.target.value), maxPossivel) : undefined;
              setFiltro({ ...filtro, [minKey]: v });
            }}
            className="estrategia-input"
          />
          <span className="estrategia-range-sep">–</span>
          <input
            type="number"
            placeholder="máx"
            min={minPossivel}
            max={maxPossivel}
            value={filtro[maxKey] ?? ""}
            onChange={e => {
              const v = e.target.value ? Math.min(Number(e.target.value), maxPossivel) : undefined;
              setFiltro({ ...filtro, [maxKey]: v });
            }}
            className="estrategia-input"
          />
        </div>
      </div>
    );
  }

  // Calcular faixa de soma típica
  const somaMin = dezenaMin * qtd;
  const somaMax = dezenaMax * qtd;

  return (
    <div className="estrategia-form" style={{ borderColor: cor }}>
      <div className="estrategia-form__header" style={{ background: cor }}>
        <span className="estrategia-form__id">Estratégia {id}</span>
      </div>

      <div className="estrategia-form__body">
        <div className="estrategia-campo">
          <label className="estrategia-label">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder={`Ex: Soma alta e mais pares`}
            className="auth-input estrategia-nome-input"
            maxLength={40}
          />
        </div>

        {campo("Soma total", "somaMin", "somaMax", somaMin, somaMax)}
        {campo("Números pares", "paresMin", "paresMax", 0, qtd)}
        {campo("Números primos", "primosMin", "primosMax", 0, qtd)}
        {campo("Números Fibonacci", "fibonacciMin", "fibonacciMax", 0, qtd)}
        {campo("Múltiplos de 3", "multiplos3Min", "multiplos3Max", 0, qtd)}

        <div className="estrategia-campo">
          <label className="estrategia-label">Máx. sequência consecutiva</label>
          <input
            type="number"
            placeholder="ex: 2"
            min={1}
            max={qtd}
            value={filtro.maxSequenciaMax ?? ""}
            onChange={e => setFiltro({ ...filtro, maxSequenciaMax: e.target.value ? Number(e.target.value) : undefined })}
            className="estrategia-input"
            style={{ width: 80 }}
          />
        </div>

        <button
          type="button"
          className="estrategia-limpar-btn"
          onClick={() => setFiltro({})}
        >
          Limpar filtros
        </button>
      </div>
    </div>
  );
}

// ── Cards de resultado ────────────────────────────────────────────────────────

function CardsResultado({ r, cor }: { r: ResultadoEstrategia; cor: string }) {
  return (
    <div className="estrategia-resultado-cards">
      {r.concursosQuePassaram === 0 && (
        <div style={{ gridColumn:"1/-1", padding:"10px 12px", background:"#fef9ef", border:"1px solid var(--ochre)", borderRadius:"4px", fontSize:"0.82rem", color:"var(--ink-soft)", marginBottom:8 }}>
          ⚠ Nenhum sorteio atendeu esses filtros. Verifique se os valores são compatíveis com a quantidade de dezenas da loteria.
        </div>
      )}
      <div className="estrategia-resultado-card">
        <span className="estrategia-resultado-rotulo">Cobertura</span>
        <span className="estrategia-resultado-valor" style={{ color: cor }}>
          {r.taxaCobertura.toFixed(1)}%
        </span>
        <span className="estrategia-resultado-detalhe">
          {r.concursosQuePassaram.toLocaleString("pt-BR")} de {r.totalConcursos.toLocaleString("pt-BR")} concursos
        </span>
      </div>
      <div className="estrategia-resultado-card">
        <span className="estrategia-resultado-rotulo">Total gasto</span>
        <span className="estrategia-resultado-valor" style={{ color: "var(--rust)" }}>
          {formatarReaisSimples(r.totalGasto)}
        </span>
      </div>
      <div className="estrategia-resultado-card">
        <span className="estrategia-resultado-rotulo">Total ganho</span>
        <span className="estrategia-resultado-valor" style={{ color: "var(--pine)" }}>
          {formatarReaisSimples(r.totalGanho)}
        </span>
      </div>
      <div className="estrategia-resultado-card">
        <span className="estrategia-resultado-rotulo">Saldo</span>
        <span className="estrategia-resultado-valor" style={{ color: r.saldoFinal >= 0 ? "var(--pine)" : "var(--rust)" }}>
          {formatarReaisSimples(r.saldoFinal)}
        </span>
      </div>
      <div className="estrategia-resultado-card">
        <span className="estrategia-resultado-rotulo">Retorno</span>
        <span className="estrategia-resultado-valor">{r.retornoPct.toFixed(1)}%</span>
        <span className="estrategia-resultado-detalhe">média teórica ~43%</span>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

interface Props {
  codigoLoteria: string;
  nomeLoteria: string;
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenasSorteadas: number;
  premium: boolean;
  logado: boolean;
  limiteHistorico?: number | null;
}

export default function ComparadorEstrategiasClient({
  codigoLoteria, nomeLoteria, dezenaMin, dezenaMax,
  qtdDezenasSorteadas, premium, logado, limiteHistorico = null,
}: Props) {
  const [nomeA, setNomeA] = useState("Estratégia A");
  const [nomeB, setNomeB] = useState("Estratégia B");
  const [filtroA, setFiltroA] = useState<FiltroEstrategia>({});
  const [filtroB, setFiltroB] = useState<FiltroEstrategia>({});
  const [resultado, setResultado] = useState<ResultadoComparacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleComparar() {
    setErro(null);
    startTransition(async () => {
      const res = await compararEstrategias(
        codigoLoteria, nomeA, filtroA, nomeB, filtroB,
        limiteHistorico ?? undefined
      );
      if ("erro" in res) setErro(res.erro);
      else setResultado(res);
    });
  }

  function handleReset() {
    setResultado(null);
    setErro(null);
  }

  const temFiltroA = Object.values(filtroA).some(v => v !== undefined);
  const temFiltroB = Object.values(filtroB).some(v => v !== undefined);

  const yMin = useMemo(() => {
    if (!resultado) return 0;
    return Math.min(0, ...resultado.graficoComparado.flatMap(p => [p.saldoA, p.saldoB]));
  }, [resultado]);

  // ── Bloqueado para free ───────────────────────────────────────────────────
  if (!premium) {
    return (
      <div className="gerador-premium-overlay" style={{ minHeight: 240 }}>
        <div className="gerador-premium-overlay__card">
          <p className="gerador-premium-overlay__icone">✦</p>
          <p className="gerador-premium-overlay__titulo">Comparador de estratégias — Premium</p>
          <p className="gerador-premium-overlay__desc">
            Defina filtros estatísticos para duas estratégias (soma, pares, primos, sequências…)
            e veja qual teria funcionado melhor em todo o histórico da {nomeLoteria}.
          </p>
          <a href="/assinar" className="botao-gerar">Assinar Premium →</a>
          {!logado && (
            <a href="/entrar" className="gerador-premium-overlay__entrar">Já tenho uma conta</a>
          )}
        </div>
      </div>
    );
  }

  // ── Resultado ─────────────────────────────────────────────────────────────
  if (resultado) {
    const { estrategiaA: rA, estrategiaB: rB, graficoComparado } = resultado;
    const diffSaldo = rA.saldoFinal - rB.saldoFinal;
    const melhor = Math.abs(diffSaldo) < 1 ? null : diffSaldo > 0 ? rA.nome : rB.nome;

    return (
      <div className="estrategia-resultados">
        <div className="estrategia-resultados__header">
          <button type="button" className="botao-copiar" onClick={handleReset}>
            ← Nova comparação
          </button>
          {!limiteHistorico && (
            <span className="estrategia-resultados__periodo">
              Histórico completo — {rA.totalConcursos.toLocaleString("pt-BR")} concursos
            </span>
          )}
        </div>

        {/* Gráfico comparativo */}
        <div className="simulador-hist-chart-section">
          <h2 className="bloco__titulo">Saldo acumulado — comparação</h2>
          <p className="simulador-hist-chart-nota">
            Calculado apenas nos concursos em que cada estratégia estaria ativa.
          </p>
          <div className="simulador-hist-chart">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={graficoComparado} margin={{ top:10, right:16, bottom:20, left:16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d8d4c5" />
                <XAxis dataKey="numero" tick={{ fontSize:11, fill:"#8c8874", fontFamily:"var(--font-mono)" }} />
                <YAxis tick={{ fontSize:11, fill:"#8c8874", fontFamily:"var(--font-mono)" }}
                  tickFormatter={v => formatarReais(v)} domain={[yMin*1.05,"auto"]} width={72} />
                <Tooltip content={<TooltipComparado />} />
                <ReferenceLine y={0} stroke="#1e4b3c" strokeWidth={1.5} strokeDasharray="6 3" />
                <Legend wrapperStyle={{ fontFamily:"var(--font-mono)", fontSize:"0.78rem" }} />
                <Line type="monotone" dataKey="saldoA" name={rA.nome} stroke="#b9802c" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="saldoB" name={rB.nome} stroke="#1e4b3c" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cards lado a lado */}
        <div className="estrategia-colunas">
          <div className="estrategia-coluna" data-cor="a">
            <h3 className="estrategia-coluna__titulo" style={{ color:"#b9802c" }}>{rA.nome}</h3>
            <CardsResultado r={rA} cor="#b9802c" />
          </div>
          <div className="estrategia-coluna" data-cor="b">
            <h3 className="estrategia-coluna__titulo" style={{ color:"#1e4b3c" }}>{rB.nome}</h3>
            <CardsResultado r={rB} cor="#1e4b3c" />
          </div>
        </div>

        {/* Veredito */}
        <div className="simulador-comparar-veredito">
          {melhor === null ? (
            <p>As duas estratégias tiveram resultado praticamente igual no histórico.</p>
          ) : (
            <p>
              No histórico analisado, <strong>{melhor}</strong> saiu-se melhor —
              com saldo {formatarReaisSimples(Math.abs(diffSaldo))} acima da outra estratégia.
              A cobertura foi de {melhor === rA.nome ? rA.taxaCobertura.toFixed(1) : rB.taxaCobertura.toFixed(1)}%
              dos concursos. Isso não significa que vai se repetir no futuro.
            </p>
          )}
        </div>

        {/* Tabelas de faixas */}
        <div className="estrategia-colunas" style={{ marginTop: 32 }}>
          {[{ r: rA, cor: "#b9802c" }, { r: rB, cor: "#1e4b3c" }].map(({ r, cor }) => (
            <div key={r.nome}>
              <h3 className="bloco__titulo" style={{ fontSize:"0.95rem", color: cor }}>{r.nome} — faixas</h3>
              <div className="tabela-scroll">
                <table className="tabela-dados">
                  <thead><tr><th>Faixa</th><th className="num">Premiações esperadas</th><th className="num">Ganho esperado</th></tr></thead>
                  <tbody>
                    {r.porFaixa.map(f => (
                      <tr key={f.descricao}>
                        <td>{f.descricao}</td>
                        <td className="num" style={{ fontFamily:"var(--font-mono)" }}>
                          {f.qtd > 0.001 ? f.qtd.toFixed(3) : "—"}
                        </td>
                        <td className="num" style={{ fontFamily:"var(--font-mono)", color: f.ganhoTotal > 0 ? "var(--pine)" : "var(--ink-faint)" }}>
                          {f.ganhoTotal > 0.01 ? formatarReaisSimples(f.ganhoTotal) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="aviso-legal" style={{ marginTop: 32 }}>
          Esta análise avalia filtros estatísticos retroativamente no histórico. Cada concurso
          é um evento aleatório independente — resultados passados não predizem o futuro.
          Uma estratégia que funcionou historicamente tem a mesma chance de acertar no
          próximo sorteio que qualquer outra combinação.
        </div>
      </div>
    );
  }

  // ── Formulário de entrada ─────────────────────────────────────────────────
  return (
    <div className="estrategia-wrapper">
      <p className="analisador-instrucao">
        Defina os filtros para cada estratégia — soma das dezenas, distribuição par/ímpar,
        primos, Fibonacci, múltiplos de 3 e comprimento máximo de sequência. O sistema
        analisa quantos sorteios históricos atenderiam cada estratégia e compara o desempenho.
      </p>

      {!limiteHistorico && (
        <div className="simulador-aviso-free" style={{ marginBottom: 20 }}>
          <span className="simulador-aviso-free__badge">Premium</span>
          Histórico completo da {nomeLoteria} — todos os concursos.
        </div>
      )}

      <div className="estrategia-formularios">
        <FormEstrategia
          id="A" cor="#b9802c"
          nome={nomeA} setNome={setNomeA}
          filtro={filtroA} setFiltro={setFiltroA}
          dezenaMin={dezenaMin} dezenaMax={dezenaMax} qtd={qtdDezenasSorteadas}
        />
        <FormEstrategia
          id="B" cor="#1e4b3c"
          nome={nomeB} setNome={setNomeB}
          filtro={filtroB} setFiltro={setFiltroB}
          dezenaMin={dezenaMin} dezenaMax={dezenaMax} qtd={qtdDezenasSorteadas}
        />
      </div>

      {erro && <p className="simulador-erro">{erro}</p>}

      <div style={{ display:"flex", gap:12, marginTop:24 }}>
        <button
          type="button"
          className="botao-gerar"
          onClick={handleComparar}
          disabled={pending}
        >
          {pending ? "Comparando…" : "Comparar estratégias →"}
        </button>
      </div>

      {!temFiltroA && !temFiltroB && (
        <p className="estrategia-dica">
          Dica: deixar uma estratégia sem filtros equivale a "jogar qualquer combinação em todos
          os concursos" — útil como linha de base para comparação.
        </p>
      )}
    </div>
  );
}
