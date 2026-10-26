import './style.css';
import katex from 'katex';
import {functions,calculate} from './math.js';
import {stateAt} from './timeline.js';
import {drawWorld,createFormulaTargets} from './world.js';
const $=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d'),preview=$('preview'),pctx=preview.getContext('2d');
let targets=[];const factory=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
let data=calculate('wave',0,4,4),flat=false,auto=false,filmPlaying=false,filmTime=50,last=0,elapsed=0,lastAuto=0;
Object.entries(functions).forEach(([key,v])=>{const option=document.createElement('option');option.value=key;option.textContent=`f(x) = ${v.label}`;$('fn').append(option)});
function formula(){katex.render(`\\Delta x=\\frac{b-a}{n},\\quad S_{${data.n}}=\\sum_{k=1}^{${data.n}}f(x_k)\\Delta x`,$('formula'),{throwOnError:false});$('formula').hidden=!$('showFormula').checked;}
function update(){try{const next=calculate($('fn').value,Number($('a').value),Number($('b').value),Number($('n').value));data=next;$('error').textContent='';$('nLabel').textContent=data.n;$('dx').textContent=data.dx.toFixed(6);$('sum').textContent=data.sum.toFixed(6);$('exact').textContent=data.exact.toFixed(6);$('difference').textContent=(data.error>=0?'+':'')+data.error.toFixed(6);formula()}catch(e){auto=false;$('auto').textContent='▶ 自動で細分化';$('error').textContent=e.message}}
['fn','a','b','n'].forEach(id=>$(id).addEventListener('input',()=>{auto=false;$('auto').textContent='▶ 自動で細分化';update()}));
document.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{$('n').value=b.dataset.n;update()});
$('auto').onclick=()=>{auto=!auto;if(auto&&data.n>=1000){$('n').value=1;update()}$('auto').textContent=auto?'Ⅱ 一時停止':'▶ 自動で細分化'};
$('view').onclick=()=>{flat=!flat;$('view').textContent=flat?'3Dに切替':'2Dに切替';$('view').setAttribute('aria-pressed',flat);$('viewLabel').textContent=flat?'2D':'3D'};
$('showFormula').onchange=formula;
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab-panel').forEach(e=>e.hidden=e.id!==b.dataset.tab);document.querySelectorAll('[data-tab]').forEach(e=>e.classList.toggle('active',e===b));if(b.dataset.tab!=='cinema'){filmPlaying=false;$('playFilm').textContent='▶ 再生'}resize()});
$('filmTime').oninput=()=>{filmTime=Number($('filmTime').value);drawPreview()};
$('playFilm').onclick=()=>{filmPlaying=!filmPlaying;if(filmTime>=120)filmTime=0;$('playFilm').textContent=filmPlaying?'Ⅱ 一時停止':'▶ 再生'};
document.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{filmTime=Number(b.dataset.time);$('filmTime').value=filmTime;drawPreview()});
function resize(){const ratio=Math.min(devicePixelRatio||1,1.7);for(const c of [canvas,preview]){const r=c.getBoundingClientRect();if(r.width&&r.height){c.width=Math.round(r.width*ratio);c.height=Math.round(r.height*ratio)}}if(preview.width)targets=createFormulaTargets(factory,preview.width,preview.height,false);drawPreview()}
function drawPreview(){if(!$('cinema').hidden&&preview.width){drawWorld(pctx,preview.width,preview.height,stateAt(filmTime),{formulaTargets:targets});$('timeLabel').value=`${filmTime.toFixed(1)} / 120s`;}}
function frame(now){const dt=last?Math.min(.1,(now-last)/1000):0;last=now;elapsed+=dt;if(!$('explore').hidden){if(auto&&now-lastAuto>140){$('n').value=Math.min(1000,data.n+Math.max(1,Math.ceil(data.n*.09)));update();lastAuto=now;if(data.n===1000){auto=false;$('auto').textContent='▶ 自動で細分化'}}const s=stateAt(60);Object.assign(s,{time:elapsed,data,n:data.n,previous:data.n,splitT:1,rectReveal:1,crystal:0,curveReveal:1,formation:0,tunnel:0,gridLevel:Math.min(64,data.n),yaw:.16*Math.sin(elapsed*.16),pitch:.07*Math.cos(elapsed*.11)});drawWorld(ctx,canvas.width,canvas.height,s,{cinema:false,flat})}if(filmPlaying){filmTime=Math.min(120,filmTime+dt);$('filmTime').value=filmTime;drawPreview();if(filmTime===120){filmPlaying=false;$('playFilm').textContent='▶ 再生'}}requestAnimationFrame(frame)}
document.querySelectorAll('[data-tex]').forEach(el=>katex.render(el.dataset.tex.replaceAll('\\\\','\\'),el,{displayMode:true,throwOnError:false}));
window.riemann={stateAt,calculate,drawAt:(t,portrait=false)=>{const s=stateAt(t,portrait);return drawWorld(pctx,preview.width,preview.height,s,{formulaTargets:targets})},getData:()=>data};
window.addEventListener('resize',resize);update();resize();requestAnimationFrame(frame);

if(new URL(location.href).searchParams.get("view")==="cinema"){document.querySelector('[data-tab="cinema"]').click();}
