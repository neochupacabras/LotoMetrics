import fs from 'fs';
const rows=JSON.parse(fs.readFileSync('lf_raw.json','utf8')).rows;
const semPf=rows.filter(r=>!r.pf||r.pf.length===0).map(r=>r.numero);console.log('concursos sem premiação',semPf.length,semPf.slice(0,20));
const nf={};rows.forEach(r=>{const n=r.pf?.length||0;nf[n]=(nf[n]||0)+1});console.log('qtd de faixas por concurso',nf);
const desc={};rows.forEach(r=>r.pf?.forEach(p=>{const k=p.f+':'+p.d;desc[k]=(desc[k]||0)+1}));console.log('descrições',desc);
// eras do prêmio fixo de 11/12/13 acertos (faixas 5/4/3) quando houve ganhador
let prev='';for(const r of rows){const g=f=>{const p=r.pf?.find(x=>x.f===f);return p&&p.g>0?(+p.v).toFixed(2):'-'};const k=[g(5),g(4),g(3)].join('/');if(k!==prev){console.log(r.numero,r.data,'11/12/13 =',k);prev=k}}
