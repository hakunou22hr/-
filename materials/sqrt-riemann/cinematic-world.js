// A mathematical set filmed by a perspective camera. The slabs are the actual right-endpoint rectangles.
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},lerp=(a,b,t)=>a+(b-a)*t;
const rnd=i=>{const a=Math.sin(i*173.17+45.2)*43758.53;return a-Math.floor(a)};
const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{const s=Math.hypot(...a);return a.map(v=>v/s)};
const mix=(a,b,t)=>a.map((v,i)=>lerp(v,b[i],t));
function aura(c,x,y,r,col,alpha=1){c.save();c.globalCompositeOperation='screen';c.globalAlpha=alpha;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col+'8c');g.addColorStop(.18,col+'22');g.addColorStop(1,col+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore()}
export function cinemaCamera(scene,local,t){
 let camera,target=[0,30,0],roll=0,focal=1;
 if(scene===0){const u=smooth(local/10);camera=mix([1100,720,2800],[550,390,1900],u);target=[90,70,0];roll=-.025+u*.025;}
 else if(scene===1){camera=[250+Math.sin(local*.12)*200,300,2400-local*17];target=[0,20,0];}
 else if(scene===2){const u=smooth(local/16);camera=mix([-1100,470,1750],[1150,580,1600],u);target=[lerp(-280,260,u),20,-20];roll=Math.sin(local*.2)*.025;}
 else if(scene===3){
  if(local<5){const a=.15+local*.17;camera=[Math.sin(a)*1900,650+local*30,Math.cos(a)*1900];target=[0,40,0];roll=-.025*local;}
  else if(local<10){const u=(local-5)/5;camera=mix([-720,180,470],[460,460,450],u);target=mix([-50,180,-800],[800,600,-600],u);roll=-.1+u*.16;focal=.83;}
  else{const u=smooth((local-10)/5);camera=mix([1850,1150,900],[550,560,2000],u);target=[80,60,0];roll=.04*(1-u);}
 }
 else if(scene===4){camera=[600*Math.cos(local*.11),550+Math.sin(local*.15)*80,2050];target=[30,0,0];roll=Math.sin(local*.13)*.025;}
 else if(scene===5){camera=[Math.sin(local*.3)*180,130+Math.sin(local*.2)*75,1050];target=[0,50,-1800];roll=Math.sin(local*.25)*.11;focal=.84;}
 else{const u=smooth(local/10);camera=mix([-750,850,2100],[350,480,1900],u);target=[0,0,0];roll=-.02*(1-u);}
 return {camera,target,roll,focal};
}
export function drawCinemaWorld(c,w,h,t,{scene=0,local=t,n=4,portrait=false,backgroundOnly=false,quality=1}={}){
 const {camera,target,roll,focal}=cinemaCamera(scene,local,t),forward=norm(sub(target,camera)),right=norm(cross(forward,[0,1,0])),up=cross(right,forward);
 const f=Math.min(w*.97,h*1.55)*focal,cx=w*(portrait?.50:.53),cy=h*(portrait?.53:.54),cos=Math.cos(roll),sin=Math.sin(roll);
 function project(v){const d=sub(v,camera),z=dot(d,forward);if(z<35)return null;const x=dot(d,right)*f/z,y=-dot(d,up)*f/z;return {x:cx+x*cos-y*sin,y:cy+x*sin+y*cos,z,q:f/z}}
 const graph=(x,y,z=0)=>[-800+x*1600,-330+y*800,z];
 const poly=(vs,fill,stroke,width=1,alpha=1)=>{const ps=vs.map(project);if(ps.some(p=>!p))return;const fog=Math.exp(-ps.reduce((s,p)=>s+p.z,0)/ps.length/8500);c.save();c.globalAlpha=alpha*fog;c.beginPath();ps.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));if(fill){c.closePath();c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}c.restore()};
 const line=(vs,col,width=1,glow=0,alpha=1)=>{c.save();c.globalAlpha=alpha;const ps=vs.map(project);c.beginPath();let start=true;for(const p of ps){if(!p){start=true;continue}if(start){c.moveTo(p.x,p.y);start=false}else c.lineTo(p.x,p.y)}c.strokeStyle=col;c.lineWidth=width;if(glow){c.shadowColor=col;c.shadowBlur=glow}c.stroke();c.restore()};
 c.fillStyle='#01040b';c.fillRect(0,0,w,h);
 // Large pools of indirect light and fog leave negative space around the mathematics.
 const light=project([700,400,-800])||{x:w*.6,y:h*.5};aura(c,light.x,light.y,Math.max(w,h)*.6,'#14394c',.8);aura(c,w*.7,h*.68,Math.min(w,h)*.48,'#755025',.36+.1*Math.sin(t*.4));
 for(let k=-9;k<=9;k++)line([[k*300,-338,1700],[k*300,-338,-6500]],'#29596c',.5,0,.2);
 for(let j=0;j<23;j++){const z=1400-((j*380+t*55)%8800);line([[-3200,-338,z],[3200,-338,z]],'#2a6479',.55,0,.18)}
 // Volumetric light curtains cast by the curve, with a sparse reflective floor.
 for(let j=0;j<9;j++){const x=j/8,top=graph(x,Math.sqrt(x),-60),p=project(top),bottom=project(graph(x,0,-60));if(!p||!bottom)continue;const g=c.createLinearGradient(p.x,p.y,bottom.x,bottom.y);g.addColorStop(0,'#72d7f516');g.addColorStop(1,'#48a5cf00');c.fillStyle=g;c.beginPath();c.moveTo(p.x-12,p.y);c.lineTo(p.x+18,p.y);c.lineTo(bottom.x+80,bottom.y+25);c.lineTo(bottom.x-70,bottom.y+25);c.fill()}
 const corridor=scene===5||backgroundOnly,flight=scene===5?local*900:t*90;
 if(corridor){
  const gate=project([0,40,-5200]);if(gate)aura(c,gate.x,gate.y,Math.min(w,h)*.33,'#af793c',.58);
  for(let j=12;j>=0;j--){const z=-6500+((j*620+flight)%8000),alpha=.06+.15*(1-(z+6500)/8000);line([graph(0,0,z),graph(0,1.12,z),graph(1.1,1.12,z),graph(1.1,0,z)],j%3?'#43afc8':'#d3aa64',1,0,alpha);const curve=Array.from({length:51},(_,i)=>graph(i/50,Math.sqrt(i/50),z));line(curve,'#4cc6df',1.5,0,alpha*1.7);for(let k=1;k<=7;k++){const x=k/7;line([graph(x,0,z),graph(x,Math.sqrt(x),z)],j%3?'#55cfe5':'#e6bd78',.8,0,alpha*.75);}}
 }
 // The far set is a cathedral made of repeated, scaled √x cross-sections.
 // It gives every camera move foreground/midground/background parallax.
 const setReveal=scene===0?smooth((local-1)/4):1;
 for(let j=10;j>=1;j--){
  const z=-750-j*540+(scene===5?(local*260)%540:Math.sin(t*.08)*100),a=.16*Math.exp(-j*.07)*setReveal;
  const arch=x=>{const v=graph(x,Math.sqrt(x),z);return [v[0]*2.8,(v[1]+330)*2.8-330,z]};
  const curve=Array.from({length:65},(_,i)=>arch(i/64));line(curve,j%3?'#46bad7':'#e3b76d',j%3?1.3:2,0,a*2.2);
  for(let k=0;k<=8;k++){const top=arch(k/8);line([[top[0],-330,z],top],j%3?'#326777':'#d5a566',.75,0,a*.9);}
  const left=arch(0),right=arch(1);line([[left[0],-330,z],[right[0],-330,z]],'#9a763f',1,1,a);
  if(j%2===0)for(let k=0;k<8;k++){const p0=arch(k/8),p1=arch((k+1)/8);poly([[p0[0],-330,z],p0,p1,[p1[0],-330,z]],'#91672f',null,1,a*.18);}
 }
 // Cyan rails on the floor converge on the mathematical vanishing point.
 for(const x of [-2250,-2200,2200,2250])line([[x,-331,1000],[x,-331,-9000]],'#4db7d7',1,0,.2*setReveal);
 const reveal=scene===0?smooth(local/5):1,fillStrength=scene===0?smooth((local-3)/4):scene===5?smooth((local-3)/6):.7;
 if(!backgroundOnly){
  const points=[graph(0,0),...Array.from({length:101},(_,i)=>graph(i/100,Math.sqrt(i/100))),graph(1,0)];
  poly(points,'#d6a34b',null,1,fillStrength*(scene===6?.45:.18));
  const showBars=scene>=2&&scene<=5,barAlpha=scene===5?1-smooth((local-3)/6):1;
  if(showBars&&barAlpha>.01){
   let order=Array.from({length:n},(_,i)=>i+1);order.sort((a,b)=>{const aa=project(graph(a/n,0)),bb=project(graph(b/n,0));return (bb?.z||0)-(aa?.z||0)});
   for(const k of order){const x=(k-1)/n,xx=k/n,rise=scene===2?smooth((local-(k-1)*1.3)/1.5):1,y=Math.sqrt(xx)*rise,depth=scene===3?110:155,hi=k===1+Math.floor(local*.7)%n;
    const a=graph(x,0,0),b=graph(xx,0,0),d=graph(x,y,0),e=graph(xx,y,0),dz=graph(x,y,-depth),ez=graph(xx,y,-depth),bz=graph(xx,0,-depth);
    poly([b,e,ez,bz],'#3e2914','#896b36',.7,barAlpha*.9);poly([d,e,ez,dz],hi?'#ffe2a0':'#bc9351','#ffe5ae',.8,barAlpha*.8);poly([a,b,e,d],hi?'#a77b36':'#62451d','#f2c16f',n>70?.55:1.05,barAlpha*.58);
    if(n<33){const mirror=v=>[v[0],-676-v[1],v[2]];poly([a,b,e,d].map(mirror),'#c5974b',null,1,.055*barAlpha);}
    if(hi&&n<12){line([d,e],'#fff0b6',2,0,barAlpha);const q=project(e);if(q)aura(c,q.x,q.y,28,'#edbf6f',.55);}
   }
  }
  // Curve and its reflection are traced in world space; camera orbit gives real parallax.
  const curve=Array.from({length:151},(_,i)=>{const x=i/150*reveal;return graph(x,Math.sqrt(x),8)});
  line(curve,'#148fc2',12,0,.5);line(curve,'#50e8ff',3.6,7);line(curve,'#deffff',.95,0,.9);
  line(curve.map(v=>[v[0],-676-v[1],v[2]]),'#45accc',2,0,.13);
  line([graph(0,1.14),graph(0,0),graph(1.13,0)],'#b2e4f0',1,0,.72);
  if(scene!==3&&scene!==5){
   c.font=`${portrait?16:15}px "Noto Sans CJK JP",sans-serif`;c.textAlign='center';c.fillStyle='#aacbd7';for(const [s,x,y] of [['0',-.025,-.06],['1',1,-.06],['x',1.12,-.04]]){const p=project(graph(x,y));if(p)c.fillText(s,p.x,p.y)}
   const p=project(graph(.73,1.12));if(p){c.font=`${portrait?23:24}px Georgia`;c.fillStyle='#9fefff';c.fillText('y = √x',p.x,p.y)}
  }
  const tip=project(curve[curve.length-1]);if(tip){aura(c,tip.x,tip.y,Math.min(w,h)*.14,'#38b9dc',.5);c.save();c.globalCompositeOperation='screen';const g=c.createLinearGradient(tip.x-w*.25,0,tip.x+w*.25,0);g.addColorStop(0,'#63b9ee00');g.addColorStop(.5,'#95dcff55');g.addColorStop(1,'#63b9ee00');c.fillStyle=g;c.fillRect(tip.x-w*.25,tip.y-1,w*.5,2);c.restore()}
 }
 // Near-field bokeh and streaks make depth visible without filling the frame with symbols.
 for(let j=0;j<Math.round(230*quality);j++){
  const z=900-((rnd(j+10)*7500+flight*(scene===3?1.9:.45))%7500),p=project([(rnd(j+200)-.5)*6500,(rnd(j+500)-.5)*3600,z]);if(!p||p.x<0||p.x>w||p.y<0||p.y>h)continue;
  const gold=j%5===0,alpha=.15+rnd(j+99)*.48;c.save();c.globalAlpha=alpha;c.fillStyle=gold?'#f7d69d':'#89d9f4';const size=Math.min(5,Math.max(.5,p.q*(.4+rnd(j)*1.2)));
  if(p.z<800&&j%7===0){aura(c,p.x,p.y,size*5,gold?'#e0ab5e':'#65aac9',.5)}else{c.beginPath();c.arc(p.x,p.y,size,0,Math.PI*2);c.fill();}
  if(scene===3||scene===5){const q=project([(rnd(j+200)-.5)*6500,(rnd(j+500)-.5)*3600,z+100]);if(q){c.strokeStyle=gold?'#e4ba70':'#78d5ed';c.lineWidth=.8;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke()}}c.restore();
 }
 const tokens=['lim','Σ','∫','√x','n → ∞'];for(let j=0;j<12;j++){const z=-4500+((j*430+flight*.5)%5500),p=project([(rnd(j+180)-.5)*3600,(rnd(j+900)-.5)*1800,z]);if(!p)continue;c.save();c.globalAlpha=.08;c.font=`${Math.min(48,18*p.q+8)}px Georgia`;c.fillStyle=j%3?'#89c6d6':'#dfb975';c.fillText(tokens[j%5],p.x,p.y);c.restore()}
 const vignette=c.createRadialGradient(w*.53,h*.52,Math.min(w,h)*.16,w*.5,h*.5,Math.max(w,h)*.7);vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#00030dc8');c.fillStyle=vignette;c.fillRect(0,0,w,h);
 return {project,graph};
}
