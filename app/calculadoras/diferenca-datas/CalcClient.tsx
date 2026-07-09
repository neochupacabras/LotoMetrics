"use client";
import { useState } from "react";

export function CalcDatas() {
  const hoje = new Date().toISOString().split("T")[0];
  const [d1, setD1] = useState(hoje);
  const [d2, setD2] = useState(hoje);
  const [modo, setModo] = useState<"diferenca" | "adicionar">("diferenca");
  const [dias, setDias] = useState("");

  const calcDiferenca = () => {
    const dt1 = new Date(d1 + "T00:00:00");
    const dt2 = new Date(d2 + "T00:00:00");
    if (isNaN(dt1.getTime()) || isNaN(dt2.getTime())) return null;
    const diffMs = Math.abs(dt2.getTime() - dt1.getTime());
    const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const semanas = Math.floor(diffDias / 7);
    const diasRest = diffDias % 7;
    const meses = Math.floor(diffDias / 30.4375);
    const anos = Math.floor(diffDias / 365.25);
    const anterior = dt1 < dt2;
    return { diffDias, semanas, diasRest, meses, anos, anterior };
  };

  const calcAdicionar = () => {
    const dt = new Date(d1 + "T00:00:00");
    const nd = parseInt(dias);
    if (isNaN(dt.getTime()) || isNaN(nd)) return null;
    const nova = new Date(dt.getTime() + nd * 24 * 60 * 60 * 1000);
    const DIAS = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
    const MESES = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
    return {
      data: nova.toISOString().split("T")[0],
      diaSemana: DIAS[nova.getDay()],
      dataFmt: `${nova.getDate()} de ${MESES[nova.getMonth()]} de ${nova.getFullYear()}`,
    };
  };

  const resDif = calcDiferenca();
  const resAdd = calcAdicionar();

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div className="calc-modos">
          <button type="button" className="calc-modo-btn" data-ativo={modo === "diferenca"} onClick={() => setModo("diferenca")}>Diferença entre datas</button>
          <button type="button" className="calc-modo-btn" data-ativo={modo === "adicionar"} onClick={() => setModo("adicionar")}>Adicionar / subtrair dias</button>
        </div>

        {modo === "diferenca" ? (
          <div className="calc-campos">
            <div className="calc-campo"><label>Data inicial</label><input className="calc-input calc-input--destaque" type="date" value={d1} onChange={e => setD1(e.target.value)} /></div>
            <div className="calc-campo"><label>Data final</label><input className="calc-input calc-input--destaque" type="date" value={d2} onChange={e => setD2(e.target.value)} /></div>
          </div>
        ) : (
          <div className="calc-campos">
            <div className="calc-campo"><label>Data de referência</label><input className="calc-input calc-input--destaque" type="date" value={d1} onChange={e => setD1(e.target.value)} /></div>
            <div className="calc-campo"><label>Dias (negativo = subtrair)</label><input className="calc-input calc-input--destaque" type="number" placeholder="30" value={dias} onChange={e => setDias(e.target.value)} /></div>
          </div>
        )}
      </div>

      <div className="calc-painel__resultado calc-painel__resultado--pine">
        {modo === "diferenca" && resDif !== null ? (
          <>
            <div className="calc-resultado-label">{resDif.anterior ? "Data 2 é posterior à data 1" : d1 === d2 ? "Mesma data" : "Data 1 é posterior à data 2"}</div>
            <div className="calc-resultado-numero">{resDif.diffDias.toLocaleString("pt-BR")} dias</div>
            <div className="calc-metricas" style={{ marginTop: 16 }}>
              <div className="calc-metrica"><div className="calc-metrica__valor">{resDif.semanas}</div><div className="calc-metrica__label">Semanas</div></div>
              <div className="calc-metrica"><div className="calc-metrica__valor">{resDif.meses}</div><div className="calc-metrica__label">Meses aprox.</div></div>
              <div className="calc-metrica"><div className="calc-metrica__valor">{resDif.anos}</div><div className="calc-metrica__label">Anos aprox.</div></div>
              <div className="calc-metrica"><div className="calc-metrica__valor">{resDif.diasRest}</div><div className="calc-metrica__label">Dias restantes</div></div>
            </div>
          </>
        ) : modo === "adicionar" && resAdd !== null ? (
          <>
            <div className="calc-resultado-label">Data resultante</div>
            <div className="calc-resultado-numero" style={{ fontSize: "1.8rem" }}>{resAdd.dataFmt}</div>
            <div className="calc-resultado-destaque" style={{ marginTop: 12 }}>📅 {resAdd.diaSemana}</div>
          </>
        ) : (
          <div style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>Preencha os campos para calcular</div>
        )}
      </div>
    </div>
  );
}
