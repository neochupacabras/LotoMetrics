// Compara os concursos já baixados da Caixa com o export do banco.
import fs from 'fs';
const rows=JSON.parse(fs.readFileSync('lf_raw.json','utf8')).rows;const by=Object.fromEntries(rows.map(r=>[r.numero,r]));
const files=fs.readdirSync('caixa').filter(f=>/^c\d+\.json$/.test(f));let n=0;const dif=[];
const br=d=>d.split('/').reverse().join('-');
for(const f of files){const c=JSON.parse(fs.readFileSync('caixa/'+f,'utf8'));const r=by[c.numero];if(!r){dif.push([c.numero,'ausente no banco']);continue}n++;
 const p=[];if(br(c.dataApuracao)!==r.data)p.push(`data ${c.dataApuracao}/${r.data}`);
 if(c.listaDezenas.map(Number).join()!==r.dezenas.join())p.push('dezenas');
 if((c.dezenasSorteadasOrdemSorteio||[]).map(Number).join()!==r.ordem.join())p.push('ordem');
 if(!!c.acumulado!==r.acumulado)p.push('acumulado');
 if(Math.abs((c.valorArrecadado||0)-(+r.arrec||0))>0.01)p.push(`arrec ${c.valorArrecadado}/${r.arrec}`);
 for(const fx of c.listaRateioPremio||[]){const q=r.pf.find(x=>x.f===fx.faixa);if(!q){p.push('faixa '+fx.faixa+' ausente');continue}if(q.g!==fx.numeroDeGanhadores||Math.abs(+q.v-fx.valorPremio)>0.01||q.d!==fx.descricaoFaixa)p.push(`f${fx.faixa} ${fx.numeroDeGanhadores}x${fx.valorPremio} / ${q.g}x${q.v}`)}
 if(p.length)dif.push([c.numero,p.join('; ')])}
console.log('comparados',n,'com divergência',dif.length);dif.slice(0,40).forEach(d=>console.log(d.join(' : ')));
