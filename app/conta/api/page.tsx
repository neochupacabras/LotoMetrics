export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import ApiKeysClient from "@/components/conta/ApiKeysClient";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "API de dados — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default async function ContaApiPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/conta/api");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  const isPremium =
    profile?.plan === "premium" &&
    (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date());

  const { data: keys } = await supabase
    .from("api_keys")
    .select("id, key_prefix, label, requests_mes, limite_mes, ativo, created_at, last_used_at")
    .eq("user_id", user.id)
    .eq("ativo", true)
    .order("created_at", { ascending: false });

  return (
    <>
      <Masthead />
      <main className="conta-page container">
        <div className="conta-header">
          <div>
            <Link href="/conta" className="conta-voltar">← Minha conta</Link>
            <h1 className="conta-titulo">API de dados</h1>
            <p className="conta-email">
              Acesse resultados e estatísticas via REST API
            </p>
          </div>
          <a
            href="/api/v1/docs"
            target="_blank"
            className="botao-copiar"
            style={{ whiteSpace: "nowrap" }}
          >
            Ver documentação →
          </a>
        </div>

        {!isPremium ? (
          <div className="conta-secao">
            <div className="conta-jogos-vazio">
              <p>A API de dados é exclusiva para assinantes Premium.</p>
              <p className="conta-jogos-dica">
                Com o Premium você pode acessar resultados históricos e estatísticas
                processadas via REST API com autenticação por chave.
              </p>
              <Link href="/assinar" className="botao-gerar">
                Assinar Premium →
              </Link>
            </div>
          </div>
        ) : (
          <>
            <section className="conta-secao">
              <h2 className="conta-secao-titulo">Como usar</h2>
              <div className="api-instrucoes">
                <p>Inclua sua chave no header de todas as requisições:</p>
                <pre className="api-code-block">
                  {`Authorization: Bearer la_suachave`}
                </pre>
                <p>Exemplos rápidos:</p>
                <pre className="api-code-block">
{`# Últimos 10 concursos da Lotofácil
curl -H "Authorization: Bearer la_suachave" \\
  "https://lotoanalitica.com.br/api/v1/resultados?loteria=lotofacil&limite=10"

# Tabela de frequência da Mega-Sena
curl -H "Authorization: Bearer la_suachave" \\
  "https://lotoanalitica.com.br/api/v1/estatisticas?loteria=megasena&tipo=frequencia"`}
                </pre>
                <p style={{ fontSize:"0.82rem", color:"var(--ink-soft)" }}>
                  Limite: 1.000 requisições/mês. Renova no primeiro dia de cada mês.
                  Veja todos os endpoints em{" "}
                  <a href="/api/v1/docs" target="_blank" className="conta-link-gerenciar">
                    /api/v1/docs
                  </a>.
                </p>
                <p style={{ fontSize:"0.82rem", color:"var(--ink-soft)", marginTop: 8 }}>
                  Precisa de mais requisições para um bot ou painel robusto?{" "}
                  <a
                    href={`mailto:contato@lotoanalitica.com.br?subject=${encodeURIComponent("API — Volume maior")}&body=${encodeURIComponent("Olá, preciso de um volume maior de requisições na API. Meu uso estimado é de ______ requisições/mês.")}`}
                    className="conta-link-gerenciar"
                  >
                    Fale com a gente →
                  </a>
                </p>
              </div>
            </section>

            <section className="conta-secao">
              <h2 className="conta-secao-titulo">Suas chaves</h2>
              <ApiKeysClient
                keys={(keys ?? []).map(k => ({
                  id: k.id,
                  prefixo: k.key_prefix,
                  label: k.label ?? "Sem nome",
                  requestsMes: k.requests_mes,
                  limiteMes: k.limite_mes,
                  criadaEm: new Date(k.created_at).toLocaleDateString("pt-BR"),
                  ultimoUso: k.last_used_at
                    ? new Date(k.last_used_at).toLocaleDateString("pt-BR")
                    : null,
                }))}
              />
            </section>
          </>
        )}
      </main>
    </>
  );
}
