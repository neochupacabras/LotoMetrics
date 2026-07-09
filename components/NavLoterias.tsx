"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface NavItem {
  href: string;
  label: string;
  ativo: boolean;
  className?: string;
}

interface LoteriasDropdownProps {
  loterias: NavItem[];
  algumAtivo: boolean;
}

// Dropdown de loterias — abre painel em grid ao clicar
function LoteriasDropdown({ loterias, algumAtivo }: LoteriasDropdownProps) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    function onClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    if (aberto) document.addEventListener("mousedown", onClickFora);
    return () => document.removeEventListener("mousedown", onClickFora);
  }, [aberto]);

  // Fechar ao pressionar Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={ref} className="nav-dropdown">
      <button
        type="button"
        className="nav-dropdown__btn"
        data-ativo={algumAtivo}
        data-aberto={aberto}
        onClick={() => setAberto(v => !v)}
        aria-expanded={aberto}
        aria-haspopup="true"
      >
        Loterias
        <span className="nav-dropdown__seta" aria-hidden>{aberto ? "▲" : "▼"}</span>
      </button>

      {aberto && (
        <div className="nav-dropdown__painel" role="menu">
          <div className="nav-dropdown__grid">
            {loterias.map(l => (
              <Link
                key={l.href}
                href={l.href}
                role="menuitem"
                data-ativo={l.ativo}
                className="nav-dropdown__item"
                onClick={() => setAberto(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NavLoterias({
  items,
  loterias,
}: {
  items: NavItem[];
  loterias: NavItem[];
}) {
  const navRef = useRef<HTMLDivElement>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
      checkScroll();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [checkScroll]);

  function scroll(dir: "esq" | "dir") {
    const el = navRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "dir" ? 120 : -120, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  }

  const algumLotAtivo = loterias.some(l => l.ativo);

  return (
    <div className="nav-loterias-outer">
      <button
        type="button"
        className="nav-loterias-seta nav-loterias-seta--esq"
        aria-hidden={!canLeft}
        aria-label="Rolar para a esquerda"
        onClick={() => scroll("esq")}
        tabIndex={canLeft ? 0 : -1}
      >
        ‹
      </button>

      <div ref={navRef} className="nav-loterias" onScroll={checkScroll}>
        {/* Dropdown de loterias — substitui os 9 links individuais */}
        <LoteriasDropdown loterias={loterias} algumAtivo={algumLotAtivo} />

        {/* Seções da plataforma */}
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-ativo={item.ativo}
            className={item.className}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="nav-loterias-seta nav-loterias-seta--dir"
        aria-hidden={!canRight}
        aria-label="Rolar para a direita"
        onClick={() => scroll("dir")}
        tabIndex={canRight ? 0 : -1}
      >
        ›
      </button>

      {canRight && <div className="nav-loterias-fade" aria-hidden />}
    </div>
  );
}
