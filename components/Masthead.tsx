import Link from "next/link";
import { CodigoLoteria } from "@/lib/types";
import { LOTERIAS } from "@/lib/format";
import UserMenu from "@/components/auth/UserMenu";

export default function Masthead({
  loteriaAtiva,
  dicasAtiva,
  analisesAtiva,
  quizAtivo,
  premiumAtivo,
}: {
  loteriaAtiva?: CodigoLoteria;
  dicasAtiva?: boolean;
  analisesAtiva?: boolean;
  quizAtivo?: boolean;
  premiumAtivo?: boolean;
}) {
  return (
    <header className="masthead">
      <div className="container masthead__inner">
        <div>
          <Link href="/" className="masthead__title">
            Loto<span>Analítica</span>
          </Link>
          <div className="masthead__tagline">Resultados &amp; estatísticas de loteria</div>
        </div>

        <nav className="nav-loterias">
          {Object.values(LOTERIAS).map((l) => (
            <Link
              key={l.slug}
              href={`/${l.slug}/resultados`}
              data-ativo={loteriaAtiva === l.slug}
            >
              {l.nome}
            </Link>
          ))}
          <Link href="/dicas" data-ativo={dicasAtiva}>
            Dicas
          </Link>
          <Link href="/analises" data-ativo={analisesAtiva}>
            Análises
          </Link>
          <Link href="/quiz" data-ativo={quizAtivo}>
            Quiz
          </Link>
          <Link href="/premium" data-ativo={premiumAtivo} className="masthead__premium-link">
            ✦ Premium
          </Link>
        </nav>

        <UserMenu />
      </div>
    </header>
  );
}
