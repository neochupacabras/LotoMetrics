import { createServerClient } from "@supabase/ssr";
import type { SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROTAS_AUTH = ["/conta"];
// /premium é a página PÚBLICA de apresentação dos planos — sem proteção
const ROTAS_PREMIUM: string[] = [];
// Rotas sempre públicas — nunca redirecionar, mesmo que o matcher as capture
const ROTAS_PUBLICAS = [
  "/contato", "/sobre", "/privacidade", "/premium",
  "/api-dados", "/dicas", "/quiz", "/assinar",
  "/entrar", "/cadastrar", "/esqueci-senha",
];

// Semana 6 do roadmap de growth (desempenho): o hub /[loteria]/resultados
// deixou de ler ?pagina=N para poder sair do cache (ISR); as páginas 2+ do
// histórico agora são /resultados/pagina/N. O formato antigo, já indexado
// e linkado, redireciona com 308. Fica aqui, e não em redirects() do
// next.config, porque lá a query de origem é sempre repassada ao destino
// (/pagina/5?pagina=5). Valor inválido ou 1 vai para o próprio hub.
export function destinoPaginaResultados(url: URL): URL | null {
  const m = url.pathname.match(/^\/([a-z]+)\/resultados\/?$/);
  if (!m || !url.searchParams.has("pagina")) return null;
  const valor = url.searchParams.get("pagina") ?? "";
  const pagina = /^[1-9]\d{0,5}$/.test(valor) ? Number(valor) : 1;
  const destino = new URL(url);
  destino.searchParams.delete("pagina");
  destino.pathname = pagina > 1 ? `/${m[1]}/resultados/pagina/${pagina}` : `/${m[1]}/resultados`;
  return destino;
}

export async function proxy(request: NextRequest) {
  const destinoPagina = destinoPaginaResultados(request.nextUrl);
  if (destinoPagina) return NextResponse.redirect(destinoPagina, 308);

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rotas explicitamente públicas — retornar imediatamente sem verificação
  const ePublica = ROTAS_PUBLICAS.some((r) => pathname.startsWith(r));
  if (ePublica) return supabaseResponse;

  const precisaAuth = ROTAS_AUTH.some((r) => pathname.startsWith(r));
  if (precisaAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const precisaPremium = ROTAS_PREMIUM.some((r) => pathname.startsWith(r));
  if (precisaPremium) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/entrar";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, plan_expires_at")
      .eq("id", user.id)
      .single();

    const isPremium =
      profile?.plan === "premium" &&
      (!profile.plan_expires_at ||
        new Date(profile.plan_expires_at) > new Date());

    if (!isPremium) {
      const url = request.nextUrl.clone();
      url.pathname = "/assinar";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

// Achado #2.4 do plano de implementação (13/09/2026): o Next.js só lê o
// matcher de um export literalmente chamado `config` — nunca existiu
// suporte a `proxyConfig` (confirmado em node_modules/next/dist/build/
// analysis/get-page-static-info.js, que sempre acessa `exportedConfig.
// config`, mesmo em arquivos proxy.ts). Isso significa que o matcher
// abaixo nunca funcionou: sem um `config` válido, o Next roda o proxy em
// TODA requisição, então `supabase.auth.getUser()` (uma chamada de rede
// pro Supabase Auth) disparava em toda página do site, incluindo
// conteúdo 100% público (resultados, dicas, matemática, home) — o
// oposto do que ROTAS_PUBLICAS tentava evitar.
//
// A lista abaixo cobre só as rotas onde a lógica deste arquivo realmente
// decide algo (redirecionar por falta de login em /conta; /admin fica
// aqui por precaução, ainda que a autorização de verdade seja feita por
// requireAdmin() em lib/admin-auth.ts). Rotas como /assinar e /premium
// já estão em ROTAS_PUBLICAS e nunca precisaram passar por getUser() —
// incluí-las no matcher só gastava uma chamada de rede à toa numa página
// de conversão de alto tráfego.
//
// O 3º item só casa com /[loteria]/resultados quando há ?pagina= na URL
// (redirect acima): a visita normal ao hub nem passa pelo proxy.
export const config = {
  matcher: [
    "/conta/:path*",
    "/admin/:path*",
    { source: "/:loteria/resultados", has: [{ type: "query", key: "pagina" }] },
  ],
};
