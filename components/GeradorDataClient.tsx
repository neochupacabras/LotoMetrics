"use client";

import { useState } from "react";
import Dezenas from "./Dezenas";
import BotaoCopiar from "./BotaoCopiar";
import { gerarJogoDaData, JogoDaData } from "@/lib/gerar-jogo";
import { formatarDezena } from "@/lib/format";

export default function GeradorDataClient({
  dezenaMin,
  dezenaMax,
  qtdDezenas,
  usaTrevos = false,
}: {
  dezenaMin: number;
  dezenaMax: number;
  qtdDezenas: number;
  usaTrevos?: boolean;
}) {
  const [dataTexto, setDataTexto] = useState("");
  const [jogo, setJogo] = useState<JogoDaData | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function gerar() {
    setErro(null);
    if (!dataTexto) {
      setErro("Escolha uma data.");
      return;
    }
    const data = new Date(dataTexto + "T12:00:00");
    if (Number.isNaN(data.getTime())) {
      setErro("Data inválida.");
      return;
    }
    setJogo(gerarJogoDaData(data, dezenaMin, dezenaMax, qtdDezenas, usaTrevos ? 2 : undefined));
  }

  return (
    <div className="gerador-form">
      <div className="campo-filtro">
        <label htmlFor="dataEspecial">Uma data especial</label>
        <input
          id="dataEspecial"
          type="date"
          value={dataTexto}
          onChange={(e) => setDataTexto(e.target.value)}
        />
        <span className="campo-filtro__nota">
          Aniversário, data de casamento, qualquer data que signifique algo pra você.
        </span>
      </div>

      <button type="button" className="botao-gerar" onClick={gerar}>
        Gerar meu jogo da sorte
      </button>

      {erro && <p className="gerador-erro">{erro}</p>}

      {jogo && (
        <div className="bloco" style={{ marginTop: "20px" }}>
          <h2 className="bloco__titulo">Seu jogo</h2>
          <div className="jogo-gerado">
            <Dezenas dezenas={jogo.dezenas} />
            {jogo.trevos && jogo.trevos.length > 0 && (
              <div className="resultado-trevos">
                <span className="resultado-trevos__label">Trevos</span>
                <div className="resultado-trevos__bolinhas">
                  {jogo.trevos.map((t) => (
                    <span key={t} className="resultado-trevo-bolinha">{t}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="jogo-gerado__meta">
              <span>Essa data sempre vai gerar esse mesmo jogo</span>
              <BotaoCopiar
                texto={
                  jogo.dezenas.map(formatarDezena).join(" - ") +
                  (jogo.trevos ? ` | Trevos: ${jogo.trevos.join(" - ")}` : "")
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
