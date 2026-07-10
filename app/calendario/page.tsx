import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import {
  AGENDA,
  DIAS_SEMANA,
  DIAS_SEMANA_ABREV,
  agoraBrasilia,
  getAgendaOrdenadaPorProximoSorteio,
  nomeLoteria,
} from "@/lib/calendario";

export const dynamic = "force-dynamic";

const TITULO = "Calendário de sorteios — dias e horários de cada loteria";
const DESCRICAO =
  "Quais loterias da Caixa sorteiam em cada dia da semana, horário de cada sorteio e quando é o próximo concurso de cada uma — Lotofácil, Mega-Sena, Quina e mais.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/calendario` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/calendario`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

function formatarData(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function CalendarioPage() {
  const agora = agoraBrasilia();
  const diaSemanaHoje = agora.getDay();
  const agendaOrdenada = getAgendaOrdenadaPorProximoSorteio(agora);

  return (
    <>
      <Masthead />
      <main className="container secao" style={{ maxWidth: 900 }}>
        <p className="eyebrow">Referência</p>
        <h1 className="titulo-edicao">Calendário de sorteios</h1>
        <p className="subtitulo-edicao">
          Quais loterias sorteiam em cada dia da semana, a que horas, e quando
          é o próximo concurso de cada uma. Todos os horários são de Brasília.
        </p>

        {/* Grade semanal */}
        <div className="tabela-scroll" style={{ marginTop: 28 }}>
          <table className="tabela-dados calendario-grade">
            <thead>
              <tr>
                <th>Loteria</th>
                {DIAS_SEMANA_ABREV.map((d, i) => (
                  <th
                    key={d}
                    className={`num ${i === diaSemanaHoje ? "calendario-grade__hoje" : ""}`}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AGENDA.map((a) => (
                <tr key={a.codigo}>
                  <td>
                    <Link href={`/${a.codigo}/resultados`} className="breadcrumb">
                      {nomeLoteria(a.codigo)}
                    </Link>
                  </td>
                  {DIAS_SEMANA_ABREV.map((_, i) => (
                    <td
                      key={i}
                      className={`num ${i === diaSemanaHoje ? "calendario-grade__hoje" : ""}`}
                    >
                      {a.dias.includes(i) ? (
                        <span className="calendario-grade__ponto" title={`Sorteio às ${a.horario}`} />
                      ) : (
                        "—"
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: "0.82rem", color: "var(--ink-faint)", marginTop: 8 }}>
          Coluna destacada = hoje ({DIAS_SEMANA[diaSemanaHoje]}). Nenhuma loteria
          sorteia aos domingos.
        </p>

        {/* Próximos sorteios */}
        <h2 className="bloco__titulo" style={{ marginTop: 40 }}>
          Próximos sorteios
        </h2>
        <div className="calendario-lista">
          {agendaOrdenada.map((a) => {
            const ehHoje = a.proxima.toDateString() === agora.toDateString();
            return (
              <Link
                key={a.codigo}
                href={`/${a.codigo}/resultados`}
                className="calendario-item"
              >
                <span className="calendario-item__loteria">{nomeLoteria(a.codigo)}</span>
                <span className="calendario-item__quando">
                  {ehHoje ? "Hoje" : DIAS_SEMANA[a.proxima.getDay()]}, {formatarData(a.proxima)}
                  {" · "}
                  {a.horario}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="bloco" style={{ marginTop: 40 }}>
          <p className="bloco__titulo" style={{ marginBottom: 12 }}>
            Sobre os horários
          </p>
          <p>
            Os horários acima são os de início do sorteio, no horário de
            Brasília. As apostas costumam fechar entre 1 e 2 horas antes do
            sorteio — o horário exato pode variar por loteria e por canal
            (casa lotérica ou aplicativo). Feriados e datas especiais (como a
            Mega da Virada ou a Lotofácil da Independência) também podem
            alterar essa grade temporariamente.
          </p>
          <p style={{ marginTop: 8 }}>
            Para confirmar o horário exato de fechamento das apostas antes de
            jogar, consulte sempre o site oficial{" "}
            <Link href="https://loterias.caixa.gov.br" className="breadcrumb">
              loterias.caixa.gov.br
            </Link>
            . Veja também nossas{" "}
            <Link href="/perguntas-frequentes" className="breadcrumb">
              perguntas frequentes
            </Link>{" "}
            sobre como apostar e resgatar prêmios.
          </p>
        </div>
      </main>
    </>
  );
}
