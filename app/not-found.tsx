import Link from "next/link";
import Masthead from "@/components/Masthead";

export default function NotFound() {
  return (
    <>
      <Masthead />
      <main className="container secao">
        <p className="eyebrow">Não encontrado</p>
        <h1 className="titulo-edicao">Essa página não existe.</h1>
        <p className="subtitulo-edicao">
          Pode ser um link quebrado, um concurso que ainda não foi sorteado, ou um
          endereço digitado errado. Volte para a página inicial.
        </p>
        <Link href="/" style={{ fontFamily: "var(--font-mono)", color: "var(--pine)" }}>
          ← Voltar para a página inicial
        </Link>
      </main>
    </>
  );
}
