"use client";

import { usePwa } from "@/components/pwa/PwaProvider";
import BotaoInstalar, { InstrucoesInstalacao } from "@/components/pwa/BotaoInstalar";

// Estado da instalação na página /aplicativo: já instalado, instalável com
// um toque (beforeinstallprompt) ou instruções manuais da plataforma.
export default function AplicativoStatus() {
  const { pronto, instalado, standalone, podeInstalarNativo, plataforma } = usePwa();

  if (!pronto) return <div className="notif-cartao notif-cartao--carregando" aria-busy="true" aria-label="Carregando" />;

  if (instalado) {
    return (
      <div className="notif-cartao">
        <h2 className="notif-cartao__titulo">
          <span className="notif-status" aria-hidden /> {standalone ? "Você está usando o app" : "App instalado neste aparelho"}
        </h2>
        <p className="bloco__nota">
          {standalone
            ? "Tudo certo — o LotoAnalítica está aberto como aplicativo."
            : "Abra pelo ícone LotoAnalítica na sua tela inicial ou lista de apps."}
        </p>
      </div>
    );
  }

  return (
    <div className="notif-cartao">
      <h2 className="notif-cartao__titulo">Instalar agora</h2>
      {podeInstalarNativo ? (
        <p className="bloco__nota">Um toque e pronto: o navegador confirma e cria o ícone.</p>
      ) : (
        <InstrucoesInstalacao plataforma={plataforma} />
      )}
      {podeInstalarNativo && <BotaoInstalar />}
    </div>
  );
}
