import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rotas que exigem usuário logado (qualquer plano)
const ROTAS_AUTH = ["/conta"];

// Rotas que exigem plano premium ativo
const ROTAS_PREMIUM = ["/premium"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
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

  // IMPORTANTE: getUser() valida o token no servidor — não usar getSession()
  // aqui porque pode ser manipulado pelo cliente.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Rotas que exigem login ────────────────────────────────────────────────
  const precisaAuth = ROTAS_AUTH.some((r) => pathname.startsWith(r));
  if (precisaAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // ── Rotas que exigem premium ──────────────────────────────────────────────
  const precisaPremium = ROTAS_PREMIUM.some((r) => pathname.startsWith(r));
  if (precisaPremium) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/entrar";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // Verificar plano no banco
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

export const config = {
  matcher: [
    // Proteger apenas as rotas relevantes; excluir assets estáticos e APIs
    "/conta/:path*",
    "/premium/:path*",
    // Excluir explicitamente para não bloquear o callback de auth
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|api/).*)",
  ],
};
