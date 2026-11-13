/* eslint-disable -- script de evidência da auditoria, fora do código do site */
// Equilíbrio (lib/equilibrio.ts, pesos da Mega-Sena) sobre TODAS as
// 50.063.860 combinações e sobre os sorteios reais; Destaques
// (lib/destaques.ts): quantos concursos seriam "resultado incomum".
import fs from 'fs';
const F=JSON.parse(fs.readFileSync('ms_fns.json','utf8')).rows[0].r;
const rows=JSON.parse(fs.readFileSync('ms_raw.json','utf8')).rows;
const tot=F.parimpar.reduce((s,p)=>s+ +p.ocorrencias,0);
const mapP=(arr,k)=>{const m={};arr.forEach(r=>m[r[k]]=+r.percentual);return m};
const PI=mapP(F.parimpar,'pares'),SEQ=mapP(F.seq,'maior_sequencia'),PR=mapP(F.primos_d,'qtd_primos'),FI=mapP(F.fib_d,'qtd_fibonacci'),M3=mapP(F.m3_d,'qtd_multiplos'),MC=mapP(F.mc_d,'qtd_moldura');
const H={};F.hist.forEach(h=>H[+h.faixa_inicio]=+h.ocorrencias);
const sc=p=>Math.min(100,Math.round(p/12*100));
const W={soma:.30,pares:.25,seq:.15,pr:.10,fi:.10,m3:.10};
const ehP=n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true};
const isP=Array(61).fill(false).map((_,i)=>ehP(i)),isF=Array(61).fill(false);[1,2,3,5,8,13,21,34,55].forEach(x=>isF[x]=true);
const metr=d=>{let s=0,p=0,pr=0,fi=0,m3=0,best=1,run=1;for(let i=0;i<6;i++){const x=d[i];s+=x;if(x%2===0)p++;if(isP[x])pr++;if(isF[x])fi++;if(x%3===0)m3++;if(i>0){run=x===d[i-1]+1?run+1:1;if(run>best)best=run}}return{s,p,pr,fi,m3,best}};
const nota=m=>Math.round(sc((H[Math.floor(m.s/10)*10]||0)/tot*100)*W.soma+sc(PI[m.p]||0)*W.pares+sc(SEQ[m.best]||0)*W.seq+sc(PR[m.pr]||0)*W.pr+sc(FI[m.fi]||0)*W.fi+sc(M3[m.m3]||0)*W.m3);
const cls=n=>n>=75?'tipico':n>=55?'equilibrado':n>=35?'razoavel':'atipico';
const cnt={},notas=Array(101).fill(0);let n=0;const d=[0,0,0,0,0,0];
for(d[0]=1;d[0]<=55;d[0]++)for(d[1]=d[0]+1;d[1]<=56;d[1]++)for(d[2]=d[1]+1;d[2]<=57;d[2]++)for(d[3]=d[2]+1;d[3]<=58;d[3]++)for(d[4]=d[3]+1;d[4]<=59;d[4]++)for(d[5]=d[4]+1;d[5]<=60;d[5]++){const x=nota(metr(d));notas[x]++;n++}
for(let i=0;i<=100;i++)cnt[cls(i)]=(cnt[cls(i)]||0)+notas[i];
console.log('Equilíbrio, todas as',n,'combinações:',Object.fromEntries(Object.entries(cnt).map(([k,c])=>[k,(100*c/n).toFixed(1)+'%'])),'nota máxima atingível',notas.findLastIndex(c=>c>0),'% com a nota máxima',(100*notas[notas.findLastIndex(c=>c>0)]/n).toFixed(1));
const cs={};rows.forEach(r=>{const c=cls(nota(metr([...r.dezenas].sort((a,b)=>a-b))));cs[c]=(cs[c]||0)+1});console.log('sorteios reais:',Object.fromEntries(Object.entries(cs).map(([k,c])=>[k,(100*c/rows.length).toFixed(1)+'%'])));
console.log('score máx por critério: soma',sc(Math.max(...Object.values(H))/tot*100),'pares',sc(Math.max(...Object.values(PI))),'seq',sc(Math.max(...Object.values(SEQ))),'primos',sc(Math.max(...Object.values(PR))),'fib',sc(Math.max(...Object.values(FI))),'m3',sc(Math.max(...Object.values(M3))));
console.log('maior % de uma faixa de soma (10):',(Math.max(...Object.values(H))/tot*100).toFixed(2));
// Destaques: menor % entre os candidatos (soma em faixa de 10 com 1 casa, demais como no SQL)
const molde=x=>{const l=Math.ceil(x/6),c=(x-1)%6+1;return l===1||l===10||c===1||c===6};
let inc=0,porSoma=0;for(const r of rows){const ds=[...r.dezenas].sort((a,b)=>a-b);const m=metr(ds);const mc=ds.filter(molde).length;
 const cand=[{k:'pi',p:PI[m.p]},{k:'soma',p:Math.round((H[Math.floor(m.s/10)*10]||0)/tot*1000)/10},{k:'pr',p:PR[m.pr]},{k:'fi',p:FI[m.fi]},{k:'m3',p:M3[m.m3]},{k:'mc',p:MC[mc]},{k:'seq',p:SEQ[m.best]}].sort((a,b)=>a.p-b.p);
 if(cand[0].p<15){inc++;if(cand[0].k==='soma')porSoma++}}
console.log('Destaques: concursos marcados "resultado incomum":',inc,'de',rows.length,`(${(100*inc/rows.length).toFixed(1)}%)`,'; o "fato" escolhido é a soma em',porSoma);
