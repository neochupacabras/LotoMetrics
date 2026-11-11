export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/components/membros/MembrosShell";
import AlertasForm from "@/components/conta/AlertasForm";
import BotaoReligarEmails from "@/components/membros/BotaoReligarEmails";
import { getContaContexto } from "@/lib/conta/contexto";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Alertas — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default async function AlertasPage() {
  const contexto = await getContaContexto();
  if (!contexto) redirect("/entrar?next=/conta/alertas");

  const supabase = await createClient();
  const [{ data: alertas }, { count: qtdJogos }, { data: perfil }] = await Promise.all([
    supabase
      .from("alert_preferences")
      .select("loteria, threshold_brl, sorteios_sem_ganhador, ativo")
      .eq("user_id", contexto.userId),
    supabase
      .from("user_games")
      .select("id", { count: "exact", head: true })
      .eq("user_id", contexto.userId)
      .eq("ativo", true),
    supabase.from("profiles").select("receber_emails").eq("id", contexto.userId).single(),
  ]);
  // Descadastro pelo link dos e-mails desliga TODO e-mail de alerta
  // (acúmulo e resultado dos jogos) — ver lib/notificacoes/processar-concursos.ts.
  const emailsDesligados = perfil?.receber_emails === false;

  return (
    <>
      <CabecalhoPagina
        titulo="Alertas"
        descricao="O que avisamos você, e por onde: e-mail para acúmulos e resultados, notificação no celular."
      />

      {emailsDesligados && (
        <div className="m-aviso" data-tipo="atencao" role="status">
          <p>
            Os e-mails de alerta estão desligados porque você se descadastrou por um link de e-mail. Os
            alertas abaixo ficam salvos, mas nenhum e-mail é enviado.
          </p>
          <BotaoReligarEmails />
        </div>
      )}

      <div className="m-secoes">
        <section className="m-secao" aria-labelledby="alertas-acumulo">
          <div className="m-secao__intro">
            <h2 id="alertas-acumulo" className="m-secao__titulo">Acúmulo do prêmio</h2>
            <p className="m-secao__texto">
              Um e-mail quando o prêmio acumulado passar do valor que você definir.
            </p>
          </div>
          <div className="m-secao__corpo">
            <AlertasForm alertasExistentes={alertas ?? []} />
          </div>
        </section>

        <section className="m-secao" aria-labelledby="alertas-jogos">
          <div className="m-secao__intro">
            <h2 id="alertas-jogos" className="m-secao__titulo">Resultado dos seus jogos</h2>
            <p className="m-secao__texto">Conferência automática dos jogos salvos depois de cada sorteio.</p>
          </div>
          <div className="m-secao__corpo">
            {contexto.isPremium && emailsDesligados ? (
              <p className="m-estado" data-tipo="bloqueado">
                <strong>Pausado.</strong> Seus e-mails de alerta estão desligados (veja o aviso acima).
              </p>
            ) : contexto.isPremium ? (
              <p className="m-estado" data-tipo="ok">
                <strong>Ativo.</strong>{" "}
                {(qtdJogos ?? 0) > 0
                  ? `Você recebe por e-mail o resultado ${qtdJogos === 1 ? "do seu jogo salvo" : `dos seus ${qtdJogos} jogos salvos`} após cada sorteio.`
                  : "Salve um jogo para começar a receber o resultado dele por e-mail após cada sorteio."}{" "}
                <Link href="/conta/jogos">Ver jogos salvos</Link>
              </p>
            ) : (
              <p className="m-estado" data-tipo="bloqueado">
                <strong>Recurso Premium.</strong> Assinantes recebem por e-mail o resultado de cada jogo salvo
                após todo sorteio. <Link href="/premium">Conhecer o Premium</Link>
              </p>
            )}
          </div>
        </section>

        <section className="m-secao" aria-labelledby="alertas-celular">
          <div className="m-secao__intro">
            <h2 id="alertas-celular" className="m-secao__titulo">Notificações no celular</h2>
            <p className="m-secao__texto">Resultados, acúmulos e a conferência dos seus jogos direto no aparelho.</p>
          </div>
          <div className="m-secao__corpo m-secao__corpo--acoes">
            <Link href="/notificacoes" className="m-botao m-botao--secundario">
              Configurar notificações
            </Link>
            <Link href="/aplicativo" className="m-link">
              Instalar o aplicativo
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
