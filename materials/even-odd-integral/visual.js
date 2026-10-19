import {byId,integrals} from './model.js';
let mathPainter=null;
export function setMathPainter(painter){mathPainter=painter;}
export const C={cyan:'#55d9ff',gold:'#ffd17c',orange:'#ff9b70',white:'#eaf7ff',muted:'#9db5ca'};
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
export function text(c,s,x,y,size=28,color=C.white,align='left'){c.fillStyle=color;c.font=`${size}px "Noto Sans CJK JP", "Noto Sans", sans-serif`;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y);}
export function background(c,w,h,t){
 c.fillStyle='#030916';c.fillRect(0,0,w,h);
 const g=c.createRadialGradient(w*.53,h*.48,0,w*.5,h*.5,w*.65);g.addColorStop(0,'#102e49');g.addColorStop(.55,'#061427');g.addColorStop(1,'#030712');c.fillStyle=g;c.fillRect(0,0,w,h);
 c.save();c.translate(w*.5,h*.52);c.scale(1,.3);c.rotate(Math.sin(t*.09)*.08);
 for(let j=0;j<7;j++){c.beginPath();c.ellipse(0,0,w*(.19+j*.067),w*(.19+j*.067),t*.015+j*.1,0,Math.PI*2);c.strokeStyle=j%2?'#15344b':'#19475a';c.lineWidth=1;c.stroke();}
 c.restore();
 c.save();c.globalAlpha=.25;for(let j=0;j<4;j++){c.beginPath();for(let k=0;k<=80;k++){const xx=k*w/80,yy=h*(.6+j*.04)+Math.sin(k*.065+t*.12+j)*h*.10;k?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.strokeStyle=j%2?'#daa85b':'#278bc3';c.lineWidth=j===0?2:1;c.stroke();}c.restore();
 for(let i=0;i<85;i++){const x=((Math.sin(i*37.21)*.5+.5)*w+t*(2+i%4))%w,y=(Math.cos(i*12.78)*.5+.5)*h;const a=.3+.25*Math.sin(t*.8+i);c.fillStyle=`rgba(117,203,245,${a})`;c.beginPath();c.arc(x,y,i%7===0?1.8:1,0,7);c.fill();}
}
export function graph(c,rect,fn,a,t=0,options={}){
 const {x,y,w,h}=rect,area=options.area!==false;
 const maxX=Math.max(1.6,a*1.22), maxY=Math.max(1.4,...Array.from({length:121},(_,i)=>Math.abs(fn.f(-maxX+2*maxX*i/120))))*1.12;
 const cx=x+w/2,cy=y+h/2,sx=w/(2*maxX),sy=(h*.42)/maxY;
 const point=(xx,yy)=>[cx+xx*sx,cy-yy*sy];
 c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
 c.strokeStyle='#164056';c.lineWidth=1;
 for(let j=-4;j<=4;j++){c.beginPath();c.moveTo(x,cy+j*h/10);c.lineTo(x+w,cy+j*h/10);c.stroke();c.beginPath();c.moveTo(cx+j*w/10,y);c.lineTo(cx+j*w/10,y+h);c.stroke();}
 c.shadowColor=C.cyan;c.shadowBlur=12;c.strokeStyle='#78c8e3';c.lineWidth=1.4;c.beginPath();c.moveTo(x,cy);c.lineTo(x+w,cy);c.moveTo(cx,y);c.lineTo(cx,y+h);c.stroke();c.shadowBlur=0;
 if(fn.kind==='even'){c.strokeStyle='rgba(210,241,255,.65)';c.shadowColor=C.cyan;c.shadowBlur=18;c.lineWidth=2;c.beginPath();c.moveTo(cx,y);c.lineTo(cx,y+h);c.stroke();c.shadowBlur=0;}
 if(area){for(let side of [-1,1]){const n=150;for(let i=0;i<n;i++){const xx=side*a*i/n,xx2=side*a*(i+1)/n,yy=fn.f((xx+xx2)/2);c.fillStyle=yy<0?'rgba(255,143,92,.40)':side<0?'rgba(255,200,105,.36)':'rgba(60,204,255,.34)';const p=point(xx,yy),q=point(xx2,yy);c.fillRect(Math.min(p[0],q[0]),Math.min(cy,p[1]),Math.abs(q[0]-p[0])+.7,Math.abs(p[1]-cy));}}
 }
 for(let side of [-1,1]){c.strokeStyle='#6191a6';c.setLineDash([4,5]);c.beginPath();c.moveTo(cx+side*a*sx,y+10);c.lineTo(cx+side*a*sx,y+h-18);c.stroke();c.setLineDash([]);}
 function curve(side,progress=1,rotate=false){c.save();if(side<0&&progress<1){c.translate(cx,cy);if(rotate)c.rotate(Math.PI*(1-progress));else c.scale(2*progress-1,1);c.translate(-cx,-cy);}c.beginPath();for(let i=0;i<=240;i++){const xx=side*maxX*i/240,yy=fn.f(xx),p=point(xx,yy);i?c.lineTo(...p):c.moveTo(...p);}c.strokeStyle=side<0?C.gold:C.cyan;c.lineWidth=3;c.shadowColor=c.strokeStyle;c.shadowBlur=12;c.stroke();c.shadowBlur=0;c.restore();}
 const vals=integrals(fn,a);
 const progress=options.symmetry===undefined?1:ease(options.symmetry);
 curve(1);curve(-1,progress,fn.kind==='odd');
 if(fn.kind==='odd'){c.shadowColor=C.gold;c.shadowBlur=20;c.fillStyle=C.white;c.beginPath();c.arc(cx,cy,5,0,7);c.fill();c.shadowBlur=0;}
 text(c,'x',x+w-14,cy-18,17);text(c,'y',cx+15,y+15,17);text(c,'0',cx+12,cy+23,16,C.muted);
 text(c,'−a',cx-a*sx,cy+25,18,C.gold,'center');text(c,'a',cx+a*sx,cy+25,18,C.cyan,'center');
 if(options.labels!==false&&area){text(c,fn.kind==='odd'?(vals.left<0?'−S':'+S'):'S₁',cx-a*sx*.55,cy+(fn.f(-a*.6)>0?-h*.15:h*.15),24,C.gold,'center');text(c,fn.kind==='odd'?(vals.right<0?'−S':'+S'):'S₂',cx+a*sx*.55,cy+(fn.f(a*.6)>0?-h*.15:h*.15),24,C.cyan,'center');}
 c.restore();
}
export function integral(c,lo,hi,integrand,x,y,size=40,color=C.white){
 text(c,'∫',x,y,size*1.55,color);text(c,hi,x+size*.61,y-size*.65,size*.38,color);text(c,lo,x+size*.4,y+size*.7,size*.38,color);text(c,integrand,x+size*1.18,y,size,color);
}
export function areaMerge(c,x,y,w,p,odd,rightSign=1){
 const k=ease(p),d=(1-k)*w*.25,alpha=odd?1-ease((p-.73)/.25):1;
 c.save();c.globalAlpha=alpha;
 for(const side of [-1,1]){c.shadowColor=side<0?C.gold:C.cyan;c.shadowBlur=25;c.fillStyle=side<0?'#eab856':'#3ebce7';const xx=x+side*d;c.beginPath();c.moveTo(xx-42,y+21);c.lineTo(xx+42,y+21);c.lineTo(xx+42,y-24);c.bezierCurveTo(xx+12,y-12,xx-12,y+18,xx-42,y+21);c.closePath();c.fill();text(c,odd?(side*rightSign<0?'−S':'+S'):'S',xx+4,y+4,22,'#041220','center');}
 c.restore();if(p>.8)text(c,odd?'0':'2S',x,y,42,odd?C.white:C.gold,'center');
}
const wideScenes=[
 [0,10,'対称性が面積を決める','偶関数・奇関数の定積分','square'],
 [10,25,'01  EVEN FUNCTION','偶関数は y軸対称','square'],
 [25,40,'02  SIGNED AREA','左右が等しい → 2倍','square'],
 [40,55,'03  ODD FUNCTION','奇関数は原点対称','cube'],
 [55,70,'04  CANCELLATION','符号が反対 → 相殺','cube'],
 [70,82,'05  EXAMPLE 1','奇関数の項を消して考える','mixed'],
 [82,90,'06  EXAMPLE 2 / SUMMARY','cos x も偶関数','cos'],
];
const shortScenes=[
 [0,4,'SYMMETRY / INTEGRAL','偶関数・奇関数の定積分','square'],
 [4,10,'EVEN / MIRROR','偶関数 → 2倍','square'],
 [10,18,'ODD / ROTATION','奇関数 → 0','cube'],
 [18,25,'SPOT THE SYMMETRY','対称性を見抜こう','square'],
 [25,30,'REMEMBER','式の前に、対称性を見抜こう','cos'],
];
export function film(c,W,H,t,portrait=false){
 const w=portrait?720:1280,h=portrait?1280:720;c.save();c.scale(W/w,H/h);background(c,w,h,t);
 const scenes=portrait?shortScenes:wideScenes,s=scenes.find(s=>t>=s[0]&&t<s[1])||scenes.at(-1),i=scenes.indexOf(s),local=t-s[0],p=local/(s[1]-s[0]);
 const pad=portrait?46:70; text(c,s[2],pad,portrait?112:62,portrait?17:15,C.gold);
 const titleSize=portrait?(i===4?25:31):42;
 if(portrait&&i===0){text(c,'偶関数・奇関数の',pad,185,37);text(c,'定積分',pad,238,48);text(c,'対称性が面積を決める',pad,300,24,C.muted);}else text(c,s[3],pad,portrait?180:125,titleSize);
 let fn=byId(s[4]),note='',formula='',sym,merge=false,odd=false;
 if(!portrait){
 if(i===0){formula='対称性を見ると、積分はもっと短くなる。';note='偶関数は「鏡」、奇関数は「半回転」。';}
 if(i===1){formula='f(−x) = f(x)';note='x と −x で高さが同じ。y軸を鏡にして重なります。';sym=clamp(local/7);}
 if(i===2){formula='even';note='左の符号付き面積 S₁ = 右の符号付き面積 S₂';merge=true;}
 if(i===3){formula='f(−x) = −f(x)';note='原点を中心に180°回転すると重なります。';sym=clamp(local/8);}
 if(i===4){formula='odd';note='x軸より上は正、下は負。幾何学的な面積の和は0ではありません。';merge=true;odd=true;}
 if(i===5){fn=byId(local<4?'mixed':local<7?'oddpart':'evenpart');formula=local<4?'example':local<7?'oddterms':'result';note=local<4?'6x³・2x は奇関数 ／ x²・1 は偶関数':local<7?'奇関数の項は相殺して0。偶関数の項だけが残ります。':'右半分を2倍して計算： 2(1/3 + 1) = 8/3';}
 if(i===6){formula=local<3?'cos':'coscalc';note=local<5?'cos(−x) = cos x → 偶関数':'偶関数 → y軸対称 → 2倍　　奇関数 → 原点対称 → 0';}
 }else{
 if(i===0){formula='f(−x) = f(x)  /  −f(x)';note='鏡と半回転で、積分が変わる。';}
 if(i===1){formula='even';note='f(−x) = f(x)｜y軸対称';sym=clamp(local/2.3);merge=true;}
 if(i===2){formula='odd';note='f(−x) = −f(x)｜原点対称';sym=clamp(local/3);merge=true;odd=true;}
 if(i===3){const k=Math.min(2,Math.floor(local/2.34));fn=byId(['square','cube','cos'][k]);formula=['x²：偶関数 → 2倍','x³：奇関数 → 0','cos x：偶関数 → 2倍'][k];note='左右の対称性を、グラフで判断。';}
 if(i===4){formula='summary';note='同じ長さの対称区間 [−a, a] で成り立つ。';}
 }
 const a=fn.id==='cos'?Math.PI/4:1;
 graph(c,{x:pad,y:portrait?370:194,w:w-pad*2,h:portrait?470:310},fn,a,t,{area:!(portrait?i===0: i===0||i===1||i===3),symmetry:sym});
 text(c,`y = ${fn.label}`,w-pad,portrait?342:177,portrait?25:23,C.cyan,'right');
 if(merge)areaMerge(c,w/2,portrait?895:538,w,clamp((p-.35)/.6),odd);
 const fy=portrait?995:600,fs=portrait?29:34;
 if(mathPainter&&['even','odd','example','oddterms','result','cos','coscalc'].includes(formula))mathPainter(c,formula,pad,fy,w-pad*2,portrait?65:62);
 else if(formula==='even')integral(c,'−a','a','f(x) dx = 2 ∫₀ᵃ f(x) dx',pad,fy,fs);
 else if(formula==='odd')integral(c,'−a','a','f(x) dx = 0',pad+(portrait?45:180),fy,fs+4);
 else if(formula==='example')integral(c,'−1','1','(6x³ + x² + 2x + 1) dx',pad,fy,fs);
 else if(formula==='oddterms')text(c,'6x³ + 2x  →  奇関数  →  積分は0',pad,fy,fs,C.orange);
 else if(formula==='result')integral(c,'0','1','(x² + 1) dx × 2 = 8/3',pad,fy,fs);
 else if(formula==='coscalc')text(c,'2[sin x]₀π/⁴ = 2 × √2/2 = √2',w/2,fy,34,C.white,'center');
 else if(formula==='cos')integral(c,'−π/4','π/4','cos x dx = 2[sin x]₀π/⁴ = √2',pad,fy,30);
 else if(formula==='summary'){text(c,'偶関数',pad,920,23,C.gold);mathPainter?mathPainter(c,'even',pad,975,w-pad*2,65):integral(c,'−a','a','f(x) dx = 2 ∫₀ᵃ f(x) dx',pad,975,29);text(c,'奇関数',pad,1050,23,C.cyan);mathPainter?mathPainter(c,'odd',pad,1105,w-pad*2,65):integral(c,'−a','a','f(x) dx = 0',pad,1105,31);}
 else text(c,formula,w/2,fy,portrait?27:33,C.white,'center');
 if(portrait&&formula!=='summary'){text(c,note,w/2,1100,19,C.muted,'center');text(c,'同じ長さの区間 [−a, a] で考える',w/2,1150,17,C.muted,'center');}
 else text(c,note,w/2,portrait?1185:672,portrait?16:21,C.muted,'center');
 c.fillStyle='#17354d';c.fillRect(pad,h-26,w-pad*2,2);c.fillStyle=C.cyan;c.fillRect(pad,h-26,(w-pad*2)*t/(portrait?30:90),2);
 c.restore();
}
