export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import Dezenas from "@/components/Dezenas";
import { createClient } from "@/lib/supabase/server";
import { calcularIsPremium } from "@/lib/plano";
import { calcularCarteira } from "@/lib/carteira";
import { intervaloDoAno, loteriaMaisJogada, maiorPremioIndividual } from "@/lib/retrospectiva";

export const metadata: Metadata = {
  title: "Meu ano na loteria — LotoAnalítica",
  robots: { index: false, follow: false },
};

function formatarMoeda(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function MeuAnoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/conta/meu-ano");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();
  const isPremium = calcularIsPremium(profile);

  const { data: jogosRaw } = await supabase
    .from("user_games")
    .select("id, loteria, dezenas, label, ativo, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const jogos = jogosRaw ?? [];
  const ano = new Date().getFullYear();

  return (
    <>
      <Masthead />
      <main className="conta-page container">
        <div className="conta-header">
          <div>
            <Link href="/conta" className="conta-voltar">← Minha conta</Link>
            <h1 className="conta-titulo">Meu ano na loteria — {ano}</h1>
            <p className="conta-email">
              Um resumo do que você teria gasto e ganho em {ano}, com os jogos que salvou.
            </p>
          </div>
        </div>

        {!isPremium ? (
          <div className="conta-alerta-free">
            <p>
              O Meu ano na loteria é um recurso{" "}
              <Link href="/assinar" className="conta-alerta-free__link">Premium</Link>.
              Assine para ver a sua retrospectiva do ano.
            </p>
          </div>
        ) : jogos.length === 0 ? (
          <div className="conta-jogos-vazio">
            <p>Você ainda não tem jogos salvos.</p>
            <p className="conta-jogos-dica">
              Salve suas combinações fixas pra começar a montar a sua retrospectiva.
            </p>
            <Link href="/conta/jogos/novo" className="botao-gerar">
              Salvar meu primeiro jogo →
            </Link>
          </div>
        ) : (
          <MeuAnoConteudo jogosSalvos={jogos.map((j) => ({
            id: j.id,
            loteria: j.loteria,
            dezenas: j.dezenas as number[],
            label: j.label ?? null,
            ativo: j.ativo,
            createdAt: j.created_at as string,
          }))} ano={ano} />
        )}
      </main>
    </>
  );
}

async function MeuAnoConteudo({
  jogosSalvos,
  ano,
}: {
  jogosSalvos: Parameters<typeof calcularCarteira>[0];
  ano: number;
}) {
  const agora = new Date();
  const anoEmAndamento = ano === agora.getFullYear();
  const intervaloDatas = intervaloDoAno(ano, anoEmAndamento ? agora : undefined);

  const carteira = await calcularCarteira(jogosSalvos, { intervaloDatas });

  if (carteira.jogos.every((j) => j.concursosAcompanhados === 0)) {
    return (
      <div className="conta-jogos-vazio" style={{ marginTop: 20 }}>
        <p>Ainda não há concursos de {ano} pra mostrar na sua retrospectiva.</p>
        <p className="conta-jogos-dica">
          Volte aqui depois do primeiro sorteio do ano com seus jogos salvos.
        </p>
      </div>
    );
  }

  const destaqueLoteria = loteriaMaisJogada(carteira.jogos);
  const destaquePremio = maiorPremioIndividual(carteira.jogos);
  const totalConcursos = carteira.jogos.reduce((s, j) => s + j.concursosAcompanhados, 0);

  return (
    <>
      {anoEmAndamento && (
        <p className="bloco__nota" style={{ marginTop: 12 }}>
          O ano de {ano} ainda não acabou — estes números cobrem até hoje.
        </p>
      )}

      <div className="transicao-resumo" style={{ marginTop: 20 }}>
        <div className="transicao-resumo__item">
          <p className="analise-cartao__rotulo">Total gasto</p>
          <p className="transicao-resumo__valor" style={{ color: "var(--rust)" }}>
            {formatarMoeda(carteira.totalGasto)}
          </p>
        </div>
        <div className="transicao-resumo__item">
          <p className="analise-cartao__rotulo">Total ganho</p>
          <p className="transicao-resumo__valor" style={{ color: "var(--pine)" }}>
            {formatarMoeda(carteira.totalGanho)}
          </p>
        </div>
        <div className="transicao-resumo__item">
          <p className="analise-cartao__rotulo">Saldo do ano</p>
          <p
            className="transicao-resumo__valor"
            style={{ color: carteira.saldoGeral >= 0 ? "var(--pine)" : "var(--rust)" }}
          >
            {formatarMoeda(carteira.saldoGeral)}
          </p>
        </div>
      </div>

      <p className="bloco__nota" style={{ marginTop: 12 }}>
        Ao todo, você acompanhou {totalConcursos} concurso{totalConcursos !== 1 ? "s" : ""} em {ano}.
      </p>

      <div className="retrospectiva-destaques">
        {destaqueLoteria && (
          <div className="retrospectiva-card">
            <p className="retrospectiva-card__rotulo">Sua loteria do ano</p>
            <p className="retrospectiva-card__valor">{destaqueLoteria.nomeLoteria}</p>
            <p className="retrospectiva-card__nota">
              {destaqueLoteria.quantidadeJogos} jogo{destaqueLoteria.quantidadeJogos !== 1 ? "s" : ""} salvo{destaqueLoteria.quantidadeJogos !== 1 ? "s" : ""} nela
            </p>
          </div>
        )}

        <div className="retrospectiva-card">
          <p className="retrospectiva-card__rotulo">Maior prêmio do ano</p>
          {destaquePremio ? (
            <>
              <p className="retrospectiva-card__valor" style={{ color: "var(--pine)" }}>
                {formatarMoeda(destaquePremio.ganho ?? 0)}
              </p>
              <div style={{ marginTop: 8 }}>
                <Dezenas dezenas={destaquePremio.dezenas} tamanho="pequena" />
              </div>
              {destaquePremio.label && (
                <p className="retrospectiva-card__nota">{`"${destaquePremio.label}"`}</p>
              )}
            </>
          ) : (
            <p className="retrospectiva-card__nota" style={{ marginTop: 8 }}>
              Nenhum prêmio simulado em {ano} — ainda.
            </p>
          )}
        </div>
      </div>

      {carteira.temJogoNaoCalculavel && (
        <p className="bloco__nota" style={{ marginTop: 20 }}>
          Jogos da +Milionária entram só no gasto: o ganho depende dos trevos, que não ficam
          salvos junto com o jogo.
        </p>
      )}

      <div className="aviso-legal" style={{ marginTop: 24 }}>
        Esses valores mostram o que teria acontecido se você tivesse jogado cada combinação salva
        em todo concurso de {ano}, usando os prêmios históricos reais — o site não processa apostas
        reais. Veja o detalhe jogo a jogo na{" "}
        <Link href="/conta/carteira" style={{ color: "var(--pine)" }}>Carteira do apostador</Link>.
      </div>
    </>
  );
}
