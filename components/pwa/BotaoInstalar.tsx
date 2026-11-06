"use client";

import { useRef, useState } from "react";
import { usePwa } from "@/components/pwa/PwaProvider";
import { ehSafariIOS } from "@/lib/pwa/cliente";
import {
  IconeAdicionarIOS,
  IconeCompartilharIOS,
  IconeInstalar,
  IconeMais,
  IconeMenuVertical,
  IconeVerMais,
} from "@/components/pwa/Icones";

// "Instalar aplicativo": um único componente para todas as plataformas.
//  - Chrome/Edge/Samsung (Android e desktop): dispara o diálogo nativo
//    guardado do beforeinstallprompt.
//  - Safari no iPhone/iPad: não existe API de instalação — abre instruções
//    ilustradas de "Compartilhar → Adicionar à Tela de Início".
//  - Outros (Firefox Android, Chrome no iOS, navegador sem suporte):
//    instruções do menu do navegador.
// Some quando o app já está instalado/aberto pelo ícone.

type Variante = "cartao" | "botao" | "link";

export default function BotaoInstalar({ variante = "botao", aoInstalar }: { variante?: Variante; aoInstalar?: () => void }) {
  const { pronto, instalado, podeInstalarNativo, plataforma, instalar } = usePwa();
  const dialogo = useRef<HTMLDialogElement>(null);
  const [aguardando, setAguardando] = useState(false);

  if (!pronto || instalado) return null;

  async function aoClicar() {
    if (podeInstalarNativo) {
      setAguardando(true);
      const r = await instalar();
      setAguardando(false);
      if (r === "aceito") aoInstalar?.();
      if (r !== "indisponivel") return;
    }
    dialogo.current?.showModal();
  }

  const rotulo = aguardando ? "Abrindo…" : "Instalar aplicativo";

  return (
    <>
      {variante === "cartao" ? (
        <button type="button" className="instalar-cartao" onClick={aoClicar} disabled={aguardando}>
          <span className="instalar-cartao__icone" aria-hidden>
            <IconeInstalar />
          </span>
          <span className="instalar-cartao__texto">
            <strong>{rotulo}</strong>
            <span>Abra direto da tela inicial, em tela cheia e com resultados mesmo offline.</span>
          </span>
        </button>
      ) : (
        <button
          type="button"
          className={variante === "link" ? "instalar-link" : "botao-gerar instalar-botao"}
          onClick={aoClicar}
          disabled={aguardando}
        >
          <IconeInstalar className="instalar-botao__icone" />
          {rotulo}
        </button>
      )}

      <dialog
        ref={dialogo}
        className="pwa-dialogo"
        aria-labelledby="instalar-titulo"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogo.current?.close();
        }}
      >
        <div className="pwa-dialogo__painel">
          <h2 id="instalar-titulo" className="pwa-dialogo__titulo">Instalar o LotoAnalítica</h2>
          <InstrucoesInstalacao plataforma={plataforma} />
          <button type="button" className="botao-gerar pwa-dialogo__ok" onClick={() => dialogo.current?.close()}>
            Entendi
          </button>
        </div>
      </dialog>
    </>
  );
}

export function InstrucoesInstalacao({ plataforma }: { plataforma: string }) {
  if (plataforma === "ios") {
    if (!ehSafariIOS()) {
      return (
        <p className="pwa-dialogo__texto">
          No iPhone e no iPad, a instalação é feita pelo <strong>Safari</strong>. Abra
          {" "}<strong>lotoanalitica.com.br</strong> no Safari e toque em Compartilhar →
          {" "}<strong>Adicionar à Tela de Início</strong>. (No iOS 16.4 ou mais recente, alguns
          navegadores também mostram essa opção no menu Compartilhar.)
        </p>
      );
    }
    // Safari atual (iOS 26): o Compartilhar fica dentro do menu ao lado do
    // endereço, e "Adicionar à Tela de Início" fica escondido em "Ver mais".
    return (
      <>
        <ol className="pwa-passos pwa-passos--ios">
          <li>
            <span className="pwa-passos__icone"><IconeMais /></span>
            <span>
              Toque nos <strong>três tracinhos</strong> ao lado esquerdo do endereço da página.
            </span>
          </li>
          <li>
            <span className="pwa-passos__icone"><IconeCompartilharIOS /></span>
            <span>
              Escolha <strong>Compartilhar</strong>.
            </span>
          </li>
          <li>
            <span className="pwa-passos__icone"><IconeVerMais /></span>
            <span>
              Toque na setinha para baixo, <strong>Ver mais</strong>.
            </span>
          </li>
          <li>
            <span className="pwa-passos__icone"><IconeAdicionarIOS /></span>
            <span>
              Escolha <strong>Adicionar à Tela de Início</strong> e confirme. Abra pelo ícone na tela
              inicial para usar em tela cheia e receber notificações.
            </span>
          </li>
        </ol>
        <p className="pwa-dialogo__texto pwa-passos__nota">
          Em versões anteriores do iOS, o botão <strong>Compartilhar</strong> fica direto na barra do
          Safari; depois é só rolar a lista até “Adicionar à Tela de Início”.
        </p>
      </>
    );
  }

  if (plataforma === "android") {
    return (
      <ol className="pwa-passos">
        <li>
          <span className="pwa-passos__icone"><IconeMenuVertical /></span>
          <span>Abra o menu do navegador (⋮ no Chrome, ☰ no Firefox e Samsung Internet).</span>
        </li>
        <li>
          <span className="pwa-passos__icone"><IconeInstalar /></span>
          <span>
            Toque em <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.
          </span>
        </li>
      </ol>
    );
  }

  return (
    <ol className="pwa-passos">
      <li>
        <span className="pwa-passos__icone"><IconeInstalar /></span>
        <span>
          No Chrome ou Edge, clique no ícone de instalar na barra de endereço, ou no menu
          {" "}<strong>⋮ → Instalar LotoAnalítica</strong> (no Edge: <strong>Apps → Instalar este site como app</strong>).
        </span>
      </li>
      <li>
        <span className="pwa-passos__icone"><IconeMenuVertical /></span>
        <span>
          No Safari do Mac (macOS Sonoma ou mais recente): menu <strong>Arquivo → Adicionar ao Dock</strong>.
          O Firefox para computador não instala sites como app.
        </span>
      </li>
    </ol>
  );
}
