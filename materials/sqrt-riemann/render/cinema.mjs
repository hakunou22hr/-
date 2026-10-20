import {createCanvas,GlobalFonts} from '@napi-rs/canvas';import {spawn} from 'node:child_process';import {once} from 'node:events';import {mathWorld} from './world.js';import {drawGraph} from './graph.js';import {mathImages} from './math-images.mjs';
GlobalFonts.registerFromPath('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','Noto Sans CJK JP');const math=await mathImages();
const short=process.argv[2]==='30',W=short?1080:1920,H=short?1920:1080,duration=short?30:90,FPS=24,w=short?720:1280,h=short?1280:720;
const out=`public/media/sqrt-riemann/sqrt-riemann-${short?'30s-instagram':'90s-pc'}.mp4`,canvas=createCanvas(W,H),c=canvas.getContext('2d');
const sum=n=>Array.from({length:n},(_,k)=>Math.sqrt((k+1)/n)/n).reduce((a,b)=>a+b,0),clamp=x=>Math.max(0,Math.min(1,x));
function text(s,x,y,size=22,col='#e7f7ff',align='left'){c.font=`${size}px "Noto Sans CJK JP",sans-serif`;c.fillStyle=col;c.textAlign=align;c.fillText(s,x,y)}
function plate(x,y,ww,hh){c.fillStyle='#030d1be6';c.strokeStyle='#66d7eb66';c.lineWidth=1;c.beginPath();c.roundRect(x,y,ww,hh,12);c.fill();c.stroke()}
function eq(key,x,y,mw,mh,alpha=1){const f=math[key],ww=Math.min(mw,mh*f.ratio),hh=ww/f.ratio;c.save();c.globalAlpha=alpha;c.drawImage(f.image,x-ww/2,y-hh/2,ww,hh);c.restore()}
function frame(t){
 c.save();c.scale(W/w,H/h);let i,local,n=4,act;
 if(short){i=t<4?0:t<10?1:t<18?2:t<24?3:4;local=t-[0,4,10,18,24][i];n=i<2?4:i===2?Math.min(200,4*2**Math.floor(local*.9)):200;act=i===2?2:i===4?3:i===0?0:1}
 else{i=[10,24,40,55,68,80,90].findIndex(b=>t<b);if(i<0)i=6;local=t-[0,10,24,40,55,68,80][i];n=i<3?4:i===3?Math.min(200,4*2**Math.floor(local/2.15)):200;act=i===3||i===5?2:i===6?3:i===0?0:1}
 c.save();c.scale(w/720,h/1280);mathWorld(c,t,act);c.restore();
 const titles=short?['定積分と極限','この和が、長方形になる','無限に向かう、光の分割','和が、面積になる','極限値は 2/3']:['数学Ⅲ｜定積分と極限','この極限は、何を表す？','長方形の誕生','分割を、加速する','長方形の和を Σ で表す','Σ から、定積分へ','無限の和が、一つの面積になる'];
 text('MATHEMATICS III / RIEMANN SUM',short?360:55,short?70:45,12,'#97d9e7',short?'center':'left');text(titles[i],short?360:55,short?143:105,short?34:34,'#eefaff',short?'center':'left');
 text(i===0?'無限の和が、面積になる':short?'y = √x   ｜   0 ≤ x ≤ 1':'y = √x   ｜   区間 [0,1] を n 等分',short?360:55,short?195:148,short?19:18,'#ffda98',short?'center':'left');
 if(short){
  if(i===0){drawGraph(c,{x:55,y:330,w:620,h:610,t,view:'3d',showRects:false,fill:true,reveal:clamp(t/2),labels:true});plate(38,1000,644,130);text('この極限は、何を表しているのか。',360,1075,23,'#dcf7ff','center')}
  if(i===1){plate(25,250,670,155);eq('original',360,325,625,100);drawGraph(c,{x:22,y:420,w:670,h:540,n:4,t:t*2,view:'3d',showRects:local>1.4,fill:true,riseTime:Math.max(0,local-1.4)*2,connect:true,highlight:1+Math.floor(local)%4});plate(35,995,650,145);eq('dimensions',360,1052,590,65);text('幅 1/n × 右端の高さ √(k/n)',360,1113,19,'#ffdc9c','center')}
  if(i===2){text('n → ∞',360,308,65,'#ffe1a3','center');c.save();c.translate(360,640);c.rotate(Math.sin(t*.6)*.04);let z=1+Math.sin(local*.5)*.06;c.scale(z,z);drawGraph(c,{x:-345,y:-270,w:690,h:560,n,t:t*3,view:'3d',showRects:true,fill:true,highlight:1+Math.floor(t*10)%n});c.restore();plate(45,955,630,170);text(`n = ${n}    S_n = ${sum(n).toFixed(6)}`,360,1014,26,'#ffe1a3','center');text('細かくなるほど、曲線へ近づく。',360,1072,22,'#d5f6ff','center')}
  if(i===3){drawGraph(c,{x:55,y:315,w:610,h:510,n:200,t:t*2,view:'3d',showRects:local<3,fill:true});plate(35,890,650,240);eq('sigma',360,960,590,70,clamp(1-local/6));eq('integral',360,1060,580,75,clamp(local/3));text('Σ',300,835,55,'#a0f5ff','center');text('→',360,835,38,'#d8faff','center');text('∫',425,835,65,'#ffdc92','center')}
  if(i===4){c.save();c.globalAlpha=.65;drawGraph(c,{x:40,y:315,w:640,h:510,n:200,t,view:'3d',showRects:false,fill:true});c.restore();plate(32,750,656,270);eq('integral',360,815,580,75);eq('final',360,935,560,120);text('区分求積法で、極限が見える。',360,1120,24,'#ffdc92','center')}
  text('INFINITY INTO AREA / √x',360,1204,12,'#a0ced9','center');
 }else{
  const end=i===6,show=i>=2&&i<6;let gx=end?250:25,gy=end?190:185,gw=end?780:750,gh=end?380:400;
  c.save();if(i===3){c.translate(400,380);c.rotate(Math.sin(local*.5)*.03);c.translate(-400,-380)}drawGraph(c,{x:gx,y:gy,w:gw,h:gh,n,t:t*(i===3?3:1),view:'3d',fill:true,showRects:show&&(i!==5||local<7),riseTime:i===2?local:1000,connect:i===2,reveal:i===0?clamp(local/5):1,highlight:i===2?1+Math.floor(local/3)%4:i===3?1+Math.floor(local*5)%n:-1});c.restore();
  if(!end){plate(800,195,430,350);
   if(i===0){text('無限の和が、',1015,290,26,'#e1f8ff','center');text('面積になる。',1015,340,34,'#ffe0a2','center');eq('function',1015,425,350,75)}
   else if(i===1){eq('original',1015,295,390,115);text('1/n は「幅」',1015,416,24,'#ffdf9b','center');text('√(k/n) は「右端の高さ」',1015,466,21,'#a2f2ff','center')}
   else{text(`n = ${n}`,1015,262,38,'#ffdf9b','center');text('長方形の面積の和（右端和）',1015,304,17,'#b1cfdf','center');text(sum(n).toFixed(6),1015,360,40,'#e6fbff','center');text('真の面積 2/3 ≈ 0.666667',1015,411,20,'#ffdd99','center');text(`誤差 +${(sum(n)-2/3).toFixed(6)}`,1015,456,22,'#ffc29a','center');text(i===5?'n → ∞':'上側から、真の面積へ',1015,510,i===5?32:19,'#a3eaff','center')}
  }
  plate(50,570,1180,114);
  if(i===0){text('この極限は、何を表しているのか。',640,637,27,'#e4f7ff','center')}
  if(i===1)eq('original',640,626,1090,80);
  if(i===2){eq('dimensions',640,623,510,70);text('右端 xₖ = k/n の点が、曲線に乗る。',640,668,17,'#b5d6e5','center')}
  if(i===3){eq('sigma',640,624,600,70);text('4 → 8 → 16 → 32 → 64 → 128 → 200',640,555,20,'#ffdfa0','center')}
  if(i===4){eq('sigma',380,625,570,75);eq('function',960,625,380,70);text('区分求積法：幅 × 高さ を、すべて足す',640,555,21,'#d6f7ff','center')}
  if(i===5){eq('transition',640,625,1070,80);text('Σ',585,330,90,'#a7f4ff','center');text('→',660,330,44,'#defaff','center');text('∫',740,330,104,'#ffe0a3','center')}
  if(end){plate(190,285,900,180);eq('final',640,375,740,130);eq(local<4?'integral':'calculation',640,626,1090,85)}
 }
 c.fillStyle='#3c697b';c.fillRect(w*.07,h-26,w*.86,3);c.fillStyle='#f4cc81';c.fillRect(w*.07,h-26,w*.86*t/duration,3);c.restore();
}
if(process.env.POSTER){frame(Number(process.env.POSTER));await import('node:fs').then(fs=>fs.writeFileSync(process.env.POSTER_PATH||'/workspace/work/sqrt/node-preview.png',canvas.toBuffer('image/png')));process.exit(0)}
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(FPS),'-i','pipe:0','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});const exit=once(ff,'close');for(let k=0;k<duration*FPS;k++){frame(k/FPS);if(!ff.stdin.write(c.getImageData(0,0,W,H).data))await once(ff.stdin,'drain');if(k%(FPS*5)===0)console.log(k/FPS)}ff.stdin.end();const [code]=await exit;if(code)throw Error('ffmpeg '+code);frame(duration-2);(await import('node:fs')).writeFileSync(`public/media/sqrt-riemann/poster-${short?'30':'90'}.jpg`,canvas.toBuffer('image/jpeg'));
