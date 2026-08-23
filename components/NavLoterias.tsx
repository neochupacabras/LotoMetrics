"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface NavItem {
  href: string;
  label: string;
  ativo: boolean;
  className?: string;
}

// ─── Dropdown de loterias ────────────────────────────────────────────────────
function LoteriasDropdown({
  loterias,
  algumAtivo,
}: {
  loterias: NavItem[];
  algumAtivo: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    if (aberto) document.addEventListener("mousedown", onFora);
    return () => document.removeEventListener("mousedown", onFora);
  }, [aberto]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        className="nav-dropdown__btn"
        data-ativo={algumAtivo}
        data-aberto={aberto}
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-haspopup="true"
      >
        Loterias
        <span className="nav-dropdown__seta" data-aberto={aberto} aria-hidden>
          ▼
        </span>
      </button>

      {aberto && (
        <div className="nav-dropdown__painel" role="menu">
          <div className="nav-dropdown__grid">
            {loterias.map((l) => (
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

// ─── Nav principal: sublinhado deslizante + scroll horizontal em telas pequenas ──
export default function NavLoterias({
  items,
  loterias,
}: {
  items: NavItem[];
  loterias: NavItem[];
}) {
  const navRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const itemAtivo = items.find((i) => i.ativo) ?? items[0];

  const moverSublinhadoPara = useCallback((href: string) => {
    const el = itemRefs.current.get(href);
    const underline = underlineRef.current;
    if (!el || !underline) return;
    underline.style.left = `${el.offsetLeft}px`;
    underline.style.width = `${el.offsetWidth}px`;
  }, []);

  const voltarAoAtivo = useCallback(() => {
    moverSublinhadoPara(itemAtivo.href);
  }, [itemAtivo, moverSublinhadoPara]);

  const checkScroll = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    voltarAoAtivo();
    window.addEventListener("resize", checkScroll);
    window.addEventListener("resize", voltarAoAtivo);
    return () => {
      window.removeEventListener("resize", checkScroll);
      window.removeEventListener("resize", voltarAoAtivo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const algumLotAtivo = loterias.some((l) => l.ativo);

  return (
    <div className="nav-loterias-outer">
      <div className="nav-dropdown">
        <LoteriasDropdown loterias={loterias} algumAtivo={algumLotAtivo} />
        <span className="nav-dropdown__separador" aria-hidden />
      </div>

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

      <div
        ref={navRef}
        className="nav-loterias"
        onScroll={checkScroll}
        onMouseLeave={voltarAoAtivo}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-ativo={item.ativo}
            className={item.className}
            ref={(el) => {
              if (el) itemRefs.current.set(item.href, el);
            }}
            onMouseEnter={() => moverSublinhadoPara(item.href)}
          >
            {item.label}
          </Link>
        ))}
        <span ref={underlineRef} className="nav-loterias__sublinhado" aria-hidden />
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
