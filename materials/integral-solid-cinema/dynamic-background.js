import {SCENES,clamp} from './model.js';
const TAU=Math.PI*2;
const smooth=(a,b,x)=>{const k=clamp((x-a)/(b-a));return k*k*(3-2*k)};
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
export function backgroundState(t,options={}){let phase=SCENES.findIndex(s=>t<s.end);if(phase<0)phase=5;if(options.phase!==undefined)phase=options.phase;const s=SCENES[phase],u=clamp((t-s.start)/(s.end-s.start));return{phase,u,sweep:options.sweep??u,clock:options.clock??t,opacity:options.opacity??1,portrait:options.portrait??false,safeFrame:options.safeFrame??false,protect:options.protect!==false}}
let spark;
function sparkImage(){if(spark)return spark;spark=document.createElement('canvas');spark.width=spark.height=32;const c=spark.getContext('2d',{willReadFrequently:true}),g=c.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'#fff9db');g.addColorStop(.12,'#ffe5a8');g.addColorStop(.3,'#e9b25d99');g.addColorStop(1,'#da9b3900');c.fillStyle=g;c.fillRect(0,0,32,32);return spark}
function glow(ctx,x,y,rx,ry,color,alpha){ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,color);g.addColorStop(.45,color+'80');g.addColorStop(1,color+'00');ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore()}
function stroke(ctx,points,color,alpha,width){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.globalAlpha=alpha*.12;ctx.lineWidth=width*6;ctx.stroke();ctx.globalAlpha=alpha;ctx.lineWidth=width;ctx.stroke()}
function shield(ctx,x,y,rx,ry,alpha){ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(0,0,0,${alpha})`);g.addColorStop(.45,`rgba(0,0,0,${alpha*.94})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore()}
export function paintBackground(ctx,w,h,mathTime,options={}){
 const st=backgroundState(mathTime,options),{phase,u,clock:t,opacity,portrait,safeFrame,protect}=st;
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);if(opacity<=0){ctx.restore();return st}
 const m=Math.min(w,h),frameScale=safeFrame?13/15:1,cx=w*.5,top=h*.035,bottom=h*.96,height=bottom-top,power=phase===5?1:phase===4?.9:.72;
 const base=ctx.createLinearGradient(0,0,w,h);base.addColorStop(0,'#051c24');base.addColorStop(.5,'#0b2830');base.addColorStop(1,'#061319');ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
 glow(ctx,cx,h*.06,w*.40,h*.60,'#225b67',.64);
 glow(ctx,cx,h*.88,w*.65,h*.23,'#966329',.36+.15*power);
 // Slowly moving teal mist around a fixed, vertical axis of light.
 for(let k=0;k<3;k++){const x=cx+Math.sin(t*.11+k*2.2)*w*.34,y=h*(.20+k*.25)+Math.cos(t*.09+k)*h*.06;glow(ctx,x,y,w*.55,h*.28,'#14545e',.24)}
 for(let i=0;i<12;i++){const yy=h*((hash(i+101)+t*.009)%1),xx=cx+Math.sin(t*.07+i*2.3)*w*.26;glow(ctx,xx,yy,w*(.14+.14*hash(i+121)),h*(.06+.06*hash(i+131)),yy>h*.6?'#78613a':'#23606a',.11+.06*Math.sin(t*.2+i));}
 ctx.globalCompositeOperation='screen';
 // The white-gold column is layered light, with visible upward-moving pulses.
 const beam=ctx.createLinearGradient(cx-w*.14,0,cx+w*.14,0);beam.addColorStop(0,'#f5d58b00');beam.addColorStop(.30,'#f2cb7c09');beam.addColorStop(.46,'#fce4ab45');beam.addColorStop(.495,'#fff4cde6');beam.addColorStop(.5,'#fffdf3');beam.addColorStop(.505,'#fff4cde6');beam.addColorStop(.54,'#fce4ab45');beam.addColorStop(.70,'#f2cb7c09');beam.addColorStop(1,'#f5d58b00');ctx.fillStyle=beam;ctx.globalAlpha=.72+.12*Math.sin(t*1.7);ctx.fillRect(cx-w*.14,0,w*.28,h);
 glow(ctx,cx,h*.03,w*.13,h*.26,'#e8f4e6',.52);
 glow(ctx,cx,bottom,w*.27,h*.12,'#f5d99b',.43);
 for(let k=0;k<3;k++){const v=(t*.17+k/3)%1;glow(ctx,cx,bottom-v*height,w*.033,h*.075,'#fff0bf',Math.sin(v*Math.PI)*(.30+.25*power))}
 // Horizontal golden rings ascend, shrink into the column, and rotate in depth.
 const count=phase===4?14:10;
 for(let k=0;k<count;k++){
  const v=(k/count+t*.036)%1,y=bottom-v*height,r=w*(.445-.325*v),ry=r*(.15+.08*(1-v));
  const alpha=Math.pow(Math.sin(v*Math.PI),.55)*(.60+.24*power),points=[];
  for(let j=0;j<=100;j++){const a=j/100*TAU;points.push([cx+Math.cos(a)*r,y+Math.sin(a)*ry])}stroke(ctx,points,'#d8a45d',alpha,m*.0018);
  const front=[];for(let j=0;j<=45;j++){const a=j/45*Math.PI;front.push([cx+Math.cos(a)*r,y+Math.sin(a)*ry])}stroke(ctx,front,'#ffe2a0',alpha*.92,m*.0017);
  // Bright moving packets establish actual rotation, rather than only changing opacity.
  for(let q=0;q<12;q++){const a=q/12*TAU+t*(.30+.035*k)+k*.67,frontness=.30+.70*(.5+.5*Math.sin(a)),x=cx+Math.cos(a)*r,yy=y+Math.sin(a)*ry;ctx.globalAlpha=alpha*frontness;const size=m*(.015+.008*frontness);ctx.drawImage(sparkImage(),x-size/2,yy-size/2,size,size)}
 }
 // Fine golden filaments wind continuously around the shaft.
 for(let k=0;k<4;k++){const points=[];for(let j=0;j<=100;j++){const v=j/100,a=v*TAU*2.1+t*.27+k*TAU/4,r=w*(.075+.37*(1-v));points.push([cx+Math.cos(a)*r,bottom-v*height+Math.sin(a)*r*.08])}stroke(ctx,points,'#e9bb75',.12+.06*power,m*.0008)}
 // Glitter travels upwards in helical orbits and converges towards the luminous axis.
 for(let i=0;i<680;i++){
  const v=(hash(i+5)+t*(.027+hash(i+9)*.028))%1,a=hash(i+27)*TAU+t*(.32+hash(i+31)*.38),radius=w*(.06+.40*(1-v))*(.20+.80*hash(i+15));
  const x=cx+Math.cos(a)*radius,y=bottom-v*height+Math.sin(a)*radius*.1,depth=.52+.48*(.5+.5*Math.sin(a)),alpha=Math.sin(v*Math.PI)*depth;
  ctx.globalAlpha=alpha*(.65+.35*hash(i+19));const size=m*(.009+.020*hash(i+41))*depth;ctx.drawImage(sparkImage(),x-size/2,y-size/2,size,size);
  if(i%3===0){ctx.fillStyle='#ffe4a2';ctx.globalAlpha=alpha*.72;ctx.beginPath();ctx.arc(x,y,m*(.0009+.0008*hash(i+12)),0,TAU);ctx.fill()}
  if(i%15===0&&depth>.7){ctx.strokeStyle='#ffecc1';ctx.globalAlpha=alpha*.5;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(x-size*.6,y);ctx.lineTo(x+size*.6,y);ctx.moveTo(x,y-size*.6);ctx.lineTo(x,y+size*.6);ctx.stroke()}
 }
 if(phase===5){const convergence=smooth(.2,.85,u),pulse=.5+.5*Math.sin(t*1.65);glow(ctx,cx,h*.43,w*(.08+.05*convergence),h*.30,'#ffeac0',(.13+pulse*.12)*convergence)}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='destination-out';
 if(protect){
  // A foreground silhouette and text are allowed to occlude the background column.
  shield(ctx,w*.50,h*(portrait?.50*frameScale:.51),w*.26,h*.33,.73);
  if(portrait)shield(ctx,w*.48,h*.14,w*.70,h*.21,.86);else shield(ctx,w*.20,h*.14,w*.40,h*.24,.91);
  if((phase===4&&u>.38)||(phase===5&&u<.6))shield(ctx,w*(portrait?.5:.80),h*(portrait?.71*frameScale:.69),w*(portrait?.51:.24),h*(portrait?.20*frameScale:.24),.97);
  shield(ctx,w*.5,h*(portrait?(safeFrame?.78:.90):.92),w*.40,h*.14,.97);
 }
 ctx.globalCompositeOperation='destination-in';ctx.fillStyle=`rgba(0,0,0,${opacity})`;ctx.fillRect(0,0,w,h);ctx.restore();return st;
}
