"use client";

import { useState, useTransition } from "react";
import PixCheckoutButton from "@/components/auth/PixCheckoutButton";
import { BOLAO_PRO_PIX } from "@/lib/mercadopago/planos";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Dezenas from "@/components/Dezenas";
import {
  adicionarParticipanteAction,
  alternarPagoAction,
  atualizarBolaoAction,
  excluirBolaoAction,
  removerParticipanteAction,
} from "@/lib/bolao-actions";
import { LIMITE_COTAS_GRATIS, LIMITE_COTAS_PRO } from "@/lib/bolao-limites";
import { enviarBeacon, obterOuCriarAnonymousId } from "@/lib/telemetria-cliente";

interface BolaoView {
  id: string;
  slug: string;
  titulo: string;
  loteria: string;
  nomeLoteria: string;
  alvo: string;
  concursoAlvo: number | null;
  poolDezenas: number[];
  garantia: number;
  precoApostaCents: number;
  valorCotaCents: number;
  qtdCotas: number;
  status: string;
}

interface ParticipanteView {
  id: string;
  nome: string;
  cotas: number;
  pago: boolean;
}

function moeda(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const PREVIEW_JOGOS = 10;

export default function BolaoEditorClient({
  bolao,
  jogos,
  participantes,
  ehPro,
  premium,
  proAte,
  userId,
}: {
  bolao: BolaoView;
  jogos: number[][];
  participantes: ParticipanteView[];
  ehPro: boolean;
  premium: boolean;
  proAte: string | null;
  userId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [cotas, setCotas] = useState("1");
  const [novoTotal, setNovoTotal] = useState(String(bolao.qtdCotas));
  const [copiado, setCopiado] = useState(false);

  const encerrado = bolao.status === "conferido";
  const atribuidas = participantes.reduce((s, p) => s + p.cotas, 0);
  const pagas = participantes.filter((p) => p.pago).reduce((s, p) => s + p.cotas, 0);
  const custoTotal = jogos.length * bolao.precoApostaCents;
  const limiteCotas = ehPro ? LIMITE_COTAS_PRO : LIMITE_COTAS_GRATIS;
  const linkPublico = `https://www.lotoanalitica.com.br/b/${bolao.slug}`;

  function executar(
    fn: () => Promise<{ ok: boolean; erro?: string; motivo?: string }>,
    aoSucesso?: () => void
  ) {
    setErro(null);
    startTransition(async () => {
      const r = await fn();
      if (r.ok) {
        aoSucesso?.();
        router.refresh();
      } else {
        setErro(r.erro ?? "Não foi possível concluir.");
        if (r.motivo === "cotas") {
          enviarBeacon({
            eventName: "limit_reached",
            tool: "bolao",
            lottery: bolao.loteria,
            anonymousId: obterOuCriarAnonymousId(),
            metadata: { limite: "cotas" },
          });
        }
      }
    });
  }

  function handleAdicionar(e: React.FormEvent) {
    e.preventDefault();
    executar(
      () => adicionarParticipanteAction(bolao.id, nome, Number(cotas)),
      () => {
        setNome("");
        setCotas("1");
      }
    );
  }

  function registrarCompartilhamento(canal: "copiar" | "whatsapp") {
    enviarBeacon({
      eventName: "bolao_shared",
      tool: "bolao",
      lottery: bolao.loteria,
      anonymousId: obterOuCriarAnonymousId(),
      metadata: { canal },
    });
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(linkPublico);
      registrarCompartilhamento("copiar");
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErro("Não foi possível copiar. Selecione o link e copie manualmente.");
    }
  }

  return (
    <div className="bolao-editor">
      <div className="conta-header">
        <div>
          <h1 className="conta-titulo">{bolao.titulo}</h1>
          <p className="conta-email">
            {bolao.nomeLoteria} ·{" "}
            {bolao.alvo === "virada"
              ? "Mega da Virada"
              : bolao.concursoAlvo
                ? `concurso ${bolao.concursoAlvo}`
                : "concurso a definir"}{" "}
            · <span className="chip">{ehPro ? "Pro" : "Grátis"}</span>{" "}
            <span className="chip">{bolao.status}</span>
          </p>
        </div>
      </div>

      {erro && <p className="gerador-erro">{erro}</p>}

      <section className="conta-secao">
        <h2 className="conta-secao-titulo">Link para o grupo</h2>
        <p className="bloco__nota">
          Quem receber o link vê os jogos, as cotas e quem já pagou — sem precisar de conta.
        </p>
        <div className="bolao-editor__link">
          <input type="text" readOnly value={linkPublico} aria-label="Link público do bolão" />
          <button type="button" className="botao-copiar" onClick={copiarLink}>
            {copiado ? "Copiado!" : "Copiar link"}
          </button>
          <a
            className="botao-copiar"
            href={`https://wa.me/?text=${encodeURIComponent(`Bolão "${bolao.titulo}": ${linkPublico}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => registrarCompartilhamento("whatsapp")}
          >
            WhatsApp
          </a>
        </div>
      </section>

      <section className="conta-secao">
        <h2 className="conta-secao-titulo">Resumo</h2>
        <div className="transicao-resumo">
          <div className="transicao-resumo__item">
            <p className="analise-cartao__rotulo">Custo total ({jogos.length} jogos)</p>
            <p className="transicao-resumo__valor">{moeda(custoTotal)}</p>
          </div>
          <div className="transicao-resumo__item">
            <p className="analise-cartao__rotulo">Valor da cota ({bolao.qtdCotas})</p>
            <p className="transicao-resumo__valor">{moeda(bolao.valorCotaCents)}</p>
          </div>
          <div className="transicao-resumo__item">
            <p className="analise-cartao__rotulo">Cotas pagas</p>
            <p className="transicao-resumo__valor">
              {pagas}/{bolao.qtdCotas}
            </p>
          </div>
        </div>
        <p className="bloco__nota">
          Garantia: pelo menos {bolao.garantia} pontos se {bolao.garantia} das{" "}
          {bolao.poolDezenas.length} dezenas do pool saírem. O site só registra os pagamentos
          do grupo — o dinheiro nunca passa por aqui.
        </p>
      </section>

      <section className="conta-secao">
        <h2 className="conta-secao-titulo">Participantes</h2>
        {participantes.length === 0 ? (
          <p className="bloco__nota">Ninguém cadastrado ainda.</p>
        ) : (
          <div className="tabela-scroll">
            <table className="tabela-dados">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th className="num">Cotas</th>
                  <th className="num">A pagar</th>
                  <th>Pago</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {participantes.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nome}</td>
                    <td className="num">{p.cotas}</td>
                    <td className="num">{moeda(p.cotas * bolao.valorCotaCents)}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={p.pago}
                        disabled={pending}
                        aria-label={`${p.nome} pagou`}
                        onChange={() => executar(() => alternarPagoAction(bolao.id, p.id))}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="botao-copiar"
                        disabled={pending}
                        onClick={() => executar(() => removerParticipanteAction(bolao.id, p.id))}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="bloco__nota">
          {atribuidas} de {bolao.qtdCotas} cotas atribuídas.
        </p>

        {!encerrado && (
          <form onSubmit={handleAdicionar} className="bolao-editor__form">
            <div className="campo-filtro">
              <label htmlFor="part-nome">Nome</label>
              <input
                id="part-nome"
                type="text"
                maxLength={60}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="campo-filtro">
              <label htmlFor="part-cotas">Cotas</label>
              <input
                id="part-cotas"
                type="number"
                min={1}
                value={cotas}
                onChange={(e) => setCotas(e.target.value)}
              />
            </div>
            <button type="submit" className="botao-gerar" disabled={pending}>
              Adicionar
            </button>
          </form>
        )}

        {!encerrado && (
          <form
            className="bolao-editor__form"
            onSubmit={(e) => {
              e.preventDefault();
              executar(() => atualizarBolaoAction(bolao.id, { qtdCotas: Number(novoTotal) }));
            }}
          >
            <div className="campo-filtro">
              <label htmlFor="total-cotas">Total de cotas do bolão</label>
              <input
                id="total-cotas"
                type="number"
                min={1}
                value={novoTotal}
                onChange={(e) => setNovoTotal(e.target.value)}
              />
            </div>
            <button type="submit" className="botao-copiar" disabled={pending}>
              Atualizar total
            </button>
          </form>
        )}

        {!ehPro ? (
          <div className="bolao-pro-upsell">
            <h3 className="bolao-salvar__titulo">Mais de {limiteCotas} cotas? Libere o Bolão Pro</h3>
            <p className="bloco__nota">
              Até {LIMITE_COTAS_PRO} cotas, aviso do resultado por e-mail para os participantes e
              página sem anúncios por {BOLAO_PRO_PIX.periodDays} dias — R${" "}
              {BOLAO_PRO_PIX.amount.toFixed(2).replace(".", ",")} por Pix, só para este bolão.
              {" "}
              {!premium && (
                <>
                  Ou assine o <Link href="/assinar">Premium</Link> e use em todos os bolões.
                </>
              )}
            </p>
            {!encerrado && (
              <PixCheckoutButton userId={userId} bolaoId={bolao.id} rotulo="Liberar Bolão Pro com Pix" />
            )}
          </div>
        ) : (
          <p className="bloco__nota">
            Bolão Pro ativo{premium ? " (incluso no seu Premium)" : proAte ? ` até ${new Date(proAte).toLocaleDateString("pt-BR")}` : ""}
            : até {LIMITE_COTAS_PRO} cotas e aviso por e-mail aos participantes que pediram.
          </p>
        )}
      </section>

      <section className="conta-secao">
        <h2 className="conta-secao-titulo">Jogos ({jogos.length})</h2>
        {jogos.slice(0, PREVIEW_JOGOS).map((j, i) => (
          <div key={i} className="fechamento-ticket">
            <span className="fechamento-ticket__numero">#{i + 1}</span>
            <Dezenas dezenas={j} tamanho="pequena" wrapperClassName="ledger__dezenas" />
          </div>
        ))}
        {jogos.length > PREVIEW_JOGOS && (
          <p className="bloco__nota">
            Mostrando {PREVIEW_JOGOS} de {jogos.length} jogos. A lista completa fica na página pública.
          </p>
        )}
      </section>

      {!encerrado && (
        <section className="conta-secao">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="botao-copiar"
              disabled={pending}
              onClick={() =>
                executar(() =>
                  atualizarBolaoAction(bolao.id, {
                    status: bolao.status === "aberto" ? "fechado" : "aberto",
                  })
                )
              }
            >
              {bolao.status === "aberto" ? "Fechar bolão" : "Reabrir bolão"}
            </button>
            <button
              type="button"
              className="botao-copiar"
              disabled={pending}
              onClick={() => {
                if (!window.confirm("Excluir este bolão e todos os seus participantes?")) return;
                executar(
                  () => excluirBolaoAction(bolao.id),
                  () => router.push("/conta/boloes")
                );
              }}
            >
              Excluir bolão
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
