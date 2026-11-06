"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { usePwa } from "@/components/pwa/PwaProvider";
import BotaoInstalar from "@/components/pwa/BotaoInstalar";
import { ehSafariIOS } from "@/lib/pwa/cliente";
import { IconeFechar } from "@/components/pwa/Icones";
import { gravarLocal, lerLocal, useLocal } from "@/lib/pwa/armazenamento";

// Convite discreto de instalação (faixa acima da barra inferior, só no
// celular). Regras para não ser invasivo:
//  - só depois de algum engajamento (3ª página vista, somando visitas);
//  - só onde a instalação é possível (beforeinstallprompt disponível ou
//    Safari do iPhone/iPad);
//  - nunca no app instalado, nunca em fluxos de login/checkout/admin;
//  - fechou = some por 30 dias. Um único convite, nunca empilhado.

const CHAVE_VISTAS = "la:pwa-paginas";
const CHAVE_DISPENSADO = "la:pwa-convite-fechado";
const MIN_PAGINAS = 3;
const DIAS_SILENCIO = 30;
const ROTAS_SEM_CONVITE = ["/entrar", "/cadastrar", "/esqueci-senha", "/assinar", "/admin", "/auth", "/offline"];

export default function ConviteInstalacao() {
  const pathname = usePathname() ?? "/";
  const { pronto, instalado, podeInstalarNativo, plataforma } = usePwa();
  const vistas = Number(useLocal(CHAVE_VISTAS) || "0");
  const fechadoEm = Number(useLocal(CHAVE_DISPENSADO) || "0");
  // Momento da montagem (fixo durante a vida do componente) para a janela de 30 dias.
  const [agora] = useState(() => Date.now());

  // Conta páginas vistas (somando visitas) a cada navegação.
  useEffect(() => {
    gravarLocal(CHAVE_VISTAS, String(Math.min(Number(lerLocal(CHAVE_VISTAS) || "0") + 1, 999)));
  }, [pathname]);

  const silenciado = fechadoEm > 0 && agora - fechadoEm < DIAS_SILENCIO * 86_400_000;
  const instalavel = podeInstalarNativo || (pronto && plataforma === "ios" && ehSafariIOS());
  const rotaOk = !ROTAS_SEM_CONVITE.some((r) => pathname.startsWith(r));
  const visivel = pronto && !instalado && !silenciado && instalavel && rotaOk && vistas >= MIN_PAGINAS;

  if (!visivel) return null;

  function fechar() {
    gravarLocal(CHAVE_DISPENSADO, String(Date.now()));
  }

  return (
    <aside className="convite-instalacao" aria-label="Instalar aplicativo">
      <div className="convite-instalacao__texto">
        <strong>LotoAnalítica no seu celular</strong>
        <span>Resultados em um toque, em tela cheia.</span>
      </div>
      <BotaoInstalar variante="link" aoInstalar={fechar} />
      <button type="button" className="convite-instalacao__fechar" onClick={fechar} aria-label="Agora não">
        <IconeFechar />
      </button>
    </aside>
  );
}
