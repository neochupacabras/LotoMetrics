"use client";

import { useRef, useState } from "react";

export default function FaqItem({ children }: { children: [React.ReactNode, React.ReactNode] }) {
  const [aberto, setAberto] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [pergunta, resposta] = children;

  return (
    <div className="faq-item">
      <button
        type="button"
        className="faq-item__pergunta"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
      >
        {pergunta}
      </button>
      <div
        className="faq-item__corpo"
        style={{
          // +4px de folga: diferenças de arredondamento de subpixel entre
          // navegadores no cálculo de line-height já cortaram a última
          // linha por 1-2px mesmo com a altura "certa" medida.
          maxHeight: aberto ? `${(bodyRef.current?.scrollHeight ?? 400) + 4}px` : "0px",
        }}
      >
        <div ref={bodyRef} className="faq-item__resposta">
          {resposta}
        </div>
      </div>
    </div>
  );
}
