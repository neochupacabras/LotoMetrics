"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TermoGlossario } from "@/lib/glossario";

function normalizar(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function ItemGlossario({ t }: { t: TermoGlossario }) {
  return (
    <div id={t.slug} className="glossario-item">
      <dt className="glossario-item__termo">{t.termo}</dt>
      <dd className="glossario-item__definicao">
        {t.definicao}
        {t.saibaMais && (
          <>
            {" "}
            <Link href={t.saibaMais.href} className="breadcrumb">
              {t.saibaMais.label} →
            </Link>
          </>
        )}
      </dd>
    </div>
  );
}

export default function GlossarioBusca({
  termos,
  grupos,
}: {
  termos: TermoGlossario[];
  grupos: { letra: string; termos: TermoGlossario[] }[];
}) {
  const [busca, setBusca] = useState("");

  const resultados = useMemo(() => {
    const q = normalizar(busca.trim());
    if (!q) return null;
    return termos.filter(
      (t) => normalizar(t.termo).includes(q) || normalizar(t.definicao).includes(q)
    );
  }, [busca, termos]);

  return (
    <>
      <div className="glossario-busca">
        <input
          type="search"
          className="glossario-busca__input"
          placeholder="Buscar um termo... (ex: atraso, viés, valor esperado)"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar termo no glossário"
        />
      </div>

      {resultados !== null ? (
        <div className="glossario-busca__resultados">
          {resultados.length === 0 ? (
            <p className="glossario-busca__vazio">
              Nenhum termo encontrado para &quot;{busca}&quot;.
            </p>
          ) : (
            <>
              <p className="glossario-busca__contagem">
                {resultados.length} termo{resultados.length !== 1 ? "s" : ""} encontrado{resultados.length !== 1 ? "s" : ""}
              </p>
              <dl className="glossario-lista">
                {resultados.map((t) => (
                  <ItemGlossario key={t.slug} t={t} />
                ))}
              </dl>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Índice A-Z */}
          <nav className="glossario-indice" aria-label="Índice alfabético">
            {grupos.map((g) => (
              <a key={g.letra} href={`#letra-${g.letra}`} className="glossario-indice__letra">
                {g.letra}
              </a>
            ))}
          </nav>

          {grupos.map((g) => (
            <section key={g.letra} id={`letra-${g.letra}`} className="glossario-secao">
              <h2 className="glossario-secao__titulo">{g.letra}</h2>
              <dl className="glossario-lista">
                {g.termos.map((t) => (
                  <ItemGlossario key={t.slug} t={t} />
                ))}
              </dl>
            </section>
          ))}
        </>
      )}
    </>
  );
}
