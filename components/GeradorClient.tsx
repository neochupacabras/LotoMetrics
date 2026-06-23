"use client";

import { useState } from "react";
import Dezenas from "./Dezenas";
import { gerarJogo, amostrarSubconjunto, ResultadoGeracao } from "@/lib/gerar-jogo";
import { DadosGerador } from "@/lib/gerador";
import { formatarDezena } from "@/lib/format";

const QTD_JOGOS_MAX = 10;
const QTD_EXTRA_DEZENAS_MAX = 5;

// Preset usado no "Modo simples" — testado isoladamente (500/500 de
// sucesso) antes de virar o padrão. Mantido como constante nomeada para
// que o texto de transparência na UI e a lógica de geração nunca saiam
// de sincronia.
const PRESET_MODO_SIMPLES = {
  qtdAtrasadas: 2,
  qtdCiclo: 1,
  qtdExcluirFrequentes: 2,
};

export default function GeradorClient({
  dezenaMin,
  dezenaMax,
  qtdDezenasPadrao,
  dados,
  modoAvancadoLiberado = false,
  logado = false,
}: {
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenasPadrao: number;
  dados: DadosGerador;
  modoAvancadoLiberado?: boolean;
  logado?: boolean;
}) {
  const [modo, setModo] = useState<"simples" | "avancado">("simples");
  const [qtdJogos, setQtdJogos] = useState(1);

  // --- Estado exclusivo do Modo avançado ---
  const [qtdDezenas, setQtdDezenas] = useState(qtdDezenasPadrao);

  const [usarAtrasadas, setUsarAtrasadas] = useState(false);
  const [qtdAtrasadas, setQtdAtrasadas] = useState(2);

  const [usarCiclo, setUsarCiclo] = useState(false);
  const [qtdCiclo, setQtdCiclo] = useState(Math.min(2, dados.dezenasFaltantesCiclo.length));

  const [usarQuente, setUsarQuente] = useState(false);
  const [tipoQuente, setTipoQuente] = useState<"duque" | "trinca">("duque");

  const [usarExcluirFrequentes, setUsarExcluirFrequentes] = useState(false);
  const [qtdExcluirFrequentes, setQtdExcluirFrequentes] = useState(2);

  const [usarParImparComum, setUsarParImparComum] = useState(false);
  const [usarSomaComum, setUsarSomaComum] = useState(false);
  const [usarPrimosComum, setUsarPrimosComum] = useState(false);
  const [usarFibonacciComum, setUsarFibonacciComum] = useState(false);
  const [usarMultiplos3Comum, setUsarMultiplos3Comum] = useState(false);

  const [jogos, setJogos] = useState<ResultadoGeracao[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const tamanhoPadrao = qtdDezenas === qtdDezenasPadrao;
  const cicloDisponivel = dados.dezenasFaltantesCiclo.length > 0;
  const duquesDisponiveis = dados.duquesQuentes.length > 0;
  const trincasDisponiveis = dados.trincasQuentes.length > 0;
  const quenteDisponivel = tipoQuente === "duque" ? duquesDisponiveis : trincasDisponiveis;

  function gerarUmSimples(): ResultadoGeracao {
    const obrigatorias = new Set<number>();
    amostrarSubconjunto(dados.maisAtrasadas, PRESET_MODO_SIMPLES.qtdAtrasadas).forEach((d) =>
      obrigatorias.add(d)
    );
    if (cicloDisponivel) {
      amostrarSubconjunto(dados.dezenasFaltantesCiclo, PRESET_MODO_SIMPLES.qtdCiclo).forEach((d) =>
        obrigatorias.add(d)
      );
    }
    return gerarJogo({
      dezenaMin,
      dezenaMax,
      qtdDezenas: qtdDezenasPadrao,
      dezenasObrigatorias: Array.from(obrigatorias),
      dezenasExcluidas: dados.maisFrequentes.slice(0, PRESET_MODO_SIMPLES.qtdExcluirFrequentes),
      somaFaixa: dados.somaFaixaComum,
      parImparAlvo: dados.parImparComum,
      primosAlvo: dados.primosComuns,
    });
  }

  function gerarUmAvancado(): ResultadoGeracao {
    const obrigatorias = new Set<number>();
    if (usarAtrasadas) {
      amostrarSubconjunto(dados.maisAtrasadas, qtdAtrasadas).forEach((d) => obrigatorias.add(d));
    }
    if (usarCiclo && cicloDisponivel) {
      amostrarSubconjunto(dados.dezenasFaltantesCiclo, qtdCiclo).forEach((d) => obrigatorias.add(d));
    }
    if (usarQuente && quenteDisponivel) {
      const pool = tipoQuente === "duque" ? dados.duquesQuentes : dados.trincasQuentes;
      const combo = pool[Math.floor(Math.random() * pool.length)];
      combo.forEach((d) => obrigatorias.add(d));
    }
    const dezenasExcluidas = usarExcluirFrequentes
      ? dados.maisFrequentes.slice(0, qtdExcluirFrequentes)
      : [];

    return gerarJogo({
      dezenaMin,
      dezenaMax,
      qtdDezenas,
      dezenasObrigatorias: Array.from(obrigatorias),
      dezenasExcluidas,
      somaFaixa: tamanhoPadrao && usarSomaComum ? dados.somaFaixaComum : undefined,
      parImparAlvo: tamanhoPadrao && usarParImparComum ? dados.parImparComum : undefined,
      primosAlvo: tamanhoPadrao && usarPrimosComum ? dados.primosComuns : undefined,
      fibonacciAlvo: tamanhoPadrao && usarFibonacciComum ? dados.fibonacciComuns : undefined,
      multiplos3Alvo: tamanhoPadrao && usarMultiplos3Comum ? dados.multiplos3Comuns : undefined,
    });
  }

  function handleGerar() {
    setErro(null);
    try {
      const resultados: ResultadoGeracao[] = [];
      for (let i = 0; i < qtdJogos; i++) {
        resultados.push(modo === "simples" ? gerarUmSimples() : gerarUmAvancado());
      }
      setJogos(resultados);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível gerar com esses filtros.");
      setJogos([]);
    }
  }

  function copiarJogo(dezenas: number[]) {
    const texto = dezenas.map(formatarDezena).join(" - ");
    navigator.clipboard?.writeText(texto);
  }

  return (
    <div>
      <div className="modo-toggle">
        <button
          type="button"
          className="modo-toggle__botao"
          data-ativo={modo === "simples"}
          onClick={() => setModo("simples")}
        >
          Modo simples
        </button>
        <button
          type="button"
          className={`modo-toggle__botao${!modoAvancadoLiberado ? " modo-toggle__botao--bloqueado" : ""}`}
          data-ativo={modo === "avancado"}
          onClick={() => {
            if (modoAvancadoLiberado) setModo("avancado");
          }}
          title={modoAvancadoLiberado ? undefined : "Recurso Premium — assine para desbloquear"}
        >
          Modo avançado {!modoAvancadoLiberado && <span className="modo-toggle__lock">✦</span>}
        </button>
      </div>

      <div className="gerador-form">
        <div className="campo-filtro">
          <label htmlFor="qtdJogos">Quantidade de jogos</label>
          <input
            id="qtdJogos"
            type="number"
            min={1}
            max={QTD_JOGOS_MAX}
            value={qtdJogos}
            onChange={(e) => setQtdJogos(Number(e.target.value))}
          />
        </div>

        {modo === "simples" ? (
          <p className="modo-simples-nota">
            Aplicamos automaticamente, no jogo padrão de {qtdDezenasPadrao} dezenas: inclusão de{" "}
            {PRESET_MODO_SIMPLES.qtdAtrasadas} dezenas atrasadas
            {cicloDisponivel ? ` + ${PRESET_MODO_SIMPLES.qtdCiclo} dezena do ciclo atual` : ""},
            exclusão das {PRESET_MODO_SIMPLES.qtdExcluirFrequentes} mais frequentes, e soma,
            par/ímpar e quantidade de primos dentro da faixa mais comum do histórico. Isso é só
            uma combinação pré-definida dos filtros do modo avançado — não aumenta sua chance
            real de ganhar (veja a aba Probabilidades).
          </p>
        ) : (
          <>
            <div className="campo-filtro">
              <label htmlFor="qtdDezenas">Dezenas no jogo</label>
              <input
                id="qtdDezenas"
                type="number"
                min={qtdDezenasPadrao}
                max={Math.min(dezenaMax, qtdDezenasPadrao + QTD_EXTRA_DEZENAS_MAX)}
                value={qtdDezenas}
                onChange={(e) => setQtdDezenas(Number(e.target.value))}
              />
              <span className="campo-filtro__nota">Padrão: {qtdDezenasPadrao}</span>
            </div>

            <hr className="gerador-form__divisor" />
            <p className="gerador-form__grupo-titulo">Incluir dezenas específicas</p>

            <label className="campo-checkbox">
              <input
                type="checkbox"
                checked={usarAtrasadas}
                onChange={(e) => setUsarAtrasadas(e.target.checked)}
              />
              <span className="campo-checkbox__texto">
                Incluir
                <input
                  type="number"
                  min={0}
                  max={dados.maisAtrasadas.length}
                  value={qtdAtrasadas}
                  disabled={!usarAtrasadas}
                  onChange={(e) => setQtdAtrasadas(Number(e.target.value))}
                  className="campo-checkbox__numero"
                />
                dezena(s) entre as 10 mais atrasadas
              </span>
            </label>

            <label
              className="campo-checkbox"
              data-desabilitado={!cicloDisponivel}
              title={
                !cicloDisponivel
                  ? "O ciclo atual está prestes a fechar — não há dezenas faltando."
                  : undefined
              }
            >
              <input
                type="checkbox"
                checked={usarCiclo}
                disabled={!cicloDisponivel}
                onChange={(e) => setUsarCiclo(e.target.checked)}
              />
              <span className="campo-checkbox__texto">
                Incluir
                <input
                  type="number"
                  min={0}
                  max={dados.dezenasFaltantesCiclo.length}
                  value={qtdCiclo}
                  disabled={!usarCiclo || !cicloDisponivel}
                  onChange={(e) => setQtdCiclo(Number(e.target.value))}
                  className="campo-checkbox__numero"
                />
                dezena(s) que faltam pra fechar o ciclo atual ({dados.dezenasFaltantesCiclo.length}{" "}
                disponíveis)
              </span>
            </label>

            <label
              className="campo-checkbox"
              data-desabilitado={!quenteDisponivel}
              title={!quenteDisponivel ? "Sem dados suficientes para essa combinação ainda." : undefined}
            >
              <input
                type="checkbox"
                checked={usarQuente}
                disabled={!quenteDisponivel}
                onChange={(e) => setUsarQuente(e.target.checked)}
              />
              <span className="campo-checkbox__texto">
                Forçar um
                <select
                  className="campo-select"
                  value={tipoQuente}
                  disabled={!usarQuente}
                  onChange={(e) => setTipoQuente(e.target.value as "duque" | "trinca")}
                >
                  <option value="duque">duque</option>
                  <option value="trinca">trinca</option>
                </select>
                quente (entre os 10 mais frequentes) no jogo
              </span>
            </label>

            <hr className="gerador-form__divisor" />
            <p className="gerador-form__grupo-titulo">Manter distribuição típica</p>

            <label className="campo-checkbox">
              <input
                type="checkbox"
                checked={usarExcluirFrequentes}
                onChange={(e) => setUsarExcluirFrequentes(e.target.checked)}
              />
              <span className="campo-checkbox__texto">
                Excluir as
                <input
                  type="number"
                  min={0}
                  max={dados.maisFrequentes.length}
                  value={qtdExcluirFrequentes}
                  disabled={!usarExcluirFrequentes}
                  onChange={(e) => setQtdExcluirFrequentes(Number(e.target.value))}
                  className="campo-checkbox__numero"
                />
                dezena(s) mais frequentes do histórico
              </span>
            </label>

            {[
              {
                checked: usarParImparComum,
                set: setUsarParImparComum,
                label: `Manter a proporção par/ímpar mais comum (${dados.parImparComum.pares} pares / ${dados.parImparComum.impares} ímpares)`,
              },
              {
                checked: usarSomaComum,
                set: setUsarSomaComum,
                label: `Manter a soma na faixa mais comum (${dados.somaFaixaComum.min}–${dados.somaFaixaComum.max})`,
              },
              {
                checked: usarPrimosComum,
                set: setUsarPrimosComum,
                label: `Manter a quantidade de primos mais comum (${dados.primosComuns.join(" ou ")})`,
              },
              {
                checked: usarFibonacciComum,
                set: setUsarFibonacciComum,
                label: `Manter a quantidade de Fibonacci mais comum (${dados.fibonacciComuns.join(" ou ")})`,
              },
              {
                checked: usarMultiplos3Comum,
                set: setUsarMultiplos3Comum,
                label: `Manter a quantidade de múltiplos de 3 mais comum (${dados.multiplos3Comuns.join(" ou ")})`,
              },
            ].map((item, i) => (
              <label
                key={i}
                className="campo-checkbox"
                data-desabilitado={!tamanhoPadrao}
                title={
                  !tamanhoPadrao
                    ? `Disponível só com ${qtdDezenasPadrao} dezenas (o tamanho padrão do jogo)`
                    : undefined
                }
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  disabled={!tamanhoPadrao}
                  onChange={(e) => item.set(e.target.checked)}
                />
                <span className="campo-checkbox__texto">{item.label}</span>
              </label>
            ))}
          </>
        )}

        <button type="button" className="botao-gerar" onClick={handleGerar}>
          Gerar {qtdJogos > 1 ? `${qtdJogos} jogos` : "jogo"}
        </button>
      </div>

      {erro && <p className="gerador-erro">{erro}</p>}

      {jogos.length > 0 && (
        <div className="bloco">
          <h2 className="bloco__titulo">Jogos gerados</h2>
          <div className="lista-jogos-gerados">
            {jogos.map((jogo, i) => (
              <div key={i} className="jogo-gerado">
                <Dezenas dezenas={jogo.dezenas} />
                <div className="jogo-gerado__meta">
                  <span>Soma: {jogo.soma}</span>
                  <span>
                    {jogo.pares} pares / {jogo.impares} ímpares
                  </span>
                  {!jogo.atendeuTodosFiltros && (
                    <span className="badge badge--acumulou">Filtros parcialmente atendidos</span>
                  )}
                  <button
                    type="button"
                    className="botao-copiar"
                    onClick={() => copiarJogo(jogo.dezenas)}
                  >
                    Copiar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
