import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BolaoClient from "@/components/BolaoClient";
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
    "/bolao",
    `Otimizador de bolão ${nome} — planos por orçamento`,
    `Organize um bolão de ${nome} com fechamento de dezenas: diga o orçamento do grupo e o sistema gera os bilhetes em PDF pronto pra compartilhar.`
  );
}

export default async function BolaoPage({
  params,
}: {
  params: Promise<{ loteria: string }>;
}) {
  const { loteria: codigoLoteria } = await params;
  if (!isCodigoLoteriaValido(codigoLoteria)) notFound();

  const loteria = await getLoteriaPorCodigo(codigoLoteria);
  if (!loteria) notFound();

  return (
    <div className="container secao">
      <p className="eyebrow">{loteria.nome}</p>
      <h1 className="titulo-edicao">Otimizador de bolão</h1>

      <div style={{ maxWidth: 660 }}>
        <p className="subtitulo-edicao">
          Para quem joga em grupo: diga quanto o grupo quer gastar e o sistema
          organiza os bilhetes usando fechamento de dezenas — um conjunto de jogos
          arranjados para que, se as dezenas escolhidas aparecerem no sorteio, pelo
          menos um bilhete capture uma boa pontuação.
        </p>
        <p className="subtitulo-edicao">
          No final, gera um PDF completo para compartilhar com o grupo, com todos
          os bilhetes e o valor por participante.
        </p>
      </div>

      <div className="ferramenta-explicacao" style={{ maxWidth: 680, marginBottom: 32 }}>
        <h2 className="bloco__titulo">Como montar um bolão com fechamento</h2>
        <p>
          Um bolão com fechamento funciona assim: o grupo escolhe um conjunto maior de
          dezenas ("o pool") — por exemplo, 18 dezenas que o grupo acredita serem boas
          candidatas para o próximo sorteio. O sistema então gera um conjunto de bilhetes
          que cobre esse pool de forma sistemática, garantindo que se as dezenas sorteadas
          estiverem dentro do pool, pelo menos um bilhete vai capturar uma boa pontuação.
        </p>
        <p>
          A vantagem em relação a jogar bilhetes avulsos é a cobertura: ao invés de
          vários bilhetes com dezenas sobrepostas por acaso, o fechamento distribui as
          combinações de forma a não deixar "buracos" na cobertura do pool. Em um bolão
          bem configurado, se 15 das 18 dezenas do pool aparecerem no sorteio, pelo menos
          um bilhete acerta 15 pontos.
        </p>
        <p>
          O otimizador abaixo gera planos de bolão por orçamento: diga quanto o grupo
          quer gastar, escolha as dezenas do pool e o sistema seleciona o fechamento mais
          eficiente para aquele orçamento — com o maior nível de cobertura possível pelo
          valor disponível. No final, um PDF com todos os bilhetes pode ser gerado para
          compartilhar com os participantes.
        </p>
        <p>
          Para entender a fundo como funciona o fechamento e o que ele pode e não pode
          fazer, veja o{" "}
          <a href={`/${codigoLoteria}/dicas/fechamento`} className="breadcrumb">
            artigo explicativo sobre fechamentos
          </a>.
        </p>
      </div>

      <BolaoClient
        codigoLoteria={codigoLoteria}
        nomeLoteria={loteria.nome}
        dezenaMin={loteria.dezenaMin}
        dezenaMax={loteria.dezenaMax}
      />

      <div className="aviso-legal">
        <strong>O que é o fechamento usado aqui:</strong> uma forma de organizar os
        bilhetes do grupo para que, se as dezenas escolhidas estiverem entre as
        sorteadas, pelo menos um bilhete capture uma boa pontuação. Isso é diferente
        de "aumentar a chance de ganhar" — a probabilidade de qualquer dezena ser
        sorteada é sempre a mesma para todo mundo, independente do sistema usado.
        <br /><br />
        Se quiser entender o funcionamento do fechamento com mais detalhes, veja a
        aba <strong>Fechamentos</strong> ou o{" "}
        <a href="/dicas/fechamento" style={{ color: "var(--pine)" }}>
          artigo explicativo
        </a>.
      </div>
    </div>
  );
}
