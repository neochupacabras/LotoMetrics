// Baixa cada concurso da API oficial (1 por vez, pausa 0,6 s), retomável.
import fs from 'fs';
const dir=process.argv[2]; const ini=+process.argv[3], fim=+process.argv[4];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let ok=0,falhas=[];
for(let n=ini;n<=fim;n++){
  const f=`${dir}/c${n}.json`; if(fs.existsSync(f)){ok++;continue}
  let feito=false;
  for(let t=1;t<=4&&!feito;t++){
    try{const r=await fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/${n}`,{headers:{'User-Agent':'Mozilla/5.0 (compatible; ProjetoLoterias/1.0)','Accept':'application/json'},signal:AbortSignal.timeout(15000)});
      if(r.ok){const j=await r.json();if(j.numero===n){fs.writeFileSync(f,JSON.stringify(j));feito=true;ok++}}
      else await sleep(2000*t);
    }catch{await sleep(2000*t)}
  }
  if(!feito)falhas.push(n);
  if(n%250===0)console.log(new Date().toISOString(),'até',n,'ok',ok,'falhas',falhas.length);
  await sleep(600);
}
console.log('FIM ok',ok,'falhas',JSON.stringify(falhas));
