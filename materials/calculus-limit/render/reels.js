import {geometricWorld} from './geometric-world.js';
import {drawGraph} from '../visual.js';
import {rightSum,error} from '../model.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),rnd=i=>{const z=Math.sin(i*127.1+7.31)*43758.5453;return z-Math.floor(z)};
function glow(c,x,y,r,color,alpha=1){c.save();c.globalCompositeOperation='screen';c.globalAlpha=alpha;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(.15,color+'aa');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore()}
function label(c,s,x,y,size=24,col='#e6faff',align='center'){c.font=`${size}px "Noto Sans CJK JP",sans-serif`;c.fillStyle=col;c.textAlign=align;c.fillText(s,x,y)}
function plate(c,x,y,w,h){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#031326dc');g.addColorStop(1,'#081d30b0');c.fillStyle=g;c.beginPath();c.roundRect(x,y,w,h,18);c.fill()}
function equation(c,math,key,x,y,mw,mh,gold=false,alpha=1){const f=math[key],w=Math.min(mw,mh*f.ratio),h=w/f.ratio;c.save();c.globalAlpha=alpha;if(gold){c.shadowColor='#ffd179';c.shadowBlur=24}c.drawImage(f.image,x-w/2,y-h/2,w,h);c.restore()}
export function reelsFrame(c,W,H,t,math){
 c.save();c.scale(W/720,H/1280);
 const act=t<5?0:t<13?1:t<21?2:3;
 geometricWorld(c,t,act);
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
 label(c,act===0?'THE MATHEMATICAL COSMOS':act===1?'THE GEOMETRY OF AN INFINITE SUM':act===2?'THROUGH THE GEOMETRY OF INFINITY':'THE BIRTH OF THE ANSWER',360,1193,11,'#75aab8');
 for(let j=0;j<4;j++){c.fillStyle=j<=act?'#e6c17c':'#234452';c.fillRect(128+j*120,1243,104,3)}
 c.restore();
}
