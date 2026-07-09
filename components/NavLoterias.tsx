"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface NavItem {
  href: string;
  label: string;
  ativo: boolean;
  className?: string;
}

export default function NavLoterias({ items }: { items: NavItem[] }) {
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

      <div
        ref={navRef}
        className="nav-loterias"
        onScroll={checkScroll}
      >
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

      {/* Gradiente indicando mais conteúdo à direita */}
      {canRight && <div className="nav-loterias-fade" aria-hidden />}
    </div>
  );
}
