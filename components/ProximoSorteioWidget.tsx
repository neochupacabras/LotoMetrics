"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AGENDA, nomeLoteria, dataHoraProximoSorteio } from "@/lib/calendario";

function agoraBrasiliaClient(): Date {
  const agora = new Date();
  const utcMs = agora.getTime() + agora.getTimezoneOffset() * 60_000;
  return new Date(utcMs - 3 * 60 * 60_000);
}

function formatarContagem(diffMs: number): string {
  const totalSeg = Math.max(0, Math.floor(diffMs / 1000));
  const h = Math.floor(totalSeg / 3600);
  const m = Math.floor((totalSeg % 3600) / 60);
  const s = totalSeg % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  return `${pad(m)}m ${pad(s)}s`;
}

export default function ProximoSorteioWidget() {
  const [agora, setAgora] = useState<Date | null>(null);

  useEffect(() => {
    setAgora(agoraBrasiliaClient());
    const id = setInterval(() => setAgora(agoraBrasiliaClient()), 1000);
    return () => clearInterval(id);
  }, []);

  // Evita mismatch de hidratação: só calcula depois de montar no cliente
  if (!agora) {
    return <div className="proximo-sorteio proximo-sorteio--carregando" aria-hidden />;
  }

  const proximo = AGENDA
    .map((a) => ({ codigo: a.codigo, instante: dataHoraProximoSorteio(a.codigo, agora) }))
    .sort((a, b) => a.instante.getTime() - b.instante.getTime())[0];

  // `dataHoraProximoSorteio` devolve um instante absoluto real (via
  // Date.UTC) — não o mesmo "espaço deslocado" de `agora` (que é só pra
  // extrair corretamente o dia de Brasília). Por isso o diff usa
  // `Date.now()` em vez de `agora.getTime()`, senão fica 3h errado.
  const agoraReal = Date.now();
  const diffMs = proximo.instante.getTime() - agoraReal;
  const ehHoje = proximo.instante.toDateString() === new Date(agoraReal).toDateString();
  const menosDeUmaHora = diffMs < 60 * 60 * 1000;
  const horarioSorteio = proximo.instante.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <Link href={`/${proximo.codigo}/resultados`} className="proximo-sorteio">
      <span className={`proximo-sorteio__pulso ${menosDeUmaHora ? "proximo-sorteio__pulso--ativo" : ""}`} aria-hidden />
      <span className="proximo-sorteio__texto">
        Próximo sorteio: <strong>{nomeLoteria(proximo.codigo)}</strong>{" "}
        {ehHoje ? "hoje" : "em breve"} às {horarioSorteio}
      </span>
      <span className="proximo-sorteio__contagem">{formatarContagem(diffMs)}</span>
    </Link>
  );
}
