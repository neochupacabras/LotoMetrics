/* LotoAnalítica — Service Worker (PWA).
 *
 * Escrito à mão, sem Workbox: o site só precisa de três estratégias e o
 * arquivo inteiro cabe aqui, sem dependência nem etapa de build extra.
 *
 * Estratégias:
 *  - /_next/static/*, /fonts/*, /icons/*  → Cache First (arquivos com hash
 *    no nome ou imutáveis; nunca mudam de conteúdo sob a mesma URL).
 *  - imagens same-origin (/_next/image, *.png/svg/webp…) → Stale While
 *    Revalidate, com limite de entradas.
 *  - navegação (HTML) de páginas PÚBLICAS → Network First com timeout;
 *    sem rede, a última cópia salva; sem cópia, /offline.
 *  - Todo o resto (APIs, Server Actions, RSC, POST, Supabase, Sentry,
 *    AdSense, outras origens) → não intercepta: vai direto para a rede.
 *
 * Segurança/privacidade:
 *  - Nunca guarda páginas da conta/admin/auth/checkout nem respostas com
 *    Cache-Control private/no-store ou que tragam Set-Cookie.
 *  - Nunca guarda respostas de API (dados de usuário).
 *  - Ao sair da conta o app manda "limpar-dados-usuario" e o cache de
 *    páginas é apagado (ver components/pwa/PwaProvider.tsx).
 */

const VERSAO = "v1";
const CACHE_BASE = `la-base-${VERSAO}`; // pré-cache: página offline, ícones
const CACHE_ESTATICO = `la-estatico-${VERSAO}`;
const CACHE_IMAGENS = `la-imagens-${VERSAO}`;
const CACHE_PAGINAS = `la-paginas-${VERSAO}`;
// Página offline + os JS/CSS que ela usa (sem eles, a página quebraria ao
// hidratar sem rede). Refeito por inteiro a cada atualização.
const CACHE_OFFLINE = `la-offline-${VERSAO}`;
const CACHES_ATUAIS = [CACHE_BASE, CACHE_OFFLINE, CACHE_ESTATICO, CACHE_IMAGENS, CACHE_PAGINAS];

const URL_OFFLINE = "/offline";
const PRECACHE = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/badge-96.png",
];

// Os chunks do Next mudam de nome a cada deploy: o limite evita que versões
// antigas se acumulem para sempre no aparelho.
const LIMITE_ESTATICOS = 250;
const LIMITE_IMAGENS = 80;
const LIMITE_PAGINAS = 40;
const TIMEOUT_REDE_MS = 4000;

// Páginas que dependem de sessão ou de dados pessoais — nunca em cache.
const PREFIXOS_PRIVADOS = [
  "/conta", "/admin", "/entrar", "/cadastrar", "/esqueci-senha", "/auth",
  "/assinar", "/b/", "/notificacoes/descadastrar", "/api", "/monitoring",
];

function ehPrivada(pathname) {
  return PREFIXOS_PRIVADOS.some((p) =>
    p.endsWith("/") ? pathname.startsWith(p) : pathname === p || pathname.startsWith(p + "/")
  );
}

// Páginas públicas que o Next serve como "private, no-store" só porque são
// renderizadas sob demanda (paginação por searchParams, data do próximo
// sorteio) — nenhuma lê sessão/cookie no servidor (o login é resolvido no
// cliente, ver components/auth/PlanoUsuarioProvider.tsx). Podem ir para o
// cache offline. ATENÇÃO: se alguma passar a personalizar o HTML no
// servidor, tire-a desta lista.
const PREFIXOS_PUBLICOS_DINAMICOS = [
  "/lotofacil/", "/megasena/", "/quina/", "/lotomania/", "/diadesorte/",
  "/maismilionaria/", "/timemania/", "/duplasena/", "/supersete/",
  "/calendario", "/comparador",
];

function podeGuardar(resposta, pathname) {
  if (!resposta || !resposta.ok || resposta.type !== "basic") return false;
  if (resposta.redirected) return false;
  if (resposta.headers.has("Set-Cookie")) return false;
  const cc = (resposta.headers.get("Cache-Control") || "").toLowerCase();
  if (cc.includes("no-store") || cc.includes("private")) {
    return !!pathname && PREFIXOS_PUBLICOS_DINAMICOS.some((p) => pathname === p || pathname.startsWith(p));
  }
  return true;
}

async function limitarCache(nome, max) {
  const cache = await caches.open(nome);
  const chaves = await cache.keys();
  for (let i = 0; i < chaves.length - max; i++) await cache.delete(chaves[i]);
}

// ── Ciclo de vida ────────────────────────────────────────────────────────────

// Baixa /offline e todos os /_next/static/* que o HTML dela referencia; só
// troca o cache anterior se tudo chegou (nunca fica com página sem JS).
async function precacheOffline() {
  const resp = await fetch(new Request(URL_OFFLINE, { cache: "reload" }));
  if (!resp.ok) return;
  const html = await resp.clone().text();
  const assets = [...new Set(html.match(/\/_next\/static\/[^"'\s<>)\\]+/g) || [])];
  const baixados = await Promise.all(
    assets.map((u) => fetch(u).then((r) => (r.ok ? [u, r] : null)).catch(() => null))
  );
  if (baixados.some((b) => !b)) return;
  await caches.delete(CACHE_OFFLINE);
  const cache = await caches.open(CACHE_OFFLINE);
  await cache.put(URL_OFFLINE, resp);
  await Promise.all(baixados.map(([u, r]) => cache.put(u, r)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_BASE).then((cache) =>
        // cache: "reload" ignora o cache HTTP para pegar a versão atual.
        Promise.all(PRECACHE.map((url) => cache.add(new Request(url, { cache: "reload" })).catch(() => {})))
      ),
      precacheOffline().catch(() => {}),
    ])
  );
  // Sem skipWaiting automático: a versão nova espera o usuário aceitar a
  // atualização (aviso "Nova versão disponível") para não trocar o código
  // no meio de uma página aberta.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const nomes = await caches.keys();
      await Promise.all(
        nomes.filter((n) => n.startsWith("la-") && !CACHES_ATUAIS.includes(n)).map((n) => caches.delete(n))
      );
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable().catch(() => {});
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  const dados = event.data || {};
  if (dados.tipo === "pular-espera") {
    self.skipWaiting();
  } else if (dados.tipo === "limpar-dados-usuario") {
    event.waitUntil(caches.delete(CACHE_PAGINAS));
  } else if (dados.tipo === "precache-offline") {
    // Pedido pelo app (no máx. 1x/dia): mantém a página offline em dia com
    // o deploy atual, já que este arquivo não muda a cada deploy.
    event.waitUntil(precacheOffline().catch(() => {}));
  }
});

// ── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Payload RSC das navegações client-side do Next e prefetch: deixa o
  // Next lidar (sem rede, ele cai para navegação completa, que tratamos
  // abaixo).
  if (req.headers.get("RSC") || req.headers.get("Next-Router-Prefetch") || url.searchParams.has("_rsc")) return;

  if (req.mode === "navigate") {
    if (ehPrivada(url.pathname)) return;
    event.respondWith(navegacao(event));
    return;
  }

  if (ehPrivada(url.pathname)) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/fonts/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(req));
    return;
  }

  if (req.destination === "image" || url.pathname.startsWith("/_next/image")) {
    event.respondWith(staleWhileRevalidate(event, req));
  }
});

async function cacheFirst(req) {
  const salvo = await caches.match(req); // procura também no pré-cache
  if (salvo) return salvo;
  const resposta = await fetch(req);
  if (podeGuardar(resposta)) {
    const cache = await caches.open(CACHE_ESTATICO);
    await cache.put(req, resposta.clone());
    limitarCache(CACHE_ESTATICO, LIMITE_ESTATICOS);
  }
  return resposta;
}

async function staleWhileRevalidate(event, req) {
  const cache = await caches.open(CACHE_IMAGENS);
  const salvo = await cache.match(req);
  const rede = fetch(req)
    .then(async (resposta) => {
      if (podeGuardar(resposta)) {
        await cache.put(req, resposta.clone());
        await limitarCache(CACHE_IMAGENS, LIMITE_IMAGENS);
      }
      return resposta;
    })
    .catch(() => undefined);
  if (salvo) {
    event.waitUntil(rede);
    return salvo;
  }
  return (await rede) || new Response("", { status: 504 });
}

function comTimeout(promessa, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    promessa.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

async function navegacao(event) {
  const req = event.request;
  const cache = await caches.open(CACHE_PAGINAS);
  // Cache por caminho+query, ignorando fragmentos.
  const chave = new Request(new URL(req.url).href.split("#")[0]);

  const rede = (async () => {
    const preload = await event.preloadResponse;
    const resposta = preload || (await fetch(req));
    const caminho = new URL(req.url).pathname;
    if (caminho !== URL_OFFLINE && podeGuardar(resposta, caminho)) {
      const copia = resposta.clone();
      event.waitUntil(
        cache.put(chave, copia).then(() => limitarCache(CACHE_PAGINAS, LIMITE_PAGINAS))
      );
    }
    return resposta;
  })();

  try {
    return await comTimeout(rede, TIMEOUT_REDE_MS);
  } catch {
    const salvo = await cache.match(chave);
    if (salvo) {
      // Rede lenta (não ausente): continua tentando para atualizar a cópia.
      event.waitUntil(rede.catch(() => {}));
      return salvo;
    }
    try {
      // Sem cópia: espera a rede mais um pouco antes de desistir.
      return await rede;
    } catch {
      const url = new URL(req.url);
      if (url.pathname === URL_OFFLINE) {
        const offline = await caches.match(URL_OFFLINE, { ignoreSearch: true });
        return offline || new Response("Sem conexão", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
      // Redireciona (em vez de servir o HTML de /offline nesta URL): o
      // roteador do Next precisa que a URL bata com a página carregada.
      // ?de= guarda o destino para o botão "Tentar novamente".
      return Response.redirect(`${URL_OFFLINE}?de=${encodeURIComponent(url.pathname + url.search)}`, 302);
    }
  }
}

// ── Push ─────────────────────────────────────────────────────────────────────

function caminhoSeguro(url) {
  // Só caminhos do próprio site (mesma regra de lib/push/validacao.ts).
  if (typeof url !== "string" || !url.startsWith("/") || url.startsWith("//") || url.includes("\\")) return "/";
  return url;
}

self.addEventListener("push", (event) => {
  let dados = {};
  try {
    dados = event.data ? event.data.json() : {};
  } catch {
    dados = { titulo: "LotoAnalítica", corpo: event.data ? event.data.text() : "" };
  }

  const titulo = String(dados.titulo || "LotoAnalítica").slice(0, 120);
  const acoes = Array.isArray(dados.acoes) ? dados.acoes.slice(0, 2) : [];
  const opcoes = {
    body: String(dados.corpo || "").slice(0, 400),
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-96.png",
    lang: "pt-BR",
    // Mesma tag = substitui a notificação anterior do mesmo tipo/loteria em
    // vez de empilhar (evita duplicadas).
    tag: String(dados.tag || "geral").slice(0, 64),
    renotify: false,
    timestamp: Date.now(),
    data: {
      url: caminhoSeguro(dados.url),
      acoes: Object.fromEntries(acoes.map((a) => [String(a.acao), caminhoSeguro(a.url)])),
      categoria: dados.categoria || "",
    },
    actions: acoes.map((a) => ({ action: String(a.acao).slice(0, 32), title: String(a.titulo).slice(0, 40) })),
  };

  event.waitUntil(self.registration.showNotification(titulo, opcoes));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const dados = event.notification.data || {};
  const caminho = (event.action && dados.acoes && dados.acoes[event.action]) || dados.url || "/";
  const destino = new URL(caminho, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const janelas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      // App já aberto: reaproveita a janela (foco + navega) em vez de abrir outra.
      for (const janela of janelas) {
        if (new URL(janela.url).origin !== self.location.origin) continue;
        await janela.focus();
        if ("navigate" in janela && janela.url !== destino) {
          try {
            await janela.navigate(destino);
          } catch {
            janela.postMessage({ tipo: "navegar", url: caminho });
          }
        }
        return;
      }
      await self.clients.openWindow(destino);
    })()
  );
});

// O navegador renovou a inscrição (expiração/rotação de chaves): salva a
// nova no servidor com as mesmas preferências e descarta a antiga.
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      const antiga = event.oldSubscription;
      let nova = event.newSubscription;
      if (!nova && antiga && antiga.options) {
        nova = await self.registration.pushManager.subscribe(antiga.options);
      }
      if (!nova) return;

      let preferencias = { categorias: ["resultado"], loterias: [] };
      if (antiga) {
        const r = await fetch("/api/push/consultar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: antiga.endpoint }),
          credentials: "same-origin",
        }).catch(() => null);
        const j = r && r.ok ? await r.json().catch(() => null) : null;
        if (j && j.existe) preferencias = { categorias: j.categorias, loterias: j.loterias };
      }

      await fetch("/api/push/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // endpointAnterior: o servidor passa os avisos de jogo (alertas_jogo)
        // da inscrição antiga para a nova antes de a antiga ser apagada.
        body: JSON.stringify({
          inscricao: nova.toJSON(),
          ...preferencias,
          ...(antiga && antiga.endpoint !== nova.endpoint ? { endpointAnterior: antiga.endpoint } : {}),
        }),
        credentials: "same-origin",
      }).catch(() => {});

      if (antiga && antiga.endpoint !== nova.endpoint) {
        await fetch("/api/push/inscricao", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: antiga.endpoint }),
          credentials: "same-origin",
        }).catch(() => {});
      }
    })()
  );
});
