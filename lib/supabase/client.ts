import { createBrowserClient } from "@supabase/ssr";

// Singleton — reutiliza a mesma instância em toda a árvore de Client Components.
// Usa apenas a anon key (seguro expor no browser).
let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
