"use client";

import { useId, useState, useTransition } from "react";
import PixCheckoutButton from "@/components/auth/PixCheckoutButton";
import BilheteUpload from "@/components/conta/BilheteUpload";
import type { ComprovanteBolao } from "@/lib/bolao-bilhete-dados";
import { LIMITE_FOTOS_POR_BOLAO } from "@/lib/bolao-bilhete";
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
import { montarMensagemWhatsapp, urlWhatsapp } from "@/lib/bolao-compartilhar";
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

const ROTULO_STATUS: Record<string, string> = {
  aberto: "Aberto",
  fechado: "Fechado",
  conferido: "Conferido",
};

export default function BolaoEditorClient({
  bolao,
  jogos,
  participantes,
  ehPro,
  premium,
  proAte,
  userId,
  comprovante,
}: {
  bolao: BolaoView;
  jogos: number[][];
  participantes: ParticipanteView[];
  ehPro: boolean;
  premium: boolean;
  proAte: string | null;
  userId: string;
  comprovante: ComprovanteBolao;
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
        // O aviso fica no topo da página; sem rolar até lá, quem clicou num
        // botão lá embaixo (ex.: Fechar bolão) achava que nada tinha acontecido.
        window.scrollTo({ top: 0, behavior: "smooth" });
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

  const id = useId();
  const destino =
    bolao.alvo === "virada" ? "Mega da Virada" : bolao.concursoAlvo ? `concurso ${bolao.concursoAlvo}` : "concurso a definir";

  return (
    <div className="m-bolao">
      <header className="m-cabecalho">
        <div className="m-cabecalho__textos">
          <Link href="/conta/boloes" className="m-cabecalho__voltar">
            <span aria-hidden>←</span> Bolões
          </Link>
          <h1 className="m-cabecalho__titulo">{bolao.titulo}</h1>
          <p className="m-cabecalho__descricao">
            {bolao.nomeLoteria} · {destino}
          </p>
          <p className="m-bolao__etiquetas">
            <span className="m-etiqueta" data-aprovado={ehPro}>
              {ehPro ? "Bolão Pro" : "Grátis"}
            </span>
            <span className="m-etiqueta" data-aprovado={bolao.status === "conferido"}>
              {ROTULO_STATUS[bolao.status] ?? bolao.status}
            </span>
          </p>
        </div>
      </header>

      {erro && (
        <p className="m-aviso" data-tipo="atencao" role="alert">
          {erro}
        </p>
      )}

      <div className="m-secoes">
        <section className="m-secao" aria-labelledby={`${id}-link`}>
          <div className="m-secao__intro">
            <h2 id={`${id}-link`} className="m-secao__titulo">
              Link para o grupo
            </h2>
            <p className="m-secao__texto">
              Quem receber o link vê os jogos, as cotas e quem já pagou, sem precisar de conta.
            </p>
          </div>
          <div className="m-secao__corpo">
            <div className="m-bolao__link">
              <input
                type="text"
                readOnly
                value={linkPublico}
                aria-label="Link público do bolão"
                className="m-campo__entrada"
                onFocus={(e) => e.currentTarget.select()}
              />
              <button type="button" className="m-botao m-botao--secundario" onClick={copiarLink}>
                {copiado ? "Copiado" : "Copiar link"}
              </button>
              <a
                className="m-botao"
                href={urlWhatsapp(
                  montarMensagemWhatsapp({
                    titulo: bolao.titulo,
                    nomeLoteria: bolao.nomeLoteria,
                    url: linkPublico,
                    convite: {
                      alvo: bolao.alvo,
                      concursoAlvo: bolao.concursoAlvo,
                      valorCotaCents: bolao.valorCotaCents,
                      qtdCotas: bolao.qtdCotas,
                      totalJogos: jogos.length,
                    },
                  })
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => registrarCompartilhamento("whatsapp")}
              >
                Enviar no WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section className="m-secao" aria-labelledby={`${id}-resumo`}>
          <div className="m-secao__intro">
            <h2 id={`${id}-resumo`} className="m-secao__titulo">
              Resumo
            </h2>
            <p className="m-secao__texto">
              O site só registra os pagamentos do grupo — o dinheiro nunca passa por aqui.
            </p>
          </div>
          <div className="m-secao__corpo">
            <dl className="m-indicadores">
              <div className="m-indicador">
                <dt className="m-indicador__rotulo">Custo ({jogos.length} jogos)</dt>
                <dd className="m-indicador__valor">{moeda(custoTotal)}</dd>
              </div>
              <div className="m-indicador">
                <dt className="m-indicador__rotulo">Cota ({bolao.qtdCotas})</dt>
                <dd className="m-indicador__valor">{moeda(bolao.valorCotaCents)}</dd>
              </div>
              <div className="m-indicador">
                <dt className="m-indicador__rotulo">Cotas pagas</dt>
                <dd
                  className="m-indicador__valor"
                  data-sinal={pagas === bolao.qtdCotas && pagas > 0 ? "positivo" : undefined}
                >
                  {pagas}/{bolao.qtdCotas}
                </dd>
              </div>
            </dl>
            <p className="m-secao__texto">
              Garantia: pelo menos {bolao.garantia} pontos se {bolao.garantia} das {bolao.poolDezenas.length} dezenas
              do pool saírem.
            </p>
          </div>
        </section>

        <section className="m-secao" aria-labelledby={`${id}-part`}>
          <div className="m-secao__intro">
            <h2 id={`${id}-part`} className="m-secao__titulo">
              Participantes
            </h2>
            <p className="m-secao__texto">
              {atribuidas} de {bolao.qtdCotas} cotas atribuídas.
            </p>
          </div>
          <div className="m-secao__corpo">
            {participantes.length === 0 ? (
              <p className="m-vazio">Ninguém cadastrado ainda.</p>
            ) : (
              <div className="tabela-scroll">
                <table className="m-tabela">
                  <thead>
                    <tr>
                      <th scope="col">Nome</th>
                      <th scope="col" className="num">
                        Cotas
                      </th>
                      <th scope="col" className="num">
                        A pagar
                      </th>
                      <th scope="col">Pago</th>
                      <th scope="col">
                        <span className="m-sr">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantes.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nome}</td>
                        <td className="num m-numero">{p.cotas}</td>
                        <td className="num m-numero">{moeda(p.cotas * bolao.valorCotaCents)}</td>
                        <td>
                          <input
                            type="checkbox"
                            className="m-bolao__pago"
                            checked={p.pago}
                            disabled={pending}
                            aria-label={`${p.nome} pagou`}
                            onChange={() => executar(() => alternarPagoAction(bolao.id, p.id))}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="m-link-botao m-link-botao--perigo"
                            disabled={pending}
                            aria-label={`Remover ${p.nome}`}
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

            {!encerrado && (
              <form onSubmit={handleAdicionar} className="m-bolao__form">
                <label className="m-campo" htmlFor={`${id}-nome`}>
                  <span className="m-campo__rotulo">Nome</span>
                  <input
                    id={`${id}-nome`}
                    className="m-campo__entrada"
                    type="text"
                    maxLength={60}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </label>
                <label className="m-campo m-bolao__cotas" htmlFor={`${id}-cotas`}>
                  <span className="m-campo__rotulo">Cotas</span>
                  <input
                    id={`${id}-cotas`}
                    className="m-campo__entrada"
                    type="number"
                    min={1}
                    value={cotas}
                    onChange={(e) => setCotas(e.target.value)}
                  />
                </label>
                <button type="submit" className="m-botao" disabled={pending}>
                  Adicionar
                </button>
              </form>
            )}

            {!encerrado && (
              <form
                className="m-bolao__form"
                onSubmit={(e) => {
                  e.preventDefault();
                  executar(() => atualizarBolaoAction(bolao.id, { qtdCotas: Number(novoTotal) }));
                }}
              >
                <label className="m-campo m-bolao__cotas" htmlFor={`${id}-total`}>
                  <span className="m-campo__rotulo">Total de cotas do bolão</span>
                  <input
                    id={`${id}-total`}
                    className="m-campo__entrada"
                    type="number"
                    min={1}
                    value={novoTotal}
                    onChange={(e) => setNovoTotal(e.target.value)}
                  />
                </label>
                <button type="submit" className="m-botao m-botao--secundario" disabled={pending}>
                  Atualizar total
                </button>
              </form>
            )}

            {!ehPro ? (
              <div className="m-bloqueado m-bolao__pro">
                <p className="m-bloqueado__selo">
                  <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden focusable="false">
                    <path d="M12 2 22 12 12 22 2 12z" fill="currentColor" />
                  </svg>
                  Bolão Pro
                </p>
                <p className="m-bloqueado__texto">
                  Mais de {limiteCotas} cotas? O Bolão Pro libera até {LIMITE_COTAS_PRO} cotas, aviso do resultado
                  por e-mail aos participantes e página pública sem anúncios, por {BOLAO_PRO_PIX.periodDays} dias —{" "}
                  {moeda(Math.round(BOLAO_PRO_PIX.amount * 100))} por Pix, só para este bolão.
                  {!premium && (
                    <>
                      {" "}
                      Ou assine o <Link href="/assinar?perfil=organizador">Premium</Link> e use em todos os bolões.
                    </>
                  )}
                </p>
                {!encerrado && (
                  <PixCheckoutButton userId={userId} bolaoId={bolao.id} rotulo="Liberar Bolão Pro com Pix" />
                )}
              </div>
            ) : (
              <p className="m-estado" data-tipo="ok">
                <strong>Bolão Pro ativo</strong>
                {premium
                  ? " (incluso no seu Premium)"
                  : proAte
                    ? ` até ${new Date(proAte).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`
                    : ""}
                : até {LIMITE_COTAS_PRO} cotas, aviso por e-mail aos participantes que pediram e página pública sem
                anúncios.
              </p>
            )}
          </div>
        </section>

        <section className="m-secao" aria-labelledby={`${id}-comprovante`}>
          <div className="m-secao__intro">
            <h2 id={`${id}-comprovante`} className="m-secao__titulo">
              Comprovante
            </h2>
            <p className="m-secao__texto">A foto do bilhete registrado, para o grupo conferir.</p>
          </div>
          <div className="m-secao__corpo">
            <BilheteUpload
              bolaoId={bolao.id}
              totalJogos={jogos.length}
              jogosVerificados={comprovante.jogosVerificados}
              fotos={comprovante.fotos.map((f) => ({
                id: f.id,
                url: f.url,
                jogosEncontrados: f.jogosEncontrados.length,
              }))}
              ehPro={ehPro}
              limiteFotos={LIMITE_FOTOS_POR_BOLAO}
            />
          </div>
        </section>

        <section className="m-secao" aria-labelledby={`${id}-jogos`}>
          <div className="m-secao__intro">
            <h2 id={`${id}-jogos`} className="m-secao__titulo">
              Jogos ({jogos.length})
            </h2>
            {jogos.length > PREVIEW_JOGOS && (
              <p className="m-secao__texto">
                Mostrando {PREVIEW_JOGOS} de {jogos.length}. A lista completa fica na página pública.
              </p>
            )}
          </div>
          <div className="m-secao__corpo">
            <ol className="m-lista m-bolao__jogos">
              {jogos.slice(0, PREVIEW_JOGOS).map((j, i) => (
                <li key={i} className="m-bolao__jogo">
                  <span className="m-bolao__numero">#{i + 1}</span>
                  <Dezenas dezenas={j} tamanho="pequena" />
                </li>
              ))}
            </ol>
          </div>
        </section>

        {!encerrado && (
          <section className="m-secao m-secao--perigo" aria-labelledby={`${id}-gestao`}>
            <div className="m-secao__intro">
              <h2 id={`${id}-gestao`} className="m-secao__titulo">
                Gestão do bolão
              </h2>
              <p className="m-secao__texto">Fechar impede novas cotas; excluir apaga o bolão e os participantes.</p>
            </div>
            <div className="m-secao__corpo m-secao__corpo--acoes">
              <button
                type="button"
                className="m-botao m-botao--secundario"
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
                className="m-link-botao m-link-botao--perigo"
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
    </div>
  );
}
