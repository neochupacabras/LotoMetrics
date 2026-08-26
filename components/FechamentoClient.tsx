"use client";

import { useMemo, useState, useTransition } from "react";
import Dezenas from "./Dezenas";
import { calcularFechamentoAction, FechamentoActionResult } from "@/lib/fechamento-actions";
import { salvarJogoAction } from "@/lib/jogo-actions";
import { probabilidadeAoMenosK } from "@/lib/probabilidades";
import { formatarDezena } from "@/lib/format";
import { FECHAMENTO_CONFIG } from "@/lib/fechamento-config";

const PREVIEW_MAX = 20;

export default function FechamentoClient({
  codigoLoteria,
  dezenaMin,
  dezenaMax,
  qtdDezenasSorteadas,
  nomeLoteria = "Loteria",
}: {
  codigoLoteria: string;
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenasSorteadas: number;
  nomeLoteria?: string;
}) {
  const config = FECHAMENTO_CONFIG[codigoLoteria] ?? { poolMin: 0, poolMax: 0, getKsPermitidos: () => [] };
  const configDisponivel = codigoLoteria in FECHAMENTO_CONFIG;

  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [tipo, setTipo] = useState<"reduzido" | "completo">("reduzido");
  const [k, setK] = useState<number | null>(null);
  const [resultado, setResultado] = useState<FechamentoActionResult | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvoStatus, setSalvoStatus] = useState<"idle"|"ok"|"erro"|"login">("idle");

  async function exportarParaRastreador() {
    if (!resultado?.tickets) return;
    setSalvando(true);
    setSalvoStatus("idle");
    let salvos = 0;
    let erroLogin = false;
    for (const ticket of resultado.tickets) {
      const res = await salvarJogoAction(codigoLoteria, ticket, `Fechamento #${salvos + 1}`);
      if (!res.ok && res.erro?.includes("login")) { erroLogin = true; break; }
      if (res.ok) salvos++;
    }
    setSalvando(false);
    if (erroLogin) { setSalvoStatus("login"); return; }
    setSalvoStatus(salvos > 0 ? "ok" : "erro");
    setTimeout(() => setSalvoStatus("idle"), 4000);
  }
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const todasDezenas = useMemo(
    () => Array.from({ length: dezenaMax - dezenaMin + 1 }, (_, i) => dezenaMin + i),
    [dezenaMin, dezenaMax]
  );

  const poolTamanho = selecionadas.size;
  const dentroDoIntervalo = poolTamanho >= config.poolMin && poolTamanho <= config.poolMax;
  const ksPermitidos = dentroDoIntervalo ? config.getKsPermitidos(poolTamanho) : [];

  function toggleDezena(d: number) {
    setResultado(null);
    setErro(null);
    setSelecionadas((prev) => {
      const novo = new Set(prev);
      if (novo.has(d)) {
        novo.delete(d);
      } else if (novo.size < config.poolMax) {
        novo.add(d);
      }
      return novo;
    });
  }

  function handleGerar() {
    setErro(null);
    setResultado(null);

    if (!dentroDoIntervalo) {
      setErro(`Selecione entre ${config.poolMin} e ${config.poolMax} dezenas.`);
      return;
    }
    if (tipo === "reduzido" && (!k || !ksPermitidos.includes(k))) {
      setErro("Escolha quantos pontos quer garantir.");
      return;
    }

    startTransition(async () => {
      const r = await calcularFechamentoAction(
        codigoLoteria,
        Array.from(selecionadas),
        tipo,
        tipo === "reduzido" ? k ?? undefined : undefined
      );
      if (!r.ok) {
        setErro(r.erro ?? "Não foi possível gerar o fechamento.");
      } else {
        setResultado(r);
      }
    });
  }

  function baixarTodos() {
    if (!resultado?.tickets) return;

    const LARGURA = 64;
    const linha = (ch = "-") => ch.repeat(LARGURA);
    const rotulo = (label: string, valor: string) =>
      `  ${label.padEnd(20, ".")}: ${valor}`;

    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString("pt-BR");
    const horaFormatada = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const dezenasEscolhidas = Array.from(selecionadas)
      .sort((a, b) => a - b)
      .map(formatarDezena)
      .join(" - ");

    const garantia =
      resultado.tipo === "reduzido"
        ? `pelo menos ${resultado.pontosGarantidos} pontos`
        : `todas as combinações (fechamento completo)`;

    const cabecalho = [
      linha("="),
      "  LOTOANALÍTICA — FECHAMENTO DE DEZENAS".padEnd(LARGURA - 1),
      linha("="),
      rotulo("Loteria", nomeLoteria),
      rotulo("Tipo", resultado.tipo === "reduzido" ? "Reduzido" : "Completo"),
      rotulo("Garantia", garantia),
      rotulo("Dezenas escolhidas", `${poolTamanho} — ${dezenasEscolhidas}`),
      rotulo("Total de jogos", String(resultado.totalTickets ?? resultado.tickets.length)),
      rotulo("Gerado em", `${dataFormatada} às ${horaFormatada}`),
      linha(),
      "",
    ];

    const linhas = resultado.tickets.map((t, i) => {
      const dezenas = t.map(formatarDezena).join(" - ");
      return `  Jogo ${String(i + 1).padStart(3, "0")}   ${dezenas}`;
    });

    const rodape = [
      "",
      linha(),
      "  O fechamento organiza a cobertura das dezenas escolhidas — ele",
      "  não aumenta a probabilidade de essas dezenas serem sorteadas.",
      "",
      "  lotoanalitica.com.br",
      linha("="),
    ];

    const conteudo = [...cabecalho, ...linhas, ...rodape].join("\n");
    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lotoanalitica-fechamento-${codigoLoteria}-${poolTamanho}dezenas.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const probabilidadePrecondicao =
    tipo === "reduzido" && k && dentroDoIntervalo
      ? probabilidadeAoMenosK(dezenaMax, qtdDezenasSorteadas, poolTamanho, k)
      : null;

  if (!configDisponivel) {
    return (
      <div className="bloco" style={{ maxWidth: 680 }}>
        <p className="bloco__titulo">Fechamento não disponível para esta loteria</p>
        <p>
          A técnica de fechamento parte de escolher <em>mais dezenas do que o
          mínimo</em> da aposta. Essa loteria não se encaixa nesse modelo —{" "}
          {qtdDezenasSorteadas === 20
            ? "aqui a aposta já é sempre um número fixo de dezenas, sem opção de escolher mais."
            : "o formato de aposta dela é diferente do de escolher dezenas de um universo comum."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="bloco__nota">
        Selecione as dezenas que você quer apostar (entre {config.poolMin} e {config.poolMax}).
      </p>

      <div className="grade-dezenas">
        {todasDezenas.map((d) => (
          <button
            key={d}
            type="button"
            className="dezena-selecionavel"
            data-selecionada={selecionadas.has(d)}
            disabled={!selecionadas.has(d) && selecionadas.size >= config.poolMax}
            onClick={() => toggleDezena(d)}
          >
            {formatarDezena(d)}
          </button>
        ))}
      </div>

      <p className="fechamento-resumo">
        {poolTamanho} dezena(s) selecionada(s)
        {!dentroDoIntervalo && poolTamanho > 0 && (
          <> — selecione entre {config.poolMin} e {config.poolMax} para continuar</>
        )}
      </p>

      <div className="fechamento-config">
        <label className="campo-checkbox">
          <input
            type="radio"
            name="tipo"
            checked={tipo === "reduzido"}
            onChange={() => setTipo("reduzido")}
          />
          <span className="campo-checkbox__texto">
            Reduzido (menos jogos, garante uma faixa menor)
          </span>
        </label>
        <label className="campo-checkbox">
          <input
            type="radio"
            name="tipo"
            checked={tipo === "completo"}
            onChange={() => setTipo("completo")}
          />
          <span className="campo-checkbox__texto">
            Completo (todas as combinações, garante o prêmio máximo)
          </span>
        </label>
      </div>

      {tipo === "reduzido" && (
        <div className="fechamento-config">
          <label htmlFor="garantia">Garantir pelo menos</label>
          <select
            id="garantia"
            className="campo-select"
            value={k ?? ""}
            disabled={!dentroDoIntervalo}
            onChange={(e) => setK(Number(e.target.value))}
          >
            <option value="" disabled>
              escolha
            </option>
            {ksPermitidos.map((opcao) => (
              <option key={opcao} value={opcao}>
                {opcao} pontos
              </option>
            ))}
          </select>
        </div>
      )}

      {probabilidadePrecondicao !== null && (
        <p className="bloco__nota">
          Chance real de pelo menos {k} das suas {poolTamanho} dezenas estarem entre as{" "}
          {qtdDezenasSorteadas} sorteadas: <strong>1 em {Math.round(1 / probabilidadePrecondicao).toLocaleString("pt-BR")}</strong>.
          A garantia do fechamento só "ativa" se isso acontecer — ela não muda essa chance.
        </p>
      )}

      <button type="button" className="botao-gerar" onClick={handleGerar} disabled={pending}>
        {pending ? "Calculando..." : "Gerar fechamento"}
      </button>

      {erro && <p className="gerador-erro">{erro}</p>}

      {resultado?.ok && resultado.tickets && (
        <div className="bloco">
          <h2 className="bloco__titulo">
            <span className="celula-acertos__pontos">
              {resultado.totalTickets} jogos — garante pelo menos {resultado.pontosGarantidos}{" "}
              pontos
            </span>

          </h2>
          <p className="bloco__nota">
            Mostrando {Math.min(PREVIEW_MAX, resultado.tickets.length)} de {resultado.totalTickets}{" "}
            jogos. Baixe o arquivo completo para ver todos.
          </p>

          {resultado.tickets.slice(0, PREVIEW_MAX).map((ticket, i) => (
            <div key={i} className="fechamento-ticket">
              <span className="fechamento-ticket__numero">#{i + 1}</span>
              <Dezenas dezenas={ticket} tamanho="pequena" wrapperClassName="ledger__dezenas" />
            </div>
          ))}

          <button type="button" className="botao-baixar" onClick={baixarTodos}>
            Baixar todos os {resultado.totalTickets} jogos (.txt)
          </button>

          <div className="fechamento-exportar">
            <button
              type="button"
              className="botao-copiar"
              onClick={exportarParaRastreador}
              disabled={salvando}
            >
              {salvando ? "Salvando…" :
               salvoStatus === "ok" ? `✓ ${resultado.totalTickets} jogos salvos na conta` :
               salvoStatus === "erro" ? "Erro ao salvar" :
               `Salvar ${resultado.totalTickets} jogos no Rastreador →`}
            </button>
            {salvoStatus === "login" && (
              <p className="fechamento-exportar__nota">
                <a href="/entrar" className="conta-link-gerenciar">Faça login</a> para salvar jogos na conta.
              </p>
            )}
            {salvoStatus === "ok" && (
              <p className="fechamento-exportar__nota">
                Jogos salvos! Acesse <a href="/conta/jogos" className="conta-link-gerenciar">Meus jogos</a> para ver.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
