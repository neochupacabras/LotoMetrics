/* eslint-disable -- script de evidência da auditoria, fora do código do site */
// p-valor de Monte Carlo para a uniformidade das frequências, ciclo esperado
// exato (cadeia de Markov) e χ² por período.
import fs from 'fs';
const rows=JSON.parse(fs.readFileSync('ms_raw.json','utf8')).rows;
const U=60,M=6;const D=rows.map(r=>r.dezenas);
const stat=(Ds)=>{const n=Ds.length,f=Array(U+1).fill(0);Ds.forEach(d=>d.forEach(x=>f[x]++));const e=n*M/U,v=n*(M/U)*(1-M/U);let s=0;for(let i=1;i<=U;i++)s+=(f[i]-e)**2/v;return s*(U-1)/U};
const obs=stat(D);
let rng=12345;const rand=()=>{rng=(rng*1664525+1013904223)>>>0;return rng/4294967296};
const sorteio=()=>{const a=[...Array(U)].map((_,i)=>i+1);for(let i=0;i<M;i++){const j=i+Math.floor(rand()*(U-i));[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,M)};
const R=4000;let maior=0;const sims=[];for(let r=0;r<R;r++){const Ds=[];for(let i=0;i<D.length;i++)Ds.push(sorteio());const s=stat(Ds);sims.push(s);if(s>=obs)maior++}
console.log('χ² observado',obs.toFixed(1),'média simulada',(sims.reduce((a,b)=>a+b,0)/R).toFixed(1),'p Monte Carlo',(maior/R).toFixed(4),`(${maior}/${R})`);
// por período (blocos de ~500 concursos)
for(let i=0;i<D.length;i+=500){const b=D.slice(i,i+500);console.log(`concursos ${i+1}-${i+b.length}: χ²`,stat(b).toFixed(1))}
// ciclo esperado exato: estado = dezenas ainda faltantes (k); transição hipergeométrica
const C=(n,k)=>{if(k<0||k>n)return 0;let r=1;for(let i=0;i<k;i++)r=r*(n-i)/(i+1);return r};
const E=Array(U+1).fill(0); // E[k] = concursos esperados até zerar com k faltantes
for(let k=1;k<=U;k++){ // E[k] = 1 + Σ_j P(k→k-j) E[k-j], j = faltantes sorteadas
  const T=C(U,M);let p0=C(U-k,M)/T;let s=0;for(let j=1;j<=Math.min(k,M);j++)s+=C(k,j)*C(U-k,M-j)/T*E[k-j];E[k]=(1+s)/(1-p0)}
console.log('ciclo esperado (exato):',E[U].toFixed(3));
// distribuição do ciclo por simulação para comparar com 65 ciclos observados
const cs=[];for(let r=0;r<20000;r++){let falt=new Set([...Array(U)].map((_,i)=>i+1)),n=0;while(falt.size){n++;sorteio().forEach(x=>falt.delete(x))}cs.push(n)}
cs.sort((a,b)=>a-b);console.log('ciclo simulado: média',(cs.reduce((a,b)=>a+b,0)/cs.length).toFixed(2),'P5',cs[1000],'P50',cs[10000],'P95',cs[19000],'min',cs[0],'max',cs.at(-1));
