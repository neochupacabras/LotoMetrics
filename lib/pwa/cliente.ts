// Utilitários de PWA do lado do cliente (detecção de plataforma/capacidade
// e chamadas às rotas /api/push/*). Sem estado: o estado vive em
// components/pwa/PwaProvider.tsx.

export type Plataforma = "ios" | "android" | "desktop" | "outro";

export function detectarPlataforma(): Plataforma {
  if (typeof navigator === "undefined") return "outro";
  const ua = navigator.userAgent;
  // iPadOS 13+ se apresenta como Mac; o toque denuncia.
  const ipadComoMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || ipadComoMac) return "ios";
  if (/Android/.test(ua)) return "android";
  if (/Windows|Macintosh|Linux|CrOS/.test(ua)) return "desktop";
  return "outro";
}

// Safari de verdade (não Chrome/Firefox/Edge para iOS, que no iPhone não
// conseguem instalar PWA antes do iOS 16.4 e escondem a opção em menus
// diferentes).
export function ehSafariIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return detectarPlataforma() === "ios" && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua);
}

export function emModoStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    // iOS Safari (propriedade não padrão)
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function suportaPush(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// No iOS/iPadOS, Web Push só existe no app instalado na Tela de Início (16.4+).
export function pushExigeInstalacao(): boolean {
  return detectarPlataforma() === "ios" && !emModoStandalone();
}

export function chavePublicaVapid(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
}

function base64UrlParaBytes(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const bruto = atob(b64);
  const bytes = new Uint8Array(new ArrayBuffer(bruto.length));
  for (let i = 0; i < bruto.length; i++) bytes[i] = bruto.charCodeAt(i);
  return bytes;
}

export async function registroSW(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  // ready nunca resolve se não houver SW registrado (ex.: em `next dev`).
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return null;
  return navigator.serviceWorker.ready;
}

export async function inscricaoAtual(): Promise<PushSubscription | null> {
  const reg = await registroSW();
  return reg ? reg.pushManager.getSubscription() : null;
}

async function chamar(caminho: string, metodo: "POST" | "DELETE", corpo: unknown) {
  const resp = await fetch(caminho, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
    credentials: "same-origin",
    keepalive: true,
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(json.erro || `Erro ${resp.status}`);
  return json;
}

export interface PreferenciasPush {
  categorias: string[];
  loterias: string[];
}

export interface EstadoServidor extends PreferenciasPush {
  configurado: boolean;
  existe: boolean;
  vinculadaAConta: boolean;
  vinculadaAOutraConta: boolean;
}

export async function consultarPreferencias(endpoint: string): Promise<EstadoServidor> {
  return chamar("/api/push/consultar", "POST", { endpoint });
}

// Pede permissão (só a partir de um clique do usuário) e inscreve no serviço
// de push, sem salvar preferências. Usado também pelo aviso de jogo do
// simulador (components/AvisoJogoSimulador.tsx), que guarda a inscrição em
// /api/alertas/jogo sem assinar nenhuma categoria.
export async function obterInscricaoPush(): Promise<PushSubscription> {
  const chave = chavePublicaVapid();
  if (!chave) throw new Error("Notificações ainda não configuradas neste site.");
  const reg = await registroSW();
  if (!reg) throw new Error("O app ainda está sendo preparado. Recarregue a página e tente de novo.");

  const permissao = await Notification.requestPermission();
  if (permissao !== "granted") {
    throw new Error(
      permissao === "denied"
        ? "As notificações estão bloqueadas nas configurações do navegador."
        : "Permissão não concedida."
    );
  }

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlParaBytes(chave) });
  }
  return sub;
}

// Pede permissão, inscreve no serviço de push e salva no servidor.
export async function ativarPush(prefs: PreferenciasPush): Promise<PushSubscription> {
  const sub = await obterInscricaoPush();
  await chamar("/api/push/inscricao", "POST", { inscricao: sub.toJSON(), ...prefs });
  return sub;
}

export async function salvarPreferencias(sub: PushSubscription, prefs: PreferenciasPush) {
  return chamar("/api/push/inscricao", "POST", { inscricao: sub.toJSON(), ...prefs });
}

export async function desativarPush(): Promise<void> {
  const sub = await inscricaoAtual();
  if (!sub) return;
  await chamar("/api/push/inscricao", "DELETE", { endpoint: sub.endpoint }).catch(() => {});
  await sub.unsubscribe().catch(() => {});
}

export async function enviarTeste(endpoint: string) {
  return chamar("/api/push/teste", "POST", { endpoint });
}

// Logout / troca de conta: tira o vínculo com a conta e apaga as páginas
// guardadas para uso offline.
const CHAVE_DONO = "la:push-dono";

export function lembrarDonoDaInscricao(userId: string | null) {
  try {
    if (userId) localStorage.setItem(CHAVE_DONO, userId);
    else localStorage.removeItem(CHAVE_DONO);
  } catch {}
}

export function donoLembrado(): string | null {
  try {
    return localStorage.getItem(CHAVE_DONO);
  } catch {
    return null;
  }
}

export async function limparDadosDoUsuario(): Promise<void> {
  lembrarDonoDaInscricao(null);
  try {
    navigator.serviceWorker?.controller?.postMessage({ tipo: "limpar-dados-usuario" });
  } catch {}
  try {
    const sub = await inscricaoAtual();
    if (sub) await chamar("/api/push/desvincular", "POST", { endpoint: sub.endpoint });
  } catch {}
}
