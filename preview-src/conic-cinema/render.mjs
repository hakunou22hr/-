import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import * as T from 'three';
import {writeFileSync,mkdirSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {parabola,ellipse,hyperbola,section} from './math.mjs';
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','JP');
const vertical=process.argv.includes('--vertical'),sample=process.argv.includes('--samples');
const W=vertical?1080:1920,H=vertical?1920:1080,FPS=30,D=vertical?30:90,root='public/previews/conic-cinema/';
mkdirSync('work/conic-cinema',{recursive:true});
const c=createCanvas(W,H),g=c.getContext('2d'),classroom=await loadImage(root+'classroom.jpg');
const equations=Object.fromEntries(await Promise.all(['parabola','ellipse','hyperbola'].map(async k=>[k,await loadImage(root+'formula-'+k+'.png')])));
const camera=new T.PerspectiveCamera(vertical?54:44,W/H,.1,200),v=new T.Vector3();
const clamp=x=>Math.min(1,Math.max(0,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t,TAU=Math.PI*2;
const rnd=n=>{let x=Math.sin(n*127.1+31.7)*43758.54;return x-Math.floor(x)};
const GOLD='#ffd080',CYAN='#85e7ff',PURPLE='#ceabff';
const sprite=createCanvas(80,80),sg=sprite.getContext('2d'),gr=sg.createRadialGradient(40,40,0,40,40,40);gr.addColorStop(0,'#fff8e8');gr.addColorStop(.08,'#ffeac0');gr.addColorStop(.25,'#ffd08080');gr.addColorStop(1,'#ffc36000');sg.fillStyle=gr;sg.fillRect(0,0,80,80);
// Stable dry-chalk texture: irregular pressure, broken edges and fine powder.
// The grain stays attached to the board rather than flickering every frame.
const chalk=createCanvas(1280,760),cg=chalk.getContext('2d');
function chalkPoint(u,offset=0){
  // Low-frequency hand movement changes the silhouette, not just its color.
  return[640+(520+9*Math.sin(3*u+.4)+4*Math.cos(5*u)+offset)*Math.cos(u)+4*Math.sin(2*u),380+(276+6*Math.sin(4*u+.8)+offset*.55)*Math.sin(u)+4*Math.cos(3*u)];
}
for(let pass=0;pass<3;pass++)for(let i=0;i<720;i++){
  const u=i/720*TAU,u2=(i+1.25)/720*TAU,pressure=.5+.28*Math.sin(u*2-.6)+.18*Math.sin(u*7+.4),dry=rnd(i+3200);
  if(dry<.045||((i>115&&i<137)||(i>462&&i<480))&&dry<.46)continue;
  const offset=(rnd(i+pass*900)-.5)*2.8;
  cg.strokeStyle=`rgba(248,247,231,${.15+pressure*.39+rnd(i+pass*1700)*.12})`;cg.lineWidth=3.5+pressure*5+rnd(i+pass*800)*1.6;cg.lineCap='butt';
  cg.beginPath();cg.moveTo(...chalkPoint(u,offset));cg.lineTo(...chalkPoint(u2,offset));cg.stroke();
}
// Pores in a dry chalk stroke and a few loose grains give a matte edge.
cg.globalCompositeOperation='destination-out';
for(let i=0;i<2600;i++){const u=rnd(i+4000)*TAU,[x,y]=chalkPoint(u,(rnd(i+8000)-.5)*9),size=.45+rnd(i+11000)*1.6;cg.fillStyle=`rgba(0,0,0,${.18+rnd(i+12000)*.7})`;cg.fillRect(x,y,size,size);}
cg.globalCompositeOperation='source-over';
for(let i=0;i<1700;i++){const u=rnd(i+16000)*TAU,[x,y]=chalkPoint(u,(rnd(i+19000)-.5)*23);cg.fillStyle=`rgba(250,249,233,${.04+rnd(i+22000)*.28})`;const size=.4+rnd(i+25000);cg.fillRect(x,y,size,size);}
// A lightly retraced join, as a real hand closes the oval.
cg.strokeStyle='#f8f7e74a';cg.lineWidth=2.5;cg.beginPath();for(let i=0;i<=24;i++){const u=TAU-.09+i/24*.19,[x,y]=chalkPoint(u,2.6);if(i)cg.lineTo(x,y);else cg.moveTo(x,y);}cg.stroke();
const pools=Object.fromEntries(['#0785ff','#9d35ff','#ffae35'].map(col=>{const s=createCanvas(320,320),ctx=s.getContext('2d'),r=ctx.createRadialGradient(160,160,0,160,160,160);r.addColorStop(0,col+'99');r.addColorStop(.35,col+'55');r.addColorStop(.7,col+'20');r.addColorStop(1,col+'00');ctx.fillStyle=r;ctx.fillRect(0,0,320,320);return[col,s];}));
function project(x,y,z=0){v.set(x,y,z).applyMatrix4(camera.matrixWorldInverse);if(v.z>-.6)return[NaN,NaN];v.set(x,y,z).project(camera);return[(v.x+1)*W/2,(1-v.y)*H/2];}
function line(pts,col,w=2,alpha=1){if(pts.length<2)return;g.save();g.globalAlpha=alpha;g.strokeStyle=col;g.lineWidth=w;g.lineJoin='round';g.lineCap='round';g.beginPath();let started=false;pts.forEach(p=>{if(!p.every(Number.isFinite)){started=false;return;}if(started)g.lineTo(...p);else g.moveTo(...p);started=true;});g.stroke();g.restore();}
function luminous(pts,col=GOLD,w=3,alpha=1){line(pts,col,w*9,.035*alpha);line(pts,col,w*4,.13*alpha);line(pts,col,w,alpha);line(pts,'#fffaee',Math.max(.6,w*.3),.8*alpha);}
function light(p,r=35,a=1){if(!p.every(Number.isFinite))return;g.save();g.globalCompositeOperation='screen';g.globalAlpha=a;g.drawImage(sprite,p[0]-r,p[1]-r,r*2,r*2);g.restore();}
function text(s,x,y,size=30,col='#e7edf4',align='center'){g.save();g.textAlign=align;g.font=`${size}px JP`;g.fillStyle=col;g.fillText(s,x,y);g.restore();}
function formula(s,y,size=56){text(s,W/2,y,vertical?size*.9:size,'#ffe5ad');}
function equation(kind){const im=equations[kind],h=kind==='parabola'?91:116,scale=h/im.height;g.drawImage(im,(W-im.width*scale)/2,H*.64-h*.8,im.width*scale,h);}
function label(s,p,col=GOLD,dx=0,dy=-20){text(s,p[0]+dx,p[1]+dy,vertical?29:27,col);}
function poly(pts,col,alpha){if(!pts.every(p=>p.every(Number.isFinite)))return;g.save();g.globalAlpha=alpha;g.fillStyle=col;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fill();g.restore();}
function stage(t,near=false){
  const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#052a4b');bg.addColorStop(.5,'#030b18');bg.addColorStop(1,'#29113e');g.fillStyle=bg;g.fillRect(0,0,W,H);
  // Broad colored light fills the space; the graph's reading area stays dark.
  g.save();g.globalCompositeOperation='screen';
  for(const[col,x,y,rx,ry,a]of[
    ['#0785ff',.07+.035*Math.sin(t*.19),.33,W*.68,H*.65,.80],
    ['#9d35ff',.95+.03*Math.cos(t*.17),.39,W*.65,H*.69,.86],
    ['#ffae35',.52+.08*Math.sin(t*.13),.88,W*.61,H*.38,.88]]){
    g.globalAlpha=a*(.91+.09*Math.sin(t*.47));g.drawImage(pools[col],W*x-rx,H*y-ry,rx*2,ry*2);
  }g.restore();
  if(near){const shade=g.createRadialGradient(W*.5,H*.40,H*.13,W*.5,H*.44,H*.55);shade.addColorStop(0,'#02081399');shade.addColorStop(.6,'#02081348');shade.addColorStop(1,'#02081300');g.fillStyle=shade;g.fillRect(0,0,W,H);}
  const yaw=near?.07*Math.sin(t*.24):.85+.28*Math.sin(t*.17),z=vertical?17:15;
  camera.position.set(Math.sin(yaw)*z,near?1:2.7,Math.cos(yaw)*z);camera.lookAt(0,near?.1:.15,0);camera.updateMatrixWorld();
  for(let k=-12;k<=12;k++){line([project(k*2,-4.4,-25),project(k*2,-4.4,9)],'#56c5ff',1.2,.24);line([project(-24,-4.4,k*2),project(24,-4.4,k*2)],'#ffc45d',1.1,.22);}
  for(let r of[3.7,6.2,10]){let p=[];for(let i=0;i<=100;i++)p.push(project(r*Math.cos(i/100*TAU),-4.35,r*Math.sin(i/100*TAU)));luminous(p,GOLD,1.8,.56);}
  // Moving illumination travels along fixed world-space floor paths.
  for(let i=0;i<10;i++){const z=-20+((t*1.7+i*2.6)%25),x=(i-4.5)*2.4;const a=project(x,-4.32,z),b=project(x,-4.32,z-2);luminous([a,b],i%3?GOLD:CYAN,2,.45);light(a,32,.55);}
  // World-space dust and light pillars give depth and camera parallax.
  for(let i=0;i<125;i++){const x=(rnd(i)-.5)*32,zp=-22+rnd(i+400)*29,y=-4+rnd(i+200)*14;const p=project(x,y+Math.sin(t*.3+i)*.08,zp);if(p[0]<0||p[0]>W||p[1]<0||p[1]>H)continue;light(p,3+rnd(i+31)*9,.28+rnd(i)*.38);}
  for(let i=0;i<9;i++){let x=(i-4)*4.6;const foot=project(x,-4.3,-12),top=project(x,6,-12),col=i%2?PURPLE:CYAN;luminous([foot,top],col,2,.18+.05*Math.sin(t*.35+i));light(foot,75,.85);}
}
function cone(t,kind='ellipse',alpha=1){
  // Actual 3D cone surface, not a rotating background texture.
  for(let sign of[-1,1]){
    for(let j=0;j<30;j++){const u=j/30*TAU,u2=(j+1)/30*TAU,r=3.65;poly([project(0,0),project(r*Math.cos(u),sign*r,r*Math.sin(u)),project(r*Math.cos(u2),sign*r,r*Math.sin(u2))],j%3?'#6db4ce':'#ffcb7b',.018*alpha);}
    for(let j=0;j<18;j++){const u=j/18*TAU;line([project(0,0),project(3.65*Math.cos(u),sign*3.65,3.65*Math.sin(u))],j%3?CYAN:GOLD,1,.16*alpha);}
    for(let y of[1,2,3,3.65]){const pts=[];for(let j=0;j<=96;j++)pts.push(project(y*Math.cos(j/96*TAU),sign*y,y*Math.sin(j/96*TAU)));line(pts,CYAN,1,.18*alpha);}
  }
  let plane,pts=[];
  // A single moving cutting plane passes continuously from ellipse through
  // parabola to hyperbola. Reject asymptotic samples instead of joining gaps.
  if(t>=10&&t<20){
    const m=mix(.3,1.65,ease((t-10)/10)),d=.9;
    plane=[[-3,-3*m+d,-3],[3,3*m+d,-3],[3,3*m+d,3],[-3,-3*m+d,3]];
    const pr=plane.map(p=>project(...p));poly(pr,CYAN,.09);line([...pr,pr[0]],CYAN,2,.6);
    let run=[];for(let i=0;i<=600;i++){const u=i/600*TAU,den=1-m*Math.cos(u),y=d/den;if(Math.abs(y)>3.65||!Number.isFinite(y)){luminous(run,GOLD,4);run=[];continue;}run.push(project(y*Math.cos(u),y,y*Math.sin(u)));}luminous(run,GOLD,4);light(project(0,0),35,.7);return;
  }
  if(kind==='ellipse'){const m=.42;plane=[[-3,-3*m+1.45,-3],[3,3*m+1.45,-3],[3,3*m+1.45,3],[-3,-3*m+1.45,3]];for(let i=0;i<=180;i++)pts.push(project(...section(kind,i/180*TAU)));}
  else if(kind==='parabola'){plane=[[-1.5,-.6,-3],[2.7,3.6,-3],[2.7,3.6,3],[-1.5,-.6,3]];for(let i=0;i<=180;i++)pts.push(project(...section(kind,-2.35+i/180*4.7)));}
  else{plane=[[1.15,-3.8,-3.6],[1.15,3.8,-3.6],[1.15,3.8,3.6],[1.15,-3.8,3.6]];}
  const col=kind==='hyperbola'?PURPLE:CYAN,pr=plane.map(p=>project(...p));poly(pr,col,.10*alpha);line([...pr,pr[0]],col,2,.6*alpha);
  if(kind==='hyperbola'){for(let s of[-1,1]){pts=[];for(let i=0;i<=180;i++){let q=section(kind,-3.2+i/180*6.4);q[1]*=s;pts.push(project(...q));}luminous(pts,GOLD,4,alpha);}}
  else luminous(pts,GOLD,4,alpha);
  light(project(0,0),35,.7*alpha);
}
function classroomScene(t,returning=false){
  const q=returning?1-ease((t-85)/4):ease((t-3)/6),scale=1+q*q*5,iw=Math.max(W,H*classroom.width/classroom.height)*scale,ih=iw*classroom.height/classroom.width,cx=W*.56,cy=H*.36;
  g.drawImage(classroom,cx-iw*.56,cy-ih*.36,iw,ih);
  const rx=W*.17*scale,ry=rx*.53,pts=[];for(let j=0;j<=150;j++){let u=j/150*TAU;pts.push([cx+rx*Math.cos(u),cy+ry*Math.sin(u)]);}
  const ink=rx/520;g.drawImage(chalk,cx-640*ink,cy-380*ink,1280*ink,760*ink);
  // The hand-drawn chalk becomes a doorway only as the camera moves in.
  const awaken=returning?q:ease((t-5)/2.8);
  if(awaken>0){luminous(pts,GOLD,3+q*4,awaken*.9);light([cx+rx,cy],60+q*100,.8*awaken);}
  if(!returning&&t>5){g.save();g.globalAlpha=ease((t-5)/5)*.9;for(let i=0;i<110;i++){let u=rnd(i)*TAU,r=.2+((rnd(i+50)+t*.35)%1)*1.6;let x=cx+Math.cos(u)*W*r,y=cy+Math.sin(u)*H*r;line([[x,y],[mix(cx,x,1+.12*q),mix(cy,y,1+.12*q)]],GOLD,1+rnd(i+22)*2,.5);light([x,y],6+rnd(i)*9,.7);}g.restore();}
  if(!returning&&t>7){g.save();g.globalAlpha=ease((t-7)/3);const save=createCanvas(W,H),sc=save.getContext('2d');sc.drawImage(c,0,0);stage(t);cone(t,'ellipse');const st=createCanvas(W,H);st.getContext('2d').drawImage(c,0,0);g.globalAlpha=1;g.drawImage(save,0,0);g.globalAlpha=ease((t-7)/3);g.drawImage(st,0,0);g.restore();}
}
function chart(kind,t,local){
  const areaW=vertical?W*.85:W*.64,areaH=vertical?H*.36:H*.48,ox=W*.5,oy=vertical?H*.44:H*.38,unit=Math.min(areaW/9,areaH/8.5),p=(x,y)=>[ox+x*unit,oy-y*unit];
  const col=kind==='parabola'?CYAN:kind==='ellipse'?GOLD:PURPLE;
  for(let k=-4;k<=4;k++){line([p(k,-3),p(k,3)],'#6693a9',1,.09);line([p(-4,k),p(4,k)],'#6693a9',1,.09);}
  line([p(-4.4,0),p(4.4,0)],'#a7c6d6',1.5,.6);line([p(0,-3.1),p(0,3.1)],'#a7c6d6',1.5,.6);label('x',p(4.35,0),'#bcd0da',15,0);label('y',p(0,3),'#bcd0da',20,0);label('O',p(0,0),'#bcd0da',-17,28);
  const phase=local*.65,rev=ease(local/2.5),pts=[];
  if(kind==='parabola'){
    const flip=local>13?mix(1,-1,ease((local-13)/1.4)):1;
    // Crossfade opposite signs instead of passing through the undefined p=0 case.
    const sign=flip>=0?1:-1,fade=Math.abs(flip),u=2.2*Math.sin(phase),P=parabola(u,sign),F=[sign,0],Q=[-sign,u];
    for(let i=0;i<=150*rev;i++)pts.push(p(...parabola(-3.3+i/150*6.6,sign)));
    luminous(pts,col,3.4,fade);line([p(-sign,-3),p(-sign,3)],GOLD,2,.7);label('準線 x = −p',p(-sign,2.8),GOLD,-95,-18);
    if(local>2){luminous([p(...F),p(...P)],GOLD,2.5);luminous([p(...P),p(...Q)],GOLD,2.5);line([p(Q[0]+.16*sign,Q[1]),p(Q[0]+.16*sign,Q[1]-.16),p(Q[0],Q[1]-.16)],GOLD,1.5);light(p(...F),27);light(p(...P),22);label('F(p, 0)',p(...F),GOLD,30,35);label('P',p(...P));const distance=Math.hypot(P[0]-F[0],P[1]);formula(`PF = 準線までの距離 = ${distance.toFixed(2)}`,vertical?H*.69:H*.72,32);}
    equation(kind);text(local<13?'p > 0：右に開く':'p < 0：左に開く',W/2,vertical?H*.74:H*.79,31,CYAN);
  }else if(kind==='ellipse'){
    const a=local>12?3+.28*Math.sin(local*1.2):3,b=local>14?1.8+.25*Math.sin(local*1.2):1.8,focus=Math.sqrt(a*a-b*b),P=ellipse(phase,a,b),F=[focus,0],F2=[-focus,0];
    for(let i=0;i<=180*rev;i++)pts.push(p(...ellipse(i/180*TAU,a,b)));luminous(pts,col,3.6);
    luminous([p(...F),p(...P)],CYAN,2.5);luminous([p(...F2),p(...P)],GOLD,2.5);light(p(...F),28);light(p(...F2),28);light(p(...P),24);label('F',p(...F),CYAN,0,35);label('F′',p(...F2),GOLD,0,35);label('P',p(...P));
    const d1=Math.hypot(P[0]-focus,P[1]),d2=Math.hypot(P[0]+focus,P[1]);equation(kind);formula(`${d1.toFixed(2)} + ${d2.toFixed(2)} = ${(2*a).toFixed(2)} = 2a`,vertical?H*.69:H*.72,32);
    if(local>7){line([p(0,-2.35),p(a,-2.35)],GOLD,2,.8);label('a：横の半径',p(a/2,-2.35),GOLD,vertical?0:155,35);line([p(-3.6,0),p(-3.6,b)],CYAN,2,.8);label('b',p(-3.6,b/2),CYAN,-23,0);}
    text('焦点：c = √(a² − b²)',W/2,vertical?H*.74:H*.79,29,'#a8bcca');
  }else{
    const a=1.6,b=1,focus=Math.hypot(a,b),u=1.25*Math.sin(phase),P=hyperbola(u,1,a,b),F=[focus,0],F2=[-focus,0];
    for(let s of[-1,1]){let q=[];for(let i=0;i<=150*rev;i++)q.push(p(...hyperbola(-1.65+i/150*3.3,s,a,b)));luminous(q,col,3.3);}
    if(local>9){for(let s of[-1,1]){g.save();g.setLineDash([12,12]);line([p(-4,-4*s*b/a),p(4,4*s*b/a)],GOLD,1.6,.65*ease((local-9)/2));g.restore();}text('漸近線  y = ±(b/a)x',W/2,vertical?H*.74:H*.79,29,GOLD);}
    luminous([p(...F),p(...P)],CYAN,2.5);luminous([p(...F2),p(...P)],GOLD,2.5);light(p(...F),27);light(p(...F2),27);light(p(...P),24);label('F',p(...F),CYAN,0,35);label('F′',p(...F2),GOLD,0,35);label('P',p(...P));
    const d1=Math.hypot(P[0]-focus,P[1]),d2=Math.hypot(P[0]+focus,P[1]);equation(kind);formula(`| ${d1.toFixed(2)} − ${d2.toFixed(2)} | = 3.20 = 2a`,vertical?H*.69:H*.72,32);
    label('−a',p(-a,0),col,0,-17);label('a',p(a,0),col,0,-17);
  }
}
function title(k,name,sub){text(k,W*.075,vertical?H*.14:H*.115,23,GOLD,'left');text(name,W*.075,vertical?H*.19:H*.19,vertical?53:60,'#edf4f6','left');text(sub,W*.075,vertical?H*.23:H*.24,vertical?26:29,'#a7becb','left');}
function summary(t){
  const kinds=['parabola','ellipse','hyperbola'],names=['放物線','楕円','双曲線'],subs=['焦点と準線から等距離','二焦点からの距離の和が一定','距離の差の絶対値が一定'];
  kinds.forEach((kind,j)=>{let cx=vertical?W/2:W*(.2+.3*j),cy=vertical?H*(.30+.19*j):H*.43,s=vertical?53:61,points=[];const pp=(x,y)=>[cx+x*s,cy-y*s];
    if(kind==='parabola'){for(let i=0;i<=100;i++)points.push(pp(...parabola(-2.1+i/100*4.2,1)));luminous(points,CYAN,3);}
    if(kind==='ellipse'){for(let i=0;i<=100;i++)points.push(pp(...ellipse(i/100*TAU,2.1,1.25)));luminous(points,GOLD,3);}
    if(kind==='hyperbola')for(let sign of[-1,1]){let q=[];for(let i=0;i<=100;i++)q.push(pp(...hyperbola(-1.2+i/100*2.4,sign,1,1)));luminous(q,PURPLE,3);}
    text(names[j],cx,cy+(vertical?105:160),vertical?35:42);text(subs[j],cx,cy+(vertical?146:210),vertical?24:25,'#aac3d1');
  });
}
function draw(t){
  g.globalAlpha=1;g.globalCompositeOperation='source-over';g.fillStyle='#02060b';g.fillRect(0,0,W,H);
  if(vertical){
    if(t<4)classroomScene(t*2.5);
    else if(t<22){stage(t,true);const j=t<10?0:t<16?1:2,kind=['parabola','ellipse','hyperbola'][j];title('0'+(j+1),['放物線','楕円','双曲線'][j],['等しい距離','距離の和が一定','距離の差の絶対値が一定'][j]);chart(kind,t,(t-[4,10,16][j])*2.8+2);}
    else if(t<27){stage(t);cone(t,t<24?'ellipse':t<25.5?'parabola':'hyperbola');title('CONIC SECTIONS','切り方で、形が変わる','円錐と平面の交わり');}
    else{stage(t);text('黒板の向こう側',W/2,H*.36,66,'#ffe0a5');text('二次曲線の世界',W/2,H*.43,45);text('90秒の本編へ',W/2,H*.58,33,CYAN);}
  }else{
    if(t<10)classroomScene(t);
    else if(t<20){stage(t);cone(t,t<13.5?'ellipse':t<17?'parabola':'hyperbola');title('THE ORIGIN','切り方で、形が変わる','円錐と平面の交わり');text('円錐面は、この先へ続いている',W/2,H*.79,27,'#aac3d1');}
    else if(t<39){stage(t,true);title('01 / PARABOLA','放物線','一つの点と、一本の直線');chart('parabola',t,t-20);}
    else if(t<58){stage(t,true);title('02 / ELLIPSE','楕円','二つの焦点を、光の糸でつなぐ');chart('ellipse',t,t-39);}
    else if(t<65){stage(t);cone(t,'hyperbola');title('03 / HYPERBOLA','双曲線','上下の円錐を切ると、二つの枝が生まれる');text('切断面を正面から見て、座標の向きをそろえる →',W/2,H*.78,29,'#bfc8dd');}
    else if(t<77){stage(t,true);title('03 / HYPERBOLA','双曲線','二つの距離の「差」に注目');chart('hyperbola',t,t-63);}
    else if(t<85){stage(t);title('THREE CURVES','形の違いには、理由がある','距離の関係から、曲線を読む');summary(t);}
    else{classroomScene(t,true);g.fillStyle='#01050b80';g.fillRect(0,0,W,H);text('黒板の向こう側',W/2,H*.36,83,'#ffe0a5');text('二次曲線の世界',W/2,H*.46,42);text('式と図形を、つなぐ。',W/2,H*.59,32,CYAN);}
  }
  const vignette=g.createRadialGradient(W/2,H*.45,H*.25,W/2,H*.5,H*.9);vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#00081455');g.fillStyle=vignette;g.fillRect(0,0,W,H);
  const fade=t<.6?1-ease(t/.6):t>D-.65?ease((t-D+.65)/.65):0;if(fade){g.fillStyle=`rgba(0,0,0,${fade})`;g.fillRect(0,0,W,H);}
}
if(sample){for(const t of(vertical?[2,7,13,19,24,28]:[3,8,11,15,18,28,36,47,55,61,70,80,87])){draw(t);writeFileSync(`work/conic-cinema/${vertical?'vertical':'wide'}-${t}.jpg`,c.toBuffer('image/jpeg',90));}process.exit(0);}
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(FPS),'-i','pipe:0','-an','-c:v','libx264','-threads','3','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',`work/conic-cinema/${vertical?'short':'long'}-silent.mp4`],{stdio:['pipe','ignore','inherit']});
for(let f=0;f<D*FPS;f++){draw(f/FPS);if(!ff.stdin.write(c.data()))await once(ff.stdin,'drain');if(f%(FPS*5)===0)console.log(`${vertical?'short':'long'} ${f/FPS}/${D}`);}ff.stdin.end();const[code]=await once(ff,'exit');if(code)throw Error('Video encoder failed');draw(vertical?13:47);writeFileSync(root+`${vertical?'short':'long'}-poster.jpg`,c.toBuffer('image/jpeg',92));console.log('DONE');
