"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { analisar, type ResultadoAnalisador, type LabelTipicidade } from "@/lib/analisador";
import { formatarDezena } from "@/lib/format";

// Faixa típica da soma das dezenas sorteadas (média ± 1 desvio padrão da
// distribuição hipergeométrica) — calculada com média = k(n+1)/2 e
// variância = k(n-k)(n+1)/12, onde n = universo de dezenas e k = qtd
// sorteada. Não é um valor de tabela real (não temos o histórico completo
// aqui), mas a distribuição teórica exata de qualquer sorteio honesto.
const FAIXA_TIPICA_SOMA: Record<string, string> = {
  lotofacil: "177–213",
  megasena: "142–224",
  quina: "152–253",
  lotomania: "894–1.126",
  diadesorte: "91–133",
  maismilionaria: "120–186",
  timemania: "225–342",
  duplasena: "120–186",
  supersete: "24–39", // soma de 7 dígitos independentes de 0 a 9 (mecânica própria)
};

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

// Traduz a porcentagem fria em algo que soa como uma pessoa comentando,
// não uma tabulação — o número exato continua disponível no detalhe.
function fraseFrequencia(pct: number): string {
  if (pct >= 50) return "Mais da metade dos jogos possíveis têm esse mesmo padrão";
  // "1 em cada N" calculado do próprio %: as faixas fixas antigas diziam
  // "1 em cada 10" para 21% (auditoria da Lotofácil, apresentação).
  if (pct >= 10) return `Cerca de 1 em cada ${Math.round(100 / pct)} jogos tem esse padrão`;
  if (pct >= 3) return "Só uma fatia pequena dos jogos tem esse padrão";
  return "Isso é raro — poucos jogos têm exatamente esse padrão";
}

// Veredito com opinião em vez de só uma contagem ("4 de 7 métricas são
// típicas"). Mesmo vocabulário raro/comum que os badges já usam.
function fraseVeredito(tipicas: number): string {
  if (tipicas === 7) {
    return "é um perfil clássico — todas as 7 características batem com a maioria das combinações possíveis";
  }
  if (tipicas >= 5) {
    return `é um perfil bem típico — ${tipicas} de 7 características batem com a maioria das combinações possíveis`;
  }
  if (tipicas >= 3) {
    return `tem um perfil misto — ${tipicas} de 7 características são comuns, o resto foge um pouco do padrão`;
  }
  if (tipicas > 0) {
    return `foge do padrão em ${7 - tipicas} de 7 pontos — não é bom nem ruim, só incomum`;
  }
  return "foge do padrão em quase tudo — nenhuma das 7 características é comum, mas isso não é bom nem ruim, só incomum";
}

function badgeClass(l: LabelTipicidade) {
  if (l === "Muito comum") return "analisador-badge analisador-badge--bom";
  if (l === "Comum") return "analisador-badge analisador-badge--ok";
  if (l === "Incomum") return "analisador-badge analisador-badge--alerta";
  return "analisador-badge analisador-badge--raro";
}

function BarraFrequencia({ pct }: { pct: number }) {
  return (
    <div className="analisador-barra-fundo" title={`${pct.toFixed(1).replace(".", ",")}% das combinações possíveis`}>
      <div className="analisador-barra-fill" style={{ width: `${Math.max(2, pct)}%` }} />
    </div>
  );
}

interface MetricaCardProps {
  titulo: string;
  valor: string;
  contextoExtra?: string;
  pct: number;
  label: LabelTipicidade;
  link: string;
}

function MetricaCard({ titulo, valor, contextoExtra, pct, label, link }: MetricaCardProps) {
  return (
    <div className="analisador-card cartao-elevado">
      <div className="analisador-card__topo">
        <span className="analisador-card__titulo">{titulo}</span>
        <span className={badgeClass(label)}>{label}</span>
      </div>
      <div className="analisador-card__valor">{valor}</div>
      <BarraFrequencia pct={pct} />
      <div className="analisador-card__detalhe">
        {fraseFrequencia(pct)} ({pct.toFixed(1).replace(".", ",")}%){contextoExtra ? ` — ${contextoExtra}` : ""}{" "}
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
  gridColunas,
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
      } else if (next.size < qtdDezenasSorteadas) {
        // As distribuições descrevem sorteios de exatamente
        // qtdDezenasSorteadas dezenas: não dá pra analisar um jogo maior.
        next.add(d);
      }
      return next;
    });
  };

  const dezenas = useMemo(() => [...selecionadas].sort((a, b) => a - b), [selecionadas]);

  const resultado: ResultadoAnalisador | null = useMemo(
    // Só analisa o jogo completo (auditoria da Lotofácil, LF-17): com menos
    // dezenas, a comparação com distribuições de sorteios completos não faz
    // sentido. Passa a faixa e a grade da loteria — antes ia o padrão 1–25.
    () => analisar(dezenas, codigoLoteria, dezenaMin, dezenaMax, gridColunas, qtdDezenasSorteadas),
    [dezenas, codigoLoteria, dezenaMin, dezenaMax, gridColunas, qtdDezenasSorteadas]
  );

  const pctCompleto = (selecionadas.size / qtdDezenasSorteadas) * 100;
  const completo = selecionadas.size === qtdDezenasSorteadas;

  return (
    <div className="analisador-wrapper">
      {/* ── Grade de seleção ─────────────────────────────── */}
      <div className="bloco">
        <p className="analisador-instrucao">
          Selecione as {qtdDezenasSorteadas} dezenas do seu jogo para ver a análise.
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
              de 7 — esse jogo {fraseVeredito(resultado.tipicas)}
            </span>
          </div>

          {/* Cards de métricas */}
          <div className="analisador-grid">
            <MetricaCard
              titulo="Soma das dezenas"
              valor={String(resultado.soma.valor)}
              contextoExtra={
                resultado.soma.faixaInicio !== undefined
                  ? `somas de ${resultado.soma.faixaInicio} a ${resultado.soma.faixaFim}; ${
                      resultado.soma.percentil < 1
                        ? "menos de 1%"
                        : resultado.soma.percentil > 99
                          ? "mais de 99%"
                          : `${resultado.soma.percentil.toFixed(0)}%`
                    } das combinações têm soma igual ou menor; faixa típica ${FAIXA_TIPICA_SOMA[codigoLoteria] ?? "—"}`
                  : `percentil ${resultado.soma.percentil.toFixed(0)}%, faixa típica ${FAIXA_TIPICA_SOMA[codigoLoteria] ?? "—"}`
              }
              pct={resultado.soma.pct}
              label={resultado.soma.label}
              link={LINKS_ARTIGOS.soma}
            />

            <MetricaCard
              titulo="Par / Ímpar"
              valor={`${resultado.parImpar.pares} pares · ${resultado.parImpar.impares} ímpares`}
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
              pct={resultado.sequencias.pct}
              label={resultado.sequencias.label}
              link={LINKS_ARTIGOS.sequencias}
            />

            <MetricaCard
              titulo="Moldura / Centro"
              valor={`${resultado.molduraCentro.moldura} na borda · ${resultado.molduraCentro.centro} no miolo`}
              pct={resultado.molduraCentro.pct}
              label={resultado.molduraCentro.label}
              link={LINKS_ARTIGOS.molduraCentro}
            />

            <MetricaCard
              titulo="Primos"
              valor={`${resultado.primos.qtd} ${resultado.primos.qtd === 1 ? "primo" : "primos"}`}
              pct={resultado.primos.pct}
              label={resultado.primos.label}
              link={LINKS_ARTIGOS.primos}
            />

            <MetricaCard
              titulo="Fibonacci"
              valor={`${resultado.fibonacci.qtd} de Fibonacci`}
              pct={resultado.fibonacci.pct}
              label={resultado.fibonacci.label}
              link={LINKS_ARTIGOS.fibonacci}
            />

            <MetricaCard
              titulo="Múltiplos de 3"
              valor={`${resultado.multiplos3.qtd} ${resultado.multiplos3.qtd === 1 ? "múltiplo" : "múltiplos"} de 3`}
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

      {!completo && (
        <p className="analisador-vazio">
          {selecionadas.size === 0
            ? `Selecione as ${qtdDezenasSorteadas} dezenas do jogo para ver a análise.`
            : qtdDezenasSorteadas - selecionadas.size === 1
              ? "Falta 1 dezena — a análise aparece com o jogo completo."
              : `Faltam ${qtdDezenasSorteadas - selecionadas.size} dezenas — a análise aparece com o jogo completo.`}
        </p>
      )}
    </div>
  );
}
