"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Analise } from "@/lib/analises";

const BADGE: Record<string, string> = {
  lotofacil: "Lotofácil",
  megasena: "Mega-Sena",
  quina: "Quina",
  lotomania: "Lotomania",
  diadesorte: "Dia de Sorte",
  maismilionaria: "+Milionária",
  timemania: "Timemania",
  duplasena: "Dupla Sena",
  supersete: "Super Sete",
  ambas: "Comparativo",
  educativo: "Educativo",
};

function formatarData(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AnalisesFiltro({ analises }: { analises: Analise[] }) {
  const [filtro, setFiltro] = useState<string | null>(null);

  const categoriasPresentes = useMemo(() => {
    const set = new Set(analises.map((a) => a.categoria));
    return Array.from(set).sort((a, b) => (BADGE[a] ?? a).localeCompare(BADGE[b] ?? b, "pt-BR"));
  }, [analises]);

  const [destaque, ...resto] = analises;
  const restoFiltrado = filtro ? resto.filter((a) => a.categoria === filtro) : resto;
  const destaqueVisivel = !filtro || destaque.categoria === filtro;

  return (
    <>
      <div className="analises-filtro">
        <button
          type="button"
          className="analises-filtro__chip"
          data-ativo={filtro === null}
          onClick={() => setFiltro(null)}
        >
          Todas
        </button>
        {categoriasPresentes.map((cat) => (
          <button
            key={cat}
            type="button"
            className="analises-filtro__chip"
            data-ativo={filtro === cat}
            onClick={() => setFiltro(cat)}
          >
            {BADGE[cat] ?? cat}
          </button>
        ))}
      </div>

      {destaqueVisivel && (
        <Link href={`/analises/${destaque.slug}`} className="analise-card analise-card--hero">
          <div className="analise-card__meta">
            <span className={`analise-card__badge analise-card__badge--${destaque.categoria}`}>
              {BADGE[destaque.categoria]}
            </span>
            <span className="analise-card__data">{formatarData(destaque.data)}</span>
            <span className="analise-card__tempo">{destaque.tempoLeitura} min de leitura</span>
          </div>
          <h2 className="analise-card__titulo analise-card__titulo--hero">{destaque.titulo}</h2>
          <p className="analise-card__resumo">{destaque.resumo}</p>
          <span className="analise-card__cta">Ler análise completa →</span>
        </Link>
      )}

      <div className="analises-grade">
        {restoFiltrado.map((a) => (
          <Link key={a.slug} href={`/analises/${a.slug}`} className="analise-card">
            <div className="analise-card__meta">
              <span className={`analise-card__badge analise-card__badge--${a.categoria}`}>
                {BADGE[a.categoria]}
              </span>
              <span className="analise-card__data">{formatarData(a.data)}</span>
              <span className="analise-card__tempo">{a.tempoLeitura} min de leitura</span>
            </div>
            <h2 className="analise-card__titulo">{a.titulo}</h2>
            <p className="analise-card__resumo">{a.resumo}</p>
          </Link>
        ))}
        {restoFiltrado.length === 0 && !destaqueVisivel && (
          <p style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
            Nenhuma análise ainda nessa categoria.
          </p>
        )}
      </div>
    </>
  );
}
