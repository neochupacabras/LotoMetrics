import fs from 'fs';
const rows=JSON.parse(fs.readFileSync('lf_raw.json','utf8')).rows;
const out=(k,v)=>console.log(k.padEnd(48),typeof v==='string'?v:JSON.stringify(v));
// 1 dezenas e ordem
let ordRuim=[],naoOrd=[];for(const r of rows){const s=[...r.dezenas];if(s.some((x,i)=>i&&x<=s[i-1]))naoOrd.push(r.numero);const o=r.ordem;if(!o||o.length!==15||[...o].sort((a,b)=>a-b).join()!==s.join())ordRuim.push(r.numero)}
out('dezenas fora de ordem crescente',naoOrd.length);out('ordem_sorteio não é permutação das dezenas',[ordRuim.length,ordRuim.slice(0,15)]);
// ordem do sorteio = crescente? (sinal de ordem não informada)
const ordIgual=rows.filter(r=>r.ordem&&r.ordem.join()===r.dezenas.join()).map(r=>r.numero);out('ordem_sorteio idêntica à crescente',[ordIgual.length,ordIgual.slice(0,5),ordIgual.slice(-3)]);
// 2 datas
let dec=[],dup={};for(let i=1;i<rows.length;i++){if(rows[i].data<=rows[i-1].data)dec.push(rows[i].numero)}rows.forEach(r=>dup[r.data]=(dup[r.data]||0)+1);
out('datas não crescentes',dec);out('datas repetidas',Object.entries(dup).filter(([,c])=>c>1));
// sorteios por semana por ano e dias da semana
const porAno={};for(const r of rows){const y=r.data.slice(0,4);const wd=new Date(r.data+'T12:00:00Z').getUTCDay();porAno[y]=porAno[y]||{n:0,wd:[0,0,0,0,0,0,0]};porAno[y].n++;porAno[y].wd[wd]++}
for(const [y,v] of Object.entries(porAno))console.log(y,'concursos',v.n,'dom..sáb',v.wd.join(' '));
// 3 premiação
let accInc=[],gv=[],mono=[];for(const r of rows){const f1=r.pf.find(x=>x.f===1);if((f1.g===0)!==r.acumulado)accInc.push(r.numero);for(const p of r.pf){if((p.g>0)!==(+p.v>0))gv.push(`${r.numero}/f${p.f}(g${p.g},v${p.v})`)}const vs=r.pf.filter(p=>p.g>0).sort((a,b)=>a.f-b.f).map(p=>+p.v);if(vs.some((v,i)=>i&&v>vs[i-1]))mono.push(r.numero)}
out('flag acumulado ≠ (faixa1 sem ganhador)',[accInc.length,accInc.slice(0,10)]);out('ganhadores>0 sem valor ou vice-versa',[gv.length,gv.slice(0,10)]);out('prêmio de faixa menor > faixa maior',[mono.length,mono.slice(0,10)]);
const arr0=rows.filter(r=>!(+r.arrec>0)).map(r=>r.numero);out('arrecadação zero/nula',[arr0.length,arr0.slice(0,5),arr0.slice(-5)]);
// 4 percentual bruto inferido pela faixa 14: P = (g2 v2/0.13 + F)/A
const era={};for(const r of rows){const A=+r.arrec;if(!(A>0))continue;const p=f=>r.pf.find(x=>x.f===f);const F=[3,4,5].reduce((s,f)=>s+p(f).g*+p(f).v,0);const P=(p(2).g*+p(2).v/0.13+F)/A;const y=r.data.slice(0,4);(era[y]=era[y]||[]).push(P)}
for(const [y,v] of Object.entries(era)){v.sort((a,b)=>a-b);console.log('ano',y,'P inferido (faixa14=13%): mediana',(100*v[v.length>>1]).toFixed(2)+'%','p10',(100*v[Math.floor(v.length*.1)]).toFixed(2),'p90',(100*v[Math.floor(v.length*.9)]).toFixed(2))}
// 5 razão faixa1/faixa2 quando anterior teve ganhador
const rz={n:[],z:[]};for(let i=1;i<rows.length;i++){const r=rows[i],a=rows[i-1];if(a.pf[0].g===0||r.pf[0].g===0||!(+r.arrec>0)||r.data<'2020-01-01')continue;const k=r.numero%10===0?'z':'n';rz[k].push(r.pf[0].g*r.pf[0].v/(r.pf[1].g*r.pf[1].v))}
for(const k of ['n','z']){const v=rz[k].sort((a,b)=>a-b);console.log(k==='z'?'final 0':'normal','n',v.length,'mediana faixa1/faixa2',v[v.length>>1]?.toFixed(3),'(esperado',k==='z'?(72/13).toFixed(3):(62/13).toFixed(3)+')')}
