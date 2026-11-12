/* eslint-disable -- script de evidência da auditoria, fora do código do site */
// Roda lib/analisador.ts (analisar) com jogos da Mega-Sena e compara com a
// referência exata (enumeração em ../fase1/ms-ref.mjs).
import { analisar } from "../../../../../lib/analisador";
const casos: [string, number[]][] = [
  ["soma 183 (mediana)", [10, 20, 30, 35, 40, 48]],
  ["soma 21 (mínima)", [1, 2, 3, 4, 5, 6]],
  ["soma 120", [5, 12, 18, 22, 27, 36]],
  ["0 na moldura (10x6)", [8, 9, 10, 11, 14, 15]],
  ["6 na moldura (10x6)", [1, 2, 3, 4, 5, 6]],
  ["sorteio 3084", [6, 14, 22, 30, 31, 37]],
];
for (const [nome, d] of casos) {
  const r = analisar(d, "megasena", 1, 60, 6, 6)!;
  console.log(nome.padEnd(22), "soma", r.soma.valor, "pct exibido", r.soma.pct.toFixed(1), r.soma.label, "percentil", r.soma.percentil,
    "| moldura", r.molduraCentro.moldura, r.molduraCentro.pct, r.molduraCentro.label, "| típicas", r.tipicas);
}
console.log("7 dezenas ->", analisar([1,2,3,4,5,6,7], "megasena", 1, 60, 6, 6));
