import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProbabilidadesClient from "@/components/ProbabilidadesClient";
import { getLoteriaPorCodigo } from "@/lib/queries";
import { FAIXAS_PREMIADAS } from "@/lib/probabilidades";
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
    "/probabilidades",
    `Probabilidades reais da ${nome} — chance exata por faixa`,
    `As chances matemáticas exatas de cada faixa de premiação da ${nome}, calculadas por combinatória — a mesma chance em todo concurso, sem depender do histórico.`
  );
}

export default async function ProbabilidadesPage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;

  if (!isCodigoLoteriaValido(codigoLoteria)) {
    notFound();
  }

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) {
    notFound();
  }

  const faixasPremiadas = FAIXAS_PREMIADAS[codigoLoteria] ?? [];

  return (
    <div className="container secao">
      <p className="eyebrow">{loteria.nome}</p>
      <h1 className="titulo-edicao">Probabilidades reais</h1>
      <p className="subtitulo-edicao" style={{ maxWidth: 620 }}>
        As chances matemáticas exatas de cada faixa de premiação — calculadas por
        combinatória, sem depender de nenhum dado histórico. Isso não muda com
        frequência, atraso ou qualquer outra tabela estatística do site: é a mesma
        chance em todo concurso, sempre.
      </p>

      <ProbabilidadesClient
        dezenaMax={loteria.dezenaMax}
        qtdDezenasSorteadas={loteria.qtdDezenasSorteadas}
        qtdDezenasPadrao={loteria.qtdDezenasSorteadas}
        faixasPremiadas={faixasPremiadas}
      />

      <div className="aviso-legal">
        <strong>Por que mostrar isso:</strong> nenhuma tabela estatística do site —
        frequência, atraso, ciclos, ou qualquer filtro do gerador de jogos — altera os
        números acima. Eles vêm exclusivamente da quantidade de combinações possíveis,
        que é fixa. Apostar com mais dezenas melhora a chance (você pode comparar acima),
        mas custa proporcionalmente mais caro — e mesmo assim, a chance do prêmio
        principal continua extremamente baixa.
      </div>
    </div>
  );
}
