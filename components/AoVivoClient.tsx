"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Dezenas from "./Dezenas";
import { formatarDezena } from "@/lib/format";

interface UltimoConcurso {
  numero: number;
  dataSorteio: string;
  dezenas: number[];
  acumulado: boolean;
  trevos: number[] | null;
  mesSorte: string | null;
}

function formatarContagem(ms: number): { horas: string; minutos: string; segundos: string } {
  const totalSegundos = Math.max(0, Math.floor(ms / 1000));
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  return {
    horas: String(horas).padStart(2, "0"),
    minutos: String(minutos).padStart(2, "0"),
    segundos: String(segundos).padStart(2, "0"),
  };
}

export default function AoVivoClient({
  codigoLoteria,
  nomeLoteria,
  dataHoraSorteioIso,
  numeroUltimoConhecido,
}: {
  codigoLoteria: string;
  nomeLoteria: string;
  dataHoraSorteioIso: string;
  numeroUltimoConhecido: number;
}) {
  const alvo = useRef(new Date(dataHoraSorteioIso).getTime());
  const [agora, setAgora] = useState<number | null>(null);
  const [resultado, setResultado] = useState<UltimoConcurso | null>(null);
  const [verificando, setVerificando] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Relógio local do visitante — só depois de montar (evita mismatch de
  // hidratação entre o horário do servidor e o do navegador).
  useEffect(() => {
    setAgora(Date.now());
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Depois que o horário do sorteio passa, começa a checar por um
  // resultado novo a cada 20s — sem precisar de push notification.
  useEffect(() => {
    if (agora === null || agora < alvo.current || resultado) return;
    if (pollRef.current) return;

    async function checar() {
      setVerificando(true);
      try {
        const r = await fetch(`/api/${codigoLoteria}/ultimo-concurso`, { cache: "no-store" });
        if (r.ok) {
          const dados: UltimoConcurso = await r.json();
          if (dados.numero > numeroUltimoConhecido) {
            setResultado(dados);
            if (pollRef.current) clearInterval(pollRef.current);
          }
        }
      } catch {
        // silencioso — tenta de novo no próximo ciclo
      } finally {
        setVerificando(false);
      }
    }

    checar();
    pollRef.current = setInterval(checar, 20_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [agora, resultado, codigoLoteria, numeroUltimoConhecido]);

  if (resultado) {
    return (
      <div className="bloco" style={{ marginTop: 8 }}>
        <h2 className="bloco__titulo">Concurso {resultado.numero} — resultado saiu!</h2>
        <Dezenas dezenas={resultado.dezenas} />
        {resultado.trevos && resultado.trevos.length > 0 && (
          <div className="resultado-trevos">
            <span className="resultado-trevos__label">Trevos</span>
            <div className="resultado-trevos__bolinhas">
              {resultado.trevos.map((t) => (
                <span key={t} className="resultado-trevo-bolinha">{t}</span>
              ))}
            </div>
          </div>
        )}
        <p className="bloco__nota" style={{ marginTop: 12 }}>
          {resultado.acumulado ? "Acumulou — sem ganhador na faixa principal." : "Teve ganhador na faixa principal."}
        </p>
        <Link href={`/${codigoLoteria}/resultados/${resultado.numero}`} className="botao-gerar" style={{ marginTop: 12, display: "inline-block" }}>
          Ver boletim completo →
        </Link>
      </div>
    );
  }

  const passouDoHorario = agora !== null && agora >= alvo.current;

  if (passouDoHorario) {
    return (
      <div className="bloco" style={{ marginTop: 8 }}>
        <h2 className="bloco__titulo">Aguardando o resultado…</h2>
        <p className="bloco__nota">
          {verificando ? "Checando agora" : "Vamos checar de novo em instantes"} — a Caixa
          costuma publicar o resultado oficial poucos minutos após o horário do sorteio, e
          nosso importador roda logo em seguida. Deixe esta página aberta.
        </p>
      </div>
    );
  }

  const { horas, minutos, segundos } = formatarContagem(agora !== null ? alvo.current - agora : 0);

  return (
    <div className="bloco" style={{ marginTop: 8 }}>
      <h2 className="bloco__titulo">Faltam</h2>
      <div style={{ display: "flex", gap: 20, fontFamily: "var(--font-mono)" }}>
        {[
          { valor: horas, label: "horas" },
          { valor: minutos, label: "min" },
          { valor: segundos, label: "seg" },
        ].map((item) => (
          <div key={item.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.6rem", fontWeight: 700, color: "var(--pine)", lineHeight: 1 }}>
              {agora === null ? "--" : item.valor}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
      <p className="bloco__nota" style={{ marginTop: 12 }}>
        para o próximo sorteio da {nomeLoteria}. Deixe esta página aberta — assim que o
        resultado sair, ele aparece aqui automaticamente.
      </p>
    </div>
  );
}
