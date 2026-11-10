export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PortalStripeButton from "@/components/conta/PortalStripeButton";
import { CabecalhoPagina } from "@/components/membros/MembrosShell";
import { formatarDataLonga, getContaContexto } from "@/lib/conta/contexto";
import { carregarResumoAssinatura } from "@/lib/conta/assinatura";

export const metadata: Metadata = {
  title: "Minha assinatura — LotoAnalítica",
  robots: { index: false, follow: false },
};

export default async function AssinaturaPage() {
  const contexto = await getContaContexto();
  if (!contexto) redirect("/entrar?next=/conta/assinatura");
  const { isPremium, userId, email, premiumAte } = contexto;

  const resumo = await carregarResumoAssinatura(userId, isPremium, premiumAte);
  const viaCartao = resumo.origem === "stripe";

  return (
    <>
      <CabecalhoPagina
        titulo="Assinatura"
        descricao="Seu plano, a validade do acesso e como gerenciar o pagamento."
      />

      {!isPremium ? (
        <div className="conta-jogos-vazio">
          <p>Você não tem uma assinatura Premium ativa.</p>
          <Link href="/assinar" className="m-botao" style={{ marginTop: 16 }}>
            Ver planos
          </Link>
        </div>
      ) : (
        <div className="assinatura-card">
          <div className="assinatura-card__linha">
            <span className="assinatura-card__rotulo">Status</span>
            <span className="assinatura-card__valor assinatura-card__valor--destaque">
              {viaCartao ? resumo.status : "Premium ativo"}
            </span>
          </div>

          <div className="assinatura-card__linha">
            <span className="assinatura-card__rotulo">Forma de pagamento</span>
            <span className="assinatura-card__valor">
              {viaCartao ? "Cartão (renovação automática)" : "Pix (crédito avulso)"}
            </span>
          </div>

          {resumo.dataIso && resumo.rotuloData && (
            <div className="assinatura-card__linha">
              <span className="assinatura-card__rotulo">{resumo.rotuloData}</span>
              <span className="assinatura-card__valor">{formatarDataLonga(resumo.dataIso)}</span>
            </div>
          )}

          <div className="assinatura-card__linha">
            <span className="assinatura-card__rotulo">E-mail</span>
            <span className="assinatura-card__valor">{email}</span>
          </div>

          <div className="assinatura-card__acoes">
            {resumo.temClienteStripe && <PortalStripeButton />}
            {!viaCartao && (
              <Link href="/assinar" className="m-botao m-botao--secundario">
                Renovar ou estender
              </Link>
            )}
          </div>

          <p className="assinatura-card__nota">
            {viaCartao
              ? "Para cancelar, trocar de plano ou atualizar o cartão, use o portal de gerenciamento acima. O acesso Premium permanece ativo até o fim do período já pago."
              : "O Pix não renova sozinho: perto do vencimento, é só pagar um novo período — os dias são somados ao que ainda resta."}
          </p>
        </div>
      )}
    </>
  );
}
