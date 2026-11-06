"use client";

import { useEffect, useState } from "react";
import { usePwa } from "@/components/pwa/PwaProvider";
import { IconeOffline } from "@/components/pwa/Icones";

// Avisos de estado do app (aparecem no celular e no desktop, pois são
// informativos e discretos): sem conexão / conexão de volta, e versão
// nova disponível. Região aria-live para leitores de tela.
export default function AvisosApp() {
  const { pronto, online, atualizacaoDisponivel, atualizar } = usePwa();
  const [voltou, setVoltou] = useState(false);

  // "Conexão restabelecida" por 3s depois de um evento online.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const aoVoltar = () => {
      setVoltou(true);
      clearTimeout(t);
      t = setTimeout(() => setVoltou(false), 3000);
    };
    const aoCair = () => {
      clearTimeout(t);
      setVoltou(false);
    };
    window.addEventListener("online", aoVoltar);
    window.addEventListener("offline", aoCair);
    return () => {
      clearTimeout(t);
      window.removeEventListener("online", aoVoltar);
      window.removeEventListener("offline", aoCair);
    };
  }, []);

  return (
    <div className="avisos-app" role="status" aria-live="polite">
      {pronto && !online && (
        <div className="aviso-app aviso-app--offline">
          <IconeOffline className="aviso-app__icone" />
          <span>Você está offline. Mostrando o que foi salvo neste aparelho.</span>
        </div>
      )}
      {voltou && (
        <div className="aviso-app aviso-app--ok">
          <span>Conexão restabelecida.</span>
        </div>
      )}
      {atualizacaoDisponivel && online && (
        <div className="aviso-app">
          <span>Nova versão disponível.</span>
          <button type="button" className="aviso-app__acao" onClick={atualizar}>
            Atualizar
          </button>
        </div>
      )}
    </div>
  );
}
