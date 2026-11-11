"use client";

import Link from "next/link";
import { usePlanoUsuario } from "@/components/auth/PlanoUsuarioProvider";
import { IconePerfil, IconeSino } from "@/components/pwa/Icones";
import ChipAreaMembro from "@/components/auth/ChipAreaMembro";

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
      {logado ? (
        // Logado: o mesmo chip do desktop, compacto ("Área" / "Conta").
        <ChipAreaMembro isPremium={isPremium} compacto />
      ) : (
        <Link
          href="/entrar"
          className="masthead-mobile__botao masthead-mobile__perfil"
          aria-label={carregando ? "Conta" : "Entrar"}
          data-logado={false}
        >
          <IconePerfil />
        </Link>
      )}
    </div>
  );
}
