import fs from 'fs';
const rows=JSON.parse(fs.readFileSync('lf_raw.json','utf8')).rows;const D=rows.map(r=>r.dezenas);const N=D.length;
const H=JSON.parse(fs.readFileSync('ref_hist.json','utf8'));
const C=(n,k)=>{if(k<0||k>n)return 0;let r=1;for(let i=0;i<k;i++)r=r*(n-i)/(i+1);return r};
// qui-quadrado aproximado: p-valor via Wilson-Hilferty
const chi2p=(x,k)=>{const z=(Math.cbrt(x/k)-(1-2/(9*k)))/Math.sqrt(2/(9*k));const t=1/(1+0.2316419*Math.abs(z));const d=0.3989423*Math.exp(-z*z/2);let p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z>0?p:1-p};
// frequência: E=0.6N; variância por dezena 0.24N; soma correlacionada -> usa estatística sum((o-e)^2/e)*(N... ) aproximação: para hipergeométrico multivariado, X2=sum (o-e)^2/(N*15/25) * (24/10)?  usar teste exato: var(o)=N*0.6*0.4 ; X2 = sum((o-e)^2)/(N*0.24) ~ chi2(24) (correção por soma fixa)
const e=0.6*N;let x2=0;for(let d=1;d<=25;d++)x2+=(H.freq[d]-e)**2/(N*0.24);
console.log('freq: esperado',e.toFixed(1),'min',Math.min(...H.freq.slice(1)),'max',Math.max(...H.freq.slice(1)),'X2',x2.toFixed(2),'gl 24 p≈',chi2p(x2*24/25,24).toFixed(3));
const test=(name,K,f)=>{const o={};D.forEach(d=>{const k=d.filter(f).length;o[k]=(o[k]||0)+1});let x=0,g=0,row=[];let poolE=0,poolO=0;
 for(let k=0;k<=15;k++){const p=C(K,k)*C(25-K,15-k)/C(25,15);if(p===0)continue;const E=N*p,O=o[k]||0;row.push(`${k}:${O}/${E.toFixed(0)}`);if(E<5){poolE+=E;poolO+=O;continue}x+=(O-E)**2/E;g++}
 if(poolE>0){x+=(poolO-poolE)**2/poolE;g++}console.log(name,'X2',x.toFixed(1),'gl',g-1,'p≈',chi2p(x,g-1).toFixed(3),row.join(' '))};
test('pares',12,x=>x%2===0);test('primos',9,x=>[2,3,5,7,11,13,17,19,23].includes(x));test('fibo',7,x=>[1,2,3,5,8,13,21].includes(x));test('mult3',8,x=>x%3===0);
test('moldura',16,x=>{const l=Math.ceil(x/5),c=(x-1)%5+1;return l===1||l===5||c===1||c===5});
// repetidas: mesma hipergeométrica com K=15
const o={};for(let i=1;i<N;i++){const s=new Set(D[i-1]);const k=D[i].filter(x=>s.has(x)).length;o[k]=(o[k]||0)+1}
console.log('repetidas obs/esp:',Array.from({length:11},(_,i)=>i+5).map(k=>`${k}:${o[k]||0}/${((N-1)*C(15,k)*C(10,15-k)/C(25,15)).toFixed(0)}`).join(' '));
// ciclo: cadeia de Markov no nº de faltantes f; P(f->f') ; sorteio de 15 de 25 cobre j das f faltantes: C(f,j)C(25-f,15-j)/C(25,15)
let Ecyc=Array(26).fill(0);// E[T | f faltantes]
for(let f=1;f<=25;f++){const p0=C(25-f,15)/C(25,15);let s=1;for(let j=1;j<=f;j++)s+=C(f,j)*C(25-f,15-j)/C(25,15)*Ecyc[f-j];Ecyc[f]=s/(1-p0)}
const L=H.ciclos.map(c=>c.q);const m=L.reduce((a,b)=>a+b,0)/L.length;
// distribuição teórica do comprimento
let dist=new Map([[25,1]]);const P=[];for(let t=1;t<=40;t++){const nd=new Map();let fin=0;for(const [f,p] of dist){for(let j=0;j<=f;j++){const q=C(f,j)*C(25-f,15-j)/C(25,15);if(!q)continue;const g=f-j;if(g===0)fin+=p*q;else nd.set(g,(nd.get(g)||0)+p*q)}}P.push(fin);dist=nd}
const obs={};L.forEach(l=>obs[l]=(obs[l]||0)+1);
console.log('ciclos: n',L.length,'média obs',m.toFixed(3),'teórica',Ecyc[25].toFixed(3),'min',Math.min(...L),'max',Math.max(...L));
console.log('ciclo comp obs/esp:',P.slice(0,12).map((p,i)=>`${i+1}:${obs[i+1]||0}/${(p*L.length).toFixed(1)}`).filter((_,i)=>i>=1).join(' '));
// maior atraso: P(atraso>=g)=0.4^g; maior atraso observado por dezena
console.log('maior atraso por dezena:',H.gapMax.slice(1).join(','));
// expectativa do maior atraso em ~2295 aparições: aprox log(n)/log(2.5)
console.log('referência: maior gap esperado ≈', (Math.log(0.6*N)/Math.log(1/0.4)).toFixed(1));
