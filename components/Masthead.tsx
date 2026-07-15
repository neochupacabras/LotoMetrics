import Link from "next/link";
import { CodigoLoteria } from "@/lib/types";
import { LOTERIAS } from "@/lib/format";
import UserMenu from "@/components/auth/UserMenu";
import MegaNav from "@/components/MegaNav";

export default function Masthead({
  loteriaAtiva,
  dicasAtiva,
  analisesAtiva,
  quizAtivo,
  premiumAtivo,
  matematicaAtiva,
  calculadorasAtiva,
  glossarioAtivo,
}: {
  loteriaAtiva?: CodigoLoteria;
  dicasAtiva?: boolean;
  analisesAtiva?: boolean;
  quizAtivo?: boolean;
  premiumAtivo?: boolean;
  matematicaAtiva?: boolean;
  calculadorasAtiva?: boolean;
  glossarioAtivo?: boolean;
}) {
  const loterias = Object.values(LOTERIAS).map((l) => ({
    slug: l.slug,
    nome: l.nome,
  }));

  const grupoAtivo =
    dicasAtiva || matematicaAtiva || glossarioAtivo || quizAtivo ? "estudar"
    : calculadorasAtiva ? "calcular"
    : analisesAtiva ? "consultar"
    : undefined;

  return (
    <header className="masthead">
      <div className="container masthead__inner">
        <div>
          <Link href="/" className="masthead__title">
            Atlas <span>das Loterias</span>
          </Link>
          <div className="masthead__tagline">Um mapa para explorar cada loteria</div>
        </div>

        <MegaNav loterias={loterias} grupoAtivo={grupoAtivo} loteriaAtiva={loteriaAtiva} />

        <UserMenu />
      </div>
    </header>
  );
}
