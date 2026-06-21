import Link from "next/link";
import { CodigoLoteria } from "@/lib/types";
import { LOTERIAS } from "@/lib/format";

export default function Masthead({
  loteriaAtiva,
  dicasAtiva,
}: {
  loteriaAtiva?: CodigoLoteria;
  dicasAtiva?: boolean;
}) {
  return (
    <header className="masthead">
      <div className="container masthead__inner">
        <div>
          <Link href="/" className="masthead__title">
            Loto<span>Metrics</span>
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
        </nav>
      </div>
    </header>
  );
}
