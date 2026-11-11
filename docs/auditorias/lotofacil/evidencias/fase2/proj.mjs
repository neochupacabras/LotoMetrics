import fs from 'fs';
const rows=JSON.parse(fs.readFileSync('lf_raw.json','utf8')).rows;const T=3268760;
const rec=rows.filter(r=>r.data>='2025-08-01');
let sumP=0,obsW=0,sumL=0,sumG=0,n=0;const bins={};
for(const r of rec){const a=+r.arrec;if(!a||!r.pf)continue;const f1=r.pf.find(x=>x.f===1);if(!f1)continue;const lam=a/3.5/T;const p=1-Math.exp(-lam);n++;sumP+=p;sumL+=lam;sumG+=f1.g;if(f1.g>0)obsW++;const b=(Math.floor(lam*2)/2).toFixed(1);bins[b]=bins[b]||{n:0,p:0,w:0,lam:0,g:0};bins[b].n++;bins[b].p+=p;bins[b].w+=f1.g>0?1:0;bins[b].lam+=lam;bins[b].g+=f1.g}
console.log('concursos',n,'P(ganhador) previsto médio',(sumP/n).toFixed(3),'observado',(obsW/n).toFixed(3));
console.log('ganhadores 15 previstos',sumL.toFixed(0),'observados',sumG);
for(const [b,v] of Object.entries(bins).sort())console.log('λ',b,'n',v.n,'prev',(v.p/v.n).toFixed(2),'obs',(v.w/v.n).toFixed(2),'ganh prev/obs',(v.lam).toFixed(0),'/',v.g);
// último concurso e o que a página mostraria
const u=rows[rows.length-1];
let acum=0;for(let i=rows.length-1;i>=0;i--){const f1=rows[i].pf?.find(x=>x.f===1);if(f1&&f1.g===0)acum++;else break}
const base=+u.arrec/3.5,fator=Math.min(1+acum*0.2,5),Tk=Math.round(base*fator);
const P=t=>1-Math.pow(1-1/T,t);
console.log('ultimo',u.numero,u.data,'arrec',u.arrec,'acum_prox',u.acum_prox,'est_prox',u.est_prox,'acumulados',acum,'tickets',Tk,'P',P(Tk).toFixed(4),'P-50%',P(Math.round(Tk*0.5)).toFixed(4),'P+50%',P(Math.round(Tk*1.5)).toFixed(4));
// formatarPct mostra (p*100).toFixed(1) se p>=0.01 -> 100.0% quando p>=0.9995
const lim=-Math.log(0.0005)*T;console.log('tickets a partir dos quais aparece 100,0%:',Math.round(lim));
// quantos concursos recentes teriam exibido 100,0% em algum cenário
let c100=0;for(const r of rec){const t=+r.arrec/3.5*1.5;if(P(t)>=0.9995)c100++}console.log('concursos recentes c/ cenário +50% = 100,0%:',c100,'de',rec.length);
// acumulados: série
const ac=rows.slice(-400).map(r=>r.pf?.find(x=>x.f===1)?.g===0?1:0).join('');console.log('últimos 400 (1=acumulou):',ac.replace(/0+/g,m=>m.length>3?`.${m.length}.`:m));
// campos de acúmulo: ver concursos de final 0 e setembro
for(const r of rows.slice(-25))console.log(r.numero,r.data,'acum',r.acumulado,'acum_prox',r.acum_prox,'est',r.est_prox,'f1g',r.pf?.[0]?.g,'f1v',r.pf?.[0]?.v);
