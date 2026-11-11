// Referência independente: enumera todos os 15-subconjuntos de {1..25} (Gosper).
import fs from 'fs';
const T=3268760;
const seq={}, soma={}, joint={};
let n=0, v=(1<<15)-1; const lim=1<<25;
while(v<lim){
  n++;
  let s=0, run=0, best=0;
  for(let i=0;i<25;i++){ if(v>>i&1){ s+=i+1; run++; if(run>best)best=run; } else run=0; }
  seq[best]=(seq[best]||0)+1; soma[s]=(soma[s]||0)+1;
  const c=v&-v, r=v+c; v=(((r^v)>>>2)/c)|r;
}
console.log('total',n, n===T);
const pct=o=>Object.fromEntries(Object.entries(o).map(([k,c])=>[k,+(100*c/T).toFixed(3)]));
console.log('SEQ',JSON.stringify(pct(seq)));
// CDF soma em %, 1 casa como no código
const cdf=[];let acc=0;for(let s=120;s<=270;s++){acc+=soma[s]||0;cdf.push(+(100*acc/T).toFixed(1))}
fs.writeFileSync('ref_enum.json',JSON.stringify({seq,soma,cdf}));
// média/variância
let m=0,q=0;for(const [k,c] of Object.entries(soma)){m+=k*c;q+=k*k*c}m/=T;console.log('media',m,'var',q/T-m*m);
