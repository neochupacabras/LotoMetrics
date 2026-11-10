"use client";

import { useEffect, useState, useTransition } from "react";
import Dezenas from "./Dezenas";
import BolaoSalvar from "./BolaoSalvar";
import InsightCallout from "./InsightCallout";
import { planosViaveis, PlanoBolao } from "@/lib/bolao-opcoes";
import { calcularFechamentoAction, FechamentoActionResult } from "@/lib/fechamento-actions";
import { gerarPdfBolao, baixarPdfBolao } from "@/lib/bolao-pdf";
import { formatarDezena } from "@/lib/format";
import { chaveRascunho, lerRascunho, serializarRascunho, type RascunhoBolao } from "@/lib/bolao-rascunho";
import { PRECO_APOSTA_SIMPLES } from "@/lib/mega-da-virada";
import { enviarBeacon, obterOuCriarAnonymousId } from "@/lib/telemetria-cliente";

const PREVIEW_MAX = 20;

// Preço da aposta simples já preenchido (editável) onde ele é conhecido com
// certeza; nas outras loterias o campo continua vazio.
const PRECO_SUGERIDO: Record<string, string> = {
  megasena: PRECO_APOSTA_SIMPLES.toFixed(2).replace(".", ","),
};

// Etapas intermediárias do funil do bolão (tool_started + metadata.etapa).
// O fim da montagem é tool_completed; a criação é bolao_created (servidor).
type EtapaFunil = "planos" | "dezenas" | "pediu_login" | "retomado";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function BolaoClient({
  codigoLoteria,
  nomeLoteria,
  dezenaMin,
  dezenaMax,
}: {
  codigoLoteria: string;
  nomeLoteria: string;
  dezenaMin: number;
  dezenaMax: number;
}) {
  const [etapa, setEtapa] = useState<"orcamento" | "dezenas" | "resultado">("orcamento");

  const [orcamentoTexto, setOrcamentoTexto] = useState("");
  const [precoTexto, setPrecoTexto] = useState(PRECO_SUGERIDO[codigoLoteria] ?? "");
  // De onde o organizador veio (ex.: "bolao_publico" = clicou em "Organizar o
  // meu bolão" na página de outro bolão — o loop de aquisição).
  const [origem, setOrigem] = useState<string | null>(null);
  const [participantesTexto, setParticipantesTexto] = useState("");
  const [planos, setPlanos] = useState<PlanoBolao[] | null>(null);
  const [planoEscolhido, setPlanoEscolhido] = useState<PlanoBolao | null>(null);
  const [erroOrcamento, setErroOrcamento] = useState<string | null>(null);

  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [resultado, setResultado] = useState<FechamentoActionResult | null>(null);
  const [erroGeracao, setErroGeracao] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [gerandoPdf, setGerandoPdf] = useState(false);

  const orcamento = Number(orcamentoTexto.replace(",", "."));
  const preco = Number(precoTexto.replace(",", "."));
  const participantes = participantesTexto ? Number(participantesTexto) : null;

  const todasDezenas = Array.from({ length: dezenaMax - dezenaMin + 1 }, (_, i) => dezenaMin + i);

  function funil(etapaFunil: EtapaFunil | "concluido", extra?: Record<string, unknown>, origemAtual = origem) {
    enviarBeacon({
      eventName: etapaFunil === "concluido" ? "tool_completed" : "tool_started",
      tool: "bolao",
      lottery: codigoLoteria,
      anonymousId: obterOuCriarAnonymousId(),
      metadata: {
        ...(etapaFunil === "concluido" ? {} : { etapa: etapaFunil }),
        origem: origemAtual,
        pagina: window.location.pathname,
        ...extra,
      },
    });
  }

  // Gera os jogos do plano. Usado pelo botão e pela volta do cadastro.
  function gerarJogos(plano: PlanoBolao, dezenas: number[], aoGerar?: () => void, origemAtual = origem) {
    startTransition(async () => {
      const r = await calcularFechamentoAction(codigoLoteria, dezenas, "reduzido", plano.garantia);
      if (!r.ok) {
        setErroGeracao(r.erro ?? "Não foi possível gerar os jogos do bolão.");
      } else {
        setResultado(r);
        setEtapa("resultado");
        funil("concluido", { jogos: r.totalTickets, tamanho_pool: plano.tamanhoPool }, origemAtual);
        aoGerar?.();
      }
    });
  }

  // Volta do login/cadastro (?retomar=1): restaura o bolão montado e já gera
  // os jogos de novo, deixando o organizador direto no "Salvar e gerar link".
  // Fora isso, só lê a origem (?origem=) para o funil.
  /* eslint-disable react-hooks/set-state-in-effect -- sincroniza com localStorage/URL (sistema externo), só no cliente */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const origemUrl = params.get("origem");
    if (origemUrl) setOrigem(origemUrl);
    if (params.get("retomar") !== "1") return;
    let r: RascunhoBolao | null = null;
    try {
      r = lerRascunho(localStorage.getItem(chaveRascunho(codigoLoteria)), Date.now());
      localStorage.removeItem(chaveRascunho(codigoLoteria));
    } catch {
      // localStorage indisponível: começa do zero.
    }
    if (!r) return;
    const orc = Number(r.orcamento.replace(",", "."));
    const prc = Number(r.preco.replace(",", "."));
    const viaveis = planosViaveis(codigoLoteria, orc, prc);
    const plano = viaveis.find((p) => p.tamanhoPool === r.tamanhoPool && p.garantia === r.garantia);
    if (!plano) return;
    setOrcamentoTexto(r.orcamento);
    setPrecoTexto(r.preco);
    setParticipantesTexto(r.participantes);
    setPlanos(viaveis);
    setPlanoEscolhido(plano);
    setSelecionadas(new Set(r.selecionadas));
    setEtapa("dezenas");
    const origemRascunho = origemUrl ?? r.origem;
    setOrigem(origemRascunho);
    funil("retomado", undefined, origemRascunho);
    if (r.selecionadas.length === plano.tamanhoPool) {
      gerarJogos(plano, r.selecionadas, () => {
        // Espera o React desenhar a etapa de resultado antes de rolar.
        setTimeout(() => document.querySelector(".bolao-salvar")?.scrollIntoView({ behavior: "smooth" }), 100);
      }, origemRascunho);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- roda uma vez, na montagem
  }, [codigoLoteria]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function salvarRascunho() {
    if (!planoEscolhido) return;
    funil("pediu_login");
    try {
      const r: RascunhoBolao = {
        orcamento: orcamentoTexto,
        preco: precoTexto,
        participantes: participantesTexto,
        tamanhoPool: planoEscolhido.tamanhoPool,
        garantia: planoEscolhido.garantia,
        selecionadas: Array.from(selecionadas),
        origem,
      };
      localStorage.setItem(chaveRascunho(codigoLoteria), serializarRascunho(r, Date.now()));
    } catch {
      // sem localStorage o usuário só refaz a escolha depois do login.
    }
  }

  function handleVerPlanos() {
    setErroOrcamento(null);
    if (!Number.isFinite(orcamento) || orcamento <= 0) {
      setErroOrcamento("Digite um orçamento válido.");
      return;
    }
    if (!Number.isFinite(preco) || preco <= 0) {
      setErroOrcamento("Digite um preço de aposta válido.");
      return;
    }
    const encontrados = planosViaveis(codigoLoteria, orcamento, preco);
    if (encontrados.length === 0) {
      setErroOrcamento(
        "Nenhum plano de fechamento cabe nesse orçamento — o menor fechamento disponível precisa de mais jogos do que o orçamento permite. Aumente o orçamento ou jogue um fechamento completo menor na aba Fechamentos."
      );
      setPlanos(null);
      return;
    }
    setPlanos(encontrados);
    funil("planos", { orcamento, planos: encontrados.length });
  }

  function escolherPlano(plano: PlanoBolao) {
    funil("dezenas", { tamanho_pool: plano.tamanhoPool, garantia: plano.garantia });
    setPlanoEscolhido(plano);
    setSelecionadas(new Set());
    setResultado(null);
    setErroGeracao(null);
    setEtapa("dezenas");
  }

  function toggleDezena(d: number) {
    if (!planoEscolhido) return;
    setResultado(null);
    setErroGeracao(null);
    setSelecionadas((prev) => {
      const novo = new Set(prev);
      if (novo.has(d)) {
        novo.delete(d);
      } else if (novo.size < planoEscolhido.tamanhoPool) {
        novo.add(d);
      }
      return novo;
    });
  }

  function handleGerar() {
    if (!planoEscolhido) return;
    setErroGeracao(null);

    if (selecionadas.size !== planoEscolhido.tamanhoPool) {
      setErroGeracao(`Selecione exatamente ${planoEscolhido.tamanhoPool} dezenas.`);
      return;
    }

    gerarJogos(planoEscolhido, Array.from(selecionadas));
  }

  async function handleBaixarPdf() {
    if (!resultado?.tickets || !planoEscolhido) return;
    setGerandoPdf(true);
    try {
      const bytes = await gerarPdfBolao({
        nomeLoteria,
        tamanhoPool: planoEscolhido.tamanhoPool,
        garantia: planoEscolhido.garantia,
        poolDezenas: Array.from(selecionadas).sort((a, b) => a - b),
        tickets: resultado.tickets,
        custoTotal: resultado.totalTickets! * preco,
        precoAposta: preco,
        qtdParticipantes: participantes,
      });
      baixarPdfBolao(bytes, `bolao-${codigoLoteria}-${planoEscolhido.tamanhoPool}dezenas.pdf`);
    } finally {
      setGerandoPdf(false);
    }
  }

  function recomecar() {
    setEtapa("orcamento");
    setPlanos(null);
    setPlanoEscolhido(null);
    setSelecionadas(new Set());
    setResultado(null);
    setErroGeracao(null);
  }

  return (
    <div>
      {/* ---------- Etapa 1: orçamento ---------- */}
      {etapa === "orcamento" && (
        <div>
          <p className="bloco__nota">
            Diga o orçamento do grupo e confira o preço da aposta simples
            {PRECO_SUGERIDO[codigoLoteria] ? " (já preenchido com o preço atual)" : ""}. O sistema
            mostra quais fechamentos cabem no orçamento, da maior garantia para a menor.
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div className="campo-filtro">
              <label htmlFor="orcamento">Orçamento do grupo (R$)</label>
              <input
                id="orcamento"
                type="text"
                inputMode="decimal"
                placeholder="ex: 500"
                value={orcamentoTexto}
                onChange={(e) => setOrcamentoTexto(e.target.value)}
              />
            </div>
            <div className="campo-filtro">
              <label htmlFor="preco">Preço da aposta simples (R$)</label>
              <input
                id="preco"
                type="text"
                inputMode="decimal"
                placeholder="ex: 3,50"
                value={precoTexto}
                onChange={(e) => setPrecoTexto(e.target.value)}
              />
            </div>
            <div className="campo-filtro">
              <label htmlFor="participantes">Participantes (opcional)</label>
              <input
                id="participantes"
                type="number"
                min={1}
                placeholder="ex: 10"
                value={participantesTexto}
                onChange={(e) => setParticipantesTexto(e.target.value)}
              />
            </div>
          </div>

          <button type="button" className="botao-gerar" onClick={handleVerPlanos}>
            Ver planos disponíveis
          </button>

          {erroOrcamento && <p className="gerador-erro">{erroOrcamento}</p>}

          {planos && (
            <div className="bloco" style={{ marginTop: "20px" }}>
              <h2 className="bloco__titulo">Planos que cabem no orçamento</h2>
              <p className="bloco__nota">
                Ordenado da maior garantia para a menor. Clique num plano para escolher as
                dezenas.
              </p>
              <div className="tabela-scroll">
        <table className="tabela-dados">
                <thead>
                  <tr>
                    <th>Pool</th>
                    <th>Garantia</th>
                    <th className="num">Jogos</th>
                    <th className="num">Custo total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {planos.map((p) => (
                    <tr key={`${p.tamanhoPool}-${p.garantia}`}>
                      <td>{p.tamanhoPool} dezenas</td>
                      <td>{p.garantia} pontos</td>
                      <td className="num">{p.totalJogos}</td>
                      <td className="num">{formatarMoeda(p.custoTotal)}</td>
                      <td>
                        <button
                          type="button"
                          className="botao-copiar"
                          onClick={() => escolherPlano(p)}
                        >
                          Escolher
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
      </div>
            </div>
          )}
        </div>
      )}

      {/* ---------- Etapa 2: escolher dezenas ---------- */}
      {etapa === "dezenas" && planoEscolhido && (
        <div>
          <p className="bloco__nota">
            Plano escolhido: pool de <strong>{planoEscolhido.tamanhoPool} dezenas</strong>,
            garantindo pelo menos <strong>{planoEscolhido.garantia} pontos</strong> em{" "}
            <strong>{planoEscolhido.totalJogos} jogos</strong> (
            {formatarMoeda(planoEscolhido.custoTotal)}).{" "}
            <button type="button" className="botao-copiar" onClick={recomecar}>
              Trocar plano
            </button>
          </p>

          <div className="grade-dezenas">
            {todasDezenas.map((d) => (
              <button
                key={d}
                type="button"
                className="dezena-selecionavel"
                data-selecionada={selecionadas.has(d)}
                disabled={!selecionadas.has(d) && selecionadas.size >= planoEscolhido.tamanhoPool}
                onClick={() => toggleDezena(d)}
              >
                {formatarDezena(d)}
              </button>
            ))}
          </div>

          <p className="fechamento-resumo">
            {selecionadas.size} de {planoEscolhido.tamanhoPool} dezenas selecionadas
          </p>

          <button type="button" className="botao-gerar" onClick={handleGerar} disabled={pending}>
            {pending ? (<><span className="spinner-inline" aria-hidden /> Gerando...</>) : "Gerar jogos do bolão"}
          </button>

          {erroGeracao && <p className="gerador-erro">{erroGeracao}</p>}
        </div>
      )}

      {/* ---------- Etapa 3: resultado ---------- */}
      {etapa === "resultado" && resultado?.ok && resultado.tickets && planoEscolhido && (
        <div className="bloco">
          <h2 className="bloco__titulo">
            <span className="celula-acertos__pontos">
              {resultado.totalTickets} jogos — garante pelo menos {resultado.pontosGarantidos}{" "}
              pontos
            </span>
            {resultado.garantiaVerificada && (
              <span className="chip chip--destaque chip--bloco">garantia verificada</span>
            )}
          </h2>

          <InsightCallout kicker="O que isso garante de verdade">
            Se pelo menos{" "}
            <strong>{resultado.pontosGarantidos} das {planoEscolhido.tamanhoPool} dezenas do pool</strong>{" "}
            estiverem entre as sorteadas, pelo menos 1 desses{" "}
            <strong>{resultado.totalTickets} jogos</strong> vai marcar{" "}
            {resultado.pontosGarantidos} pontos — não importa qual participante ficou com qual
            bilhete.
          </InsightCallout>

          <div className="transicao-resumo">
            <div className="transicao-resumo__item">
              <p className="analise-cartao__rotulo">Custo total do bolão</p>
              <p className="transicao-resumo__valor">
                {formatarMoeda(resultado.totalTickets! * preco)}
              </p>
            </div>
            {participantes && participantes > 0 && (
              <div className="transicao-resumo__item">
                <p className="analise-cartao__rotulo">Custo por participante ({participantes})</p>
                <p className="transicao-resumo__valor">
                  {formatarMoeda((resultado.totalTickets! * preco) / participantes)}
                </p>
              </div>
            )}
          </div>

          <p className="bloco__nota" style={{ marginTop: "12px" }}>
            Mostrando {Math.min(PREVIEW_MAX, resultado.tickets.length)} de {resultado.totalTickets}{" "}
            jogos. Baixe o PDF para ver e compartilhar todos.
          </p>

          {resultado.tickets.slice(0, PREVIEW_MAX).map((ticket, i) => (
            <div key={i} className="fechamento-ticket">
              <span className="fechamento-ticket__numero">#{i + 1}</span>
              <Dezenas dezenas={ticket} tamanho="pequena" wrapperClassName="ledger__dezenas" />
            </div>
          ))}

          <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="botao-baixar"
              onClick={handleBaixarPdf}
              disabled={gerandoPdf}
            >
              {gerandoPdf ? "Gerando PDF..." : `Baixar PDF do bolão (${resultado.totalTickets} jogos)`}
            </button>
            <button type="button" className="botao-copiar" onClick={recomecar}>
              Recomeçar
            </button>
          </div>

          <BolaoSalvar
            codigoLoteria={codigoLoteria}
            poolDezenas={Array.from(selecionadas)}
            garantia={planoEscolhido.garantia}
            tickets={resultado.tickets}
            precoApostaCents={Math.round(preco * 100)}
            cotasSugeridas={participantes && participantes > 0 ? participantes : null}
            salvarRascunho={salvarRascunho}
            origem={origem}
          />

          <div className="aviso-legal" style={{ marginTop: "16px" }}>
            A garantia vale apenas se a quantidade necessária das dezenas do pool estiver
            entre as sorteadas — o fechamento organiza a cobertura, não aumenta a chance
            disso acontecer.
          </div>
        </div>
      )}
    </div>
  );
}
