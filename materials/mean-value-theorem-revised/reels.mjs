import {drawReactiveSpace} from './reactive-space.mjs';
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
 return {t,stage,source,explanationVisible:t>=5,math:timeline(source)};
}
export function reelSpeech(t){if(t<5)return 0;const at=Math.max(0,t*sampleRate),i=Math.floor(at);return mix(envelope[i]||0,envelope[i+1]||0,at-i)}
export function reelGuide(t){
 let y=235;
 const speech=reelSpeech(t),accent=[5,8.5,13.7,18.5,25,26].reduce((v,c)=>Math.max(v,t>=c?Math.exp(-(t-c)*3):0),0);
 const x=800+3*Math.sin(t*.8);y+=4*Math.sin(t*.9);
 return {visible:t>=5,opacity:phase(t,5,5.5),x,y,scale:1,angle:t*.66,speech,accent,activity:clamp(.32+.42*speech+.2*accent),hideLabel:true,flareBoost:0,noFlare:true,bounds:{x:x-190,y:y-190,width:380,height:380}};
}
// Uniform scaling preserves coordinate units, parallel lines and slope triangles.
// Each push-in has a quiet hold at the mathematical event before pulling back.
const wide=[160,1580,1.4],measure=[60,1710,1.8],match=[-30,1500,2.15],solution=[-80,1500,2.7];
const cameraKeys=[[0,wide],[5,wide],[8.1,wide],[8.9,measure],[10.4,measure],[11.3,wide],[17.8,wide],[18.7,match],[21.1,match],[22.3,wide],[23.7,wide],[24.95,solution],[26.1,solution],[27.3,wide],[30,wide]];
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
  let plot={...camera,clip:{x:0,y:360,w:1080,h:1400},scale:camera.zoom};
  if(r.stage===0){
   const p=phase(r.t,4,5),approach=phase(r.t,2.5,4),k=mix(1080/1920,.92,approach),imageX=540-960*k,imageY=mix(560,540,approach),A=e.projected.A,B=e.projected.B;
   // Keep a moving photographic depth layer behind the complete classroom shot.
   e.graph.visible=false;try{e.renderer.render(e.classroomScene,e.roomCamera);if(r.t<4){c.fillStyle='#07121e';c.fillRect(0,0,1080,1920)}c.save();c.filter='blur(28px)';c.globalAlpha=.75*(1-p);c.drawImage(e.renderer.domElement,-1166,0,3413,1920);c.restore();c.drawImage(e.renderer.domElement,imageX,imageY,1920*k,1080*k)}finally{e.graph.visible=true}
   if(r.t>=4){const sx=(B.x-A.x)/2*k,sy=(A.y-B.y)/4*k;const transfer={x:mix(imageX+A.x*k,wide[0],p),y:mix(imageY+A.y*k,wide[1],p),sx:mix(sx,224,p),sy:mix(sy,224,p),scale:mix(sx/160,1.4,p),clip:{x:0,y:360,w:1080,h:1400}};c.save();c.globalAlpha=phase(r.t,4,4.25);this.graph(r,transfer);c.restore()}
   if(!r.explanationVisible)return this.canvas;
  }
  const flash=r.t>=25?Math.exp(-(r.t-25)*2):r.t>=18.5?Math.exp(-(r.t-18.5)*1.5):0;
  drawReactiveSpace(c,{time:r.t,focus:target,measure:s.horizontal||0,match:s.matched?1:0,burst:flash});
  this.graph(r,plot);if(r.stage>0)this.text('f(x) = x²',220,460,38,CYAN);if(this.patchMode)return this.canvas;
  const title=r.stage===3&&!s.matched?['平均の2と','同じ傾きを探す。']:headings[r.stage];title.forEach((v,i)=>this.text(v,80,248+i*76,58,WHITE));
  // Explanation follows the graph in a right-hand lane, not a bottom card.
  const panel=c.createLinearGradient(680,0,1060,0);panel.addColorStop(0,'#041423ed');panel.addColorStop(1,'#041423b8');c.fillStyle=panel;c.fillRect(700,475,350,1160);
  c.fillStyle=CYAN;c.fillRect(700,475,3,1160);
  const words=(v,y,size=34,col=WHITE)=>{let line='',at=y;c.save();c.font=`${size}px "Noto Sans CJK JP","Noto Sans JP",sans-serif`;for(const char of v){if(c.measureText(line+char).width>300&&!/[。、！？」]/.test(char)){this.text(line,725,at,size,col);at+=size*1.55;line=''}line+=char}if(line)this.text(line,725,at,size,col);c.restore();return at+size*1.55};
  const math=(v,y,size=44,col=GOLD)=>e.math(c,v,875,y,size,col,'center');
  if(r.stage===0){words('平均と瞬間。',575);words('どこで出会う？',675,36,GOLD)}
  if(r.stage===1){words('区間全体の平均',550,34,CYAN);words('横に2進み、縦に4増える。',660);math(r.source<17?'{縦の変化|横の変化}':r.source<23?'{縦4|横2}':'{4|2} = 2',920,r.source<17?42:62);words(r.source<23?'横と縦を順に測る。':'横1あたり、平均2増える。',1160,36);words('これが割線の傾き。',1380,34,GOLD)}
  if(r.stage===2){words('その場所での速さ',550,34,CYAN);words('接線の傾きは場所で変わる。',675);math(`f′(c) = ${Number(s.slope.toFixed(2))}`,970,42,s.exact?GOLD:PURPLE);words('1 → 2 → 3',1130,38);words(s.exact?'平均の2と一致！':s.slope<2?'平均の2より小さい。':'平均の2より大きい。',1330,34,s.exact?GOLD:WHITE)}
  if(r.stage===3){words(s.matched?'平均と瞬間が一致':'平均の2と比べる',550,34,CYAN);math('割線 y = 2x',770,35);math(s.matched?'接線 y = 2x − 1':`接線の傾き ${Number(s.slope.toFixed(2))}`,900,33,s.matched?GOLD:PURPLE);if(s.matched){math('{2|1} = 2',1100,62);words('同じ横1・縦2。',1270,34);words('離れていても平行。',1410,36,GOLD)}else words('同じ傾きはどこ？',1120,36)}
  if(r.stage===4){words('図の発見を計算へ',550,34,CYAN);words('区間全体の平均2と途中の傾き2cを等しくする。',680,33);math('2c = 2',1050,60,WHITE);if(r.t>=25)math('c = 1',1215,74);words('接点Pは (1,1)。',1450,32,GOLD)}
  if(r.stage===5){words('平均値の定理',550,37,CYAN);words('平均と同じ傾きが途中に必ずある。',680,34);math('{f(b) − f(a)|b − a}',960,38);math('= f′(c)',1070,45);words('閉区間 [a,b] で連続',1210,28,CYAN);words('開区間 (a,b) で微分可能',1330,28,CYAN);words('c ∈ (a,b) が少なくとも1つ存在する。',1470,28)}
  e.drawNarrator(c,{t:r.t+12},{focus:false,state:g});
  c.fillStyle='#7bebff33';c.fillRect(70,1840,820,4);c.fillStyle=CYAN;c.fillRect(70,1840,820*r.t/30,4);
  return this.canvas;
 }
 renderPatch(t){this.c.save();this.c.beginPath();this.c.rect(270,900,250,70);this.c.clip();this.patchMode=true;try{this.render(t)}finally{this.patchMode=false;this.c.restore()}if(!this.patchCanvas){this.patchCanvas=document.createElement('canvas');this.patchCanvas.width=250;this.patchCanvas.height=70;this.patchContext=this.patchCanvas.getContext('2d',{willReadFrequently:true})}this.patchContext.clearRect(0,0,250,70);this.patchContext.drawImage(this.canvas,270,900,250,70,0,0,250,70);return this.patchCanvas;}
 text(v,x,y,size=40,col=WHITE){const c=this.c;c.save();c.font=`${size}px "Noto Sans CJK JP","Noto Sans JP",sans-serif`;c.fillStyle=col;c.shadowColor='#03101e';c.shadowBlur=8;c.fillText(v,x,y);c.restore()}
 graph(r,p){
  const c=this.c,s=r.math,e=this.engine,glyphScale=Math.min(1.2,p.scale),pt=(x,y)=>[p.x+x*p.sx,p.y-y*p.sy],line=(arr,col,w=3,glow=false)=>e.line2(c,arr.map(([x,y])=>pt(x,y)),col,w*Math.min(1.5,p.scale),glow||([GOLD,BLUE,PURPLE].includes(col)&&w>=2.3),1.6),label=(v,x,y,dx=0,dy=0,col=WHITE,size=34)=>{const q=pt(x,y);if(q[0]<p.clip.x||q[0]>p.clip.x+p.clip.w||q[1]<p.clip.y||q[1]>p.clip.y+p.clip.h)return;const font=size*glyphScale;c.save();c.font=`${font}px "Noto Sans CJK JP","Noto Sans JP",sans-serif`;const width=c.measureText(v).width;c.restore();this.text(v,clamp(q[0]+dx*glyphScale,p.clip.x+12,p.clip.x+p.clip.w-width-12),clamp(q[1]+dy*glyphScale,p.clip.y+font+8,p.clip.y+p.clip.h-8),font,col)},dot=(x,y,col)=>{const q=pt(x,y);c.save();c.fillStyle=col;c.shadowColor=col;c.shadowBlur=22*p.scale;c.beginPath();c.arc(...q,7*p.scale,0,Math.PI*2);c.fill();c.restore()};
  c.save();c.beginPath();c.rect(p.clip.x,p.clip.y,p.clip.w,p.clip.h);c.clip();c.beginPath();c.rect(0,0,1080,1920);c.rect(625,360,455,70);c.rect(680,475,400,1160);c.clip('evenodd');
  line([[-1.5,0],[2.4,0]],'#b1cbdf',2);line([[0,-.5],[0,4.5]],'#b1cbdf',2);
  for(const x of [-1,1,2]){line([[x,-.035],[x,.035]],'#a9c4d9',1.5);if(r.stage!==1&&!(r.stage===4&&x===1))label(String(x),x,0,-10,40,'#a9c4d9',32)}
  for(const y of [1,2,3,4]){line([[-.035,y],[.035,y]],'#a9c4d9',1.5);label(String(y),0,y,-42,12,r.stage===4&&y===1?GOLD:'#a9c4d9',32)}
  label('x',2.15,0,-7,-15);label('y',0,4.5,-15,0);label('O',0,0,-32,40);
  const curve=Array.from({length:171},(_,i)=>{const x=-1.5+i*3.9/170;return[x,x*x]});line(curve,CYAN,4,true);label('f(x) = x²',-1.15,3.6,0,0,CYAN,36);
  if(r.stage>=1){if(r.stage===1){line([[0,0],[2*s.horizontal,0]],BLUE,5,true);if(s.t>=15)line([[2,0],[2,4*s.vertical]],GOLD,5,true);if(s.horizontal>.99)label('横2',1,0,-40,70,BLUE,38);if(s.vertical>.99)label('縦4',1.6,2,0,0,GOLD,38)}
   if(r.stage>1||s.secant>0)line([[0,0],[2*(r.stage===1?s.secant:1),4*(r.stage===1?s.secant:1)]],GOLD,4,true);
   if(r.stage>=2){const col=s.exact?GOLD:PURPLE;line([[-.5,s.tangent(-.5)],[2.7,s.tangent(2.7)]],col,4,true);dot(s.c,s.f(s.c),col);if(r.stage>=3){const dx=1;if(s.matched&&r.stage!==4&&(r.stage!==5||p.scale<1.5)){line([[s.c,s.f(s.c)],[s.c+dx,s.f(s.c)]],BLUE,3);line([[s.c+dx,s.f(s.c)],[s.c+dx,s.f(s.c)+s.slope*dx]],GOLD,3);label('1',s.c+.5,s.f(s.c),-8,33,BLUE,30);label('2',s.c+1,s.f(s.c)+1,-36,12,GOLD,30)}label('P',s.c,s.f(s.c),20,50,col,36);if(s.matched){const a=r.stage===4?r.t-25:r.t-18.5;if(a>=0&&a<2){const q=pt(s.c,s.f(s.c));c.save();c.globalAlpha=Math.exp(-a*1.5);c.strokeStyle=GOLD;c.lineWidth=3;c.beginPath();c.arc(...q,15+70*a,0,Math.PI*2);c.stroke();c.restore()}}}}
  }
  if(r.stage===4){c.save();c.setLineDash([8,8]);line([[s.c,0],[s.c,s.f(s.c)]],GOLD,2.3,true);line([[0,s.f(s.c)],[s.c,s.f(s.c)]],BLUE,2.3,true);c.restore();label(r.t>=25?'c = 1':'c',s.c,0,-55,48,GOLD,38)}
  dot(0,0,GOLD);dot(2,4,GOLD);label('A (0,0)',0,0,-185,p.y>1650?-70:88,GOLD,34);label('B (2,4)',2,4,-220,-15,GOLD,38);c.restore();
 }
}
