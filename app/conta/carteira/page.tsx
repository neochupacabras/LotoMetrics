export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import Dezenas from "@/components/Dezenas";
import { createClient } from "@/lib/supabase/server";
import { calcularIsPremium } from "@/lib/plano";
import { calcularCarteira } from "@/lib/carteira";

export const metadata: Metadata = {
  title: "Carteira do apostador — LotoAnalítica",
  robots: { index: false, follow: false },
};

function formatarMoeda(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function CarteiraPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/conta/carteira");

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

  return (
    <>
      <Masthead />
      <main className="conta-page container">
        <div className="conta-header">
          <div>
            <Link href="/conta" className="conta-voltar">← Minha conta</Link>
            <h1 className="conta-titulo">Carteira do apostador</h1>
            <p className="conta-email">
              Quanto você teria gasto e ganho com seus jogos salvos, desde que salvou cada um.
            </p>
          </div>
        </div>

        {!isPremium ? (
          <div className="conta-alerta-free">
            <p>
              A Carteira do apostador é um recurso{" "}
              <Link href="/assinar" className="conta-alerta-free__link">Premium</Link>.
              Assine para ver o saldo real dos seus jogos salvos.
            </p>
          </div>
        ) : jogos.length === 0 ? (
          <div className="conta-jogos-vazio">
            <p>Você ainda não tem jogos salvos.</p>
            <p className="conta-jogos-dica">
              Salve suas combinações fixas pra começar a acompanhar o saldo delas.
            </p>
            <Link href="/conta/jogos/novo" className="botao-gerar">
              Salvar meu primeiro jogo →
            </Link>
          </div>
        ) : (
          <CarteiraConteudo
            jogosSalvos={jogos.map((j) => ({
              id: j.id,
              loteria: j.loteria,
              dezenas: j.dezenas as number[],
              label: j.label ?? null,
              ativo: j.ativo,
              createdAt: j.created_at as string,
            }))}
          />
        )}
      </main>
    </>
  );
}

async function CarteiraConteudo({
  jogosSalvos,
}: {
  jogosSalvos: Parameters<typeof calcularCarteira>[0];
}) {
  const carteira = await calcularCarteira(jogosSalvos);

  return (
    <>
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
          <p className="analise-cartao__rotulo">Saldo</p>
          <p
            className="transicao-resumo__valor"
            style={{ color: carteira.saldoGeral >= 0 ? "var(--pine)" : "var(--rust)" }}
          >
            {formatarMoeda(carteira.saldoGeral)}
          </p>
        </div>
      </div>

      {carteira.temJogoNaoCalculavel && (
        <p className="bloco__nota" style={{ marginTop: 12 }}>
          Jogos da +Milionária mostram só o gasto: o ganho depende dos trevos, que não ficam
          salvos junto com o jogo — só as dezenas.
        </p>
      )}

      <h2 className="bloco__titulo" style={{ marginTop: 32 }}>Por jogo</h2>
      <div className="tabela-scroll">
        <table className="tabela-dados">
          <thead>
            <tr>
              <th>Jogo</th>
              <th>Loteria</th>
              <th className="num">Concursos</th>
              <th className="num">Gasto</th>
              <th className="num">Ganho</th>
              <th className="num">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {carteira.jogos.map((j) => {
              const saldo = j.ganho === null ? null : j.ganho - j.gasto;
              return (
                <tr key={j.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Dezenas dezenas={j.dezenas} tamanho="pequena" />
                      {!j.ativo && <span className="badge">pausado</span>}
                    </div>
                    {j.label && <div style={{ fontSize: "0.78rem", color: "var(--ink-faint)" }}>{j.label}</div>}
                  </td>
                  <td>{j.nomeLoteria}</td>
                  <td className="num" style={{ fontFamily: "var(--font-mono)" }}>{j.concursosAcompanhados}</td>
                  <td className="num" style={{ fontFamily: "var(--font-mono)" }}>{formatarMoeda(j.gasto)}</td>
                  <td className="num" style={{ fontFamily: "var(--font-mono)" }}>
                    {j.ganho === null ? "—" : formatarMoeda(j.ganho)}
                  </td>
                  <td
                    className="num"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: saldo === null ? "var(--ink-faint)" : saldo >= 0 ? "var(--pine)" : "var(--rust)",
                    }}
                  >
                    {saldo === null ? "—" : formatarMoeda(saldo)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="aviso-legal" style={{ marginTop: 24 }}>
        Esses valores mostram o que teria acontecido se você tivesse jogado cada combinação em
        todo concurso desde que a salvou, usando os prêmios históricos reais. Isso não muda a
        chance de ganhar no próximo sorteio — cada concurso é independente dos anteriores.
      </div>
    </>
  );
}
