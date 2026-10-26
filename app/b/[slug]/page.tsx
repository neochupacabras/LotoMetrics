export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Masthead from "@/components/Masthead";
import Dezenas from "@/components/Dezenas";
import AvisoBolaoForm from "@/components/AvisoBolaoForm";
import TelemetriaBeacon from "@/components/TelemetriaBeacon";
import { getBolaoPublico } from "@/lib/bolao-publico";
import { NOME_LOTERIA } from "@/lib/seo";

// Página pública do bolão: abre sem login, é compartilhada por link no
// WhatsApp e nunca deve ser indexada (o slug aleatório é a única
// "autorização"; ver supabase/migrations/20261027000000_boloes.sql).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bolao = await getBolaoPublico(slug);
  const robots = { index: false, follow: false };
  if (!bolao) return { title: "Bolão — LotoAnalítica", robots };
  return {
    title: `${bolao.titulo} — bolão ${NOME_LOTERIA[bolao.loteria] ?? bolao.loteria}`,
    description: `Acompanhe os jogos, as cotas e os pagamentos do bolão "${bolao.titulo}".`,
    robots,
  };
}

function moeda(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const ROTULO_STATUS: Record<string, string> = {
  aberto: "Aberto para entrada",
  fechado: "Fechado — aguardando o sorteio",
  conferido: "Conferido",
};

export default async function BolaoPublicoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bolao = await getBolaoPublico(slug);
  if (!bolao) notFound();

  const nomeLoteria = NOME_LOTERIA[bolao.loteria] ?? bolao.loteria;
  const atribuidas = bolao.participantes.reduce((s, p) => s + p.cotas, 0);
  const pagas = bolao.participantes.filter((p) => p.pago).reduce((s, p) => s + p.cotas, 0);
  const concursoTxt =
    bolao.alvo === "virada"
      ? "Mega da Virada"
      : bolao.concursoAlvo
        ? `Concurso ${bolao.concursoAlvo}`
        : "Concurso a definir";

  return (
    <>
      <Masthead />
      <TelemetriaBeacon eventName="bolao_public_view" tool="bolao" lottery={bolao.loteria} />
      <main className="container secao bolao-publico">
        <p className="eyebrow">
          {nomeLoteria} · {concursoTxt}
        </p>
        <h1 className="titulo-edicao">{bolao.titulo}</h1>
        <p className="subtitulo-edicao">
          {ROTULO_STATUS[bolao.status] ?? bolao.status} · {bolao.qtdCotas} cotas de{" "}
          {moeda(bolao.valorCotaCents)}
        </p>

        {bolao.resultados.length > 0 && (
          <section className="bloco">
            <h2 className="bloco__titulo">Resultado</h2>
            {bolao.resultados.map((r) => {
              const melhor = r.acertosPorJogo.length ? Math.max(...r.acertosPorJogo) : 0;
              return (
                <div key={r.concurso} className="transicao-resumo">
                  <div className="transicao-resumo__item">
                    <p className="analise-cartao__rotulo">Concurso {r.concurso} · melhor jogo</p>
                    <p className="transicao-resumo__valor">{melhor} acertos</p>
                  </div>
                  <div className="transicao-resumo__item">
                    <p className="analise-cartao__rotulo">Prêmio total do bolão</p>
                    <p className="transicao-resumo__valor">{moeda(r.premioTotalCents)}</p>
                  </div>
                  <div className="transicao-resumo__item">
                    <p className="analise-cartao__rotulo">Por cota (bruto)</p>
                    <p className="transicao-resumo__valor">{moeda(r.porCotaCents)}</p>
                  </div>
                </div>
              );
            })}
            <p className="bloco__nota">
              Valores brutos, antes do imposto de renda retido na fonte. Confira sempre o resultado
              oficial da Caixa.
            </p>
          </section>
        )}

        <section className="bloco">
          <h2 className="bloco__titulo">Participantes</h2>
          <p className="bloco__nota">
            {pagas} de {bolao.qtdCotas} cotas pagas · {atribuidas} atribuídas.
          </p>
          {bolao.participantes.length === 0 ? (
            <p className="bloco__nota">O organizador ainda não cadastrou participantes.</p>
          ) : (
            <div className="tabela-scroll">
              <table className="tabela-dados">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th className="num">Cotas</th>
                    <th className="num">Valor</th>
                    <th>Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {bolao.participantes.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nome}</td>
                      <td className="num">{p.cotas}</td>
                      <td className="num">{moeda(p.cotas * bolao.valorCotaCents)}</td>
                      <td>{p.pago ? "Pago" : "Pendente"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {bolao.status !== "conferido" && (
            <AvisoBolaoForm
              slug={bolao.slug}
              participantes={bolao.participantes
                .filter((p) => p.semEmail)
                .map((p) => ({ id: p.id, nome: p.nome }))}
            />
          )}
        </section>

        <section className="bloco">
          <h2 className="bloco__titulo">Jogos ({bolao.jogos.length})</h2>
          <p className="bloco__nota">
            Pool de {bolao.poolDezenas.length} dezenas. Se pelo menos {bolao.garantia} delas
            estiverem entre as sorteadas, ao menos um jogo marca {bolao.garantia} pontos.
          </p>
          <Dezenas dezenas={bolao.poolDezenas} tamanho="pequena" />
          {bolao.jogos.map((j, i) => (
            <div key={i} className="fechamento-ticket">
              <span className="fechamento-ticket__numero">#{i + 1}</span>
              <Dezenas dezenas={j} tamanho="pequena" wrapperClassName="ledger__dezenas" />
            </div>
          ))}
        </section>

        <div className="aviso-legal">
          Esta página só organiza o grupo: o LotoAnalítica não vende apostas, não recebe pagamentos do
          bolão e não tem vínculo com a Caixa. Os pagamentos mostrados são o registro feito pelo
          organizador.
        </div>

        <div className="bolao-salvar">
          <h2 className="bolao-salvar__titulo">Vai organizar o bolão do seu grupo?</h2>
          <p className="bloco__nota">
            Monte os jogos pelo orçamento do grupo e gere um link como este, grátis.
          </p>
          <Link href={`/${bolao.loteria}/bolao`} className="botao-gerar">
            Organizar o meu bolão →
          </Link>
        </div>
      </main>
    </>
  );
}
