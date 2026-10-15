import katex from 'katex';
import './style.css';
import {getScene,sourceTime} from './story.js';
import {soundtrack} from './sound.js';
import {createImageSpace} from './ImageSpace.js';
const q=new URLSearchParams(location.search), edition=q.get('edition'), render=q.has('render');
document.querySelectorAll('[data-play]').forEach(b=>b.addEventListener('click',async()=>{try{await document.getElementById(b.dataset.play).play();}catch{b.textContent='動画の再生ボタンを押してください';}}));
if(edition) startCinema();
function startCinema(){
 const portrait=edition==='instagram',duration=portrait?30:90;
 const $=id=>document.getElementById(id), root=$('cinema'),canvas=$('space'),background=createImageSpace(canvas,portrait), graph=$('graph'),g=graph.getContext('2d');
 $('library').hidden=true;root.hidden=false;root.classList.toggle('portrait',portrait);root.classList.toggle('render',render);
 let w=innerWidth,h=innerHeight,lastScene='',time=0,playing=false,previous=0,audio=null,audioNode=null, audioBuffer=null;
 const colors={cyan:'#73f4e7',gold:'#ffdc94',pink:'#ffa3cb'};
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
 function resize(){w=innerWidth;h=innerHeight;background.resize(w,h);graph.width=Math.round(graph.clientWidth);graph.height=Math.round(graph.clientHeight);if(window.cinemaRender)frame(time);}
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
 function space(t,p){background.frame(t,root.dataset.scene,p);}
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
  root.dataset.scene=s.id;space(time,p);drawGraph(s,p,time);$('meter').style.width=`${time/duration*100}%`;$('seek').value=String(time);$('time').textContent=`${time.toFixed(1)} / ${duration}`;root.dataset.sourceTime=String(st);root.dataset.scene=s.id;
 }
 async function play(){if(!audio){audio=new AudioContext();audioBuffer=await audio.decodeAudioData(await soundtrack(duration,false));}await audio.resume();if(audioNode)audioNode.stop();if(time>=duration)time=0;audioNode=audio.createBufferSource();audioNode.buffer=audioBuffer;audioNode.connect(audio.destination);audioNode.start(0,time);playing=true;previous=performance.now();$('start').textContent='▶ 再生';}
 function stop(){playing=false;if(audioNode){try{audioNode.stop();}catch{}audioNode=null;}}
 $('start').onclick=play;$('pause').onclick=stop;$('seek').max=String(duration);$('seek').oninput=()=>{stop();frame(Number($('seek').value));};
 function loop(now){if(playing){const next=time+(now-previous)/1000;frame(next);if(next>=duration)stop();}previous=now;requestAnimationFrame(loop);}
 window.cinemaRender={frame,audio:()=>soundtrack(duration,true),duration,portrait,scene:()=>root.dataset.scene};
 window.addEventListener('resize',resize);resize();frame(0);window.cinemaBackgroundReady=background.ready.then(()=>frame(time));if(!render)requestAnimationFrame(loop);
}
