export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PortalStripeButton from "@/components/conta/PortalStripeButton";
import { CabecalhoPagina } from "@/components/membros/MembrosShell";
import { IcSelo } from "@/components/membros/Icones";
import { formatarDataCurta, formatarDataLonga, getContaContexto } from "@/lib/conta/contexto";
import { carregarResumoAssinatura, type ResumoAssinatura } from "@/lib/conta/assinatura";
import { carregarLoteriasFavoritas } from "@/lib/conta/loterias";
import { BENEFICIOS_PREMIUM } from "@/lib/conta/beneficios";
import { PLANOS_PIX } from "@/lib/mercadopago/planos";
import { formatarMoeda } from "@/lib/format";
import type { CodigoLoteria } from "@/lib/types";

export const metadata: Metadata = {
  title: "Assinatura — LotoAnalítica",
  robots: { index: false, follow: false },
};

function mesAno(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
}

export default async function AssinaturaPage() {
  const contexto = await getContaContexto();
  if (!contexto) redirect("/entrar?next=/conta/assinatura");
  const { isPremium, userId, email, premiumAte } = contexto;

  const [resumo, { favoritas }] = await Promise.all([
    carregarResumoAssinatura(userId, isPremium, premiumAte),
    carregarLoteriasFavoritas(userId),
  ]);
  // Loteria em que os atalhos "Usar" abrem: a primeira favorita.
  const loteria: CodigoLoteria = favoritas[0] ?? "megasena";

  return (
    <>
      <CabecalhoPagina
        titulo="Assinatura"
        descricao={
          isPremium
            ? "Seu plano, a validade do acesso, o que está incluído e onde usar cada recurso."
            : "Seu plano atual e o que muda com o Premium."
        }
      />

      {isPremium ? <CartaoPremium resumo={resumo} email={email} /> : <CartaoGratuito resumo={resumo} />}

      <section className="m-beneficios" aria-labelledby="beneficios-titulo">
        <h2 id="beneficios-titulo" className="m-secao__titulo">
          {isPremium ? "Incluído no seu plano" : "O que o Premium acrescenta"}
        </h2>
        <p className="m-secao__texto">
          {isPremium
            ? "Além de tudo o que é gratuito: resultados, estatísticas, jogos salvos, alertas de acúmulo e bolões."
            : "Tudo o que você já usa continua gratuito. O Premium soma estes recursos."}
        </p>
        <div className="m-beneficios__grupos">
          {BENEFICIOS_PREMIUM.map((g) => (
            <div key={g.titulo} className="m-beneficios__grupo">
              <h3 className="m-sobretitulo">{g.titulo}</h3>
              <ul className="m-lista">
                {g.itens.map((b) => {
                  const onde = b.onde?.(loteria);
                  return (
                    <li key={b.id} className="m-beneficio">
                      <span className="m-beneficio__textos">
                        <span className="m-beneficio__nome">{b.nome}</span>
                        <span className="m-beneficio__detalhe">{b.detalhe}</span>
                      </span>
                      {isPremium &&
                        (onde ? (
                          <Link href={onde.href} className="m-modulo__link m-beneficio__usar">
                            {onde.rotulo} <span aria-hidden>→</span>
                          </Link>
                        ) : (
                          <span className="m-beneficio__auto">Automático</span>
                        ))}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {resumo.pagamentosPix.length > 0 && <HistoricoPix pagamentos={resumo.pagamentosPix} temStripe={resumo.temClienteStripe} />}
    </>
  );
}

function CartaoPremium({ resumo, email }: { resumo: ResumoAssinatura; email: string }) {
  const viaCartao = resumo.origem === "stripe";
  return (
    <section className="m-plano-cartao" data-premium="true" aria-labelledby="plano-titulo">
      <div className="m-plano-cartao__topo">
        <p className="m-plano__nome m-plano__nome--premium">
          <IcSelo /> Premium{resumo.periodicidade ? ` · ${resumo.periodicidade}` : ""}
        </p>
        <h2 id="plano-titulo" className="m-plano-cartao__titulo">
          {resumo.pendente
            ? "Pagamento pendente"
            : resumo.dataIso && resumo.rotuloData
              ? `${resumo.rotuloData === "Próxima renovação" ? "Renova em" : "Ativo até"} ${formatarDataLonga(resumo.dataIso)}`
              : "Assinatura ativa"}
        </h2>
      </div>

      {resumo.pendente && (
        <p className="m-estado" data-tipo="bloqueado">
          O último pagamento do cartão não foi aprovado. Atualize a forma de pagamento no portal para não perder o acesso.
        </p>
      )}

      <dl className="m-dados">
        <div>
          <dt>Forma de pagamento</dt>
          <dd>{viaCartao ? "Cartão, com renovação automática" : "Pix, crédito avulso (não renova sozinho)"}</dd>
        </div>
        {viaCartao && (
          <div>
            <dt>Situação</dt>
            <dd>{resumo.status}</dd>
          </div>
        )}
        {resumo.assinanteDesde && (
          <div>
            <dt>Assinante desde</dt>
            <dd>{mesAno(resumo.assinanteDesde)}</dd>
          </div>
        )}
        <div>
          <dt>Conta</dt>
          <dd>{email}</dd>
        </div>
      </dl>

      <div className="m-plano-cartao__acoes">
        {resumo.temClienteStripe && <PortalStripeButton />}
        {!viaCartao && (
          <Link href="/assinar" className="m-botao m-botao--secundario">
            Estender o acesso
          </Link>
        )}
      </div>

      <p className="m-plano-cartao__nota">
        {viaCartao
          ? "Cancelar, trocar de plano ou atualizar o cartão é feito no portal de pagamento. Se cancelar, o acesso continua até o fim do período já pago."
          : "Perto do vencimento, pague um novo período por Pix: os dias se somam ao que ainda resta."}
      </p>
    </section>
  );
}

function CartaoGratuito({ resumo }: { resumo: ResumoAssinatura }) {
  const { mensal, anual } = PLANOS_PIX;
  return (
    <section className="m-plano-cartao" aria-labelledby="plano-titulo">
      <div className="m-plano-cartao__topo">
        <p className="m-plano__nome">Plano gratuito</p>
        <h2 id="plano-titulo" className="m-plano-cartao__titulo">
          {resumo.premiumTerminouEm
            ? `Seu acesso Premium terminou em ${formatarDataLonga(resumo.premiumTerminouEm)}`
            : "Resultados, estatísticas e jogos salvos, sem custo"}
        </h2>
      </div>
      <p className="m-plano-cartao__nota">
        O Premium custa {formatarMoeda(mensal.amount)} por mês ou {formatarMoeda(anual.amount)} por ano, no cartão (renovação
        automática) ou no Pix (sem renovação).
      </p>
      <div className="m-plano-cartao__acoes">
        <Link href="/assinar" className="m-botao m-botao--secundario">
          {resumo.premiumTerminouEm ? "Voltar ao Premium" : "Ver planos"}
        </Link>
      </div>
    </section>
  );
}

function HistoricoPix({ pagamentos, temStripe }: { pagamentos: ResumoAssinatura["pagamentosPix"]; temStripe: boolean }) {
  return (
    <section className="m-historico" aria-labelledby="historico-titulo">
      <h2 id="historico-titulo" className="m-secao__titulo">
        Pagamentos por Pix
      </h2>
      <p className="m-secao__texto">
        Os 12 mais recentes.{temStripe ? " As cobranças no cartão ficam no portal de pagamento." : ""}
      </p>
      <div className="tabela-scroll">
        <table className="m-tabela">
          <thead>
            <tr>
              <th scope="col">Data</th>
              <th scope="col">Item</th>
              <th scope="col" className="num">
                Valor
              </th>
              <th scope="col">Situação</th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.map((p) => (
              <tr key={p.id}>
                <td className="m-numero">{formatarDataCurta(p.criadoEm)}</td>
                <td>{p.descricao}</td>
                <td className="num m-numero">{formatarMoeda(p.valorCents / 100)}</td>
                <td>
                  <span className="m-etiqueta" data-aprovado={p.aprovado}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
