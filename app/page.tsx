import Link from "next/link";
import Masthead from "@/components/Masthead";

export default function HomePage() {
  return (
    <>
      <Masthead />
      <main className="container secao">
        <p className="eyebrow">Bem-vindo</p>
        <h1 className="titulo-edicao">Resultados e estatísticas, sem enrolação.</h1>
        <p className="subtitulo-edicao" style={{ maxWidth: 560 }}>
          Acompanhe os resultados oficiais e explore o comportamento histórico das
          dezenas de Lotofácil e Mega-Sena.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginTop: "32px",
          }}
        >
          <Link
            href="/lotofacil/resultados"
            style={{
              display: "block",
              padding: "24px",
              border: "1px solid var(--line-strong)",
              borderRadius: "4px",
              textDecoration: "none",
              background: "var(--paper-raised)",
            }}
          >
            <div className="eyebrow">Lotofácil</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}>
              Ver resultados →
            </div>
          </Link>

          <Link
            href="/megasena/resultados"
            style={{
              display: "block",
              padding: "24px",
              border: "1px solid var(--line-strong)",
              borderRadius: "4px",
              textDecoration: "none",
              background: "var(--paper-raised)",
            }}
          >
            <div className="eyebrow">Mega-Sena</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}>
              Ver resultados →
            </div>
          </Link>

          <Link
            href="/dicas"
            style={{
              display: "block",
              padding: "24px",
              border: "1px solid var(--line-strong)",
              borderRadius: "4px",
              textDecoration: "none",
              background: "var(--paper-raised)",
            }}
          >
            <div className="eyebrow">Guia</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem" }}>
              Dicas e estratégias →
            </div>
          </Link>
        </div>

        <div className="aviso-legal" style={{ marginTop: "40px" }}>
          <strong>Aviso:</strong> esta plataforma oferece análises estatísticas e
          probabilísticas com base em resultados históricos oficiais. Loterias são
          jogos de sorteio aleatório e nenhum método estatístico garante ou aumenta a
          probabilidade de premiação.
        </div>
      </main>
    </>
  );
}
