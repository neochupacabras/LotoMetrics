/* eslint-disable -- script de evidência da auditoria, fora do código do site */
// Gerador (lib/gerar-jogo.ts) com parâmetros da Mega-Sena: validade,
// uniformidade sem filtros, preset do modo simples com os dados reais,
// casos impossíveis e bordas.
import fs from "fs";
import { gerarJogo, amostrarSubconjunto, gerarJogoDaData } from "../../../../../lib/gerar-jogo";
const F = JSON.parse(fs.readFileSync("ms_fns.json","utf8")).rows[0].r;
const ehP=(n:number)=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true};
const atr = [...F.atraso].sort((a:any,b:any)=>b.atraso-a.atraso||a.dezena-b.dezena).slice(0,10).map((r:any)=>r.dezena);
const freq = F.freq.slice(0,10).map((r:any)=>r.dezena);
const pi = [...F.parimpar].sort((a:any,b:any)=>b.ocorrencias-a.ocorrencias)[0];
const hb = [...F.hist].sort((a:any,b:any)=>b.ocorrencias-a.ocorrencias).slice(0,3);
const soma = {min:Math.min(...hb.map((b:any)=>+b.faixa_inicio)),max:Math.max(...hb.map((b:any)=>+b.faixa_fim))};
const primos = [...F.primos_d].sort((a:any,b:any)=>b.ocorrencias-a.ocorrencias).slice(0,2).map((r:any)=>r.qtd_primos);
const ciclo = F.ciclo_atual[0].dezenas_faltantes ?? [];
console.log("atrasadas",atr.join(","),"| freq",freq.join(","),"| par/ímpar",pi.pares,"| soma",soma,"| top3 faixas",hb.map((b:any)=>b.faixa_inicio).join(","),"| primos",primos,"| ciclo",ciclo.length,"faltantes");
const N=300000; const f=Array(61).fill(0); let inval=0, sm=0, sq=0;
for(let i=0;i<N;i++){const r=gerarJogo({dezenaMin:1,dezenaMax:60,qtdDezenas:6});const d=r.dezenas;if(d.length!==6||new Set(d).size!==6||d.some(x=>x<1||x>60))inval++;d.forEach(x=>f[x]++);sm+=r.soma;sq+=r.soma*r.soma}
let x2=0;for(let d=1;d<=60;d++)x2+=(f[d]-0.1*N)**2/(N*0.09);x2*=59/60;const m=sm/N;
console.log("sem filtros: inválidos",inval,"χ² freq (59 gl)",x2.toFixed(1),"(p<0,01 se >87,2) | soma média",m.toFixed(2),"var",(sq/N-m*m).toFixed(0),"(teórico 183 / 1647)");
let ok=0,vio=0;const M=30000;const fp=Array(61).fill(0);
for(let i=0;i<M;i++){const exc=freq.slice(0,2);const ob=new Set<number>();amostrarSubconjunto(atr,2,exc).forEach(d=>ob.add(d));if(ciclo.length)amostrarSubconjunto(ciclo,1,[...exc,...ob]).forEach(d=>ob.add(d));
 const r=gerarJogo({dezenaMin:1,dezenaMax:60,qtdDezenas:6,dezenasObrigatorias:[...ob],dezenasExcluidas:exc,somaFaixa:soma,parImparAlvo:{pares:pi.pares,impares:pi.impares},primosAlvo:primos});
 if(r.atendeuTodosFiltros){ok++;const np=r.dezenas.filter(ehP).length;if(r.soma<soma.min||r.soma>soma.max||r.pares!==pi.pares||!primos.includes(np)||r.dezenas.some(d=>exc.includes(d))||[...ob].some(d=>!r.dezenas.includes(d)))vio++;}
 r.dezenas.forEach(d=>fp[d]++);}
console.log("preset simples: atendeu",ok,"/",M,"| violações entre os que 'atenderam'",vio);
const top=fp.map((c,i)=>({d:i,p:c/M})).slice(1).sort((a,b)=>b.p-a.p);console.log("dezenas mais presentes no preset:",top.slice(0,6).map(x=>`${x.d}:${(100*x.p).toFixed(0)}%`).join(" "),"| menos:",top.slice(-4).map(x=>`${x.d}:${(100*x.p).toFixed(1)}%`).join(" "),"| sem filtro: 10%");
const r3=gerarJogo({dezenaMin:1,dezenaMax:60,qtdDezenas:6,somaFaixa:{min:21,max:25},parImparAlvo:{pares:6,impares:0}});console.log("impossível -> atendeu",r3.atendeuTodosFiltros,r3.filtrosNaoAtendidos,r3.dezenas.join(","));
try{const r=gerarJogo({dezenaMin:1,dezenaMax:60,qtdDezenas:6,dezenasExcluidas:Array.from({length:55},(_,i)=>i+1)});console.log("exclui 55 -> devolveu",r.dezenas)}catch(e:any){console.log("exclui 55 -> erro:",e.message)}
const r6=gerarJogo({dezenaMin:1,dezenaMax:60,qtdDezenas:6,dezenasObrigatorias:[5,5,7]});console.log("obrigatória duplicada -> tamanho",r6.dezenas.length,"distintas",new Set(r6.dezenas).size);
const r7=gerarJogo({dezenaMin:1,dezenaMax:60,qtdDezenas:20});console.log("20 dezenas ok",r7.dezenas.length===20&&new Set(r7.dezenas).size===20);
const a=gerarJogoDaData(new Date(2026,10,11),1,60,6),b=gerarJogoDaData(new Date(2026,10,11),1,60,6);console.log("data reprodutível",JSON.stringify(a)===JSON.stringify(b),a.dezenas.join(","));
// uniformidade do gerador por data: 20 anos de datas
const fd=Array(61).fill(0);let nd=0;for(let t=new Date(2000,0,1).getTime();t<new Date(2030,0,1).getTime();t+=86400000){gerarJogoDaData(new Date(t),1,60,6).dezenas.forEach(x=>fd[x]++);nd++}
let x2d=0;for(let d=1;d<=60;d++)x2d+=(fd[d]-0.1*nd)**2/(nd*0.09);console.log("data da sorte:",nd,"datas, χ² (59 gl)",(x2d*59/60).toFixed(1));
