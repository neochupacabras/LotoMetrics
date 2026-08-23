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
          maxHeight: aberto ? `${bodyRef.current?.scrollHeight ?? 400}px` : "0px",
        }}
      >
        <div ref={bodyRef} className="faq-item__resposta">
          {resposta}
        </div>
      </div>
    </div>
  );
}
