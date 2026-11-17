import {loadMath} from './math.js';
import {createFilm,state,titles} from './film.js';
const $=s=>document.querySelector(s);
const EDITIONS={90:'KW_lyEleQAE',30:'1uGfCtfX4K4'};
let duration=90,film=null,world=null,lastDraw=-1,mathReady=null,generation=0;
let player=null,ready=false,playing=false,lastT=-1,muted=false;
const make=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const fmt=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;
const frame=()=>document.getElementById('video');
const now=()=>{if(!ready||!player||!player.getCurrentTime)return 0;const t=player.getCurrentTime();return isFinite(t)?t:0};
// YouTube IFrame API
const apiReady=new Promise(res=>{if(window.YT&&window.YT.Player){res();return}const tag=document.createElement('script');tag.src='https://www.youtube.com/iframe_api';document.head.appendChild(tag);const prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{if(prev)prev();res()}});
async function initPlayer(){await apiReady;player=new YT.Player('video',{videoId:EDITIONS[duration],playerVars:{rel:0,playsinline:1},events:{onReady:()=>{ready=true;player.setVolume(80);draw()},onStateChange:e=>{if(e.data===YT.PlayerState.PLAYING){playing=true;$('#bigplay').hidden=true;if(!$('#procedural').checked||film)$('#status').textContent=''}else if(e.data===YT.PlayerState.PAUSED){playing=false}else if(e.data===YT.PlayerState.ENDED){playing=false;$('#bigplay').hidden=false}button();draw()},onError:()=>{$('#status').textContent='動画を読み込めません。「動画をYouTubeで開く」からも視聴できます。';$('#bigplay').hidden=false;button()}}})}
// Native playback is available immediately. Heavy procedural assets are optional.
async function setup(){const token=++generation;try{
 $('#status').textContent='数式空間を準備しています…';
 if(!mathReady)mathReady=Promise.all([loadMath(url=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=url})),document.fonts.load('24px "KaTeX Main"')]).catch(e=>{mathReady=null;throw e});
 await mathReady;if(token!==generation||!$('#procedural').checked)return;
 const {createWorld}=await import('./webgl.js');if(token!==generation)return;const p=$('#portrait').checked;world?.dispose();world=createWorld(p?540:1280,p?960:720);world.canvas.style.width='100%';world.canvas.style.height='100%';film=createFilm(make,p?720:1280,p?1280:720);$('#live').replaceChildren(world.canvas,...film.layers.slice(1));lastDraw=-1;
 $('#live').hidden=false;if(frame())frame().style.visibility='hidden';$('#status').textContent='';draw();
 }catch(e){if(token!==generation)return;$('#procedural').checked=false;$('#live').hidden=true;if(frame())frame().style.visibility='visible';$('#status').textContent='プログラム描画を読み込めませんでした。動画で再生できます。';}}
function draw(){const t=now();if($('#procedural').checked&&film&&t!==lastDraw){world?.render(state(t,duration));film.render(t,duration);lastDraw=t}$('#time').value=`${fmt(t)} / ${fmt(duration)}`;$('#seek').value=t;const q=state(t,duration);$('#chapter').textContent=`0${q.scene+1} / ${titles[q.scene]}`;}
function loop(){const t=now();if(playing||t!==lastT){draw();lastT=t}requestAnimationFrame(loop)}
function button(){$('#play').textContent=playing?'Ⅱ 一時停止':'▶ 再生';$('#play').setAttribute('aria-label',playing?'一時停止':'再生');}
function play(){if(!ready||!player)return;if(playing){player.pauseVideo()}else{if(now()>=duration-.05)player.seekTo(0,true);$('#status').textContent='動画を読み込んでいます…';player.playVideo()}}
function edition(d){generation++;$('#live').hidden=true;if(frame())frame().style.visibility='visible';film=null;world?.dispose();world=null;lastDraw=-1;duration=d;playing=false;$('#portrait').checked=false;const p=$('#portrait').checked;if(ready&&player)player.cueVideoById(EDITIONS[d]);$('#direct').href=`https://youtu.be/${EDITIONS[d]}`;$('#seek').max=d;$('#stage').classList.toggle('portrait',p);$('#bigplay').hidden=false;$('#status').textContent='';document.querySelectorAll('[data-edition]').forEach(b=>{const on=+b.dataset.edition===d;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on)});button();draw();if($('#procedural').checked)setup();}
$('#play').onclick=play;$('#bigplay').onclick=play;$('#live').onclick=play;
$('#seek').oninput=e=>{if(ready&&player)player.seekTo(+e.target.value,true);draw()};
$('#reset').onclick=()=>{if(ready&&player){player.pauseVideo();player.seekTo(0,true)}$('#bigplay').hidden=false;draw()};
$('#mute').onclick=()=>{if(!ready||!player)return;if(muted){player.unMute();if(player.getVolume()===0)player.setVolume(80);$('#volume').value=player.getVolume()/100;muted=false}else{player.mute();muted=true}$('#mute').textContent=muted?'音声 OFF':'音声 ON';$('#mute').setAttribute('aria-pressed',muted)};
$('#full').onclick=()=>$('#stage').requestFullscreen?.();
$('#procedural').onchange=e=>{if(e.target.checked)setup();else{generation++;$('#live').hidden=true;if(frame())frame().style.visibility='visible';$('#status').textContent='';}draw()};
$('#portrait').onchange=()=>edition(duration);document.querySelectorAll('[data-edition]').forEach(b=>b.onclick=()=>edition(+b.dataset.edition));
$('#volume').oninput=e=>{if(!ready||!player)return;const v=+e.target.value;player.setVolume(Math.round(v*100));if(v===0){player.mute();muted=true}else{player.unMute();muted=false}$('#mute').textContent=muted?'音声 OFF':'音声 ON';$('#mute').setAttribute('aria-pressed',muted);};
initPlayer();button();draw();loop();window.twoPathsPlayer={draw,edition,getPlayer:()=>player};
