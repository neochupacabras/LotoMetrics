import fs from 'fs';
const rows=JSON.parse(fs.readFileSync('lf_raw.json','utf8')).rows;
const F=JSON.parse(fs.readFileSync('lf_fns.json','utf8')).rows[0].r;
const D=rows.map(r=>r.dezenas); const N=D.length; const nums=rows.map(r=>r.numero);
let ok=0,bad=0; const chk=(name,a,b)=>{const sa=JSON.stringify(a),sb=JSON.stringify(b); if(sa===sb){ok++;console.log('OK  ',name)} else {bad++;console.log('DIFF',name,'\n  ref',sa.slice(0,300),'\n  sql',sb.slice(0,300))}};
const by=(arr,k)=>[...arr].sort((x,y)=>x[k]-y[k]);
// integridade básica
let inval=0;D.forEach((d,i)=>{const s=new Set(d);if(d.length!==15||s.size!==15||d.some(x=>x<1||x>25||!Number.isInteger(x)))inval++;});
console.log('concursos',N,'invalidos',inval,'contiguo',nums.every((n,i)=>n===i+1));
// frequência
const freq=Array(26).fill(0);D.forEach(d=>d.forEach(x=>freq[x]++));
chk('freq',Array.from({length:25},(_,i)=>({d:i+1,f:freq[i+1]})), by(F.freq.map(r=>({d:r.dezena,f:+r.frequencia})),'d'));
const f100=Array(26).fill(0);D.slice(-100).forEach(d=>d.forEach(x=>f100[x]++));
chk('freq100',Array.from({length:25},(_,i)=>({d:i+1,f:f100[i+1]})).filter(x=>x.f>0), by(F.freq100.map(r=>({d:r.dezena,f:+r.frequencia})),'d'));
// atraso e maior atraso (definição SQL: entre aparições) + definição completa
const last=Array(26).fill(0), first=Array(26).fill(0), gapMax=Array(26).fill(0);
D.forEach((d,i)=>d.forEach(x=>{const n=nums[i]; if(!first[x])first[x]=n; else gapMax[x]=Math.max(gapMax[x],n-last[x]-1); last[x]=n;}));
const maxN=nums[N-1];
chk('atraso',Array.from({length:25},(_,i)=>({d:i+1,a:maxN-last[i+1]})), by(F.atraso.map(r=>({d:r.dezena,a:r.atraso})),'d'));
chk('maior_atraso(entre aparições)',Array.from({length:25},(_,i)=>({d:i+1,m:gapMax[i+1]})), by(F.maior_atraso.map(r=>({d:r.dezena,m:+r.maior_atraso})),'d'));
const cmpAtual=[];for(let x=1;x<=25;x++){const cur=maxN-last[x]; const ini=first[x]-1; if(cur>gapMax[x]||ini>gapMax[x])cmpAtual.push({d:x,atual:cur,inicio:ini,maior:gapMax[x]})}
console.log('dezenas onde atraso atual ou inicial > maior atraso registrado:',JSON.stringify(cmpAtual));
// distribuições por concurso
const distr=(f)=>{const c={};D.forEach(d=>{const k=f(d);c[k]=(c[k]||0)+1});return c};
const pctOf=(c)=>Object.entries(c).map(([k,v])=>({k:+k,o:v,p:Math.round(10000*v/N)/100})).sort((a,b)=>a.k-b.k);
const isP=x=>[2,3,5,7,11,13,17,19,23].includes(x), isF=x=>[1,2,3,5,8,13,21].includes(x), isM3=x=>x%3===0;
const molde=x=>{const l=Math.ceil(x/5),c=(x-1)%5+1;return l===1||l===5||c===1||c===5};
const run=d=>{const s=[...d].sort((a,b)=>a-b);let b=1,r=1;for(let i=1;i<s.length;i++){r=s[i]===s[i-1]+1?r+1:1;b=Math.max(b,r)}return b};
const sqlD=(arr,key)=>by(arr.map(r=>({k:+r[key],o:+r.ocorrencias,p:+r.percentual})),'k');
chk('par_impar',pctOf(distr(d=>d.filter(x=>x%2===0).length)),sqlD(F.parimpar,'pares'));
chk('primos_d',pctOf(distr(d=>d.filter(isP).length)),sqlD(F.primos_d,'qtd_primos'));
chk('fib_d',pctOf(distr(d=>d.filter(isF).length)),sqlD(F.fib_d,'qtd_fibonacci'));
chk('m3_d',pctOf(distr(d=>d.filter(isM3).length)),sqlD(F.m3_d,'qtd_multiplos'));
chk('moldura_d',pctOf(distr(d=>d.filter(molde).length)),sqlD(F.mc_d,'qtd_moldura'));
chk('seq_d',pctOf(distr(run)),sqlD(F.seq,'maior_sequencia'));
// repetidas
const rep={};for(let i=1;i<N;i++){const s=new Set(D[i-1]);const k=D[i].filter(x=>s.has(x)).length;rep[k]=(rep[k]||0)+1}
chk('repetidas',Object.entries(rep).map(([k,v])=>({k:+k,o:v,p:Math.round(10000*v/(N-1))/100})).sort((a,b)=>a.k-b.k),sqlD(F.rep,'qtd_repetidas'));
// soma
const S=D.map(d=>d.reduce((a,b)=>a+b,0)).sort((a,b)=>a-b);const mean=S.reduce((a,b)=>a+b,0)/N;
const med=N%2?S[(N-1)/2]:(S[N/2-1]+S[N/2])/2;
chk('soma',{min:S[0],max:S[N-1],media:Math.round(mean*100)/100,mediana:med},{min:+F.soma[0].minimo,max:+F.soma[0].maximo,media:+F.soma[0].media,mediana:+F.soma[0].mediana});
const h={};S.forEach(s=>{const b=Math.floor(s/10)*10;h[b]=(h[b]||0)+1});
chk('hist_soma',Object.entries(h).map(([k,v])=>({i:+k,o:v})).sort((a,b)=>a.i-b.i),F.hist.map(r=>({i:+r.faixa_inicio,o:+r.ocorrencias})));
// linhas/colunas
const L=Array(6).fill(0),C=Array(6).fill(0);D.forEach(d=>d.forEach(x=>{L[Math.ceil(x/5)]++;C[(x-1)%5+1]++}));
chk('linhas',L.slice(1),F.lin.map(r=>+r.frequencia));chk('colunas',C.slice(1),F.col.map(r=>+r.frequencia));
// duques
const du={};D.forEach(d=>{const s=[...d].sort((a,b)=>a-b);for(let i=0;i<15;i++)for(let j=i+1;j<15;j++){const k=s[i]+'-'+s[j];du[k]=(du[k]||0)+1}});
const sqlDu={};F.duques.forEach(r=>sqlDu[r.dezena_1+'-'+r.dezena_2]=+r.ocorrencias);
chk('duques(todos 300)',Object.keys(du).length===300 && Object.entries(du).every(([k,v])=>sqlDu[k]===v),true);
const tr={};D.forEach(d=>{const s=[...d].sort((a,b)=>a-b);for(let i=0;i<15;i++)for(let j=i+1;j<15;j++)for(let k=j+1;k<15;k++){const key=s[i]+'-'+s[j]+'-'+s[k];tr[key]=(tr[key]||0)+1}});
chk('trincas distintas',Object.keys(tr).length,+F.trincas_n);
const topT=Object.values(tr).sort((a,b)=>b-a).slice(0,30);chk('trincas top30 contagens',topT,F.trincas.map(r=>+r.ocorrencias));
// ciclos (definição: todas as 25 saíram ao menos uma vez desde o início do ciclo)
const ciclos=[];let vis=new Set(),ini=null;D.forEach((d,i)=>{if(ini===null)ini=nums[i];d.forEach(x=>vis.add(x));if(vis.size===25){ciclos.push({ini,fim:nums[i],q:nums[i]-ini+1});vis=new Set();ini=null}});
chk('ciclos',ciclos,F.ciclos.map(r=>({ini:r.concurso_inicio,fim:r.concurso_fim,q:r.qtd_concursos})));
chk('ciclo_atual',{ini,q:ini===null?null:maxN-ini+1,falt:Array.from({length:25},(_,i)=>i+1).filter(x=>!vis.has(x))},{ini:F.ciclo_atual[0].concurso_inicio,q:F.ciclo_atual[0].concursos_no_ciclo,falt:F.ciclo_atual[0].dezenas_faltantes??[]});
// sequência de concursos consecutivos por dezena
const sd=[];for(let x=1;x<=25;x++){let b=0,r=0;D.forEach(d=>{if(d.includes(x)){r++;b=Math.max(b,r)}else r=0});sd.push({d:x,m:b})}
chk('seq_concursos_dezena',sd,by(F.seq_dezena.map(r=>({d:r.dezena,m:r.maior_sequencia_concursos})),'d'));
console.log('\nOK',ok,'DIFF',bad);
fs.writeFileSync('ref_hist.json',JSON.stringify({freq,ciclos,gapMax,first,last,maxN,rep}));
