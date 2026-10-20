import {createCanvas,GlobalFonts} from '@napi-rs/canvas';import {spawn} from 'node:child_process';import {once} from 'node:events';import {writeFileSync} from 'node:fs';
import {drawCinemaWorld} from '../cinematic-world.js';import {mathImages} from './math-images.mjs';
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','Noto Sans CJK JP');const math=await mathImages();
const short=process.argv[2]==='30',W=short?1080:1920,H=short?1920:1080,duration=short?30:90,FPS=24,w=short?720:1280,h=short?1280:720;
const root=process.env.CINEMA_OUTPUT_DIR||'public/media/sqrt-riemann',out=`${root}/sqrt-riemann-${short?'30s-instagram':'90s-pc'}-silent.mp4`,canvas=createCanvas(W,H),c=canvas.getContext('2d'),backgroundCanvas=createCanvas(W/2,H/2),backgroundContext=backgroundCanvas.getContext('2d');
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},sum=n=>Array.from({length:n},(_,i)=>Math.sqrt((i+1)/n)/n).reduce((a,b)=>a+b,0);
function text(s,x,y,size=22,col='#e7f7ff',align='left',alpha=1){c.save();c.globalAlpha=alpha;c.font=`${size}px "Noto Sans CJK JP",sans-serif`;c.fillStyle=col;c.textAlign=align;c.fillText(s,x,y);c.restore()}
function eq(key,x,y,mw,mh,alpha=1){const f=math[key],ww=Math.min(mw,mh*f.ratio),hh=ww/f.ratio;c.save();c.globalAlpha=alpha;c.drawImage(f.image,x-ww/2,y-hh/2,ww,hh);c.restore()}
function shade(y0,y1,strength=.85){const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#01040b00');g.addColorStop(1,`rgba(1,4,11,${strength})`);c.fillStyle=g;c.fillRect(0,y0,w,y1-y0)}
export function frame(t){
 let i,local,scene,st,n=4;
 if(short){i=t<4?0:t<10?1:t<18?2:t<24?3:4;local=t-[0,4,10,18,24][i];scene=i===0?0:i===1?(local<2.5?1:2):i===2?3:i===3?5:6;st=i===0?local*2.5:i===1?(local<2.5?local*5:(local-2.5)*4):i===2?local*1.875:i===3?local*2:local*10/6;n=i<2?4:i===2?Math.min(200,4*2**Math.floor(local*.9)):200;}
 else{i=[10,24,40,55,68,80,90].findIndex(x=>t<x);if(i<0)i=6;local=t-[0,10,24,40,55,68,80][i];scene=i;st=local;n=i<3?4:i===3?Math.min(200,4*2**Math.floor(local/2.15)):200;}
 backgroundContext.setTransform(W/2/w,0,0,H/2/h,0,0);const world=drawCinemaWorld(backgroundContext,w,h,t,{scene,local:st,n,portrait:short});c.save();c.scale(W/w,H/h);c.drawImage(backgroundCanvas,0,0,w,h);
 // A lens cut introduces each shot; reading zones use soft darkness rather than interface cards.
 if(short){shade(h*.72,h,.96);const g=c.createLinearGradient(0,0,0,310);g.addColorStop(0,'#01040bef');g.addColorStop(1,'#01040b00');c.fillStyle=g;c.fillRect(0,0,w,310)}else{shade(470,720,.97);const g=c.createLinearGradient(0,0,0,210);g.addColorStop(0,'#01040bdc');g.addColorStop(1,'#01040b00');c.fillStyle=g;c.fillRect(0,0,w,210)}
 const a=ease(local/.65);const titles=short?['定積分と極限','この和を、空間で見る','分割は、無限へ。','無限の和が、面積になる','S = 2/3']:['定積分と極限','この極限は、何を表す？','幅 × 高さ。それが、面積。','分割は、無限へ。','長方形の和を、Σで表す','無限の和が、面積になる','無限の和が、一つの面積になる'];
 text('MATHEMATICS III  /  INFINITY INTO AREA',short?360:70,short?83:65,12,'#74bfd1',short?'center':'left',a);
 if(!(short&&i===4))text(titles[i],short?360:70,short?151:112,short?35:34,'#e7f6ff',short?'center':'left',a);
 if(short){
  if(i===0){text('無限の和が、面積になる',360,1040,28,'#f2d4a1','center',ease((local-.8)/1));text('y = √x',360,1102,24,'#99ecfb','center',a)}
  if(i===1){if(local<2.5){shade(130,430,.45);eq('original',360,315,640,110,a)}else{eq('dimensions',360,1000,620,85,a);text('幅 1/n × 右端の高さ √(k/n)',360,1090,20,'#edd5ab','center',a)}}
  if(i===2){text('n → ∞',360,275,58,'#ffe2ac','center',a);text(`n = ${n}`,360,1015,36,'#f3d396','center',a);text(`右端和  ${sum(n).toFixed(6)}`,360,1073,23,'#b4d6df','center',a);text('細かくなるほど、曲線に近づく。',360,1132,22,'#e6f3f6','center',a)}
  if(i===3){eq(local<3?'sigma':'integral',360,1035,620,100,a);text('Σ',295,300,67,'#9de6f4','center',1-ease(local/5));text('∫',420,300,82,'#f6ce85','center',ease(local/5));text('→',360,300,32,'#dae9f0','center',a)}
  if(i===4){eq('integral',360,220,560,92,a);eq('final',360,1000,600,155,a);text('区分求積法で、極限が見える。',360,1145,24,'#eacb94','center',a)}
  text('√x  /  RIEMANN SUM',360,1220,11,'#7ea2ae','center');
 }else{
  if(i===0){text('無限の和が、面積になる',76,601,34,'#f3d7aa','left',ease((local-1.8)/1.4));text('この極限は、何を表しているのか。',78,646,18,'#a7c3cf','left',ease((local-3)/1.2))}
  if(i===1){eq('original',640,252,1100,115,a);text('1/n は幅。√(k/n) は、右端の高さ。',640,632,23,'#f0d3a5','center',a)}
  if(i===2){eq('dimensions',640,593,650,82,a);text('右端 x_k = k/n の点が、曲線に乗る。',640,653,19,'#b7d6e2','center',a);
   if(local>6){const k=1+Math.floor(local*.7)%4,point=world.project(world.graph(k/4,Math.sqrt(k/4)));if(point&&point.x>50&&point.x<w-50&&point.y>180&&point.y<510){text(`k = ${k}`,point.x,point.y-20,17,'#ffe2ad','center');}}
  }
  if(i===3){text(`n = ${n}`,80,592,43,'#ffe2a6','left',a);text(`右端和  ${sum(n).toFixed(6)}`,80,639,21,'#c0dce5','left',a);text('4 → 8 → 16 → 32 → 64 → 128 → 200',1200,640,20,'#d5c49f','right',a)}
  if(i===4){eq('sigma',460,595,660,88,a);eq('function',1030,595,310,60,a);text('区分求積法：長方形の面積を、すべて足す。',640,660,19,'#b8d2dd','center',a)}
  if(i===5){eq('transition',640,598,1110,92,a);text('Σ',575,270,78,'#90d5e8','center',1-ease(local/10));text('∫',720,270,98,'#ffda98','center',ease(local/10));text('→',645,270,36,'#dfeff4','center',a)}
  if(i===6){eq('final',640,310,650,142,a);eq(local<4?'integral':'calculation',640,598,1100,87,a);text('区分求積法で、極限が見える。',640,660,19,'#e5c891','center',a)}
  c.fillStyle='#000207';c.fillRect(0,0,w,24);c.fillRect(0,h-24,w,24);
 }
 // Brief shutter-like dissolves reveal a different shot, without flashing the mathematics.
 const shutter=1-ease(local/.28);if(shutter>0){c.fillStyle=`rgba(0,2,7,${shutter})`;c.fillRect(0,0,w,h)}
 c.restore();return {scene,local:st,n};
}
if(process.env.STORYBOARD){for(const time of process.env.STORYBOARD.split(',').map(Number)){frame(time);writeFileSync(root+`/shot-${short?30:90}-${time}.jpg`,canvas.toBuffer('image/jpeg'))}process.exit(0)}
if(process.env.POSTER){frame(Number(process.env.POSTER));writeFileSync(process.env.POSTER_PATH||root+`/preview-${short?'30':'90'}.jpg`,canvas.toBuffer('image/jpeg'));process.exit(0)}
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(FPS),'-i','pipe:0','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});const done=once(ff,'close');
for(let k=0;k<duration*FPS;k++){frame(k/FPS);if(!ff.stdin.write(c.getImageData(0,0,W,H).data))await once(ff.stdin,'drain');if(k%(FPS*5)===0)console.log(`${short?30:90}s ${k/FPS}`)}ff.stdin.end();const [code]=await done;if(code)throw Error('ffmpeg '+code);frame(duration-2);writeFileSync(root+`/poster-${short?30:90}.jpg`,canvas.toBuffer('image/jpeg'));

// Mux the original ambient score after the deterministic visual render.
const scoreScript=new URL('./score.py',import.meta.url).pathname;const sound=spawn('python',[scoreScript,String(duration),root],{stdio:'inherit'});const [soundCode]=await once(sound,'close');if(soundCode)throw Error('Score generation failed');const final=out.replace('-silent.mp4','.mp4');const mux=spawn('ffmpeg',['-y','-loglevel','error','-i',out,'-i',root+`/score-${duration}.wav`,'-c:v','copy','-af','volume=3','-c:a','aac','-b:a','160k','-t',String(duration),'-movflags','+faststart',final],{stdio:'inherit'});const [muxCode]=await once(mux,'close');if(muxCode)throw Error('Mux failed');(await import('node:fs')).unlinkSync(out);(await import('node:fs')).unlinkSync(root+`/score-${duration}.wav`);
