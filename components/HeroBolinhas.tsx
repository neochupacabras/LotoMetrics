"use client";

import { useEffect, useRef } from "react";

interface BolinhaConfig {
  top: string;
  left: string;
  size: number;
  cor: "pine" | "ochre" | "rust";
  numero?: number;
  opacidade: number;
  profundidade: number; // quanto mais alto, mais ela se move com o mouse (mais "perto")
}

const BOLINHAS: BolinhaConfig[] = [
  { top: "12%", left: "76%", size: 52, cor: "pine",  numero: 5,  opacidade: 0.9,  profundidade: 22 },
  { top: "52%", left: "88%", size: 38, cor: "ochre", numero: 19, opacidade: 0.8,  profundidade: 14 },
  { top: "8%",  left: "58%", size: 26, cor: "rust",  opacidade: 0.5,              profundidade: 9  },
  { top: "74%", left: "66%", size: 44, cor: "pine",  numero: 23, opacidade: 0.75, profundidade: 18 },
  { top: "34%", left: "93%", size: 20, cor: "ochre", opacidade: 0.4,              profundidade: 6  },
  { top: "84%", left: "84%", size: 30, cor: "rust",  numero: 31, opacidade: 0.6,  profundidade: 12 },
  { top: "20%", left: "40%", size: 18, cor: "pine",  opacidade: 0.3,              profundidade: 5  },
  { top: "62%", left: "48%", size: 24, cor: "ochre", numero: 7,  opacidade: 0.35, profundidade: 8  },
  { top: "4%",  left: "88%", size: 16, cor: "rust",  opacidade: 0.3,              profundidade: 4  },
  { top: "90%", left: "42%", size: 22, cor: "pine",  opacidade: 0.35,             profundidade: 7  },
];

const COR_HEX: Record<string, string> = {
  pine: "var(--pine)",
  ochre: "var(--ochre)",
  rust: "var(--rust)",
};

export default function HeroBolinhas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bolinhasRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefereReduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const temMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const container = containerRef.current;
    if (!container) return;

    let mouseX = 0;
    let mouseY = 0;
    let frame: number;

    function onMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    }

    function onMouseLeave() {
      mouseX = 0;
      mouseY = 0;
    }

    if (temMouse && !prefereReduzido) {
      container.addEventListener("mousemove", onMouseMove);
      container.addEventListener("mouseleave", onMouseLeave);
    }

    function animar(ts: number) {
      bolinhasRef.current.forEach((el, i) => {
        if (!el) return;
        const cfg = BOLINHAS[i];
        const bob = prefereReduzido ? 0 : Math.sin(ts / 1400 + i * 1.3) * 5;
        const px = temMouse ? mouseX * cfg.profundidade : 0;
        const py = temMouse ? mouseY * cfg.profundidade : 0;
        el.style.transform = `translate(${px.toFixed(1)}px, ${(py + bob).toFixed(1)}px)`;
      });
      frame = requestAnimationFrame(animar);
    }
    frame = requestAnimationFrame(animar);

    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="hero-bolinhas" aria-hidden="true">
      {BOLINHAS.map((cfg, i) => (
        <div
          key={i}
          ref={(el) => { bolinhasRef.current[i] = el; }}
          className="hero-bolinhas__item"
          style={{
            top: cfg.top,
            left: cfg.left,
            width: cfg.size,
            height: cfg.size,
            borderColor: COR_HEX[cfg.cor],
            color: COR_HEX[cfg.cor],
            opacity: cfg.opacidade,
            fontSize: Math.max(10, cfg.size * 0.28),
          }}
        >
          {cfg.numero !== undefined ? String(cfg.numero).padStart(2, "0") : ""}
        </div>
      ))}
    </div>
  );
}
