export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import { createClient } from "@/lib/supabase/server";
import { NOME_LOTERIA } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Meus bolões — LotoAnalítica",
  robots: { index: false, follow: false },
};

const ROTULO_STATUS: Record<string, string> = {
  aberto: "Aberto",
  fechado: "Fechado",
  conferido: "Conferido",
};

export default async function ContaBoloesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/conta/boloes");

  const { data: boloes } = await supabase
    .from("boloes")
    .select("id, titulo, loteria, concurso_alvo, alvo, status, qtd_cotas, criado_em")
    .eq("owner_id", user.id)
    .order("criado_em", { ascending: false });

  return (
    <>
      <Masthead />
      <main className="conta-page container">
        <div className="conta-header">
          <div>
            <Link href="/conta" className="conta-voltar">← Minha conta</Link>
            <h1 className="conta-titulo">Meus bolões</h1>
            <p className="conta-email">
              {boloes?.length ?? 0} bolão{boloes?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/megasena/bolao" className="botao-gerar">+ Novo bolão</Link>
        </div>

        {(boloes?.length ?? 0) === 0 ? (
          <div className="conta-jogos-vazio">
            <p>Você ainda não salvou nenhum bolão.</p>
            <p className="conta-jogos-dica">
              Monte o bolão por orçamento no otimizador e salve para compartilhar o link com o grupo.
            </p>
            <Link href="/megasena/bolao" className="botao-gerar">Montar meu primeiro bolão →</Link>
          </div>
        ) : (
          <ul className="bolao-lista">
            {(boloes ?? []).map((b) => (
              <li key={b.id} className="bolao-lista__item">
                <Link href={`/conta/boloes/${b.id}`} className="bolao-lista__link">
                  <span className="bolao-lista__titulo">{b.titulo}</span>
                  <span className="bolao-lista__meta">
                    {NOME_LOTERIA[b.loteria] ?? b.loteria} ·{" "}
                    {b.alvo === "virada"
                      ? "Mega da Virada"
                      : b.concurso_alvo
                        ? `concurso ${b.concurso_alvo}`
                        : "concurso a definir"}{" "}
                    · {b.qtd_cotas} cotas
                  </span>
                  <span className="chip">{ROTULO_STATUS[b.status] ?? b.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
