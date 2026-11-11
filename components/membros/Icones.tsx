// Ícones da área de membros — mesma régua de components/pwa/Icones.tsx
// (traço de 1.75px, cantos retos, geometria simples), inline e sem
// biblioteca. Todos decorativos (aria-hidden): o rótulo vem do texto ao lado.

type Props = { className?: string };

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "square" as const,
  strokeLinejoin: "miter" as const,
  "aria-hidden": true,
  focusable: false,
};

export function IcPainel({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 3.5h7v9h-7zM13.5 3.5h7v5h-7zM13.5 11.5h7v9h-7zM3.5 15.5h7v5h-7z" />
    </svg>
  );
}

export function IcJogos({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 3.5h15v17h-15z" />
      <circle cx="9" cy="9" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="9" cy="15" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="15" r="1.6" />
    </svg>
  );
}

export function IcBolao({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="8.5" cy="8" r="3" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M3 19.5c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5M14.5 14.6c.5-.1 1-.1 1.5-.1 2.3 0 4.2 1.5 4.8 4.5" />
    </svg>
  );
}

export function IcDesempenho({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 20.5h17" />
      <path d="M6.5 16.5v-4M11 16.5V8M15.5 16.5v-6M20 16.5V5" />
    </svg>
  );
}

export function IcAssinatura({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 6.5h17v11h-17z" />
      <path d="M3.5 10.5h17M6.5 14.5h4" />
    </svg>
  );
}

export function IcApi({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="m8.5 7.5-5 4.5 5 4.5M15.5 7.5l5 4.5-5 4.5M13.5 5l-3 14" />
    </svg>
  );
}

export function IcSino({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" />
      <path d="M10 20.5h4" />
    </svg>
  );
}

export function IcSite({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M13.5 4.5h6v6M19.5 4.5l-8 8M17.5 13.5v6h-13v-13h6" />
    </svg>
  );
}

export function IcAjuda({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.6" />
      <circle cx="12" cy="16.8" r=".6" fill="currentColor" />
    </svg>
  );
}

export function IcSair({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M10.5 4.5h-6v15h6M15 8l4 4-4 4M19 12H9" />
    </svg>
  );
}

export function IcRecolher({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 4.5h17v15h-17zM9.5 4.5v15" />
      <path d="m16 9.5-2.5 2.5 2.5 2.5" />
    </svg>
  );
}

export function IcConta({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8.5" r="4" />
      <path d="M4.5 20.5c.8-3.8 3.7-6 7.5-6s6.7 2.2 7.5 6" />
    </svg>
  );
}

export function IcFechar({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

// Selo Premium: losango cheio — substitui o glifo ✦ dentro da área.
export function IcSelo({ className }: Props) {
  return (
    <svg {...base} width={12} height={12} className={className} strokeWidth={0}>
      <path d="M12 2 22 12 12 22 2 12z" fill="currentColor" />
    </svg>
  );
}

export function IcCadeado({ className }: Props) {
  return (
    <svg {...base} width={14} height={14} className={className}>
      <path d="M5.5 10.5h13v10h-13zM8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" />
    </svg>
  );
}

export function IcFerramentas({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 3.5h7v7h-7zM13.5 3.5h7v7h-7zM3.5 13.5h7v7h-7z" />
      <path d="M17 13.5v7M13.5 17h7" />
    </svg>
  );
}

export function IcBusca({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 5.5 5.5" />
    </svg>
  );
}

// Estrela de favorito: contorno ou cheia.
export function IcEstrela({ className, cheia }: Props & { cheia?: boolean }) {
  return (
    <svg {...base} width={18} height={18} strokeLinejoin="round" className={className}>
      <path
        d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"
        fill={cheia ? "currentColor" : "none"}
      />
    </svg>
  );
}

// Bolas de sorteio (Central de loterias).
export function IcLoterias({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="8" cy="8" r="4.5" />
      <circle cx="16.5" cy="10" r="3.5" />
      <circle cx="10.5" cy="17" r="3.5" />
    </svg>
  );
}
