"use client";

import { useEffect, useRef } from "react";

export default function MastheadShell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let encolhido = false;
    function onScroll() {
      const deveEncolher = window.scrollY > 40;
      if (deveEncolher !== encolhido) {
        encolhido = deveEncolher;
        el!.setAttribute("data-encolhido", String(encolhido));
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="masthead" ref={ref}>
      {children}
    </header>
  );
}
