import katex from 'katex';
import './style.css';
import {getScene,sourceTime} from './story.js';
import {soundtrack} from './sound.js';
const q=new URLSearchParams(location.search), edition=q.get('edition'), render=q.has('render');
document.querySelectorAll('[data-play]').forEach(b=>b.addEventListener('click',async()=>{try{await document.getElementById(b.dataset.play).play();}catch{b.textContent='動画の再生ボタンを押してください';}}));
if(edition) startCinema();
function startCinema(){
 const portrait=edition==='instagram',duration=portrait?30:90;
 const $=id=>document.getElementById(id), root=$('cinema'),canvas=$('space'),ctx=canvas.getContext('2d'), graph=$('graph'),g=graph.getContext('2d');
 $('library').hidden=true;root.hidden=false;root.classList.toggle('portrait',portrait);root.classList.toggle('render',render);
 let w=innerWidth,h=innerHeight,lastScene='',time=0,playing=false,previous=0,audio=null,audioNode=null, audioBuffer=null;
 const colors={cyan:'#73f4e7',gold:'#ffdc94',pink:'#ffa3cb'};
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
 function resize(){w=innerWidth;h=innerHeight;canvas.width=w;canvas.height=h;graph.width=Math.round(graph.clientWidth);graph.height=Math.round(graph.clientHeight);if(window.cinemaRender)frame(time);}
 const formula=(tex)=>katex.renderToString(tex,{throwOnError:true,output:'html',displayMode:true});
 function updateScene(s){
  $('chapter').textContent=s.chapter;$('heading').textContent=s.title;$('caption').textContent=s.caption;$('graph-label').textContent=s.label;
  $('condition').textContent=['law','proof','ending'].includes(s.id)?'f は連続、a は定数。F は f の原始関数。':'定積分と微分法 ／ 数学Ⅲ';
  $('equations').innerHTML=s.lines.map(([tex,color])=>`<div class="eq ${color}">${formula(tex)}</div>`).join('');
  if(s.id==='cancel')$('equations').insertAdjacentHTML('beforeend',`<div class="cancel-pair"><div id="plus" class="eq cancel-term">${formula('+x\\cos x')}</div><div id="minus" class="eq cancel-term">${formula('-x\\cos x')}</div></div><div id="cancel-result" class="eq gold">${formula('=\\int_0^x\\cos t\\,dt')}</div>`);
  if(portrait&&s.id==='law'){
   $('equations').innerHTML=`<div class="eq cyan">${formula('\\frac{d}{dx}\\int_a^x f(t)\\,dt')}</div><div class="eq gold">${formula('=f(x)')}</div><div class="eq small">${formula('a\\text{ は定数},\\quad f\\text{ は連続}')}</div>`;
  }
  if(portrait&&s.id==='challenge')$('equations').innerHTML=`<div class="eq cyan">${formula('F(x)=')}</div><div class="eq cyan">${formula('\\int_0^x(x-t)\\cos t\\,dt')}</div><div class="eq gold">${formula("F'(x)=\\;?")}</div>`;
  // Fit the actual KaTeX glyph extent, rather than relying on text length.
  for(const el of $('equations').querySelectorAll('.eq')){
   const base=parseFloat(getComputedStyle(el).fontSize), available=el.closest('.cancel-pair')?$('equations').clientWidth*.46:$('equations').clientWidth;
   const glyph=el.querySelector('.katex-html'),actual=glyph?.getBoundingClientRect().width||0;
   if(actual>available)el.style.fontSize=`${base*available/actual*.98}px`;
  }
 }
 function project(x,y,z,t){const angle=.12*Math.sin(t*.09),xx=x*Math.cos(angle)+z*Math.sin(angle),zz=z*Math.cos(angle)-x*Math.sin(angle);const k=650/(zz+850);return [w*.5+xx*k*w/1920,h*.47+y*k*h/1080,k];}
 function space(t,p){
  ctx.fillStyle='#030713';ctx.fillRect(0,0,w,h);const glow=ctx.createRadialGradient(w*.45,h*.45,0,w*.45,h*.45,w*.75);glow.addColorStop(0,'#10334c');glow.addColorStop(.5,'#071524');glow.addColorStop(1,'#030713');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  const move=t*65;
  // Rotating, perspective-projected rings and particles occupy real XYZ space.
  for(let ring=0;ring<14;ring++){const z=((ring*360-move)%5040+5040)%5040-350;ctx.beginPath();for(let j=0;j<=64;j++){const a=j/64*Math.PI*2+.08*t,pt=project(950*Math.cos(a),520*Math.sin(a),z,t);if(j===0)ctx.moveTo(pt[0],pt[1]);else ctx.lineTo(pt[0],pt[1]);}ctx.strokeStyle=`rgba(78,201,210,${.07+.13*(1-(z+350)/5040)})`;ctx.lineWidth=Math.max(1,w/1600);ctx.stroke();}
  for(let i=0;i<210;i++){const x=Math.sin(i*127.1)*1900,y=Math.cos(i*71.3)*1100,z=((i*73-move*(.7+i%3*.2))%5200+5200)%5200-250;const [sx,sy,k]=project(x,y,z,t);ctx.fillStyle=i%7===0?'#f9d48f':'#77e8df';ctx.globalAlpha=clamp(k*.7)*(.7+.3*Math.sin(t*2+i));ctx.beginPath();ctx.arc(sx,sy,Math.max(.6,k*2.2*w/1920),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  const symbols=['∫','f(x)','dx','sin x','Δx','d/dx'];
  for(let i=0;i<22;i++){const a=i*2.4+t*.11,z=((i*277-move*.8)%4000+4000)%4000-250;const [sx,sy,k]=project(1600*Math.cos(a),1000*Math.sin(a),z,t);if(sx>w*.05&&sx<w*.86&&sy>h*.13&&sy<h*.78)continue;ctx.save();ctx.translate(sx,sy);ctx.rotate(.12*Math.sin(a));ctx.globalAlpha=Math.min(.4,k*.3);ctx.font=`italic ${Math.max(15,k*46*w/1920)}px serif`;ctx.fillStyle=i%3===0?'#edcc8f':'#6dccd6';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=12;ctx.fillText(symbols[i%6],0,0);ctx.restore();}
  // A luminous ribbon orbits below the instructional content.
  ctx.beginPath();for(let i=0;i<170;i++){const x=i/169*w,yy=h*(portrait?.84:.94)+Math.sin(i*.055-t*1.4)*h*.025; i?ctx.lineTo(x,yy):ctx.moveTo(x,yy);}ctx.strokeStyle='#36bdc75c';ctx.lineWidth=2;ctx.shadowColor='#31f1e5';ctx.shadowBlur=10;ctx.stroke();ctx.shadowBlur=0;
  const wash=1-ease(p/.07);if(wash>0){ctx.fillStyle=`rgba(100,212,218,${wash*.06})`;ctx.fillRect(0,0,w,h);}
 }
 function drawGraph(s,p,t){
  const W=graph.width,H=graph.height;g.clearRect(0,0,W,H);const left=W*.1,right=W*.94,top=H*.09,bottom=H*.85;
  const mode=s.graph,exp=mode==='exp',xmax=exp?1.6:Math.PI*2, ymin=exp?-.8:-1.65,ymax=exp?8:1.65;
  const px=x=>left+x/xmax*(right-left),py=y=>bottom-(y-ymin)/(ymax-ymin)*(bottom-top),zero=py(0);
  const f=u=>exp?u*Math.exp(u):mode==='cosine'?Math.cos(u):mode==='kernel'?(x-u)*Math.cos(u):Math.sin(u);
  const x=mode==='limit'?1.0+.7*ease(p):(.3+.6*ease(p))*xmax;
  g.lineWidth=1;g.strokeStyle='#4e748c40';for(let i=0;i<5;i++){const xx=left+i/4*(right-left);g.beginPath();g.moveTo(xx,top);g.lineTo(xx,bottom);g.stroke();}
  for(let i=0;i<5;i++){const yy=top+i/4*(bottom-top);g.beginPath();g.moveTo(left,yy);g.lineTo(right,yy);g.stroke();}
  g.strokeStyle='#849bb899';g.beginPath();g.moveTo(left,top);g.lineTo(left,bottom);g.moveTo(left,zero);g.lineTo(right,zero);g.stroke();
  if(['area','strip','limit','duality','kernel'].includes(mode)){
   g.beginPath();g.moveTo(px(0),zero);for(let i=0;i<=100;i++){const xx=x*i/100;g.lineTo(px(xx),py(f(xx)));}g.lineTo(px(x),zero);g.closePath();const fill=g.createLinearGradient(0,top,0,bottom);fill.addColorStop(0,'#4ff6d84d');fill.addColorStop(1,'#5ccada0c');g.fillStyle=fill;g.fill();
  }
  if(['strip','limit'].includes(mode)){
   const dx=mode==='limit'?.9*(1-ease(p))+.035:.24+.06*Math.sin(t*1.5);g.fillStyle='#ffdc9470';g.fillRect(px(x),py(f(x)),Math.max(2,px(x+dx)-px(x)),zero-py(f(x)));g.strokeStyle=colors.gold;g.strokeRect(px(x),py(f(x)),Math.max(2,px(x+dx)-px(x)),zero-py(f(x)));
  }
  g.save();g.beginPath();g.rect(left,top,right-left,bottom-top);g.clip();g.beginPath();for(let i=0;i<=200;i++){const xx=xmax*i/200,yy=f(xx);i?g.lineTo(px(xx),py(yy)):g.moveTo(px(xx),py(yy));}g.strokeStyle=colors.cyan;g.lineWidth=Math.max(2,W/180);g.shadowColor=colors.cyan;g.shadowBlur=9;g.stroke();
  if(mode==='duality'){g.beginPath();for(let i=0;i<=200*ease(p);i++){const u=xmax*i/200;i?g.lineTo(px(u),py(f(u))):g.moveTo(px(u),py(f(u)));}g.strokeStyle=colors.gold;g.shadowColor=colors.gold;g.stroke();}g.restore();
  g.strokeStyle='#ffdf9bc0';g.setLineDash([4,5]);g.beginPath();g.moveTo(px(x),zero);g.lineTo(px(x),py(f(x)));g.stroke();g.setLineDash([]);g.fillStyle=colors.gold;g.shadowColor=colors.gold;g.shadowBlur=15;g.beginPath();g.arc(px(x),py(f(x)),Math.max(3,W*.012)*(1+.1*Math.sin(t*5)),0,Math.PI*2);g.fill();g.shadowBlur=0;
  g.font=`${Math.max(12,W*.038)}px sans-serif`;g.fillStyle='#b1c9dc';g.fillText('0',left-14,zero+16);g.fillText(exp?'1.6':'2π',right-18,zero+17);g.fillStyle=colors.gold;g.fillText('x',px(x)-3,bottom+14);
 }
 function frame(t){time=clamp(t,0,duration);const st=sourceTime(time,portrait),s=getScene(st),p=(st-s.start)/(s.end-s.start);if(s.id!==lastScene){updateScene(s);lastScene=s.id;}
  const arrive=ease(p/.10),shift=(1-arrive)*(portrait?12:24);$('equations').style.transform=`translateY(${shift}px)`;$('equations').style.opacity=String(.25+.75*arrive);
  $('equations').style.filter=`brightness(${1+.035*Math.sin(time*4.8)})`;
  if(s.id==='cancel'){
   const appear=ease(p/.14),strike=ease((p-.35)/.22),vanish=ease((p-.65)/.15);
   document.querySelectorAll('.cancel-term').forEach((el,i)=>{el.style.setProperty('--strike',strike);el.style.opacity=String(appear*(1-vanish));el.style.transform=`translateX(${(1-appear)*(i?45:20)+(i?-1:1)*vanish*12}px)`;});
   $('cancel-result').style.opacity=String(ease((p-.72)/.18));
  }
  space(time,p);drawGraph(s,p,time);$('meter').style.width=`${time/duration*100}%`;$('seek').value=String(time);$('time').textContent=`${time.toFixed(1)} / ${duration}`;root.dataset.sourceTime=String(st);root.dataset.scene=s.id;
 }
 async function play(){if(!audio){audio=new AudioContext();audioBuffer=await audio.decodeAudioData(await soundtrack(duration,false));}await audio.resume();if(audioNode)audioNode.stop();if(time>=duration)time=0;audioNode=audio.createBufferSource();audioNode.buffer=audioBuffer;audioNode.connect(audio.destination);audioNode.start(0,time);playing=true;previous=performance.now();$('start').textContent='▶ 再生';}
 function stop(){playing=false;if(audioNode){try{audioNode.stop();}catch{}audioNode=null;}}
 $('start').onclick=play;$('pause').onclick=stop;$('seek').max=String(duration);$('seek').oninput=()=>{stop();frame(Number($('seek').value));};
 function loop(now){if(playing){const next=time+(now-previous)/1000;frame(next);if(next>=duration)stop();}previous=now;requestAnimationFrame(loop);}
 window.cinemaRender={frame,audio:()=>soundtrack(duration,true),duration,portrait,scene:()=>root.dataset.scene};
 window.addEventListener('resize',resize);resize();frame(0);if(!render)requestAnimationFrame(loop);
}
