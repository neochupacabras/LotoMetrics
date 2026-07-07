"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { CodigoLoteria } from "@/lib/types";

type AbaAtiva =
  | "resultados" | "tabelas" | "gerador" | "simulador" | "probabilidades"
  | "fechamentos" | "conferidor" | "destaques" | "bolao" | "analisador"
  | "heatmap" | "acumulos" | "equilibrio";

const ABAS_COMPLETAS: { slug: AbaAtiva; label: string }[] = [
  { slug: "resultados",     label: "Resultados"     },
  { slug: "destaques",      label: "Destaques"      },
  { slug: "tabelas",        label: "Tabelas"        },
  { slug: "gerador",        label: "Gerador"        },
  { slug: "simulador",      label: "Simulador"      },
  { slug: "fechamentos",    label: "Fechamentos"    },
  { slug: "bolao",          label: "Bolão"          },
  { slug: "conferidor",     label: "Conferidor"     },
  { slug: "analisador",     label: "Analisador"     },
  { slug: "heatmap",        label: "Heatmap"        },
  { slug: "acumulos",       label: "Acúmulos"       },
  { slug: "probabilidades", label: "Probabilidades" },
  { slug: "equilibrio",     label: "Equilíbrio"     },
];

const ABAS_QUINA_LOTOMANIA: { slug: AbaAtiva; label: string }[] = [
  { slug: "resultados",     label: "Resultados"     },
  { slug: "destaques",      label: "Destaques"      },
  { slug: "tabelas",        label: "Tabelas"        },
  { slug: "gerador",        label: "Gerador"        },
  { slug: "simulador",      label: "Simulador"      },
  { slug: "conferidor",     label: "Conferidor"     },
  { slug: "analisador",     label: "Analisador"     },
  { slug: "heatmap",        label: "Heatmap"        },
  { slug: "acumulos",       label: "Acúmulos"       },
  { slug: "probabilidades", label: "Probabilidades" },
];

const ABAS_POR_LOTERIA: Record<string, { slug: AbaAtiva; label: string }[]> = {
  lotofacil: ABAS_COMPLETAS,
  megasena:  ABAS_COMPLETAS,
  quina:      ABAS_QUINA_LOTOMANIA,
  lotomania:  ABAS_QUINA_LOTOMANIA,
  diadesorte: ABAS_QUINA_LOTOMANIA,
};

export default function Subnav({
  codigoLoteria,
  ativa,
}: {
  codigoLoteria: CodigoLoteria;
  ativa: AbaAtiva;
}) {
  const ABAS = ABAS_POR_LOTERIA[codigoLoteria] ?? ABAS_QUINA_LOTOMANIA;
  const navRef = useRef<HTMLElement>(null);
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  // Inicializar + resize
  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  // Mouse-wheel → scroll horizontal no desktop
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.5;
        checkScroll();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [checkScroll]);

  function scrollPor(delta: number) {
    navRef.current?.scrollBy({ left: delta, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  }

  return (
    <div className="subnav">
      <div className="subnav__outer">
        {/* Botão esquerdo */}
        <button
          type="button"
          className="subnav__seta subnav__seta--esq"
          aria-hidden={!canLeft}
          tabIndex={canLeft ? 0 : -1}
          onClick={() => scrollPor(-200)}
        >
          ‹
        </button>

        {/* Nav rolável */}
        <nav
          className="subnav__inner"
          ref={navRef}
          onScroll={checkScroll}
          aria-label={`Ferramentas da ${codigoLoteria}`}
        >
          {ABAS.map(({ slug, label }) => (
            <Link
              key={slug}
              href={`/${codigoLoteria}/${slug}`}
              data-ativo={ativa === slug}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Gradiente + botão direito */}
        <div
          className="subnav__fade-dir"
          aria-hidden="true"
          style={{ opacity: canRight ? 1 : 0 }}
        />
        <button
          type="button"
          className="subnav__seta subnav__seta--dir"
          aria-hidden={!canRight}
          tabIndex={canRight ? 0 : -1}
          onClick={() => scrollPor(200)}
        >
          ›
        </button>
      </div>
    </div>
  );
}
