import Link from "next/link";
import { CodigoLoteria } from "@/lib/types";
import { LOTERIAS } from "@/lib/format";
import UserMenu from "@/components/auth/UserMenu";
import NavLoterias from "@/components/NavLoterias";

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
  const items = [
    ...Object.values(LOTERIAS).map((l) => ({
      href: `/${l.slug}/resultados`,
      label: l.nome,
      ativo: loteriaAtiva === l.slug,
    })),
    { href: "/dicas",    label: "Dicas",     ativo: !!dicasAtiva    },
    { href: "/analises", label: "Análises",  ativo: !!analisesAtiva },
    { href: "/quiz",     label: "Quiz",      ativo: !!quizAtivo     },
    { href: "/premium",  label: "✦ Premium", ativo: !!premiumAtivo, className: "masthead__premium-link" },
  ];

  return (
    <header className="masthead">
      <div className="container masthead__inner">
        <div>
          <Link href="/" className="masthead__title">
            Loto<span>Analítica</span>
          </Link>
          <div className="masthead__tagline">Resultados &amp; estatísticas de loteria</div>
        </div>

        <NavLoterias items={items} />

        <UserMenu />
      </div>
    </header>
  );
}
