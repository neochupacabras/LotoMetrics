import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import Dezenas from "@/components/Dezenas";
import { IcSelo } from "@/components/membros/Icones";
import { formatarDataCurta, formatarDataLonga, getContaContexto } from "@/lib/conta/contexto";
import { carregarPainel, type DadosPainel } from "@/lib/conta/painel";
import { atalhosRapidos, quandoSorteio } from "@/lib/conta/painel-regras";
import { carregarResumoAssinatura, type ResumoAssinatura } from "@/lib/conta/assinatura";
import { NOVIDADES } from "@/lib/conta/novidades";
import { formatarMoedaCompacta } from "@/lib/resumo-concurso";
import { formatarMoeda, LOTERIAS } from "@/lib/format";

export const metadata: Metadata = {
  title: "Painel — LotoAnalítica",
  robots: { index: false, follow: false },
};

// Painel da área de membros: centro de controle pessoal. Cada módulo usa só
// dado real (ver lib/conta/painel.ts); sem dado, estado vazio útil.
export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const contexto = await getContaContexto();
  if (!contexto) redirect("/entrar?next=/conta");
  const { checkout } = await searchParams;

  const [dados, assinatura] = await Promise.all([
    carregarPainel(contexto.userId),
    carregarResumoAssinatura(contexto.userId, contexto.isPremium, contexto.premiumAte),
  ]);

  const primeiroNome = contexto.nome.split(" ")[0];

  return (
    <>
      {checkout === "sucesso" && (
        <p className="m-aviso" data-tipo="ok" role="status">
          Assinatura confirmada. Bem-vindo ao Premium — todos os recursos já estão liberados.
        </p>
      )}

      <header className="m-saudacao">
        <p className="m-sobretitulo">{dados.dataHoje}</p>
        <h1 className="m-saudacao__titulo">
          {dados.saudacao}, {primeiroNome}
        </h1>
        {dados.linhaDoDia && <p className="m-saudacao__linha">{dados.linhaDoDia}</p>}
      </header>

      <div className="m-painel-grade">
        <ModuloLoterias dados={dados} />
        <ModuloAcessoRapido loteria={dados.loteriaContexto} />
        <ModuloJogos dados={dados} />
        <ModuloAssinatura resumo={assinatura} />
        <ModuloNovidades />
        <ModuloAtividade dados={dados} />
      </div>
    </>
  );
}

function CabecalhoModulo({ id, titulo, link }: { id: string; titulo: string; link?: { href: string; rotulo: string } }) {
  return (
    <div className="m-modulo__cabecalho">
      <h2 id={id} className="m-modulo__titulo">
        {titulo}
      </h2>
      {link && (
        <Link href={link.href} className="m-modulo__link">
          {link.rotulo} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}

function dataCurtaConcurso(dataSql: string): string {
  const [ano, mes, dia] = dataSql.slice(0, 10).split("-");
  return ano && mes && dia ? `${dia}/${mes}` : "";
}

function ModuloLoterias({ dados }: { dados: DadosPainel }) {
  return (
    <section className="m-modulo m-modulo--loterias" aria-labelledby="painel-loterias">
      <CabecalhoModulo
        id="painel-loterias"
        titulo="Próximos sorteios"
        link={{ href: "/conta/loterias", rotulo: "Todas" }}
      />
      {dados.loterias.length === 0 ? (
        <p className="m-vazio">Os resultados ainda não foram carregados. Tente de novo em instantes.</p>
      ) : (
        <ul className="m-lista">
          {dados.loterias.map((l) => (
            <li key={l.codigo}>
              <Link href={`/conta/loterias/${l.codigo}`} className="m-loteria">
                <span className="m-loteria__nome">
                  <span>
                    {l.nome}
                    {l.favorita && <span className="m-sr"> (favorita)</span>}
                    {l.favorita && <IcSelo className="m-loteria__favorita" />}
                  </span>
                  <span className="m-loteria__meta">
                    Concurso {l.concurso} · {dataCurtaConcurso(l.dataSorteio)}
                    {l.jogosSalvos > 0 && ` · ${l.jogosSalvos} ${l.jogosSalvos === 1 ? "jogo salvo" : "jogos salvos"}`}
                  </span>
                </span>
                <span className="m-loteria__premio">
                  <span className="m-loteria__rotulo">{l.acumulou ? "Acumulou · próximo prêmio" : "Próximo prêmio"}</span>
                  <span className="m-numero">{l.premioEstimado ? formatarMoedaCompacta(l.premioEstimado) : "—"}</span>
                </span>
                <span className="m-loteria__sorteio">
                  <span className="m-loteria__rotulo">Sorteio</span>
                  <span>{quandoSorteio(new Date(l.proximoSorteioIso), new Date())}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ModuloAcessoRapido({ loteria }: { loteria: DadosPainel["loteriaContexto"] }) {
  return (
    <section className="m-modulo m-modulo--rapido" aria-labelledby="painel-rapido">
      <CabecalhoModulo id="painel-rapido" titulo="Acesso rápido" link={{ href: "/conta/ferramentas", rotulo: "Todas" }} />
      <p className="m-modulo__contexto">{LOTERIAS[loteria].nome}</p>
      <ul className="m-atalhos">
        {atalhosRapidos(loteria).map((a) => (
          <li key={a.href}>
            <Link href={a.href} className="m-atalho">
              <span className="m-atalho__titulo">{a.titulo}</span>
              <span className="m-atalho__descricao">{a.descricao}</span>
              <span className="m-atalho__seta" aria-hidden>
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ModuloJogos({ dados }: { dados: DadosPainel }) {
  return (
    <section className="m-modulo m-modulo--jogos" aria-labelledby="painel-jogos">
      <CabecalhoModulo
        id="painel-jogos"
        titulo="Seus jogos no último sorteio"
        link={dados.totalJogos > 0 ? { href: "/conta/jogos", rotulo: `Todos (${dados.totalJogos})` } : undefined}
      />
      {dados.jogos.length === 0 ? (
        <div className="m-vazio m-vazio--acao">
          <p>
            Salve os números que você costuma jogar: a cada sorteio, mostramos aqui quantos acertos eles
            fizeram.
          </p>
          <Link href="/conta/jogos/novo" className="m-botao m-botao--secundario">
            Salvar meu primeiro jogo
          </Link>
        </div>
      ) : (
        <ul className="m-lista">
          {dados.jogos.map((j) => (
            <li key={j.id} className="m-jogo">
              <div className="m-jogo__cabecalho">
                <span className="m-jogo__loteria">{j.nome}</span>
                {j.label && <span className="m-jogo__label">{j.label}</span>}
              </div>
              <Dezenas dezenas={j.dezenas} tamanho="pequena" />
              {j.conferencia ? (
                <p className="m-jogo__resultado" data-premiado={j.conferencia.premiado}>
                  <span className="m-numero">
                    {j.conferencia.acertos} {j.conferencia.acertos === 1 ? "acerto" : "acertos"}
                  </span>{" "}
                  no concurso {j.conferencia.concurso}
                  {j.conferencia.sorteio && ` (${j.conferencia.sorteio})`}
                  {j.conferencia.premiado &&
                    (j.conferencia.premioReais
                      ? ` · premiado: ${formatarMoeda(j.conferencia.premioReais)}`
                      : " · faixa premiada")}
                  {j.conferencia.confirmarTrevos && " · confira os trevos no volante"}
                </p>
              ) : (
                <p className="m-jogo__resultado">Sem concurso recente para conferir.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ModuloAssinatura({ resumo }: { resumo: ResumoAssinatura }) {
  if (!resumo.origem) {
    return (
      <section className="m-modulo m-modulo--assinatura" aria-labelledby="painel-assinatura">
        <CabecalhoModulo id="painel-assinatura" titulo="Seu plano" />
        <p className="m-plano__nome">Gratuito</p>
        <p className="m-plano__texto">
          Jogos salvos, alertas de acúmulo e bolões estão incluídos. O Premium acrescenta a conferência
          automática por e-mail, a Carteira, o histórico completo do simulador e navegação sem anúncios.
        </p>
        <Link href="/premium" className="m-modulo__link">
          Conhecer o Premium <span aria-hidden>→</span>
        </Link>
      </section>
    );
  }

  return (
    <section className="m-modulo m-modulo--assinatura" data-premium="true" aria-labelledby="painel-assinatura">
      <CabecalhoModulo id="painel-assinatura" titulo="Seu plano" />
      <p className="m-plano__nome m-plano__nome--premium">
        <IcSelo /> Premium
      </p>
      <dl className="m-dados m-dados--compacto">
        <div>
          <dt>Pagamento</dt>
          <dd>{resumo.origem === "stripe" ? "Cartão, renovação automática" : "Pix, crédito avulso"}</dd>
        </div>
        {resumo.dataIso && resumo.rotuloData && (
          <div>
            <dt>{resumo.rotuloData}</dt>
            <dd title={formatarDataLonga(resumo.dataIso)}>{formatarDataCurta(resumo.dataIso)}</dd>
          </div>
        )}
      </dl>
      {resumo.pendente && (
        <p className="m-estado" data-tipo="bloqueado">
          O último pagamento do cartão não foi aprovado. Atualize a forma de pagamento para não perder o acesso.
        </p>
      )}
      <Link href="/conta/assinatura" className="m-modulo__link">
        Gerenciar assinatura <span aria-hidden>→</span>
      </Link>
    </section>
  );
}

function dataCurtaNovidade(iso: string): string {
  const [, mes, dia] = iso.split("-");
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${Number(dia)} ${meses[Number(mes) - 1]}`;
}

function ModuloNovidades() {
  return (
    <section className="m-modulo m-modulo--novidades" aria-labelledby="painel-novidades">
      <CabecalhoModulo id="painel-novidades" titulo="Novidades" />
      <ul className="m-lista">
        {NOVIDADES.slice(0, 4).map((n) => (
          <li key={n.titulo}>
            <Link href={n.href} className="m-novidade">
              <span className="m-novidade__data">{dataCurtaNovidade(n.data)}</span>
              <span className="m-novidade__textos">
                <span className="m-novidade__titulo">{n.titulo}</span>
                <span className="m-novidade__descricao">{n.descricao}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ModuloAtividade({ dados }: { dados: DadosPainel }) {
  return (
    <section className="m-modulo m-modulo--atividade" aria-labelledby="painel-atividade">
      <CabecalhoModulo id="painel-atividade" titulo="Atividade recente" />
      {dados.atividade.length === 0 ? (
        <p className="m-vazio">Seus jogos salvos e bolões criados aparecem aqui.</p>
      ) : (
        <ol className="m-linha-tempo">
          {dados.atividade.map((a) => (
            <li key={`${a.tipo}-${a.quando}-${a.texto}`}>
              <time dateTime={a.quando} className="m-linha-tempo__data">
                {formatarDataCurta(a.quando)}
              </time>
              <Link href={a.href} className="m-linha-tempo__texto">
                {a.texto}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
