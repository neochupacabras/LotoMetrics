import fs from 'fs';
const rows=JSON.parse(fs.readFileSync('lf_raw.json','utf8')).rows;const by=Object.fromEntries(rows.map(r=>[r.numero,r]));
for(const n of [3714,3715,3716,3717,3718])console.log(n,by[n].data);
console.log('2026-06-20:',rows.filter(r=>r.data==='2026-06-20').map(r=>r.numero));
// mudança 43,35 -> 43,79: primeiro concurso com P inferido ~43.79
const P=r=>{const A=+r.arrec;const p=f=>r.pf.find(x=>x.f===f);const F=[3,4,5].reduce((s,f)=>s+p(f).g*+p(f).v,0);return (p(2).g*+p(2).v/0.13+F)/A};
let ult=null;for(const r of rows){if(!(+r.arrec>0))continue;const v=P(r);if(Math.abs(v-0.4335)<0.0005)ult=r.numero;}
const prim=rows.find(r=>+r.arrec>0&&Math.abs(P(r)-0.4379)<0.0005);console.log('último 43,35%',ult,by[ult].data,'primeiro 43,79%',prim.numero,prim.data);
// participação da faixa 1 no prêmio líquido (P*A - F) por ano, só concursos normais com ganhador, anterior com ganhador, não final 0/5
const sh={};for(let i=1;i<rows.length;i++){const r=rows[i],a=rows[i-1];if(!(+r.arrec>0)||a.pf[0].g===0||r.pf[0].g===0)continue;const fin=r.numero%5===0?(r.numero%10===0?'f0':'f5'):'n';const A=+r.arrec;const p=f=>r.pf.find(x=>x.f===f);const F=[3,4,5].reduce((s,f)=>s+p(f).g*+p(f).v,0);const net=P(r)*A-F;const k=r.data.slice(0,4)+' '+fin;(sh[k]=sh[k]||[]).push(p(1).g*+p(1).v/net)}
for(const [k,v] of Object.entries(sh).sort()){if(!/^20(1[6-9]|2)/.test(k))continue;v.sort((a,b)=>a-b);console.log(k,'n',v.length,'faixa1/(bruto−fixos) mediana',(100*v[v.length>>1]).toFixed(1)+'%')}
// dias da semana por mês em 2026
const m={};rows.filter(r=>r.data>='2025-10').forEach(r=>{const k=r.data.slice(0,7);const wd=new Date(r.data+'T12:00:00Z').getUTCDay();m[k]=m[k]||[0,0,0,0,0,0,0];m[k][wd]++});for(const [k,v] of Object.entries(m))console.log(k,'dom..sáb',v.join(' '));
