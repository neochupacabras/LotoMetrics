"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOTERIAS } from "@/lib/format";
import { abaAplicavel } from "@/lib/abas-loteria";
import type { CodigoLoteria } from "@/lib/types";
import { IconeFechar } from "@/components/pwa/Icones";

// Faixa "Mega-Sena ▾" no topo das páginas de loteria — SÓ no celular
// (app/pwa.css). No desktop a loteria aparece no menu "Loterias" do
// masthead, que no celular fica escondido; sem isto, a página de
// resultados aberta pela barra inferior não dizia de qual loteria era.
// Tocar abre a lista das 9 loterias levando para a MESMA aba (gerador da
// Quina → gerador da Mega); se a aba não existe na outra loteria, vai
// para os resultados dela.

function destino(atual: string, pathname: string, outra: CodigoLoteria): string {
  const partes = pathname.split("/").filter(Boolean); // [loteria, aba, ...]
  const aba = partes[1];
  // Subpáginas (ex.: /resultados/3081, /tabelas/<categoria>) são de um
  // concurso/categoria específico: na outra loteria, vai para a aba raiz.
  if (!aba || partes[0] !== atual) return `/${outra}/resultados`;
  return abaAplicavel(outra, aba) ? `/${outra}/${aba}` : `/${outra}/resultados`;
}

export default function SeletorLoteria({ codigoLoteria }: { codigoLoteria: CodigoLoteria }) {
  const pathname = usePathname() ?? "";
  const ref = useRef<HTMLDialogElement>(null);
  const nome = LOTERIAS[codigoLoteria].nome;

  useEffect(() => {
    if (ref.current?.open) ref.current.close();
  }, [pathname]);

  return (
    <div className="seletor-loteria">
      <button
        type="button"
        className="seletor-loteria__botao"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
      >
        <span className="seletor-loteria__rotulo">Loteria</span>
        <span className="seletor-loteria__nome">{nome}</span>
        <span className="seletor-loteria__trocar">
          Trocar
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      <dialog
        ref={ref}
        className="mais-sheet"
        aria-labelledby="seletor-loteria-titulo"
        onClick={(e) => {
          if (e.target === e.currentTarget || (e.target as Element).closest("a[href]")) ref.current?.close();
        }}
      >
        <div className="mais-sheet__painel">
          <div className="mais-sheet__alca" aria-hidden />
          <header className="mais-sheet__topo">
            <h2 id="seletor-loteria-titulo" className="mais-sheet__titulo">Escolha a loteria</h2>
            <button type="button" className="mais-sheet__fechar" onClick={() => ref.current?.close()} aria-label="Fechar">
              <IconeFechar />
            </button>
          </header>
          <div className="mais-sheet__conteudo">
            <div className="mais-sheet__grade">
              {Object.values(LOTERIAS).map((l) => (
                <Link
                  key={l.slug}
                  href={destino(codigoLoteria, pathname, l.slug)}
                  className="mais-sheet__link"
                  data-ativo={l.slug === codigoLoteria}
                  aria-current={l.slug === codigoLoteria ? "true" : undefined}
                >
                  {l.nome}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
