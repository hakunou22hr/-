// Second edition: an original camera-projected kinetic sculpture, not a corridor.
// Every vertex, light, gear and branch is evaluated directly from absolute time.
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v)},mix=(a,b,t)=>a+(b-a)*t;
const rnd=i=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n)};
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>{const n=Math.hypot(...a);return a.map(v=>v/n)};
const gold='#ffc56a',blue='#5fe5ff',ivory='#fff0cb',mint='#80ffe1';
export function createBackdrop(makeCanvas,W,H){
 const portrait=H>W,glows=new Map();let g,P,q;
 function line(pts,c,w=1,a=1){if(pts.length<2)return;g.save();g.globalAlpha=clamp(a);g.strokeStyle=c;g.lineWidth=w;g.lineJoin='round';g.lineCap='round';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.restore();}
 function light(x,y,r,c,a=1){let tex=glows.get(c);if(!tex){tex=makeCanvas(128,128);const k=tex.getContext('2d'),gr=k.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'#ffffff');gr.addColorStop(.025,c);gr.addColorStop(.15,c+'65');gr.addColorStop(.5,c+'15');gr.addColorStop(1,c+'00');k.fillStyle=gr;k.fillRect(0,0,128,128);glows.set(c,tex);}g.save();g.globalAlpha=clamp(a);g.globalCompositeOperation='screen';g.drawImage(tex,x-r,y-r,r*2,r*2);g.restore();}
 function face(pts,c,a=1,edge=null){g.save();g.globalAlpha=clamp(a);g.fillStyle=c;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();if(edge){g.strokeStyle=edge;g.lineWidth=1;g.stroke();}g.restore();}
 function beam(pts,c,w=2,a=1){line(pts,c,w*12,a*.035);line(pts,c,w*4,a*.12);line(pts,c,w,a);}
 function camera(){
  const t=q.t,s=q.scene,u=q.u;
  // Dolly-in and a genuine look-at orbit create parallax between solid sculptures.
  let eye,target=[0,0,2];
  if(s===0)eye=[Math.sin(t*.16)*2.6,-1.4+Math.cos(t*.13)*.6,mix(-28,-18,ease(u))];
  else if(s===1)eye=[Math.sin(u*1.2)*3,-.7,mix(-18,-15,ease(u))];
  else if(s===2)eye=[-3+Math.sin(t*.10)*2.4,-1.2+Math.sin(u*2)*.7,-18+Math.cos(u*2.6)*2];
  else if(s===3)eye=[3.5*Math.sin(u*2.7),-1.5+Math.cos(u*3)*.8,-18+Math.sin(u*2)*2];
  else eye=[Math.sin(t*.09)*2.4,-1.5,-23+ease(u)*4];
  const forward=unit(sub(target,eye)),right=unit(cross([0,1,0],forward)),up=cross(forward,right),f=portrait?1080:1640;
  P=v=>{const d=sub(v,eye),z=Math.max(1.3,dot(d,forward)),k=f/z;return [W/2+dot(d,right)*k,H*.53+dot(d,up)*k,k,z]};
 }
 function gear(center,r,spin,tilt,teeth=24,alpha=1){
  const ct=Math.cos(tilt),st=Math.sin(tilt),roll=.14*Math.sin(q.t*.12+center[0]);
  const point=(a,rad,z)=>{const x=Math.cos(a+spin)*rad,y=Math.sin(a+spin)*rad;return P(add(center,[x*Math.cos(roll)-y*Math.sin(roll),y*ct+z*st,-y*st+z*ct]));};
  const n=teeth*4,front=[],rear=[];for(let i=0;i<n;i++){const a=i/n*TAU,rad=r*([.91,.91,1,1][i%4]);front.push(point(a,rad,-.6));rear.push(point(a,rad,.6));}
  face(rear,'#382619',alpha);
  for(let i=0;i<n;i++){const j=(i+1)%n;if(front[i][1]>rear[i][1]||front[i][0]<rear[i][0])face([front[i],front[j],rear[j],rear[i]],i%4<2?'#5a3721':'#b68142',alpha*.9);}
  // A solid machined brass face with a recessed bore, spokes and engraved teeth.
  const c=P(center),gr=g.createLinearGradient(c[0]-r*c[2],c[1]-r*c[2],c[0]+r*c[2],c[1]+r*c[2]);gr.addColorStop(0,'#fff1b1');gr.addColorStop(.18,'#bd813b');gr.addColorStop(.42,'#483023');gr.addColorStop(.65,'#d9aa60');gr.addColorStop(1,'#785022');face(front,gr,alpha);
  const bore=[];for(let i=0;i<=80;i++)bore.push(point(i/80*TAU,r*.52,-.34));face(bore,'#0f121b',alpha,gold+'88');
  for(let i=0;i<8;i++){const a=i/8*TAU;const pts=[point(a-.05,r*.22,-.36),point(a-.09,r*.7,-.36),point(a+.09,r*.7,-.36),point(a+.05,r*.22,-.36)];face(pts,'#bd8a47',alpha*.9,'#ffe3a477');}
  const inner=[];for(let i=0;i<=64;i++)inner.push(point(i/64*TAU,r*.21,-.37));face(inner,'#31201b',alpha,'#ffe2a6');
  for(let i=0;i<teeth;i++)line([point(i/teeth*TAU,r*.79,-.35),point(i/teeth*TAU,r*.88,-.35)],ivory,1,alpha*.65);
  // Concentric lathe marks, recessed slots and bolts catch moving specular light.
  for(const radius of [.55,.58,.63,.76,.81,.87,.9]){const track=[];for(let j=0;j<=96;j++)track.push(point(j/96*TAU,r*radius,-.63));line(track,radius>.8?'#fff0bf':'#38261c',radius>.8?.8:1.8,alpha*(radius>.8?.38:.5));}
  for(let j=0;j<teeth;j++){const a=j/teeth*TAU;face([point(a-.014,r*.64,-.65),point(a+.014,r*.64,-.65),point(a+.018,r*.75,-.65),point(a-.018,r*.75,-.65)],'#211b18',alpha*.85);const p=point(a,r*.84,-.66);g.save();g.globalAlpha=alpha*.85;g.fillStyle=j%3?'#6f4c2d':'#ffdf9f';g.beginPath();g.arc(p[0],p[1],Math.max(1,r*p[2]*.009),0,TAU);g.fill();g.restore();}
  for(let j=0;j<4;j++){const a=q.t*(.7+j*.13)+j*1.6,p=point(a,r*.73,-.4);light(p[0],p[1],20+j*4,gold,alpha*.6);}
 }
 function monolith(center,scale,rotation,c,alpha=1){const v=[];for(let i=0;i<8;i++){let x=(i&1?1:-1)*scale[0],y=(i&2?1:-1)*scale[1],z=(i&4?1:-1)*scale[2];const xx=x*Math.cos(rotation)-z*Math.sin(rotation),zz=x*Math.sin(rotation)+z*Math.cos(rotation);v.push(P(add(center,[xx,y,zz])));}const faces=[[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]];faces.sort((a,b)=>b.reduce((s,i)=>s+v[i][3],0)-a.reduce((s,i)=>s+v[i][3],0));for(let i=0;i<faces.length;i++){face(faces[i].map(j=>v[j]),['#16495a','#246078','#46809a','#183c51','#2c6d83','#132b3f'][i],alpha,c+'77');}for(let i=0;i<8;i++)for(const bit of [1,2,4])if((i^bit)>i)beam([v[i],v[i^bit]],c,1.15,alpha*.6);}
 function ribbon(fn,c,width=2,alpha=1,offset=0){const pts=[];for(let i=0;i<=96;i++)pts.push(P(fn(i/96)));beam(pts,c,width,alpha);for(let i=0;i<12;i++){const u=(i/12+q.t*(.12+i*.002)+offset)%1,p=P(fn(u));light(p[0],p[1],Math.min(32,8+p[2]*.14),c,alpha*.85);}}
 function dust(color,amount=160,energy=1){for(let i=0;i<amount;i++){const z=4+((rnd(i+73)*48-q.t*(.8+energy))%48+48)%48;const pos=P([(rnd(i+11)-.5)*42,(rnd(i+19)-.5)*23,z]);if(pos[0]<0||pos[0]>W||pos[1]<0||pos[1]>H)continue;const d=Math.max(.8,Math.min(3,pos[2]*.025));g.globalAlpha=(.25+.55*rnd(i))*energy;g.fillStyle=i%5?color:ivory;g.fillRect(pos[0],pos[1],d,d);if(i%19===0){const prev=P([(rnd(i+11)-.5)*42,(rnd(i+19)-.5)*23,z+.5]);line([prev,pos],color,1,.3*energy);}}g.globalAlpha=1;}
 function machine(alpha=1,small=false){
  const s=small?.65:1;const centers=[[-12,-3,7,7.2,1],[-8,8,12,5.1,-1],[12,3,10,6.2,-1],[10,-8,15,4.4,1],[-2,13,24,7.8,1]];
  for(let i=centers.length-1;i>=0;i--){const [x,y,z,r,d]=centers[i];gear([x*s,y*s,z],r*s,q.t*.14*d+q.u*.8,.72+.28*Math.sin(q.t*.09+i),20+i*2,alpha);}
  // Suspended brass slats form a turning turbine canopy; no walls or tunnel.
  for(let i=0;i<36;i++){const a=i/36*TAU+q.t*.035,rad=17+Math.sin(q.t*.08+i)*.6,center=[Math.cos(a)*rad,Math.sin(a)*rad*.65,20+Math.sin(a*2)*7];const pa=P(center),pb=P(add(center,[Math.cos(a)*2,Math.sin(a)*2,1.8]));beam([pa,pb],gold,3,alpha*.45);}
  for(let j=0;j<3;j++)ribbon(v=>[-16+32*v,7+Math.sin(v*TAU+q.t*.2+j)*1.1,12+j*5+Math.cos(v*TAU)*2],gold,1.5,alpha*.4,j*.13);
 }
 function network(alpha=1){
  // A 3D bifurcation lattice of solid crystal pylons and curved conductive routes.
  for(let tier=4;tier>=0;tier--){const z=9+tier*7;for(const side of [-1,1]){const x=side*(7+tier*1.7),y=(tier%2?1:-1)*(5.5+tier*.5);monolith([x,y,z],[.55,2.1+Math.sin(q.t*.6+tier)*.55,.6],q.t*.13+side*.5,blue,alpha*.85);}}
  for(let i=0;i<12;i++){const sign=i%2?1:-1,z=5+(i%6)*6;const baseY=sign*(7+(i%3)*1.4),bend=2*Math.sin(q.t*.17+i);ribbon(v=>[mix(-17,17,v),baseY+Math.sin(v*Math.PI)*bend,z+Math.sin(v*TAU+q.t*.11)*3],i%3?blue:mint,1.6,alpha*.5,i*.07);}
  for(const side of [-1,1])for(let j=0;j<4;j++)ribbon(v=>[side*(4+v*12),mix(0,(j-1.5)*5,v)+Math.sin(v*Math.PI*2+q.t*.25)*1.4,2+v*30],side<0?gold:blue,2.3,alpha*.78,j*.1);
  for(const side of [-1,1]){const rows=[];for(let i=0;i<=40;i++){const v=i/40,x=side*(6+v*14),y=7+Math.sin(v*5+q.t*.27)*2,z=10+Math.cos(v*4+q.t*.12)*4;rows.push([P([x,y,z]),P([x+side*2,y+3+Math.sin(v*12+q.t*.3),z+5])]);}for(let i=0;i<40;i++){face([rows[i][0],rows[i+1][0],rows[i+1][1],rows[i][1]],i%4<2?'#226b82':'#154a67',alpha*.7);line([rows[i][0],rows[i][1]],blue,1,alpha*.32);}beam(rows.map(r=>r[0]),mint,2,alpha*.65);}
  // At the mathematical cancellation the lattice concentrates into one discharge.
  const impact=Math.exp(-(((q.u-.75)/.055)**2));if(q.scene===3&&impact>.01){for(const side of [-1,1]){const pts=[];for(let i=0;i<=34;i++){const v=i/34;pts.push(P([side*mix(15,0,v),Math.sin(v*33+q.t*4)*(1-v)*1.2,6+Math.sin(v*9)*.4]));}beam(pts,side<0?gold:blue,2.5,impact);}const p=P([0,0,6]);light(p[0],p[1],H*.45,ivory,impact*.75);}
 }
 function sculpture(alpha=1){
  // Broad, shaded metallic ribbons twist in 3D and join into one coherent knot.
  const merge=q.scene>=4?ease(q.u/.58):0;
  for(const side of [-1,1]){const c=side<0?gold:blue;
   for(let band=0;band<3;band++){const verts=[];for(let i=0;i<=120;i++){const v=i/120,a=v*TAU*1.35+q.t*.22+band*.14+side*merge*Math.PI*.5,spread=mix(11,8.2,merge),x=Math.cos(a)*spread+side*(1-merge)*3,y=Math.sin(a)*6.5+Math.sin(v*Math.PI*3+q.t*.2)*1.2,z=5+(v-.5)*15;verts.push({p:P([x,y,z]),edge:P([x+Math.cos(a)*(.7+band*.2),y+Math.sin(a)*(.7+band*.2),z+.25])});}
   for(let i=0;i<120;i++){const a=verts[i],b=verts[i+1],shade=i%12<6?(side<0?'#9d713d':'#13728d'):(side<0?'#d6a454':'#4ab4c5');face([a.p,b.p,b.edge,a.edge],shade,alpha*.72);}
   beam(verts.map(v=>v.p),c,1.8,alpha*.75);for(let i=0;i<18;i++){const v=((i/18+q.t*.09)%1)*120,j=Math.min(119,Math.floor(v)),p=verts[j].p;light(p[0],p[1],18,c,alpha*.7);}}
  }
 }
 function opening(){
  // Monumental cut-glass prisms float over a luminous liquid horizon.
  for(let i=12;i>=0;i--){const side=i%2?1:-1,x=side*(9+(i%4)*2.8),z=5+i*3,y=Math.sin(q.t*.17+i)*2;monolith([x,y,z],[.6,4+(i%3),.8],q.t*.11+side*i*.3,i%2?blue:gold,.75);}
  for(let j=0;j<8;j++)ribbon(v=>[mix(-24,24,v),8+Math.sin(v*TAU+q.t*.18+j*.2)*(1+j*.16),6+j*3],j%2?gold:blue,1.5,.5,j*.08);
  if(q.scene===1){const p=ease(q.u/.8);for(const side of [-1,1])for(let j=0;j<4;j++)ribbon(v=>[side*mix(0,13,v)*p,Math.sin(v*Math.PI)*(-5+j*.8),mix(1,22,v)],side<0?gold:blue,2,.8,j*.1);}
 }
 return {render(ctx,state){g=ctx;q=state;camera();const goldScene=q.scene===2,final=q.scene>=4;
  const gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,goldScene?'#271814':final?'#10172b':'#061728');gr.addColorStop(.5,goldScene?'#15151d':'#07101e');gr.addColorStop(1,goldScene?'#522a1c':final?'#172d40':'#063443');g.fillStyle=gr;g.fillRect(0,0,W,H);
  // Light shafts change their bearings with the camera and physically projected depth.
  for(let j=0;j<5;j++){const a=P([-20+j*10,-15,20]),b=P([Math.sin(q.t*.1+j)*14,15,3]);const grad=g.createLinearGradient(a[0],a[1],b[0],b[1]);grad.addColorStop(0,(goldScene?gold:blue)+'00');grad.addColorStop(.5,(goldScene?gold:blue)+'09');grad.addColorStop(1,(goldScene?gold:blue)+'00');face([[a[0]-30,a[1]],[a[0]+30,a[1]],[b[0]+170,b[1]],[b[0]-170,b[1]]],grad);}
  if(q.scene<2)opening();else if(goldScene)machine();else if(q.scene===3)network();else{sculpture();if(q.scene===4){const a=1-ease(q.u/.6);if(a>.01){machine(a*.25,true);network(a*.25);}}}
  dust(goldScene?gold:blue,170,final?.9:.75);
  // Transformation-linked rim lights; no periodic flashes or repeated video plate.
  const pulse=q.scene===2?Math.exp(-(((q.u-.68)/.08)**2)):q.scene===4?Math.exp(-(((q.u-.56)/.12)**2)):.14+.08*Math.sin(q.t*.7);
  light(W*.08,H*.62,H*.7,gold,.35+pulse*.3);light(W*.94,H*.35,H*.6,blue,.3+pulse*.25);
  const matte=g.createRadialGradient(W/2,H*.46,40,W/2,H*.46,W*(portrait?.5:.4));matte.addColorStop(0,'#03081599');matte.addColorStop(.55,'#03081544');matte.addColorStop(1,'#03081500');g.fillStyle=matte;g.fillRect(0,0,W,H);
 }};
}
