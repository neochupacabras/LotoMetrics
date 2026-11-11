import fs from 'fs';
const F=JSON.parse(fs.readFileSync('lf_fns.json','utf8')).rows[0].r;const rows=JSON.parse(fs.readFileSync('lf_raw.json','utf8')).rows;
const m=(a,k)=>{const o={};a.forEach(r=>o[r[k]]=+r.percentual);return o};
const PI=m(F.parimpar,'pares'),SEQ=m(F.seq,'maior_sequencia'),PR=m(F.primos_d,'qtd_primos'),FI=m(F.fib_d,'qtd_fibonacci'),M3=m(F.m3_d,'qtd_multiplos');const MC={};F.mc_d.forEach(r=>MC[r.qtd_moldura]=+r.percentual);
const H={};let tot=0;F.hist.forEach(h=>{H[+h.faixa_inicio]=+h.ocorrencias;tot+=+h.ocorrencias});
const isP=new Set([2,3,5,7,11,13,17,19,23]),isF=new Set([1,2,3,5,8,13,21]);const mold=x=>{const l=Math.ceil(x/5),c=(x-1)%5+1;return l===1||l===5||c===1||c===5};
let inc=0;for(const r of rows){const d=r.dezenas;const s=d.reduce((a,b)=>a+b,0);const set=new Set(d);let best=0,run=0;for(let i=1;i<=25;i++){if(set.has(i)){run++;best=Math.max(best,run)}else run=0}
const v=[PI[d.filter(x=>x%2===0).length],Math.round(1000*(H[Math.floor(s/10)*10]||0)/tot)/10,PR[d.filter(x=>isP.has(x)).length],FI[d.filter(x=>isF.has(x)).length],M3[d.filter(x=>x%3===0).length],MC[d.filter(mold).length],SEQ[best]];if(Math.min(...v)<15)inc++}
console.log('concursos que o Destaque chamaria de "resultado incomum":',inc,'de',rows.length,(100*inc/rows.length).toFixed(1)+'%');
