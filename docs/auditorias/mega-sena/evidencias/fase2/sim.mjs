/* eslint-disable -- script de evidência da auditoria, fora do código do site */
// Retorno esperado exato de um jogo simples aleatório no histórico da
// Mega-Sena: Σ P(k acertos)·prêmio(k) / Σ preço. Compara preço atual
// (o que o simulador cobra) com o preço da época (notícias, não oficial).
import fs from 'fs';
const rows=JSON.parse(fs.readFileSync('ms_raw.json','utf8')).rows;
const C=(n,k)=>{let r=1;for(let i=0;i<k;i++)r=r*(n-i)/(i+1);return r};const T=C(60,6);
const P={6:1/T,5:C(6,5)*54/T,4:C(6,4)*C(54,2)/T};
const preco=d=>d>='2025-07-09'?6:d>='2023-04-30'?5:d>='2019-11-10'?4.5:d>='2015-05-24'?3.5:2.5;
const per=[['1996-01-01','2026-12-31','histórico completo'],['2015-05-24','2026-12-31','desde 24/05/2015'],['2023-04-30','2026-12-31','desde 30/04/2023']];
for(const [a,b,nome] of per){let E=0,c6=0,cEra=0,n=0,zeros=0;for(const r of rows){if(r.data<a||r.data>b)continue;n++;for(const f of r.pf){const k={1:6,2:5,3:4}[f.f];E+=P[k]*f.v;if(f.f===1&&f.g===0)zeros++}c6+=6;cEra+=preco(r.data)}
 console.log(nome.padEnd(20),'concursos',n,'| retorno com R$ 6 fixo',(100*E/c6).toFixed(1)+'%','| com preço da época',(100*E/cEra).toFixed(1)+'%','| sena acumulada (R$ 0)',zeros);}
