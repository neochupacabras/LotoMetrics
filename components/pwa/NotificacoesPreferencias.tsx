"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePwa } from "@/components/pwa/PwaProvider";
import { usePlanoUsuario } from "@/components/auth/PlanoUsuarioProvider";
import BotaoInstalar from "@/components/pwa/BotaoInstalar";
import { CATEGORIAS_PUSH } from "@/lib/push/categorias";
import { LOTERIAS } from "@/lib/format";
import {
  ativarPush,
  chavePublicaVapid,
  consultarPreferencias,
  type EstadoServidor,
  desativarPush,
  enviarTeste,
  inscricaoAtual,
  lembrarDonoDaInscricao,
  pushExigeInstalacao,
  salvarPreferencias,
  suportaPush,
} from "@/lib/pwa/cliente";

// Tela de preferências de notificação push. Nunca pede permissão sozinha:
// explica o que o usuário vai receber e só chama
// Notification.requestPermission() no clique em "Ativar".

type Fase =
  | "carregando"
  | "sem-suporte"
  | "instalar-ios"
  | "nao-configurado"
  | "bloqueado"
  | "desativado"
  | "ativado";

type Mensagem = { tipo: "ok" | "erro"; texto: string } | null;

const TODAS = Object.values(LOTERIAS);

type Avaliacao = { fase: Fase; estado?: EstadoServidor };

// Descobre a situação atual (suporte, permissão, inscrição salva).
async function avaliar(): Promise<Avaliacao> {
  if (!suportaPush()) return { fase: pushExigeInstalacao() ? "instalar-ios" : "sem-suporte" };
  if (!chavePublicaVapid()) return { fase: "nao-configurado" };
  if (Notification.permission === "denied") return { fase: "bloqueado" };
  const sub = await inscricaoAtual();
  if (!sub || Notification.permission !== "granted") return { fase: "desativado" };
  try {
    const estado = await consultarPreferencias(sub.endpoint);
    return estado.existe ? { fase: "ativado", estado } : { fase: "desativado" };
  } catch {
    return { fase: "desativado" };
  }
}

export default function NotificacoesPreferencias() {
  const { pronto, swAtivo } = usePwa();
  const { logado, userId } = usePlanoUsuario();
  const [fase, setFase] = useState<Fase>("carregando");
  // Padrão inclui as pessoais; sem login elas aparecem desabilitadas e
  // ficam de fora do que é enviado (categoriasValidas).
  const [categorias, setCategorias] = useState<string[]>(
    CATEGORIAS_PUSH.filter((c) => c.padrao).map((c) => c.id)
  );
  const [loterias, setLoterias] = useState<string[]>([]); // vazio = todas
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState<Mensagem>(null);
  const [outraConta, setOutraConta] = useState(false);

  const aplicar = useCallback((r: Avaliacao) => {
    if (r.estado) {
      setCategorias(r.estado.categorias);
      setLoterias(r.estado.loterias);
      setOutraConta(r.estado.vinculadaAOutraConta);
    }
    setFase(r.fase);
  }, []);

  const reavaliar = useCallback(() => {
    avaliar().then(aplicar);
  }, [aplicar]);

  useEffect(() => {
    if (!pronto) return;
    let ativo = true;
    avaliar().then((r) => {
      if (ativo) aplicar(r);
    });
    return () => {
      ativo = false;
    };
  }, [pronto, swAtivo, aplicar]);

  function alternarCategoria(id: string) {
    setCategorias((atual) => (atual.includes(id) ? atual.filter((c) => c !== id) : [...atual, id]));
  }

  function alternarLoteria(slug: string) {
    setLoterias((atual) => (atual.includes(slug) ? atual.filter((l) => l !== slug) : [...atual, slug]));
  }

  const categoriasValidas = categorias.filter((c) => logado || !CATEGORIAS_PUSH.find((d) => d.id === c)?.requerLogin);

  async function executar(acao: () => Promise<void>) {
    setOcupado(true);
    setMensagem(null);
    try {
      await acao();
    } catch (err) {
      setMensagem({ tipo: "erro", texto: (err as Error).message || "Não foi possível concluir." });
      if (typeof Notification !== "undefined" && Notification.permission === "denied") setFase("bloqueado");
    } finally {
      setOcupado(false);
    }
  }

  const ativar = () =>
    executar(async () => {
      if (categoriasValidas.length === 0) throw new Error("Escolha ao menos um tipo de notificação.");
      await ativarPush({ categorias: categoriasValidas, loterias });
      lembrarDonoDaInscricao(logado ? userId : null);
      setOutraConta(false);
      setFase("ativado");
      setMensagem({ tipo: "ok", texto: "Notificações ativadas neste aparelho." });
    });

  const salvar = () =>
    executar(async () => {
      if (categoriasValidas.length === 0) throw new Error("Escolha ao menos um tipo — ou desative as notificações.");
      const sub = await inscricaoAtual();
      if (!sub) return setFase("desativado");
      await salvarPreferencias(sub, { categorias: categoriasValidas, loterias });
      lembrarDonoDaInscricao(logado ? userId : null);
      setOutraConta(false);
      setMensagem({ tipo: "ok", texto: "Preferências salvas." });
    });

  const desativar = () =>
    executar(async () => {
      await desativarPush();
      lembrarDonoDaInscricao(null);
      setFase("desativado");
      setMensagem({ tipo: "ok", texto: "Notificações desativadas neste aparelho." });
    });

  const testar = () =>
    executar(async () => {
      const sub = await inscricaoAtual();
      if (!sub) return setFase("desativado");
      await enviarTeste(sub.endpoint);
      setMensagem({ tipo: "ok", texto: "Enviada! Ela deve aparecer em alguns segundos." });
    });

  if (fase === "carregando") {
    return <div className="notif-cartao notif-cartao--carregando" aria-busy="true" aria-label="Carregando" />;
  }

  if (fase === "instalar-ios") {
    return (
      <div className="notif-cartao">
        <h2 className="notif-cartao__titulo">Instale o app para receber notificações</h2>
        <p className="bloco__nota">
          No iPhone e no iPad, a Apple só libera notificações para sites adicionados à Tela de
          Início (iOS/iPadOS 16.4 ou mais recente). Instale o LotoAnalítica e abra por ele para
          ativar.
        </p>
        <BotaoInstalar />
      </div>
    );
  }

  if (fase === "sem-suporte") {
    return (
      <div className="notif-cartao">
        <h2 className="notif-cartao__titulo">Seu navegador não suporta notificações</h2>
        <p className="bloco__nota">
          Use o Chrome, Edge, Firefox ou Samsung Internet no Android ou no computador, ou o
          Safari (iOS 16.4+, com o app instalado na Tela de Início). Navegação anônima também
          costuma bloquear notificações.
        </p>
      </div>
    );
  }

  if (fase === "nao-configurado") {
    return (
      <div className="notif-cartao">
        <h2 className="notif-cartao__titulo">Em breve</h2>
        <p className="bloco__nota">As notificações ainda não foram liberadas neste site.</p>
      </div>
    );
  }

  if (fase === "bloqueado") {
    return (
      <div className="notif-cartao">
        <h2 className="notif-cartao__titulo">Notificações bloqueadas</h2>
        <p className="bloco__nota">
          Você bloqueou as notificações deste site. Para liberar: toque no cadeado ao lado do
          endereço → <strong>Permissões</strong> → <strong>Notificações</strong> → Permitir (no app
          instalado do Android: segure o ícone → Informações do app → Notificações). Depois volte
          aqui.
        </p>
        <button type="button" className="botao-secundario" onClick={reavaliar}>
          Já liberei
        </button>
      </div>
    );
  }

  return (
    <div className="notif-cartao">
      {fase === "desativado" ? (
        <>
          <h2 className="notif-cartao__titulo">Receba o resultado assim que sair</h2>
          <ul className="notif-beneficios">
            <li>As dezenas sorteadas no seu celular, sem precisar abrir o site.</li>
            <li>Aviso quando o prêmio acumula, com a estimativa do próximo concurso.</li>
            <li>Com conta Premium: quantos pontos os seus jogos salvos fizeram.</li>
          </ul>
          <p className="bloco__nota">
            Sem propaganda e sem spam: só os avisos que você escolher abaixo. Dá para desligar a
            qualquer momento.
          </p>
        </>
      ) : (
        <>
          <h2 className="notif-cartao__titulo">
            <span className="notif-status" aria-hidden /> Notificações ativas neste aparelho
          </h2>
          {outraConta && (
            <p className="notif-aviso">
              Esta inscrição estava ligada a outra conta. Salve as preferências para passar a
              receber os avisos da sua conta.
            </p>
          )}
        </>
      )}

      <fieldset className="notif-grupo">
        <legend className="notif-grupo__titulo">O que você quer receber</legend>
        {CATEGORIAS_PUSH.map((c) => {
          const bloqueada = c.requerLogin && !logado;
          return (
            <label key={c.id} className="notif-opcao" data-desabilitada={bloqueada}>
              <input
                type="checkbox"
                className="notif-opcao__check"
                checked={categorias.includes(c.id) && !bloqueada}
                disabled={bloqueada || ocupado}
                onChange={() => alternarCategoria(c.id)}
              />
              <span className="notif-opcao__texto">
                <strong>{c.titulo}</strong>
                <span>
                  {c.descricao}
                  {bloqueada && (
                    <>
                      {" "}<Link href="/entrar?next=/notificacoes">Entre na sua conta</Link> para ativar.
                    </>
                  )}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <fieldset className="notif-grupo">
        <legend className="notif-grupo__titulo">De quais loterias</legend>
        <div className="notif-loterias">
          <button
            type="button"
            className="notif-chip"
            aria-pressed={loterias.length === 0}
            onClick={() => setLoterias([])}
            disabled={ocupado}
          >
            Todas
          </button>
          {TODAS.map((l) => (
            <button
              key={l.slug}
              type="button"
              className="notif-chip"
              aria-pressed={loterias.includes(l.slug)}
              onClick={() => alternarLoteria(l.slug)}
              disabled={ocupado}
            >
              {l.nome}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="notif-acoes">
        {fase === "desativado" ? (
          <button type="button" className="botao-gerar" onClick={ativar} disabled={ocupado}>
            {ocupado && <span className="spinner-inline" aria-hidden />}
            Ativar notificações
          </button>
        ) : (
          <>
            <button type="button" className="botao-gerar" onClick={salvar} disabled={ocupado}>
              {ocupado && <span className="spinner-inline" aria-hidden />}
              Salvar preferências
            </button>
            <button type="button" className="botao-secundario" onClick={testar} disabled={ocupado}>
              Enviar teste
            </button>
            <button type="button" className="notif-desativar" onClick={desativar} disabled={ocupado}>
              Desativar neste aparelho
            </button>
          </>
        )}
      </div>

      {mensagem && (
        <p className={`notif-mensagem notif-mensagem--${mensagem.tipo}`} role={mensagem.tipo === "erro" ? "alert" : "status"}>
          {mensagem.texto}
        </p>
      )}
    </div>
  );
}
