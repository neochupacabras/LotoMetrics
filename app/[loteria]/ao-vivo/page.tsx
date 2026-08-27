import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Subnav from "@/components/Subnav";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import AoVivoClient from "@/components/AoVivoClient";
import { getLoteriaPorCodigo, getUltimoConcurso } from "@/lib/queries";
import { isCodigoLoteriaValido, formatarData } from "@/lib/format";
import { NOME_LOTERIA, metadataPagina } from "@/lib/seo";
import { agoraBrasilia, dataHoraProximoSorteio, AGENDA } from "@/lib/calendario";
import type { CodigoLoteria } from "@/lib/types";

// A contagem em si roda no cliente — o servidor só precisa saber o horário
// alvo e o último concurso conhecido, e isso muda no máximo 1x por dia.
export const revalidate = 300;

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
    "/ao-vivo",
    `Sorteio da ${nome} ao vivo — contagem regressiva`,
    `Quanto falta para o próximo sorteio da ${nome}, e o resultado assim que sai — sem precisar recarregar a página.`
  );
}

export default async function AoVivoPage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) notFound();

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) notFound();

  const ultimoConcurso = await getUltimoConcurso(loteria.id);
  const nomeLoteria = NOME_LOTERIA[codigoLoteria] ?? loteria.nome;
  const agenda = AGENDA.find((a) => a.codigo === codigoLoteria);
  const alvo = dataHoraProximoSorteio(codigoLoteria as CodigoLoteria, agoraBrasilia());

  return (
    <>
      <BreadcrumbJsonLd
        itens={[
          { nome: nomeLoteria, caminho: `/${codigoLoteria}/resultados` },
          { nome: "Ao vivo", caminho: `/${codigoLoteria}/ao-vivo` },
        ]}
      />
      <Subnav codigoLoteria={codigoLoteria} ativa="ao-vivo" />
      <div className="container secao">
        <p className="eyebrow">{loteria.nome}</p>
        <h1 className="titulo-edicao">Sorteio ao vivo</h1>
        <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
          Contagem regressiva para o próximo sorteio, com o resultado aparecendo aqui
          automaticamente assim que sai — sem precisar recarregar a página.
        </p>

        <AoVivoClient
          codigoLoteria={codigoLoteria}
          nomeLoteria={loteria.nome}
          dataHoraSorteioIso={alvo.toISOString()}
          numeroUltimoConhecido={ultimoConcurso?.numero ?? 0}
        />

        {ultimoConcurso && (
          <p className="bloco__nota" style={{ marginTop: 20 }}>
            Último resultado conhecido: concurso {ultimoConcurso.numero}, sorteado em{" "}
            {formatarData(ultimoConcurso.dataSorteio)}.
          </p>
        )}

        <div className="aviso-legal" style={{ marginTop: 24 }}>
          {agenda && (
            <>
              A {loteria.nome} sorteia às {agenda.horario} (horário de Brasília). Consulte o{" "}
            </>
          )}
          <a href="/calendario" style={{ color: "var(--pine)" }}>calendário completo</a> para
          os dias da semana de cada loteria. Nenhuma contagem regressiva muda a probabilidade
          do sorteio — é só uma forma prática de acompanhar.
        </div>
      </div>
    </>
  );
}
