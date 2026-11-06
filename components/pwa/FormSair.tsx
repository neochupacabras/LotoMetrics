"use client";

import { limparDadosDoUsuario } from "@/lib/pwa/cliente";

// Formulário de logout que, antes da Server Action signOut, desvincula as
// notificações pessoais deste aparelho e apaga as páginas guardadas
// offline (fetch com keepalive: sobrevive ao redirecionamento).
export default function FormSair({ action, className }: { action: () => Promise<void>; className?: string }) {
  return (
    <form action={action} onSubmit={() => { void limparDadosDoUsuario(); }}>
      <button type="submit" className={className}>Sair</button>
    </form>
  );
}
