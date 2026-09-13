import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";

export const metadata: Metadata = {
  title: "Cancelar e-mails — LotoAnalítica",
  robots: { index: false, follow: false },
};

const MENSAGENS: Record<string, { titulo: string; texto: string }> = {
  ok: {
    titulo: "Você não vai mais receber nossos e-mails",
    texto:
      "Isso não afeta seus jogos salvos nem sua assinatura Premium — só os e-mails de resultado, alerta e relatório. Você pode reativar quando quiser em Minha conta.",
  },
  erro: {
    titulo: "Não conseguimos processar seu pedido",
    texto: "Tente novamente pelo link do e-mail, ou acesse sua conta para desativar manualmente.",
  },
  invalido: {
    titulo: "Link inválido ou expirado",
    texto: "Acesse sua conta para gerenciar suas preferências de e-mail.",
  },
};

export default async function DescadastrarPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { titulo, texto } = MENSAGENS[status ?? "invalido"] ?? MENSAGENS.invalido;

  return (
    <>
      <Masthead />
      <main className="container secao">
        <div className="dica-article" style={{ maxWidth: 560 }}>
          <p className="eyebrow">LotoAnalítica</p>
          <h1 className="titulo-edicao">{titulo}</h1>
          <p className="subtitulo-edicao">{texto}</p>
          <p>
            <Link href="/conta" className="botao-gerar">Ir para minha conta →</Link>
          </p>
        </div>
      </main>
    </>
  );
}
