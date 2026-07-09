"use client";
import { useState, useMemo } from "react";

const LOTERIAS = [
  { codigo: "lotofacil",      nome: "Lotofácil",    n: 25, m: 6, k: 15, faixas: [15,14,13,12,11] },
  { codigo: "megasena",       nome: "Mega-Sena",    n: 60, m: 6, k: 6,  faixas: [6,5,4] },
  { codigo: "quina",          nome: "Quina",        n: 80, m: 5, k: 5,  faixas: [5,4,3,2] },
  { codigo: "lotomania",      nome: "Lotomania",    n: 100,m: 20,k: 20, faixas: [20,19,18,17,16,15] },
  { codigo: "diadesorte",     nome: "Dia de Sorte", n: 31, m: 7, k: 7,  faixas: [7,6,5,4,3,2] },
  { codigo: "maismilionaria", nome: "+Milionária",  n: 50, m: 6, k: 6,  faixas: [6,5,4,3,2] },
  { codigo: "timemania",      nome: "Timemania",    n: 80, m: 7, k: 10, faixas: [7,6,5,4,3] },
  { codigo: "duplasena",      nome: "Dupla Sena",   n: 50, m: 6, k: 6,  faixas: [6,5,4,3] },
  { codigo: "supersete",      nome: "Super Sete",   n: 10, m: 7, k: 7,  faixas: [7,6,5,4,3] },
];

function fat(n: number): number {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function C(n: number, k: number): number {
  if (k > n || k < 0) return 0;
  if (k === 0 || k === n) return 1;
  // Usar logaritmos para evitar overflow
  let r = 0;
  for (let i = 0; i < k; i++) {
    r += Math.log(n - i) - Math.log(i + 1);
  }
  return Math.round(Math.exp(r));
}

function probAcertar(n: number, m: number, k: number, acertos: number): number {
  // P(acertar exatamente 'acertos' de m sorteados, com k apostados, universo n)
  return C(m, acertos) * C(n - m, k - acertos) / C(n, k);
}

function formatProb(p: number): string {
  if (p <= 0) return "Impossível";
  if (p >= 1) return "100%";
  const inv = Math.round(1 / p);
  if (inv >= 1e9) return `1 em ${(inv / 1e9).toFixed(1)} bilhões`;
  if (inv >= 1e6) return `1 em ${(inv / 1e6).toFixed(1)} milhões`;
  if (inv >= 1e3) return `1 em ${(inv / 1e3).toFixed(1)} mil`;
  return `1 em ${inv.toLocaleString("pt-BR")}`;
}

export function CalcProbLoteria() {
  const [lotIdx, setLotIdx] = useState(0);
  const [qtdDezenas, setQtdDezenas] = useState(LOTERIAS[0].k.toString());

  const lot = LOTERIAS[lotIdx];
  const qd = Math.max(lot.k, Math.min(lot.n, parseInt(qtdDezenas) || lot.k));

  const tabela = useMemo(() => {
    return lot.faixas.map(acertos => {
      const p = probAcertar(lot.n, lot.m, qd, acertos);
      return { acertos, prob: p, frase: formatProb(p) };
    });
  }, [lot, qd]);

  const corProb = (p: number) => {
    if (p > 0.01) return "var(--pine)";
    if (p > 0.0001) return "var(--ochre)";
    return "var(--rust)";
  };

  return (
    <div className="calc-painel">
      <div className="calc-painel__corpo">
        <div className="calc-campos">
          <div className="calc-campo">
            <label>Loteria</label>
            <select className="calc-select" value={lotIdx}
              onChange={e => { setLotIdx(+e.target.value); setQtdDezenas(LOTERIAS[+e.target.value].k.toString()); }}>
              {LOTERIAS.map((l, i) => <option key={i} value={i}>{l.nome}</option>)}
            </select>
          </div>
          <div className="calc-campo">
            <label>Dezenas apostadas ({lot.k} a {lot.n})</label>
            <input className="calc-input calc-input--destaque" type="number"
              min={lot.k} max={lot.n} value={qtdDezenas}
              onChange={e => setQtdDezenas(e.target.value)} />
          </div>
        </div>

        <div className="calc-info calc-info--rust" style={{ marginBottom: 0 }}>
          <strong>{lot.nome}:</strong> sorteia {lot.m} de {lot.n} números. Você aposta {qd} dezenas.
          Total de combinações: C({lot.n}, {qd}) = {C(lot.n, qd).toLocaleString("pt-BR")}
        </div>
      </div>

      <div className="calc-painel__resultado calc-painel__resultado--rust">
        <div className="calc-resultado-label">Probabilidades por faixa</div>
        <table className="calc-tabela" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Acertos</th>
              <th className="num">Probabilidade</th>
              <th className="num">Em %</th>
            </tr>
          </thead>
          <tbody>
            {tabela.map(({ acertos, prob, frase }) => (
              <tr key={acertos}>
                <td style={{ fontWeight: acertos === lot.m ? 700 : 400 }}>
                  {acertos === lot.m ? "🏆 " : ""}{acertos} acertos
                  {acertos === lot.m ? " (faixa 1)" : ""}
                </td>
                <td className="num" style={{ color: corProb(prob), fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                  {frase}
                </td>
                <td className="num" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}>
                  {(prob * 100).toFixed(prob < 0.001 ? 8 : prob < 0.01 ? 6 : 4)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {qd > lot.k && (
          <div className="calc-resultado-destaque" style={{ marginTop: 16 }}>
            💡 Apostando {qd} dezenas em vez de {lot.k}, você cobre {C(qd, lot.k).toLocaleString("pt-BR")} combinações.
          </div>
        )}
      </div>
    </div>
  );
}
