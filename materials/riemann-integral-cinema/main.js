import './style.css';
import classroomURL from './assets/classroom-sunset.png';
import chalkURL from './assets/chalk-cinema.png';
import referenceURL from './assets/reference-parts.png';
import katex from 'katex';
import {functions,calculate} from './math.js';
import {stateAt} from './timeline.js';
import {drawWorld,createFormulaTargets} from './world.js';
const $=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d'),preview=$('preview'),pctx=preview.getContext('2d');
const referenceImage=new Image();referenceImage.src=referenceURL;window.referenceBackgroundReady=referenceImage.decode();await window.referenceBackgroundReady;
const classroomImage=new Image(),chalkImage=new Image();classroomImage.src=classroomURL;chalkImage.src=chalkURL;window.classroomBackgroundReady=Promise.all([classroomImage.decode(),chalkImage.decode()]);await window.classroomBackgroundReady;
const filmDuration=()=>background==='reference'&&effect==='living'?24:120;
let background='classroom',effect='auto',labSplitAt=-10;
const camera={mode:'cinematic',yaw:0,pitch:0,zoom:1,mirror:false,gather:0,time:0};
const visualOptions=()=>({background,effect,referenceImage,classroomImage,chalkImage,camera});
let targets=[],labTargets=[];const factory=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
let data=calculate('wave',0,4,4),flat=false,auto=false,filmPlaying=false,filmTime=0,last=0,elapsed=0,lastAuto=0;
Object.entries(functions).forEach(([key,v])=>{const option=document.createElement('option');option.value=key;option.textContent=`f(x) = ${v.label}`;$('fn').append(option)});
function formula(){katex.render(`\\Delta x=\\frac{b-a}{n},\\quad S_{${data.n}}=\\sum_{k=1}^{${data.n}}f(x_k)\\Delta x`,$('formula'),{throwOnError:false});$('formula').hidden=!$('showFormula').checked;}
function update(){try{const next=calculate($('fn').value,Number($('a').value),Number($('b').value),Number($('n').value));if(next.n!==data.n)labSplitAt=elapsed;data=next;$('error').textContent='';$('nLabel').textContent=data.n;$('dx').textContent=data.dx.toFixed(6);$('sum').textContent=data.sum.toFixed(6);$('exact').textContent=data.exact.toFixed(6);$('difference').textContent=(data.error>=0?'+':'')+data.error.toFixed(6);formula()}catch(e){auto=false;$('auto').textContent='▶ 自動で細分化';$('error').textContent=e.message}}
['fn','a','b','n'].forEach(id=>$(id).addEventListener('input',()=>{auto=false;$('auto').textContent='▶ 自動で細分化';update()}));
document.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{$('n').value=b.dataset.n;update()});
$('auto').onclick=()=>{auto=!auto;if(auto&&data.n>=1000){$('n').value=1;update()}$('auto').textContent=auto?'Ⅱ 一時停止':'▶ 自動で細分化'};
$('view').onclick=()=>{flat=!flat;$('view').textContent=flat?'3Dに切替':'2Dに切替';$('view').setAttribute('aria-pressed',flat);$('viewLabel').textContent=flat?'2D':'3D'};
$('showFormula').onchange=formula;
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab-panel').forEach(e=>e.hidden=e.id!==b.dataset.tab);document.querySelectorAll('[data-tab]').forEach(e=>e.classList.toggle('active',e===b));if(b.dataset.tab!=='cinema'){filmPlaying=false;$('playFilm').textContent='▶ 再生'}resize()});
$('filmTime').oninput=()=>{filmTime=Number($('filmTime').value);drawPreview()};
$('playFilm').onclick=()=>{filmPlaying=!filmPlaying;if(filmTime>=filmDuration())filmTime=0;$('playFilm').textContent=filmPlaying?'Ⅱ 一時停止':'▶ 再生'};
document.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{if(effect==='living'){$('effect').value='auto';effect='auto';$('filmTime').max=120}filmTime=Number(b.dataset.time);$('filmTime').value=filmTime;drawPreview()});
function resize(){const ratio=Math.min(devicePixelRatio||1,1.7);for(const c of [canvas,preview]){const r=c.getBoundingClientRect();if(r.width&&r.height){c.width=Math.round(r.width*ratio);c.height=Math.round(r.height*ratio)}}if(preview.width)targets=createFormulaTargets(factory,preview.width,preview.height,false);if(canvas.width)labTargets=createFormulaTargets(factory,canvas.width,canvas.height,false);drawPreview()}
function drawPreview(){if(!$('cinema').hidden&&preview.width){drawWorld(pctx,preview.width,preview.height,stateAt(filmTime),{formulaTargets:targets,...visualOptions()});$('timeLabel').value=`${filmTime.toFixed(1)} / ${filmDuration()}s`;}}
function frame(now){const dt=last?Math.min(.1,(now-last)/1000):0;last=now;elapsed+=dt;camera.time=elapsed;if(!$('explore').hidden){if(auto&&now-lastAuto>140){$('n').value=Math.min(1000,data.n+Math.max(1,Math.ceil(data.n*.09)));update();lastAuto=now;if(data.n===1000){auto=false;$('auto').textContent='▶ 自動で細分化'}}const s=stateAt(60);Object.assign(s,{time:elapsed,data,n:data.n,previous:data.n,splitT:Math.min(1,Math.max(0,(elapsed-labSplitAt)/.7)),rectReveal:1,crystal:0,curveReveal:1,formation:0,tunnel:0,gridLevel:Math.min(64,data.n),yaw:.16*Math.sin(elapsed*.16),pitch:.07*Math.cos(elapsed*.11)});drawWorld(ctx,canvas.width,canvas.height,s,{cinema:false,flat,formulaTargets:labTargets,...visualOptions()})}if(!filmPlaying&&!$('cinema').hidden&&camera.mode!=='still')drawPreview();if(filmPlaying){filmTime=Math.min(filmDuration(),filmTime+dt);$('filmTime').value=filmTime;drawPreview();if(filmTime===filmDuration()){filmPlaying=false;$('playFilm').textContent='▶ 再生'}}requestAnimationFrame(frame)}
document.querySelectorAll('[data-tex]').forEach(el=>katex.render(el.dataset.tex.replaceAll('\\\\','\\'),el,{displayMode:true,throwOnError:false}));
window.riemann={stateAt,calculate,drawAt:(t,portrait=false)=>{const s=stateAt(t,portrait);return drawWorld(pctx,preview.width,preview.height,s,{formulaTargets:targets,...visualOptions()})},getData:()=>data};
window.addEventListener('resize',resize);update();resize();requestAnimationFrame(frame);

if(new URL(location.href).searchParams.get("view")==="cinema"){document.querySelector('[data-tab="cinema"]').click();}

function setAppearance(){background=$('background').value;effect=$('effect').value;$('effect').disabled=background!=='reference';$('reference-effects').hidden=background!=='reference';$('scene-review').hidden=background!=='emission';$('living-film').hidden=background!=='reference';$('classroom-intro').hidden=background!=='classroom';syncDuration();const names=background==='classroom'?['riemann-integral-120s-classroom.mp4','riemann-integral-30s-classroom.mp4']:background==='reference'?['riemann-integral-120s-reference.mp4','riemann-integral-30s-reference.mp4']:['riemann-integral-120s-pc.mp4','riemann-integral-30s-instagram.mp4'];document.querySelectorAll('.film-card').forEach((card,i)=>{const v=card.querySelector('video'),a=card.querySelector('a');v.pause();v.poster=background==='classroom'?'../../media/riemann-classroom-'+(i===0?'pc':'portrait')+'.jpg':'';v.src='../../media/'+names[i]+'?v=reference-v1';a.href=v.src;a.download=names[i]});drawPreview()}
$('background').onchange=setAppearance;$('effect').onchange=()=>{effect=$('effect').value;syncDuration();drawPreview()};document.querySelectorAll('[data-effect]').forEach(b=>b.onclick=()=>{$('background').value='reference';$('effect').value=b.dataset.effect;filmTime=Number(b.dataset.at);$('filmTime').value=filmTime;setAppearance();$('preview').scrollIntoView({behavior:'smooth',block:'center'})});setAppearance();

function cameraUI(){ $('cameraMode').value=camera.mode;$('cameraZoom').value=camera.zoom;$('zoomValue').value=camera.zoom.toFixed(2)+'×';$('cameraGather').value=camera.gather;$('gatherValue').value=Math.round(camera.gather*100)+'%';$('cameraMirror').setAttribute('aria-pressed',String(camera.mirror));drawPreview()}
$('cameraMode').onchange=()=>{camera.mode=$('cameraMode').value;cameraUI()};
$('cameraZoom').oninput=()=>{camera.zoom=Number($('cameraZoom').value);cameraUI()};
$('cameraGather').oninput=()=>{camera.gather=Number($('cameraGather').value);cameraUI()};
$('cameraMirror').onclick=()=>{camera.mirror=!camera.mirror;cameraUI()};
$('cameraReset').onclick=()=>{Object.assign(camera,{mode:'manual',yaw:0,pitch:0,zoom:1,mirror:false,gather:0});cameraUI()};
$('cameraJump').onclick=()=>{document.querySelector('[data-tab="cinema"]').click();$('preview').scrollIntoView({behavior:'smooth',block:'center'})};
for(const surface of [canvas,preview]){let drag=null;surface.style.touchAction='none';surface.addEventListener('pointerdown',e=>{if(background!=='reference'&&background!=='classroom')return;drag={x:e.clientX,y:e.clientY};surface.setPointerCapture(e.pointerId);camera.mode='manual';cameraUI()});surface.addEventListener('pointermove',e=>{if(!drag)return;camera.yaw=Math.max(-1.1,Math.min(1.1,camera.yaw+(e.clientX-drag.x)*.004));camera.pitch=Math.max(-.48,Math.min(.48,camera.pitch+(e.clientY-drag.y)*.003));drag={x:e.clientX,y:e.clientY};drawPreview()});const release=()=>drag=null;surface.addEventListener('pointerup',release);surface.addEventListener('pointercancel',release);surface.addEventListener('lostpointercapture',release);surface.addEventListener('wheel',e=>{if(background!=='reference'&&background!=='classroom')return;e.preventDefault();camera.zoom=Math.max(.65,Math.min(1.8,camera.zoom*Math.exp(-e.deltaY*.001)));cameraUI()},{passive:false})}
window.riemann.getCamera=()=>({...camera});cameraUI();

function syncDuration(){$('filmTime').max=filmDuration();if(filmTime>=filmDuration())filmTime=0;$('filmTime').value=filmTime}
$('livingLive').onclick=()=>{document.querySelectorAll('video').forEach(v=>v.pause());$('background').value='reference';$('effect').value='living';filmTime=0;filmPlaying=true;$('playFilm').textContent='Ⅱ 一時停止';setAppearance();$('preview').scrollIntoView({behavior:'smooth',block:'center'})};
if(new URL(location.href).searchParams.get('effect')==='living'){$('background').value='reference';$('effect').value='living';filmTime=0;setAppearance()}
