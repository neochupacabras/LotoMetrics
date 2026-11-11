"use client";

import Link from "next/link";
import { usePlanoUsuario } from "@/components/auth/PlanoUsuarioProvider";
import ChipAreaMembro from "@/components/auth/ChipAreaMembro";

export default function UserMenu() {
  const { carregando, logado, isPremium } = usePlanoUsuario();

  if (carregando) {
    return <div className="usermenu--carregando" aria-hidden="true" />;
  }

  if (!logado) {
    return (
      <div className="usermenu">
        <Link href="/entrar" className="usermenu-entrar">
          Entrar
        </Link>
        <Link href="/cadastrar" className="usermenu-cadastrar botao-gerar">
          Criar conta
        </Link>
      </div>
    );
  }

  return (
    <div className="usermenu">
      {!isPremium && (
        <Link href="/assinar" className="usermenu-upgrade">
          ✦ Premium
        </Link>
      )}
      <ChipAreaMembro isPremium={isPremium} />
    </div>
  );
}
