import {createFilm,state,titles} from './film.js';
const $=s=>document.querySelector(s),video=$('#video');let duration=90,film,raf,lastDraw=-1;
const make=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const fmt=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
function setup(){const p=$('#portrait').checked;film=createFilm(make,p?720:1280,p?1280:720);$('#live').replaceChildren(...film.layers);lastDraw=-1;draw();}
function draw(){const t=video.currentTime;if(t!==lastDraw){film.render(t,duration);lastDraw=t;}$('#time').value=`${fmt(t)} / ${fmt(duration)}`;$('#seek').value=t;const q=state(t,duration);$('#chapter').textContent=`0${q.scene+1} / ${titles[q.scene]}`;}
function loop(){if($('#procedural').checked)draw();raf=requestAnimationFrame(loop)}
async function play(){try{if(video.paused){if(video.currentTime>=duration-.05)video.currentTime=0;await video.play()}else video.pause()}catch(e){$('#status').textContent='動画を読み込めませんでした。ページを再読み込みしてください。'}}
function edition(d){duration=d;video.pause();$('#portrait').disabled=d!==30;if(d===90)$('#portrait').checked=false;const p=$('#portrait').checked;video.src=`../../media/sleeping-circle/sleeping-circle-${d}s${p?'-vertical':''}.mp4`;video.load();$('#seek').max=d;$('#stage').classList.toggle('portrait',p);document.querySelectorAll('[data-edition]').forEach(b=>{const on=+b.dataset.edition===d;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on)});setup();}
$('#play').onclick=play;$('#bigplay').onclick=play;video.onclick=play;$('#live').onclick=play;
video.onplay=()=>{$('#play').textContent='Ⅱ 一時停止';$('#play').setAttribute('aria-label','一時停止');$('#bigplay').hidden=true};
video.onpause=()=>{$('#play').textContent='▶ 再生';$('#play').setAttribute('aria-label','再生')};
video.onended=()=>{$('#bigplay').hidden=false;draw()};
video.onloadedmetadata=()=>{$('#status').textContent='';draw()};video.ontimeupdate=draw;video.onseeked=draw;video.onerror=()=>{$('#status').textContent='MP4の読み込みに失敗しました。ダウンロードリンクもご確認ください。'};
$('#seek').oninput=e=>{video.currentTime=+e.target.value;draw()};$('#reset').onclick=()=>{video.pause();video.currentTime=0;$('#bigplay').hidden=false;draw()};
$('#mute').onclick=()=>{video.muted=!video.muted;$('#mute').textContent=video.muted?'音声 OFF':'音声 ON';$('#mute').setAttribute('aria-pressed',video.muted)};
$('#full').onclick=()=>$('#stage').requestFullscreen?.();
$('#procedural').onchange=e=>{$('#live').hidden=!e.target.checked;video.style.visibility=e.target.checked?'hidden':'visible';draw()};
$('#portrait').onchange=()=>edition(duration);document.querySelectorAll('[data-edition]').forEach(b=>b.onclick=()=>edition(+b.dataset.edition));
setup();loop();window.circlePlayer={video,draw,edition};
