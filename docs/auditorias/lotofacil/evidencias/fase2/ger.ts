import fs from "fs";
import { gerarJogo, amostrarSubconjunto, gerarJogoDaData } from "C:/Users/Micro/Loterias/loterias-web/lib/gerar-jogo";
const F = JSON.parse(fs.readFileSync("C:/Users/Micro/AppData/Local/Temp/claude/485aef2293cb201b/590abb80-d7cc-4d84-9116-d67cdc1886d7/scratchpad/lf_fns.json","utf8")).rows[0].r;
const atr = [...F.atraso].sort((a:any,b:any)=>b.atraso-a.atraso||a.dezena-b.dezena).slice(0,10).map((r:any)=>r.dezena);
const freq = F.freq.slice(0,10).map((r:any)=>r.dezena);
const pi = [...F.parimpar].sort((a:any,b:any)=>b.ocorrencias-a.ocorrencias)[0];
const hb = [...F.hist].sort((a:any,b:any)=>b.ocorrencias-a.ocorrencias).slice(0,3);
const soma = {min:Math.min(...hb.map((b:any)=>+b.faixa_inicio)),max:Math.max(...hb.map((b:any)=>+b.faixa_fim))};
const primos = [...F.primos_d].sort((a:any,b:any)=>b.ocorrencias-a.ocorrencias).slice(0,2).map((r:any)=>r.qtd_primos);
const ciclo = F.ciclo_atual[0].dezenas_faltantes ?? [];
console.log("atrasadas",atr,"freq",freq,"interseção",atr.filter((d:number)=>freq.slice(0,2).includes(d)),"parimpar",pi.pares,"soma",soma,"primos",primos,"ciclo",ciclo);
// 1) sem filtros: uniformidade
const N=200000; const f=Array(26).fill(0); const par=new Map<string,number>(); let inval=0;
for(let i=0;i<N;i++){const r=gerarJogo({dezenaMin:1,dezenaMax:25,qtdDezenas:15});const d=r.dezenas;if(d.length!==15||new Set(d).size!==15||d.some(x=>x<1||x>25))inval++;d.forEach(x=>f[x]++);for(let a=0;a<3;a++){const k=d[a]+"-"+d[a+1];}}
let x2=0;for(let d=1;d<=25;d++)x2+=(f[d]-0.6*N)**2/(N*0.24);x2*=24/25;
console.log("sem filtros: inválidos",inval,"X2 freq(24gl)",x2.toFixed(1),"(esperado ~24; >43 = p<0.01)");
// soma média e variância
let sm=0,sq=0;for(let i=0;i<N;i++){const s=gerarJogo({dezenaMin:1,dezenaMax:25,qtdDezenas:15}).soma;sm+=s;sq+=s*s}const m=sm/N;console.log("soma média",m.toFixed(2),"var",(sq/N-m*m).toFixed(1),"(teórico 195 / 325)");
// 2) preset simples com dados reais
let ok=0,falhaVio=0,obrigExcl=0;const M=20000;const fp=Array(26).fill(0);
for(let i=0;i<M;i++){const ob=new Set<number>();amostrarSubconjunto(atr,2).forEach(d=>ob.add(d));if(ciclo.length)amostrarSubconjunto(ciclo,1).forEach(d=>ob.add(d));
 const exc=freq.slice(0,2); if([...ob].some(d=>exc.includes(d)))obrigExcl++;
 const r=gerarJogo({dezenaMin:1,dezenaMax:25,qtdDezenas:15,dezenasObrigatorias:[...ob],dezenasExcluidas:exc,somaFaixa:soma,parImparAlvo:{pares:pi.pares,impares:pi.impares},primosAlvo:primos});
 if(r.atendeuTodosFiltros){ok++;const s=r.soma, p=r.pares;const np=r.dezenas.filter(x=>[2,3,5,7,11,13,17,19,23].includes(x)).length;if(s<soma.min||s>soma.max||p!==pi.pares||!primos.includes(np))falhaVio++;}
 r.dezenas.forEach(d=>fp[d]++);
}
console.log("preset simples: atendeu",ok,"/",M,"violações entre os que 'atenderam'",falhaVio,"obrigatória que também era excluída",obrigExcl);
console.log("freq relativa por dezena no preset:",fp.slice(1).map((c,i)=>`${i+1}:${(c/M).toFixed(2)}`).join(" "));
// 3) caso impossível: soma 120..125 com 8 pares
let r3=gerarJogo({dezenaMin:1,dezenaMax:25,qtdDezenas:15,somaFaixa:{min:120,max:125},parImparAlvo:{pares:12,impares:3}});console.log("impossível -> atendeu",r3.atendeuTodosFiltros,r3.dezenas.join(","));
// 4) bordas
try{gerarJogo({dezenaMin:1,dezenaMax:25,qtdDezenas:15,dezenasExcluidas:Array.from({length:11},(_,i)=>i+1)});console.log("exclui 11: não lançou erro (ERRO)")}catch(e:any){console.log("exclui 11 -> erro:",e.message)}
const r5=gerarJogo({dezenaMin:1,dezenaMax:25,qtdDezenas:15,dezenasObrigatorias:[1,2],dezenasExcluidas:[1,2,3]});console.log("obrigatória e excluída ao mesmo tempo -> inclui 1 e 2?",r5.dezenas.includes(1)&&r5.dezenas.includes(2));
const r6=gerarJogo({dezenaMin:1,dezenaMax:25,qtdDezenas:15,dezenasObrigatorias:[5,5,7]});console.log("obrigatória duplicada -> tamanho",r6.dezenas.length,"distintas",new Set(r6.dezenas).size);
const r7=gerarJogo({dezenaMin:1,dezenaMax:25,qtdDezenas:20});console.log("20 dezenas ok",r7.dezenas.length===20&&new Set(r7.dezenas).size===20);
// 5) data
const a=gerarJogoDaData(new Date(2026,10,11),1,25,15),b=gerarJogoDaData(new Date(2026,10,11),1,25,15);console.log("data reprodutível",JSON.stringify(a)===JSON.stringify(b),a.dezenas.length,new Set(a.dezenas).size);
