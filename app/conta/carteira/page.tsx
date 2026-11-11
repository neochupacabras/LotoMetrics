export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatarDezena } from "@/lib/format";
import { AbasPagina, CabecalhoPagina, RecursoBloqueado } from "@/components/membros/MembrosShell";
import { createClient } from "@/lib/supabase/server";
import { getContaContexto } from "@/lib/conta/contexto";
import { ABAS_DESEMPENHO } from "@/lib/conta/navegacao";
import { calcularCarteira } from "@/lib/carteira";
import TetoGastoForm from "@/components/conta/TetoGastoForm";

export const metadata: Metadata = {
  title: "Carteira do apostador — LotoAnalítica",
  robots: { index: false, follow: false },
};

// "positivo" | "negativo" | "zero" — a cor do saldo (zero fica neutro).
function sinal(v: number): "positivo" | "negativo" | "zero" {
  return v > 0 ? "positivo" : v < 0 ? "negativo" : "zero";
}

function formatarMoeda(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function CarteiraPage() {
  const contexto = await getContaContexto();
  if (!contexto) redirect("/entrar?next=/conta/carteira");
  const { isPremium, userId } = contexto;

  const supabase = await createClient();
  const [{ data: profile }, { data: jogosRaw }] = await Promise.all([
    supabase.from("profiles").select("teto_gasto_mensal").eq("id", userId).single(),
    supabase
      .from("user_games")
      .select("id, loteria, dezenas, label, ativo, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const jogos = jogosRaw ?? [];

  return (
    <>
        <CabecalhoPagina
          titulo="Desempenho"
          descricao="Quanto você teria gasto e ganho com seus jogos salvos, desde que salvou cada um."
        />
        <AbasPagina rotulo="Desempenho" abas={ABAS_DESEMPENHO} ativa="/conta/carteira" />

        {!isPremium ? (
          <RecursoBloqueado titulo="Carteira do apostador">
            O saldo real dos seus jogos salvos — gasto, prêmios e saldo de cada combinação desde que
            você a salvou, com os rateios históricos oficiais.
          </RecursoBloqueado>
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
            tetoAtual={profile?.teto_gasto_mensal ?? null}
          />
        )}
    </>
  );
}

async function CarteiraConteudo({
  jogosSalvos,
  tetoAtual,
}: {
  jogosSalvos: Parameters<typeof calcularCarteira>[0];
  tetoAtual: number | null;
}) {
  const carteira = await calcularCarteira(jogosSalvos);

  return (
    <>
      <TetoGastoForm tetoAtual={tetoAtual} gastoMesAtual={carteira.gastoMesAtual} />

      {/* Cor só para o saldo (positivo/negativo); gasto e ganho em tinta
          — antes os três usavam a terracota/ferrugem do site público, e um
          saldo zero aparecia em vermelho. */}
      <dl className="m-indicadores">
        <div className="m-indicador">
          <dt className="m-indicador__rotulo">Total gasto</dt>
          <dd className="m-indicador__valor">{formatarMoeda(carteira.totalGasto)}</dd>
        </div>
        <div className="m-indicador">
          <dt className="m-indicador__rotulo">Total ganho</dt>
          <dd className="m-indicador__valor">{formatarMoeda(carteira.totalGanho)}</dd>
        </div>
        <div className="m-indicador">
          <dt className="m-indicador__rotulo">Saldo</dt>
          <dd className="m-indicador__valor" data-sinal={sinal(carteira.saldoGeral)}>
            {formatarMoeda(carteira.saldoGeral)}
          </dd>
        </div>
      </dl>

      {carteira.temJogoNaoCalculavel && (
        <p className="bloco__nota" style={{ marginTop: 12 }}>
          Jogos da +Milionária mostram só o gasto: o ganho depende dos trevos, que não ficam
          salvos junto com o jogo — só as dezenas.
        </p>
      )}

      <h2 className="m-secao__titulo" style={{ marginTop: 36 }}>Por jogo</h2>
      <div className="tabela-scroll">
        <table className="m-tabela m-tabela--carteira">
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
                    <span className="m-tabela__dezenas">
                      {j.dezenas.map((d) => (j.loteria === "supersete" ? String(d) : formatarDezena(d))).join(" ")}
                    </span>
                    <span className="m-tabela__sub">
                      {j.label ?? ""}
                      {!j.ativo && <span className="m-etiqueta">pausado</span>}
                    </span>
                  </td>
                  <td>{j.nomeLoteria}</td>
                  <td className="num m-numero">{j.concursosAcompanhados}</td>
                  <td className="num m-numero">{formatarMoeda(j.gasto)}</td>
                  <td className="num m-numero">{j.ganho === null ? "—" : formatarMoeda(j.ganho)}</td>
                  <td className="num m-numero" data-sinal={saldo === null ? undefined : sinal(saldo)}>
                    {saldo === null ? "—" : formatarMoeda(saldo)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="aviso-legal" style={{ marginTop: 28 }}>
        Esses valores mostram o que teria acontecido se você tivesse jogado cada combinação em
        todo concurso desde que a salvou, usando os prêmios históricos reais. Isso não muda a
        chance de ganhar no próximo sorteio — cada concurso é independente dos anteriores.
      </div>
    </>
  );
}
