/* eslint-disable -- script de evidência da auditoria, fora do código do site */
// Calibra o modelo da Projeção de acúmulo (lib/probabilidades.ts:213) com os
// concursos reais da Mega-Sena: P(ganhador) = 1 − (1 − p)^(arrecadação/preço),
// fator +20% por concurso acumulado.
import fs from 'fs';
const rows=JSON.parse(fs.readFileSync('ms_raw.json','utf8')).rows;const T=50063860;
const preco=d=>d>='2025-07-09'?6:d>='2023-04-30'?5:d>='2019-11-10'?4.5:d>='2015-05-24'?3.5:2.5; // notícias (não oficial)
const g1=r=>r.pf.find(x=>x.f===1).g;
const virada=new Set([1140,1245,1350,1455,1560,1665,1775,1890,2000,2110,2220,2330,2440,2550,2670,2810,2955]);
const grupos={normal:{n:0,p:0,w:0,lam:0,g:0},final05:{n:0,p:0,w:0,lam:0,g:0},virada:{n:0,p:0,w:0,lam:0,g:0}};
for(const r of rows){const a=+r.arrec;if(!a||r.data<'2016-01-01')continue;const lam=a/preco(r.data)/T;const p=1-Math.exp(-lam);
 const k=virada.has(r.numero)?'virada':(r.numero%5===0?'final05':'normal');const G=grupos[k];G.n++;G.p+=p;G.w+=g1(r)>0?1:0;G.lam+=lam;G.g+=g1(r)}
for(const [k,G] of Object.entries(grupos))console.log(k.padEnd(8),'n',G.n,'P(ganhador) previsto',(G.p/G.n).toFixed(3),'observado',(G.w/G.n).toFixed(3),'| ganhadores previstos',G.lam.toFixed(0),'observados',G.g);
// fator de crescimento da arrecadação por concurso acumulado (concursos normais desde 2016)
const byAc={};let ac=0;
for(let i=0;i<rows.length;i++){const r=rows[i];if(i>0){const prev=rows[i-1];ac=g1(prev)===0&&!virada.has(prev.numero)?ac+1:0}
 if(r.data<'2016-01-01'||!+r.arrec||virada.has(r.numero))continue;const b=Math.min(ac,12);(byAc[b]??=[]).push(+r.arrec/preco(r.data))}
const med=a=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]};const base=med(byAc[0]);
console.log('apostas simples equivalentes (mediana) por nº de concursos acumulados antes; razão observada x fator do modelo (1+0,2k, máx 5):');
for(const [k,v] of Object.entries(byAc))console.log(' k',k.padStart(2),'n',String(v.length).padStart(3),'mediana',(med(v)/1e6).toFixed(1)+' mi','razão',(med(v)/base).toFixed(2),'modelo',Math.min(1+0.2*k,5).toFixed(2));
// final 0/5: o prêmio estimado é maior?
let e05=[],eN=[];for(const r of rows.filter(r=>r.data>='2024-01-01'&&!virada.has(r.numero)))(r.numero%5===0?e05:eN).push(+r.pf[0].v*Math.max(1,g1(r)));
console.log('valor total pago na sena (concursos com ganhador, desde 2024): final 0/5 mediana',(med(e05.filter(x=>x>0))/1e6).toFixed(1),'mi; demais',(med(eN.filter(x=>x>0))/1e6).toFixed(1),'mi');
// o que a página mostra hoje
const u=rows.at(-1);let acn=0;for(let i=rows.length-1;i>=0&&g1(rows[i])===0;i--)acn++;
const Tk=Math.round(+u.arrec/6*Math.min(1+acn*0.2,5));const P=t=>1-Math.pow(1-1/T,t);
console.log('último',u.numero,u.data,'arrec',u.arrec,'acumulados',acn,'tickets',Tk,'P',P(Tk).toFixed(3),'próximo concurso',u.numero+1,(u.numero+1)%5===0?'(FINAL 0/5)':'');
console.log('ticketsMedios 80 mi (usado sem arrecadação) x mediana real desde 2024:',(med(rows.filter(r=>r.data>='2024-01-01'&&!virada.has(r.numero)).map(r=>+r.arrec/preco(r.data)))/1e6).toFixed(1),'mi');
