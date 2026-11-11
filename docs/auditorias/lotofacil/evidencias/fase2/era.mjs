import fs from 'fs';
const rows=JSON.parse(fs.readFileSync('lf_raw.json','utf8')).rows;
const chi2p=(x,k)=>{const z=(Math.cbrt(x/k)-(1-2/(9*k)))/Math.sqrt(2/(9*k));const t=1/(1+0.2316419*Math.abs(z));const d=0.3989423*Math.exp(-z*z/2);let p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z>0?p:1-p};
const run=(sub,label)=>{const f=Array(26).fill(0);sub.forEach(r=>r.dezenas.forEach(x=>f[x]++));const N=sub.length;let x=0;const z=[];for(let d=1;d<=25;d++){const zz=(f[d]-0.6*N)/Math.sqrt(N*0.24);x+=zz*zz;z.push(zz.toFixed(1))}x*=24/25;console.log(label,'N',N,'X2',x.toFixed(1),'p≈',chi2p(x,24).toExponential(1));return z};
const z=run(rows,'tudo');console.log('z por dezena',z.join(' '));
const step=500;for(let i=0;i<rows.length;i+=step)run(rows.slice(i,i+step),`${rows[i].numero}-${rows[Math.min(i+step,rows.length)-1].numero} (${rows[i].data.slice(0,4)})`);
// Monte Carlo para calibrar p-valor sem aproximação: simula 2000 históricos
let maior=0;const N=rows.length;const obs=59.01*24/25;
for(let s=0;s<2000;s++){const f=Array(26).fill(0);for(let t=0;t<N;t++){const a=Array.from({length:25},(_,i)=>i+1);for(let i=0;i<15;i++){const j=i+Math.floor(Math.random()*(25-i));[a[i],a[j]]=[a[j],a[i]];f[a[i]]++}}let x=0;for(let d=1;d<=25;d++)x+=(f[d]-0.6*N)**2/(N*0.24);x*=24/25;if(x>=obs)maior++}
console.log('Monte Carlo: fração de históricos simulados com X2 >= observado:',maior/2000);
