"use client";

import { useState } from "react";
import "./compartilhar-bolao.css";
import { enviarBeacon, obterOuCriarAnonymousId } from "@/lib/telemetria-cliente";
import { urlWhatsapp } from "@/lib/bolao-compartilhar";

interface Props {
  loteria: string;
  mensagem: string;
  url: string;
  rotulo?: string;
}

// "Enviar para o grupo": abre o WhatsApp com a mensagem pronta (e o link do
// bolão, que gera o card de pré-visualização) ou copia o link. Emite
// bolao_shared — o loop de aquisição do bolão passa por aqui.
export default function CompartilharBolao({ loteria, mensagem, url, rotulo = "Enviar para o grupo" }: Props) {
  const [copiado, setCopiado] = useState(false);

  function registrar(canal: "whatsapp" | "copiar") {
    enviarBeacon({
      eventName: "bolao_shared",
      tool: "bolao",
      lottery: loteria,
      anonymousId: obterOuCriarAnonymousId(),
      metadata: { canal, origem: "pagina_publica" },
    });
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      registrar("copiar");
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // clipboard indisponível: o link continua no endereço da página.
    }
  }

  return (
    <div className="bolao-compartilhar">
      <a
        className="botao-gerar"
        href={urlWhatsapp(mensagem)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => registrar("whatsapp")}
      >
        {rotulo} (WhatsApp)
      </a>
      <button type="button" className="botao-copiar" onClick={copiar}>
        {copiado ? "Link copiado!" : "Copiar link"}
      </button>
    </div>
  );
}
