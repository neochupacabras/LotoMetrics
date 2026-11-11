export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CabecalhoPagina, RecursoBloqueado } from "@/components/membros/MembrosShell";
import { getContaContexto } from "@/lib/conta/contexto";
import ApiKeysClient from "@/components/conta/ApiKeysClient";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "API de dados — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default async function ContaApiPage() {
  const contexto = await getContaContexto();
  if (!contexto) redirect("/entrar?next=/conta/api");
  const { isPremium } = contexto;

  const supabase = await createClient();
  const { data: keys } = await supabase
    .from("api_keys")
    .select("id, key_prefix, label, requests_mes, limite_mes, ativo, created_at, last_used_at")
    .eq("user_id", contexto.userId)
    .eq("ativo", true)
    .order("created_at", { ascending: false });

  return (
    <>
        <CabecalhoPagina
          titulo="API de dados"
          descricao="Resultados e estatísticas processadas via REST API, com autenticação por chave."
          acoes={
            <a href="/api/v1/docs" target="_blank" rel="noopener" className="m-botao m-botao--secundario">
              Ver documentação ↗
            </a>
          }
        />

        {!isPremium ? (
          <RecursoBloqueado titulo="API de dados históricos">
            Acesso REST aos resultados e às estatísticas processadas, com chave própria e 1.000
            requisições por mês incluídas.
          </RecursoBloqueado>
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
                <p className="m-secao__texto">
                  Limite: 1.000 requisições/mês. Renova no primeiro dia de cada mês.
                  Veja todos os endpoints em{" "}
                  <a href="/api/v1/docs" target="_blank" className="conta-link-gerenciar">
                    /api/v1/docs
                  </a>.
                </p>
                <p className="m-secao__texto" style={{ marginTop: 8 }}>
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
    </>
  );
}
