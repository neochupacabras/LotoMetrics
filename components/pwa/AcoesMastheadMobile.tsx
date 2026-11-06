"use client";

import Link from "next/link";
import { usePlanoUsuario } from "@/components/auth/PlanoUsuarioProvider";
import { IconePerfil, IconeSino } from "@/components/pwa/Icones";

// Ações compactas do cabeçalho no celular (substituem visualmente o
// UserMenu, que fica escondido abaixo de 640px — ver app/pwa.css):
// notificações e perfil, cada um com área de toque de 44px.
export default function AcoesMastheadMobile() {
  const { carregando, logado, isPremium } = usePlanoUsuario();

  return (
    <div className="masthead-mobile__acoes">
      <Link href="/notificacoes" className="masthead-mobile__botao" aria-label="Notificações">
        <IconeSino />
      </Link>
      <Link
        href={logado ? "/conta" : "/entrar"}
        className="masthead-mobile__botao masthead-mobile__perfil"
        aria-label={carregando ? "Conta" : logado ? "Minha conta" : "Entrar"}
        data-logado={logado}
      >
        <IconePerfil />
        {isPremium && <span className="masthead-mobile__selo" aria-label="Premium">✦</span>}
      </Link>
    </div>
  );
}
