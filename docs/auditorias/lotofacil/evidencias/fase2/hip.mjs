const C=(n,k)=>{if(k<0||k>n)return 0;let r=1;for(let i=0;i<k;i++)r=r*(n-i)/(i+1);return Math.round(r)};
const T=C(25,15);
const dist=(K,name)=>{const o={};for(let k=0;k<=15;k++){const v=C(K,k)*C(25-K,15-k);if(v)o[k]=+(100*v/T).toFixed(3)}console.log(name,JSON.stringify(o))};
dist(12,"PI(pares,12)");dist(9,"PR(primos,9)");dist(16,"MC(moldura,16)");dist(7,"FIB(7)");dist(8,"M3(8)");
console.log("total",T);
for(let k=11;k<=15;k++){const v=C(15,k)*C(10,15-k);console.log(k,v,(T/v).toFixed(2))}
