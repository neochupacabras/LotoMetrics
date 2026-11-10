"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isCodigoLoteriaValido } from "@/lib/format";
import type { CodigoLoteria } from "@/lib/types";
import { IconeConferir, IconeGerador, IconeInicio, IconeMais, IconeResultados } from "@/components/pwa/Icones";
import MaisSheet from "@/components/pwa/MaisSheet";
import { gravarLocal, useLocal } from "@/lib/pwa/armazenamento";

// Navegação inferior fixa — SÓ no celular (escondida por CSS acima de
// 640px, o mesmo breakpoint usado no resto do site; ver app/pwa.css). O
// desktop continua com o masthead de sempre.
//
// As quatro abas cobrem o que mais se usa no celular (resultado,
// conferir, gerar jogo); todo o resto fica no "Mais". "Resultados",
// "Conferir" e "Gerador" seguem a loteria em que o usuário está — ou a
// última que ele visitou —, como num app que lembra o contexto.

const CHAVE_LOTERIA = "la:loteria";
const LOTERIA_PADRAO: CodigoLoteria = "lotofacil";

// Rotas com navegação própria, onde a barra inferior atrapalha.
// /conta tem a barra inferior própria da área de membros
// (components/membros/NavMembros.tsx).
const SEM_BARRA = ["/admin", "/conta"];

export function useLoteriaAtual(): CodigoLoteria {
  const pathname = usePathname() ?? "/";
  const segmento = pathname.split("/")[1] ?? "";
  const daUrl = isCodigoLoteriaValido(segmento) ? segmento : null;
  const salva = useLocal(CHAVE_LOTERIA);
  const lembrada = salva && isCodigoLoteriaValido(salva) ? salva : LOTERIA_PADRAO;

  useEffect(() => {
    if (daUrl && daUrl !== salva) gravarLocal(CHAVE_LOTERIA, daUrl);
  }, [daUrl, salva]);

  return daUrl ?? lembrada;
}

export default function BottomNav() {
  const pathname = usePathname() ?? "/";
  const loteria = useLoteriaAtual();
  const [maisAberto, setMaisAberto] = useState(false);
  const [tecladoAberto, setTecladoAberto] = useState(false);

  // Some enquanto o teclado virtual está aberto (campo de texto em foco):
  // no Android a barra subiria junto com o teclado e cobriria o formulário.
  useEffect(() => {
    const ehCampo = (el: EventTarget | null) =>
      el instanceof HTMLElement &&
      (el.isContentEditable ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT" ||
        (el.tagName === "INPUT" &&
          !["checkbox", "radio", "button", "submit", "range", "color", "file"].includes((el as HTMLInputElement).type)));
    const aoFocar = (e: FocusEvent) => setTecladoAberto(ehCampo(e.target));
    const aoDesfocar = () => setTecladoAberto(false);
    document.addEventListener("focusin", aoFocar);
    document.addEventListener("focusout", aoDesfocar);
    return () => {
      document.removeEventListener("focusin", aoFocar);
      document.removeEventListener("focusout", aoDesfocar);
    };
  }, []);

  // Segmento inteiro: "/conta" não pode pegar "/conta-excluida".
  if (SEM_BARRA.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  const resto = pathname.split("/")[2] ?? "";
  const naLoteria = isCodigoLoteriaValido(pathname.split("/")[1] ?? "");

  const itens = [
    { href: "/", rotulo: "Início", Icone: IconeInicio, ativo: pathname === "/" },
    {
      href: `/${loteria}/resultados`,
      rotulo: "Resultados",
      Icone: IconeResultados,
      ativo: naLoteria && (resto === "resultados" || resto === "resultado" || resto === ""),
    },
    { href: `/${loteria}/conferidor`, rotulo: "Conferir", Icone: IconeConferir, ativo: naLoteria && resto === "conferidor" },
    { href: `/${loteria}/gerador`, rotulo: "Gerar jogo", Icone: IconeGerador, ativo: naLoteria && resto === "gerador" },
  ];

  return (
    <>
      <nav className="bottom-nav" aria-label="Navegação principal" data-oculta={tecladoAberto}>
        <ul className="bottom-nav__lista">
          {itens.map(({ href, rotulo, Icone, ativo }) => (
            <li key={rotulo}>
              <Link
                href={href}
                className="bottom-nav__item"
                data-ativo={ativo && !maisAberto}
                aria-current={ativo ? "page" : undefined}
              >
                <span className="bottom-nav__icone">
                  <Icone ativo={ativo && !maisAberto} />
                </span>
                <span className="bottom-nav__rotulo">{rotulo}</span>
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="bottom-nav__item"
              data-ativo={maisAberto}
              aria-haspopup="dialog"
              aria-expanded={maisAberto}
              onClick={() => setMaisAberto(true)}
            >
              <span className="bottom-nav__icone">
                <IconeMais />
              </span>
              <span className="bottom-nav__rotulo">Mais</span>
            </button>
          </li>
        </ul>
      </nav>
      <MaisSheet aberto={maisAberto} aoFechar={() => setMaisAberto(false)} loteria={loteria} />
    </>
  );
}
