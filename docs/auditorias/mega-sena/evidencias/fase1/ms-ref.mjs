/* eslint-disable -- script de evidência da auditoria, fora do código do site */
// Referência independente da Mega-Sena: enumera as C(60,6) combinações.
const N=60,M=6;
const C=(n,k)=>{if(k<0||k>n)return 0n;let r=1n;for(let i=0n;i<BigInt(k);i++)r=r*(BigInt(n)-i)/(i+1n);return r;};
const TOT=Number(C(N,M));
const ehPrimo=n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true;};
const primos=[...Array(N)].map((_,i)=>i+1).filter(ehPrimo);
const fib=[1,2,3,5,8,13,21,34,55];
const m3=[...Array(N)].map((_,i)=>i+1).filter(x=>x%3===0);
const borda=(cols)=>{const rows=Math.ceil(N/cols);return new Set([...Array(N)].map((_,i)=>i+1).filter(d=>{const r=Math.ceil(d/cols),c=(d-1)%cols+1;return r===1||r===rows||c===1||c===cols;}));};
const mold6=borda(6), mold10=borda(10);
const hip=(K)=>{const o={};for(let x=0;x<=M;x++)o[x]=+(100*Number(C(K,x)*C(N-K,M-x))/TOT).toFixed(4);return o;};
console.log("TOT",TOT,"primos",primos.length,primos.join(","));
console.log("pares K=30",JSON.stringify(hip(30)));
console.log("primos K=17",JSON.stringify(hip(17)));
console.log("fib K=9",JSON.stringify(hip(9)));
console.log("m3 K=20",JSON.stringify(hip(20)));
console.log("moldura grade 6 col (10x6) K="+mold6.size,JSON.stringify(hip(mold6.size)));
console.log("moldura grade 10 col (6x10) K="+mold10.size,JSON.stringify(hip(mold10.size)));
// enumeração: maior sequência e soma
const seq={},soma={};let n=0;
for(let a=1;a<=55;a++)for(let b=a+1;b<=56;b++)for(let c=b+1;c<=57;c++)for(let d=c+1;d<=58;d++)for(let e=d+1;e<=59;e++)for(let f=e+1;f<=60;f++){
 const v=[a,b,c,d,e,f];let mx=1,at=1;for(let i=1;i<6;i++){if(v[i]===v[i-1]+1){at++;if(at>mx)mx=at;}else at=1;}
 seq[mx]=(seq[mx]||0)+1;const s=a+b+c+d+e+f;soma[s]=(soma[s]||0)+1;n++;}
console.log("enumeradas",n);
console.log("maior seq %",JSON.stringify(Object.fromEntries(Object.entries(seq).map(([k,v])=>[k,+(100*v/TOT).toFixed(4)]))));
const ks=Object.keys(soma).map(Number).sort((x,y)=>x-y);let ac=0,med=0,mmin=ks[0],mmax=ks[ks.length-1];
const cdf={};for(const k of ks){ac+=soma[k];cdf[k]=100*ac/TOT;med+=k*soma[k];}
console.log("soma min",mmin,"max",mmax,"media",med/TOT);
let vari=0;for(const k of ks)vari+=soma[k]*(k-med/TOT)**2;console.log("dp",Math.sqrt(vari/TOT));
// faixa central "142–224" do AnalisadorClient
const faixa=(lo,hi)=>ks.filter(k=>k>=lo&&k<=hi).reduce((t,k)=>t+soma[k],0)/TOT*100;
console.log("% soma 142..224",faixa(142,224).toFixed(2));
// percentis
for(const p of [5,10,25,50,75,90,95]){console.log("P"+p,ks.find(k=>cdf[k]>=p));}
import fs from "fs";fs.writeFileSync(process.argv[2],JSON.stringify({cdf,soma}));
