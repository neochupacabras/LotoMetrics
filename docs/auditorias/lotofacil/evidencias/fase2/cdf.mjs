import fs from 'fs';
const src=fs.readFileSync(new URL('../../../../../lib/analisador.ts', import.meta.url),'utf8');
const code=JSON.parse(src.match(/CDF_SOMA_LF: number\[\] = (\[[^\]]*\])/)[1]);
const ref=JSON.parse(fs.readFileSync('ref_enum.json','utf8'));
console.log('len code',code.length,'len ref',ref.cdf.length);
let maxd=0,at=-1;for(let i=0;i<Math.max(code.length,ref.cdf.length);i++){const a=code[i]??100,b=ref.cdf[i]??100;const d=Math.abs(a-b);if(d>maxd){maxd=d;at=i}}
console.log('max diff',maxd,'at soma',120+at, code[at], ref.cdf[at]);
// mediana/percentil 50
const i50=ref.cdf.findIndex(x=>x>=50);console.log('soma onde CDF>=50%',120+i50);
// "centralidade" do código: 100-|50-cdf|*2 ; mostra para algumas somas
for(const s of [150,170,185,195,205,220,240]){const p=code[s-120];console.log(s,'cdf',p,'centralidade',100-Math.abs(50-p)*2)}
