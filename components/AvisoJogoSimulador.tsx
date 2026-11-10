"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { chavePublicaVapid, obterInscricaoPush, pushExigeInstalacao, registroSW, suportaPush } from "@/lib/pwa/cliente";

// CTA único depois do resultado do simulador (semana 4, entrega c):
// "Quer saber se esse jogo ganha no próximo sorteio? Receba um aviso".
// Inscrição sem conta e sem senha, por push (quando o aparelho permite) ou
// por e-mail com confirmação. Grava em /api/alertas/jogo (tabela
// alertas_jogo); o aviso vale para todo sorteio até a pessoa se descadastrar.

export type CanalAviso = "push" | "email";

interface Props {
  codigoLoteria: string;
  emLoteria: string; // "na Mega-Sena"
  dezenas: number[];
  trevos: number[];
  onInscrito: (canal: CanalAviso) => void;
}

type Estado =
  | { tipo: "idle" }
  | { tipo: "enviando"; canal: CanalAviso }
  | { tipo: "ok"; canal: CanalAviso; email?: string }
  | { tipo: "erro"; mensagem: string };

async function inscrever(corpo: Record<string, unknown>): Promise<void> {
  const resp = await fetch("/api/alertas/jogo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
    credentials: "same-origin",
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(json.erro || "Não deu certo agora. Tente de novo em alguns minutos.");
}

export default function AvisoJogoSimulador({ codigoLoteria, emLoteria, dezenas, trevos, onInscrito }: Props) {
  // Push só aparece onde funciona: navegador com Push API, service worker
  // registrado e, no iPhone, app instalado na Tela de Início.
  const [push, setPush] = useState<"verificando" | "disponivel" | "instalar" | "indisponivel">("verificando");
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<Estado>({ tipo: "idle" });

  useEffect(() => {
    let ativo = true;
    (async () => {
      if (!suportaPush() || !chavePublicaVapid()) return setPush(pushExigeInstalacao() ? "instalar" : "indisponivel");
      if (pushExigeInstalacao()) return setPush("instalar");
      if (Notification.permission === "denied") return setPush("indisponivel");
      const reg = await registroSW().catch(() => null);
      if (ativo) setPush(reg ? "disponivel" : "indisponivel");
    })();
    return () => { ativo = false; };
  }, []);

  const jogo = { loteria: codigoLoteria, dezenas, ...(trevos.length ? { trevos } : {}) };

  async function avisarNoAparelho() {
    setEstado({ tipo: "enviando", canal: "push" });
    try {
      const sub = await obterInscricaoPush();
      await inscrever({ ...jogo, canal: "push", inscricao: sub.toJSON() });
      setEstado({ tipo: "ok", canal: "push" });
      onInscrito("push");
    } catch (err) {
      setEstado({ tipo: "erro", mensagem: (err as Error).message });
    }
  }

  async function avisarPorEmail(e: React.FormEvent) {
    e.preventDefault();
    const endereco = email.trim();
    if (!endereco) return;
    setEstado({ tipo: "enviando", canal: "email" });
    try {
      await inscrever({ ...jogo, canal: "email", email: endereco });
      setEstado({ tipo: "ok", canal: "email", email: endereco });
      onInscrito("email");
    } catch (err) {
      setEstado({ tipo: "erro", mensagem: (err as Error).message });
    }
  }

  if (estado.tipo === "ok") {
    return (
      <section className="aviso-jogo" aria-live="polite">
        <p className="aviso-jogo__titulo">
          {estado.canal === "push" ? "Pronto, aviso ativado neste aparelho." : "Falta só confirmar."}
        </p>
        <p className="aviso-jogo__nota">
          {estado.canal === "push"
            ? `A cada sorteio ${emLoteria}, você recebe aqui a conferência deste jogo. Para parar, toque em "Parar este aviso" na própria notificação.`
            : `Mandamos um link para ${estado.email}. Confirme por lá para começar a receber, a cada sorteio ${emLoteria}, a conferência deste jogo.`}
        </p>
      </section>
    );
  }

  const enviando = estado.tipo === "enviando";
  return (
    <section className="aviso-jogo" aria-labelledby="aviso-jogo-titulo">
      <h2 id="aviso-jogo-titulo" className="aviso-jogo__titulo">
        Quer saber se esse jogo ganha no próximo sorteio? Receba um aviso
      </h2>
      <p className="aviso-jogo__nota">
        A cada sorteio {emLoteria}, a conferência deste jogo. Sem cadastro e sem senha; para parar, um clique.
      </p>

      {push === "disponivel" && (
        <button type="button" className="botao-gerar aviso-jogo__botao" onClick={avisarNoAparelho} disabled={enviando}>
          {estado.tipo === "enviando" && estado.canal === "push"
            ? (<><span className="spinner-inline" aria-hidden /> Ativando…</>)
            : "Avisar neste aparelho"}
        </button>
      )}

      <form className="aviso-jogo__email" onSubmit={avisarPorEmail}>
        <label htmlFor="aviso-jogo-email" className="aviso-jogo__rotulo">
          {push === "disponivel" ? "Ou por e-mail" : "Seu e-mail"}
        </label>
        <div className="aviso-jogo__linha">
          <input
            id="aviso-jogo-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className="aviso-jogo__input"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={200}
            required
          />
          <button
            type="submit"
            className={`botao-gerar aviso-jogo__botao-email${push === "disponivel" ? " aviso-jogo__botao-email--secundario" : ""}`}
            disabled={enviando}
          >
            {estado.tipo === "enviando" && estado.canal === "email"
              ? (<><span className="spinner-inline" aria-hidden /> Enviando…</>)
              : "Avisar por e-mail"}
          </button>
        </div>
      </form>

      {push === "instalar" && (
        <p className="aviso-jogo__dica">
          No iPhone, o aviso no próprio aparelho só funciona com o app instalado.{" "}
          <Link href="/aplicativo">Veja como instalar</Link>.
        </p>
      )}
      {estado.tipo === "erro" && <p className="simulador-erro" role="alert">{estado.mensagem}</p>}
      <p className="aviso-jogo__legal">
        Usamos o e-mail só para este aviso. <Link href="/privacidade">Privacidade</Link>.
      </p>
    </section>
  );
}
