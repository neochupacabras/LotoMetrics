"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buscarFerramentas, disponivelEm, hrefFerramenta, normalizar } from "@/lib/ferramentas";
import { NAV_MEMBROS } from "@/lib/conta/navegacao";
import { LOTERIAS, isCodigoLoteriaValido } from "@/lib/format";
import { useLocal } from "@/lib/pwa/armazenamento";
import type { CodigoLoteria } from "@/lib/types";
import { IcBusca } from "@/components/membros/Icones";

interface Resultado {
  chave: string;
  titulo: string;
  detalhe: string;
  href: string;
}

const PAGINAS = NAV_MEMBROS.flatMap((g) => g.itens);
const MAX = 8;

// Busca rápida da área de membros (Ctrl/⌘+K ou o botão "Buscar"): acha
// ferramentas (lib/ferramentas.ts) e páginas da conta. Combobox ARIA com
// lista de opções; setas movem, Enter abre, Esc fecha (nativo do <dialog>).
export default function BuscaRapida({ aberta, aoFechar }: { aberta: boolean; aoFechar: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const entradaRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const idLista = useId();
  const [consulta, setConsulta] = useState("");
  const [ativo, setAtivo] = useState(0);

  const lembrada = useLocal("la:loteria");
  const loteria: CodigoLoteria = lembrada && isCodigoLoteriaValido(lembrada) ? lembrada : "megasena";

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberta && !d.open) {
      setConsulta("");
      setAtivo(0);
      d.showModal();
      entradaRef.current?.focus();
    } else if (!aberta && d.open) {
      d.close();
    }
  }, [aberta]);

  const resultados = useMemo<Resultado[]>(() => {
    const q = normalizar(consulta);
    const paginas = PAGINAS.filter((p) => !q || normalizar(p.rotulo).includes(q)).map((p) => ({
      chave: `p-${p.href}`,
      titulo: p.rotulo,
      detalhe: "Página da conta",
      href: p.href,
    }));
    const ferramentas = buscarFerramentas(consulta).map((f) => {
      const lot = disponivelEm(f, loteria) ? loteria : ("megasena" as CodigoLoteria);
      return {
        chave: `f-${f.id}`,
        titulo: f.nome,
        detalhe: f.tipo === "loteria" ? `Ferramenta · ${LOTERIAS[lot].nome}` : "Ferramenta",
        href: hrefFerramenta(f, lot),
      };
    });
    // Sem consulta: ferramentas primeiro (é o que se procura aqui).
    return (q ? [...paginas, ...ferramentas] : [...ferramentas, ...paginas]).slice(0, MAX);
  }, [consulta, loteria]);

  function abrir(r: Resultado | undefined) {
    if (!r) return;
    ref.current?.close();
    router.push(r.href);
  }

  return (
    <dialog
      ref={ref}
      className="m-busca-rapida"
      aria-label="Buscar ferramenta ou página"
      onClose={aoFechar}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
    >
      <div className="m-busca-rapida__painel">
        <label className="m-busca m-busca--rapida">
          <IcBusca className="m-busca__icone" />
          <span className="m-sr">Buscar</span>
          <input
            ref={entradaRef}
            className="m-busca__entrada"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={idLista}
            aria-activedescendant={resultados[ativo] ? `${idLista}-${ativo}` : undefined}
            aria-autocomplete="list"
            placeholder="Buscar ferramenta ou página…"
            value={consulta}
            autoComplete="off"
            onChange={(e) => {
              setConsulta(e.target.value);
              setAtivo(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setAtivo((i) => Math.min(i + 1, resultados.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setAtivo((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                abrir(resultados[ativo]);
              }
            }}
          />
          <kbd className="m-tecla">Esc</kbd>
        </label>

        {resultados.length === 0 ? (
          <p className="m-busca-rapida__vazio">Nada encontrado para “{consulta.trim()}”.</p>
        ) : (
          <ul id={idLista} role="listbox" className="m-busca-rapida__lista" aria-label="Resultados">
            {resultados.map((r, i) => (
              <li
                key={r.chave}
                id={`${idLista}-${i}`}
                role="option"
                aria-selected={i === ativo}
                className="m-busca-rapida__item"
                onMouseMove={() => setAtivo(i)}
                onClick={() => abrir(r)}
              >
                <span className="m-busca-rapida__titulo">{r.titulo}</span>
                <span className="m-busca-rapida__detalhe">{r.detalhe}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="m-busca-rapida__dica" aria-hidden>
          <kbd className="m-tecla">↑</kbd> <kbd className="m-tecla">↓</kbd> para navegar ·{" "}
          <kbd className="m-tecla">Enter</kbd> para abrir
        </p>
      </div>
    </dialog>
  );
}
