export const functions = {
  wave: {label:'1.5 + 0.5 sin(2x) + 0.25 cos(3x)',tex:'1.5+0.5\\sin(2x)+0.25\\cos(3x)',f:x=>1.5+.5*Math.sin(2*x)+.25*Math.cos(3*x),F:x=>1.5*x-.25*Math.cos(2*x)+Math.sin(3*x)/12},
  square:{label:'x²',tex:'x^2',f:x=>x*x,F:x=>x**3/3},
  sqrt:{label:'√x',tex:'\\sqrt{x}',f:Math.sqrt,F:x=>2/3*x**1.5},
  sin:{label:'sin x',tex:'\\sin x',f:Math.sin,F:x=>-Math.cos(x)},
  cos:{label:'cos x',tex:'\\cos x',f:Math.cos,F:Math.sin},
  cubic:{label:'x³ − x',tex:'x^3-x',f:x=>x**3-x,F:x=>x**4/4-x*x/2},
};
export function calculate(key,a,b,n) {
  if(!functions[key]||!Number.isFinite(a)||!Number.isFinite(b)||a>=b||n<1||n>1000||!Number.isInteger(n))throw new RangeError('a < b、分割数は1〜1000の整数で指定してください。');
  if(key==='sqrt'&&a<0)throw new RangeError('√x の定義域は x ≥ 0 です。a を0以上にしてください。');
  const {f,F}=functions[key],dx=(b-a)/n,rectangles=Array.from({length:n},(_,i)=>({left:a+i*dx,right:a+(i+1)*dx,height:f(a+(i+1)*dx)}));
  const sum=rectangles.reduce((s,r)=>s+r.height*dx,0),exact=F(b)-F(a);
  return {key,a,b,n,dx,rectangles,sum,exact,error:sum-exact,absError:Math.abs(sum-exact)};
}
export const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
export const lerp=(a,b,t)=>a+(b-a)*t;

export function blendData(n,a,b,blend){
 const f=x=>(1-blend)*functions.wave.f(x)+blend*functions.cubic.f(x),F=x=>(1-blend)*functions.wave.F(x)+blend*functions.cubic.F(x),dx=(b-a)/n;
 const rectangles=Array.from({length:n},(_,i)=>({left:a+i*dx,right:a+(i+1)*dx,height:f(a+(i+1)*dx)})),sum=rectangles.reduce((s,r)=>s+r.height*dx,0),exact=F(b)-F(a);
 return {key:blend>.5?'cubic':'wave',f,F,a,b,n,dx,rectangles,sum,exact,error:sum-exact,absError:Math.abs(sum-exact),blend};
}
