import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import { isCodigoLoteriaValido, preposicaoLoteria } from "@/lib/format";
import { NOME_LOTERIA } from "@/lib/seo";

// Destino dos links de confirmar e de descadastrar o aviso de jogo do
// simulador (app/api/alertas/*). Página de status, fora do índice.
export const metadata: Metadata = {
  title: "Aviso do seu jogo — LotoAnalítica",
  robots: { index: false, follow: false },
};

const TEXTOS: Record<string, { eyebrow: string; titulo: string; texto: (onde: string) => string }> = {
  confirmado: {
    eyebrow: "Aviso confirmado",
    titulo: "Pronto, seu aviso está ativo.",
    texto: (onde) =>
      `A cada sorteio${onde}, você recebe por e-mail a conferência do seu jogo. Para parar, use o link no fim de qualquer aviso.`,
  },
  descadastrado: {
    eyebrow: "Aviso cancelado",
    titulo: "Você não vai mais receber o aviso deste jogo.",
    texto: () => "Apagamos o pedido. Se quiser voltar a receber, é só simular o jogo de novo e pedir o aviso.",
  },
  expirado: {
    eyebrow: "Link expirado",
    titulo: "Este pedido de aviso não existe mais.",
    texto: () =>
      "Pedidos não confirmados em 7 dias são apagados, assim como os descadastrados. Simule o jogo de novo para pedir outro aviso.",
  },
  invalido: {
    eyebrow: "Link inválido",
    titulo: "Não conseguimos abrir este link.",
    texto: () => "Confira se o endereço veio completo do e-mail. Se o problema continuar, peça o aviso de novo no simulador.",
  },
};

export default async function AlertasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; loteria?: string }>;
}) {
  const { status, loteria } = await searchParams;
  const t = TEXTOS[status ?? ""] ?? TEXTOS.invalido;
  const codigo = loteria && isCodigoLoteriaValido(loteria) ? loteria : null;
  const onde = codigo ? ` ${preposicaoLoteria(codigo).em} ${NOME_LOTERIA[codigo] ?? codigo}` : "";

  return (
    <>
      <Masthead />
      <main className="container secao">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="titulo-edicao">{t.titulo}</h1>
        <p className="subtitulo-edicao">{t.texto(onde)}</p>
        <p>
          <Link href={codigo ? `/${codigo}/simulador` : "/"} className="botao-gerar">
            {codigo ? "Simular outro jogo" : "Voltar para o início"}
          </Link>
        </p>
      </main>
    </>
  );
}
