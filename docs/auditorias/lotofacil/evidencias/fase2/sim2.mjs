import fs from 'fs';
const rows=JSON.parse(fs.readFileSync('lf_raw.json','utf8')).rows;
// preço inferido por era (prêmio de 11 acertos = 2x preço), exceto 3780
const eras=[[1,1.00],[460,1.25],[1054,1.50],[1213,2.00],[1889,2.50],[2801,3.00],[3439,3.50]];
const preco=n=>{let p=1;for(const [i,v] of eras)if(n>=i)p=v;return p};
const g0={};rows.forEach(r=>r.pf.forEach(p=>{if(p.g===0)g0[p.f]=(g0[p.f]||0)+1}));console.log('concursos com faixa sem ganhador (por faixa):',g0);
// simula 2000 jogos aleatórios no histórico completo e nos últimos 100 (limite free?)
const sim=(lim)=>{const R=lim?rows.slice(-lim):rows;let ret3=0,retEra=0,n=0;const out=[];
 for(let s=0;s<2000;s++){const a=Array.from({length:25},(_,i)=>i+1);for(let i=0;i<15;i++){const j=i+Math.floor(Math.random()*(25-i));[a[i],a[j]]=[a[j],a[i]]}const jg=new Set(a.slice(0,15));
  let ganho=0,c35=0,cera=0;for(const r of R){const k=r.dezenas.filter(x=>jg.has(x)).length;const p=r.pf.find(x=>x.d===k+' acertos');if(p&&+p.v>0)ganho+=+p.v;c35+=3.5;cera+=preco(r.numero)}
  out.push([ganho/c35,ganho/cera])}
 const med=i=>{const v=out.map(o=>o[i]).sort((a,b)=>a-b);return (100*v[v.length>>1]).toFixed(1)};
 const mean=i=>(100*out.reduce((s,o)=>s+o[i],0)/out.length).toFixed(1);
 console.log(lim?`últimos ${lim}`:'histórico completo','retorno médio c/ R$3,50:',mean(0)+'%','c/ preço da época:',mean(1)+'%','| medianas',med(0),med(1));};
sim(null);sim(100);
