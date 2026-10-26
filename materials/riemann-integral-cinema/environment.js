// Every surface below is projected from spatial coordinates on the master clock.
// No background image, video texture, or independently running animation is used.
import {smooth,lerp} from './math.js';
const TAU=Math.PI*2,fract=x=>x-Math.floor(x),noise=i=>fract(Math.sin(i*173.17+39.29)*9182.47);
export function path(ctx,pts,closed=false){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));if(closed)ctx.closePath()}
function beginLights(ctx){ctx._lights=new Map()}
function endLights(ctx){const batch=ctx._lights;ctx._lights=null;if(!batch)return;ctx.save();ctx.globalCompositeOperation='screen';for(const item of batch.values()){ctx.beginPath();for(const [a,b] of item.segments){ctx.moveTo(...a);ctx.lineTo(...b)}ctx.strokeStyle=item.color;for(const [m,a] of [[21,.07],[10,.16],[4,.48],[1.7,.95]]){ctx.globalAlpha=item.alpha*a;ctx.lineWidth=item.width*m;ctx.stroke()}ctx.strokeStyle='#fff8df';ctx.globalAlpha=item.alpha*.65;ctx.lineWidth=Math.max(.65,item.width*.28);ctx.stroke()}ctx.restore()}
export function glow(ctx,pts,color,width=1,alpha=1,closed=false){if(ctx._lights&&pts.length===2&&!closed){const w=Math.max(.45,Math.round(width*2)/2),a=Math.max(.05,Math.round(alpha*10)/10),key=color+':'+w+':'+a;let item=ctx._lights.get(key);if(!item){item={color,width:w,alpha:a,segments:[]};ctx._lights.set(key,item)}item.segments.push(pts);return}ctx.save();ctx.globalCompositeOperation='screen';path(ctx,pts,closed);ctx.strokeStyle=color;for(const [mult,a] of [[27,.055],[13,.13],[5,.42],[1.8,.95]]){ctx.globalAlpha=alpha*a;ctx.lineWidth=width*mult;ctx.stroke()}ctx.strokeStyle='#fff7dd';ctx.globalAlpha=alpha*.65;ctx.lineWidth=Math.max(.65,width*.28);ctx.stroke();ctx.restore()}
export function flare(ctx,x,y,r,color,alpha=1){if(!Number.isFinite(x+y+r)||r<.1)return;ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#ffffff');g.addColorStop(.025,'#fff7e5');g.addColorStop(.085,color);g.addColorStop(.25,color+'a0');g.addColorStop(.6,color+'30');g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore()}
function metal(ctx,pts,color,edge='#276d86'){path(ctx,pts,true);const g=ctx.createLinearGradient(pts[0][0],pts[0][1],pts[2][0]+.01,pts[2][1]+.01);g.addColorStop(0,color);g.addColorStop(.35,color);g.addColorStop(.49,color==='#c16d10'?'#fff0a2':color==='#194c79'?'#42eaff':color);g.addColorStop(.65,color);g.addColorStop(1,color);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=.8;ctx.stroke()}
export function chamber(ctx,W,H,s,P){
 beginLights(ctx);const t=s.time,K=W/(s.portrait?1080:1920),pulse=(1-s.splitT)*(s.n>4?1:0),gold='#ffb900',blue='#00bcff';
 ctx.save();const atm=ctx.createRadialGradient(W*.48,H*.40,0,W*.5,H*.45,W*.8);atm.addColorStop(0,'#073b67');atm.addColorStop(.45,'#06132c');atm.addColorStop(1,'#130717');ctx.fillStyle=atm;ctx.fillRect(0,0,W,H);
 // Faceted walls, electrical circuits, and windows at real, separate depths.
 for(let z=42;z>=2;z-=2){
  for(const side of [-1,1]){const x=side*7.5,warp=.18*Math.sin(t*.35+z*.3+s.split),y0=-3.2,y1=5.5;
   const quad=[P(x,y0,z),P(x,y1,z),P(x+side*warp,y1,z+1.8),P(x+side*warp,y0,z+1.8)];metal(ctx,quad,z%4===0?'#611b10':'#073d63',z%4===0?'#ff5c14':'#00a8ff');
   for(let j=0;j<5;j++){const y=y0+(y1-y0)*j/5,pts=[P(x,y,z+.15),P(x,y+.65,z+.15),P(x,y+.65,z+1.4)];glow(ctx,pts,j%3===0?'#ff3c0a':j%3===1?gold:blue,Math.max(.8,K*1.8),.5+.35*noise(j+z)+(pulse*.25));}
   const q=P(x,.6+2.2*Math.sin(z),z+.5),r=K*Math.max(3,18/(1+z*.12));ctx.fillStyle=z%4===0?'#e5af45':'#238bab';ctx.globalAlpha=.25;ctx.fillRect(q[0]-r*.5,q[1],r,r*.18);ctx.globalAlpha=1;
  }
 }
 // A subdivision wall and floor connected to EXACTLY the same n as the graph.
 ctx.save();ctx.globalCompositeOperation='screen';ctx.beginPath();for(let i=0;i<=s.n;i++){const x=-9+18*i/s.n,back=P(x,-3.15,42),front=P(x,-3.15,0);ctx.moveTo(...back);ctx.lineTo(...front);const a=P(x,-3.15,15),b=P(x,5.7,15);ctx.moveTo(...a);ctx.lineTo(...b)}ctx.strokeStyle=blue;ctx.globalAlpha=Math.min(.55,2.2/Math.sqrt(s.n))+.15*pulse;ctx.lineWidth=K*(.65+.7*pulse);ctx.stroke();ctx.restore();
 for(let j=0;j<33;j++){const z=fract(j/33+t*.018)*43;glow(ctx,[P(-9,-3.15,z),P(9,-3.15,z)],j%3===0?'#ff4c0a':j%3===1?gold:blue,K*(j%3===0?2.2:1.2),j%3===0?.7:.45)}
 // Broad alloy rings. Solid bevel surfaces and segmented light channels.
 for(let ring=4;ring>=0;ring--){const z=4+ring*5,rotation=.05*Math.sin(t*.11+ring)+ring*.06,R=7.5+ring*.3;
  const poly=(r,d)=>Array.from({length:8},(_,j)=>{const a=j/8*TAU+Math.PI/8+rotation;return P(Math.cos(a)*r,Math.sin(a)*r*.64,d)}),out=poly(R,z),inside=poly(R-.25,z),back=poly(R,z+.32);
  for(let j=0;j<8;j++){const k=(j+1)%8;metal(ctx,[out[j],out[k],inside[k],inside[j]],j%3===0?'#c16d10':j%3===1?'#7e1409':'#194c79',j%3===0?'#ffc928':j%3===1?'#ff4912':'#00cfff');metal(ctx,[out[j],out[k],back[k],back[j]],'#04111e','#133548');if((j+ring)%3===0)glow(ctx,[inside[j],inside[k]],gold,K*(ring?3.2:5.2),1);else glow(ctx,[inside[j],inside[k]],(j%2?'#ff410e':blue),K*(ring?2.1:3.5),.95);
   for(let chip=0;chip<7;chip++){const q=(chip+.5)/7,A=[lerp(out[j][0],out[k][0],q),lerp(out[j][1],out[k][1],q)],B=[lerp(inside[j][0],inside[k][0],q),lerp(inside[j][1],inside[k][1],q)];glow(ctx,[A,B],chip%4?blue:gold,K*.7,.4)}
  }
 }
 // Backlit plinth and layered luminous coordinate stage.
 for(let r=0;r<4;r++){const pts=[];for(let j=0;j<=96;j++){const a=j/96*TAU+t*.025*(r%2?1:-1);pts.push(P(Math.cos(a)*(5.5+r*.3),-2.5-r*.12,Math.sin(a)*(2.1+r*.2)+.8))}glow(ctx,pts,r%2?'#ff390d':gold,K*(r?2:3.5),r?.65:1)}
 for(let side of [-1,1]){const pts=[P(side*6.5,-3.1,-.8),P(side*6.5,4.5,-.8),P(side*6.5,4.5,8)];glow(ctx,pts,blue,K*2,.85);const p=P(side*6.5,-2.5,0);flare(ctx,...p,80*K,blue,.45)}
 // Spatial annotations are attached to the walls and vary with camera parallax.
 const symbols=['∫ f(x) dx','Σ f(xₖ)Δx','n → ∞','Δx = (b−a)/n','y = f(x)','lim Sₙ'];
 for(let i=0;i<36;i++){const side=i%2?-1:1,z=3+noise(i+50)*35,y=-2+noise(i+70)*7,x=side*(5.7+noise(i+90)*1.8),q=P(x,y,z),size=K*(9+15/(1+z*.12));ctx.save();ctx.translate(...q);ctx.rotate(side*-.07);ctx.font=`${size}px "DejaVu Sans",sans-serif`;ctx.fillStyle=i%5===0?'#b0aa68':'#3c91af';ctx.globalAlpha=.2+.25*noise(i+2);ctx.fillText(symbols[i%6],0,0);ctx.restore()}
 // Moving pulses physically traverse the rails and react to subdivision events.
 for(let i=0;i<210;i++){const z=fract(noise(i+120)+t*(.012+.012*noise(i+11)))*45,x=(noise(i+1)-.5)*19,y=(noise(i+2)-.5)*12,p=P(x,y,z),size=K*(.5+1.8/(1+z*.08));ctx.fillStyle=i%7===0?gold:blue;ctx.globalAlpha=.3+.6*noise(i+3);ctx.fillRect(p[0],p[1],size,size);if(i%35===0)flare(ctx,...p,28*K/(1+z*.05),i%2?blue:gold,.28)}ctx.globalAlpha=1;
 const wave=fract(t*.23);for(const side of [-1,1]){const a=P(side*7.5,-1.8,2+wave*30),b=P(side*7.5,-1.8,3.5+wave*30);glow(ctx,[a,b],gold,K*2.4,.9)}
 flare(ctx,W*.17,H*.43,Math.min(W,H)*.6,'#ff430b',.42);flare(ctx,W*.84,H*.28,Math.min(W,H)*.52,'#ffbc00',.42);flare(ctx,W*.48,H*.48,Math.min(W,H)*.52,blue,.12);endLights(ctx);ctx.restore();
}
export function corridor(ctx,W,H,s){
 beginLights(ctx);const t=s.time,start=s.portrait?12:72,p=smooth((t-start)/(s.portrait?8:17)),K=W/(s.portrait?1080:1920),v=[W*(.5+.025*Math.sin(t*.45)),H*(s.portrait?.45:.44)],unit=Math.min(W,H)*.17,travel=(t-start)*(8+9*p),roll=.07*Math.sin(t*.23),N=34;
 ctx.save();const wash=ctx.createRadialGradient(...v,0,...v,Math.max(W,H)*.75);wash.addColorStop(0,'#164478');wash.addColorStop(.25,'#172130');wash.addColorStop(.7,'#2c0e08');wash.addColorStop(1,'#08020c');ctx.fillStyle=wash;ctx.fillRect(0,0,W,H);
 const P=(a,r,z)=>{const scale=10/(z+2.6),twist=.09*Math.sin(z*.12+t*.16)+roll;return [v[0]+Math.cos(a+twist)*r*unit*scale,v[1]+Math.sin(a+twist)*r*unit*scale]};
 const rings=Array.from({length:N},(_,i)=>({z:.4+fract((i*6.0-travel)/(N*6.0))*N*6.0,id:i})).sort((a,b)=>b.z-a.z);
 for(const {z,id} of rings){const alpha=Math.min(1,.2+14/(z+4)),radius=6.3,outer=[],inner=[],rear=[];for(let j=0;j<6;j++){const a=j/6*TAU+Math.PI/6;outer.push(P(a,radius,z));inner.push(P(a,radius-.58,z));rear.push(P(a,radius,z+.65))}
  ctx.globalAlpha=alpha;for(let j=0;j<6;j++){const k=(j+1)%6;metal(ctx,[outer[j],outer[k],rear[k],rear[j]],j%2?'#681c0c':'#bc5d0b',j%2?'#ff3f10':'#ffbd16');metal(ctx,[outer[j],outer[k],inner[k],inner[j]],j%3===0?'#194c79':'#c16d10',j%3===0?'#00ceff':'#ffd732');glow(ctx,[inner[j],inner[k]],(id+j)%4===0?'#00c7ff':(id+j)%4===1?'#ff3b05':'#ffc400',K*Math.max(1.5,42/(z+4)),Math.min(1,alpha*1.5));
   // Dense lit circuit tiles embedded in each structural face.
   const tiles=8+Math.floor(p*16);for(let chip=0;chip<tiles;chip++){const q=(chip+.3)/tiles,A=[lerp(outer[j][0],outer[k][0],q),lerp(outer[j][1],outer[k][1],q)],B=[lerp(inner[j][0],inner[k][0],q),lerp(inner[j][1],inner[k][1],q)];glow(ctx,[A,B],chip%3===0?'#ff4808':chip%3===1?'#fff39e':'#00cfff',K*Math.max(.6,4/(z+4)),alpha*.55)}
   if(z<32&&(j+id)%2===0){const q=inner[j];flare(ctx,...q,Math.min(230,1200/(z+1))*K,j%3===0?'#00d9ff':j%3===1?'#ff4005':'#ffd000',Math.min(1,alpha*1.2))}
   const a=j/6*TAU+Math.PI/6;glow(ctx,[P(a,radius-.1,z),P(a,radius-.1,z+2)],j%2?'#ff4408':'#ffcf00',K*Math.max(2.2,28/(z+4)),alpha);
  }
 }
 ctx.globalAlpha=1;for(let rail=0;rail<12;rail++){const a=rail/12*TAU+Math.PI/6,pts=[];for(let z=2;z<=200;z+=2)pts.push(P(a,6.18,z));glow(ctx,pts,rail%4===0?'#00d7ff':rail%4===1?'#ff3a06':'#ffd31a',K*(rail%4===0?2.5:6),1);if(rail%3===0){const q=P(a,6.18,8+fract(t*.15+rail*.14)*14);flare(ctx,...q,200*K,'#ffb600',1)}}for(let i=0;i<150;i++){const a=noise(i+700)*TAU,z=.2+fract(noise(i+800)-travel*.024)*63,r=5.7+noise(i+810)*.6,A=P(a,r,z),B=P(a,r,z+1.4+2.7*p);glow(ctx,[A,B],i%3===0?'#ff3a05':i%3===1?'#ffdb36':'#00cfff',K*(.5+3/(z+3)),.35)}
 flare(ctx,...v,Math.min(W,H)*.31,'#36ddff',.23);flare(ctx,W*.16,H*.19,Math.min(W,H)*.30,'#ffcc63',.14);endLights(ctx);ctx.restore();
}
export function equationEnergy(ctx,W,H,s,rectPoint,targets){
 if(!targets?.sigma?.length||s.formation<=0||s.crystal>=1)return;
 const f=s.formation,local=s.time-(s.portrait?20:89),assembly=smooth(local/(s.portrait?1.3:3.4)),K=W/(s.portrait?1080:1920),morph=smooth((local-(s.portrait?1.8:5))/(s.portrait?2.5:7)),N=Math.min(2400,targets.sigma.length),A=targets.sigma,B=targets.integral;
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let i=0;i<N;i++){const r=s.data.rectangles[i%s.n],origin=rectPoint(r.right,r.height),a=A[Math.floor(i*A.length/N)],b=B[Math.floor(i*B.length/N)],target=[lerp(a[0],b[0],morph),lerp(a[1],b[1],morph)],arrive=smooth(assembly*1.45-noise(i+91)*.4),arc=Math.sin(arrive*Math.PI),spin=tPhase(i,s.time),x=lerp(origin[0],target[0],arrive)+Math.cos(spin)*arc*W*.12,y=lerp(origin[1],target[1],arrive)+Math.sin(spin)*arc*H*.18;
  ctx.globalAlpha=(1-s.crystal)*(.3+.6*arrive);ctx.fillStyle=i%8===0?'#00d5ff':i%8===1?'#ff4a0c':'#fff1a0';const size=K*(i%13===0?3.7:1.6);ctx.fillRect(x,y,size,size);if(i%90===0)flare(ctx,x,y,28*K,'#ffcf6b',.35*(1-s.crystal));
 }
 // Streams and filaments attach the graph to the newly assembled glyph.
 for(let band=0;band<7;band++){const pts=[];for(let i=0;i<=100;i++){const q=i/100,x=W*(.13+.73*q),wave=Math.sin(q*9+band*.45+s.time*1.3),y=H*(s.portrait?.44:.43)+wave*H*.045*Math.sin(q*Math.PI)+Math.sin(q*TAU+band)*H*.07;pts.push([x,y])}glow(ctx,pts,band%2?'#2cbfff':'#ffe2a5',K*(band?1:2.4),.18*Math.sin(f*Math.PI)*(1-s.crystal));}
 ctx.restore();
}
function tPhase(i,t){return i*2.39996+t*.6}
export function fusionSpace(ctx,W,H,s){
 const t=s.time,K=W/(s.portrait?1080:1920),cx=W*.5,cy=H*(s.portrait?.44:.43),gold='#ffc400',cyan='#00cdff';
 ctx.save();const sky=ctx.createRadialGradient(cx,cy,0,cx,cy,W*.65);sky.addColorStop(0,'#38210e');sky.addColorStop(.3,'#112c53');sky.addColorStop(1,'#12031c');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 // Deformed coordinate sheets occupy different 3D depths, following the energy wave.
 const P=(x,y,z)=>{const d=12/(z+12),a=.1*Math.sin(t*.16);return [cx+(x*Math.cos(a)+z*Math.sin(a))*W*.072*d,cy-y*W*.072*d]};
 for(let sheet=5;sheet>=0;sheet--){const z=sheet*4+3;for(let j=-7;j<=7;j++){const pts=[];for(let i=0;i<=50;i++){const x=-11+22*i/50,y=j*.72+.55*Math.sin(x*.37+t*.8+sheet)*Math.exp(-j*j*.025);pts.push(P(x,y,z))}glow(ctx,pts,sheet%3===0?gold:'#2885bc',K*.65,.1+.06*Math.sin(j+t*.3))}}
 const glyphs=['∫','Σ','f(x)','Δx','n → ∞','a + kΔx','Sₙ','lim','∫₀¹','dx'];for(let i=0;i<110;i++){const z=1+noise(i+1200)*37,x=(noise(i+1300)-.5)*31,y=(noise(i+1400)-.5)*16+.25*Math.sin(t*.5+i),p=P(x,y,z);ctx.save();ctx.translate(...p);ctx.rotate((noise(i+1500)-.5)*.3);const size=K*(9+48/(1+z*.25));ctx.font=`${size}px "DejaVu Sans",sans-serif`;ctx.fillStyle=i%4?'#4cb6e6':'#ffd48b';ctx.globalAlpha=.12+.3*noise(i+130);ctx.fillText(glyphs[i%glyphs.length],0,0);ctx.restore()}
 // Braided light ribbons wrap THROUGH the mathematical formation volume.
 for(let strand=0;strand<14;strand++){const pts=[];for(let i=0;i<=140;i++){const q=i/140,a=q*TAU*1.55+t*.7+strand*.19,x=(q-.5)*17,y=Math.sin(a)*(1.1+.1*strand),z=3+Math.cos(a)*2.3;pts.push(P(x,y,z))}glow(ctx,pts,strand%4===0?cyan:strand%4===1?'#ff3b06':gold,K*(strand%4===0?3:2.5),.8)}
 for(let i=0;i<4200;i++){const q=fract(noise(i+1700)+t*.045),a=q*TAU*1.55+t*.7+(noise(i+1900)-.5)*1.5,x=(q-.5)*17,y=Math.sin(a)*(1.15+noise(i+2000)*.7),z=3+Math.cos(a)*2.3,p=P(x,y,z),size=K*(.6+noise(i+2100)*2.3);ctx.fillStyle=i%5===0?cyan:i%5===1?'#ff4208':i%5===2?'#fff4b5':gold;ctx.globalAlpha=.3+.7*noise(i+2300);ctx.fillRect(p[0],p[1],size,size);if(i%180===0)flare(ctx,...p,35*K,i%2?gold:cyan,.4)}ctx.globalAlpha=1;
 flare(ctx,cx-W*.15,cy-H*.03,Math.min(W,H)*.38,'#ff9700',.65);flare(ctx,cx+W*.12,cy+H*.02,Math.min(W,H)*.3,cyan,.18);ctx.restore();
}
