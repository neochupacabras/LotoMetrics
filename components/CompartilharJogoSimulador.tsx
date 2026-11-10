"use client";

import { useState } from "react";
import { jogoParaUrl } from "@/lib/card-simulador";

// Botão "Compartilhar no WhatsApp" do simulador (semana 4, entrega b).
// No celular, manda a IMAGEM do card pela folha de compartilhamento do
// sistema (o WhatsApp aparece na lista). Onde o navegador não compartilha
// arquivo (desktop, navegador antigo), abre o WhatsApp com texto + link; a
// prévia desse link é o próprio card (og:image da página com ?jogo=).
//
// O card mostra a simulação dos últimos 100 concursos, refeita no servidor.

export type CanalCompartilhamento = "nativo" | "whatsapp_link" | "download";

interface Props {
  codigoLoteria: string;
  emLoteria: string; // "na Mega-Sena"
  dezenas: number[];
  trevos: number[];
  superSete: boolean;
  onCompartilhar: (canal: CanalCompartilhamento) => void;
}

export default function CompartilharJogoSimulador({
  codigoLoteria, emLoteria, dezenas, trevos, superSete, onCompartilhar,
}: Props) {
  const [estado, setEstado] = useState<"idle" | "preparando" | "erro">("idle");

  const jogo = jogoParaUrl(dezenas, superSete);
  const trevosParam = trevos.length ? `&t=${[...trevos].sort((a, b) => a - b).join("-")}` : "";
  const cardUrl = `/api/simulador/card?l=${codigoLoteria}&j=${jogo}${trevosParam}`;

  // A mensagem não repete valores: o card usa sempre os últimos 100
  // concursos, e quem é Premium pode ter simulado o histórico inteiro.
  const mensagem = `Simulei meu jogo ${emLoteria} nos últimos 100 concursos. Veja quanto ele teria ganho e confira o seu:`;

  async function compartilhar() {
    const link = `${window.location.origin}/${codigoLoteria}/simulador?jogo=${jogo}${trevosParam}`;
    setEstado("preparando");
    try {
      const blob = await fetch(cardUrl).then((r) => {
        if (!r.ok) throw new Error(`card ${r.status}`);
        return r.blob();
      });
      const arquivo = new File([blob], "meu-jogo-lotoanalitica.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [arquivo] })) {
        try {
          await navigator.share({ files: [arquivo], text: `${mensagem} ${link}` });
          onCompartilhar("nativo");
        } catch (err) {
          // Cancelar a folha de compartilhamento não é erro.
          if ((err as Error).name !== "AbortError") throw err;
        }
        setEstado("idle");
        return;
      }
    } catch {
      // Sem a imagem, ainda dá para mandar o link (a prévia mostra o card).
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${mensagem} ${link}`)}`, "_blank", "noopener");
    onCompartilhar("whatsapp_link");
    setEstado("idle");
  }

  return (
    <div className="compartilhar-jogo">
      <div className="compartilhar-jogo__texto">
        <p className="compartilhar-jogo__titulo">Mande esse resultado para alguém</p>
        <p className="compartilhar-jogo__nota">
          Uma imagem com seu jogo e o que ele teria ganho nos últimos 100 concursos.
        </p>
      </div>
      <div className="compartilhar-jogo__acoes">
        <button
          type="button"
          className="botao-gerar compartilhar-jogo__botao"
          onClick={compartilhar}
          disabled={estado === "preparando"}
        >
          {estado === "preparando" ? (<><span className="spinner-inline" aria-hidden /> Preparando…</>) : "Compartilhar no WhatsApp"}
        </button>
        <a
          href={cardUrl}
          download="meu-jogo-lotoanalitica.png"
          className="compartilhar-jogo__baixar"
          onClick={() => onCompartilhar("download")}
        >
          Baixar imagem
        </a>
      </div>
    </div>
  );
}
