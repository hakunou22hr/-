import{drawMath}from'./math.js';import{ease,clamp}from'./model.js';
const TAU=Math.PI*2,seed=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const mix=(a,b,u)=>a+(b-a)*u;
// A camera, moving volume clouds, emissive filaments and a glass wave lattice.
// Everything is reconstructed from t; no still background plate is used.
export function createStage(make,portrait=false){
 const W=portrait?540:960,H=portrait?960:540,canvas=make(W,H),g=canvas.getContext('2d'),bloom=make(W/2,H/2),bl=bloom.getContext('2d');
 const colors={blue:'#3674ff',cyan:'#2be5ff',violet:'#a63fff',gold:'#ffb82f',white:'#e8fcff'};
 function noise(x,y){const i=Math.floor(x),j=Math.floor(y),u=ease(x-i),v=ease(y-j),a=seed(i+j*37),b=seed(i+1+j*37),c=seed(i+(j+1)*37),d=seed(i+1+(j+1)*37);return mix(mix(a,b,u),mix(c,d,u),v)}
 function cloudTexture(rgb){const c=make(256,256),ctx=c.getContext('2d'),im=ctx.createImageData(256,256);for(let y=0;y<256;y++)for(let x=0;x<256;x++){let a=0,amp=.56,f=4;for(let k=0;k<5;k++){a+=amp*noise(x/256*f+19.2,y/256*f+7.3);amp*=.52;f*=2;}const r=Math.hypot((x-128)/128,(y-128)/128),edge=Math.pow(clamp(1-r*r),1.6),density=clamp((a-.22)*2.1);const i=(y*256+x)*4;im.data[i]=rgb[0]*(.6+density*.4);im.data[i+1]=rgb[1]*(.5+density*.5);im.data[i+2]=rgb[2];im.data[i+3]=255*edge*density*.9;}ctx.putImageData(im,0,0);return c;}
 const clouds=[cloudTexture([28,92,175]),cloudTexture([54,35,145]),cloudTexture([52,155,205])];
 function orbTexture(color){const c=make(128,128),ctx=c.getContext('2d'),r=ctx.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'#ffffff');r.addColorStop(.04,'#ffffff');r.addColorStop(.12,color+'ee');r.addColorStop(.35,color+'45');r.addColorStop(1,color+'00');ctx.fillStyle=r;ctx.fillRect(0,0,128,128);return c;}
 const orbs=[orbTexture('#25dfff'),orbTexture('#9955ff'),orbTexture('#ffbc45')];
 let camera,project,q;
 function poly(pts,color,width=1,alpha=1){if(pts.length<2)return;g.save();g.globalAlpha=clamp(alpha);g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.beginPath();let started=false;for(const p of pts){if(!p){started=false;continue;}if(started)g.lineTo(p[0],p[1]);else{g.moveTo(p[0],p[1]);started=true;}}g.stroke();g.restore();}
 function ray(pts,color,width=1,power=1){g.save();g.globalCompositeOperation='lighter';poly(pts,color,width*14,.055*power);poly(pts,color,width*5,.17*power);poly(pts,color,width,.85*power);poly(pts,'#f1fbff',width*.28,.8*power);g.restore();}
 function line3(pts,color,width=1,alpha=1,glowing=false){const points=pts.map(p=>project(...p));if(glowing)ray(points,color,width,alpha);else poly(points,color,width,alpha);}
 function flare(p,color=0,size=24,power=1){if(!p)return;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=clamp(power);g.drawImage(orbs[color],p[0]-size/2,p[1]-size/2,size,size);g.restore();}
 function volume(mode){
  // Lit moving billboards in world space, with independent depth/parallax.
  for(let i=0;i<19;i++){const depth=-10+seed(i+71)*19,angle=q.t*.045+i*2.4,x=mode===2?-9+6*Math.cos(angle):18*Math.cos(angle),y=-1+7*Math.sin(angle*.73),p=project(x,y,depth);if(!p)continue;const size=(4+seed(i+17)*8)*p[2];g.save();g.globalAlpha=(mode===2?.62:.34)*(1-i*.015);g.translate(p[0],p[1]);g.rotate(Math.sin(q.t*.05+i)*.35);g.drawImage(clouds[(mode===2?i%3:i+1)%3],-size/2,-size/2,size,size);g.restore();}
 }
 function stars(){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<420;i++){const z=17-((seed(i)*62+q.t*(q.s===0?1.8:.9))%62),x=(seed(i+900)-.5)*60,y=(seed(i+700)-.5)*31,p=project(x,y,z);if(!p||p[0]<-20||p[0]>W+20||p[1]<-20||p[1]>H+20)continue;g.globalAlpha=.28+.65*seed(i+100);g.fillStyle=i%6?'#83caff':'#ffdc7c';const r=Math.min(2.1,p[2]*.028)+.12;g.fillRect(p[0],p[1],r,r);if(i%53===0)flare(p,i%3,18,.7);}g.restore();}
 function coordinates(){for(let i=-8;i<=8;i++){line3([[i*3,-5,-18],[i*3,-5,18]],'#4f9ce3',.6,.4);line3([[-24,-5,i*3],[24,-5,i*3]],'#4f9ce3',.6,.4);if(q.s===2)line3([[i*3,-5,-14],[i*3,15,-14]],'#316a9b',.5,.33);}}
 function ribbonPoint(a,band,j,t=q.t){const x=(a-.5)*43,phase=t*.70+band*.38,offset=(j-15)*.075;let y=3.3*Math.sin(a*TAU*1.1-phase)+x*.17+offset,z=-3+2.6*Math.cos(a*TAU+phase*.32)+(j-15)*.045;
  if(q.s===1){const split=Math.sin(a*Math.PI)*ease(q.u/.24);y+=(band-1)*split*2.7;z+=(band-1)*split*2.0;}else y+=(band-1)*.35;
  return[x,y,z];}
 function waveRiver(){
  // Wide, tightly bundled blue/violet ribbons fill the image, with bright moving cores.
  for(let band=0;band<3;band++)for(let j=0;j<30;j++){const pts=[];for(let i=0;i<=115;i++)pts.push(project(...ribbonPoint(i/115,band,j)));const color=band===0?colors.blue:band===1?colors.violet:colors.cyan;if(j===10||j===22)ray(pts,color,1.7,1.25);else poly(pts,color,j%4===0?.9:.45,j%4===0?.92:.47);}
  for(let j=0;j<3;j++){const pts=[];for(let i=0;i<=130;i++)pts.push(project(...ribbonPoint(i/130,j,15)));ray(pts,j===1?'#c171ff':'#77e9ff',2.1,1.4);}
  for(let i=0;i<160;i++){const a=(seed(i)+q.t*(.09+.035*seed(i+3)))%1,band=i%3,p=project(...ribbonPoint(a,band,(i%28)));if(i%8===0)flare(p,band,14+seed(i+2)*18,.95);else{const tail=project(...ribbonPoint(a-.008,band,i%28));poly([tail,p],i%2?colors.cyan:colors.violet,1,.9);}}
  // A foreground constellation follows the ribbon rather than drifting arbitrarily.
  const nodes=[];for(let i=0;i<24;i++){const a=i*.39+q.t*.09,p=project(12*Math.cos(a),7*Math.sin(a),-7+3*Math.cos(a*.6));nodes.push(p);if(i)poly([nodes[i-1],p],'#7f58f0',.75,.6);if(i>2&&i%3===0)poly([nodes[i-3],p],'#7f58f0',.6,.5);flare(p,1,15,.85);}
  for(let i=0;i<12;i++){const a=i*.62+q.t*.11,p=project(13*Math.cos(a),7*Math.sin(a),-5);if(!p)continue;g.save();g.globalAlpha=.4;drawMath(g,make,['intSymbol','sumSymbol','sine','cosIntegral'][i%4],p[0],p[1],Math.min(52,p[2]*1.1),i%2?'#c49bff':'#8bdfff');g.restore();}
 }
 function spiral(a,j=0){const r=10.5*Math.pow(1-a,.92)+.22,theta=a*TAU*2.65-q.t*.92+j*.014;return[4.7+r*Math.cos(theta),1+r*Math.sin(theta)*.83,-2+r*Math.sin(theta)*.32+j*.025];}
 function vortex(){
  // A luminous accretion spiral: dense gold filament, orbiting symbols, dust and deep clouds.
  for(let j=0;j<42;j++){const pts=[];for(let i=0;i<=150;i++)pts.push(project(...spiral(i/150,j)));if(j%12===0)ray(pts,j%24?'#ffebad':'#ffa62b',2.0,1.35);else poly(pts,j%3?'#ffc84b':'#fff0b1',j%4===0?.95:.55,.45);}
  // Golden dust flows in depth from the outer arm into the core. Heads and curved
  // tails share an orbit; a few long streaks pass close to the camera.
  function dust(a,i){const j=(seed(i+15)-.5)*55,p=spiral(a,j),angle=a*TAU*2.65-q.t*.92+j*.014,spread=(seed(i+91)-.5)*(1+3*(1-a));p[0]+=Math.cos(angle)*spread;p[1]+=Math.sin(angle)*spread*.83;p[2]+=(seed(i+92)-.5)*(2+6*(1-a));return p;}
  g.save();g.globalCompositeOperation='lighter';
  for(let i=0;i<1440;i++){
   const a=(seed(i)+q.t*(.065+.065*seed(i+31)))%1,world=dust(a,i),p=project(...world);if(!p)continue;
   const fade=clamp(a*14)*clamp((1-a)*22),twinkle=.8+.2*Math.sin(q.t*(2.5+seed(i+44)*2)+i),alpha=fade*(.7+.3*seed(i+21))*twinkle,color=i%5?'#ffd05f':'#fff6cc';
   if(i%4===0){const trail=[],length=i%68===0?.065:.008+seed(i+8)*.014;for(let k=0;k<7;k++)trail.push(project(...dust(Math.max(0,a-length*(1-k/6)),i)));if(i%68===0)ray(trail,'#ffd678',1.35,alpha);else poly(trail,color,.65,alpha*.8);}
   if(i%8===0)flare(p,2,(9+seed(i+9)*22)*Math.min(1.8,p[2]/24),alpha);else{g.globalAlpha=clamp(alpha);g.fillStyle=color;g.beginPath();g.arc(p[0],p[1],(.7+seed(i+13)*1.6)*Math.min(1.8,p[2]/24),0,TAU);g.fill();}
  }
  // A second stream carries dust out of the blue cloud and into the golden arm.
  for(let i=0;i<160;i++){const a=(seed(i+600)+q.t*(.11+.05*seed(i+32)))%1,offset=(seed(i+61)-.5)*1.3,p=project(-20+a*25,2*Math.sin(a*5-q.t*.4)+offset,-5+3*Math.sin(a*4)+offset);if(!p)continue;const tail=project(-20+(a-.015)*25,2*Math.sin((a-.015)*5-q.t*.4)+offset,-5+3*Math.sin((a-.015)*4)+offset);poly([tail,p],'#ffe3a1',1,clamp(a*10)*clamp((1-a)*10)*.8);if(i%9===0)flare(p,2,15,.8);}
  g.restore();
  for(let i=0;i<25;i++){const a=(i/25+q.t*.026)%1,p=project(...spiral(a,(i%3-1)*75));if(!p)continue;g.save();g.globalAlpha=.45+seed(i)*.25;g.translate(p[0],p[1]);g.rotate(Math.sin(a*TAU*2.65-q.t*.92)*.25);drawMath(g,make,['intSymbol','sumSymbol','u','dv','v','du'][i%6],0,0,Math.min(35,18+p[2]*.3),'#ffe6ac');g.restore();}
  const core=project(4.7,1,-2);flare(core,2,175+16*Math.sin(q.t*2.3),.8);flare(core,2,60,1);if(core){ray([[core[0]-120,core[1]],[core[0]+150,core[1]]],'#ffdb80',.8,.9);}
  // Material is visibly pulled out of the cloud into the vortex.
  for(let j=0;j<8;j++){const pts=[];for(let i=0;i<70;i++){const a=i/69;pts.push(project(-20+a*25,2*Math.sin(a*5-q.t*.4)+(j-4)*.13,-5+3*Math.sin(a*4)));}ray(pts,j%2?'#ffd583':'#8dc4ff',j%3===0?1.3:.6,.75);}
 }
 function gridPoint(x,z){const arrival=q.s===4?ease((q.u-.15)/.44):.35+.6*ease(q.u),r=Math.hypot(x*.8,z),pulse=q.s===4?3*arrival*Math.exp(-r*r/55)*Math.sin(r*.75-q.t*2):0;return[x,-2+1.35*Math.cos(x*.38-q.t*.9)*Math.exp(-z*z/90)+pulse,z];}
 function waveLattice(){
  const corners=[[-11,-3,-8],[11,-3,-8],[11,-3,8],[-11,-3,8]],top=corners.map(p=>project(...p));
  const bottom=corners.map(([x,y,z])=>project(x,y-1,z));
  g.save();g.fillStyle='#3167b526';g.strokeStyle='#83c9ff80';g.lineWidth=1;g.beginPath();top.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();g.stroke();for(let i=0;i<4;i++){const j=(i+1)%4;g.fillStyle=i%2?'#386dc342':'#18335970';g.beginPath();for(const [k,p]of[top[i],top[j],bottom[j],bottom[i]].entries())k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]);g.closePath();g.fill();poly([bottom[i],bottom[j]],'#74b4f0',.7,.6);}g.restore();
  for(let j=0;j<=24;j++){const z=-8+j*16/24,pts=[];for(let i=0;i<=40;i++)pts.push(gridPoint(-11+i*22/40,z));line3(pts,j%4===0?'#7cf5ff':'#5373e9',j%4===0?.85:.4,j%4===0?.85:.5);}
  for(let i=0;i<=32;i++){const x=-11+i*22/32,pts=[];for(let j=0;j<=30;j++)pts.push(gridPoint(x,-8+j*16/30));line3(pts,i%4===0?'#b295ff':'#3f79b9',i%4===0?.8:.4,.65);}
  for(let i=0;i<15;i++)for(let j=0;j<10;j++){const p=project(...gridPoint(-10+i*20/14,-7+j*14/9));flare(p,(i+j)%3,(i%3===0&&j%2===0)?13:6,.75);}
  // Three tall travelling wave sheets intersect above the glass lattice.
  for(let sheet=0;sheet<3;sheet++){const ptsBase=[];for(let j=0;j<21;j++){const pts=[];for(let i=0;i<=105;i++){const a=i/105,x=(a-.5)*37,spread=(j-10)*.10,converge=q.s===4?ease((q.u-.1)/.5):.3;let crest=(sheet-1)*(3+4*Math.sin(q.t*.34))*(1-converge),y=5.3*Math.exp(-(x-crest)*(x-crest)/65)+1.1*Math.sin(a*TAU-q.t*.55+sheet*.7*(1-converge))+spread-1,z=(sheet-1)*5*(1-converge)+4*Math.sin(a*Math.PI+sheet*1.6)+spread*.5;y+=1.7*Math.sin(a*Math.PI);pts.push(project(x,y,z));}const color=[colors.cyan,colors.violet,'#ffd88e'][sheet];if(j===10){ray(pts,color,2.1,1.45);ptsBase.push(...pts);}else poly(pts,color,j%5===0?.85:.5,j%5===0?.85:.47);}}
  // Volumetric overhead light and a hot centre give the surface physical depth.
  const centre=project(0,.3,0);flare(centre,q.s===4?2:0,140,.65);flare(project(0,5,-1),2,180,.35);
 }
 function shock(){if(q.collision<.02)return;const p=project(q.s===2?4.7:0,q.s===4?5:1,0);if(!p)return;const r=(1-q.collision)*W*.8;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=q.collision;g.strokeStyle='#ffebba';g.lineWidth=2;g.beginPath();g.ellipse(p[0],p[1],Math.max(3,r),Math.max(2,r*.35),-.15,0,TAU);g.stroke();g.restore();flare(p,2,100+q.collision*240,.65*q.collision);}
 function render(state){q=state;g.globalCompositeOperation='source-over';g.globalAlpha=1;const base=g.createLinearGradient(0,0,W,H);base.addColorStop(0,q.s===2?'#061227':'#100a3c');base.addColorStop(.6,'#030d25');base.addColorStop(1,q.s<2?'#101a5d':'#07192a');g.fillStyle=base;g.fillRect(0,0,W,H);
  // Dolly, orbit and crane moves have distinct trajectories in the three acts.
  const s=q.s,u=q.u,t=q.t,ry=s<2?-.20+.35*Math.sin(u*Math.PI):s===2?-.22+.42*ease(u):-.45+.9*ease(u),rx=s>=3?-.60-.12*Math.sin(u*Math.PI):.10+.10*Math.sin(t*.12),distance=s===0?mix(31,24,ease(u)):s===2?27-3*Math.sin(u*Math.PI):s>=3?30-4*Math.sin(u*Math.PI):28-2*Math.sin(u*Math.PI);camera={ry,rx,distance};
  project=(x,y,z)=>{let xx=x*Math.cos(ry)-z*Math.sin(ry),zz=x*Math.sin(ry)+z*Math.cos(ry),yy=y*Math.cos(rx)-zz*Math.sin(rx),depth=y*Math.sin(rx)+zz*Math.cos(rx)+distance;if(depth<2)return null;const scale=(portrait?530:650)/depth;return[W*.5+xx*scale,H*(portrait?.57:.54)-yy*scale,scale];};
  volume(s);stars();coordinates();if(s<2)waveRiver();else if(s===2)vortex();else waveLattice();shock();
  // Broad coloured bloom is composited behind the pin-sharp luminous cores.
  bl.clearRect(0,0,bloom.width,bloom.height);bl.drawImage(canvas,0,0,bloom.width,bloom.height);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.48;g.filter='blur(7px)';g.drawImage(bloom,0,0,W,H);g.filter='none';g.restore();
  // A subtle lens vignette shapes the frame; it does not dim the central stage.
  const v=g.createRadialGradient(W*.52,H*.5,H*.1,W*.52,H*.5,Math.max(W,H)*.72);v.addColorStop(0,'#00000000');v.addColorStop(.75,'#00030c0b');v.addColorStop(1,'#00030c80');g.fillStyle=v;g.fillRect(0,0,W,H);
  return{camera,mode:s<2?'neon-river':s===2?'gold-vortex':'glass-wave-lattice'};
 }
 return{canvas,render};
}
