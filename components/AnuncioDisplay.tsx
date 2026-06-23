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
    if (iniciado.current) return;
    iniciado.current = true;

    try {
      // @ts-expect-error — adsbygoogle é injetado pelo script externo
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // Silencia erros de ad blocker
    }
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
