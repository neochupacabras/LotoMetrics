import fs from 'fs';
const rows=JSON.parse(fs.readFileSync('lf_raw.json','utf8')).rows.filter(r=>r.data>='2025-08-01');
const g={};for(let i=1;i<rows.length;i++){let k=0;for(let j=i-1;j>=0;j--){if(rows[j].pf?.[0]?.g===0)k++;else break}const ratio=+rows[i].arrec/+rows[i-1].arrec;(g[k]=g[k]||[]).push(ratio)}
for(const [k,v] of Object.entries(g)){v.sort((a,b)=>a-b);console.log('acumulados antes',k,'n',v.length,'mediana arrec(i)/arrec(i-1)',v[v.length>>1].toFixed(3))}
