import fs from 'fs';
const F=JSON.parse(fs.readFileSync('lf_fns.json','utf8')).rows[0].r;
const rows=JSON.parse(fs.readFileSync('lf_raw.json','utf8')).rows;
const tot=F.parimpar.reduce((s,p)=>s+ +p.ocorrencias,0);
const mapP=(arr,k)=>{const m={};arr.forEach(r=>m[r[k]]=+r.percentual);return m};
const PI=mapP(F.parimpar,'pares'),SEQ=mapP(F.seq,'maior_sequencia'),PR=mapP(F.primos_d,'qtd_primos'),FI=mapP(F.fib_d,'qtd_fibonacci'),M3=mapP(F.m3_d,'qtd_multiplos'),MC=mapP(F.mc_d,'qtd_moldura');
const H={};F.hist.forEach(h=>H[+h.faixa_inicio]=+h.ocorrencias);
const sc=p=>Math.min(100,Math.round(p/12*100));
const W={soma:.25,pares:.2,seq:.15,pr:.1,fi:.1,m3:.1,mc:.1};
const isP=new Set([2,3,5,7,11,13,17,19,23]),isF=new Set([1,2,3,5,8,13,21]);const mold=x=>{const l=Math.ceil(x/5),c=(x-1)%5+1;return l===1||l===5||c===1||c===5};
const nota=d=>{let s=0,p=0,pr=0,fi=0,m3=0,mc=0,best=0,run=0;const set=new Array(26).fill(false);d.forEach(x=>{set[x]=true;s+=x;if(x%2===0)p++;if(isP.has(x))pr++;if(isF.has(x))fi++;if(x%3===0)m3++;if(mold(x))mc++});for(let i=1;i<=25;i++){if(set[i]){run++;best=Math.max(best,run)}else run=0}
 const ps=(H[Math.floor(s/10)*10]||0)/tot*100;
 return Math.round(sc(ps)*W.soma+sc(PI[p]||0)*W.pares+sc(SEQ[best]||0)*W.seq+sc(PR[pr]||0)*W.pr+sc(FI[fi]||0)*W.fi+sc(M3[m3]||0)*W.m3+sc(MC[mc]||0)*W.mc)};
const cls=n=>n>=75?'tipico':n>=55?'equilibrado':n>=35?'razoavel':'atipico';
// todas as combinações
const cnt={},hist100={};let v=(1<<15)-1,n=0;let n100=0;
while(v<(1<<25)){const d=[];for(let i=0;i<25;i++)if(v>>i&1)d.push(i+1);const x=nota(d);cnt[cls(x)]=(cnt[cls(x)]||0)+1;if(x===100)n100++;n++;const c=v&-v,r=v+c;v=(((r^v)>>>2)/c)|r}
console.log('todas as combinações:',Object.fromEntries(Object.entries(cnt).map(([k,c])=>[k,(100*c/n).toFixed(1)+'%'])),'nota 100:',(100*n100/n).toFixed(1)+'%');
const cs={};rows.forEach(r=>{const c=cls(nota(r.dezenas));cs[c]=(cs[c]||0)+1});console.log('sorteios reais:',Object.fromEntries(Object.entries(cs).map(([k,c])=>[k,(100*c/rows.length).toFixed(1)+'%'])));
// sensibilidade da faixa de soma: somas 189 e 190 (mesma distância da média) caem em faixas diferentes
for(const s of [179,180,189,190,199,200,209,210])console.log('soma',s,'faixa',Math.floor(s/10)*10,'% hist',((H[Math.floor(s/10)*10]||0)/tot*100).toFixed(1),'score',sc((H[Math.floor(s/10)*10]||0)/tot*100));
console.log('maior % por métrica: pares',Math.max(...Object.values(PI)),'seq',Math.max(...Object.values(SEQ)),'primos',Math.max(...Object.values(PR)),'fib',Math.max(...Object.values(FI)),'m3',Math.max(...Object.values(M3)),'mold',Math.max(...Object.values(MC)),'soma',Math.max(...Object.values(H))/tot*100);
