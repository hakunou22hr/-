(function(root){
const {E,ease,mix,clamp,timeline}=MVT;
const cyan='#70eaff',gold='#ffc86c',violet='#c893ff';
let seed=87405;
const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const dust=Array.from({length:180},()=>[random(),random(),random(),random()]);
const graphX=(x,m)=> (x-(m.kind==='abs'?0:.95))*1.14;
const graphY=y=>.65+y*.78;
const easeBetween=(t,a,b)=>ease((t-a)/(b-a));
const captions=[
'全体の傾きと、途中の傾き。どこかで一致する？',
'2点を結ぶ直線の傾きが、区間全体の平均変化率。',
'点を動かすと、その場所での傾きも変わる。',
'全体と同じ傾きが、途中にある。',
'2つの傾きが等しいとおくと、接点の位置が求まる。',
'連続でも、途中で微分できないと、この結論は保証できない。',
'条件を満たすとき、傾きが一致する点が少なくとも1つある。'];
const titles=['黒板の向こうへ','区間全体の傾き','途中の傾きを探す','傾きが出会う瞬間','図と計算を結ぶ','条件が必要な理由','平均値の定理'];
function render(canvas,t,options={}){
  const g=canvas.getContext('2d'), interactive=!!options.model, m=options.model||timeline(t);
  const scene=t<12?0:t<27?1:t<43?2:t<57?3:t<73?4:t<84?5:6;
  const go=easeBetween(t,0,10), tunnel=easeBetween(t,8,12), back=easeBetween(t,85.3,89.9);
  const inside=interactive?1:t<12?tunnel:1-back;
  const z=interactive?6:mix(mix(13.6,2.65,go),-5.6,tunnel)*(1-back)+10*back;
  const gx=interactive?0:mix(-.95,0,tunnel)*(1-back)-.6*back;
  const sway=interactive?(options.spatial?.8:0):.33*Math.sin((t-12)*.27)*easeBetween(t,12,16)*(1-easeBetween(t,44,48))*(1-back);
  const cx=gx+sway;
  const cy=interactive?2.22:mix(2.05,2.25,inside);
  const center=interactive?480:mix(480,351,inside);
  const gz=interactive?0:-11.65*inside+.025;
  const scale=canvas.width/960;
  g.setTransform(scale,0,0,scale,0,0);
  g.fillStyle='#061120';g.fillRect(0,0,960,540);
  const sky=g.createRadialGradient(490,305,5,490,305,580);
  sky.addColorStop(0,'#103953');sky.addColorStop(.48,'#0a203b');sky.addColorStop(1,'#030815');
  g.fillStyle=sky;g.fillRect(0,0,960,540);
  function project([x,y,pz]){
    const d=z-pz;
    return d<.075?null:[center+505*(x-cx-(sway*.15)*d)/d,253-505*(y-cy)/d];
  }
  function path3(points,close=false){
    g.beginPath();let down=false;
    for(const p of points){
      const q=project(p);
      if(!q){down=false;continue;}
      if(down)g.lineTo(...q);else g.moveTo(...q);
      down=true;
    }
    if(close)g.closePath();
  }
  function poly(pts,color){path3(pts,true);g.fillStyle=color;g.fill();}
  function line(pts,color,width=1,halo=0){
    path3(pts);g.lineJoin='round';g.lineCap='round';
    if(halo){g.strokeStyle=color;g.globalAlpha*=.19;g.lineWidth=width+halo;g.stroke();g.globalAlpha/=.19;}
    g.strokeStyle=color;g.lineWidth=width;g.stroke();
  }
  function rect(x,y,w,h,pz,color){poly([[x,y,pz],[x+w,y,pz],[x+w,y+h,pz],[x,y+h,pz]],color);}
  function box(x,y,pz,w,h,d,colors){
    const front=Math.min(z-.08,pz+d),rear=pz;
    if(front<=rear)return;
    poly([[x,y+h,rear],[x+w,y+h,rear],[x+w,y+h,front],[x,y+h,front]],colors[0]);
    const side=x+w<cx?x+w:x;
    poly([[side,y,rear],[side,y,front],[side,y+h,front],[side,y+h,rear]],colors[2]);
    rect(x,y,w,h,front,colors[1]);
  }
  function label(str,x,y,size=16,color='#e6f5ff',align='left',serif=false){
    g.textAlign=align;g.textBaseline='middle';g.fillStyle=color;
    g.font=size+'px '+(serif?'FilmSerif, "Noto Serif CJK JP", serif':'FilmSans, "Noto Sans CJK JP", sans-serif');
    g.fillText(str,x,y);
  }
  function label3(str,pt,dx,dy,size,color){
    const q=project(pt);if(q)label(str,q[0]+dx,q[1]+dy,size,color);
  }
  const rippleAt=t>=48&&t<56?48:t>=21&&t<25?21:-100;
  const rippleAge=t-rippleAt,rippleX=rippleAt===48?graphX(1,m):graphX(2,m);
  const animated=!options.calm;
  const wave=(x,pz)=>{
    if(!animated||interactive||rippleAge>8)return 0;
    const distance=Math.hypot(x-rippleX,pz-gz), offset=distance-rippleAge*2.1;
    return .28*Math.sin(offset*6.2)*Math.exp(-offset*offset*4-rippleAge*.39);
  };
  if(inside>.035&&(!interactive||options.spatial)){
    const end=-42,start=Math.min(-.15,z-.25);
    g.globalAlpha=inside*.46;
    for(let x=-17;x<=17;x+=.65){
      const pts=[];for(let pz=start;pz>end;pz-=.23)pts.push([x,wave(x,pz)-.08,pz]);
      line(pts,'#30a9d0',.62);
    }
    for(let pz=Math.floor(start/.65)*.65;pz>end;pz-=.65){
      const pts=[];for(let x=-18;x<=18;x+=.22)pts.push([x,wave(x,pz)-.08,pz]);
      line(pts,'#36b4da',.64);
    }
    if(animated&&!interactive&&rippleAge>=0&&rippleAge<5.6){
      const ring=[];
      for(let i=0;i<=96;i++){
        const a=i/96*Math.PI*2,r=.08+2.1*rippleAge;
        const x=rippleX+Math.cos(a)*r,pz=gz+Math.sin(a)*r;
        ring.push([x,wave(x,pz)-.05,pz]);
      }
      g.globalAlpha=.73*Math.exp(-rippleAge*.63);line(ring,gold,1.55,4);
    }
    g.globalAlpha=1;
  }
  if(!interactive&&z>.1){
    const far=.018,near=z-.079;
    g.globalAlpha=1-easeBetween(t,8.9,10.8)*(1-back);
    const wall=g.createLinearGradient(0,0,960,540);
    wall.addColorStop(0,'#ad7350');wall.addColorStop(.47,'#56403a');wall.addColorStop(1,'#181a21');
    poly([[-5.3,0,far],[5.3,0,far],[5.3,4.85,far],[-5.3,4.85,far]],wall);
    poly([[-5.3,0,far],[5.3,0,far],[5.3,0,near],[-5.3,0,near]],'#402822');
    poly([[-5.3,4.85,far],[5.3,4.85,far],[5.3,4.85,near],[-5.3,4.85,near]],'#40332f');
    poly([[-5.3,0,far],[-5.3,4.85,far],[-5.3,4.85,near],[-5.3,0,near]],'#714a36');
    poly([[5.3,0,far],[5.3,4.85,far],[5.3,4.85,near],[5.3,0,near]],'#342a2b');
    for(let x=-5;x<5.2;x+=.36)line([[x,0,far],[x,0,near]],'#a16b45',.62);
    const windowLight=g.createLinearGradient(0,25,0,350);
    windowLight.addColorStop(0,'#766a9b');windowLight.addColorStop(.58,'#eb9f71');windowLight.addColorStop(1,'#ffe2a0');
    for(let pz=1;pz<11;pz+=2.55){
      if(pz>=near)break;
      const end=Math.min(pz+2.37,near),x=-5.27;
      poly([[x,1.24,pz],[x,4.14,pz],[x,4.14,end],[x,1.24,end]],'#2b242b');
      poly([[x+.01,1.37,pz+.09],[x+.01,4.01,pz+.09],[x+.01,4.01,end-.015],[x+.01,1.37,end-.015]],windowLight);
      line([[x+.03,2.62,pz],[x+.03,2.62,end]],'#593b32',3);
      if(pz+1.15<end)line([[x+.03,1.26,pz+1.15],[x+.03,4.12,pz+1.15]],'#50332e',3);
      if(pz<near)poly([[x,0,pz],[x,0,end],[1.4,0,Math.min(near,end+2.45)],[1.4,0,Math.min(near,pz+2.1)]],'#b879434d');
    }
    rect(-3.72,.72,7.02,3.31,.045,'#6c4b35');
    const board=g.createLinearGradient(110,150,800,380);
    board.addColorStop(0,'#25443a');board.addColorStop(.53,'#142d2b');board.addColorStop(1,'#0b2120');
    rect(-3.61,.83,6.80,3.10,.053,board);
    rect(-3.72,.72,7.04,.108,.14,'#94704e');
    rect(-.46,4.22,.57,.43,.067,'#ad8e6c');
    const clock=project([-.18,4.43,.10]);
    if(clock){g.fillStyle='#e8cba1';g.beginPath();g.arc(...clock,Math.max(2,72/z),0,Math.PI*2);g.fill();}
    line([[-.18,4.43,.12],[-.18,4.54,.12]],'#513b32',1.3);
    line([[-.18,4.43,.12],[-.075,4.37,.12]],'#513b32',1.3);
    if(z>1.2){
      const beam=g.createLinearGradient(0,120,760,465);
      beam.addColorStop(0,'#ffcc7640');beam.addColorStop(1,'#ffc16900');
      poly([[-5.25,3.9,1.12],[-5.25,2.7,1.12],[3.9,0,6.8],[-.8,0,6.1]],beam);
    }
    for(let row=0;row<5;row++){
      const pz=2.3+row*1.9;if(pz>z-.2)break;
      for(const x of [-4.15,-2.62,.75,2.38,3.92]){
        const wood=x<0?['#c68c56','#71402b','#965f3e']:['#9c6643','#553226','#73472f'];
        const legs=['#5b4536','#392b25','#47382c'];
        for(const dx of [0,.94])for(const dz of [0,.53])box(x+dx,0,pz+dz,.048,.83,.05,legs);
        box(x-.08,.81,pz-.08,1.09,.084,.71,wood);
        if(pz+1.04>z-.1)continue;
        for(const dx of [.21,.71])box(x+dx,0,pz+.96,.05,.86,.05,legs);
        box(x+.18,.47,pz+.70,.61,.07,.33,wood);
        box(x+.18,.72,pz+.99,.61,.19,.065,wood);
      }
    }
    g.globalAlpha=1;
  }
  const returning=!interactive&&scene===6;
  const graphYScale=interactive?1:mix(.56,1,inside);
  const graphXScale=mix(.78,1,inside);
  const gp=(x,y)=>[graphX(x,m)*graphXScale,graphY(y*graphYScale)+(1-inside)*1.04,gz+(1-inside)*.065];
  const inRoom=inside>.69||interactive;
  const match=m.exact&&(interactive||t>=E.match);
  const color=match||(interactive&&m.near)?gold:violet;
  const anchor=m.kind==='abs'?-1.82:-.52,limit=m.kind==='abs'?1.82:2.43,top=m.kind==='abs'?2.3:5.02;
  const cameraProjection=p=>project(gp(...p));
  if(animated&&!options.calm){
    const count=scene===4?35:inRoom?115:160;
    for(const [i,[u,v,w,h]] of dust.entries()){
      if(i>=count)break;
      const flow=easeBetween(t,5,11)*(1-back), attract=easeBetween(t,46.1,48)*(1-easeBetween(t,48,49.6));
      const measure=easeBetween(t,17,21)*(1-easeBetween(t,21,22.4));
      const drift=.2*Math.sin(t*.36+h*15);
      let world=inRoom?[u*14-7+drift,.2+v*5,gz+2.2-w*11]:[u*11-5.5+drift,.3+v*4.3,.2+((w+t*.017)%1)*12];
      if(!inRoom)world=world.map((p,j)=>mix(p,[0,2.25,.12][j],flow*.92));
      if(!interactive&&(attract||measure)){
        const target=gp(attract?m.c:i%2?m.a:m.b,attract?m.f(m.c):m.f(i%2?m.a:m.b));
        world=world.map((p,j)=>mix(p,target[j],Math.max(attract,measure)*(.72+.27*h)));
      }
      const q=project(world);if(!q)continue;
      const s=inRoom?.55+h*1.25:.45+h*.85;
      g.globalAlpha=(.16+h*.39)*(inRoom?.75:1);
      g.fillStyle=inRoom?(attract||measure||i%8===0?gold:cyan):'#ffe2a4';
      g.fillRect(q[0],q[1],s,s);
    }
    g.globalAlpha=1;
  }
  line([gp(anchor,0),gp(limit+.22,0)],'#8eafbf',1);
  line([gp(0,-.33),gp(0,top+.32)],'#8eafbf',1);
  if(inRoom){
    for(let x=Math.ceil(anchor);x<=limit;x++){
      line([gp(x,-.045),gp(x,.045)],'#a9c4d3',.9);
      if(x)label3(String(x),gp(x,0),-3,15,11,'#a9c4d3');
    }
    for(let y=1;y<top;y++){
      line([gp(-.035,y),gp(.035,y)],'#a9c4d3',.9);
      label3(String(y),gp(0,y),-15,0,11,'#a9c4d3');
    }
    label3('x',gp(limit+.22,0),7,-2,13,'#a9c4d3');
    label3('y',gp(0,top+.32),-3,-9,13,'#a9c4d3');
  }
  const curve=[];
  for(let i=0;i<=138;i++){
    const x=mix(anchor,limit,i/138);
    if(m.f(x)<=top+.06)curve.push(gp(x,m.f(x)));
  }
  line(curve,t<E.glow&&!interactive?'#e0dcc6':cyan,2.25,3.8);
  function dot(x,y,col,name,dy=-13){
    const q=cameraProjection([x,y]);if(!q)return;
    g.globalAlpha=.18;g.fillStyle=col;g.beginPath();g.arc(...q,8,0,Math.PI*2);g.fill();
    g.globalAlpha=1;g.beginPath();g.arc(...q,3.5,0,Math.PI*2);g.fill();
    if(inRoom&&name)label(name,q[0]+9,q[1]+dy,13,col);
  }
  const showSec=interactive||returning||t>=E.secant;
  const pulse=!interactive&&match?Math.exp(-Math.max(0,t-E.match)*2.3):0;
  if(showSec){
    const start=interactive||t>17.7?anchor:m.a;
    const end=interactive||t>17.7?limit:mix(m.a,m.b,easeBetween(t,16,17.25));
    const y=x=>m.f(m.a)+m.sec*(x-m.a);
    line([gp(start,y(start)),gp(end,y(end))],gold,1.65+pulse,4+4*pulse);
  }
  if(interactive||t<12||t>=E.points){
    dot(m.a,m.f(m.a),gold,inRoom?'A':'',15);
    dot(m.b,m.f(m.b),gold,inRoom?'B':'');
  }
  if(!interactive&&t>=18&&t<27){
    const px=mix(m.a,m.b,easeBetween(t,18,19.6)),py=mix(m.f(m.a),m.f(m.b),easeBetween(t,19.6,E.measure));
    line([gp(m.a,m.f(m.a)),gp(px,m.f(m.a)),gp(px,py)],'#9ed5e0',1.35);
    label3('Δx = 2',gp(1,0),5,27,13,'#b0dbe6');
    if(t>20)label3('Δy = 4',gp(2,2),10,0,13,'#b0dbe6');
  }
  if(interactive||t>=E.move){
    if(m.slope!==null){
      let x0=anchor,x1=limit;
      if(m.slope>0)x1=Math.min(x1,m.c+(top+.12-m.f(m.c))/m.slope);
      if(m.slope<0)x0=Math.max(x0,m.c+(top+.12-m.f(m.c))/m.slope);
      if(!interactive&&t>=27.32&&t<48){
        const past=timeline(t-.19);
        if(past.slope!==null&&m.kind===past.kind){
          g.globalAlpha=.12;line([gp(x0,past.tangent(x0)),gp(x1,past.tangent(x1))],violet,1);g.globalAlpha=1;
        }
      }
      line([gp(x0,m.tangent(x0)),gp(x1,m.tangent(x1))],color,1.75+pulse,4+4*pulse);
    }
    dot(m.c,m.f(m.c),color,'P',m.c<.5?20:13);
  }
  if(!interactive&&t>=49&&t<57){
    const tri=(x,y,stroke)=>line([gp(x,y),gp(x+.58,y),gp(x+.58,y+1.16),gp(x,y)],stroke,1.5);
    tri(.26,.52,'#ffdd9c');
    tri(1.06,1.12,'#f6ad61');
    if(t>=51&&t<55.4){
      const p=easeBetween(t,51,54);
      tri(mix(1.06,.26,p),mix(1.12,.52,p),'#fff5c9');
    }
  }
  if(interactive)return {project:cameraProjection};
  const vignette=g.createRadialGradient(475,253,160,475,253,550);
  vignette.addColorStop(0,'#0000');vignette.addColorStop(1,'#02050bc4');
  g.fillStyle=vignette;g.fillRect(0,0,960,540);
  g.fillStyle='#050812';g.fillRect(0,0,960,24);g.fillRect(0,515,960,25);
  label('数学Ⅱ　/　微分法',46,48,12,'#e5c488');
  label('0'+(scene+1)+' / 07',910,48,12,'#b8c6d6','right');
  if(scene===0&&t<6.4){
    g.globalAlpha=easeBetween(t,0,1)*(1-easeBetween(t,4.8,6.4));
    label('傾きが出会う瞬間',48,107,38,'#fff1d7','left',true);
    label('平均値の定理',50,150,19,'#e6c48e');
    g.globalAlpha=1;
  }
  function fraction(x,y,num,den,eq,w){
    label(num,x+w/2,y-15,18,'#f1f6ff','center');
    g.fillStyle='#d2e5f1';g.fillRect(x,y,w,1);
    label(den,x+w/2,y+16,18,'#f1f6ff','center');
    label(eq,x+w+12,y,20,gold);
  }
  if(scene>0){
    const p=scene===6?592:625;
    g.fillStyle='#060e1ddf';g.fillRect(p,98,915-p,scene===6?231:278);
    g.fillStyle='#c89651';g.fillRect(p,98,915-p,1.4);
    label(titles[scene],p+22,132,23,'#ffedce','left',true);
    const x=p+22;
    if(scene===1){
      label('f(x) = x²    [0, 2]',x,178,21,cyan);
      label('A = (0, 0)    B = (2, 4)',x,215,17,'#b9cfdf');
      if(t>=16)fraction(x,260,'f(b) − f(a)','b − a','',145);
      if(t>=21)fraction(x,325,'4 − 0','2 − 0','= 2',145);
    }
    if(scene===2||scene===3){
      label('割線の傾き   2',x,181,19,gold);
      label('接線の傾き   '+m.slope.toFixed(2),x,215,19,color);
      if(match){
        label('P = (1, 1)',x,259,21,'#e1eef8');
        label('割線   y = 2x',x,296,18,gold);
        label('接線   y = 2x − 1',x,329,18,gold);
      }else{
        label('P = (c, c²)    c = '+m.c.toFixed(2),x,259,17,'#e1eef8');
        label('y = 2c(x − c) + c²',x,298,19,violet);
        label('f′(c) = 2c',x,334,19,violet);
      }
    }
    if(scene===4){
      fraction(x,192,'f(2) − f(0)','2 − 0','= 2',145);
      if(t>=60)label('f′(c) = 2c',x,251,23,violet);
      if(t>=64)label('2c = 2  ⇒  c = 1',x,301,23,gold);
      if(t>=67){
        label('P = (1, 1)',x,343,18,gold);
        dot(1,1,gold,'(1, 1)',16);
      }
    }
    if(scene===5){
      label('f(x) = |x|    [−1, 1]',x,179,21,cyan);
      label('割線の傾き   0',x,220,19,gold);
      label('左：−1　　右：1',x,263,19,violet);
      if(m.slope===null)label('ここでは微分できない',x,311,18,'#ffe1ad');
      else label('接線の傾き   '+String(m.slope).replace('-','−'),x,311,18,violet);
    }
    if(scene===6){
      fraction(x,184,'f(b) − f(a)','b − a','= f′(c)',149);
      label('a < c < b',x,229,19,gold);
      label('閉区間 [a, b] で連続',x,265,18,'#e0effa');
      label('開区間 (a, b) で微分可能',x,298,18,'#e0effa');
      if(back>.70){
        const pt=project([-1.0,3.55,.16]);
        if(pt)label('(f(b) − f(a)) / (b − a) = f′(c)',pt[0],pt[1],Math.max(8,102/z),'#f5e8bd','center');
      }
    }
  }
  g.fillStyle='#040a14e8';g.fillRect(45,457,870,45);
  label(captions[scene],480,479,20,'#f7f4e9','center');
  g.fillStyle='#c38c48';g.fillRect(45,501,870*t/90,1.2);
  return {project:cameraProjection};
}
root.Film={render};
})(globalThis);
