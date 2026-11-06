"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { usePlanoUsuario } from "@/components/auth/PlanoUsuarioProvider";
import {
  detectarPlataforma,
  donoLembrado,
  emModoStandalone,
  limparDadosDoUsuario,
  type Plataforma,
} from "@/lib/pwa/cliente";
import { gravarLocal, lerLocal, useLocal, useNoCliente } from "@/lib/pwa/armazenamento";
import { enviarBeacon, obterOuCriarAnonymousId } from "@/lib/telemetria-cliente";

// Estado do PWA compartilhado pela navegação inferior, convite de
// instalação, tela de notificações etc.:
//  - registra o service worker (só em produção — em `next dev` o HMR e o
//    cache brigam);
//  - guarda o evento beforeinstallprompt (Chrome/Edge/Samsung) para o
//    botão "Instalar aplicativo" disparar quando o usuário quiser;
//  - detecta modo standalone (app aberto pelo ícone) e marca o <html>
//    com data-standalone, usado no CSS;
//  - acompanha online/offline e versões novas do service worker;
//  - em modo standalone, abre links de outros sites fora do app;
//  - quando a sessão muda (logout/troca de conta), desvincula as
//    notificações pessoais e apaga as páginas guardadas offline.

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface EstadoPwa {
  pronto: boolean; // já rodou no cliente (evita piscar no SSR)
  plataforma: Plataforma;
  standalone: boolean;
  instalado: boolean;
  podeInstalarNativo: boolean; // há beforeinstallprompt guardado
  online: boolean;
  atualizacaoDisponivel: boolean;
  swAtivo: boolean;
  instalar: () => Promise<"aceito" | "recusado" | "indisponivel">;
  atualizar: () => void;
}

const PwaContext = createContext<EstadoPwa | null>(null);

const CHAVE_INSTALADO = "la:pwa-instalado";
const CHAVE_PRECACHE = "la:pwa-precache-offline";
const CHAVE_ABERTURA = "la:pwa-ultima-abertura";
const CHAVE_INSTALACAO_ID = "la:pwa-id";

// Identificador anônimo do aparelho/instalação (UUID aleatório, sem dado
// pessoal) — só para contar apps distintos no /admin. No iPhone cada app
// instalado tem armazenamento próprio, então vale por instalação.
function obterInstalacaoId(): string {
  const existente = lerLocal(CHAVE_INSTALACAO_ID);
  if (existente) return existente;
  const novo = crypto.randomUUID();
  gravarLocal(CHAVE_INSTALACAO_ID, novo);
  return novo;
}

const semInscricao = () => () => {};

function inscreverDisplayMode(aoMudar: () => void) {
  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", aoMudar);
  return () => mq.removeEventListener("change", aoMudar);
}

function inscreverConexao(aoMudar: () => void) {
  window.addEventListener("online", aoMudar);
  window.addEventListener("offline", aoMudar);
  return () => {
    window.removeEventListener("online", aoMudar);
    window.removeEventListener("offline", aoMudar);
  };
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { carregando, userId } = usePlanoUsuario();
  // Leituras do navegador via useSyncExternalStore: sem setState em efeito
  // e sem divergência de hidratação (no servidor valem os padrões).
  const pronto = useNoCliente();
  const plataforma = useSyncExternalStore<Plataforma>(semInscricao, detectarPlataforma, () => "outro");
  const standalone = useSyncExternalStore(inscreverDisplayMode, emModoStandalone, () => false);
  const online = useSyncExternalStore(inscreverConexao, () => navigator.onLine, () => true);
  const instalado = useLocal(CHAVE_INSTALADO) === "1";
  const [atualizacaoDisponivel, setAtualizacaoDisponivel] = useState(false);
  const [swAtivo, setSwAtivo] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [podeInstalarNativo, setPodeInstalarNativo] = useState(false);
  const swEsperandoRef = useRef<ServiceWorker | null>(null);

  // Modo standalone → atributo no <html> (usado pelo CSS) e lembrete de
  // que o app está instalado neste aparelho.
  useEffect(() => {
    document.documentElement.dataset.standalone = String(standalone);
    if (!standalone) return;
    gravarLocal(CHAVE_INSTALADO, "1");
    // Métrica de apps instalados em uso (/admin): 1 evento por dia por
    // aparelho. É o único sinal que existe no iPhone, onde o Safari não
    // avisa a instalação.
    const hoje = new Date().toISOString().slice(0, 10);
    if (lerLocal(CHAVE_ABERTURA) !== hoje) {
      gravarLocal(CHAVE_ABERTURA, hoje);
      enviarBeacon({
        eventName: "pwa_open",
        tool: null,
        anonymousId: obterOuCriarAnonymousId(),
        metadata: { instalacaoId: obterInstalacaoId(), plataforma: detectarPlataforma() },
      });
    }
  }, [standalone]);

  // Instalação: beforeinstallprompt (Chrome/Edge/Samsung) e appinstalled.
  useEffect(() => {
    const aoPrompt = (e: Event) => {
      e.preventDefault(); // nada de mini-infobar automática: o convite é nosso
      promptRef.current = e as BeforeInstallPromptEvent;
      setPodeInstalarNativo(true);
      // Se o navegador oferece instalar, o app não está instalado (o usuário
      // pode ter desinstalado depois de instalar).
      gravarLocal(CHAVE_INSTALADO, null);
    };
    const aoInstalar = () => {
      promptRef.current = null;
      setPodeInstalarNativo(false);
      gravarLocal(CHAVE_INSTALADO, "1");
      enviarBeacon({
        eventName: "pwa_installed",
        tool: null,
        anonymousId: obterOuCriarAnonymousId(),
        metadata: { instalacaoId: obterInstalacaoId(), plataforma: detectarPlataforma() },
      });
    };
    window.addEventListener("beforeinstallprompt", aoPrompt);
    window.addEventListener("appinstalled", aoInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", aoPrompt);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  // Registro do service worker + detecção de versão nova
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_PWA_DEV !== "1") return;

    let cancelado = false;
    const marcarEspera = (sw: ServiceWorker | null) => {
      if (!sw || !navigator.serviceWorker.controller) return; // 1ª instalação: nada a avisar
      swEsperandoRef.current = sw;
      setAtualizacaoDisponivel(true);
    };

    const registrar = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
        if (cancelado) return;
        setSwAtivo(true);
        marcarEspera(reg.waiting);
        // Mantém a página offline (e seus JS/CSS) alinhada ao deploy atual —
        // no máximo 1x por dia, para não gastar dados à toa.
        const ultimo = Number(lerLocal(CHAVE_PRECACHE) || "0");
        if (Date.now() - ultimo > 86_400_000) {
          const sw = reg.active ?? (await navigator.serviceWorker.ready).active;
          sw?.postMessage({ tipo: "precache-offline" });
          gravarLocal(CHAVE_PRECACHE, String(Date.now()));
        }
        reg.addEventListener("updatefound", () => {
          const novo = reg.installing;
          novo?.addEventListener("statechange", () => {
            if (novo.state === "installed") marcarEspera(novo);
          });
        });
        // Checa versão nova quando o app volta ao primeiro plano.
        const aoVoltar = () => {
          if (document.visibilityState === "visible") reg.update().catch(() => {});
        };
        document.addEventListener("visibilitychange", aoVoltar);
      } catch (err) {
        console.warn("Service worker não registrado:", err);
      }
    };

    // Depois do load: não disputa banda com o carregamento inicial.
    if (document.readyState === "complete") registrar();
    else window.addEventListener("load", registrar, { once: true });

    let recarregando = false;
    const aoTrocarControlador = () => {
      if (recarregando || !swEsperandoRef.current) return;
      recarregando = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", aoTrocarControlador);

    // Clique em notificação com o app aberto (fallback do SW).
    const aoMensagem = (e: MessageEvent) => {
      if (e.data?.tipo === "navegar" && typeof e.data.url === "string" && e.data.url.startsWith("/")) {
        router.push(e.data.url);
      }
    };
    navigator.serviceWorker.addEventListener("message", aoMensagem);

    return () => {
      cancelado = true;
      navigator.serviceWorker.removeEventListener("controllerchange", aoTrocarControlador);
      navigator.serviceWorker.removeEventListener("message", aoMensagem);
    };
  }, [router]);

  // Links externos no app instalado: abre no navegador/aba em vez de
  // "sequestrar" a janela do app (no iOS, sair do escopo prende o usuário
  // numa tela sem botão voltar).
  useEffect(() => {
    if (!standalone) return;
    const aoClicar = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target || a.hasAttribute("download")) return;
      let url: URL;
      try { url = new URL(a.href, location.href); } catch { return; }
      if (!/^https?:$/.test(url.protocol) || url.origin === location.origin) return;
      e.preventDefault();
      window.open(url.href, "_blank", "noopener,noreferrer");
    };
    document.addEventListener("click", aoClicar, true);
    return () => document.removeEventListener("click", aoClicar, true);
  }, [standalone]);

  // Sessão trocada desde a última inscrição (logout em outra aba, sessão
  // expirada, outra pessoa entrou): limpa os vínculos pessoais.
  useEffect(() => {
    if (carregando) return;
    const dono = donoLembrado();
    if (dono && dono !== userId) limparDadosDoUsuario();
  }, [carregando, userId]);

  const instalar = useCallback(async () => {
    const ev = promptRef.current;
    if (!ev) return "indisponivel" as const;
    await ev.prompt();
    const { outcome } = await ev.userChoice;
    promptRef.current = null; // o evento só pode ser usado uma vez
    setPodeInstalarNativo(false);
    return outcome === "accepted" ? ("aceito" as const) : ("recusado" as const);
  }, []);

  const atualizar = useCallback(() => {
    swEsperandoRef.current?.postMessage({ tipo: "pular-espera" });
  }, []);

  const valor = useMemo<EstadoPwa>(
    () => ({
      pronto, plataforma, standalone,
      instalado: (instalado && !podeInstalarNativo) || standalone,
      podeInstalarNativo, online, atualizacaoDisponivel, swAtivo, instalar, atualizar,
    }),
    [pronto, plataforma, standalone, instalado, podeInstalarNativo, online, atualizacaoDisponivel, swAtivo, instalar, atualizar]
  );

  return <PwaContext.Provider value={valor}>{children}</PwaContext.Provider>;
}

export function usePwa(): EstadoPwa {
  const ctx = useContext(PwaContext);
  if (!ctx) throw new Error("usePwa fora do PwaProvider");
  return ctx;
}
