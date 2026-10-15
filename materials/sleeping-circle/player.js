import {loadMath} from './math.js';
import {createFilm,state,titles} from './film.js';
const $=s=>document.querySelector(s),video=$('#video');
let duration=90,film=null,lastDraw=-1,mathReady=null,generation=0;
const make=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const fmt=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
const source=()=>`../../media/sleeping-circle/sleeping-circle-${duration}s${$('#portrait').checked?'-vertical':''}-play.mp4?v=play4`;
// Native playback is available immediately. Heavy procedural assets are optional.
async function setup(){const token=++generation;try{
 $('#status').textContent='数式空間を準備しています…';
 if(!mathReady)mathReady=Promise.all([loadMath(url=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=url})),document.fonts.load('24px "KaTeX Main"')]).catch(e=>{mathReady=null;throw e});
 await mathReady;if(token!==generation||!$('#procedural').checked)return;
 const p=$('#portrait').checked;film=createFilm(make,p?720:1280,p?1280:720);$('#live').replaceChildren(...film.layers);lastDraw=-1;
 $('#live').hidden=false;video.style.visibility='hidden';$('#status').textContent='';draw();
 }catch(e){if(token!==generation)return;$('#procedural').checked=false;$('#live').hidden=true;video.style.visibility='visible';$('#status').textContent='プログラム描画を読み込めませんでした。動画で再生できます。';}}
function draw(){const t=video.currentTime;if($('#procedural').checked&&film&&t!==lastDraw){film.render(t,duration);lastDraw=t;}$('#time').value=`${fmt(t)} / ${fmt(duration)}`;$('#seek').value=t;const q=state(t,duration);$('#chapter').textContent=`0${q.scene+1} / ${titles[q.scene]}`;}
function loop(){if(!video.paused)draw();requestAnimationFrame(loop)}
function button(){const playing=!video.paused&&!video.ended;$('#play').textContent=playing?'Ⅱ 一時停止':'▶ 再生';$('#play').setAttribute('aria-label',playing?'一時停止':'再生');}
async function play(){try{if(video.paused){if(video.currentTime>=duration-.05)video.currentTime=0;$('#status').textContent='動画を読み込んでいます…';await video.play()}else video.pause()}catch(e){if(e.name==='AbortError')return;button();$('#bigplay').hidden=false;$('#status').textContent='再生を開始できません。「動画を直接開く」からも視聴できます。';video.controls=true;video.onclick=null;}}
function edition(d){generation++;$('#live').hidden=true;video.style.visibility='visible';film=null;lastDraw=-1;duration=d;video.pause();$('#portrait').disabled=d!==30;if(d===90)$('#portrait').checked=false;const p=$('#portrait').checked;video.src=source();$('#direct').href=source();video.load();$('#seek').max=d;$('#stage').classList.toggle('portrait',p);$('#bigplay').hidden=false;$('#status').textContent='';document.querySelectorAll('[data-edition]').forEach(b=>{const on=+b.dataset.edition===d;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on)});draw();if($('#procedural').checked)setup();}
$('#play').onclick=play;$('#bigplay').onclick=play;video.onclick=play;$('#live').onclick=play;
video.onplay=()=>{button();$('#bigplay').hidden=true};
video.onplaying=()=>{button();if(!$('#procedural').checked||film)$('#status').textContent='';draw()};
video.onwaiting=()=>{if(!video.paused)$('#status').textContent='動画を読み込んでいます…'};
video.onstalled=()=>{if(!video.paused&&video.readyState<3)$('#status').textContent='動画を読み込んでいます…'};
video.onpause=()=>{button();if(!video.error)$('#status').textContent='';draw()};
video.onended=()=>{button();$('#bigplay').hidden=false;draw()};
video.onloadedmetadata=draw;video.ontimeupdate=draw;video.onseeked=draw;
video.onerror=()=>{$('#status').textContent='動画を読み込めません。「動画を直接開く」からも視聴できます。';video.controls=true;video.onclick=null;button();$('#bigplay').hidden=false};
$('#seek').oninput=e=>{video.currentTime=+e.target.value;draw()};
$('#reset').onclick=()=>{video.pause();video.currentTime=0;$('#bigplay').hidden=false;draw()};
$('#mute').onclick=()=>{video.muted=!video.muted;$('#mute').textContent=video.muted?'音声 OFF':'音声 ON';$('#mute').setAttribute('aria-pressed',video.muted)};
$('#full').onclick=()=>$('#stage').requestFullscreen?.();
$('#procedural').onchange=e=>{if(e.target.checked)setup();else{generation++;$('#live').hidden=true;video.style.visibility='visible';$('#status').textContent='';}draw()};
$('#portrait').onchange=()=>edition(duration);document.querySelectorAll('[data-edition]').forEach(b=>b.onclick=()=>edition(+b.dataset.edition));
video.controls=false;draw();loop();window.circlePlayer={video,draw,edition};
