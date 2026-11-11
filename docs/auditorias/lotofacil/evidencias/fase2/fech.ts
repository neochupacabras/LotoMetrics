import { gerarFechamentoReduzido, gerarFechamentoCompleto } from "../../../../../lib/fechamento";
import { OPCOES_BOLAO } from "../../../../../lib/bolao-opcoes";
import { probabilidadeAoMenosK, calcularProbabilidades } from "../../../../../lib/probabilidades";
// verificador independente: para cada k-subconjunto do pool (por enumeração própria em bitmask), existe ticket que o contém?
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
function poolAleatorio(v:number){const a=Array.from({length:25},(_,i)=>i+1);for(let i=24;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,v)}
console.log("v k | tabela gerado | verif.indep | tickets válidos | min.teórico(Schönheim) | P(cond) 1 em | tempo ms");
for (const o of OPCOES_BOLAO.lotofacil) {
  const pool = poolAleatorio(o.tamanhoPool);
  const t0 = Date.now();
  const r = gerarFechamentoReduzido(pool, 15, o.garantia);
  const ms = Date.now() - t0;
  const validos = r.tickets.every(t => t.length === 15 && new Set(t).size === 15 && t.every(d => pool.includes(d)));
  const dup = new Set(r.tickets.map(t => t.join(","))).size !== r.tickets.length;
  const ok = verifica(pool, r.tickets, o.garantia);
  console.log(o.tamanhoPool, o.garantia, "|", o.totalJogos, r.totalTickets, "|", ok, r.garantiaVerificada, "|", validos, dup ? "DUPLICADOS" : "sem dup", "|", schonheim(o.tamanhoPool, 15, o.garantia), "| completo", C(o.tamanhoPool,15), "|", Math.round(1/probabilidadeAoMenosK(25,15,o.tamanhoPool,o.garantia)), "|", ms);
}
// completo
const p18 = poolAleatorio(18); const c = gerarFechamentoCompleto(p18, 15);
console.log("completo 18:", c.totalTickets, "esperado", C(18,15), "P(15 sorteadas no pool) 1 em", Math.round(C(25,15)/C(18,15)));
// probabilidades vs referência e Caixa
const caixa:any={15:[3268760,204298,24035,4006,843,211],14:[21792,3027,601,153,47,17],13:[692,162,49,18,8,4.2],12:[60,21,9,5,3.2,2.6],11:[11,6,4,3,2.9,3.9]};
for (let b=15;b<=20;b++){const f=calcularProbabilidades(25,15,b,[11,12,13,14,15]);
  const linha=f.map(x=>{const ref=C(15,x.acertos)*C(10,b-x.acertos)/C(25,b);const errRel=Math.abs(x.probabilidade-ref)/ref;return `${x.acertos}:${x.umEm}(caixa ${caixa[x.acertos][b-15]}, exato ${(1/ref).toFixed(2)}, err ${errRel.toExponential(0)})`});
  const soma=f.reduce((a,x)=>a+x.probabilidade,0);console.log("b="+b, linha.join(" "), "Σfaixas", soma.toFixed(4));}
// soma de todas as faixas 0..15 = 1 (b=15..20)
for(let b=15;b<=20;b++){const f=calcularProbabilidades(25,15,b,Array.from({length:16},(_,i)=>i));console.log("b",b,"Σ todas",f.reduce((a,x)=>a+x.probabilidade,0).toFixed(12),"suporte",f.map(x=>x.acertos).join(","))}
