import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AcumulosClient from "@/components/AcumulosClient";
import Subnav from "@/components/Subnav";
import { getLoteriaPorCodigo, getAcumulos } from "@/lib/queries";
import { isCodigoLoteriaValido } from "@/lib/format";
import { NOME_LOTERIA, metadataPagina } from "@/lib/seo";

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
    "/acumulos",
    `Linha do tempo dos acúmulos — ${nome}`,
    `Todos os acúmulos da ${nome} em ordem cronológica — quais foram os mais longos, os maiores prêmios e como a distribuição muda ao longo da história da loteria.`
  );
}

export default async function AcumulosPage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;

  if (!isCodigoLoteriaValido(codigoLoteria)) notFound();

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) notFound();

  const acumulos = await getAcumulos(loteria.id);

  return (
    <>
      <Subnav codigoLoteria={codigoLoteria} ativa="acumulos" />
      <div className="container secao">
        <p className="eyebrow">Estatísticas de {loteria.nome}</p>
        <h1 className="titulo-edicao">Linha do tempo dos acúmulos</h1>
        <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
          Cada vez que um concurso fecha sem ganhador na faixa 1, o prêmio acumula. Aqui
          está o histórico completo de como isso aconteceu — quando, por quanto tempo, e
          quanto foi pago ao final de cada sequência.
        </p>

        <div className="ferramenta-explicacao" style={{ maxWidth: 680, marginBottom: 32 }}>
          <h2 className="bloco__titulo">O que é um acúmulo e como ele funciona</h2>
          <p>
            Um acúmulo ocorre quando nenhum apostador acerta todas as dezenas da faixa
            principal num concurso. Nesse caso, o valor que seria pago ao ganhador não
            desaparece — ele é somado ao fundo do próximo concurso, aumentando o prêmio
            disponível. O processo se repete enquanto não houver ganhador, o que pode
            resultar em prêmios muito maiores do que o concurso normal pagaria.
          </p>
          <p>
            A linha do tempo abaixo mostra todos os acúmulos já registrados no histórico
            da {loteria.nome} — quando cada sequência de acúmulo começou, quantos
            concursos durou e qual foi o prêmio pago ao final. É possível ver claramente
            os momentos em que o prêmio cresceu por vários concursos seguidos e os
            concursos que finalmente foram ganhos.
          </p>
          <p>
            Um ponto importante: acúmulos longos não significam que "o prêmio está
            próximo de ser ganho". Cada concurso é independente dos anteriores — a
            probabilidade de haver um ganhador é sempre a mesma, independente de quantos
            concursos já acumularam. Um acúmulo de 10 concursos não torna o 11º mais
            provável de ter ganhador do que um concurso sem histórico de acúmulo.
          </p>
          <p>
            Para entender os detalhes de como os prêmios são calculados a partir da
            arrecadação e dos acúmulos, veja o artigo sobre{" "}
            <a href={`/${codigoLoteria}/dicas/como-os-premios-sao-calculados`} className="breadcrumb">
              como os prêmios são calculados
            </a>.
          </p>
        </div>

        <AcumulosClient
          acumulos={acumulos}
          nomeLoteria={loteria.nome}
          codigoLoteria={codigoLoteria}
        />

        <div className="aviso-legal" style={{ marginTop: "32px" }}>
          Dados históricos oficiais. Padrões de acúmulo passados não preveem
          comportamento futuro — cada sorteio é independente dos anteriores.
        </div>
      </div>
    </>
  );
}
