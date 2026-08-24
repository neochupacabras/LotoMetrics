"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AGENDA, nomeLoteria } from "@/lib/calendario";
import { CodigoLoteria } from "@/lib/types";

function agoraBrasiliaClient(): Date {
  const agora = new Date();
  const utcMs = agora.getTime() + agora.getTimezoneOffset() * 60_000;
  return new Date(utcMs - 3 * 60 * 60_000);
}

/** Próximo sorteio de uma loteria, já considerando o horário exato (21h) —
 *  diferente de lib/calendario.ts::proximoSorteio, que trabalha em granularidade
 *  de dia (usada na grade do /calendario). Aqui precisamos do instante exato
 *  pra contagem regressiva funcionar mesmo depois das 21h de um dia de sorteio. */
function proximoInstanteDeSorteio(codigo: CodigoLoteria, referencia: Date): Date {
  const agenda = AGENDA.find((a) => a.codigo === codigo)!;
  for (let i = 0; i <= 8; i++) {
    const candidato = new Date(referencia);
    candidato.setDate(candidato.getDate() + i);
    candidato.setHours(21, 0, 0, 0);
    if (agenda.dias.includes(candidato.getDay()) && candidato.getTime() > referencia.getTime()) {
      return candidato;
    }
  }
  return referencia;
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
    .map((a) => ({ codigo: a.codigo, instante: proximoInstanteDeSorteio(a.codigo, agora) }))
    .sort((a, b) => a.instante.getTime() - b.instante.getTime())[0];

  const diffMs = proximo.instante.getTime() - agora.getTime();
  const ehHoje = proximo.instante.toDateString() === agora.toDateString();
  const menosDeUmaHora = diffMs < 60 * 60 * 1000;

  return (
    <Link href={`/${proximo.codigo}/resultados`} className="proximo-sorteio">
      <span className={`proximo-sorteio__pulso ${menosDeUmaHora ? "proximo-sorteio__pulso--ativo" : ""}`} aria-hidden />
      <span className="proximo-sorteio__texto">
        Próximo sorteio: <strong>{nomeLoteria(proximo.codigo)}</strong>{" "}
        {ehHoje ? "hoje" : "em breve"} às 21h
      </span>
      <span className="proximo-sorteio__contagem">{formatarContagem(diffMs)}</span>
    </Link>
  );
}
