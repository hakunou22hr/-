import {clamp,mix,phase,timeline} from './model.mjs';
import {sampleRate,envelope} from './narration/reels-envelope.mjs';
const CYAN='#7bebff',GOLD='#ffd18a',BLUE='#79baff',PURPLE='#c8a4ff',WHITE='#eef6ff';
export const reelDuration=30;
export const reelSafeArea={left:70,right:960,top:180,bottom:1650};
export function reelState(value){
 const t=clamp(value,0,30);let stage,source;
 if(t<5){stage=0;source=t<4?t*1.5:6+6*phase(t,4,5)}
 else if(t<11){stage=1;source=mix(12,26.5,(t-5)/6)}
 else if(t<17){stage=2;source=mix(27,43,(t-11)/6)}
 else if(t<22){stage=3;source=mix(43,56.5,(t-17)/5)}
 else if(t<26){stage=4;source=mix(57,69,(t-22)/4)}
 else {stage=5;source=70+(t-26)*.7}
 return {t,stage,source,math:timeline(source)};
}
export function reelSpeech(t){const at=Math.max(0,t*sampleRate),i=Math.floor(at);return mix(envelope[i]||0,envelope[i+1]||0,at-i)}
export function reelGuide(t){
 let y=235;
 const speech=reelSpeech(t),accent=[5,8.5,13.7,18.5,25,26].reduce((v,c)=>Math.max(v,t>=c?Math.exp(-(t-c)*3):0),0);
 const x=800+3*Math.sin(t*.8);y+=4*Math.sin(t*.9);
 return {visible:t>0,opacity:phase(t,0,.5),x,y,scale:1,angle:t*.66,speech,accent,activity:clamp(.32+.42*speech+.2*accent),bounds:{x:x-165,y:y-165,width:330,height:330}};
}
// Uniform scaling preserves coordinate units, parallel lines and slope triangles.
// Each push-in has a quiet hold at the mathematical event before pulling back.
const wide=[260,1050,1],measure=[200,994,2],match=[130,1260,1.75],solution=[244.8,1085.2,2.1];
const cameraKeys=[[0,wide],[5,wide],[5.4,measure],[6,measure],[6.8,wide],[17.8,wide],[18.7,match],[20.9,match],[22.1,wide],[23.7,wide],[24.95,solution],[26.1,solution],[27.2,wide],[30,wide]];
export function reelCamera(t){let i=0;while(i<cameraKeys.length-2&&t>=cameraKeys[i+1][0])i++;const a=cameraKeys[i],b=cameraKeys[i+1],p=phase(t,a[0],b[0]),v=a[1].map((x,k)=>mix(x,b[1][k],p));return {x:v[0],y:v[1],zoom:v[2],sx:160*v[2],sy:160*v[2]};}
const headings=[['全体の平均と','同じ瞬間がある？'],['横と縦を測る。','平均の傾きは？'],['途中の速さは、','場所で変わる。'],['おお、同じ傾き！','離れていても平行。'],['図の発見が、','計算につながる。'],['これが、','平均値の定理。']];
const captions=[['黒板の向こうで、','傾きを探そう。'],['横2に対して縦4。','平均は 4 ÷ 2 = 2。'],['接線を動かすと、','傾きは 1 → 2 → 3。'],['区間全体の平均と、','途中の瞬間が一致。'],['同じ傾きを、','式でつなぐ。'],['平均と同じ傾きが、','途中に、必ずある。']];
export class ReelRenderer{
 constructor(engine){this.engine=engine;this.canvas=document.createElement('canvas');this.canvas.width=1080;this.canvas.height=1920;this.c=this.canvas.getContext('2d',{willReadFrequently:true});}
 async prepare(t){const r=reelState(t);if(r.stage===0)await this.engine.prepareFrame(r.source)}
 render(value){
  const r=reelState(value),e=this.engine,c=this.c,s=r.math,g=reelGuide(r.t),camera=reelCamera(r.t);const drawGraph=e.drawGraph;try{e.drawGraph=()=>{};e.setWorld(s)}finally{e.drawGraph=drawGraph}c.clearRect(0,0,1080,1920);
  const oldW=e.w,oldH=e.h,oldFov=e.camera.fov,oldProjected=e.projected;const target={x:camera.x+camera.sx*s.c,y:camera.y-camera.sy*s.f(s.c)};
  try{e.w=1080;e.h=1920;e.camera.fov=oldFov/camera.zoom;e.projected={...oldProjected,P:target};e.drawProjected(c,s)}finally{e.w=oldW;e.h=oldH;e.camera.fov=oldFov;e.projected=oldProjected}
  const shade=c.createLinearGradient(0,0,0,1920);shade.addColorStop(0,'#03101ed9');shade.addColorStop(.45,'#03101e10');shade.addColorStop(1,'#03101eea');c.fillStyle=shade;c.fillRect(0,0,1080,1920);
  let plot={...camera,clip:{x:20,y:360,w:940,h:780},scale:camera.zoom};
  if(r.stage===0){
   const imageY=425,k=1080/1920,p=phase(r.t,4,5),A=e.projected.A,B=e.projected.B;
   e.graph.visible=false;try{e.renderer.render(e.classroomScene,e.roomCamera);c.drawImage(e.renderer.domElement,0,imageY,1080,607.5)}finally{e.graph.visible=true}
   const sx=(B.x-A.x)/2*k,sy=(A.y-B.y)/4*k;
   plot={x:mix(A.x*k,260,p),y:mix(imageY+A.y*k,1050,p),sx:mix(sx,160,p),sy:mix(sy,160,p),scale:mix(sx/160,1,p),clip:{x:0,y:mix(imageY,360,p),w:1080,h:mix(607.5,780,p)}};
   if(p<.05){c.strokeStyle='#7bebff88';c.lineWidth=2;c.strokeRect(1,imageY,1078,607.5)}
  }
  this.graph(r,plot);if(this.patchMode)return this.canvas;
  this.text('30秒でつかむ / 数学Ⅱ',80,145,28,CYAN);
  const title=r.stage===3&&!s.matched?['平均の2と','同じ傾きを探す。']:headings[r.stage];title.forEach((v,i)=>this.text(v,80,248+i*76,58,WHITE));
  const caption=r.stage===1&&r.source<17?['横と縦の変化を、','順に測ってみよう。']:r.stage===1&&r.source<23?['横2に対して縦4。','これが、割線の傾き。']:r.stage===3&&!s.matched?['接線を戻すと、','どこかで一致する？']:captions[r.stage];caption.forEach((v,i)=>this.text(v,80,1205+i*62,44,i?CYAN:WHITE));
  c.save();c.globalAlpha=.22+.65*g.speech;c.strokeStyle=GOLD;c.lineWidth=2;c.beginPath();c.moveTo(80,1282);c.lineTo(590,1282);c.stroke();c.restore();
  c.fillStyle='#061b2bdf';c.fillRect(65,1310,895,278);c.fillStyle=CYAN;c.fillRect(65,1310,3,278);
  const math=(v,y,size=66,col=GOLD)=>e.math(c,v,510,y,size,col,'center');
  if(r.stage===0){this.text('平均と瞬間。',370,1385,44);this.text('どこで出会う？',330,1460,44,GOLD)}
  if(r.stage===1){this.text('平均変化率',95,1360,36);math(r.source<17?'{縦の変化|横の変化}':r.source<23?'{縦4|横2}':'{4|2} = 2',1460,r.source<17?60:76)}
  if(r.stage===2){this.text('いまの接線の傾き',95,1360,34);math(`f′(c) = ${Number(s.slope.toFixed(2))}`,1450,62,s.exact?GOLD:PURPLE);this.text('1 → 2 → 3',360,1535,46,WHITE)}
  if(r.stage===3){math('割線 y = 2x',1377,48);math(s.matched?'接線 y = 2x − 1':`接線の傾き ${Number(s.slope.toFixed(2))}`,1451,s.matched?48:44,s.matched?GOLD:PURPLE);this.text(s.matched?'傾きは、どちらも2。':'2になる場所は？',280,1540,37,WHITE)}
  if(r.stage===4){math('2c = 2',1390,76,WHITE);if(r.t>=25)math('c = 1',1513,88);else this.text('平均2 ＝ 瞬間2c',290,1510,40,GOLD)}
  if(r.stage===5){math('{f(b) − f(a)|b − a} = f′(c)',1395,56);this.text('閉区間 [a,b] で連続',95,1480,31,CYAN);this.text('開区間 (a,b) で微分可能',95,1525,31,CYAN);this.text('c ∈ (a,b) が少なくとも1つ存在する。',95,1570,30,WHITE)}
  e.drawNarrator(c,{t:r.t+12},{focus:false,state:g});
  this.text('90秒版と操作教材は、教材ページへ。',80,1650,28,'#a9c8d8');
  c.fillStyle='#7bebff33';c.fillRect(80,1690,820,4);c.fillStyle=CYAN;c.fillRect(80,1690,820*r.t/30,4);
  return this.canvas;
 }
 renderPatch(t){this.c.save();this.c.beginPath();this.c.rect(270,900,250,70);this.c.clip();this.patchMode=true;try{this.render(t)}finally{this.patchMode=false;this.c.restore()}if(!this.patchCanvas){this.patchCanvas=document.createElement('canvas');this.patchCanvas.width=250;this.patchCanvas.height=70;this.patchContext=this.patchCanvas.getContext('2d',{willReadFrequently:true})}this.patchContext.clearRect(0,0,250,70);this.patchContext.drawImage(this.canvas,270,900,250,70,0,0,250,70);return this.patchCanvas;}
 text(v,x,y,size=40,col=WHITE){const c=this.c;c.save();c.font=`${size}px "Noto Sans CJK JP","Noto Sans JP",sans-serif`;c.fillStyle=col;c.shadowColor='#03101e';c.shadowBlur=8;c.fillText(v,x,y);c.restore()}
 graph(r,p){
  const c=this.c,s=r.math,e=this.engine,glyphScale=Math.min(1.2,p.scale),pt=(x,y)=>[p.x+x*p.sx,p.y-y*p.sy],line=(arr,col,w=3,glow=false)=>e.line2(c,arr.map(([x,y])=>pt(x,y)),col,w*Math.min(1.5,p.scale),glow),label=(v,x,y,dx=0,dy=0,col=WHITE,size=34)=>{const q=pt(x,y);if(q[0]<p.clip.x||q[0]>p.clip.x+p.clip.w||q[1]<p.clip.y||q[1]>p.clip.y+p.clip.h)return;const font=size*glyphScale;c.save();c.font=`${font}px "Noto Sans CJK JP","Noto Sans JP",sans-serif`;const width=c.measureText(v).width;c.restore();this.text(v,clamp(q[0]+dx*glyphScale,p.clip.x+12,p.clip.x+p.clip.w-width-12),clamp(q[1]+dy*glyphScale,p.clip.y+font+8,p.clip.y+p.clip.h-8),font,col)},dot=(x,y,col)=>{const q=pt(x,y);c.save();c.fillStyle=col;c.shadowColor=col;c.shadowBlur=22*p.scale;c.beginPath();c.arc(...q,7*p.scale,0,Math.PI*2);c.fill();c.restore()};
  c.save();c.beginPath();c.rect(p.clip.x,p.clip.y,p.clip.w,p.clip.h);c.clip();c.beginPath();c.rect(0,0,1080,1920);c.rect(625,360,355,55);c.clip('evenodd');
  line([[-1.5,0],[2.4,0]],'#b1cbdf',2);line([[0,-.5],[0,4.5]],'#b1cbdf',2);
  for(const x of [-1,1,2]){line([[x,-.035],[x,.035]],'#a9c4d9',1.5);if(!(r.stage===4&&x===1))label(String(x),x,0,-10,40,'#a9c4d9',32)}
  for(const y of [1,2,3,4]){line([[-.035,y],[.035,y]],'#a9c4d9',1.5);label(String(y),0,y,-42,12,r.stage===4&&y===1?GOLD:'#a9c4d9',32)}
  label('x',2.15,0,-7,-15);label('y',0,4.5,-15,0);label('O',0,0,-32,40);
  const curve=Array.from({length:171},(_,i)=>{const x=-1.5+i*3.9/170;return[x,x*x]});line(curve,CYAN,4,true);label('f(x) = x²',-1.15,3.6,0,0,CYAN,36);
  if(r.stage>=1){if(r.stage===1){line([[0,0],[2*s.horizontal,0]],BLUE,5,true);if(s.t>=15)line([[2,0],[2,4*s.vertical]],GOLD,5,true);if(s.horizontal>.99)label('横2',1,0,-40,70,BLUE,38);if(s.vertical>.99)label('縦4',1.35,2,0,0,GOLD,38)}
   if(r.stage>1||s.secant>0)line([[0,0],[2*(r.stage===1?s.secant:1),4*(r.stage===1?s.secant:1)]],GOLD,4,true);
   if(r.stage>=2){const col=s.exact?GOLD:PURPLE;line([[-.5,s.tangent(-.5)],[2.7,s.tangent(2.7)]],col,4,true);dot(s.c,s.f(s.c),col);if(r.stage>=3){const dx=1;if(s.matched&&r.stage!==4&&(r.stage!==5||p.scale<1.3)){line([[s.c,s.f(s.c)],[s.c+dx,s.f(s.c)]],BLUE,3);line([[s.c+dx,s.f(s.c)],[s.c+dx,s.f(s.c)+s.slope*dx]],GOLD,3);label('1',s.c+.5,s.f(s.c),-8,33,BLUE,30);label('2',s.c+1,s.f(s.c)+1,-36,12,GOLD,30)}label('P',s.c,s.f(s.c),20,50,col,36);if(s.matched){const a=r.stage===4?r.t-25:r.t-18.5;if(a>=0&&a<2){const q=pt(s.c,s.f(s.c));c.save();c.globalAlpha=Math.exp(-a*1.5);c.strokeStyle=GOLD;c.lineWidth=3;c.beginPath();c.arc(...q,15+70*a,0,Math.PI*2);c.stroke();c.restore()}}}}
  }
  if(r.stage===4){c.save();c.setLineDash([8,8]);line([[s.c,0],[s.c,s.f(s.c)]],GOLD,2.3,true);line([[0,s.f(s.c)],[s.c,s.f(s.c)]],BLUE,2.3,true);c.restore();label(r.t>=25?'c = 1':'c',s.c,0,-55,48,GOLD,38)}
  dot(0,0,GOLD);dot(2,4,GOLD);label('A (0,0)',0,0,-185,88,GOLD,34);label('B (2,4)',2,4,-220,-15,GOLD,38);c.restore();
 }
}
