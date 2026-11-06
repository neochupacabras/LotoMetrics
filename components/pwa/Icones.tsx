// Ícones de traço fino (1.75px, cantos retos) desenhados para combinar com
// a estética "editorial de dados" do site — hairlines e geometria simples.
// Inline (sem biblioteca de ícones) para não pesar o bundle.

type Props = { className?: string; ativo?: boolean };

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "square" as const,
  strokeLinejoin: "miter" as const,
  "aria-hidden": true,
};

export function IconeInicio({ className, ativo }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 10.5 12 4l8.5 6.5V20h-5.5v-6h-6v6H3.5z" fill={ativo ? "currentColor" : "none"} fillOpacity={ativo ? 0.12 : 0} />
    </svg>
  );
}

// Bolinhas sorteadas
export function IconeResultados({ className, ativo }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="3.5" width="7" height="7" fill={ativo ? "currentColor" : "none"} fillOpacity={ativo ? 0.12 : 0} />
      <rect x="13.5" y="3.5" width="7" height="7" />
      <rect x="3.5" y="13.5" width="7" height="7" />
      <rect x="13.5" y="13.5" width="7" height="7" fill={ativo ? "currentColor" : "none"} fillOpacity={ativo ? 0.12 : 0} />
    </svg>
  );
}

// Bilhete com check
export function IconeConferir({ className, ativo }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 3.5h15v17h-15z" fill={ativo ? "currentColor" : "none"} fillOpacity={ativo ? 0.12 : 0} />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  );
}

// Faísca (gerar jogo)
export function IconeGerador({ className, ativo }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3v5M12 16v5M3 12h5M16 12h5" />
      <path d="M12 9.5 14.5 12 12 14.5 9.5 12z" fill={ativo ? "currentColor" : "none"} />
    </svg>
  );
}

export function IconeMais({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </svg>
  );
}

export function IconePerfil({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8.5" r="4" />
      <path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6" />
    </svg>
  );
}

export function IconeSino({ className, ativo }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" fill={ativo ? "currentColor" : "none"} fillOpacity={ativo ? 0.12 : 0} />
      <path d="M10 20.5h4" />
    </svg>
  );
}

export function IconeFechar({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function IconeInstalar({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5v11M7.5 10 12 14.5 16.5 10" />
      <path d="M4.5 15.5v5h15v-5" />
    </svg>
  );
}

// Ícone "Compartilhar" do Safari (quadrado com seta para cima) — usado nas
// instruções do iOS, igual ao que o usuário procura na barra do Safari.
export function IconeCompartilharIOS({ className }: Props) {
  return (
    <svg {...base} className={className} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M8 6.5 12 3l4 3.5" />
      <path d="M8.5 9.5H6v11h12v-11h-2.5" />
    </svg>
  );
}

// "Adicionar à Tela de Início" do iOS (quadrado com +)
export function IconeAdicionarIOS({ className }: Props) {
  return (
    <svg {...base} className={className} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  );
}

export function IconeMenuVertical({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="5.5" r="0.9" fill="currentColor" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" />
      <circle cx="12" cy="18.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function IconeOffline({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M9 16a4.5 4.5 0 0 1 6 0" />
      <path d="m3.5 3.5 17 17" />
    </svg>
  );
}

// "Ver mais" da folha de compartilhar do iOS (seta para baixo num círculo)
export function IconeVerMais({ className }: Props) {
  return (
    <svg {...base} className={className} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 10.5 3.5 3.5 3.5-3.5" />
    </svg>
  );
}
