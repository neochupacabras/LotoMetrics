import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Usado em Server Components, Server Actions e Route Handlers.
// Lê e escreve cookies via next/headers — gerencia a sessão JWT
// sem expor a service_role key ao cliente.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll chamado de um Server Component — pode ignorar.
            // O middleware cuida de atualizar a sessão.
          }
        },
      },
    }
  );
}

// Variante com service_role — para webhooks e operações administrativas
// (atualizar plan, etc.) que precisam bypassar RLS.
// NUNCA expor ao cliente — só usar em route handlers server-side.
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
