/** Video-only renderer. Perspective projection, deterministic particles and area choreography.
 * The interactive lesson continues to use visual.js without modification.
 */
import {byId} from '../model.js';
const TAU=Math.PI*2;
const C={cyan:'#57dfff',gold:'#ffcf72',orange:'#ff795b',white:'#edfaff',ink:'#02050c'};
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const fract=x=>x-Math.floor(x);
const noise=i=>fract(Math.sin(i*127.13+19.7)*43758.5453);
let resources={math:{},sprites:{}};
export function configureCinema({math,createCanvas}){
  const sprites={};
  for(const [name,col] of Object.entries(C)){
    if(name==='ink')continue;
    const c=createCanvas(128,128),ctx=c.getContext('2d');
    const g=ctx.createRadialGradient(64,64,0,64,64,64);
    g.addColorStop(0,'#ffffff');g.addColorStop(.08,col);g.addColorStop(.25,col+'88');g.addColorStop(.6,col+'20');g.addColorStop(1,col+'00');
    ctx.fillStyle=g;ctx.fillRect(0,0,128,128);sprites[name]=c;
  }
  resources={math,sprites};
}
function type(c,str,x,y,size=26,color=C.white,align='left'){
  c.font=`${size}px "Noto Sans CJK JP", sans-serif`;c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';c.fillText(str,x,y);
}
function glow(c,p,r,color='cyan',alpha=1){
  if(!Number.isFinite(p.x+p.y+r)||r<=0)return;
  c.save();c.globalAlpha=clamp(alpha);c.globalCompositeOperation='lighter';
  c.drawImage(resources.sprites[color],p.x-r,p.y-r,r*2,r*2);c.restore();
}
function stroke(c,points,color,width=1,alpha=1,closed=false,halo=false){
  if(points.length<2)return;c.save();c.lineJoin='round';c.lineCap='round';c.strokeStyle=color;
  const path=()=>{c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));if(closed)c.closePath()};
  if(halo){c.globalAlpha=alpha*.06;c.lineWidth=width*7;path();c.stroke();c.globalAlpha=alpha*.18;c.lineWidth=width*3;path();c.stroke();}
  c.globalAlpha=alpha;c.lineWidth=width;path();c.stroke();c.restore();
}
function polygon(c,points,color,alpha=.25){
  c.save();c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fill();c.restore();
}
function projectCamera({w,h,t,portrait,local,kind,intro=false}){
  const opening=1-smooth(local/(intro?8:2.8));
  const yaw=(intro?-.5+smooth(local/9)*.8:.12*Math.sin(t*.23))+opening*(intro?0:.4);
  const pitch=(intro?.28:.13)+.045*Math.sin(t*.16)+opening*.12;
  const zoom=(portrait?.96:1.02)*(intro?.87+smooth(local/9)*.17:1+opening*.045);
  const cx=w*.5+Math.sin(t*.12)*(portrait?8:15);
  const cy=(portrait?(kind==='even'?742:662):(kind==='even'?414:365))+(intro?Math.sin(t*.22)*18:0);
  const sy=Math.sin(yaw),co=Math.cos(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch);
  return (x,y,z=0)=>{const xx=co*x+sy*z,zz=-sy*x+co*z,yy=cp*y-sp*zz,depth=sp*y+cp*zz;
    const scale=1100/(1150+depth)*zoom;return {x:cx+xx*scale,y:cy-yy*scale,k:scale,z:depth};};
}
function room(c,w,h,t,P,intro,portrait){
  c.fillStyle=C.ink;c.fillRect(0,0,w,h);
  const neb=c.createRadialGradient(w*.49,h*.47,10,w*.5,h*.5,w*.67);
  neb.addColorStop(0,'#11283c');neb.addColorStop(.42,'#051220');neb.addColorStop(1,'#010308');c.fillStyle=neb;c.fillRect(0,0,w,h);
  // A deep grid room with moving light columns, rather than a fixed 2D backdrop.
  for(let z=-400;z<=800;z+=100){stroke(c,[P(-900,-220,z),P(900,-220,z)],'#1b647c',.7,.2);}
  for(let x=-900;x<=900;x+=100){stroke(c,[P(x,-220,-400),P(x,-220,800)],'#20647b',.7,.16);}
  for(let side of [-1,1])for(let z=0;z<900;z+=170){
    const x=side*(portrait?380:670),zz=z-((t*24)%170);
    stroke(c,[P(x,-220,zz),P(x,390,zz)],side<0?'#205d7e':'#7c6339',1,.18);
    glow(c,P(x,330,zz),20,'cyan',.16);
  }
  // Evolving wire waves / particle ribbons in actual perspective depth.
  const high=intro?1:.28;
  for(let row=0;row<18;row++){
    const z=(row-9)*32;
    const points=[];
    for(let k=0;k<=80;k++){
      const x=(k-40)*18;
      const y=-185+Math.sin(x*.009+t*1.35+z*.006)*(intro?75:22)+Math.cos(z*.011-t*.8)*(intro?36:12);
      const p=P(x,y,z);points.push(p);
      if(k%4===0&&(row%2===0||intro)){const a=(.35+.45*Math.sin(k*.2+t+row)**2)*high;glow(c,p,(k%12===0?3.8:2.2)*p.k,x<0?'cyan':'gold',a);}
    }
    stroke(c,points,row%3===0?C.gold:C.cyan,.65,high*(.11+row/150));
  }
  // Sweeping helices connect blue and gold into a moving light sculpture.
  for(let ribbon=0;ribbon<(intro?4:2);ribbon++){
    const points=[];
    for(let k=0;k<130;k++){
      const u=k/129,x=(u-.5)*(portrait?720:1360),phase=u*TAU*1.6+t*.8+ribbon*.45;
      points.push(P(x,Math.sin(phase)*(intro?120:35)-120,Math.cos(phase)*125+ribbon*35));
    }
    stroke(c,points,ribbon%2?C.gold:C.cyan,intro?1.7:1,.2, false,intro);
    for(let j=0;j<5;j++){const p=points[Math.floor(fract(t*.1+j*.2+ribbon*.07)*129)];glow(c,p,intro?11:5,ribbon%2?'gold':'cyan',intro?.7:.2);}
  }
  // Deterministic stars move through depth; bright stars retain short trails.
  for(let i=0;i<230;i++){
    const x=(noise(i*4)-.5)*2300,y=(noise(i*4+1)-.5)*1500,z=fract(noise(i*4+2)-t*(intro?.038:.012))*1800-650;
    const p=P(x,y,z),a=(.25+noise(i*4+3)*.6)*(intro?1:.6);
    if(p.x<-20||p.x>w+20||p.y<0||p.y>h)continue;
    c.fillStyle=i%5===0?C.gold:C.cyan;c.globalAlpha=a;c.fillRect(p.x,p.y,Math.max(.6,p.k*1.4),Math.max(.6,p.k*1.4));
    if(i%13===0){c.globalAlpha=1;glow(c,p,5*p.k,i%2?'cyan':'gold',a*.6);}
  }
  c.globalAlpha=1;
  // A few drifting formula planes add the blackboard / mathematics-space cue.
  const fragments=['cos x','x³','∫ f(x) dx','sin x','f(−x)','x²'];
  for(let i=0;i<6;i++){
    const z=fract(i/6-t*.025)*1000-200,x=(i%2?-1:1)*(portrait?340:610),y=150+Math.sin(i*3+t*.25)*160;
    const p=P(x,y,z);c.save();c.globalAlpha=.10+noise(i)*.12;c.translate(p.x,p.y);c.rotate((i%2?1:-1)*.12+Math.sin(t*.15)*.025);type(c,fragments[i],0,0,23*p.k,i%2?C.gold:C.cyan,'center');c.restore();
  }
}
function axes(c,P,fn,a,xs,portrait,t,mirror=false){
  // The graph's plane remains accurate. Background geometry occupies other depths.
  for(let y=-200;y<=300;y+=50){stroke(c,[P(-450,y),P(450,y)],'#2d7186',.7,.17);}
  for(let x=-400;x<=400;x+=80){stroke(c,[P(x,-200),P(x,300)],'#2d7186',.7,.15);}
  stroke(c,[P(-470,0),P(470,0)],'#7bbacf',1.3,.7,false,true);
  stroke(c,[P(0,-230),P(0,310)],mirror?C.cyan:'#7bbacf',mirror?2.3:1.3,.8,false,true);
  if(mirror){
    const plane=[P(0,-230,-80),P(0,310,-80),P(0,310,80),P(0,-230,80)];polygon(c,plane,C.cyan,.075);stroke(c,plane,C.cyan,1,.3,true);
    for(let z=-80;z<=80;z+=20)stroke(c,[P(0,-230,z),P(0,310,z)],C.cyan,.7,.12);
    const sweep=-230+fract(t*.22)*540;stroke(c,[P(0,sweep,-80),P(0,sweep,80)],C.white,1,.5);
  }
  for(let side of [-1,1]){const x=side*a*xs,p=P(x,0),top=P(x,fn.kind==='even'?200:side*150);
    const d=[];for(let i=0;i<=18;i++){const u=i/18;d.push({x:p.x+(top.x-p.x)*u,y:p.y+(top.y-p.y)*u});}
    c.save();c.setLineDash([3,6]);stroke(c,d,side<0?C.gold:C.cyan,1,.45);c.restore();
    type(c,side<0?'−a':'a',p.x,p.y+27,portrait?20:19,side<0?C.gold:C.cyan,'center');
  }
  const xp=P(470,0),yp=P(0,fn.kind==='even'?230:170),o=P(0,0);type(c,'x',xp.x+10,xp.y,20);type(c,'y',yp.x+13,yp.y,20);type(c,'0',o.x+14,o.y+18,16,'#97b6c9');
}
function burst(c,P,progress,t,odd=false,portrait=false){
  if(progress<=0||progress>1)return;
  const expansion=smooth(progress),fade=(1-progress)**1.5,o=P(0,0);
  glow(c,o,(portrait?200:250)*(1-progress*.65),odd?'white':'gold',fade*.95);
  for(let j=0;j<64;j++){
    const theta=j*2.39996,phi=noise(j)*Math.PI,rad=60+expansion*(220+noise(j+4)*200);
    const vx=Math.cos(theta)*Math.sin(phi),vy=Math.sin(theta)*Math.sin(phi),vz=Math.cos(phi),q=P(vx*rad,vy*rad,vz*rad),tail=P(vx*rad*.7,vy*rad*.7,vz*rad*.7);
    stroke(c,[tail,q],j%2?C.cyan:(odd?C.orange:C.gold),1+noise(j)*1.5,fade*.8);
    glow(c,q,3+noise(j+2)*4,j%2?'cyan':odd?'orange':'gold',fade);
  }
  const ring=[];for(let j=0;j<=100;j++){const u=j/100*TAU;ring.push(P(Math.cos(u)*expansion*400,Math.sin(u)*expansion*230,0));}stroke(c,ring,C.white,1.6,fade*.8);
}
function curvePoints(fn,P,xs,ys,side=1,progress=1,kind='still',rotation=1,z=0){
  const pts=[],n=Math.max(2,Math.round(150*progress));
  for(let i=0;i<=n;i++){
    const u=i/n*1.25*progress;let x=u*xs,y=fn.f(u)*ys;
    if(side<0){if(kind==='reflect'){const angle=rotation*Math.PI;z=Math.sin(angle)*x*.32;x=Math.cos(angle)*x;}
      else if(kind==='rotate'){const angle=rotation*Math.PI,nx=x*Math.cos(angle)-y*Math.sin(angle);y=x*Math.sin(angle)+y*Math.cos(angle);x=nx;}
      else {x=-x;y=fn.f(-u)*ys;}}
    pts.push(P(x,y,z));
  }
  return pts;
}
function areaPlate(c,P,fn,xs,ys,a,side,t,m=0,odd=false){
  const vanish=odd?smooth((m-.77)/.23):smooth((m-.86)/.14)*.76;
  const squeeze=1-(odd?.67:.35)*smooth(m);
  const tx=-side*a*xs*.55*m,ty=odd?-side*65*m:30*m;
  const transform=(x,y,z=0)=>P(x*squeeze+tx,y*squeeze+ty,z+Math.sin(m*Math.PI)*100);
  const points=[transform(0,0)];
  for(let i=0;i<=70;i++){const x=side*a*i/70;points.push(transform(x*xs,fn.f(x)*ys));}
  points.push(transform(side*a*xs,0));
  const color=odd&&side<0?C.orange:side<0?C.gold:C.cyan;
  polygon(c,points,color,.33*(1-vanish));stroke(c,points,color,1.25,.55*(1-vanish),true,true);
  // Scanning subdivisions and a depth edge make the filled regions look holographic.
  for(let i=1;i<30;i++){const u=i/30,x=side*a*u,h=fn.f(x)*ys,p=transform(x*xs,0),q=transform(x*xs,h);
    stroke(c,[p,q],color,.8,(.12+.28*Math.sin(u*9-t*2)**8)*(1-vanish));
    if(i%3===0){const z=transform(x*xs,h,14);stroke(c,[q,z],color,1,.4*(1-vanish));glow(c,q,4,side<0?(odd?'orange':'gold'):'cyan',.4*(1-vanish));}
  }
  const p=transform(side*a*xs*.57,fn.f(side*a*.8)*ys*.58);c.save();c.globalAlpha=(1-vanish)*(1-smooth((m-.1)/.35));type(c,odd?(side<0?'−S':'+S'):side<0?'S1':'S2',p.x,p.y,30,color,'center');c.restore();
}
function symmetryScene(c,P,fn,t,local,a,portrait,options={}){
  const xs=portrait?205:330;
  const max=Math.max(...Array.from({length:60},(_,i)=>Math.abs(fn.f(-1.25+i/59*2.5))),1);
  const ys=(portrait?285:190)/max;
  const odd=fn.kind==='odd',definition=options.definition,area=options.area;
  const reveal=definition?smooth(local/(portrait?1:2)):1;
  const turning=definition?smooth((local-(portrait?.5:1.7))/(portrait?1.4:4.8)):1;
  axes(c,P,fn,a,xs,portrait,t,!odd);
  if(options.fill&&!area)for(let side of [-1,1])areaPlate(c,P,fn,xs,ys,a,side,t,0,odd);
  if(area){
    const m=smooth((local-(portrait?2.45:3))/(portrait?2.0:4.5));
    for(let side of [-1,1])areaPlate(c,P,fn,xs,ys,a,side,t,m,odd);
    if(m>.04&&m<.98){for(let side of [-1,1])for(let j=0;j<110;j++){const u=fract(j/110+t*.58),x=side*(1-u)*xs*1.4,y=(odd?side:1)*65*(1-u)+Math.sin(u*TAU*2-t*4)*45*(1-u),z=Math.cos(u*TAU*2-t*4)*100*(1-u),q=P(x,y,z);glow(c,q,2+noise(j)*5,side<0?(odd?'orange':'gold'):'cyan',Math.sin(Math.PI*u)*.75);}}
    const flashTime=portrait?4.45:7.4;
    burst(c,P,(local-flashTime)/(portrait?1.6:3.1),t,odd,portrait);
    if(local>flashTime+.3){const o=P(0,odd?15:50);c.save();c.globalAlpha=smooth((local-flashTime-.3)/.8);glow(c,o,odd?70:90,odd?'cyan':'gold',.4);type(c,odd?'0':'2S',o.x,o.y,portrait?87:76,odd?C.white:C.gold,'center');c.restore();}
  }
  const rp=curvePoints(fn,P,xs,ys,1,reveal);
  stroke(c,rp,C.cyan,2.8,.95,false,true);
  if(definition&&turning<1&&turning>0){for(let trail=1;trail<=4;trail++)stroke(c,curvePoints(fn,P,xs,ys,-1,1,odd?'rotate':'reflect',Math.max(0,turning-trail*.07)),odd?C.orange:C.gold,1.2,.11*(1-trail/5));}
  const lp=curvePoints(fn,P,xs,ys,-1,definition?reveal:1,definition?(odd?'rotate':'reflect'):'still',turning);
  stroke(c,lp,odd?C.orange:C.gold,2.6,definition?.75:1,false,true);
  for(let j=0;j<8;j++){
    const u=fract(t*.18+j/8),n=Math.floor(u*(rp.length-1)),p=rp[n];glow(c,p,8,'cyan',.75);
    const q=lp[Math.min(n,lp.length-1)];glow(c,q,7,odd?'orange':'gold',.65);
  }
  const o=P(0,0);glow(c,o,odd?60:25,odd?'white':'cyan',odd?.9:.6);
  if(definition&&odd){const points=[],rad=portrait?105:95;for(let j=0;j<=60;j++){const u=j/60*Math.PI*turning;points.push(P(Math.cos(u)*rad,Math.sin(u)*rad));}stroke(c,points,C.gold,1.5,.65);const label=P(0,rad+35);type(c,'180°',label.x,label.y,22,C.gold,'center');}
  if(definition&&!odd&&turning>.8){
    const u=.35+fract(t*.18)*.65,yy=fn.f(u)*ys,r=P(u*xs,yy),l=P(-u*xs,yy);stroke(c,[r,l],C.white,.8,.22);glow(c,r,8,'cyan',.9);glow(c,l,8,'gold',.9);
  }
}
const WIDE=[
  [0,10,'SYMMETRY / 数学Ⅲ','偶関数・奇関数の定積分','square','intro'],
  [10,25,'01 / MIRROR','偶関数は、鏡で重なる。','square','evenDef'],
  [25,40,'02 / DOUBLE','左右の面積が、ひとつになる。','square','even'],
  [40,55,'03 / ROTATION','奇関数は、半回転で重なる。','cube','oddDef'],
  [55,70,'04 / CANCEL','正と負が、原点で打ち消し合う。','cube','odd'],
  [70,82,'05 / DECOMPOSITION','対称性で、計算をほどく。','mixed','example'],
  [82,90,'06 / COSINE','cos x も、偶関数。','cos','cos'],
];
const SHORT=[
  [0,4,'SYMMETRY / INTEGRAL','偶関数・奇関数の定積分','square','intro'],
  [4,10,'MIRROR → DOUBLE','偶関数の積分は、2倍。','square','even'],
  [10,18,'ROTATE → CANCEL','奇関数の積分は、0。','cube','odd'],
  [18,25,'SPOT THE SYMMETRY','対称性を見抜こう。','square','spot'],
  [25,30,'REMEMBER','式の前に、対称性を。','cos','summary'],
];
export function sceneAt(t,portrait=false){const list=portrait?SHORT:WIDE;const scene=list.find(s=>t>=s[0]&&t<s[1])||list.at(-1);return {scene,index:list.indexOf(scene),local:t-scene[0]};}
function math(c,key,x,y,width,height){
  const m=resources.math[key];if(!m)throw Error(`Missing cinema formula: ${key}`);
  const ww=Math.min(width,height*m.ratio),hh=ww/m.ratio;c.drawImage(m.image,x+(width-ww)/2,y-hh/2,ww,hh);
}
function transition(c,w,h,local,t,portrait){
  if(local>.8)return;
  const p=smooth(local/.8),x=-w*.3+p*w*1.6;
  const g=c.createLinearGradient(x-80,0,x+80,0);g.addColorStop(0,'#37d8ff00');g.addColorStop(.5,'#b9eeff');g.addColorStop(1,'#ffcf7200');
  c.save();c.globalAlpha=(1-p)*.22;c.fillStyle=g;c.translate(x,h*.5);c.rotate(-.2);c.fillRect(-80,-h,160,h*2);c.restore();
}
export function cinemaFrame(c,W,H,t,portrait=false){
  const w=portrait?720:1280,h=portrait?1280:720;
  c.save();c.scale(W/w,H/h);
  const {scene:s,index,local}=sceneAt(t,portrait);let [start,end,kicker,title,id,key]=s;
  let fn=byId(id),note='',area=['even','odd'].includes(key),definition=['evenDef','oddDef'].includes(key),intro=key==='intro';
  if(key==='example'){
    id=local<3.5?'mixed':local<6.5?'oddpart':'evenpart';fn=byId(id);key=local<3.5?'example':local<6.5?'oddterms':'result';
    note=local<3.5?'6x³・2x は奇関数　／　x²・1 は偶関数':local<6.5?'奇関数の項は、光になって消える。積分は0。':'偶関数の項だけを2倍する。答えは 8/3。';
  }
  if(key==='spot'){
    const i=Math.min(2,Math.floor(local/2.34));fn=byId(['square','cube','cos'][i]);key=['spotEven','spotOdd','spotCos'][i];title=['x² は、偶関数。','x³ は、奇関数。','cos x は、偶関数。'][i];note=['y軸対称 → 2倍','原点対称 → 0','y軸対称 → 2倍'][i];
  }
  if(key==='cos'&&!portrait){key=local<2.4?'cos':local<5?'coscalc':'summary';if(key==='summary')title='対称性が、面積を決める。';}
  const P=projectCamera({w,h,t,portrait,local,kind:fn.kind,intro});room(c,w,h,t,P,intro,portrait);
  c.save();c.beginPath();c.rect(0,portrait?300:180,w,portrait?600:360);c.clip();
  if(intro){
    const xs=portrait?195:330,ys=portrait?110:70;
    for(let j=0;j<7;j++){
      const pts=[];for(let k=0;k<=150;k++){const x=(k/150-.5)*3,xx=x*xs,y=Math.sin(x*3+t*.85+j*.12)*ys,z=(j-3)*45;pts.push(P(xx,y,z));}
      stroke(c,pts,j%2?C.gold:C.cyan,j===3?2.5:1.1,j===3?.95:.3,false,j===3);
      for(let k=0;k<10;k++){const q=pts[Math.floor(fract(k/10+t*.12)*150)];glow(c,q,k%3===0?8:4,j%2?'gold':'cyan',.8);}
    }
    for(let j=0;j<820;j++){const u=noise(j),x=(u-.5)*3*(portrait?195:330),phase=(u-.5)*9+t*.85,z=(noise(j+950)-.5)*260,y=Math.sin(phase)*(portrait?110:70)+Math.sin(z*.014+t)*24+(noise(j+1800)-.5)*20;const q=P(x,y,z);glow(c,q,1.3+noise(j+2000)*3.2,j%3===0?'gold':'cyan',.4+noise(j+1000)*.45);}
    const center=P(0,0);glow(c,center,120,'cyan',.8);
  }else{
    // In the short edition, first show the same mirror/rotation before the area event.
    if(portrait&&area&&local<2.0)symmetryScene(c,P,fn,t,local,1,portrait,{definition:true});
    else symmetryScene(c,P,fn,t,local,fn.id==='cos'?Math.PI/4:1,portrait,{definition,area,fill:['oddterms','result','cos','coscalc','summary'].includes(key)});
    if(['example','oddterms','result'].includes(key)){
      const disappearing=key==='oddterms'?smooth((local-3.5)/2.5):0;
      for(let i=0;i<90&&key==='oddterms';i++){
        const u=noise(i),x=(u-.5)*(portrait?450:800)*(1+disappearing),y=(noise(i+90)-.5)*160+disappearing*Math.sin(i)*200;
        glow(c,P(x,y,disappearing*(noise(i+180)-.5)*500),4,'orange',(1-disappearing)*.8);
      }
    }
  }
  c.restore();
  // Opaque-enough upper and lower typography zones isolate the mathematical content.
  const top=c.createLinearGradient(0,0,0,portrait?330:210);top.addColorStop(0,'#02050cf4');top.addColorStop(.7,'#02050cbb');top.addColorStop(1,'#02050c00');c.fillStyle=top;c.fillRect(0,0,w,portrait?330:210);
  const bottomStart=portrait?900:535,fade=c.createLinearGradient(0,bottomStart,0,h);fade.addColorStop(0,'#02050c00');fade.addColorStop(.22,'#02050ce8');fade.addColorStop(1,'#02050cfa');c.fillStyle=fade;c.fillRect(0,bottomStart,w,h-bottomStart);
  const pad=portrait?48:62;
  type(c,kicker,pad,portrait?104:52,portrait?17:14,C.gold);
  if(intro&&portrait){type(c,'偶関数・奇関数の',pad,173,37);type(c,'定積分',pad,235,58);type(c,'対称性が、面積を決める。',pad,305,23,'#c0d9e8');}
  else {
    const size=portrait?35:intro?46:36;
    c.save();c.globalAlpha=smooth((local+.25)/.9);type(c,title,pad,portrait?181:114,size);c.restore();
    if(intro)type(c,'対称性が、面積を決める。',pad,180,27,'#b1d3e7');
    else type(c,`y = ${fn.label}`,w-pad,portrait?278:169,portrait?23:21,fn.kind==='odd'?C.orange:C.cyan,'right');
  }
  if(intro){
    type(c,'MIRROR',w*.29,portrait?941:588,portrait?18:16,C.gold,'center');
    type(c,'ROTATION',w*.73,portrait?941:588,portrait?18:16,C.cyan,'center');
    type(c,'鏡で、2倍。',w*.29,portrait?995:630,portrait?29:28,C.white,'center');
    type(c,'半回転で、0。',w*.73,portrait?995:630,portrait?29:28,C.white,'center');
    note='グラフの動きから、積分の意味が見えてくる。';
  }else if(key==='summary'){
    if(portrait){
      type(c,'偶関数 / y軸対称',pad,916,20,C.gold);math(c,'even',pad,973,w-pad*2,64);
      type(c,'奇関数 / 原点対称',pad,1044,20,C.cyan);math(c,'odd',pad,1099,w-pad*2,60);
      note='式の前に、対称性を見抜こう。';
    }else{
      type(c,'偶関数 / y軸対称',w*.26,560,16,C.gold,'center');math(c,'even',55,615,w*.46,66);
      type(c,'奇関数 / 原点対称',w*.75,560,16,C.cyan,'center');math(c,'odd',w*.52,615,w*.42,66);
      note='偶関数 → 2倍　／　奇関数 → 0　　対称区間 [−a, a] で考える。';
    }
  }else{
    if(key.startsWith('spot'))math(c,key==='spotOdd'?'oddDef':'evenDef',pad,portrait?982:609,w-pad*2,portrait?78:70);
    else math(c,key,pad,portrait?982:610,w-pad*2,portrait?86:78);
    if(!note){
      if(key==='evenDef')note='f(−x) = f(x)　y軸を鏡にして、同じ高さで重なる。';
      if(key==='oddDef')note='f(−x) = −f(x)　原点を中心に180°回転する。';
      if(key==='even')note=portrait?'y軸対称 → 左右の符号付き面積が等しい。':'左右の符号付き面積は等しい。合わせると、右半分の2倍。';
      if(key==='odd')note=portrait?'同じ大きさ、反対の符号。打ち消し合って0。':'x軸より上は正、下は負。符号付き面積が打ち消し合う。';
      if(key==='cos'||key==='coscalc')note='cos(−x) = cos x　対称区間の積分は、右半分を2倍。';
    }
  }
  if(!portrait&&['example','oddterms','result'].includes(key)){
    const terms=key==='example'?[['6x³ / 奇',C.orange],['x² / 偶',C.gold],['2x / 奇',C.orange],['1 / 偶',C.gold]]:key==='oddterms'?[['6x³ + 2x → 0',C.orange]]:[['残るのは x² + 1',C.gold]];
    terms.forEach(([label,col],j)=>{c.save();c.globalAlpha=key==='oddterms'?1-smooth((local-4.5)/2):1;type(c,label,w/2+(j-(terms.length-1)/2)*165,205,18,col,'center');c.restore();});
  }
  // Fixed safe zones: formulas never rotate with the camera or collide with the graph.
  type(c,note,w/2,portrait?1176:685,portrait?18:19,'#b5d0e0','center');
  if(portrait&&key!=='summary')type(c,'対称区間 [−a, a] ／ 面積は符号付きで考える',w/2,1220,15,'#7898ad','center');
  if(area)type(c,'合体・相殺は符号付き面積の模式演出',w/2,portrait?890:532,portrait?13:12,'#82a7bc','center');
  const barY=h-18;c.fillStyle='#183247';c.fillRect(pad,barY,w-pad*2,2);c.fillStyle=C.cyan;c.fillRect(pad,barY,(w-pad*2)*t/(portrait?30:90),2);
  transition(c,w,h,local,t,portrait);c.restore();
}
