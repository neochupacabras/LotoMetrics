export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Dezenas from "@/components/Dezenas";
import { CabecalhoPagina } from "@/components/membros/MembrosShell";
import BotaoFavoritoLoteria from "@/components/membros/BotaoFavoritoLoteria";
import ResultadoConcurso from "@/components/membros/ResultadoConcurso";
import { IcSelo } from "@/components/membros/Icones";
import { getContaContexto } from "@/lib/conta/contexto";
import { carregarLoteriasFavoritas, carregarResumoLoterias, conferirJogoSalvo } from "@/lib/conta/loterias";
import { quandoSorteio } from "@/lib/conta/painel-regras";
import { CATEGORIAS, FERRAMENTAS, disponivelEm, type FerramentaLoteria } from "@/lib/ferramentas";
import { formatarData, formatarMoeda, isCodigoLoteriaValido, LOTERIAS, preposicaoLoteria } from "@/lib/format";
import { formatarMoedaCompacta } from "@/lib/resumo-concurso";
import { createClient } from "@/lib/supabase/server";

const MAX_JOGOS = 10;

const ROTULO_STATUS: Record<string, string> = {
  aberto: "Aberto",
  fechado: "Fechado",
  conferido: "Conferido",
};

export async function generateMetadata({ params }: { params: Promise<{ loteria: string }> }): Promise<Metadata> {
  const { loteria } = await params;
  const nome = isCodigoLoteriaValido(loteria) ? LOTERIAS[loteria].nome : "Loteria";
  return { title: `${nome} — LotoAnalítica`, robots: { index: false, follow: false } };
}

export default async function LoteriaMembroPage({ params }: { params: Promise<{ loteria: string }> }) {
  const { loteria } = await params;
  if (!isCodigoLoteriaValido(loteria)) notFound();
  const contexto = await getContaContexto();
  if (!contexto) redirect(`/entrar?next=/conta/loterias/${loteria}`);

  const supabase = await createClient();
  const [resumos, { disponivel, favoritas }, { data: jogos }, { data: boloes }] = await Promise.all([
    carregarResumoLoterias(),
    carregarLoteriasFavoritas(contexto.userId),
    supabase
      .from("user_games")
      .select("id, dezenas, label")
      .eq("user_id", contexto.userId)
      .eq("loteria", loteria)
      .eq("ativo", true)
      .order("created_at", { ascending: false })
      .limit(MAX_JOGOS),
    supabase
      .from("boloes")
      .select("id, titulo, status, qtd_cotas, concurso_alvo, alvo")
      .eq("owner_id", contexto.userId)
      .eq("loteria", loteria)
      .order("criado_em", { ascending: false })
      .limit(5),
  ]);

  const nome = LOTERIAS[loteria].nome;
  const { em } = preposicaoLoteria(loteria);
  const resumo = resumos.get(loteria);
  const concurso = resumo?.concurso;

  const ferramentas = FERRAMENTAS.filter((f): f is FerramentaLoteria => f.tipo === "loteria");
  const disponiveis = ferramentas.filter((f) => disponivelEm(f, loteria));
  const indisponiveis = ferramentas.filter((f) => !disponivelEm(f, loteria));
  const temBolao = disponiveis.some((f) => f.aba === "bolao");

  return (
    <>
      <CabecalhoPagina
        voltar={{ href: "/conta/loterias", rotulo: "Loterias" }}
        titulo={nome}
        descricao={
          concurso
            ? `Concurso ${concurso.numero}, sorteado em ${formatarData(concurso.dataSorteio)}.`
            : "O último resultado ainda não foi carregado."
        }
        acoes={
          <>
            {disponivel && <BotaoFavoritoLoteria codigo={loteria} nome={nome} favorita={favoritas.includes(loteria)} comRotulo />}
            <Link href={`/${loteria}/resultados`} className="m-botao m-botao--secundario">
              Resultados completos
            </Link>
          </>
        }
      />

      <div className="m-painel-grade m-painel-grade--loteria">
        {concurso && resumo && (
          <section className="m-modulo m-modulo--resultado" aria-labelledby="lot-resultado">
            <div className="m-modulo__cabecalho">
              <h2 id="lot-resultado" className="m-modulo__titulo">
                Último resultado
              </h2>
              <Link href={`/${loteria}/resultados/${concurso.numero}`} className="m-modulo__link">
                Detalhes <span aria-hidden>→</span>
              </Link>
            </div>
            <ResultadoConcurso codigo={loteria} concurso={concurso} />
            <p className="m-resultado__situacao">
              {concurso.acumulado ? "Ninguém acertou a faixa principal: o prêmio acumulou." : "Teve ganhador na faixa principal."}
            </p>
          </section>
        )}

        {resumo && (
          <section className="m-modulo m-modulo--proximo" aria-labelledby="lot-proximo">
            <div className="m-modulo__cabecalho">
              <h2 id="lot-proximo" className="m-modulo__titulo">
                Próximo concurso
              </h2>
            </div>
            <dl className="m-dados">
              <div>
                <dt>Prêmio estimado</dt>
                <dd className="m-numero">
                  {resumo.concurso.valorEstimadoProximo
                    ? formatarMoedaCompacta(resumo.concurso.valorEstimadoProximo)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt>Sorteio</dt>
                <dd>{quandoSorteio(new Date(resumo.proximoSorteioIso), new Date())}</dd>
              </div>
            </dl>
            <Link href={`/${loteria}/ao-vivo`} className="m-modulo__link">
              Acompanhar ao vivo <span aria-hidden>→</span>
            </Link>
          </section>
        )}

        <section className="m-modulo m-modulo--seus-jogos" aria-labelledby="lot-jogos">
          <div className="m-modulo__cabecalho">
            <h2 id="lot-jogos" className="m-modulo__titulo">
              Seus jogos {em} {nome}
            </h2>
            <Link href="/conta/jogos/novo" className="m-modulo__link">
              Adicionar <span aria-hidden>→</span>
            </Link>
          </div>
          {(jogos ?? []).length === 0 ? (
            <p className="m-vazio">
              Você ainda não salvou jogos {em} {nome}. Salve os números que você costuma jogar para vê-los conferidos
              aqui a cada concurso.
            </p>
          ) : (
            <ul className="m-lista">
              {(jogos ?? []).map((j) => {
                const conf = conferirJogoSalvo(loteria, j.dezenas as number[], concurso);
                return (
                  <li key={j.id} className="m-jogo">
                    {j.label && (
                      <div className="m-jogo__cabecalho">
                        <span className="m-jogo__label">{j.label}</span>
                      </div>
                    )}
                    {loteria === "supersete" ? (
                      <p className="m-numero">{(j.dezenas as number[]).join(" · ")}</p>
                    ) : (
                      <Dezenas dezenas={j.dezenas as number[]} tamanho="pequena" />
                    )}
                    {conf && (
                      <p className="m-jogo__resultado" data-premiado={conf.premiado}>
                        <span className="m-numero">
                          {conf.acertos} {conf.acertos === 1 ? "acerto" : "acertos"}
                        </span>{" "}
                        no concurso {conf.concurso}
                        {conf.sorteio && ` (${conf.sorteio})`}
                        {conf.premiado && (conf.premioReais ? ` · premiado: ${formatarMoeda(conf.premioReais)}` : " · faixa premiada")}
                        {conf.confirmarTrevos && " · confira os trevos no volante"}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {temBolao && (
          <section className="m-modulo m-modulo--seus-boloes" aria-labelledby="lot-boloes">
            <div className="m-modulo__cabecalho">
              <h2 id="lot-boloes" className="m-modulo__titulo">
                Bolões
              </h2>
              <Link href={`/${loteria}/bolao`} className="m-modulo__link">
                Montar <span aria-hidden>→</span>
              </Link>
            </div>
            {(boloes ?? []).length === 0 ? (
              <p className="m-vazio">Nenhum bolão {em} {nome} ainda.</p>
            ) : (
              <ul className="m-lista">
                {(boloes ?? []).map((b) => (
                  <li key={b.id}>
                    <Link href={`/conta/boloes/${b.id}`} className="m-novidade">
                      <span className="m-novidade__data">{ROTULO_STATUS[b.status] ?? b.status}</span>
                      <span className="m-novidade__textos">
                        <span className="m-novidade__titulo">{b.titulo}</span>
                        <span className="m-novidade__descricao">
                          {b.alvo === "virada" ? "Mega da Virada" : b.concurso_alvo ? `Concurso ${b.concurso_alvo}` : "Concurso a definir"} ·{" "}
                          {b.qtd_cotas} cotas
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      <section className="m-ferramentas-loteria" aria-labelledby="lot-ferramentas">
        <h2 id="lot-ferramentas" className="m-categoria__titulo m-ferramentas-loteria__titulo">
          Ferramentas {em} {nome}
        </h2>
        {CATEGORIAS.map((c) => {
          const daCategoria = disponiveis.filter((f) => f.categoria === c.id);
          if (daCategoria.length === 0) return null;
          return (
            <div key={c.id} className="m-categoria">
              <header className="m-categoria__cabecalho">
                <h3 className="m-categoria__titulo m-categoria__titulo--menor">{c.nome}</h3>
              </header>
              <ul className="m-lista">
                {daCategoria.map((f) => (
                  <li key={f.id} className="m-ferramenta">
                    <Link href={`/${loteria}/${f.aba}`} className="m-ferramenta__link">
                      <span className="m-ferramenta__nome">{f.nome}</span>
                      <span className="m-ferramenta__descricao">{f.descricao}</span>
                      {f.extraPremium && (
                        <span className="m-ferramenta__extra">
                          <IcSelo />
                          {contexto.isPremium ? "Incluído no seu plano: " : "Com Premium: "}
                          {f.extraPremium.charAt(0).toLowerCase() + f.extraPremium.slice(1)}
                        </span>
                      )}
                      <span className="m-ferramenta__seta" aria-hidden>
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {indisponiveis.length > 0 && (
          <p className="m-grupo-loterias__dica">
            Não existem {em} {nome}, porque a mecânica de aposta não se encaixa: {indisponiveis.map((f) => f.nome).join(", ")}.
          </p>
        )}
      </section>
    </>
  );
}
