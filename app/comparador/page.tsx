import Link from "next/link";
import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { LOTERIAS, formatarMoeda, formatarData } from "@/lib/format";
import { getLoteriaPorCodigo, getUltimoConcurso } from "@/lib/queries";
import { AGENDA, agoraBrasilia, proximoSorteio, DIAS_SEMANA } from "@/lib/calendario";
import type { CodigoLoteria } from "@/lib/types";

// Muda no máximo quando sai um novo resultado — mesma cadência das
// páginas de destaques/probabilidades por loteria.
export const revalidate = 300;

const TITULO = "Comparador de loterias — qual está com o maior prêmio agora";
const DESCRICAO =
  "As 9 loterias da Caixa lado a lado: prêmio estimado do próximo concurso, se acumulou e quando é o próximo sorteio de cada uma.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/comparador` },
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/comparador`,
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
    images: [`${SITE_URL}/opengraph-image`],
  },
};

interface LinhaComparador {
  codigo: CodigoLoteria;
  nome: string;
  numeroUltimo: number | null;
  acumulou: boolean;
  premioEstimado: number | null;
  proximoSorteio: Date;
}

async function montarLinhas(): Promise<LinhaComparador[]> {
  const agora = agoraBrasilia();

  const linhas = await Promise.all(
    Object.keys(LOTERIAS).map(async (codigo) => {
      const cod = codigo as CodigoLoteria;
      const loteria = await getLoteriaPorCodigo(cod);
      const ultimo = loteria ? await getUltimoConcurso(loteria.id) : null;

      return {
        codigo: cod,
        nome: LOTERIAS[cod].nome,
        numeroUltimo: ultimo?.numero ?? null,
        acumulou: ultimo?.acumulado ?? false,
        premioEstimado: ultimo?.valorEstimadoProximo ?? ultimo?.valorAcumuladoProximo ?? null,
        proximoSorteio: proximoSorteio(cod, agora),
      };
    })
  );

  // Maior prêmio primeiro — é o motivo principal de alguém visitar essa página.
  // Loterias sem valor conhecido (dado ainda não importado) vão pro final.
  return linhas.sort((a, b) => (b.premioEstimado ?? -1) - (a.premioEstimado ?? -1));
}

function formatarQuando(data: Date, agora: Date): string {
  const ehHoje = data.toDateString() === agora.toDateString();
  if (ehHoje) return "Hoje";
  const amanha = new Date(agora);
  amanha.setDate(amanha.getDate() + 1);
  if (data.toDateString() === amanha.toDateString()) return "Amanhã";
  return `${DIAS_SEMANA[data.getDay()]}, ${data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;
}

export default async function ComparadorPage() {
  const linhas = await montarLinhas();
  const agora = agoraBrasilia();
  const maiorPremio = linhas[0];

  return (
    <>
      <Masthead comparadorAtivo />
      <main className="container secao" style={{ maxWidth: 900 }}>
        <p className="eyebrow">Panorama das 9 loterias</p>
        <h1 className="titulo-edicao">Comparador de loterias</h1>
        <p className="subtitulo-edicao">
          Prêmio estimado do próximo concurso, se o último acumulou e quando é o
          próximo sorteio — as 9 loterias da Caixa numa tabela só.
        </p>

        {maiorPremio?.premioEstimado && (
          <div className="bloco" style={{ marginTop: 8, marginBottom: 28 }}>
            <p className="bloco__nota" style={{ margin: 0 }}>
              Maior prêmio estimado agora:{" "}
              <Link href={`/${maiorPremio.codigo}/resultados`} className="breadcrumb">
                <strong>{maiorPremio.nome}</strong>
              </Link>
              , com {formatarMoeda(maiorPremio.premioEstimado)} para o próximo concurso.
            </p>
          </div>
        )}

        <div className="tabela-scroll">
          <table className="tabela-dados">
            <thead>
              <tr>
                <th>Loteria</th>
                <th>Último concurso</th>
                <th className="num">Prêmio estimado</th>
                <th>Próximo sorteio</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.codigo}>
                  <td>
                    <Link href={`/${l.codigo}/resultados`} className="breadcrumb">
                      {l.nome}
                    </Link>
                  </td>
                  <td>
                    {l.numeroUltimo ? (
                      <>
                        #{l.numeroUltimo}{" "}
                        {l.acumulou && <span className="badge badge--acumulou">acumulou</span>}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="num" style={{ fontFamily: "var(--font-mono)" }}>
                    {l.premioEstimado ? formatarMoeda(l.premioEstimado) : "—"}
                  </td>
                  <td>{formatarQuando(l.proximoSorteio, agora)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="aviso-legal" style={{ marginTop: 24 }}>
          Os valores estimados são calculados pela Caixa antes do sorteio e podem
          variar até o fechamento das apostas. Nenhuma loteria "vale mais a pena"
          jogar por ter um prêmio maior — a probabilidade de ganhar não muda com o
          tamanho do acumulado. Veja o{" "}
          <Link href="/calendario" style={{ color: "var(--pine)" }}>
            calendário completo de sorteios
          </Link>{" "}
          para horários e dias da semana de cada loteria.
        </div>
      </main>
    </>
  );
}
