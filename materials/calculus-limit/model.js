export const exact=1/3;
export const rightSum=n=>(1+1/n)*(2+1/n)/6;
export const error=n=>1/(2*n)+1/(6*n*n);
export const formulas={
 sum:String.raw`S_n=\frac1n\left\{\left(\frac1n\right)^2+\left(\frac2n\right)^2+\cdots+\left(\frac nn\right)^2\right\}`,
 sigma:String.raw`S_n=\sum_{k=1}^{n}\frac1n\left(\frac kn\right)^2=\frac1{n^3}\sum_{k=1}^{n}k^2`,
 squares:String.raw`1^2+2^2+\cdots+n^2=\frac{n(n+1)(2n+1)}6`,
 simplified:String.raw`S_n=\frac16\left(1+\frac1n\right)\left(2+\frac1n\right)`,
 limit:String.raw`\lim_{n\to\infty}S_n=\frac16\cdot1\cdot2=\frac13`,
 final:String.raw`\int_0^1 x^2\,dx=\frac13`,
 dimensions:String.raw`\Delta x=\frac1n,\qquad h_k=\left(\frac kn\right)^2`,
 error:String.raw`S_n-\frac13=\frac1{2n}+\frac1{6n^2}>0`
};
export function scene(t,portrait=false){
 const starts=portrait?[0,4,10,18,20,22,24]:[0,10,24,40,56,70,82];
 let i=starts.findLastIndex(s=>t>=s),local=t-starts[i],end=starts[i+1]??(portrait?30:90),p=Math.min(1,local/(end-starts[i]));
 const n=i===0?4:i===1?(portrait?2**Math.min(5,2+Math.floor(p*4)):4):i===2?2**Math.min(8,2+Math.floor(p*7)):i===5?Math.round(128+p*872):i===6?1000:16;
 const titles=['曲線の下の面積は？','右端を高さに、長方形を並べる','分割を増やすと、誤差が減る','長方形の和を、数式へ','平方和の公式で整理する','無限の長方形が、面積になる','定積分と極限がつながる'];
 return {i,p,local,n,title:titles[i],formula:i===0?'final':i===1?'dimensions':i===2?'simplified':i===3?(p<.5?'sum':'sigma'):i===4?(p<.48?'squares':'simplified'):i===5?'limit':'final'};
}
