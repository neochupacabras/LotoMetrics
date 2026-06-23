"use client";

import { useState, useTransition, useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid, Legend,
} from "recharts";
import { simularHistorico, compararJogos, type ResultadoSimulacao, type ResultadoComparacao } from "@/lib/simulador-actions";
import { salvarJogoAction } from "@/lib/jogo-actions";
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

function dezenasParaTexto(dezenas: number[]): string {
  return dezenas.map((d) => String(d).padStart(2, "0")).join(" ");
}

// ─── Tooltip do gráfico ───────────────────────────────────────────────────────

function TooltipSimples({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const saldo = payload[0]?.value as number;
  return (
    <div style={{ background:"#1c1b17",color:"#efeee6",padding:"10px 14px",borderRadius:"4px",fontFamily:"var(--font-mono)",fontSize:"0.78rem" }}>
      <div style={{ marginBottom:4, opacity:0.65 }}>Concurso {label}</div>
      <div style={{ color: saldo >= 0 ? "#b9802c" : "#e4c189", fontWeight:700 }}>{formatarReais(saldo)}</div>
    </div>
  );
}

function TooltipComparado({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1c1b17",color:"#efeee6",padding:"10px 14px",borderRadius:"4px",fontFamily:"var(--font-mono)",fontSize:"0.78rem",minWidth:140 }}>
      <div style={{ marginBottom:6, opacity:0.65 }}>Concurso {label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.stroke, marginBottom:2 }}>
          {p.name}: {formatarReais(p.value)}
        </div>
      ))}
    </div>
  );
}

// ─── Seletor de dezenas ───────────────────────────────────────────────────────

function SeletorDezenas({
  dezenaMin, dezenaMax, qtd, selecionadas, onChange, label,
}: {
  dezenaMin: number; dezenaMax: number; qtd: number;
  selecionadas: Set<number>; onChange: (s: Set<number>) => void; label: string;
}) {
  const todas = useMemo(
    () => Array.from({ length: dezenaMax - dezenaMin + 1 }, (_, i) => i + dezenaMin),
    [dezenaMin, dezenaMax]
  );

  function toggle(d: number) {
    const next = new Set(selecionadas);
    if (next.has(d)) next.delete(d);
    else if (next.size < qtd) next.add(d);
    onChange(next);
  }

  const completo = selecionadas.size === qtd;

  return (
    <div className="simulador-seletor">
      <p className="simulador-seletor__label">{label}</p>
      <div className="grade-dezenas">
        {todas.map((d) => (
          <button
            key={d} type="button"
            className="dezena-selecionavel"
            data-selecionada={selecionadas.has(d)}
            disabled={!selecionadas.has(d) && selecionadas.size >= qtd}
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
            style={{ width: `${(selecionadas.size / qtd) * 100}%` }}
          />
        </div>
        <span className="analisador-progresso-label">{selecionadas.size} de {qtd} dezenas</span>
      </div>
    </div>
  );
}

// ─── Cards de resumo ──────────────────────────────────────────────────────────

function CardsResumo({ r, cor }: { r: ResultadoSimulacao; cor?: string }) {
  return (
    <div className="simulador-hist-cards">
      <div className="simulador-hist-card">
        <span className="simulador-hist-card-rotulo">Total gasto</span>
        <span className="simulador-hist-card-valor" style={{ color:"var(--rust)" }}>
          {formatarReaisSimples(r.totalGasto)}
        </span>
        <span className="simulador-hist-card-detalhe">
          {r.totalConcursos.toLocaleString("pt-BR")} concursos × {formatarReaisSimples(r.precoAposta)}
        </span>
      </div>
      <div className="simulador-hist-card">
        <span className="simulador-hist-card-rotulo">Total ganho</span>
        <span className="simulador-hist-card-valor" style={{ color: cor ?? "var(--pine)" }}>
          {formatarReaisSimples(r.totalGanho)}
        </span>
        <span className="simulador-hist-card-detalhe">
          em {r.porFaixa.reduce((s, f) => s + f.qtd, 0)} prêmios
        </span>
      </div>
      <div className="simulador-hist-card">
        <span className="simulador-hist-card-rotulo">Saldo final</span>
        <span className="simulador-hist-card-valor" style={{ color: r.saldoFinal >= 0 ? "var(--pine)" : "var(--rust)" }}>
          {formatarReaisSimples(r.saldoFinal)}
        </span>
        <span className="simulador-hist-card-detalhe">
          {r.saldoFinal < 0 ? "prejuízo" : "lucro"} acumulado
        </span>
      </div>
      <div className="simulador-hist-card">
        <span className="simulador-hist-card-rotulo">Retorno</span>
        <span className="simulador-hist-card-valor">{r.retornoPct.toFixed(1)}%</span>
        <span className="simulador-hist-card-detalhe">média teórica: ~43%</span>
      </div>
    </div>
  );
}

// ─── Botão salvar jogo ────────────────────────────────────────────────────────

function BotaoSalvar({ codigoLoteria, dezenas, logado }: { codigoLoteria: string; dezenas: number[]; logado: boolean }) {
  const [status, setStatus] = useState<"idle"|"salvando"|"salvo"|"erro">("idle");

  async function handleSalvar() {
    if (!logado) { window.location.href = "/entrar"; return; }
    setStatus("salvando");
    const res = await salvarJogoAction(codigoLoteria, dezenas);
    setStatus(res.ok ? "salvo" : "erro");
    if (res.ok) setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <button
      type="button"
      className="botao-copiar simulador-salvar-btn"
      onClick={handleSalvar}
      disabled={status === "salvando" || status === "salvo"}
    >
      {status === "idle" && (logado ? "Salvar jogo →" : "Salvar jogo (login)")}
      {status === "salvando" && "Salvando…"}
      {status === "salvo" && "✓ Salvo na conta"}
      {status === "erro" && "Erro ao salvar"}
    </button>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  codigoLoteria: string;
  nomeLoteria: string;
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenasSorteadas: number;
  limiteHistorico?: number | null;
  logado?: boolean;
  premium?: boolean;
}

type Modo = "simples" | "comparar";

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SimuladorHistoricoClient({
  codigoLoteria, nomeLoteria, dezenaMin, dezenaMax,
  qtdDezenasSorteadas, limiteHistorico = null, logado = false, premium = false,
}: Props) {
  const [modo, setModo] = useState<Modo>("simples");

  // Estado — modo simples
  const [selA, setSelA] = useState<Set<number>>(new Set());
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);

  // Estado — modo comparar
  const [selB, setSelB] = useState<Set<number>>(new Set());
  const [comparacao, setComparacao] = useState<ResultadoComparacao | null>(null);

  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function limpar() {
    setSelA(new Set()); setSelB(new Set());
    setResultado(null); setComparacao(null); setErro(null);
  }

  function handleSimular() {
    const dezenas = Array.from(selA).sort((a, b) => a - b);
    startTransition(async () => {
      setErro(null);
      const res = await simularHistorico(codigoLoteria, dezenas, limiteHistorico ?? undefined);
      if ("erro" in res) setErro(res.erro);
      else setResultado(res);
    });
  }

  function handleComparar() {
    const dA = Array.from(selA).sort((a, b) => a - b);
    const dB = Array.from(selB).sort((a, b) => a - b);
    startTransition(async () => {
      setErro(null);
      const res = await compararJogos(codigoLoteria, dA, dB, limiteHistorico ?? undefined);
      if ("erro" in res) setErro(res.erro);
      else setComparacao(res);
    });
  }

  const dezenasA = Array.from(selA).sort((a, b) => a - b);
  const dezenasB = Array.from(selB).sort((a, b) => a - b);
  const completoA = selA.size === qtdDezenasSorteadas;
  const completoB = selB.size === qtdDezenasSorteadas;

  // Gráfico simples amostrado
  const graficoAmostrado = useMemo(() => {
    if (!resultado) return [];
    const { grafico } = resultado;
    if (grafico.length <= 500) return grafico;
    const passo = Math.ceil(grafico.length / 500);
    const s = grafico.filter((_, i) => i % passo === 0);
    if (s[s.length-1] !== grafico[grafico.length-1]) s.push(grafico[grafico.length-1]);
    return s;
  }, [resultado]);

  // Gráfico comparado amostrado
  const graficoComparadoAmostrado = useMemo(() => {
    if (!comparacao) return [];
    const g = comparacao.graficoComparado;
    if (g.length <= 500) return g;
    const passo = Math.ceil(g.length / 500);
    const s = g.filter((_, i) => i % passo === 0);
    if (s[s.length-1] !== g[g.length-1]) s.push(g[g.length-1]);
    return s;
  }, [comparacao]);

  const yMin = useMemo(
    () => resultado ? Math.min(0, ...graficoAmostrado.map(p => p.saldo)) : 0,
    [resultado, graficoAmostrado]
  );

  const yMinComp = useMemo(
    () => comparacao ? Math.min(0, ...graficoComparadoAmostrado.flatMap(p => [p.saldoA, p.saldoB])) : 0,
    [comparacao, graficoComparadoAmostrado]
  );

  const emAndamento = !resultado && !comparacao;

  return (
    <div className="simulador-hist-wrapper">

      {/* ── Toggle modo ──────────────────────────────────────────── */}
      {emAndamento && (
        <div className="modo-toggle" style={{ marginBottom: 24, alignSelf: "flex-start" }}>
          <button
            type="button"
            className="modo-toggle__botao"
            data-ativo={modo === "simples"}
            onClick={() => { setModo("simples"); limpar(); }}
          >
            Simular jogo
          </button>
          <button
            type="button"
            className="modo-toggle__botao"
            data-ativo={modo === "comparar"}
            onClick={() => {
              if (premium) { setModo("comparar"); limpar(); }
            }}
          >
            Comparar dois jogos {!premium && <span className="modo-toggle__lock">✦ Premium</span>}
          </button>
        </div>
      )}

      {/* ── Overlay comparador bloqueado ─────────────────────────── */}
      {emAndamento && modo === "comparar" && !premium && (
        <div className="gerador-premium-overlay">
          <div className="gerador-premium-overlay__card">
            <p className="gerador-premium-overlay__icone">✦</p>
            <p className="gerador-premium-overlay__titulo">Comparador de jogos — Premium</p>
            <p className="gerador-premium-overlay__desc">
              Simule dois jogos no mesmo histórico e veja lado a lado qual teria
              rendido mais — gráfico comparativo, tabela de prêmios e saldo final.
            </p>
            <a href="/assinar" className="botao-gerar">Assinar Premium →</a>
            {!logado && <a href="/entrar" className="gerador-premium-overlay__entrar">Já tenho uma conta</a>}
          </div>
        </div>
      )}

      {/* ── Modo simples — entrada ────────────────────────────────── */}
      {emAndamento && modo === "simples" && (
        <div className="bloco">
          <p className="analisador-instrucao">
            Escolha as {qtdDezenasSorteadas} dezenas que você jogaria em todo
            concurso — a simulação verifica esse jogo em cada sorteio da história
            da {nomeLoteria}.
          </p>
          <SeletorDezenas
            dezenaMin={dezenaMin} dezenaMax={dezenaMax}
            qtd={qtdDezenasSorteadas} selecionadas={selA} onChange={setSelA}
            label=""
          />
          {erro && <p className="simulador-erro">{erro}</p>}
          <div style={{ display:"flex", gap:"12px", marginTop:"20px" }}>
            <button type="button" className="botao-gerar"
              disabled={!completoA || pending} onClick={handleSimular}>
              {pending ? "Simulando…" : "Simular →"}
            </button>
            {selA.size > 0 && <button type="button" className="botao-copiar" onClick={limpar}>Limpar</button>}
          </div>
        </div>
      )}

      {/* ── Modo comparar — entrada ───────────────────────────────── */}
      {emAndamento && modo === "comparar" && premium && (
        <div className="bloco">
          <p className="analisador-instrucao">
            Monte dois jogos para comparar o desempenho histórico lado a lado.
          </p>
          <div className="simulador-comparar-grid">
            <SeletorDezenas
              dezenaMin={dezenaMin} dezenaMax={dezenaMax}
              qtd={qtdDezenasSorteadas} selecionadas={selA} onChange={setSelA}
              label="Jogo A"
            />
            <SeletorDezenas
              dezenaMin={dezenaMin} dezenaMax={dezenaMax}
              qtd={qtdDezenasSorteadas} selecionadas={selB} onChange={setSelB}
              label="Jogo B"
            />
          </div>
          {erro && <p className="simulador-erro">{erro}</p>}
          <div style={{ display:"flex", gap:"12px", marginTop:"20px" }}>
            <button type="button" className="botao-gerar"
              disabled={!completoA || !completoB || pending} onClick={handleComparar}>
              {pending ? "Comparando…" : "Comparar →"}
            </button>
            <button type="button" className="botao-copiar" onClick={limpar}>Limpar</button>
          </div>
        </div>
      )}

      {/* ── Resultado simples ─────────────────────────────────────── */}
      {resultado && (
        <>
          <div className="simulador-hist-jogo">
            <span className="simulador-hist-jogo-label">Jogo simulado:</span>
            {dezenasA.map(d => <span key={d} className="simulador-hist-dezena">{formatarDezena(d)}</span>)}
            <div className="simulador-hist-jogo-acoes">
              <button type="button" className="botao-copiar simulador-hist-refazer" onClick={limpar}>
                Simular outro jogo
              </button>
              <BotaoSalvar codigoLoteria={codigoLoteria} dezenas={dezenasA} logado={logado} />
            </div>
          </div>

          <CardsResumo r={resultado} />

          <div className="simulador-hist-chart-section">
            <h2 className="bloco__titulo">Evolução do saldo</h2>
            <p className="simulador-hist-chart-nota">
              Saldo cumulativo ao longo de {resultado.totalConcursos.toLocaleString("pt-BR")} concursos.
              Cada pico é um prêmio recebido.
            </p>
            <div className="simulador-hist-chart">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={graficoAmostrado} margin={{ top:10, right:16, bottom:20, left:16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d8d4c5" />
                  <XAxis dataKey="numero" tick={{ fontSize:11, fill:"#8c8874", fontFamily:"var(--font-mono)" }}
                    label={{ value:"Concurso", position:"insideBottomRight", offset:-4, fill:"#8c8874", fontSize:11 }} />
                  <YAxis tick={{ fontSize:11, fill:"#8c8874", fontFamily:"var(--font-mono)" }}
                    tickFormatter={v => formatarReais(v)} domain={[yMin*1.05,"auto"]} width={72} />
                  <Tooltip content={<TooltipSimples />} />
                  <ReferenceLine y={0} stroke="#1e4b3c" strokeWidth={1.5} strokeDasharray="6 3" />
                  <Line type="monotone" dataKey="saldo" stroke="#b9802c" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="simulador-hist-faixas">
            <h2 className="bloco__titulo">Prêmios por faixa</h2>
            <div className="tabela-scroll">
              <table className="tabela-dados">
                <thead><tr><th>Faixa</th><th className="num">Vezes</th><th className="num">Total</th><th className="num">Média</th></tr></thead>
                <tbody>
                  {resultado.porFaixa.map(f => (
                    <tr key={f.acertos}>
                      <td>{f.descricao}</td>
                      <td className="num" style={{ fontFamily:"var(--font-mono)" }}>{f.qtd > 0 ? f.qtd : "—"}</td>
                      <td className="num" style={{ fontFamily:"var(--font-mono)", color: f.ganhoTotal > 0 ? "var(--pine)" : "var(--ink-faint)" }}>
                        {f.ganhoTotal > 0 ? formatarReaisSimples(f.ganhoTotal) : "—"}
                      </td>
                      <td className="num" style={{ fontFamily:"var(--font-mono)", color:"var(--ink-soft)" }}>
                        {f.qtd > 0 ? formatarReaisSimples(f.ganhoTotal / f.qtd) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {resultado.melhores.length > 0 && (
            <div className="simulador-hist-melhores">
              <h2 className="bloco__titulo">Maiores prêmios</h2>
              <div className="tabela-scroll">
                <table className="tabela-dados">
                  <thead><tr><th className="num">Concurso</th><th>Faixa</th><th className="num">Prêmio</th></tr></thead>
                  <tbody>
                    {resultado.melhores.map(m => (
                      <tr key={m.numero}>
                        <td className="num" style={{ fontFamily:"var(--font-mono)" }}>#{m.numero}</td>
                        <td style={{ fontFamily:"var(--font-mono)", fontSize:"0.85rem" }}>{m.acertos} acertos</td>
                        <td className="num" style={{ fontFamily:"var(--font-mono)", color:"var(--pine)", fontWeight:700 }}>
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
            Esta simulação usa os prêmios históricos reais. Nenhuma combinação tem chance maior
            de ganhar do que outra — o resultado reflete o custo real de jogar essa combinação
            consistentemente no passado.
          </div>
        </>
      )}

      {/* ── Resultado comparação ─────────────────────────────────── */}
      {comparacao && (
        <>
          <div className="simulador-comparar-cabecalho">
            <div className="simulador-comparar-jogo" data-cor="a">
              <span className="simulador-comparar-jogo__label">Jogo A</span>
              <span className="simulador-comparar-jogo__dezenas">{dezenasParaTexto(comparacao.jogoA.dezenas)}</span>
            </div>
            <div className="simulador-comparar-vs">VS</div>
            <div className="simulador-comparar-jogo" data-cor="b">
              <span className="simulador-comparar-jogo__label">Jogo B</span>
              <span className="simulador-comparar-jogo__dezenas">{dezenasParaTexto(comparacao.jogoB.dezenas)}</span>
            </div>
          </div>

          <button type="button" className="botao-copiar" onClick={limpar} style={{ marginBottom:24 }}>
            Nova comparação
          </button>

          {/* Gráfico comparado */}
          <div className="simulador-hist-chart-section">
            <h2 className="bloco__titulo">Evolução do saldo — comparação</h2>
            <div className="simulador-hist-chart">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={graficoComparadoAmostrado} margin={{ top:10, right:16, bottom:20, left:16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d8d4c5" />
                  <XAxis dataKey="numero" tick={{ fontSize:11, fill:"#8c8874", fontFamily:"var(--font-mono)" }} />
                  <YAxis tick={{ fontSize:11, fill:"#8c8874", fontFamily:"var(--font-mono)" }}
                    tickFormatter={v => formatarReais(v)} domain={[yMinComp*1.05,"auto"]} width={72} />
                  <Tooltip content={<TooltipComparado />} />
                  <ReferenceLine y={0} stroke="#1e4b3c" strokeWidth={1.5} strokeDasharray="6 3" />
                  <Legend wrapperStyle={{ fontFamily:"var(--font-mono)", fontSize:"0.78rem" }} />
                  <Line type="monotone" dataKey="saldoA" name="Jogo A" stroke="#b9802c" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="saldoB" name="Jogo B" stroke="#1e4b3c" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cards comparados */}
          <div className="simulador-comparar-resultados">
            <div className="simulador-comparar-coluna" data-cor="a">
              <h3 className="simulador-comparar-coluna__titulo">Jogo A</h3>
              <CardsResumo r={comparacao.jogoA} cor="#b9802c" />
            </div>
            <div className="simulador-comparar-coluna" data-cor="b">
              <h3 className="simulador-comparar-coluna__titulo">Jogo B</h3>
              <CardsResumo r={comparacao.jogoB} cor="#1e4b3c" />
            </div>
          </div>

          {/* Veredito */}
          <div className="simulador-comparar-veredito">
            {(() => {
              const diffSaldo = comparacao.jogoA.saldoFinal - comparacao.jogoB.saldoFinal;
              if (Math.abs(diffSaldo) < 1) return <p>Os dois jogos tiveram resultado praticamente igual no histórico.</p>;
              const melhor = diffSaldo > 0 ? "A" : "B";
              const diff = Math.abs(diffSaldo);
              return (
                <p>
                  No histórico analisado, o <strong>Jogo {melhor}</strong> saiu-se melhor —
                  com saldo {formatarReaisSimples(diff)} acima do outro.
                  Isso não significa que vá se repetir: cada concurso é independente.
                </p>
              );
            })()}
          </div>

          <div className="aviso-legal">
            Comparação baseada nos prêmios históricos reais. Resultados passados não predizem
            sorteios futuros — ambos os jogos têm exatamente a mesma chance no próximo concurso.
          </div>
        </>
      )}
    </div>
  );
}
