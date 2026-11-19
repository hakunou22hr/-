import {TAU,solve,exact,angleText,titles,caption,stages,ease} from './model.mjs';
export const C={white:'#dbf9fc',cyan:'#83e8ee',blue:'#55b6ff',gold:'#f0c36b',muted:'#8caeba'};
const font='"Noto Sans CJK JP", "Noto Sans JP", sans-serif';
function line(c,points,col,width=1,alpha=1){c.save();c.globalAlpha*=alpha;c.strokeStyle=col;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.restore();}
export function mathTokens(s){const re=/([−-]?(?:\d*π|(?:\d+)?√\d+|\d+(?:\.\d+)?|x|y|λ|高さ|底辺|対辺|隣辺))\s*\/\s*(\d*λ|\d+(?:\.\d+)?|斜辺)/gu;let out=[],pos=0;for(const m of s.matchAll(re)){if(m.index>pos)out.push({text:s.slice(pos,m.index)});out.push({n:m[1],d:m[2]});pos=m.index+m[0].length;}if(pos<s.length)out.push({text:s.slice(pos)});return out;}
function txt(c,s,x,y,size=16,col=C.white,align='left'){s=String(s);c.fillStyle=col;c.font=`${size}px ${font}`;if(!s.includes('/')||s.includes(' / 1:30')){c.textAlign=align;c.fillText(s,x,y);return;}const tokens=mathTokens(s);c.textAlign='left';const widths=tokens.map(t=>{if(t.text!==undefined)return c.measureText(t.text).width;c.font=`${size*.8}px ${font}`;const w=Math.max(c.measureText(t.n).width,c.measureText(t.d).width)+size*.35;c.font=`${size}px ${font}`;return w;});let px=x-(align==='center'?widths.reduce((a,b)=>a+b,0)/2:align==='right'?widths.reduce((a,b)=>a+b,0):0);tokens.forEach((t,i)=>{if(t.text!==undefined){c.textAlign='left';c.font=`${size}px ${font}`;c.fillText(t.text,px,y);}else fraction(c,t.n+'/'+t.d,px+widths[i]/2,y-size*.12,size,col);px+=widths[i];});}

export function fraction(c,s,x,y,size=28,col=C.white){let [n,d]=s.split('/');if(!d){txt(c,s,x,y,size,col,'center');return;}txt(c,n,x,y-size*.43,size*.8,col,'center');c.font=`${size*.8}px ${font}`;const half=Math.max(c.measureText(n).width,c.measureText(d).width)/2+size*.12;line(c,[[x-half,y-size*.23],[x+half,y-size*.23]],col,1.2);txt(c,d,x,y+size*.62,size*.8,col,'center');}
function dot(c,x,y,col,r=5){const g=c.createRadialGradient(x,y,0,x,y,r*4);g.addColorStop(0,col+'aa');g.addColorStop(1,col+'00');c.fillStyle=g;c.beginPath();c.arc(x,y,r*4,0,TAU);c.fill();c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
export function geom(w,h,s={}){const zoom=s.stage<2?(s.film ? .65+.35*Math.max(0,Math.min(1,((s.t||0)-12)/15)) : .65):1;return {cx:w*.51,cy:h*.47,R:Math.min(w*.285,h*.325)*zoom};}
// Depth and energy are rendered from geometry each frame; the diagram stays frontal.
function drawReferenceFloor(c,w,h,s,t,points,floorStrength=1,red=0){
 const {cx,cy,R}=geom(w,h,s),reading=cinematicReadability(s);
 const boost=s.reduced||s.film?0:Math.exp(-Math.max(0,t-(s.pulseAt??-100))*1.8),energy=reading*(1+boost*.25),accent=s.mode==='cos'?C.blue:C.gold;
 const dolly=s.reduced?0:.08*Math.sin(t*.2),horizon=h*.555;
 const project=(x,z,y=0)=>{const depth=3+z+dolly;return [cx+x/depth*w*.88,horizon+(1-y)/depth*h*.58];};
 const feet=points.filter(p=>s.range==='full'||p.a<=180+1e-7).map(p=>{const fx=cx+p.x*R,fy=h*.85,depth=h*.58/(fy-horizon);return {...p,fx,fy,xw:(fx-cx)*depth/(w*.88),zw:depth-3-dolly};});
 const wave=(x,z)=>{let v=s.reduced?0:.012*Math.sin(x*4+z*1.5-t*.6);for(const p of feet){const d=Math.hypot((x-p.xw)*2,z-p.zw),age=(t+(p.x>0?1.2:0))%4.8;v+=Math.sin(d*5.2-age*5.8)*Math.exp(-Math.pow(d-age*.9,2)*1.2)*.06;}return v;};
 c.save();
 c.save();c.globalAlpha*=floorStrength;
 // A blue-lit floor occupies the full lower half, with perspective roads to the horizon.
 const floor=c.createLinearGradient(0,horizon,0,h);floor.addColorStop(0,'#06213b00');floor.addColorStop(.2,'#082e4a66');floor.addColorStop(1,'#073049aa');c.fillStyle=floor;c.fillRect(0,horizon,w,h-horizon);
 for(let j=0;j<42;j++){const z=-1.8+j*.34,pts=[];for(let i=0;i<=92;i++){const span=(3+z+dolly)*.62,x=-span+i*2*span/92;pts.push(project(x,z,wave(x,z)));}const major=j%4===0;line(c,pts,major?mixColor('#75dfff','#ff7d90',red):mixColor('#2993c6','#8f324b',red),major?1.5:.85,(major?.68:.4)*energy);if(major)line(c,pts,'#26aaff',7,.065*energy);}
 for(let j=0;j<=60;j++){const x=-5+j/6,pts=[];for(let i=0;i<=94;i++){const u=i/94,z=-1.8+(Math.exp(u*2)-1)/(Math.exp(2)-1)*14;pts.push(project(x,z,wave(x,z)));}const major=j%6===0;line(c,pts,major?mixColor('#65d8ff','#f58098',red):mixColor('#2489be','#8d344e',red),major?1.55:.8,(major?.72:.36)*energy);if(major)line(c,pts,'#2faaff',8,.09*energy);}
 c.globalCompositeOperation='lighter';
 for(let j=0;j<54;j++){const x=((j*17)%53-26)/6,z=-1.3+(j%13)*.43,[px,py]=project(x,z,wave(x,z));dot(c,px,py,j%6===0?C.gold:C.cyan,(j%6===0?1.7:1)*energy);}
 c.restore();c.globalCompositeOperation='lighter';
 // Precisely vertical columns connect each mathematical intersection to its own floor pool.
 for(const p of feet){const qx=cx+p.x*R,qy=cy-p.y*R,fx=qx,fy=p.fy,col=accent;
 const pool=c.createRadialGradient(fx,fy,1,fx,fy,R*.42);pool.addColorStop(0,col+'aa');pool.addColorStop(.16,col+'66');pool.addColorStop(.5,col+'18');pool.addColorStop(1,col+'00');c.save();c.translate(fx,fy);c.scale(1,.28);c.fillStyle=pool;c.translate(-fx,-fy);c.beginPath();c.arc(fx,fy,R*.42,0,TAU);c.fill();c.restore();
 for(let n=0;n<4;n++){const phase=s.reduced?.18:(t*.24+n/4)%1,radius=10+phase*R*.52;c.globalAlpha=(1-phase)*.9*energy;c.strokeStyle=col;c.lineWidth=n===0?2.2:1.35;c.shadowColor=col;c.shadowBlur=9;c.beginPath();c.ellipse(fx,fy,radius,radius*.24,0,0,TAU);c.stroke();}c.shadowBlur=0;c.globalAlpha=1;
 const beam=c.createLinearGradient(fx,qy,fx,fy);beam.addColorStop(0,col+'88');beam.addColorStop(.5,col+'22');beam.addColorStop(1,col+'bb');c.strokeStyle=beam;c.lineWidth=10;c.beginPath();c.moveTo(fx,qy);c.lineTo(fx,fy);c.stroke();line(c,[[fx,qy],[fx,fy]],col,1.7,.9*energy);
 for(let j=0;j<13;j++){const u=(t*.33+j/13)%1;dot(c,fx+(j%2?2:-2),qy+(fy-qy)*u,col,(.8+u*.8)*energy);}
 dot(c,fx,fy,col,4.5*energy);dot(c,fx,fy,'#fff5ce',2.1*energy);}
 c.restore();
}
export const cinematicModes=['meteors','vortex','warp','horizon','sphere','arches'];
const sceneStarts=stages;
export function cinematicCue(s){
 const modes=['arches','arches','warp','sphere','vortex','arches','arches','sphere'];
 const current=!s.film&&cinematicModes.includes(s.atmosphere)?s.atmosphere:modes[s.stage]||'arches';
 return {current,previous:s.film?modes[Math.max(0,s.stage-1)]:current,blend:s.film?ease(((s.t||0)-stages[s.stage])/1.5):1};
}
function mixColor(a,b,u){const n=parseInt(a.slice(1),16),m=parseInt(b.slice(1),16);return '#'+[16,8,0].map(k=>Math.round(((n>>k)&255)*(1-u)+((m>>k)&255)*u).toString(16).padStart(2,'0')).join('');}
export function cinematicReadability(s){const q=k=>k<3?.68:k===4?.8:1;if(!s.film)return q(s.stage);const u=Math.max(0,Math.min(1,((s.t||0)-sceneStarts[s.stage])/2.8)),blend=u*u*(3-2*u);return q(Math.max(0,s.stage-1))*(1-blend)+q(s.stage)*blend;}
const noise=i=>{const a=Math.sin(i*127.1+311.7)*43758.5453;return a-Math.floor(a)};
function aura(c,x,y,r,col,alpha=.5){c.save();c.globalAlpha*=alpha;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col+'cc');g.addColorStop(.24,col+'55');g.addColorStop(.65,col+'15');g.addColorStop(1,col+'00');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore();}
function cinematicLayer(c,w,h,s,t,mode,weight){
 if(weight<.002)return;const {cx,cy,R}=geom(w,h,s),quiet=cinematicReadability(s);
 c.save();c.globalAlpha*=weight*quiet;c.globalCompositeOperation='lighter';
 const camera=s.reduced?0:Math.sin(t*.13)*.075;
 if(mode==='meteors'){
  // Fine luminous particles fill the complete projected dome, including its centre.
  aura(c,w*.22,h*.2,w*.65,'#263583',.38);aura(c,w*.85,h*.65,w*.55,'#452b79',.25);
  const scale=Math.sqrt(w*h/(1100*760));
  for(let layer=0;layer<3;layer++){
   const count=[9000,4200,1400][layer],speed=[.012,.025,.046][layer];
   for(let j=0;j<count;j++){
    const seed=j+layer*13001,u=noise(seed+12),v=noise(seed+83),depth=noise(seed+911);
    // Continuous wrapped flow bends across the dome; separate depth planes create parallax.
    const yy=((v+t*speed*.22)%1+1)%1,xx=((u+t*speed+.026*Math.sin(yy*5+t*.12+layer))%1+1)%1;
    const x=xx*w,y=yy*h+Math.sin(xx*Math.PI)*h*.045*Math.sin(t*.09+layer);
    const shimmer=.58+.42*Math.sin(t*(.65+depth)+seed*1.7)**2;
    const size=(.45+depth*.65+layer*.25)*scale,alpha=(.28+depth*.43)*shimmer;
    c.fillStyle=`rgba(${layer===2?226:193},${layer===2?237:211},255,${alpha})`;
    c.fillRect(x,y,size,size);
    if(layer>0&&j%9===0){
     const length=(1.4+depth*4+layer)*scale;
     line(c,[[x-length,y-length*.13],[x,y]],'#e3ecff',Math.max(.45,size*.55),alpha*.75);
    }
    if(layer===2&&j%23===0){dot(c,x,y,'#e7efff',size*.85);line(c,[[x-3*scale,y],[x+3*scale,y]],'#e3eeff',.6,shimmer*.55);}
   }
  }

 }
 if(mode==='vortex'){
  const ox=cx-R*.18,oy=cy-R*.12,zoom=1+.035*Math.sin(t*.19);
  aura(c,ox,oy,R*1.7,'#087caf',.85);const cloud=c.createRadialGradient(ox,oy,R*.65,ox,oy,R*1.6);cloud.addColorStop(0,'#30caff00');cloud.addColorStop(.5,'#168ed755');cloud.addColorStop(.65,'#68e6ff44');cloud.addColorStop(1,'#1480ba00');c.fillStyle=cloud;c.beginPath();c.arc(ox,oy,R*1.6,0,TAU);c.fill();aura(c,ox,oy,R*.38,'#c8f7ff',.6);
  for(let ring=0;ring<9;ring++){const rr=R*(.48+ring*.145),pts=[];for(let j=0;j<=144;j++){const a=j/144*TAU,z=Math.sin(a*3+t*.2+ring)*R*.025;pts.push([ox+Math.cos(a)*rr*zoom,oy+Math.sin(a)*rr*(.82+camera)+z]);}line(c,pts,ring%4===0?C.gold:'#58d6ff',ring%3===0?1.7:.7,ring%3===0?.5:.22);}
  // Dense, deterministic point clouds: small points are batched without per-point blur.
  for(let j=0;j<3800;j++){const u=noise(j),rr=R*(j%5<3?1.16+(u-.5)*.38:.43+Math.pow(u,.6)*1.45),a=j*2.399+Math.log(rr/R)*2.7+t*(.10+.07*(1-u)),x=ox+Math.cos(a)*rr*zoom,y=oy+Math.sin(a)*rr*(.82+camera)+(noise(j+7)-.5)*R*.13;const size=.6+noise(j+11)*1.7;c.fillStyle=j%13===0?'#ffd084dd':j%4===0?'#e2ffffee':'#66dcffbb';c.fillRect(x,y,size,size);if(j%29===0)dot(c,x,y,j%13===0?C.gold:C.cyan,1.15);}
  for(let arm=0;arm<3;arm++){const pts=[];for(let i=0;i<135;i++){const u=i/134,rr=R*(.42+u*1.45),a=u*TAU*1.05+arm*TAU/3+t*.13;pts.push([ox+Math.cos(a)*rr,oy+Math.sin(a)*rr*(.82+camera)]);}line(c,pts,'#8deeff',1.1,.4);}
 }
 if(mode==='warp'){
  const pos=(u,a)=>{const neck=.15+.74*(1-Math.exp(-Math.pow((Math.abs(u)-.96)/.48,2))),x=u*R*.93,y=Math.cos(a)*neck*R,z=Math.sin(a)*neck*R,depth=3.7+z/R*.45,rot=.14+camera;return [cx+(x*Math.cos(rot)-y*Math.sin(rot))/depth*3.7,cy+(x*Math.sin(rot)+y*Math.cos(rot))/depth*3.7-R*.08];};
  for(let j=0;j<28;j++){const a=j/28*TAU+t*.08;for(let side=0;side<2;side++){const pts=[];for(let i=0;i<=82;i++){const u=(side?0:-2.1)+i/82*2.1;pts.push(pos(u,a));}line(c,pts,side?C.gold:C.blue,j%7===0?1.7:.8,j%7===0?.65:.3);}}
  for(let j=0;j<42;j++){const u=-2.1+j/41*4.2,pts=[];for(let i=0;i<=64;i++)pts.push(pos(u,i/64*TAU+t*.08));line(c,pts,u<0?C.cyan:C.gold,1,.32);}
  for(let side=0;side<2;side++){const [x,y]=pos(side?.96:-.96,0);aura(c,x,y,R*.55,side?'#f6af3b':'#0caef9',.55);for(let j=0;j<40;j++){const u=-2.1+j/39*4.2,a=t*.4+side*Math.PI,[px,py]=pos(u,a);dot(c,px,py,u<0?C.cyan:C.gold,1.2);}}
 }
 if(mode==='horizon'){
  const hy=h*.555,ox=cx-R*.52+Math.sin(t*.09)*R*.035,oy=hy-R*.82,rr=R*.82;
  aura(c,ox,hy,R*1.8,'#8b0d28',.45);
  c.save();c.beginPath();c.rect(0,0,w,hy);c.clip();c.shadowColor='#ff244f';c.shadowBlur=24;c.strokeStyle='#ff294b';c.lineWidth=3.7;c.beginPath();c.arc(ox,oy,rr,0,TAU);c.stroke();c.shadowBlur=0;line(c,[[ox-rr*.55,oy-rr*.86],[ox+rr*.2,oy-rr*.98]],'#ffe4de',1,.4);c.restore();
  line(c,[[0,hy],[w,hy]],'#f93452',20,.14);line(c,[[0,hy],[w,hy]],'#ff8697',1.6,.8);
  const beam=c.createLinearGradient(ox,hy,ox,h);beam.addColorStop(0,'#ffffffaa');beam.addColorStop(.25,'#ff294588');beam.addColorStop(1,'#ff133300');c.strokeStyle=beam;c.shadowColor='#ff1435';c.shadowBlur=18;c.lineWidth=12;c.beginPath();c.moveTo(ox,hy);c.lineTo(ox,h);c.stroke();c.shadowBlur=0;line(c,[[ox,hy],[ox,h]],'#ffd6d9',2,.9);dot(c,ox,hy,'#ffe7e4',3);
  for(let j=0;j<70;j++){const u=(t*.16+j/70)%1,x=ox+(noise(j)-.5)*R*.13*u,y=hy+u*(h-hy);c.fillStyle='#ff486677';c.fillRect(x,y,1,1.8);}
 }
 if(mode==='sphere'){
  const ox=cx+R*.06,oy=cy-R*.10,rr=R*1.29,ry=.17+camera;
  const pos=(lat,a)=>{const x=Math.cos(lat)*Math.cos(a)*rr,y=Math.sin(lat)*rr,z=Math.cos(lat)*Math.sin(a)*rr,xx=x*Math.cos(ry)+z*Math.sin(ry),zz=-x*Math.sin(ry)+z*Math.cos(ry);return [ox+xx/(1+zz/(R*7)),oy+(y*Math.cos(.17)+zz*Math.sin(.17))/(1+zz/(R*7))];};
  aura(c,ox,oy,rr*1.2,'#073b65',.7);
  for(let j=0;j<9;j++){const a=j/9*TAU+t*.065,pts=[];for(let i=0;i<=96;i++)pts.push(pos(-Math.PI/2+i/96*Math.PI,a));line(c,pts,j%3===0?C.gold:C.blue,1.15,j%3===0?.4:.3);}
  for(let j=1;j<9;j++){const lat=-Math.PI/2+j/9*Math.PI,pts=[];for(let i=0;i<=128;i++)pts.push(pos(lat,i/128*TAU+t*.045));line(c,pts,j===4||j===5?C.gold:C.cyan,j===4?1.7:.85,.35);}
  const equator=[];for(let i=0;i<=160;i++)equator.push(pos(0,i/160*TAU+t*.1));line(c,equator,C.gold,16,.2);line(c,equator,'#ffe2a1',3.2,.9);
  for(let j=0;j<340;j++){const a=j/340*TAU+t*.16,[x,y]=pos((noise(j)-.5)*.13,a),size=.65+noise(j+2);c.fillStyle=j%4?'#ffd477bb':'#e8fbffdd';c.fillRect(x,y,size,size);if(j%19===0)dot(c,x,y,'#fff1c5',2);}
  const rim=[];for(let i=0;i<=150;i++){const a=i/150*TAU;rim.push([ox+Math.cos(a)*rr,oy+Math.sin(a)*rr]);}line(c,rim,C.cyan,1.8,.55);for(const sign of [-1,1]){aura(c,ox,oy+sign*rr,R*.16,'#e4a73f',.7);const [x,y]=pos(0,sign<0?Math.PI:0);aura(c,x,y,R*.2,'#ffcc76',.8);line(c,[[x-R*.2,y],[x+R*.2,y]],'#ffedc6',1.4,.85);dot(c,x,y,'#fff7e4',3);}
 }
 if(mode==='arches'){
  const ground=h*.85;
  for(let j=6;j>=0;j--){const depth=j/6,rx=R*(1.04+depth*.85),rY=R*(1.25+depth*.9),ox=cx+Math.sin(t*.11+j*.1)*R*.035,oy=ground-R*.1,col=j%2?C.gold:C.cyan,pts=[];
   pts.push([ox-rx,ground]);for(let i=0;i<=150;i++){const a=Math.PI+i/150*Math.PI;pts.push([ox+Math.cos(a)*rx,oy+Math.sin(a)*rY]);}pts.push([ox+rx,ground]);c.save();c.shadowColor=col;c.shadowBlur=13;line(c,pts,col,j%3===0?2.6:1.4,.8-depth*.35);c.restore();line(c,pts,col,12,.06);
   for(let k=0;k<32;k++){const a=Math.PI+((k/32+t*.024*(j%2?1:-1)+j*.08)%1+1)%1*Math.PI,x=ox+Math.cos(a)*rx,y=oy+Math.sin(a)*rY;c.fillStyle=col+'bb';c.fillRect(x,y,.9,.9);if(k%11===0)dot(c,x,y,col,1.3);}
   c.save();c.globalAlpha*=.2;c.strokeStyle=col;c.lineWidth=.9;c.beginPath();c.ellipse(ox,ground,rx,rx*.12,0,0,TAU);c.stroke();c.restore();
  }
  aura(c,cx,cy-R*.1,R*1.3,'#1269a2',.28);
 }
 c.restore();
}
export function drawAtmosphere(c,w,h,s,t,points){
 const cue=cinematicCue(s);if(cue.blend<1)cinematicLayer(c,w,h,s,t,cue.previous,1-cue.blend);cinematicLayer(c,w,h,s,t,cue.current,cue.blend);
 const strengths={meteors:0,vortex:.28,warp:.42,horizon:.22,sphere:.54,arches:.75};
 const floorStrength=strengths[cue.previous]*(1-cue.blend)+strengths[cue.current]*cue.blend;
 const red=(cue.previous==='horizon'?1-cue.blend:0)+(cue.current==='horizon'?cue.blend:0);
 if(cue.current!=='meteors')drawReferenceFloor(c,w,h,s,t,points,floorStrength,red);
}

export function intersectionGlow(c,x,y,col,t,{reduced=false,valid=true}={}){
 c.save();const strength=valid?1:.12,pulse=reduced?1:.9+.1*Math.sin(t*2.4),outer=col===C.gold?'#ff9f43':'#3278ff';
 c.globalAlpha=strength;c.globalCompositeOperation='lighter';
 const halo=c.createRadialGradient(x,y,0,x,y,49*pulse);halo.addColorStop(0,col+'cc');halo.addColorStop(.19,col+'77');halo.addColorStop(.48,outer+'27');halo.addColorStop(1,outer+'00');c.fillStyle=halo;c.beginPath();c.arc(x,y,49*pulse,0,TAU);c.fill();
 // Two smooth concentric fronts, without flashing the whole frame.
 for(let n=0;n<2;n++){const phase=reduced?.2:(t*.42+n*.5)%1,radius=15+phase*34;c.globalAlpha=strength*(1-phase)*.46;c.strokeStyle=col;c.lineWidth=1.5;c.beginPath();c.arc(x,y,radius,0,TAU);c.stroke();}
 c.globalAlpha=strength;c.strokeStyle=col;c.lineWidth=2.5;c.beginPath();c.arc(x,y,12,0,TAU);c.stroke();
 // Comet-like particles converge onto the mathematical point.
 if(!reduced)for(let j=0;j<16;j++){const u=(t*.46+j/16)%1,a=j*2.399+t*.17,rr=15+(1-u)*62,px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;c.globalAlpha=strength*u*.8;line(c,[[px+Math.cos(a)*7,py+Math.sin(a)*7],[px,py]],col,1.25);dot(c,px,py,col,1.1);}
 c.globalAlpha=strength;const core=c.createRadialGradient(x,y,0,x,y,7);core.addColorStop(0,'#ffffff');core.addColorStop(.42,'#fff8e9');core.addColorStop(1,col);c.fillStyle=core;c.beginPath();c.arc(x,y,7,0,TAU);c.fill();
 c.restore();
}

export function drawScene(c,w,h,s,clock=0){c.clearRect(0,0,w,h);c.save();c.beginPath();c.rect(0,0,w,h);c.clip();const {cx,cy,R}=geom(w,h,s);const t=s.reduced?0:clock;let glow=c.createRadialGradient(cx,cy,0,cx,cy,w*.7);glow.addColorStop(0,'#0b2a3d');glow.addColorStop(.6,'#061722');glow.addColorStop(1,'#040e18');c.fillStyle=glow;c.fillRect(0,0,w,h);
 const mathActive=s.stage>=5, triangle=s.stage<3, showCircle=s.stage>=3;const results=solve(s.mode,s.k,s.range);let roots=mathActive?results.all:[];const points=roots.map(a=>({a,x:Math.cos(a*Math.PI/180),y:Math.sin(a*Math.PI/180)}));const dim=s.dim!==false;
 if(dim){drawAtmosphere(c,w,h,s,t,points);}
 // Coordinate grid remains in the mathematical plane.
 for(let n=-6;n<=6;n++){let x=cx+n*R/4,y=cy+n*R/4;line(c,[[x,cy-R*1.5],[x,cy+R*1.5]],'#44859b',.7,.12);line(c,[[cx-R*1.5,y],[cx+R*1.5,y]],'#44859b',.7,.12);}
 const axes=s.stage>=2;if(axes){line(c,[[cx-R*1.58,cy],[cx+R*1.6,cy]],C.white,1.1,.65);line(c,[[cx,cy+R*1.48],[cx,cy-R*1.36]],C.white,1.1,.65);line(c,[[cx+R*1.56,cy-4],[cx+R*1.6,cy],[cx+R*1.56,cy+4]],C.white,1);line(c,[[cx-4,cy-R*1.32],[cx,cy-R*1.36],[cx+4,cy-R*1.32]],C.white,1);txt(c,'x',cx+R*1.66,cy+5,17);txt(c,'y',cx+9,cy-R*1.36,17);txt(c,'O',cx-20,cy+23,16,C.muted);for(let n of [-1,1]){txt(c,String(n),cx+n*R,cy+24,14,C.muted,'center');txt(c,String(n),cx-15,cy-n*R+5,14,C.muted,'right');}}
 if(showCircle){if(!(s.stage===3&&s.film)){for(let part=0;part<2;part++){if(s.range==='school'&&part)continue;c.save();c.strokeStyle='#75f0ff';c.shadowColor='#39dcff';c.shadowBlur=22;c.lineWidth=8;c.globalAlpha=.13;c.beginPath();c.arc(cx,cy,R,part?0:Math.PI,part?Math.PI:TAU);c.stroke();c.restore();}}if(s.stage===3&&s.film){c.strokeStyle=C.cyan;c.lineWidth=2.2;c.beginPath();c.arc(cx,cy,R,0,-(s.trace??s.a)*Math.PI/180,true);c.stroke();}for(let part=0;part<2;part++){c.beginPath();c.arc(cx,cy,R,part?0:Math.PI,part?Math.PI:TAU);c.lineWidth=s.stage===3&&s.film?0.3:2.7;c.strokeStyle=s.range==='school'&&part?'#35505e':C.cyan;c.shadowColor=C.cyan;c.shadowBlur=s.range==='school'&&part?0:15;c.stroke();c.shadowBlur=0;}if(s.range==='school'){c.fillStyle='#02091399';c.beginPath();c.arc(cx,cy,R,0,Math.PI);c.fill();txt(c,'範囲外',cx,cy+R*.67,13,'#57717f','center');}c.fillStyle='#06131fe8';c.beginPath();c.roundRect(cx-70,cy-R-56,140,30,5);c.fill();txt(c,'x² + y² = 1',cx,cy-R-34,18,C.white,'center');}
 const rr=triangle?s.r:1,a=s.a*Math.PI/180,x=Math.cos(a)*rr,y=Math.sin(a)*rr,px=cx+x*R,py=cy-y*R;
 if(mathActive){const col=s.mode==='sin'?C.gold:C.blue, k=s.k;const lp=s.mode==='sin'?[[cx-R*1.55,cy-k*R],[cx+R*1.55,cy-k*R]]:[[cx+k*R,cy-R*1.4],[cx+k*R,cy+R*1.4]];line(c,lp,col,2.2,.85);const hx=s.mode==='sin'?cx+R*1.32:cx+k*R,hy=s.mode==='sin'?cy-k*R:cy-R*1.2;dot(c,hx,hy,col,5);c.strokeStyle=col;c.beginPath();c.arc(hx,hy,10,0,TAU);c.stroke();const labelX=s.mode==='sin'?cx-R*1.48:hx+16,labelY=s.mode==='sin'?cy-k*R-15:cy-R*1.18;const condition=`${s.mode==='sin'?'y':'x'} = ${exact(k)}`;c.font=`16px ${font}`;const labelWidth=mathTokens(condition).reduce((sum,v)=>sum+(v.text!==undefined?c.measureText(v.text).width:Math.max(c.measureText(v.n).width,c.measureText(v.d).width)*.8+6),0);c.fillStyle='#06131fee';c.strokeStyle=col+'66';c.lineWidth=.7;c.beginPath();c.roundRect(labelX-7,labelY-24,labelWidth+14,44,6);c.fill();c.stroke();txt(c,condition,labelX,labelY,16,col);for(const p of points){let valid=s.range==='full'||p.a<=180+1e-7;let qx=cx+p.x*R,qy=cy-p.y*R;c.save();c.globalAlpha=valid?1:.23;intersectionGlow(c,qx,qy,col,t,{reduced:s.reduced,valid});if(s.reveal>=2||s.film){c.globalAlpha=valid?1:.35;const label=angleText(p.a,s.rad),lx=qx+(p.x<0?-25:25),ly=qy+38;c.font=`16px ${font}`;const tw=c.measureText(label).width;c.fillStyle='#06131fe8';c.fillRect(p.x<0?lx-tw-5:lx-5,ly-21,tw+10,34);txt(c,label,lx,ly,16,col,p.x<0?'right':'left');}c.restore();}}
 // Signed projections are separate from positive side lengths.
 c.save();c.shadowColor='#020a12';c.shadowBlur=6;
 c.fillStyle='#72d8e90c';c.beginPath();c.moveTo(cx,cy);c.lineTo(px,cy);c.lineTo(px,py);c.closePath();c.fill();line(c,[[cx,cy],[px,cy]],C.blue,3);line(c,[[px,cy],[px,py]],C.gold,3);line(c,[[cx,cy],[px,py]],C.white,2.4);if(axes){c.setLineDash([4,6]);line(c,[[px,py],[cx,py]],C.gold,1,.5);line(c,[[px,py],[px,cy]],C.blue,1,.5);c.setLineDash([]);dot(c,px,cy,C.blue,3);dot(c,cx,py,C.gold,3);}
 if(!s.reduced){for(let n=0;n<12;n++){let u=(t*.24+n/12)%1;dot(c,cx+(px-cx)*u,cy+(py-cy)*u,C.cyan,1.2);dot(c,px,cy+(py-cy)*u,C.gold,.9);}}
 c.restore();
 if(Math.abs(x)>.02&&Math.abs(y)>.02){const dx=x>0?-12:12,dy=y>0?-12:12;line(c,[[px+dx,cy],[px+dx,cy+dy],[px,cy+dy]],C.white,1,.7);}
 if(triangle&&s.film&&s.t<12){let phase=Math.floor(s.t/3);if(phase===1)line(c,[[px,cy],[px,py]],C.gold,5);if(phase===2)line(c,[[cx,cy],[px,cy]],C.blue,5);if(phase>=3)line(c,[[cx,cy],[px,py]],C.white,4);}
 // The complete angle is drawn counterclockwise, including all 330 degrees.
 if(s.a>0){let ar=R*.24;c.strokeStyle=C.gold;c.lineWidth=2;c.beginPath();c.arc(cx,cy,ar,0,-a,true);c.stroke();let ex=cx+ar*Math.cos(a),ey=cy-ar*Math.sin(a);let tx=-Math.sin(a),ty=-Math.cos(a);line(c,[[ex-tx*8-ty*4,ey-ty*8+tx*4],[ex,ey],[ex-tx*8+ty*4,ey-ty*8-tx*4]],C.gold,1.5);if(s.a>180){c.strokeStyle='#f0c36b99';c.lineWidth=3;c.beginPath();c.arc(cx,cy,R*1.075,0,-a,true);c.stroke();}}
 txt(c,'θ',cx+R*.33,cy-10,20,C.gold);dot(c,px,py,C.cyan,7);c.strokeStyle=C.cyan;c.beginPath();c.arc(px,py,14,0,TAU);c.stroke();txt(c,'P',px+20,py-14,20,C.white);if(!triangle)txt(c,'1',cx+(px-cx)*.5-15,cy+(py-cy)*.5-12,15,C.white);
 if(triangle){txt(c,'底辺 '+exact(Math.abs(x)),cx+(px-cx)*.5,cy+40,18,C.blue,'center');txt(c,'高さ '+exact(Math.abs(y)),px+22,cy+(py-cy)*.5,18,C.gold);txt(c,'斜辺 '+exact(rr),cx+(px-cx)*.5-45,cy+(py-cy)*.5-30,18);}
 for(const p of points){const valid=s.range==='full'||p.a<=180+1e-7;if(!valid)continue;const qx=cx+p.x*R,qy=cy-p.y*R;c.save();c.fillStyle='#fffdf4';c.beginPath();c.arc(qx,qy,4.3,0,TAU);c.fill();c.strokeStyle=s.mode==='sin'?C.gold:C.blue;c.lineWidth=1.6;c.beginPath();c.arc(qx,qy,8.5,0,TAU);c.stroke();c.restore();}
 if(s.stage===3&&!s.reduced){let trail=[];for(let n=0;n<=100;n++){let aa=(a-n*.012);trail.push([cx+Math.cos(aa)*R,cy-Math.sin(aa)*R]);}line(c,trail,C.cyan,4,.25);}if(!triangle){txt(c,`${angleText(s.a,s.rad)}`,cx,cy+R*1.3,24,C.gold,'center');}else{txt(c,angleText(s.a,s.rad),cx+R*.4,cy-10,17,C.gold);}
 if(s.stage===3||s.stage===4){
  const my=cy+R*1.53,mx=cx-R*1.45;c.fillStyle='#06131fe8';c.fillRect(cx-R-18,my-30,R*2+36,57);c.fillRect(mx-38,cy-R-30,76,R*2+60);
  line(c,[[cx-R,my],[cx+R,my]],C.blue,3,.8);for(const n of [-1,0,1]){line(c,[[cx+n*R,my-5],[cx+n*R,my+5]],C.blue,1.5);txt(c,String(n),cx+n*R,my+22,13,C.muted,'center')}dot(c,cx+Math.cos(a)*R,my,C.blue,6);txt(c,'cos θ：横の位置',cx,my-14,14,C.blue,'center');
  line(c,[[mx,cy-R],[mx,cy+R]],C.gold,3,.8);for(const n of [-1,0,1]){line(c,[[mx-5,cy-n*R],[mx+5,cy-n*R]],C.gold,1.5);txt(c,String(n),mx-13,cy-n*R+5,13,C.muted,'right')}dot(c,mx,cy-Math.sin(a)*R,C.gold,6);txt(c,'sin θ',mx,cy-R-14,14,C.gold,'center');
 }

 c.restore();
}
export function drawFilm(c,s){const w=1920,h=1080;c.fillStyle='#06111d';c.fillRect(0,0,w,h);txt(c,'90°の向こうへ',64,74,36);txt(c,'なぜ単位円を使うの？',430,72,19,C.muted);txt(c,`第${s.stage+1}段階    ${titles[s.stage]}`,64,129,23,C.cyan);c.save();c.translate(0,142);drawScene(c,1260,790,s,s.t);c.restore();line(c,[[1260,170],[1260,914]],'#284758',1);const x=1320;txt(c,s.stage<5?'三角形 → 座標 → 単位円':s.mode==='sin'?'同じ高さを探す':'同じ横位置を探す',x,218,22,C.muted);txt(c,s.stage<2?'θ = 30°':s.stage<5?'OP = 1':`${s.mode} θ =`,x,288,38);if(s.stage>=5)fraction(c,exact(s.k),x+242,280,40,s.mode==='sin'?C.gold:C.blue);txt(c,`θ = ${angleText(s.a,s.rad)}`,x,380,44,C.gold);const a=s.a*Math.PI/180;txt(c,s.stage<2?'相似なら、角度も比も一定。':'P = (cos θ, sin θ)',x,450,27);if(s.stage<2){txt(c,s.stage===0?'sin θ = 高さ/斜辺 = 1/2':Math.abs(s.r-1)<1e-7?'sin θ = 高さ/1 = 1/2':'sin θ = λ/2λ = 1/2',x,525,29,C.gold);txt(c,`cos θ = 底辺/斜辺 = √3/2`,x,610,26,C.blue);}else{txt(c,'cos θ =',x,524,28,C.blue);fraction(c,exact(Math.cos(a)),x+210,518,32,C.blue);txt(c,'sin θ =',x,601,28,C.gold);fraction(c,exact(Math.sin(a)),x+210,595,32,C.gold);}let lines=[];if(s.stage===0)lines=['斜辺 2 → 高さ 1・底辺 √3','sin θ = 高さ/斜辺 = 1/2'];if(s.stage===1)lines=s.t<24?['高さ = λ、斜辺 = 2λ。','同じ倍率λが約分される。']:['斜辺を2から1に、全て半分へ。','高さ 1/2・底辺 √3/2'];if(s.stage===2)lines=['cos θ = x/1 = x = √3/2','sin θ = y/1 = y = 1/2'];if(s.stage===3)lines=['OP = 1 だから x² + y² = 1','辺の長さ ≠ 符号付き座標'];if(s.stage===4)lines=['120°自体は直角三角形の内角にできない','補助三角形は作れる。','負なのは座標。辺の長さではない'];if(s.stage>=5){const r=solve(s.mode,s.k,s.range);lines=[s.range==='school'?'0° ≤ θ ≤ 180°':s.rad?'0 ≤ θ < 2π':'0° ≤ θ < 360°',`円全体 ${r.all.length}点　範囲内 ${r.valid.length}解`,r.valid.length?'θ = '+r.valid.map(a=>angleText(a,s.rad)).join(', '):'この範囲では解なし'];}if(s.stage===7)lines.push('cos θ = −1 → θ = 180° = π');lines.forEach((v,i)=>txt(c,v,x,710+i*55,s.stage===4?21:23,i===2?C.gold:C.white));line(c,[[64,947],[1856,947]],'#294959',1);txt(c,caption(s.t),960,1001,25,C.white,'center');line(c,[[64,1042],[64+1792*s.t/90,1042]],C.cyan,3);txt(c,`${Math.floor(s.t/60)}:${String(Math.floor(s.t%60)).padStart(2,'0')} / 1:30`,1856,76,18,C.muted,'right');}
