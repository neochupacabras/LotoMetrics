export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/components/membros/MembrosShell";
import FormNome from "@/components/membros/FormNome";
import FormSenha from "@/components/membros/FormSenha";
import ExcluirContaForm from "@/components/conta/ExcluirContaForm";
import { getContaContexto } from "@/lib/conta/contexto";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Perfil e segurança — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ senha?: string }>;
}) {
  const contexto = await getContaContexto();
  if (!contexto) redirect("/entrar?next=/conta/perfil");
  const { senha } = await searchParams;

  const supabase = await createClient();
  const { data: assinatura } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", contexto.userId)
    .in("status", ["active", "trialing", "past_due"])
    .limit(1);
  const temAssinaturaStripe = (assinatura?.length ?? 0) > 0;

  return (
    <>
      <CabecalhoPagina titulo="Perfil e segurança" descricao="Seus dados de acesso e o controle da conta." />

      {senha === "alterada" && (
        <p className="m-aviso" data-tipo="ok" role="status">
          Senha alterada. Use a nova senha no próximo acesso.
        </p>
      )}

      <div className="m-secoes">
        <section className="m-secao" aria-labelledby="perfil-dados">
          <div className="m-secao__intro">
            <h2 id="perfil-dados" className="m-secao__titulo">Dados pessoais</h2>
            <p className="m-secao__texto">O nome aparece na sua área e nos e-mails que enviamos.</p>
          </div>
          <div className="m-secao__corpo">
            <FormNome nomeAtual={contexto.nome} />
            <dl className="m-dados">
              <div>
                <dt>E-mail de acesso</dt>
                <dd>{contexto.email}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="m-secao" aria-labelledby="perfil-senha">
          <div className="m-secao__intro">
            <h2 id="perfil-senha" className="m-secao__titulo">Senha</h2>
            <p className="m-secao__texto">Troque a senha usada para entrar com este e-mail.</p>
          </div>
          <div className="m-secao__corpo">
            <FormSenha rotuloBotao="Trocar senha" />
          </div>
        </section>

        <section className="m-secao m-secao--perigo" aria-labelledby="perfil-excluir">
          <div className="m-secao__intro">
            <h2 id="perfil-excluir" className="m-secao__titulo">Excluir conta</h2>
            <p className="m-secao__texto">
              Apaga sua conta e todos os dados associados a ela. Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="m-secao__corpo">
            <ExcluirContaForm isPremium={contexto.isPremium} temAssinaturaStripe={temAssinaturaStripe} />
          </div>
        </section>
      </div>
    </>
  );
}
