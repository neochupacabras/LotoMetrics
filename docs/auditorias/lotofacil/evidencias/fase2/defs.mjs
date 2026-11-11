import fs from 'fs';
const r=JSON.parse(fs.readFileSync('lf_fns.json','utf8')).rows[0].r;
const schema=fs.readFileSync('C:/Users/Micro/Loterias/loterias-web/supabase/schema.sql','utf8');
const body=s=>{const m=s.match(/\$(\w*)\$([\s\S]*?)\$\1\$/);return m?m[2].replace(/\s+/g,' ').trim():null};
const sch={};for(const m of schema.matchAll(/CREATE FUNCTION public\.(fn_\w+)\([\s\S]*?\$\$([\s\S]*?)\$\$;/g))sch[m[1]]=m[2].replace(/\s+/g,' ').trim();
const seen=new Set();
for(const d of r.defs){seen.add(d.n);const b=body(d.def);if(!(d.n in sch))console.log('SÓ EM PRODUÇÃO:',d.n);else if(b!==sch[d.n])console.log('DIFERENTE:',d.n)}
for(const k in sch)if(!seen.has(k))console.log('SÓ NO SCHEMA:',k);
console.log('prod fns',r.defs.length,'schema fns',Object.keys(sch).length);
