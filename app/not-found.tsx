import Link from "next/link";
import Masthead from "@/components/Masthead";

export default function NotFound() {
  return (
    <>
      <Masthead />
      <main className="container secao">
        <p className="eyebrow">Não encontrado</p>
        <h1 className="titulo-edicao">Esse concurso ainda não foi sorteado.</h1>
        <p className="subtitulo-edicao">
          Ou a página que você procura simplesmente não existe. Volte para os resultados.
        </p>
        <Link href="/" style={{ fontFamily: "var(--font-mono)", color: "var(--pine)" }}>
          ← Voltar para a página inicial
        </Link>
      </main>
    </>
  );
}
