/* eslint-disable -- script de evidência da auditoria, fora do código do site */
// Reconstrói, a partir dos concursos brutos, cada estatística que as funções
// SQL entregam para a Mega-Sena (loteria_id = 2) e compara.
import fs from 'fs';
const rows=JSON.parse(fs.readFileSync('ms_raw.json','utf8')).rows;
const F=JSON.parse(fs.readFileSync('ms_fns.json','utf8')).rows[0].r;
const U=60,M=6,COLS=6; // grade usada pelo banco (grid_colunas = 6)
const D=rows.map(r=>r.dezenas); const N=D.length; const nums=rows.map(r=>r.numero);
let ok=0,bad=0; const chk=(name,a,b)=>{const sa=JSON.stringify(a),sb=JSON.stringify(b); if(sa===sb){ok++;console.log('OK  ',name)} else {bad++;console.log('DIFF',name,'\n  ref',sa.slice(0,400),'\n  sql',sb.slice(0,400))}};
const by=(arr,k)=>[...arr].sort((x,y)=>x[k]-y[k]);
const R=Array.from({length:U},(_,i)=>i+1);
let inval=0;D.forEach(d=>{if(d.length!==M||new Set(d).size!==M||d.some(x=>x<1||x>U||!Number.isInteger(x)))inval++;});
console.log('concursos',N,'invalidos',inval,'contiguo',nums.every((n,i)=>n===i+1));
const freq=Array(U+1).fill(0);D.forEach(d=>d.forEach(x=>freq[x]++));
chk('freq',R.map(d=>({d,f:freq[d]})), by(F.freq.map(r=>({d:r.dezena,f:+r.frequencia})),'d'));
const f100=Array(U+1).fill(0);D.slice(-100).forEach(d=>d.forEach(x=>f100[x]++));
chk('freq100',R.map(d=>({d,f:f100[d]})).filter(x=>x.f>0), by(F.freq100.map(r=>({d:r.dezena,f:+r.frequencia})),'d'));
const last=Array(U+1).fill(0), first=Array(U+1).fill(0), gapMax=Array(U+1).fill(0);
D.forEach((d,i)=>d.forEach(x=>{const n=nums[i]; if(!first[x])first[x]=n; else gapMax[x]=Math.max(gapMax[x],n-last[x]-1); last[x]=n;}));
const maxN=nums[N-1];
chk('atraso',R.map(d=>({d,a:maxN-last[d]})), by(F.atraso.map(r=>({d:r.dezena,a:r.atraso})),'d'));
chk('maior_atraso(entre aparições)',R.map(d=>({d,m:gapMax[d]})), by(F.maior_atraso.map(r=>({d:r.dezena,m:+r.maior_atraso})),'d'));
const cmpAtual=[];for(const x of R){const cur=maxN-last[x]; const ini=first[x]-1; if(cur>gapMax[x]||ini>gapMax[x])cmpAtual.push({d:x,atual:cur,inicio:ini,maior:gapMax[x]})}
console.log('dezenas com atraso atual ou inicial > maior atraso registrado (LF-10):',JSON.stringify(cmpAtual));
const distr=(f)=>{const c={};D.forEach(d=>{const k=f(d);c[k]=(c[k]||0)+1});return c};
const pctOf=(c,n=N)=>Object.entries(c).map(([k,v])=>({k:+k,o:v,p:Math.round(10000*v/n)/100})).sort((a,b)=>a.k-b.k);
const ehP=n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true};
const FIB=new Set([1,2,3,5,8,13,21,34,55]);
const rows_=Math.ceil(U/COLS);
const molde=x=>{const l=Math.ceil(x/COLS),c=(x-1)%COLS+1;return l===1||l===rows_||c===1||c===COLS};
const run=d=>{const s=[...d].sort((a,b)=>a-b);let b=1,r=1;for(let i=1;i<s.length;i++){r=s[i]===s[i-1]+1?r+1:1;b=Math.max(b,r)}return b};
const sqlD=(arr,key)=>by(arr.map(r=>({k:+r[key],o:+r.ocorrencias,p:+r.percentual})),'k');
chk('par_impar',pctOf(distr(d=>d.filter(x=>x%2===0).length)),sqlD(F.parimpar,'pares'));
chk('primos_d',pctOf(distr(d=>d.filter(ehP).length)),sqlD(F.primos_d,'qtd_primos'));
chk('fib_d',pctOf(distr(d=>d.filter(x=>FIB.has(x)).length)),sqlD(F.fib_d,'qtd_fibonacci'));
chk('m3_d',pctOf(distr(d=>d.filter(x=>x%3===0).length)),sqlD(F.m3_d,'qtd_multiplos'));
chk('moldura_d (grade 10x6)',pctOf(distr(d=>d.filter(molde).length)),sqlD(F.mc_d,'qtd_moldura'));
chk('seq_d',pctOf(distr(run)),sqlD(F.seq,'maior_sequencia'));
const rep={};for(let i=1;i<N;i++){const s=new Set(D[i-1]);const k=D[i].filter(x=>s.has(x)).length;rep[k]=(rep[k]||0)+1}
chk('repetidas',pctOf(rep,N-1),sqlD(F.rep,'qtd_repetidas'));
const S=D.map(d=>d.reduce((a,b)=>a+b,0)).sort((a,b)=>a-b);const mean=S.reduce((a,b)=>a+b,0)/N;
const med=N%2?S[(N-1)/2]:(S[N/2-1]+S[N/2])/2;
chk('soma',{min:S[0],max:S[N-1],media:Math.round(mean*100)/100,mediana:med},{min:+F.soma[0].minimo,max:+F.soma[0].maximo,media:+F.soma[0].media,mediana:+F.soma[0].mediana});
const h={};S.forEach(s=>{const b=Math.floor(s/10)*10;h[b]=(h[b]||0)+1});
chk('hist_soma',Object.entries(h).map(([k,v])=>({i:+k,o:v})).sort((a,b)=>a.i-b.i),F.hist.map(r=>({i:+r.faixa_inicio,o:+r.ocorrencias})));
const L=Array(rows_+1).fill(0),C=Array(COLS+1).fill(0);D.forEach(d=>d.forEach(x=>{L[Math.ceil(x/COLS)]++;C[(x-1)%COLS+1]++}));
chk('linhas (10)',L.slice(1),F.lin.map(r=>+r.frequencia));chk('colunas (6)',C.slice(1),F.col.map(r=>+r.frequencia));
const du={};D.forEach(d=>{const s=[...d].sort((a,b)=>a-b);for(let i=0;i<M;i++)for(let j=i+1;j<M;j++){const k=s[i]+'-'+s[j];du[k]=(du[k]||0)+1}});
const duTop=Object.values(du).sort((a,b)=>b-a);
chk('duques top 400 contagens',duTop.slice(0,F.duques.length),F.duques.map(r=>+r.ocorrencias));
console.log('duques distintos já saídos',Object.keys(du).length,'de 1770; máx',duTop[0],'esperado por duque',(N*15/1770).toFixed(2));
const tr={};D.forEach(d=>{const s=[...d].sort((a,b)=>a-b);for(let i=0;i<M;i++)for(let j=i+1;j<M;j++)for(let k=j+1;k<M;k++){const key=s[i]+'-'+s[j]+'-'+s[k];tr[key]=(tr[key]||0)+1}});
chk('trincas distintas',Object.keys(tr).length,+F.trincas_n);
const topT=Object.values(tr).sort((a,b)=>b-a).slice(0,30);chk('trincas top30 contagens',topT,F.trincas.map(r=>+r.ocorrencias));
const ciclos=[];let vis=new Set(),ini=null;D.forEach((d,i)=>{if(ini===null)ini=nums[i];d.forEach(x=>vis.add(x));if(vis.size===U){ciclos.push({ini,fim:nums[i],q:nums[i]-ini+1});vis=new Set();ini=null}});
chk('ciclos',ciclos,F.ciclos.map(r=>({ini:r.concurso_inicio,fim:r.concurso_fim,q:r.qtd_concursos})));
chk('ciclo_atual',{ini,q:ini===null?null:maxN-ini+1,falt:R.filter(x=>!vis.has(x))},{ini:F.ciclo_atual[0].concurso_inicio,q:F.ciclo_atual[0].concursos_no_ciclo,falt:F.ciclo_atual[0].dezenas_faltantes??[]});
const sd=[];for(const x of R){let b=0,r=0;D.forEach(d=>{if(d.includes(x)){r++;b=Math.max(b,r)}else r=0});sd.push({d:x,m:b})}
chk('seq_concursos_dezena',sd,by(F.seq_dezena.map(r=>({d:r.dezena,m:r.maior_sequencia_concursos})),'d'));
console.log('\nOK',ok,'DIFF',bad);
// estatística descritiva para a Fase 2
const qs=ciclos.map(c=>c.q);console.log('ciclos:',qs.length,'média',(qs.reduce((a,b)=>a+b,0)/qs.length).toFixed(2),'min',Math.min(...qs),'max',Math.max(...qs));
const fr=R.map(d=>freq[d]);const e=N*0.1;let x2=0;fr.forEach(f=>x2+=(f-e)**2/e);x2*=(U-1)/U*1/(1-M/U)*(1);
// χ² ajustado: Var(f)=N p(1-p); soma de (f-e)²/(N p (1-p)) com fator (U-1)/U pela restrição Σf=6N
let x2b=0;fr.forEach(f=>x2b+=(f-e)**2/(N*0.1*0.9));x2b*=(U-1)/U;
console.log('freq: min',Math.min(...fr),'max',Math.max(...fr),'esperado',e.toFixed(1),'dp',Math.sqrt(N*.09).toFixed(1),'fora de 2dp',fr.filter(f=>Math.abs(f-e)>2*Math.sqrt(N*.09)).length,'χ²(59gl) ≈',x2b.toFixed(1));
console.log('maior atraso registrado:',Math.max(...gapMax),'atraso atual máx',Math.max(...R.map(d=>maxN-last[d])));
fs.writeFileSync('ref_hist.json',JSON.stringify({freq,ciclos,gapMax,first,last,maxN,rep}));
