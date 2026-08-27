import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Subnav from "@/components/Subnav";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import Dezenas from "@/components/Dezenas";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { getCoberturaTrincas } from "@/lib/estatisticas";
import { isCodigoLoteriaValido } from "@/lib/format";
import { NOME_LOTERIA, metadataPagina } from "@/lib/seo";

// A cobertura só muda quando sai um concurso novo — 1x por dia no máximo.
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ loteria: string }>;
}): Promise<Metadata> {
  const { loteria: codigoLoteria } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) return {};
  const nome = NOME_LOTERIA[codigoLoteria] ?? codigoLoteria;
  return metadataPagina(
    codigoLoteria,
    "/ineditas",
    `Combinações inéditas da ${nome} — trincas que nunca saíram juntas`,
    `De todas as trincas de dezenas possíveis na ${nome}, quantas já saíram juntas em algum concurso — e uma amostra das que nunca saíram.`
  );
}

export default async function IneditasPage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) notFound();

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) notFound();

  const nomeLoteria = NOME_LOTERIA[codigoLoteria] ?? loteria.nome;

  // Super Sete não tem "trincas de dezenas" — mecânica de colunas
  // independentes de 0 a 9, não de escolher dezenas de um universo comum.
  if (codigoLoteria === "supersete") {
    return (
      <>
        <BreadcrumbJsonLd
          itens={[
            { nome: nomeLoteria, caminho: `/${codigoLoteria}/resultados` },
            { nome: "Inéditas", caminho: `/${codigoLoteria}/ineditas` },
          ]}
        />
        <Subnav codigoLoteria={codigoLoteria} ativa="ineditas" />
        <div className="container secao">
          <p className="eyebrow">{loteria.nome}</p>
          <h1 className="titulo-edicao">Combinações inéditas</h1>
          <div className="ferramenta-explicacao" style={{ maxWidth: 680 }}>
            <h2 className="bloco__titulo">Por que não há essa ferramenta para {loteria.nome}</h2>
            <p>
              "Trincas inéditas" depende de escolher dezenas de um universo comum, como nas
              outras 8 loterias. A {loteria.nome} não se encaixa nesse modelo: cada uma das 7
              colunas sorteia um dígito de 0 a 9 de forma independente — o mesmo dígito pode
              se repetir em colunas diferentes, então o conceito de "combinação de dezenas
              que nunca saiu junta" não se aplica da mesma forma.
            </p>
          </div>
        </div>
      </>
    );
  }

  const cobertura = await getCoberturaTrincas(loteria.id, loteria.dezenaMin, loteria.dezenaMax);

  return (
    <>
      <BreadcrumbJsonLd
        itens={[
          { nome: nomeLoteria, caminho: `/${codigoLoteria}/resultados` },
          { nome: "Inéditas", caminho: `/${codigoLoteria}/ineditas` },
        ]}
      />
      <Subnav codigoLoteria={codigoLoteria} ativa="ineditas" />
      <div className="container secao">
        <p className="eyebrow">Estatísticas de {loteria.nome}</p>
        <h1 className="titulo-edicao">Combinações inéditas</h1>
        <p className="subtitulo-edicao" style={{ maxWidth: 640 }}>
          De todas as trincas de dezenas possíveis, quantas já saíram juntas em
          algum concurso — e quais nunca saíram.
        </p>

        <div className="bloco" style={{ marginTop: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "2.6rem",
                fontWeight: 700,
                color: "var(--pine)",
              }}
            >
              {cobertura.percentualCobertura}%
            </span>
            <span style={{ color: "var(--ink-soft)" }}>
              das {cobertura.totalPossiveis.toLocaleString("pt-BR")} trincas possíveis já
              saíram juntas pelo menos uma vez
            </span>
          </div>
          <p className="bloco__nota" style={{ margin: 0 }}>
            {cobertura.totalNuncaSairam === 0 ? (
              <>
                Com {cobertura.totalPossiveis.toLocaleString("pt-BR")} trincas possíveis e a
                quantidade de dezenas sorteadas por concurso na {loteria.nome}, o histórico já
                é longo o suficiente para ter coberto todas elas — não sobrou nenhuma trinca
                inédita.
              </>
            ) : (
              <>
                Ainda restam{" "}
                <strong>{cobertura.totalNuncaSairam.toLocaleString("pt-BR")}</strong> trincas
                que nunca apareceram juntas num mesmo concurso.
              </>
            )}
          </p>
        </div>

        {cobertura.amostraNuncaSairam.length > 0 && (
          <>
            <h2 className="bloco__titulo" style={{ marginTop: 32 }}>
              Uma amostra das trincas inéditas
            </h2>
            <p className="bloco__nota">
              {cobertura.amostraNuncaSairam.length} de {cobertura.totalNuncaSairam.toLocaleString("pt-BR")}{" "}
              — embaralhada a cada visita.
            </p>
            <div className="lista-jogos-gerados">
              {cobertura.amostraNuncaSairam.map((trinca, i) => (
                <div key={i} className="jogo-gerado">
                  <Dezenas dezenas={trinca} tamanho="pequena" />
                </div>
              ))}
            </div>
          </>
        )}

        <div className="aviso-legal" style={{ marginTop: 28 }}>
          Uma trinca "inédita" não tem mais nem menos chance de sair no próximo
          concurso do que uma trinca que já saiu 50 vezes — cada sorteio é
          independente dos anteriores. Isso é só uma curiosidade sobre o
          histórico, não uma previsão.
        </div>
      </div>
    </>
  );
}
