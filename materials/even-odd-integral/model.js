export const functions = [
 {id:'square',label:'x²',tex:'x^2',kind:'even',f:x=>x*x,F:x=>x**3/3},
 {id:'cube',label:'x³',tex:'x^3',kind:'odd',f:x=>x**3,F:x=>x**4/4},
 {id:'cos',label:'cos x',tex:'\\cos x',kind:'even',f:Math.cos,F:Math.sin},
 {id:'sin',label:'sin x',tex:'\\sin x',kind:'odd',f:Math.sin,F:x=>-Math.cos(x)},
 {id:'quartic',label:'x⁴ − x²',tex:'x^4-x^2',kind:'even',f:x=>x**4-x*x,F:x=>x**5/5-x**3/3},
 {id:'cubic',label:'x³ − x',tex:'x^3-x',kind:'odd',f:x=>x**3-x,F:x=>x**4/4-x*x/2},
 {id:'mixed',label:'6x³ + x² + 2x + 1',tex:'6x^3+x^2+2x+1',kind:'mixed',f:x=>6*x**3+x*x+2*x+1,F:x=>1.5*x**4+x**3/3+x*x+x},
 {id:'evenpart',label:'x² + 1',tex:'x^2+1',kind:'even',f:x=>x*x+1,F:x=>x**3/3+x},
 {id:'oddpart',label:'6x³ + 2x',tex:'6x^3+2x',kind:'odd',f:x=>6*x**3+2*x,F:x=>1.5*x**4+x*x},
];
export const byId=id=>functions.find(f=>f.id===id)||functions[0];
export function integrals(fn,a){const right=fn.F(a)-fn.F(0),left=fn.F(0)-fn.F(-a);return {left,right,total:left+right};}
export const example1=[
 {id:'mixed',a:1,title:'例題1｜対称性で分解する',tex:'\\int_{-1}^{1}(6x^3+x^2+2x+1)\\,dx',note:'混合した関数は、そのまま偶関数・奇関数とはいえません。'},
 {id:'oddpart',a:1,title:'奇関数の項を取り出す',tex:'\\underbrace{6x^3+2x}_{\\text{奇関数}}\\quad\\Rightarrow\\quad\\int_{-1}^{1}(6x^3+2x)\\,dx=0',note:'6x³ と 2x は原点対称。符号付き面積が相殺します。'},
 {id:'evenpart',a:1,title:'偶関数の項だけが残る',tex:'\\int_{-1}^{1}(x^2+1)\\,dx=2\\int_0^1(x^2+1)\\,dx',note:'x² と 1 は y軸対称。右半分の積分を2倍します。'},
 {id:'evenpart',a:1,title:'計算して確かめる',tex:'2\\left[\\frac{x^3}{3}+x\\right]_0^1=2\\left(\\frac13+1\\right)=\\boxed{\\frac83}',note:'奇関数の項を積分しなくても、答えは 8/3。'},
];
export const example2=[
 {id:'cos',a:Math.PI/4,title:'例題2｜cos x の対称性',tex:'\\int_{-\\pi/4}^{\\pi/4}\\cos x\\,dx',note:'角度はラジアン。cos(−x)=cos x なので偶関数です。'},
 {id:'cos',a:Math.PI/4,title:'右半分を2倍する',tex:'\\int_{-\\pi/4}^{\\pi/4}\\cos x\\,dx=2\\int_0^{\\pi/4}\\cos x\\,dx',note:'左右の符号付き面積が等しいことをグラフで確かめます。'},
 {id:'cos',a:Math.PI/4,title:'原始関数 sin x で計算',tex:'2[\\sin x]_0^{\\pi/4}=2\\cdot\\frac{\\sqrt2}{2}=\\boxed{\\sqrt2}',note:'対称性を使って、計算する区間を半分にできます。'},
];
