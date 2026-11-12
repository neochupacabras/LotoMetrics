/* eslint-disable -- script de evidência da auditoria, fora do código do site */
// Reconstrói getAcumulos (lib/queries.ts:459) para a Mega-Sena.
import fs from 'fs';
const rows=JSON.parse(fs.readFileSync('ms_raw.json','utf8')).rows;
const virada=new Set([1140,1245,1350,1455,1560,1665,1775,1890,2000,2110,2220,2330,2440,2550,2670,2810,2955]);
const ac=[];let ini=null,dur=0;
for(const r of rows){const f=r.pf.find(x=>x.f===1);if(ini===null)ini=r.numero;dur++;if(f.g>0){ac.push({ini,fim:r.numero,dur,g:f.g,premio:f.v,virada:virada.has(r.numero),final05:r.numero%5===0});ini=null;dur=0}}
const d=ac.map(a=>a.dur);const media=d.reduce((a,b)=>a+b,0)/d.length;
const rec=[...ac].sort((a,b)=>b.dur-a.dur)[0],recP=[...ac].sort((a,b)=>b.premio-a.premio)[0];
console.log('séries',ac.length,'média',media.toFixed(2),'máx',rec.dur,`(${rec.ini}-${rec.fim})`,'| ≥3:',d.filter(x=>x>=3).length,'≥7:',d.filter(x=>x>=7).length,'≥15:',d.filter(x=>x>=15).length);
console.log('recorde de prêmio (por ganhador):',recP.premio.toFixed(2),'concurso',recP.fim,recP.virada?'(VIRADA)':'','duração',recP.dur);
console.log('séries que terminam numa Virada:',ac.filter(a=>a.virada).length,'; terminam em final 0/5:',ac.filter(a=>a.final05).length,'de',ac.length,`(esperado ao acaso ${(ac.length/5).toFixed(0)})`);
console.log('top 5 prêmios por ganhador:',[...ac].sort((a,b)=>b.premio-a.premio).slice(0,5).map(a=>`${a.fim}${a.virada?'V':''}:${(a.premio/1e6).toFixed(0)}mi(g${a.g})`).join(' '));
console.log('top 5 prêmios totais:',[...ac].sort((a,b)=>b.premio*b.g-a.premio*a.g).slice(0,5).map(a=>`${a.fim}${a.virada?'V':''}:${(a.premio*a.g/1e6).toFixed(0)}mi`).join(' '));
