import {drawGraph} from '../visual.js';
import {rightSum,error} from '../model.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),rnd=i=>{const z=Math.sin(i*127.1+7.31)*43758.5453;return z-Math.floor(z)};
function glow(c,x,y,r,color,alpha=1){c.save();c.globalCompositeOperation='screen';c.globalAlpha=alpha;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(.15,color+'aa');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore()}
function label(c,s,x,y,size=24,col='#e6faff',align='center'){c.font=`${size}px "Noto Sans CJK JP",sans-serif`;c.fillStyle=col;c.textAlign=align;c.fillText(s,x,y)}
function plate(c,x,y,w,h){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#02121bee');g.addColorStop(1,'#052332dc');c.fillStyle=g;c.strokeStyle='#64dcff66';c.lineWidth=1;c.beginPath();c.roundRect(x,y,w,h,14);c.fill();c.stroke()}
function equation(c,math,key,x,y,mw,mh,gold=false,alpha=1){const f=math[key],w=Math.min(mw,mh*f.ratio),h=w/f.ratio;c.save();c.globalAlpha=alpha;if(gold){c.shadowColor='#ffd179';c.shadowBlur=24}c.drawImage(f.image,x-w/2,y-h/2,w,h);c.restore()}
// Filled world-space cuboids and perspective parallax, rather than flat portal outlines.
export function mathWorld(c,t,act){
 const w=720,h=1280,flight=act===2?t*335:t*90,roll=act===2?Math.sin(t*.24)*.065:Math.sin(t*.19)*.035;
 c.fillStyle='#010810';c.fillRect(0,0,w,h);
 const horizon=act===2?585:act===0?690:610;
 const yaw=Math.sin(t*.22)*(act===2?90:150),rise=Math.cos(t*.15)*55;
 function p(x,y,z){const q=780/(z+420),a=(x-yaw)*q,b=(y-rise)*q;return {x:360+a*Math.cos(roll)-b*Math.sin(roll),y:horizon+a*Math.sin(roll)+b*Math.cos(roll),q}}
 function poly(points,col,edge){c.beginPath();points.forEach((a,i)=>i?c.lineTo(a.x,a.y):c.moveTo(a.x,a.y));c.closePath();c.fillStyle=col;c.fill();if(edge){c.strokeStyle=edge;c.lineWidth=.75;c.stroke()}}
 glow(c,360,horizon,550,'#0b526d',.7);glow(c,410,horizon-30,220,'#e5af55',.55);
 // Tall, luminous solid blocks form both walls and a reflective mathematical floor.
 const blocks=[];
 for(let row=0;row<(act===0?0:act===3?8:28);row++)for(let side=0;side<2;side++)for(let j=0;j<(act===1?3:5);j++){
  const seed=row*110+side*37+j,z=120+((row*235-flight+9000)%6580),x=(side?1:-1)*(405+j*105),y=(rnd(seed+39)-.5)*1800;
  blocks.push({x,y,z,dx:22+rnd(seed+19)*58,dy:45+rnd(seed+71)*250,dz:85+rnd(seed+17)*120,gold:act===2?side===1:(seed%5<2),seed});
 }
 for(let row=0;row<24;row++)for(let j=0;j<9;j++){
  const seed=4000+row*13+j,z=100+((row*260-flight+9000)%6240),x=(j-4)*140,y=610+rnd(seed)*150;
  blocks.push({x,y,z,dx:35+rnd(seed+1)*55,dy:20+rnd(seed+2)*90,dz:80+rnd(seed+3)*100,gold:j%3===0,seed});
 }
 blocks.sort((a,b)=>b.z-a.z);
 for(const b of blocks){
  const {x,y,z,dx,dy,dz,gold,seed}=b;
  const a=p(x,y,z),bb=p(x+dx,y,z),d=p(x,y+dy,z),cc=p(x+dx,y+dy,z),e=p(x,y,z+dz),f=p(x+dx,y,z+dz),g=p(x+dx,y+dy,z+dz);
  if(a.x<-220||a.x>940||a.y<-350||a.y>1700)continue;
  const fade=.4+.6*(1-z/7200),bright=gold?'#d1a457':'#15839c',edge=gold?'#ffe2a1':'#72eaff';c.globalAlpha=fade;
  poly([a,bb,cc,d],gold?'#4c361c':'#073744',bright);poly([bb,f,g,cc],gold?'#79532b':'#0d6075',bright);poly([a,e,f,bb],gold?'#cfac6c':'#4aa5b3',edge);
  c.fillStyle=edge;
  for(let k=1;k<7;k++){const yy=y+dy*k/7,aa=p(x+dx*.12,yy,z-1),ab=p(x+dx*.87,yy,z-1);c.globalAlpha=fade*(.2+rnd(seed+k)*.65);c.fillRect(aa.x,aa.y,Math.max(1,ab.x-aa.x),Math.max(.6,a.q*.85))}
  c.globalAlpha=fade*.65;c.strokeStyle=edge;c.lineWidth=Math.max(.5,a.q*.9);c.save();if(seed%9===0){c.shadowColor=edge;c.shadowBlur=11}c.beginPath();c.moveTo(a.x,a.y);c.lineTo(d.x,d.y);c.stroke();c.restore();
 }
 c.globalAlpha=1;
 // Reflective data carpet: thousands of emissive microtiles carry floor parallax.
 for(let j=0;j<2200;j++){
  const z=100+((rnd(j+8000)*6000-flight)%6000+6000)%6000;
  const a=p((rnd(j+8100)-.5)*2000,680+rnd(j+8200)*30,z),size=Math.max(.6,a.q*(1+rnd(j+8300)*3));
  if(a.x<0||a.x>720||a.y<0||a.y>1280)continue;
  c.globalAlpha=.22+rnd(j+8400)*.7;c.fillStyle=j%5?'#68f7ee':'#ffe2a5';c.fillRect(a.x,a.y,size*(2+rnd(j)*3),size*.45);
  if(j%110===0)glow(c,a.x,a.y,11*a.q,j%5?'#55ffee':'#ffd986',.7);
 }
 c.globalAlpha=1;
 // Numeral rain makes the first and last worlds a floating mathematical cosmos.
 if(act===0||act===3){
  for(let column=0;column<28;column++){
   const x=15+column*26+Math.sin(t*.13+column)*9,depth=.4+rnd(column+9000)*.8;
   for(let row=0;row<16;row++){
    const y=((row*91+t*(12+depth*35)+rnd(column)*600)%1450)-80;
    c.globalAlpha=.12+rnd(column*30+row)*.25;
    label(c,['0','1','Σ','∫','x²','1/n','k²'][Math.floor(rnd(column*40+row)*7)],x,y,9+depth*8,column%6?'#65eeeb':'#ffd98a');
   }
  }
  c.globalAlpha=1;
 }
 // Fast points cross multiple depth layers, with a bright vanishing point.
 for(let j=0;j<1750;j++){
  const z=70+((rnd(j+600)*6500-flight*(.4+rnd(j+800)))%6500+6500)%6500;
  const x=(rnd(j+1300)-.5)*2600,y=(rnd(j+2400)-.5)*2700,a=p(x,y,z),b=p(x,y,z+35+(act===2?100:8));
  if(a.x<0||a.x>w||a.y<0||a.y>h)continue;
  c.strokeStyle=j%4===0?'#ffd587b0':'#62eaff90';c.lineWidth=Math.max(.45,a.q*.8);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();
  if(j%53===0)glow(c,a.x,a.y,8*a.q,j%4===0?'#ffd17c':'#51dbff',.5);
 }
 // Holographic formulas hang in space and change scale with camera depth.
 const tokens=['Σ','lim','x²','n → ∞','1/n','k²','∫','S_n','1/3'];
 for(let j=0;j<110;j++){
  const z=180+((rnd(j+3300)*5000-flight*.7)%5000+5000)%5000,a=p((rnd(j+3400)-.5)*2400,(rnd(j+3500)-.5)*2600,z);
  if(a.x<-100||a.x>820||a.y<-100||a.y>1380)continue;
  c.globalAlpha=.15+Math.min(.35,a.q*.2);label(c,tokens[j%tokens.length],a.x,a.y,Math.max(8,Math.min(50,22*a.q)),j%4?'#61eaff':'#ffd58a');
 }
 c.globalAlpha=1;
 // Horizon energy ribbons curve through the volumes, with separate particle wakes.
 for(let layer=0;layer<4;layer++){
  c.strokeStyle=layer%2?'#f6c87744':'#54dcff55';c.lineWidth=1.2;c.beginPath();
  for(let j=0;j<=150;j++){const z=150+j*34,x=Math.sin(z*.002+t*.4+layer)*260,y=340+Math.cos(z*.0017+t*.3+layer)*160,a=p(x,y,z);j?c.lineTo(a.x,a.y):c.moveTo(a.x,a.y)}c.stroke();
 }
 glow(c,390,horizon,100,'#f7c97a',.5);
 // Vignettes keep full-density scenery away from the teaching text.
 const top=c.createLinearGradient(0,0,0,350);top.addColorStop(0,'#01070eee');top.addColorStop(1,'#01070e00');c.fillStyle=top;c.fillRect(0,0,w,350);
 const bot=c.createLinearGradient(0,930,0,h);bot.addColorStop(0,'#01070e00');bot.addColorStop(1,'#01070ef5');c.fillStyle=bot;c.fillRect(0,930,w,350);
}
export function reelsFrame(c,W,H,t,math){
 c.save();c.scale(W/720,H/1280);
 const act=t<5?0:t<13?1:t<21?2:3;
 mathWorld(c,t,act);
 label(c,'MATHEMATICS III / THE INFINITE SUM',360,77,12,'#7fd5e3');
 const headers=['定積分と極限','無限に増える、光の長方形','極限の回廊へ','無限の和が、答えになる'];
 label(c,headers[act],360,139,act===0?45:30);
 label(c,act===0?'数式の奥に、どんな面積がある？':act===1?'幅 1/n × 右端の高さ (k/n)²':act===2?'分割が細かくなるほど、曲線に近づく':'y = x²　｜　0 ≤ x ≤ 1',360,187,19,'#f4d28d');
 if(act===0){
  c.save();c.translate(360,510);const scale=1+t*.07;c.scale(scale,scale);c.shadowColor='#72f0ff';c.shadowBlur=24;label(c,'lim',0,0,145,'#b8f7ff');label(c,'n → ∞',0,67,33,'#ffe0a6');c.restore();
  drawGraph(c,{x:120,y:665,w:480,h:330,t,showRects:false,fill:true,view:'3d',reveal:clamp(t/2)});
  plate(c,65,1020,590,104);label(c,'無限の長方形が、面積を生む',360,1085,25,'#e1f5fa');
 }else if(act===1){
  const n=2**Math.min(7,1+Math.floor((t-5)*.8));
  // A real isometric orbit of extruded rectangles rises over the dense city.
  plate(c,26,269,668,590);drawGraph(c,{x:30,y:298,w:650,h:500,n,t:t*3,showRects:true,fill:true,view:'3d',highlight:Math.floor((t-5)*3)%n+1});
  label(c,`n = ${n}    S_n = ${rightSum(n).toFixed(6)}`,360,912,26,'#ffe0a5');label(c,`はみ出しの面積 ${error(n).toFixed(6)}`,360,951,18,'#ffba91');
  plate(c,35,1000,650,135);equation(c,math,'dimensions',360,1064,590,82);
 }else if(act===2){
  const n=2**Math.min(10,7+Math.floor((t-13)*.45));
  label(c,'n → ∞',360,350,80,'#ffe0a6');
  // The unobstructed vanishing point is the subject of this act.
  c.save();c.globalAlpha=.7;drawGraph(c,{x:170,y:665,w:390,h:270,n,t,view:'3d',showRects:true,fill:true,labels:false});c.restore();
  plate(c,55,937,610,85);label(c,`n = ${n}    S_n = ${rightSum(n).toFixed(6)}`,360,989,23,'#ffdb96');
  plate(c,35,1044,650,105);equation(c,math,t<18?'sigma':t<19.5?'squares':'simplified',360,1092,594,64);
 }else{
  const final=t>=24;
  c.save();c.globalAlpha=.3;drawGraph(c,{x:35,y:350,w:650,h:530,n:1000,t,showRects:false,view:'3d',fill:true});c.restore();
  // Formulas orbit the answer then condense into a luminous central result.
  for(let j=0;j<42;j++){const a=j/42*TAU+t*.22,r=(260+Math.sin(j*7+t)*45)*(1-.84*clamp((t-21)/3)),x=360+Math.cos(a)*r,y=630+Math.sin(a)*r*.8;c.globalAlpha=(.16+rnd(j)*.25)*(1-clamp((t-24)/1.2));label(c,['Σ','x²','lim','∫','1/n','k²'][j%6],x,y,17+rnd(j+3)*24,j%3?'#7dedff':'#ffe3a2')}
  c.globalAlpha=1;glow(c,360,625,320,'#d3a14d',.4);
  plate(c,38,480,644,277);equation(c,math,final?'final':'limit',360,618,576,final?164:112,true,clamp((t-(final?24:21))*2));
  label(c,final?'S = 1/3':'1/n → 0',360,920,52,'#ffe1a1');
  label(c,'区分求積法で、面積が見える。',360,1094,26,'#d1ebf1');
 }
 label(c,act===0?'THE MATHEMATICAL COSMOS':act===1?'THE RECTANGLE ORCHESTRA':act===2?'THE INFINITE CORRIDOR':'THE BIRTH OF THE ANSWER',360,1193,11,'#75aab8');
 for(let j=0;j<4;j++){c.fillStyle=j<=act?'#e6c17c':'#234452';c.fillRect(128+j*120,1243,104,3)}
 c.restore();
}
