import {drawFraction} from './fraction.js';
// Continuous mathematical surfaces, advected fractal clouds and a curved 3D tunnel.
// Decorative geometry is separate from the exact x² graph in the teaching layer.
const TAU=Math.PI*2,rand=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v)},mix=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);
let cloud=[],sprites=new Map();
function noise(x,y){const a=Math.floor(x),b=Math.floor(y),u=smooth(x-a),v=smooth(y-b);return mix(mix(rand(a+b*71),rand(a+1+b*71),u),mix(rand(a+(b+1)*71),rand(a+1+(b+1)*71),u),v)}
function fbm(x,y){let n=0,s=.56;for(let k=0;k<5;k++){n+=s*noise(x,y);x=x*2.07+7.1;y=y*2.03+3.7;s*=.49}return n}
export function configureGeometry({createCanvas}){
 if(!createCanvas||cloud.length)return;
 for(let k=0;k<3;k++){const tex=createCanvas(384,384),g=tex.getContext('2d'),im=g.createImageData(384,384);
  for(let y=0;y<384;y++)for(let x=0;x<384;x++){const nx=x/384*5,ny=y/384*5,a=fbm(nx+k*11,ny+k*7),b=fbm(nx+3.5,ny-4.2),n=fbm(nx+a*3,ny+b*3),edge=Math.max(0,1-((x-192)/192)**2-((y-192)/192)**2),dens=Math.pow(Math.max(0,n-.27)*2.7,1.5)*edge,rim=Math.max(0,fbm(nx+a*3+.045,ny+b*3-.035)-n)*14,i=(y*384+x)*4;im.data[i]=18+rim*85+dens*18;im.data[i+1]=45+rim*115+dens*44;im.data[i+2]=80+rim*125+dens*88;im.data[i+3]=Math.min(245,dens*320)}g.putImageData(im,0,0);cloud.push(tex);
 }
 for(const col of ['#8ce9ff','#ffd58a','#d5efff']){const tex=createCanvas(96,96),c=tex.getContext('2d'),g=c.createRadialGradient(48,48,0,48,48,48);g.addColorStop(0,'#ffffff');g.addColorStop(.04,col);g.addColorStop(.16,col+'9a');g.addColorStop(.45,col+'20');g.addColorStop(1,col+'00');c.fillStyle=g;c.fillRect(0,0,96,96);sprites.set(col,tex)}
}
function flare(c,x,y,r,col,alpha=1){const tex=sprites.get(col);if(!tex)return;c.save();c.globalAlpha=alpha;c.globalCompositeOperation='screen';c.drawImage(tex,x-r,y-r,r*2,r*2);c.restore()}
function path(c,pts,col,width=1,alpha=1,fill=false){c.save();c.globalAlpha=alpha;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));if(fill){c.closePath();c.fillStyle=col;c.fill()}else{c.strokeStyle=col;c.lineWidth=width;c.stroke()}c.restore()}
function projected(t,act){const ay=t*.16+(act===3?.5:0),ax=.46+Math.sin(t*.22)*.23,roll=Math.sin(t*.19)*.16;return(x,y,z)=>{const xx=x*Math.cos(ay)+z*Math.sin(ay),zz=-x*Math.sin(ay)+z*Math.cos(ay),yy=y*Math.cos(ax)-zz*Math.sin(ax),z2=y*Math.sin(ax)+zz*Math.cos(ax),k=950/(z2+1400);return{x:360+(xx*Math.cos(roll)-yy*Math.sin(roll))*k,y:620+(xx*Math.sin(roll)+yy*Math.cos(roll))*k,k}}}
function clouds(c,t,strength=1){
 c.fillStyle='#031020';c.fillRect(0,0,720,1280);c.save();c.globalCompositeOperation='screen';
 for(let j=0;j<13;j++){const x=720*(rand(j+41)*1.3-.15)+Math.sin(t*.11+j)*110,y=1280*(.12+rand(j+8)*.8)+Math.cos(t*.07+j)*100,w=750+rand(j+80)*650,h=650+rand(j+90)*500;c.save();c.translate(x,y);c.rotate(j*.7+Math.sin(t*.06+j)*.25);c.globalAlpha=(.17+rand(j)*.17)*strength;for(let s=0;s<12;s++){const v=s/12,warp=Math.sin(v*5.4+t*.25+j)*20;c.drawImage(cloud[j%3],0,s*32,384,32,-w/2+warp,-h/2+v*h,w,h/12+1)}c.restore()}
 c.restore();
}
function polyhedron(c,t,act,P){
 const phi=(1+Math.sqrt(5))/2,raw=[];for(const a of [-1,1])for(const b of [-phi,phi]){raw.push([0,a,b],[a,b,0],[b,0,a])}
 const radius=act===3?205:320+Math.sin(t*.6)*30,verts=raw.map(([x,y,z])=>[x*radius,y*radius,z*radius]);const pp=verts.map(v=>P(...v));
 const edges=[];for(let a=0;a<12;a++)for(let b=a+1;b<12;b++){const d=verts[a].reduce((s,v,i)=>s+(v-verts[b][i])**2,0);if(d<radius*radius*4.01)edges.push([a,b])}
 for(let a=0;a<12;a++)for(let b=a+1;b<12;b++)for(let d=b+1;d<12;d++){if([[a,b],[a,d],[b,d]].every(([i,j])=>edges.some(([u,v])=>i===u&&j===v)))path(c,[pp[a],pp[b],pp[d]],(a+b)%3?'#84d9ed':'#ffe1a1',1,.065,true)}
 for(const [a,b] of edges){path(c,[pp[a],pp[b]],'#82dfff',6,.06);path(c,[pp[a],pp[b]],a%3?'#b2e9f5':'#ffe2a1',1.5,.48)}pp.forEach((p,j)=>flare(c,p.x,p.y,17,j%3?'#8ce9ff':'#ffd58a',.65));
}
function orbital(c,t,act,P){
 for(let j=0;j<7;j++){const pts=[],r=330+j*15+Math.sin(t*.5+j)*12;
  for(let k=0;k<=160;k++){const a=k/160*TAU+t*(j%2?.09:-.12),b=j*.27+t*.11;
   const x=r*Math.cos(a),y=r*Math.sin(a)*Math.cos(b),z=r*Math.sin(a)*Math.sin(b);pts.push(P(x,y,z))}
  path(c,pts,j%4?'#5cbeda':'#ffd691',j%4?.8:2,j%4?.24:.68);
  const p=pts[Math.floor((t*.16+j*.13)%1*160)];flare(c,p.x,p.y,j%4?16:38,j%4?'#8ce9ff':'#ffd58a',.9);
 }
}
function saddle(c,t,P){
 const surface=(u,v)=>P(u*600,v*380,170*(u*u-v*v)+Math.sin(t*.4+u*3)*35);
 for(let j=0;j<25;j++){const v=(j/24-.5)*2,pts=[];for(let k=0;k<=100;k++)pts.push(surface((k/100-.5)*2,v));path(c,pts,j%5?'#5fc7e6':'#e6c485',j%5?.7:1.7,j%5?.2:.55)}
 for(let j=0;j<30;j++){const u=(j/29-.5)*2,pts=[];for(let k=0;k<=80;k++)pts.push(surface(u,(k/80-.5)*2));path(c,pts,'#78c6df',.7,.18)}
}
function ribbons(c,t,P,act){
 for(let band=0;band<2;band++){
  const line=[];for(let k=0;k<=220;k++){const u=k/220*TAU*1.9,rr=340+90*Math.cos(u*1.5+t*.32+band);line.push(P(Math.cos(u+t*.26)*rr,Math.sin(u+t*.26)*rr*.65,Math.sin(u*1.5+t*.4)*250+band*28))}
  path(c,line,band%2?'#ffce80':'#84cfff',25,.045);path(c,line,band%2?'#ffd78c':'#8bd6f5',5,.28);path(c,line,band%2?'#fff0c5':'#dcf5ff',1.2,.8);
  for(let j=0;j<100;j++){const u=(rand(j+band*200)+t*.035)%1,p=line[Math.floor(u*220)],size=.7+rand(j+70)*1.8;c.fillStyle=band%2?'#ffdf9d':'#b8eaff';c.globalAlpha=.3+rand(j)*.6;c.fillRect(p.x+(rand(j+1)-.5)*15,p.y+(rand(j+2)-.5)*15,size,size)}c.globalAlpha=1;
 }
}
export function lightState(t){
 const start=t<21?13:21,collect=t<21?3:2.5,hold=t<21?1:.7,end=t<21?21:30,u=Math.max(0,t-start);
 if(u<collect)return {density:smooth(Math.min(1,u/collect)),phase:'gather'};
 if(u<collect+hold)return {density:1,phase:'hold'};
 return {density:1-smooth(Math.min(1,(u-collect-hold)/(end-start-collect-hold))),phase:'disperse'};
}
function lightCloud(c,t){
 const {density,phase}=lightState(t),cx=360+Math.sin(t*.15)*25,cy=605+Math.cos(t*.18)*18;
 function point(j,time){const d=lightState(time).density,a=rand(j+6000)*TAU+time*.1+(1-d)*(1.1+rand(j+6300)*1.3),far=300+rand(j+6100)*780,near=5+rand(j+6200)*27,r=far*(1-d)+near*d,z=(rand(j+6400)-.5)*700*(1-d),k=1000/(z+1200);return{x:360+Math.sin(time*.15)*25+Math.cos(a)*r*k,y:605+Math.cos(time*.18)*18+Math.sin(a)*r*k*(.72+rand(j+6500)*.35),k}}
 // Thousands of lights follow continuous curved paths into a shared core and out again.
 for(let j=0;j<2600;j++){
  const p=point(j,t),tail=point(j,Math.max(13,t-.055)),gold=j%4!==0;
  if(p.x< -60||p.x>780||p.y<130||p.y>1180)continue;
  const brightness=.2+rand(j+6600)*.65,size=(.7+rand(j+6700)*1.8)*p.k;
  path(c,[tail,p],gold?'#ffd993':'#8cdfff',size*.7,brightness*.55);
  c.globalAlpha=brightness;c.fillStyle=gold?'#ffe5b0':'#b9eeff';c.fillRect(p.x-size/2,p.y-size/2,size,size);
  if(j%57===0)flare(c,p.x,p.y,(9+rand(j)*20)*p.k,gold?'#ffd58a':'#8ce9ff',brightness*.65);
 }
 c.globalAlpha=1;
 // Expanding curved fronts make the outward phase legible, with no polygon cage.
 if(phase==='disperse')for(let layer=0;layer<4;layer++){
  const spread=1-density,r=35+spread*(420+layer*95),pts=[];
  for(let k=0;k<=160;k++){const a=k/160*TAU,rr=r+Math.sin(a*3+t*.6+layer)*14*spread;pts.push({x:cx+Math.cos(a+t*.06)*rr,y:cy+Math.sin(a+t*.06)*rr*.8})}
  path(c,pts,layer%2?'#91d8ef':'#ffdb94',layer===0?1.8:.7,(1-spread)*.3);
 }
 flare(c,cx,cy,200+density*160,'#ffd58a',.12+density*.3);
 flare(c,cx,cy,26+density*86,'#d5efff',.18+density*.48);
 // A few broad curved beams converge on the same core, then fan out.
 for(let arm=0;arm<7;arm++){
  const a=arm/7*TAU+t*.08,pts=[];
  for(let k=0;k<=80;k++){const u=k/80,r=(30+u*(600*(1-density)+80))*Math.max(.2,1-density*.8),angle=a+u*.6*(1-density);pts.push({x:cx+Math.cos(angle)*r,y:cy+Math.sin(angle)*r*.85})}
  path(c,pts,arm%3?'#ffde9b':'#9adfff',1,(1-density)*.18);
 }
}
export function geometricWorld(c,t,act){
 if(cloud.length)clouds(c,t,act>=2?.65:1);else{c.fillStyle='#071d34';c.fillRect(0,0,720,1280)}
 const P=projected(t,act);c.save();c.globalCompositeOperation='screen';
 if(act>=2)lightCloud(c,t);else{if(act===1)saddle(c,t,P);else{polyhedron(c,t,act,P);orbital(c,t,act,P)}ribbons(c,t,P,act)}
 // Particles live on continuous curved sheets, with a light sweep through the volume.
 for(let j=0;j<(act>=2?0:1650);j++){const u=rand(j+520)*TAU+t*.11,v=rand(j+620)*TAU,r=270+180*Math.sin(v+t*.17),x=Math.cos(u)*r,y=Math.sin(u)*r,z=Math.cos(v+t*.2)*270,p=P(x,y,z);if(p.x<0||p.x>720||p.y<160||p.y>1150)continue;const a=.18+.55*rand(j+110);c.globalAlpha=a;c.fillStyle=j%4?'#88d2e9':'#ffdf9e';const sz=.6+rand(j+71)*1.6;c.fillRect(p.x,p.y,sz,sz);if(j%113===0)flare(c,p.x,p.y,28,j%4?'#8ce9ff':'#ffd58a',.6)}c.globalAlpha=1;
 c.restore();
 // Sparse geometric notation follows broad arcs; no matrix rain or machine-like walls.
 c.save();for(let j=0;j<20;j++){const a=j/20*TAU+t*.08,r=340+Math.sin(j+t*.25)*60;if(640+Math.sin(a)*r*1.4<260||640+Math.sin(a)*r*1.4>1120)continue;c.translate(0,0);c.font=`${16+rand(j)*15}px Georgia`;c.textAlign='center';c.globalAlpha=.15+rand(j)*.16;c.fillStyle=j%3?'#a1d5e6':'#edcb8d';if(j%5===4)drawFraction(c,'1','n',360+Math.cos(a)*r,640+Math.sin(a)*r*1.4,16+rand(j)*15,c.fillStyle);else c.fillText(['∫','Σ','lim','x²'][j%5],360+Math.cos(a)*r,640+Math.sin(a)*r*1.4)}c.restore();
 const v=c.createLinearGradient(0,0,0,1280);v.addColorStop(0,'#020917ec');v.addColorStop(.22,'#02091720');v.addColorStop(.75,'#02091710');v.addColorStop(1,'#020917ed');c.fillStyle=v;c.fillRect(0,0,720,1280);
}
