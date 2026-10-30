import {state,ease,clamp,kernel} from './model.js';
import {drawMath,mathMetrics} from './math.js';
const TAU=Math.PI*2,ice='#7de8ff',violet='#b597ff',gold='#ffdb91',orange='#ffb173',white='#eff8ff',red='#ff8797';
const rand=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
export function createFilm(make,portrait=false){
 const W=portrait?1080:1920,H=portrait?1920:1080,canvas=make(W,H),g=canvas.getContext('2d'),bg=make(portrait?540:960,portrait?960:540),b=bg.getContext('2d');let q,bounds=[];
 function text(s,x,y,size=30,color=white,align='center'){g.font=`${size}px "Noto Sans CJK JP",sans-serif`;g.textAlign=align;g.textBaseline='middle';g.fillStyle=color;g.shadowColor='#020711';g.shadowBlur=7;g.fillText(s,x,y);g.shadowBlur=0;const w=g.measureText(s).width;bounds.push({key:s,left:x-(align==='center'?w/2:align==='right'?w:0),right:x+(align==='center'?w/2:align==='right'?0:w),top:y-size*.6,bottom:y+size*.6});}
 function math(key,x,y,size=66,color=gold,max=W-180,alpha=1){const m=mathMetrics(key,size);if(m.width>max)size*=max/m.width;g.save();g.globalAlpha=alpha;bounds.push({key,...drawMath(g,make,key,x,y,size,color)});g.restore();}
 function path(ctx,pts,color,width=1,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();ctx.restore();}
 function glow(ctx,pts,color,width=1,power=1){ctx.save();ctx.globalCompositeOperation='lighter';path(ctx,pts,color,width*9,.035*power);path(ctx,pts,color,width*4,.12*power);path(ctx,pts,color,width,.8*power);path(ctx,pts,'#f1fdff',width*.3,.7*power);ctx.restore();}
 function background(){const w=bg.width,h=bg.height,t=q.t,s=q.s,u=q.u;b.globalCompositeOperation='source-over';b.fillStyle='#020611';b.fillRect(0,0,w,h);
  const ry=.11*Math.sin(t*.13)+.12*Math.sin(u*TAU)*(s===3?1.8:1),rx=.18+.075*Math.sin(t*.11),cz=29-(s===0?ease(u)*7:s===4?ease(u)*5:2*Math.sin(u*Math.PI)),cy=s===3?1.8*Math.sin(u*Math.PI):0;
  const project=(x,y,z)=>{const xx=x*Math.cos(ry)-z*Math.sin(ry),zz=x*Math.sin(ry)+z*Math.cos(ry),yy=(y-cy)*Math.cos(rx)-zz*Math.sin(rx),depth=(y-cy)*Math.sin(rx)+zz*Math.cos(rx)+cz;if(depth<1)return null;const scale=(portrait?620:720)/depth;return[w/2+xx*scale,h*(portrait?.56:.57)-yy*scale,scale];};
  function line3(points,color,width=1,alpha=1){const p=points.map(v=>project(...v)).filter(Boolean);if(p.length>1)path(b,p,color,width,alpha)}
  // Procedural luminous nebulae: every cloud drifts; no background image is used.
  for(let i=0;i<7;i++){const cx=w*(.5+.5*Math.sin(i*2.7+t*.025)),yy=h*(.5+.5*Math.cos(i*3.4+t*.018)),r=w*(.25+.08*Math.sin(t*.1+i)),gr=b.createRadialGradient(cx,yy,0,cx,yy,r);gr.addColorStop(0,s===2?'#21385844':i%2?'#27285d55':'#09465450');gr.addColorStop(1,'#02061100');b.fillStyle=gr;b.fillRect(0,0,w,h);}
  // Perspective coordinate volume and travelling lights.
  for(let k=-8;k<=8;k++){line3([[k*2,-5,-22],[k*2,-5,17]],'#3d8ab1',.5,.17);line3([[-17,-5,k*3],[17,-5,k*3]],'#5281bc',.5,.17);if(k%2===0)line3([[k*2,-5,-20],[k*2,12,-20]],'#6e75af',.45,.13);}
  b.globalCompositeOperation='lighter';for(let i=0;i<210;i++){const z=18-((rand(i)*62+t*(s===0?1.25:.65))%62),p=project((rand(i+300)-.5)*42,(rand(i+600)-.45)*24,z);if(!p)continue;const r=clamp(p[2]/38)*1.6+.15;b.globalAlpha=.18+.55*rand(i+12);b.fillStyle=i%4?ice:gold;b.beginPath();b.arc(p[0],p[1],r,0,TAU);b.fill();}b.globalAlpha=1;b.globalCompositeOperation='source-over';
  // Sixteen independent 3D light filaments; form changes with the mathematical act.
  for(let j=0;j<18;j++){const pts=[];for(let i=0;i<=105;i++){const a=i/105,x=(a-.5)*38;let y,z;
   if(s===2){const th=a*TAU*2.25-t*.42+j*.021,r=(1-a)*10+.45;y=2+Math.sin(th)*r+j*.035;z=-7+Math.cos(th)*r;pts.push(project(5+Math.cos(th)*r,y,z));continue;}
   if(s===3){y=2.4*Math.cos(a*TAU*1.15+t*.48+j*.045)+j*.10-1.5;z=-5+5*Math.sin(a*TAU+j*.12+t*.09);}
   else if(s===4){const converge=ease((u-.15)/.45);y=(j%3-1)*5*(1-converge)+Math.sin(a*TAU*1.15-t*.65+j*.03)*(1.7+converge);z=-4+(j-9)*.28*(1-converge)+3*Math.cos(a*TAU-t*.2);}
   else {y=2.1*Math.sin(a*TAU*1.45-t*.55+j*.065)+(j-9)*.14;z=-6+4*Math.cos(a*TAU+t*.16+j*.11);if(s===1)y+=(a<.5?-1:1)*(j%2?1:-1)*ease(u)*1.5;}
   pts.push(project(x,y,z));}
   const p=pts.filter(Boolean);glow(b,p,s===2?(j%3?gold:orange):j%3===0?gold:j%3===1?ice:violet,j%6===0?1.7:.72,j%6===0?1.6:.9);
  }
  // Nodes, triangulated geometry, and a rotating wave surface.
  if(s===3||s===4){for(let j=0;j<11;j++){const pts=[];for(let i=0;i<30;i++){const x=(i-15)*.75,z=(j-5)*.85,y=-2+1.4*Math.sin(x*.52+t*.8)*Math.exp(-z*z/30);pts.push([x,y,z]);}line3(pts,j%3?ice:violet,.7,.5);}for(let i=0;i<21;i++){const x=(i-10)*1.05,pts=[];for(let j=0;j<14;j++){const z=(j-7)*.72;pts.push([x,-2+1.4*Math.sin(x*.52+t*.8)*Math.exp(-z*z/30),z]);}line3(pts,gold,.4,.25);}}
  for(let i=0;i<20;i++){const a=i*.56+t*.11,r=9+2*Math.sin(i),p=project(r*Math.cos(a),r*.65*Math.sin(a),-8+3*Math.sin(i+t*.12)),p2=project(r*Math.cos(a+.56),r*.65*Math.sin(a+.56),-8+3*Math.sin(i+1+t*.12));if(!p||!p2)continue;path(b,[p,p2],violet,.7,.22);b.strokeStyle='#a69fff77';b.beginPath();b.arc(p[0],p[1],2.1,0,TAU);b.stroke();}
  // Correct KaTeX fragments float in the same perspective coordinate volume.
  for(let i=0;i<14;i++){const a=i*.7+t*.038,z=-10+9*Math.sin(a*.7),p=project(14*Math.cos(a),8*Math.sin(a),z);if(!p)continue;b.save();b.globalAlpha=.13+.09*rand(i);const key=['intSymbol','sumSymbol','sine','cosIntegral','diff'][i%5];drawMath(b,make,key,p[0],p[1],Math.min(35,p[2]*.85),i%2?ice:violet);b.restore();}
  if(q.collision>.015){const p=project(0,0,0),r=(1-q.collision)*w*.7;b.save();b.globalCompositeOperation='lighter';b.strokeStyle=gold;b.globalAlpha=q.collision*.8;b.lineWidth=2;b.beginPath();b.ellipse(p[0],p[1],Math.max(2,r),Math.max(2,r*.38),-.1,0,TAU);b.stroke();b.restore();}
 }
 function graph(mode){const gx=portrait?150:450,gy=portrait?1080:685,gw=portrait?780:1020,gh=portrait?260:220,ox=gx,oy=gy+gh*.66,scaleX=gw/(TAU+.3),scaleY=gh*.27;g.save();
  const map=(x,y)=>[ox+x*scaleX,oy-y*scaleY];
  const gr=g.createLinearGradient(gx,gy,gx,gy+gh+30);gr.addColorStop(0,'#02081533');gr.addColorStop(.4,'#020815d0');gr.addColorStop(1,'#02081533');g.fillStyle=gr;g.fillRect(gx-45,gy-30,gw+95,gh+65);
  for(let x=0;x<6.5;x+=Math.PI/2)path(g,[map(x,-1.3),map(x,2.2)],'#497f9a',1,.22);for(let y=-1;y<=2;y++)path(g,[map(0,y),map(6.3,y)],'#497f9a',1,.22);
  glow(g,[map(0,0),map(6.45,0)],ice,1,.5);path(g,[map(0,-1.3),map(0,2.3)],ice,1,.6);
  const end=q.x,dx=.12,pts=[];for(let i=0;i<=130;i++){const t=TAU*i/130;pts.push(map(t,mode==='kernel'?kernel(end,t)*.6:mode==='function'?1-Math.cos(t):Math.sin(t)));}glow(g,pts,mode==='function'?violet:mode==='kernel'?ice:gold,2,1);
  text(mode==='kernel'?'t':'x',gx+gw+20,oy+15,23,ice);text('0',gx-16,oy+24,22,ice);text('π',...map(Math.PI,-.42),23,ice);text('2π',...map(TAU,-.42),23,ice);
  if(mode==='kernel'){
   // Signed area under the parameter-dependent integrand; the endpoint height is exactly zero.
   const area=[map(0,0)];for(let i=0;i<=100;i++){const t=end*i/100;area.push(map(t,kernel(end,t)*.6));}area.push(map(end,0));g.fillStyle='#9aaec015';g.beginPath();area.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fill();
   const next=[];for(let i=0;i<=100;i++){const t=end*i/100;next.push(map(t,kernel(end+dx,t)*.6));}path(g,next,ice,1.6,.8);const band=[...next];for(let i=100;i>=0;i--){const t=end*i/100;band.push(map(t,kernel(end,t)*.6));}g.fillStyle='#71dcff88';g.beginPath();band.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fill();const ep=map(end,0);glow(g,[[ep[0],gy-10],[ep[0],gy+gh]],gold,1.3,.9);g.fillStyle=red;g.beginPath();g.arc(...ep,5+2*Math.sin(q.t*3),0,TAU);g.fill();text(`x = ${end.toFixed(2)}`,ep[0],gy+gh+35,24,gold);text('端点の高さ = 0',gx+gw-10,gy-22,24,red,'right');
   // Thin new interval has area O(dx²), distinct from the O(dx) change across the existing interval.
   const strip=[map(end,0)];for(let i=0;i<=12;i++){const t=end+dx*i/12;strip.push(map(t,kernel(end+dx,t)*.6));}strip.push(map(end+dx,0));g.fillStyle='#ffdb9188';g.beginPath();strip.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fill();path(g,strip,gold,2,.9);
  }else{const pos=ease(q.u)*TAU,p=map(pos,mode==='function'?1-Math.cos(pos):Math.sin(pos));g.fillStyle=mode==='function'?violet:gold;g.beginPath();g.arc(...p,5,0,TAU);g.fill();}
  g.restore();
 }
 function render(t){q=state(t,portrait);bounds=[];background();g.clearRect(0,0,W,H);g.drawImage(bg,0,0,W,H);
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#020713b0');gr.addColorStop(.35,'#02071396');gr.addColorStop(.65,'#02071308');gr.addColorStop(1,'#020713e8');g.fillStyle=gr;g.fillRect(0,0,W,H);
  const {s,u,phase}=q,cx=W/2,Y=portrait?430:240,step=portrait?145:135,fs=portrait?74:78;let caption='',sub='';
  if(s>0&&s<4)text(['','01  分解して微分','02  積分して微分','03  上端と中身を微分'][s],cx,portrait?240:83,portrait?31:29,[ice,ice,gold,violet][s]);
  if(s===0){
   const reveal=ease(u*4);math(portrait?'sourceP':'source',cx,portrait?620:410,portrait?83:101,white,W-150,reveal);
   if(portrait)math('fx',cx,430,75,ice,W-160,reveal);
   for(let j=0;j<3;j++){const a=(j-1)*.7,amount=ease((u-.35)/.55),sx=cx,sy=portrait?900:560,pts=[];for(let i=0;i<=60;i++){const f=i/60;pts.push([sx+(j-1)*f*(portrait?310:650)*amount,sy+f*(portrait?280:200)*amount+Math.sin(f*TAU+q.t)*20*f]);}glow(g,pts,[ice,gold,violet][j],3,amount);}
   caption='ひとつの積分。３つの道。';sub='積分変数は t。x は、動く上端とパラメータ。';
  }
  if(s===1){
   if(phase===0){math('fx',cx,Y,fs,white);const im=mathMetrics('cosIntegral',fs),xm=mathMetrics('x',fs),gap=fs*.18,total=im.width+xm.width+gap,join=ease(u/.23),jump=Math.sin(join*Math.PI);math('cosIntegral',cx+(xm.width+gap)/2,portrait?650:420,fs,ice);math('x',cx-total/2+xm.width/2-(1-join)*90,(portrait?650:420)-jump*80,fs,gold);math('splitB',cx,portrait?900:650,fs,orange);caption='x は定数として、積分の外へ。';sub='(x − t) cos t を、２つの積分に分ける。';}
   else if(phase===1){const sweep=clamp((u-.23)/.16);g.save();g.strokeStyle=ice;g.globalAlpha=Math.sin(sweep*Math.PI)*.8;g.lineWidth=2;g.beginPath();g.ellipse(W*.15+W*.7*sweep,Y+step,portrait?35:55,portrait?230:200,0,0,TAU);g.stroke();g.restore();math('leftDerivative',cx,Y,fs,ice);const v=clamp((u-.23)/.31),move=ease((v-.25)/.6),sep=(portrait?250:430)*(1-move),a=1-ease((v-.79)/.2);math('plus',cx-sep,Y+step*1.3,portrait?61:75,gold,W-160,a);math('minus',cx+sep,Y+step*2.1-(step*.8*move),portrait?61:75,orange,W-160,a);if(q.collision>.15){g.save();g.globalAlpha=q.collision;glow(g,[[cx-350,Y+step*1.3],[cx+350,Y+step*1.3]],gold,3,1);g.restore();}caption='積の微分で生まれる項が、相殺する。';sub='+x cos x と −x cos x が消える。';}
   else if(phase===2){math('leftDerivative',cx,portrait?520:320,fs,ice);math('fundamental',cx,portrait?760:560,portrait?47:65,gold,W-150);caption='残るのは、cos t の定積分。';sub='微積分の基本定理で、sin x へ。';}
   else{math('result',cx,Y+step,portrait?104:120,gold);caption='分解して微分すると、sin x。';sub='相殺のあとに、ひとつの波が残る。';}if(phase>0)graph('sine');
  }
  if(s===2){
   if(phase===0){const spin=Math.sin(u/.27*TAU)*55;math('u',cx-(portrait?130:350),Y,portrait?57:72,ice);math('dv',cx+(portrait?100:340),Y+step*.75,portrait?57:72,gold);math('du',cx-(portrait?120:340)+spin,Y+step*1.6,portrait?57:72,violet);math('v',cx+(portrait?120:350)-spin,Y+step*2.4,portrait?57:72,orange);caption='t で部分積分する。x は定数。';sub='u = x − t を微分、cos t を積分する。';}
   else if(phase===1){math(portrait?'partsP':'parts',cx,Y,portrait?58:74,gold,W-120);math('upper',cx,Y+step*1.2,portrait?44:56,ice,W-130);math('lower',cx,Y+step*2.2,portrait?48:60,orange,W-130);caption='上端 t = x と、下端 t = 0 を代入。';sub='上端は −cos x、下端は −1。';}
   else if(phase===2){math(portrait?'function':'evaluated',cx,Y+step*.4,portrait?84:81,violet);math('diff',cx,Y+step*1.8,80,gold);caption='積分したあとで、x で微分する。';sub='F(x) = 1 − cos x の傾きを取り出す。';}
   else{math('result',cx,Y+step,portrait?104:120,gold);caption='先に積分しても、sin x。';sub='1 − cos x の微分が、sin x。';}graph(phase<3?'function':'sine');
  }
  if(s===3){
   if(phase===0){math('leibnizA',cx,portrait?430:220,portrait?68:78,ice);math('leibnizB',cx,portrait?680:480,portrait?51:73,gold,W-130);math('kernel',cx,portrait?900:640,portrait?57:48,violet);caption='上端の移動と、中身の変化を分ける。';sub='金：新しい区間　青：もとの区間の変化';}
   else if(phase===1){if(u<.45){math(portrait?'plugA':'plug',cx,portrait?430:220,portrait?66:70,ice,W-130);if(portrait)math('plusIntegral',cx,570,66,gold,W-130);}else math('leftDerivative',cx,portrait?430:220,portrait?71:82,ice);const vanish=1-ease((u-.45)/.13);math('endpointZero',cx,portrait?770:Y+step*1.15,portrait?70:83,red,W-130,vanish);math('partial',cx,portrait?940:Y+step*2.3,portrait?45:57,gold,W-120);caption='端点の寄与は、(x − x) cos x = 0。';sub='中身の偏微分は cos t。こちらは残る。';}
   else if(phase===2){math('leftDerivative',cx,portrait?550:280,portrait?79:82,ice);math('fundamental',cx,portrait?800:535,portrait?46:64,gold,W-140);caption='上端の高さはゼロ。中身の変化を積分する。';sub='新しい小区間の寄与は、微分の極限でゼロ。';}
   else{math('result',cx,Y+step,portrait?104:120,gold);caption='直接微分しても、sin x。';sub='上端だけでなく、被積分関数の x も微分する。';}graph(phase<3?'kernel':'sine');
  }
  if(s===4){
   const merge=ease((u-.15)/.43);if(u<.65){for(let i=0;i<3;i++){const x=cx+(portrait?0:(i-1)*560)*(1-merge),y=(portrait?430+i*210:390)+(portrait?(730-(430+i*210))*merge:(i===1?0:80)*(1-merge));math('result',x,y,portrait?76:68,[ice,gold,violet][i],portrait?900:550);if(merge<.18)text(['① 分解して微分','② 積分して微分','③ 上端と中身を微分'][i],x,y+(portrait?90:110),portrait?26:25,[ice,gold,violet][i]);}}
   else math('resultBox',cx,portrait?690:410,portrait?110:144,gold,W-160);
   if(u>.5)graph('sine');caption=u<.6?'３つの道が、ひとつの答えへ。':'積分と微分は、ひとつの波でつながる。';sub='分解・部分積分・上端と中身の微分';
  }
  if(q.collision>.05){g.save();g.globalCompositeOperation='lighter';const burstY=s===4?(portrait?730:410):s===3?(portrait?770:Y+step*1.15):Y+step*1.3;for(let i=0;i<75;i++){const a=rand(i)*TAU,r=(1-q.collision)*(80+rand(i+100)*420),x=cx+Math.cos(a)*r,y=burstY+Math.sin(a)*r*.55;g.globalAlpha=q.collision*.8;g.fillStyle=s===3?red:gold;g.beginPath();g.arc(x,y,1+rand(i+50)*3,0,TAU);g.fill();}g.globalAlpha=q.collision;g.strokeStyle=s===3?red:gold;g.lineWidth=2;g.beginPath();g.ellipse(cx,burstY,20+(1-q.collision)*500,10+(1-q.collision)*140,0,0,TAU);g.stroke();g.restore();g.save();g.globalAlpha=q.collision*.065;g.fillStyle=gold;g.fillRect(0,0,W,H);g.restore();}
  text(caption,cx,portrait?1485:985,portrait?32:32,white);text(sub,cx,portrait?1560:1034,portrait?25:23,ice);
  const fade=ease(q.t/.45)*ease((q.duration-q.t)/.5);g.fillStyle=`rgba(2,6,17,${1-fade})`;g.fillRect(0,0,W,H);
  return {q,bounds:[...bounds]};
 }
 return{canvas,render};
}
