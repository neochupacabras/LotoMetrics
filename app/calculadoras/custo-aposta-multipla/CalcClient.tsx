"use client";
import { useState, useMemo } from "react";

interface LoteriaAposta {
  codigo: string;
  nome: string;
  min: number;
  max: number;
  preco: number;
  trevoMin?: number;
  trevoMax?: number;
  precoBaseTrevo?: number; // preço já embutido no `preco` para trevoMin
}

const LOTERIAS: LoteriaAposta[] = [
  { codigo: "lotofacil",      nome: "Lotofácil",    min: 15, max: 20, preco: 3.50 },
  { codigo: "megasena",       nome: "Mega-Sena",    min: 6,  max: 20, preco: 6.00 },
  { codigo: "quina",          nome: "Quina",        min: 5,  max: 15, preco: 3.00 },
  { codigo: "duplasena",      nome: "Dupla Sena",   min: 6,  max: 15, preco: 3.00 },
  { codigo: "timemania",      nome: "Timemania",    min: 10, max: 15, preco: 3.50 },
  { codigo: "diadesorte",     nome: "Dia de Sorte", min: 7,  max: 15, preco: 2.50 },
  { codigo: "maismilionaria", nome: "+Milionária",  min: 6,  max: 12, preco: 6.00, trevoMin: 2, trevoMax: 6 },
];

function C(n: number, k: number): number {
  if (k > n || k < 0) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}

function fmtBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CalcCustoApostaMultipla() {
  const [lotIdx, setLotIdx] = useState(0);
  const lot = LOTERIAS[lotIdx];
  const [dezenas, setDezenas] = useState(lot.min);
  const [trevos, setTrevos] = useState(lot.trevoMin ?? 0);

  function trocarLoteria(i: number) {
    setLotIdx(i);
    setDezenas(LOTERIAS[i].min);
    setTrevos(LOTERIAS[i].trevoMin ?? 0);
  }

  const { nJogosDezenas, nJogosTrevos, nJogos, custoTotal } = useMemo(() => {
    const jd = C(dezenas, lot.min);
    const jt = lot.trevoMin ? C(trevos, lot.trevoMin) : 1;
    const total = jd * jt;
    return { nJogosDezenas: jd, nJogosTrevos: jt, nJogos: total, custoTotal: total * lot.preco };
  }, [dezenas, trevos, lot]);

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div className="calc-campo">
          <label>Loteria</label>
          <select className="calc-select" value={lotIdx} onChange={e => trocarLoteria(+e.target.value)}>
            {LOTERIAS.map((l, i) => <option key={l.codigo} value={i}>{l.nome}</option>)}
          </select>
        </div>
        <div className="calc-campos">
          <div className="calc-campo">
            <label>Dezenas marcadas ({lot.min} a {lot.max})</label>
            <input
              className="calc-input calc-input--destaque"
              type="number"
              min={lot.min}
              max={lot.max}
              value={dezenas}
              onChange={e => setDezenas(Math.max(lot.min, Math.min(lot.max, +e.target.value || lot.min)))}
            />
          </div>
          {lot.trevoMin && (
            <div className="calc-campo">
              <label>Trevos marcados ({lot.trevoMin} a {lot.trevoMax})</label>
              <input
                className="calc-input calc-input--destaque"
                type="number"
                min={lot.trevoMin}
                max={lot.trevoMax}
                value={trevos}
                onChange={e => setTrevos(Math.max(lot.trevoMin!, Math.min(lot.trevoMax!, +e.target.value || lot.trevoMin!)))}
              />
            </div>
          )}
        </div>
      </div>
      <div className="calc-painel__resultado calc-painel__resultado--rust">
        <div className="calc-resultado-label">
          {dezenas} dezenas{lot.trevoMin ? ` + ${trevos} trevos` : ""} equivalem a
        </div>
        <div className="calc-resultado-numero calc-resultado-numero--rust">{nJogos.toLocaleString("pt-BR")} jogos</div>
        <div className="calc-resultado-extra">simples de {lot.min} dezenas{lot.trevoMin ? ` + ${lot.trevoMin} trevos` : ""} cada</div>
        <div className="calc-metricas" style={{ marginTop: 16 }}>
          <div className="calc-metrica"><div className="calc-metrica__valor" style={{ color: "var(--rust)" }}>{fmtBRL(lot.preco)}</div><div className="calc-metrica__label">Aposta simples</div></div>
          <div className="calc-metrica"><div className="calc-metrica__valor">{nJogos.toLocaleString("pt-BR")}</div><div className="calc-metrica__label">Jogos equivalentes</div></div>
          <div className="calc-metrica"><div className="calc-metrica__valor" style={{ color: "var(--rust)" }}>{fmtBRL(custoTotal)}</div><div className="calc-metrica__label">Custo total</div></div>
        </div>
      </div>
    </div>
  );
}
