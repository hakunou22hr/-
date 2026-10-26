import {functions,smooth,lerp} from './math.js';
const TAU=Math.PI*2,CYAN='#66e9ff',GOLD='#ffd47a',MAGENTA='#ff75bc';
const JP='"DejaVu Sans", "Noto Sans CJK JP", "Noto Sans JP", sans-serif';
const fract=x=>x-Math.floor(x),rand=i=>fract(Math.sin(i*127.1+311.7)*43758.5453123);
function path(ctx,pts,close=false){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));if(close)ctx.closePath()}
function text(ctx,s,x,y,size=22,color='#eaf9ff',align='left',weight=400){ctx.font=`${weight} ${size}px ${JP}`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(s,x,y)}
export function formulaTokens(stage,unit=false){
 const f=unit?'f(k/n)':'f(xₖ)Δx',lower=unit?'0':'a',upper=unit?'1':'b';
 if(stage==='curve')return [{s:'y = f(x)'}];
 if(stage==='partition')return [{s:'Δx = (b − a) / n'},{s:'     xₖ = a + kΔx'}];
 if(stage==='rectangle')return [{s:'f(xₖ) × Δx'}];
 if(stage==='limit')return [{s:'n → ∞'},{s:'       Δx → 0'}];
 if(stage==='sum')return [{s:'Sₙ = '},{s:'Σ',up:'n',down:'k = 1'},{s:' f(xₖ)Δx'}];
 const lhs=[{s:'lim',down:'n → ∞'},...(unit?[{s:' 1/n '}]:[]),{s:'Σ',up:'n',down:'k = 1'},{s:` ${f}`}];
 return stage==='sum-limit'?lhs:[...lhs,{s:' = '},{s:'∫',up:upper,down:lower},{s:' f(x) dx'}];
}
function equation(ctx,tokens,cx,y,size,maxWidth){
 const widths=tokens.map(t=>{ctx.font=`400 ${t.s==='Σ'||t.s==='∫'?size*1.45:size}px ${JP}`;return ctx.measureText(t.s).width+(t.up||t.down?size*.48:0)});
 const total=widths.reduce((a,b)=>a+b,0),scale=Math.min(1,maxWidth/total);ctx.save();ctx.translate(cx-total*scale/2,y);ctx.scale(scale,scale);
 let x=0;tokens.forEach((t,i)=>{let big=t.s==='Σ'||t.s==='∫';text(ctx,t.s,x,0,big?size*1.45:size,GOLD);if(t.up)text(ctx,t.up,x+widths[i]*.4,-size*(big?1.18:.9),size*.39,GOLD,'center');if(t.down)text(ctx,t.down,x+widths[i]*.4,size*.53,size*.36,GOLD,'center');x+=widths[i]});ctx.restore();
}
export function createFormulaTargets(createCanvas,W,H,portrait){
 const c=createCanvas(W,H),ctx=c.getContext('2d'),scale=W/(portrait?1080:1920),fy=H*(portrait?.688:.785);
 if(portrait){equation(ctx,formulaTokens('sum-limit'),W*.46,fy-22*scale,37*scale,W*.75);equation(ctx,[{s:'= '},{s:'∫',up:'b',down:'a'},{s:' f(x) dx'}],W*.46,fy+85*scale,43*scale,W*.73)}else equation(ctx,formulaTokens('identity'),W*.5,fy,45*scale,W*.87);
 const pixels=ctx.getImageData(0,0,W,H).data,targets=[];for(let y=Math.floor(fy-100*scale);y<Math.min(H,fy+120*scale);y+=3*scale)for(let x=W*.1;x<W*.9;x+=3*scale){const xx=Math.floor(x),yy=Math.floor(y);if(pixels[(yy*W+xx)*4+3]>140)targets.push([xx,yy])}return targets;
}
export function drawWorld(ctx,W,H,s,options={}){
 const portrait=s.portrait,t=s.time,D=s.data,scale=options.cinema===false?W/(W<800?600:1300):W/(portrait?1080:1920),S=v=>v*scale;
 ctx.save();ctx.fillStyle='#020711';ctx.fillRect(0,0,W,H);
 const wash=ctx.createRadialGradient(W*.49,H*.5,0,W*.5,H*.5,Math.max(W,H)*.7);wash.addColorStop(0,'#0c2539');wash.addColorStop(.55,'#040d1a');wash.addColorStop(1,'#01040a');ctx.fillStyle=wash;ctx.fillRect(0,0,W,H);
 const graphCY=H*(portrait?.445:.425),graphScale=W*(options.cinema===false?.086:portrait?.084:.064),yaw=options.flat?0:s.yaw,pitch=options.flat?0:s.pitch;
 // A perspective camera shared by the graph, coordinate frame and geometry.
 function project(x,y,z){const xx=x*Math.cos(yaw)+z*Math.sin(yaw),zz=-x*Math.sin(yaw)+z*Math.cos(yaw),yy=y*Math.cos(pitch)-zz*Math.sin(pitch),z2=y*Math.sin(pitch)+zz*Math.cos(pitch);const p=14/(14+z2);return [W*.5+xx*graphScale*p,graphCY-yy*graphScale*p]}
 const bgAlpha=1-s.tunnel*.85;
 ctx.globalAlpha=bgAlpha;
 // Spatial floor. The number of actual lines doubles at each partition step.
 ctx.strokeStyle='#164664';ctx.lineWidth=S(1);ctx.beginPath();
 const gl=s.gridLevel;for(let i=0;i<=gl;i++){const x=-8+16*i/gl;const a=project(x,-2.8,0),b=project(x+.3*Math.sin(t*.3+i*.2),-2.8,28);ctx.moveTo(...a);ctx.lineTo(...b)}
 for(let j=0;j<24;j++){const z=fract(j/24+t*.012)*30;const a=project(-9,-2.8,z),b=project(9,-2.8,z);ctx.moveTo(...a);ctx.lineTo(...b)}ctx.stroke();
 // Changing rings in different depth planes, not image layers.
 for(let r=0;r<5;r++){
  const z=6+r*3.5+.35*Math.sin(t*.35+r),pts=[];for(let k=0;k<=64;k++){const a=k/64*TAU+t*(.045+r*.009),radius=6+r*.8+.18*Math.sin(a*4+t*.3+s.split);pts.push(project(Math.cos(a)*radius,Math.sin(a)*radius*.72,z))}path(ctx,pts);ctx.strokeStyle=r%2?'#233e55':'#16516b';ctx.lineWidth=S(r===0?2:1);ctx.stroke();
  const polygon=[];for(let k=0;k<=6;k++){const a=k/6*TAU-t*.04;polygon.push(project(Math.cos(a)*(6+r),Math.sin(a)*(4+r*.2),z))}path(ctx,polygon);ctx.strokeStyle='#173246';ctx.stroke();
 }
 for(let i=0;i<100;i++){const z=2+fract(rand(i+100)+t*.008)*25,x=(rand(i+1)-.5)*24,y=(rand(i+2)-.5)*15,p=project(x,y,z);ctx.globalAlpha=bgAlpha*(.18+.6*rand(i+5));ctx.fillStyle=i%5===0?GOLD:CYAN;ctx.fillRect(p[0],p[1],S(1.2+1.7*rand(i)),S(1.2+1.7*rand(i)))}ctx.globalAlpha=1;
 // Limit corridor is symbolic architecture, independent of the true graph.
 if(s.tunnel>.001){ctx.save();ctx.globalAlpha=s.tunnel;ctx.fillStyle=`rgba(2,7,17,${s.tunnel*.97})`;ctx.fillRect(0,0,W,H);
 const vx=W*(.5+.025*Math.sin(t*.37)),vy=H*(portrait?.46:.48),speed=portrait?1.6:1.1;
 for(let k=30;k>=0;k--){const z=.5+fract(k/31-t*.11*speed)*24,p=2.1/z,rx=W*.39*p,ry=H*(portrait?.235:.42)*p,twist=.07*Math.sin(t*.18+z*.2),pts=[];
 for(let j=0;j<6;j++){const a=j/6*TAU+Math.PI/6+twist;pts.push([vx+Math.cos(a)*rx,vy+Math.sin(a)*ry])}path(ctx,pts,true);ctx.strokeStyle=k%3===0?GOLD:CYAN;ctx.globalAlpha=s.tunnel*(.13+.7*(1-z/25));ctx.lineWidth=S(1+3/z);ctx.stroke();
 const subdivisions=8+Math.floor(smooth((t-(portrait?12:72))/(portrait?8:17))*56);for(let j=0;j<subdivisions;j++){const q=j/subdivisions,edge=q*6,e=Math.floor(edge),f=edge-e,A=pts[e],B=pts[(e+1)%6];const x=lerp(A[0],B[0],f),y=lerp(A[1],B[1],f);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(vx+(x-vx)*1.1,vy+(y-vy)*1.1);ctx.strokeStyle=j%4===0?GOLD:'#1a5674';ctx.stroke();}}
 ctx.globalAlpha=s.tunnel*.5;for(let j=0;j<28;j++){const a=rand(j+900)*TAU,r=fract(rand(j+820)+t*.23);path(ctx,[[vx+Math.cos(a)*W*r*.4,vy+Math.sin(a)*H*r*.4],[vx+Math.cos(a)*W*(r+.13)*.4,vy+Math.sin(a)*H*(r+.13)*.4]]);ctx.strokeStyle=j%3?CYAN:GOLD;ctx.stroke()}ctx.restore();}
 const gAlpha=1-s.tunnel*.96;
 ctx.save();ctx.globalAlpha=gAlpha;
 const f=D.f||functions[D.key].f;let ymin=0,ymax=0;for(let i=0;i<=250;i++){const v=f(D.a+(D.b-D.a)*i/250);ymin=Math.min(ymin,v);ymax=Math.max(ymax,v)}const yrange=Math.max(.8,ymax-ymin),gy=v=>(v-ymin)/yrange*3.55-1.55,gx=v=>(v-D.a)/(D.b-D.a)*9-4.5;
 const pt=(x,y)=>project(gx(x),gy(y),0),base=gy(0);
 // Coordinate plane with exact equal-width partitions.
 ctx.strokeStyle='#17475b';ctx.lineWidth=S(1);ctx.beginPath();
 for(let j=0;j<=Math.min(D.n,64);j++){const x=D.a+(D.b-D.a)*j/Math.min(D.n,64),a=pt(x,ymin),b=pt(x,ymax);ctx.moveTo(...a);ctx.lineTo(...b)}
 for(let j=0;j<=6;j++){const y=ymin+yrange*j/6;ctx.moveTo(...pt(D.a,y));ctx.lineTo(...pt(D.b,y))}ctx.globalAlpha=gAlpha*(1-s.crystal*.8);ctx.stroke();ctx.globalAlpha=gAlpha;
 // Smooth signed integral area. It represents the limit, not equality of a finite sum.
 if(s.crystal>.001||s.rectReveal<.01){const alpha=s.crystal>.001?s.crystal*.34:.14*s.curveReveal;for(let i=0;i<220;i++){const x0=D.a+(D.b-D.a)*i/220,x1=D.a+(D.b-D.a)*(i+1)/220,y0=f(x0),y1=f(x1);path(ctx,[pt(x0,0),pt(x0,y0),pt(x1,y1),pt(x1,0)],true);ctx.fillStyle=(y0+y1)<0?`rgba(255,76,164,${alpha})`:`rgba(255,196,88,${alpha})`;ctx.fill()}}
 const reveal=s.rectReveal;
 if(reveal>.001&&s.crystal<.999){
  for(let i=0;i<D.n;i++){const r=D.rectangles[i],oldIndex=Math.floor(i/2),oldX=D.a+(oldIndex+1)*(D.b-D.a)/s.previous,oldH=f(Math.min(D.b,oldX));
   const ht=r.height;
   const rise=1,h=ht*rise,points=[pt(r.left,0),pt(r.left,h),pt(r.right,h),pt(r.right,0)];path(ctx,points,true);
   const neg=r.height<0;ctx.fillStyle=neg?'rgba(255,75,158,.24)':'rgba(255,200,104,.25)';ctx.globalAlpha=gAlpha*(1-s.crystal)*smooth(reveal*1.5-i/D.n*.45);ctx.fill();ctx.strokeStyle=neg?MAGENTA:GOLD;ctx.globalAlpha=gAlpha*(1-s.crystal)*smooth(reveal*1.5-i/D.n*.45);ctx.lineWidth=S((D.n>64?.7:1.5)+(s.splitT<1&&i%2===0?(1-s.splitT)*2:0));ctx.stroke();ctx.globalAlpha=gAlpha;
   // Error band between the fixed curve and each right-end rectangle.
   if(D.n<=32&&s.crystal<.5){path(ctx,[pt(r.left,f(r.left)),pt(r.right,f(r.right)),pt(r.right,h),pt(r.left,h)],true);ctx.fillStyle='rgba(76,216,255,.19)';ctx.fill()}
   if(D.n<=32){const p=pt(r.right,r.height);ctx.beginPath();ctx.arc(...p,S(3),0,TAU);ctx.fillStyle=CYAN;ctx.fill()}
  }
 }
 // Axes and the invariant continuous function.
 path(ctx,[project(-4.9,base,0),project(4.9,base,0)]);ctx.strokeStyle=GOLD;ctx.lineWidth=S(2);ctx.stroke();
 path(ctx,[project(-4.5,-1.9,0),project(-4.5,2.45,0)]);ctx.strokeStyle='#4f9eb6';ctx.stroke();
 const curve=[];for(let i=0;i<=300*s.curveReveal;i++){const x=D.a+(D.b-D.a)*i/300;curve.push(pt(x,f(x)))}path(ctx,curve);ctx.strokeStyle='rgba(65,212,255,.18)';ctx.lineWidth=S(13);ctx.stroke();ctx.strokeStyle=CYAN;ctx.lineWidth=S(3.3);ctx.stroke();
 const ap=pt(D.a,0),bp=pt(D.b,0);text(ctx,s.unitInterval?'0':D.a===0?'a = 0':`a = ${Number(D.a.toFixed(3))}`,ap[0],ap[1]+S(36),S(21),GOLD,'center');text(ctx,s.unitInterval?'1':`b = ${Number(D.b.toFixed(3))}`,bp[0],bp[1]+S(36),S(21),GOLD,'center');text(ctx,'x',bp[0]+S(30),bp[1]+S(4),S(23),CYAN);
 const label=pt(D.b*.88+D.a*.12,f(D.b*.88+D.a*.12));text(ctx,'y = f(x)',label[0]-S(10),label[1]-S(28),S(22),CYAN,'right');
 // A rectangle gives birth to width × height labels.
 if(s.formulaStage==='rectangle'){
  const r=D.rectangles[1],mid=(r.left+r.right)/2,p=pt(mid,0),q=pt(r.right,r.height/2);text(ctx,'Δx',p[0],p[1]+S(75),S(30),GOLD,'center');text(ctx,'f(xₖ)',q[0]+S(16),q[1],S(27),CYAN);
 }
 if(s.formulaStage==='partition'){for(let k=0;k<=D.n;k++){const p=pt(D.a+k*D.dx,0);ctx.beginPath();ctx.arc(...p,S(3+1.4*Math.sin(t*3-k)),0,TAU);ctx.fillStyle=GOLD;ctx.fill();text(ctx,`x${['₀','₁','₂','₃','₄'][k]||''}`,p[0],p[1]+S(56),S(16),CYAN,'center')}}
 if(s.crystal>0&&s.crystal<1){for(let i=0;i<220;i++){const r=D.rectangles[i%D.n],phase=s.crystal,p=pt(r.right+Math.sin(i*1.8)*phase*D.dx,r.height*lerp(rand(i+930),1,phase));ctx.globalAlpha=gAlpha*(1-phase);ctx.fillStyle=i%4?GOLD:CYAN;ctx.beginPath();ctx.arc(...p,S(1+rand(i+1)*2),0,TAU);ctx.fill()}}
 ctx.restore();
 // Mathematical light travels from exact rectangle endpoints into sampled formula glyphs.
 if(s.formation>0&&s.formation<1&&options.formulaTargets?.length){const targets=options.formulaTargets;for(let i=0;i<Math.min(1600,targets.length);i++){const target=targets[Math.floor(i*targets.length/Math.min(1600,targets.length))],r=D.rectangles[i%D.n],start=pt(r.right,r.height),phase=smooth(Math.max(0,Math.min(1,s.formation*1.35-rand(i+550)*.30))),arc=Math.sin(phase*Math.PI),x=lerp(start[0],target[0],phase)+Math.sin(i)*arc*S(35),y=lerp(start[1],target[1],phase)-arc*S(80);ctx.fillStyle=i%9?GOLD:CYAN;ctx.globalAlpha=.45+.55*phase;ctx.fillRect(x,y,S(1.9),S(1.9));}ctx.globalAlpha=1;}
 if(options.cinema!==false){
  // Screen-stable mathematical typography remains readable during camera motion.
  text(ctx,'MATHEMATICS Ⅲ  /  RIEMANN → INTEGRAL',W*(portrait?.085:.06),H*(portrait?.092:.075),S(portrait?20:18),'#8aa4b5','left',500);
  text(ctx,s.chapter,W*(portrait?.085:.06),H*(portrait?.137:.128),S(portrait?40:38),'#f4f8fa','left',600);
  const fy=H*(portrait?.688:.785),tokens=formulaTokens(s.formulaStage,s.unitInterval);ctx.save();if(s.formation>0&&s.formation<1){ctx.beginPath();ctx.rect(0,fy-S(110),W*smooth((s.formation-.4)/.6),S(245));ctx.clip()}if(s.crystal>.95)ctx.globalAlpha=.88+.12*Math.sin(t*2.4);
  if(portrait&&(s.formulaStage==='identity'||s.formulaStage==='unit')){equation(ctx,formulaTokens('sum-limit'),W*.46,fy-S(22),S(37),W*.75);equation(ctx,[{s:'= '},{s:'∫',up:'b',down:'a'},{s:' f(x) dx'}],W*.46,fy+S(85),S(43),W*.73)}else equation(ctx,tokens,W*(portrait?.46:.5),fy,S(portrait?43:45),W*(portrait?.76:.87));
  ctx.restore();
  const caption=s.signed?'上側は正、下側は負。定積分は符号付きの和。':s.caption;
  text(ctx,caption,W*(portrait?.46:.5),H*(portrait?.845:.915),S(portrait?25:27),s.signed?MAGENTA:'#d9e5ee','center',500);
  if(s.tunnel>.3)text(ctx,'極限を象徴する空間演出',W*(portrait?.46:.5),H*(portrait?.61:.64),S(17),'#829db1','center');
  if(s.signed)text(ctx,'正の寄与 ＋   ／   負の寄与 −',W*.5,H*.64,S(21),MAGENTA,'center');
  if(s.formulaStage==='sum'||s.formulaStage==='partition'||s.formulaStage==='rectangle'){
   const msg=`n = ${D.n}     Δx = ${D.dx.toFixed(6)}     Sₙ = ${D.sum.toFixed(6)}`;text(ctx,msg,W*(portrait?.46:.5),H*(portrait?.605:.665),S(portrait?22:22),GOLD,'center');
   if(s.formulaStage==='sum')text(ctx,`定積分 = ${D.exact.toFixed(6)}     誤差 = ${D.error>=0?'+':''}${D.error.toFixed(6)}`,W*(portrait?.46:.5),H*(portrait?.63:.70),S(18),'#90afbf','center');
  }
  if(s.unitInterval)text(ctx,'特別な場合：a = 0、b = 1、Δx = 1/n',W*.5,H*.65,S(22),CYAN,'center');
  if(s.crystal>.95){ctx.save();ctx.globalAlpha=.12+.035*Math.sin(t*2.4);text(ctx,'∫',W*.5,H*(portrait?.49:.49),S(portrait?170:180),GOLD,'center');ctx.restore()}
  if(s.crystal>.95)text(ctx,'有限の和は近似。等号は極限に対して成り立つ。',W*(portrait?.46:.5),H*(portrait?.9:.963),S(16),'#8297a9','center');
  ctx.fillStyle='#132b3a';ctx.fillRect(W*.06,H*.98,W*.88,S(2));ctx.fillStyle=GOLD;ctx.fillRect(W*.06,H*.98,W*.88*s.progress,S(2));
 }
 ctx.restore();
 return {n:D.n,dx:D.dx,sum:D.sum,exact:D.exact,gridLines:s.gridLevel,rectangles:D.n,formula:s.formulaStage,yaw:s.yaw,tunnel:s.tunnel};
}
