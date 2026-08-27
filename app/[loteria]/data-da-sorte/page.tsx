import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Subnav from "@/components/Subnav";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import GeradorDataClient from "@/components/GeradorDataClient";
import { getLoteriaPorCodigo } from "@/lib/queries";
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
    "/data-da-sorte",
    `Jogo da sorte da ${nome} — gerado a partir de uma data especial`,
    `Escolha uma data que signifique algo pra você e gere um jogo da ${nome} a partir dela — a mesma data sempre gera o mesmo jogo.`
  );
}

export default async function DataDaSortePage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) notFound();

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) notFound();

  const nomeLoteria = NOME_LOTERIA[codigoLoteria] ?? loteria.nome;

  if (codigoLoteria === "supersete") {
    return (
      <>
        <BreadcrumbJsonLd
          itens={[
            { nome: nomeLoteria, caminho: `/${codigoLoteria}/resultados` },
            { nome: "Data da sorte", caminho: `/${codigoLoteria}/data-da-sorte` },
          ]}
        />
        <Subnav codigoLoteria={codigoLoteria} ativa="data-da-sorte" />
        <div className="container secao">
          <p className="eyebrow">{loteria.nome}</p>
          <h1 className="titulo-edicao">Jogo da data especial</h1>
          <div className="ferramenta-explicacao" style={{ maxWidth: 680 }}>
            <h2 className="bloco__titulo">Por que não há essa ferramenta para {loteria.nome}</h2>
            <p>
              Essa ferramenta gera dezenas de um universo comum, como nas outras 8 loterias.
              A {loteria.nome} não se encaixa nesse modelo: cada uma das 7 colunas sorteia um
              dígito de 0 a 9 de forma independente.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <BreadcrumbJsonLd
        itens={[
          { nome: nomeLoteria, caminho: `/${codigoLoteria}/resultados` },
          { nome: "Data da sorte", caminho: `/${codigoLoteria}/data-da-sorte` },
        ]}
      />
      <Subnav codigoLoteria={codigoLoteria} ativa="data-da-sorte" />
      <div className="container secao">
        <p className="eyebrow">{loteria.nome}</p>
        <h1 className="titulo-edicao">Jogo da data especial</h1>
        <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
          Escolha uma data que signifique algo pra você — um aniversário, uma data
          comemorativa — e gere um jogo a partir dela.
        </p>

        <GeradorDataClient
          dezenaMin={loteria.dezenaMin}
          dezenaMax={loteria.dezenaMax}
          qtdDezenas={loteria.qtdDezenasSorteadas}
          usaTrevos={codigoLoteria === "maismilionaria"}
        />

        <div className="aviso-legal" style={{ marginTop: 28 }}>
          <strong>Isso não muda sua chance de ganhar.</strong> A data só define quais números
          aparecem — o mesmo jogo poderia ter saído de um sorteio totalmente aleatório, e tem
          exatamente a mesma probabilidade de qualquer outra combinação. É só uma forma
          memorável de escolher seus números, não uma estratégia. Veja também o{" "}
          <Link href="/dicas/numeros-populares" style={{ color: "var(--pine)" }}>
            artigo sobre números populares
          </Link>{" "}
          — datas de aniversário tendem a concentrar apostas nas dezenas de 1 a 31, o que pode
          significar dividir mais um prêmio, se ele sair.
        </div>
      </div>
    </>
  );
}
