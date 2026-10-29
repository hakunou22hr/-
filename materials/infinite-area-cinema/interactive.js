import './effects-core.js';
import schedule from './render/storm.json';
const canvas=document.querySelector('#effects-stage'),ctx=canvas.getContext('2d'),status=document.querySelector('#effects-status'),range=document.querySelector('#effect-n'),sound=document.querySelector('#effect-sound');
const make=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const image=new Image();image.src=new URL('./render/assets/environment.png',import.meta.url).href;await image.decode();
const engine=globalThis.MathFilmEffects.create(1280,720,make,image,schedule,30);
let selected='explosion',n=4,count=0,last=0,visible=true,audio,start=performance.now();
const labels={wind:'吹き込み',lightning:'放電・雷鳴',explosion:'爆発'};
function playSound(type){if(!sound.checked)return;audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();let delay=type==='lightning'?.22:0,at=audio.currentTime+delay,duration=type==='wind'?1.1:2.4,buffer=audio.createBuffer(1,audio.sampleRate*duration,audio.sampleRate),data=buffer.getChannelData(0);let low=0;for(let i=0;i<data.length;i++){let value=Math.random()*2-1;low=(low+value*.04)/1.04;data[i]=type==='wind'?value*.18:low*3.4}
 let source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=type==='wind'?1500:400;gain.gain.setValueAtTime(.001,at);gain.gain.exponentialRampToValueAtTime(type==='wind'?.16:.38,at+.045);gain.gain.exponentialRampToValueAtTime(.001,at+duration);source.connect(filter).connect(gain).connect(audio.destination);source.start(at);source.stop(at+duration);
 if(type!=='wind'){let osc=audio.createOscillator(),g=audio.createGain();osc.frequency.setValueAtTime(78,at);osc.frequency.exponentialRampToValueAtTime(34,at+.5);g.gain.setValueAtTime(.15,at);g.gain.exponentialRampToValueAtTime(.001,at+1.3);osc.connect(g).connect(audio.destination);osc.start(at);osc.stop(at+1.3)}
}
function fire(type,x=type==='wind'?.15:.83,y=.60){engine.trigger(type,(performance.now()-start)/1000,x,y);count++;canvas.dataset.events=String(count);canvas.dataset.lastEffect=type;status.textContent=`${labels[type]}を発生させました。画面を押すとその位置で反応します。`;playSound(type)}
for(const button of document.querySelectorAll('[data-effect]'))button.addEventListener('click',()=>{selected=button.dataset.effect;document.querySelectorAll('[data-effect]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));fire(selected)});
canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect();fire(selected,(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height)});
canvas.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fire(selected,.65,.55)}});
range.addEventListener('input',()=>{n=4*2**Number(range.value);document.querySelector('#effect-n-value').value=n;fire('wind',.12,.58);status.textContent=`分割数を${n}に変更し、吹き込みを発生させました。`});
document.querySelector('#effects-reset').addEventListener('click',()=>{engine.reset();n=4;range.value=0;document.querySelector('#effect-n-value').value=4;count=0;canvas.dataset.events='0';status.textContent='演出と分割数をリセットしました。'});
new IntersectionObserver(entries=>visible=entries[0].isIntersecting).observe(canvas);
function draw(now){requestAnimationFrame(draw);if(!visible||now-last<32)return;last=now;const t=(now-start)/1000;engine.render(ctx,t,22,{automatic:false});ctx.strokeStyle='#eaf6ff';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(145,155);ctx.lineTo(145,510);ctx.lineTo(1080,510);ctx.stroke();const p=(x,y)=>[145+x*150,510-y*12];
 for(let k=1;k<=n;k++){let x=2+3*k/n,l=x-3/n;ctx.fillStyle='rgba(100,215,255,.12)';ctx.strokeStyle='#78d9ff';ctx.lineWidth=n>32?.5:1;ctx.beginPath();ctx.moveTo(...p(l,0));ctx.lineTo(...p(l,x*x));ctx.lineTo(...p(x,x*x));ctx.lineTo(...p(x,0));ctx.closePath();ctx.fill();ctx.stroke()}
 ctx.strokeStyle='#ffdc9a';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=150;i++){let x=i/150*5.35,pt=p(x,x*x);i?ctx.lineTo(...pt):ctx.moveTo(...pt)}ctx.stroke();ctx.fillStyle='#edf8ff';ctx.font='24px system-ui';ctx.fillText('2',438,548);ctx.fillText('5',888,548);ctx.font='22px system-ui';ctx.fillText(`n = ${n}    Sₙ = ${(39+31.5/n+4.5/n**2).toFixed(3)} → 39`,160,615);ctx.fillStyle='#ffd082';ctx.fillText('y = x²',975,200);canvas.dataset.ready='true';}
requestAnimationFrame(draw);
