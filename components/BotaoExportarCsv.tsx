"use client";

import Link from "next/link";
import { usePlanoUsuario } from "@/components/auth/PlanoUsuarioProvider";

interface Props {
  codigoLoteria: string;
}

// Client Component — checa o plano no navegador (mesmo padrão de
// components/Anuncio.tsx). A página de resultados lia o plano no
// servidor só pra decidir qual desses dois links mostrar; extraído daqui
// pra tirar o único motivo que forçava app/[loteria]/resultados/page.tsx
// a renderizar dinamicamente (tarefa 2.4 do plano de implementação).
//
// Sem risco de segurança em mostrar "Baixar CSV" antes de confirmar o
// plano: app/api/[loteria]/exportar/route.ts já faz sua própria checagem
// de premium no servidor — este botão só decide qual CTA exibir.
// Enquanto carrega (ou se não for premium), mostra o link de assinatura;
// nunca mostra "Baixar" pra quem não é premium.
export default function BotaoExportarCsv({ codigoLoteria }: Props) {
  const { carregando, isPremium } = usePlanoUsuario();

  if (!carregando && isPremium) {
    return (
      <a href={`/api/${codigoLoteria}/exportar`} className="botao-copiar" style={{ fontSize: "0.85rem" }}>
        ↓ Baixar histórico completo (CSV)
      </a>
    );
  }

  return (
    <Link href="/assinar" className="botao-copiar" style={{ fontSize: "0.85rem" }}>
      ↓ Baixar histórico (CSV) <span className="modo-toggle__lock">✦ Premium</span>
    </Link>
  );
}
