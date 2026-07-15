"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { CodigoLoteria } from "@/lib/types";

interface LoteriaItem {
  slug: CodigoLoteria;
  nome: string;
}

interface LinkSimples {
  href: string;
  label: string;
  descricao?: string;
}

interface Grupo {
  id: string;
  label: string;
  tipo: "loterias" | "links";
  sufixo?: string; // para tipo "loterias": /{slug}/{sufixo}
  links?: LinkSimples[];
  rodape?: LinkSimples;
}

export default function MegaNav({
  loterias,
  grupoAtivo,
  loteriaAtiva,
}: {
  loterias: LoteriaItem[];
  grupoAtivo?: string;
  loteriaAtiva?: CodigoLoteria;
}) {
  const [aberto, setAberto] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(null);
    }
    document.addEventListener("mousedown", onFora);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onFora);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const grupos: Grupo[] = [
    {
      id: "jogar",
      label: "Jogar",
      tipo: "loterias",
      sufixo: "gerador",
      rodape: { href: "/premium", label: "✦ Premium" },
    },
    {
      id: "estudar",
      label: "Estudar",
      tipo: "links",
      links: [
        { href: "/dicas", label: "Dicas e estratégias", descricao: "24 artigos práticos" },
        { href: "/matematica", label: "Matemática sem mistério", descricao: "25 conceitos explicados" },
        { href: "/glossario", label: "Glossário", descricao: "37 termos, de A a Z" },
        { href: "/quiz", label: "Quiz: Verdade ou Mito?", descricao: "22 perguntas" },
      ],
    },
    {
      id: "calcular",
      label: "Calcular",
      tipo: "links",
      links: [
        { href: "/calculadoras", label: "Todas as calculadoras", descricao: "14 ferramentas" },
        { href: "/calculadoras/probabilidade-loteria", label: "Probabilidade de loteria" },
        { href: "/calculadoras/custo-aposta-multipla", label: "Custo da aposta múltipla" },
        { href: "/calculadoras/rateio-bolao", label: "Rateio de bolão" },
      ],
    },
    {
      id: "consultar",
      label: "Consultar",
      tipo: "loterias",
      sufixo: "resultados",
      rodape: { href: "/analises", label: "Ver todas as análises" },
    },
  ];

  return (
    <nav className="mega-nav" ref={ref}>
      {grupos.map((g) => (
        <div key={g.id} className="mega-nav__item">
          <button
            type="button"
            className="mega-nav__gatilho"
            data-ativo={grupoAtivo === g.id}
            aria-expanded={aberto === g.id}
            aria-haspopup="true"
            onClick={() => setAberto((v) => (v === g.id ? null : g.id))}
          >
            {g.label}
          </button>

          {aberto === g.id && (
            <div className="mega-nav__painel" role="menu">
              {g.tipo === "loterias" ? (
                <div className="mega-nav__mapa">
                  {loterias.map((l) => (
                    <Link
                      key={l.slug}
                      href={`/${l.slug}/${g.sufixo}`}
                      role="menuitem"
                      className="mega-nav__no"
                      data-ativo={loteriaAtiva === l.slug}
                      onClick={() => setAberto(null)}
                    >
                      {l.nome}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mega-nav__lista">
                  {g.links!.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      role="menuitem"
                      className="mega-nav__link"
                      onClick={() => setAberto(null)}
                    >
                      <span className="mega-nav__link-label">{l.label}</span>
                      {l.descricao && <span className="mega-nav__link-descricao">{l.descricao}</span>}
                    </Link>
                  ))}
                </div>
              )}

              {g.rodape && (
                <Link
                  href={g.rodape.href}
                  className="mega-nav__rodape"
                  onClick={() => setAberto(null)}
                >
                  {g.rodape.label} →
                </Link>
              )}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
