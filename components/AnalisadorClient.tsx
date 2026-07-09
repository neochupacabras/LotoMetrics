"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { analisar, type ResultadoAnalisador, type LabelTipicidade } from "@/lib/analisador";
import { formatarDezena } from "@/lib/format";

interface Props {
  codigoLoteria: string;
  nomeLoteria: string;
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenasSorteadas: number;
  gridColunas: number;
}

const LINKS_ARTIGOS: Record<string, string> = {
  soma: "/dicas/soma",
  parImpar: "/dicas/par-impar",
  sequencias: "/dicas/sequencias",
  molduraCentro: "/dicas/moldura-centro",
  primos: "/dicas/primos",
  fibonacci: "/dicas/fibonacci",
  multiplos3: "/dicas/multiplos-de-3",
};

function badgeClass(l: LabelTipicidade) {
  if (l === "Muito comum") return "analisador-badge analisador-badge--bom";
  if (l === "Comum") return "analisador-badge analisador-badge--ok";
  if (l === "Incomum") return "analisador-badge analisador-badge--alerta";
  return "analisador-badge analisador-badge--raro";
}

function BarraFrequencia({ pct }: { pct: number }) {
  return (
    <div className="analisador-barra-fundo" title={`${pct.toFixed(1)}% das combinações possíveis`}>
      <div className="analisador-barra-fill" style={{ width: `${Math.max(2, pct)}%` }} />
    </div>
  );
}

interface MetricaCardProps {
  titulo: string;
  valor: string;
  detalhe: string;
  pct: number;
  label: LabelTipicidade;
  link: string;
}

function MetricaCard({ titulo, valor, detalhe, pct, label, link }: MetricaCardProps) {
  return (
    <div className="analisador-card">
      <div className="analisador-card__topo">
        <span className="analisador-card__titulo">{titulo}</span>
        <span className={badgeClass(label)}>{label}</span>
      </div>
      <div className="analisador-card__valor">{valor}</div>
      <BarraFrequencia pct={pct} />
      <div className="analisador-card__detalhe">
        {detalhe}{" "}
        <Link href={link} className="analisador-card__link">
          Saiba mais ↗
        </Link>
      </div>
    </div>
  );
}

export default function AnalisadorClient({
  codigoLoteria,
  nomeLoteria,
  dezenaMin,
  dezenaMax,
  qtdDezenasSorteadas,
}: Props) {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());

  const todasDezenas = useMemo(
    () => Array.from({ length: dezenaMax - dezenaMin + 1 }, (_, i) => i + dezenaMin),
    [dezenaMin, dezenaMax]
  );

  const toggle = (d: number) => {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(d)) {
        next.delete(d);
      } else {
        next.add(d);
      }
      return next;
    });
  };

  const dezenas = useMemo(() => [...selecionadas].sort((a, b) => a - b), [selecionadas]);

  const resultado: ResultadoAnalisador | null = useMemo(
    () => (dezenas.length > 0 ? analisar(dezenas, codigoLoteria) : null),
    [dezenas, codigoLoteria]
  );

  const pctCompleto = (selecionadas.size / qtdDezenasSorteadas) * 100;
  const completo = selecionadas.size === qtdDezenasSorteadas;

  return (
    <div className="analisador-wrapper">
      {/* ── Grade de seleção ─────────────────────────────── */}
      <div className="bloco">
        <p className="analisador-instrucao">
          Selecione as dezenas do seu jogo — a análise atualiza em tempo real.
        </p>

        <div className="grade-dezenas">
          {todasDezenas.map((d) => (
            <button
              key={d}
              type="button"
              className="dezena-selecionavel"
              data-selecionada={selecionadas.has(d)}
              onClick={() => toggle(d)}
            >
              {formatarDezena(d)}
            </button>
          ))}
        </div>

        {/* Barra de progresso da seleção */}
        <div className="analisador-progresso-wrapper">
          <div className="analisador-progresso-fundo">
            <div
              className="analisador-progresso-fill"
              style={{ width: `${pctCompleto}%` }}
              data-completo={completo}
            />
          </div>
          <span className="analisador-progresso-label">
            {selecionadas.size} de {qtdDezenasSorteadas} dezenas
            {completo && " — análise completa"}
          </span>
        </div>

        {selecionadas.size > 0 && (
          <button
            type="button"
            className="botao-copiar"
            style={{ marginTop: "12px" }}
            onClick={() => setSelecionadas(new Set())}
          >
            Limpar seleção
          </button>
        )}
      </div>

      {/* ── Painel de análise ────────────────────────────── */}
      {resultado && (
        <>
          {/* Resumo geral */}
          <div className="analisador-resumo">
            <span className="analisador-resumo__numero">{resultado.tipicas}</span>
            <span className="analisador-resumo__texto">
              de 7 métricas são{" "}
              <strong>típicas</strong> — similar à maioria das combinações possíveis
              {!completo && ` (${selecionadas.size}/${qtdDezenasSorteadas} dezenas)`}
            </span>
          </div>

          {/* Cards de métricas */}
          <div className="analisador-grid">
            <MetricaCard
              titulo="Soma das dezenas"
              valor={String(resultado.soma.valor)}
              detalhe={
                codigoLoteria === "lotofacil"
                  ? `Percentil ${resultado.soma.percentil.toFixed(0)}% — faixa típica: 183–207`
                  : `Percentil ${resultado.soma.percentil.toFixed(0)}% — faixa típica: 155–210`
              }
              pct={resultado.soma.pct}
              label={resultado.soma.label}
              link={LINKS_ARTIGOS.soma}
            />

            <MetricaCard
              titulo="Par / Ímpar"
              valor={`${resultado.parImpar.pares} pares · ${resultado.parImpar.impares} ímpares`}
              detalhe={`${resultado.parImpar.pct.toFixed(1)}% das combinações têm essa distribuição`}
              pct={resultado.parImpar.pct}
              label={resultado.parImpar.label}
              link={LINKS_ARTIGOS.parImpar}
            />

            <MetricaCard
              titulo="Maior sequência"
              valor={
                resultado.sequencias.maior <= 1
                  ? "Nenhuma sequência"
                  : `${resultado.sequencias.maior} seguidas`
              }
              detalhe={`${resultado.sequencias.pct.toFixed(1)}% das combinações têm essa sequência máxima`}
              pct={resultado.sequencias.pct}
              label={resultado.sequencias.label}
              link={LINKS_ARTIGOS.sequencias}
            />

            <MetricaCard
              titulo="Moldura / Centro"
              valor={`${resultado.molduraCentro.moldura} na borda · ${resultado.molduraCentro.centro} no miolo`}
              detalhe={`${resultado.molduraCentro.pct.toFixed(1)}% das combinações têm essa distribuição no volante`}
              pct={resultado.molduraCentro.pct}
              label={resultado.molduraCentro.label}
              link={LINKS_ARTIGOS.molduraCentro}
            />

            <MetricaCard
              titulo="Primos"
              valor={`${resultado.primos.qtd} ${resultado.primos.qtd === 1 ? "primo" : "primos"}`}
              detalhe={`${resultado.primos.pct.toFixed(1)}% das combinações têm exatamente esse número de primos`}
              pct={resultado.primos.pct}
              label={resultado.primos.label}
              link={LINKS_ARTIGOS.primos}
            />

            <MetricaCard
              titulo="Fibonacci"
              valor={`${resultado.fibonacci.qtd} de Fibonacci`}
              detalhe={`${resultado.fibonacci.pct.toFixed(1)}% das combinações têm essa quantidade de Fibonacci`}
              pct={resultado.fibonacci.pct}
              label={resultado.fibonacci.label}
              link={LINKS_ARTIGOS.fibonacci}
            />

            <MetricaCard
              titulo="Múltiplos de 3"
              valor={`${resultado.multiplos3.qtd} ${resultado.multiplos3.qtd === 1 ? "múltiplo" : "múltiplos"} de 3`}
              detalhe={`${resultado.multiplos3.pct.toFixed(1)}% das combinações têm essa quantidade`}
              pct={resultado.multiplos3.pct}
              label={resultado.multiplos3.label}
              link={LINKS_ARTIGOS.multiplos3}
            />
          </div>

          <p className="aviso-legal" style={{ marginTop: "24px" }}>
            Esta análise é descritiva — mostra onde sua combinação se encaixa entre todas as
            combinações possíveis. Nenhuma métrica influencia a probabilidade do próximo sorteio.
          </p>
        </>
      )}

      {selecionadas.size === 0 && (
        <p className="analisador-vazio">
          Selecione pelo menos uma dezena para começar.
        </p>
      )}
    </div>
  );
}
