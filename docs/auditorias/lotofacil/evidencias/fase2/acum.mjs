import fs from 'fs';
const sql=JSON.parse(fs.readFileSync('acum.json','utf8')).rows[0].a;
const rows=JSON.parse(fs.readFileSync('lf_raw.json','utf8')).rows;
const ref=[];let ini=null;for(const r of rows){const f1=r.pf.find(x=>x.f===1);if(ini===null)ini=r.numero;if(f1.g>0){ref.push({i:ini,f:r.numero,d:r.numero-ini+1,w:f1.g,p:+(+f1.v).toFixed(2)});ini=null}}
const eq=JSON.stringify(ref)===JSON.stringify(sql.map(x=>({i:x.i,f:x.f,d:x.d,w:x.w,p:+x.p})));
console.log('grupos ref',ref.length,'sql',sql.length,'iguais',eq);
const m=ref.reduce((s,x)=>s+x.d,0)/ref.length;console.log('duração média',m.toFixed(3),'máx',Math.max(...ref.map(x=>x.d)),'acumulação em curso desde',ini);
const seq=ref.filter(x=>x.d>=7).map(x=>`${x.i}-${x.f}(${x.d})`);console.log('>=7',seq.join(' '));
