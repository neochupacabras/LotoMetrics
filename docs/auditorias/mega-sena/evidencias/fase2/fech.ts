/* eslint-disable -- script de evidência da auditoria, fora do código do site */
// Regenera a tabela OPCOES_BOLAO.megasena com o algoritmo do site, verifica
// cada garantia com um verificador independente e compara com cotas
// inferiores conhecidas. Confere também probabilidades x tabela da Caixa.
import { gerarFechamentoReduzido, gerarFechamentoCompleto } from "../../../../../lib/fechamento";
import { OPCOES_BOLAO } from "../../../../../lib/bolao-opcoes";
import { probabilidadeAoMenosK, calcularProbabilidades } from "../../../../../lib/probabilidades";
function verifica(pool: number[], tickets: number[][], k: number): boolean {
  const idx = new Map(pool.map((d, i) => [d, i]));
  const tm = tickets.map(t => t.reduce((m, d) => m | (1 << idx.get(d)!), 0));
  const v = pool.length;
  for (let s = (1 << k) - 1; s < (1 << v); ) {
    if (!tm.some(t => (t & s) === s)) return false;
    const c = s & -s, r = s + c; s = (((r ^ s) >>> 2) / c) | r;
  }
  return true;
}
const C=(n:number,k:number)=>{let r=1;for(let i=0;i<k;i++)r=r*(n-i)/(i+1);return Math.round(r)};
const schonheim=(v:number,K:number,t:number)=>{let L=1;for(let i=t-1;i>=0;i--)L=Math.ceil((v-i)/(K-i)*L);return L};
function poolAleatorio(v:number){const a=Array.from({length:60},(_,i)=>i+1);for(let i=59;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,v)}
console.log("v k | tabela gerado | verif.indep | válidos | Schönheim | completo | P(cond) 1 em | ms");
for (const o of OPCOES_BOLAO.megasena) {
  const pool = poolAleatorio(o.tamanhoPool);
  const t0 = Date.now();
  const r = gerarFechamentoReduzido(pool, 6, o.garantia);
  const ms = Date.now() - t0;
  const validos = r.tickets.every(t => t.length === 6 && new Set(t).size === 6 && t.every(d => pool.includes(d)));
  const dup = new Set(r.tickets.map(t => [...t].sort((a,b)=>a-b).join(","))).size !== r.tickets.length;
  const ok = verifica(pool, r.tickets, o.garantia);
  console.log(o.tamanhoPool, o.garantia, "|", o.totalJogos, r.totalTickets, "|", ok, r.garantiaVerificada, "|", validos, dup ? "DUPLICADOS" : "sem dup", "|", schonheim(o.tamanhoPool, 6, o.garantia), "|", C(o.tamanhoPool,6), "|", Math.round(1/probabilidadeAoMenosK(60,6,o.tamanhoPool,o.garantia)), "|", ms);
}
const p10 = poolAleatorio(10); const c = gerarFechamentoCompleto(p10, 6);
console.log("completo 10:", c.totalTickets, "esperado", C(10,6), "P(6 sorteadas no pool) 1 em", Math.round(C(60,6)/C(10,6)));
const caixa:any={6:[50063860,7151980,1787995,595998,238399,108363,54182,29175,16671,10003,6252,4045,2697,1845,1292],5:[154518,44981,17192,7791,3973,2211,1317,828,544,370,260,188,139,105,81],4:[2332,1038,539,312,195,129,90,65,48,37,29,23,19,16,13]};
let bate=0,difere:string[]=[];
for (let b=6;b<=20;b++){const f=calcularProbabilidades(60,6,b,[4,5,6]);
  for(const x of f){const ref=C(6,x.acertos)*C(54,b-x.acertos)/C(60,b);const err=Math.abs(x.probabilidade-ref)/ref;const cx=caixa[x.acertos][b-6];
   if(x.umEm===cx&&err<1e-12)bate++;else difere.push(`b=${b} k=${x.acertos}: site ${x.umEm} caixa ${cx} exato ${(1/ref).toFixed(3)} errRel ${err.toExponential(1)}`);}}
console.log("células iguais à Caixa:",bate,"de 45");difere.forEach(d=>console.log("  ",d));
for(const b of [6,10,20]){const f=calcularProbabilidades(60,6,b,[0,1,2,3,4,5,6]);console.log("b",b,"Σ todas",f.reduce((a,x)=>a+x.probabilidade,0).toFixed(12))}
for(const b of [21,30,54,55,60]){const f=calcularProbabilidades(60,6,b,[4,5,6]);console.log("b fora da regra",b,f.map(x=>`${x.acertos}:${x.umEm}`).join(" "))}
