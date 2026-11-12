"use client";

import { useEffect, useRef } from "react";

interface Props {
  slot: string;           // data-ad-slot do bloco específico
  formato?: "auto" | "rectangle" | "horizontal";
  className?: string;
}

// Este componente SÓ deve ser renderizado quando isPremium === false.
// A decisão de renderizar ou não é feita no Server Component pai,
// que nunca importa este componente para usuários premium —
// garantindo que o AdSense não seja sequer inicializado para assinantes.
export default function AnuncioDisplay({
  slot,
  formato = "auto",
  className = "",
}: Props) {
  const ref = useRef<HTMLModElement>(null);
  const iniciado = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || iniciado.current) return;

    const iniciar = () => {
      if (iniciado.current) return;
      iniciado.current = true;
      try {
        // @ts-expect-error — adsbygoogle é injetado pelo script externo
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // Silencia erros de ad blocker
      }
    };

    // O AdSense lança "No slot size for availableWidth=0" (assíncrono, fora
    // deste try/catch) se o bloco ainda não tem largura no momento do push —
    // aba em segundo plano, layout ainda não calculado (LOTOANALITICA-8).
    // Só inicia quando o <ins> tiver largura de fato.
    if (el.offsetWidth > 0) {
      iniciar();
      return;
    }
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (el.offsetWidth > 0) {
        observer.disconnect();
        iniciar();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`anuncio-wrapper ${className}`} aria-hidden="true">
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-2396097789128007"
        data-ad-slot={slot}
        data-ad-format={formato}
        data-full-width-responsive="true"
      />
    </div>
  );
}
