import {configureGeometry} from './geometric-world.js';
import {reelsFrame} from './reels.js';
import {background,drawGraph} from '../visual.js';
import {scene,rightSum,error} from '../model.js';
let math={};export function configureCinema(options){math=options.math;configureGeometry(options)}
function text(c,s,x,y,size=25,color='#e9f7ff',align='center'){c.font=`${size}px "Noto Sans CJK JP",sans-serif`;c.fillStyle=color;c.textAlign=align;c.fillText(s,x,y)}
function formula(c,key,x,y,maxW,maxH,alpha=1){const f=math[key];if(!f)return;const w=Math.min(maxW,maxH*f.ratio),h=w/f.ratio;c.save();c.globalAlpha=alpha;c.drawImage(f.image,x-w/2,y-h/2,w,h);c.restore()}
function panel(c,x,y,w,h){c.fillStyle='#04101de8';c.strokeStyle='#48889e66';c.lineWidth=1;c.beginPath();c.roundRect(x,y,w,h,13);c.fill();c.stroke()}
export function cinemaFrame(ctx,W,H,t,portrait){
 if(portrait){reelsFrame(ctx,W,H,t,math);return;}
 const w=portrait?720:1280,h=portrait?1280:720,c=ctx,s=scene(t,portrait),tunnel=s.i===5||(portrait&&s.i===2)?1:s.i===6?.3:.04;
 c.save();c.scale(W/w,H/h);background(c,w,h,t,tunnel);
 // Rectangular portals deepen into the vanishing point in the limit act.
 if(tunnel>.5){c.save();c.translate(w*.5,h*(portrait?.49:.51));for(let j=0;j<14;j++){const z=(j/14+t*.22)%1,r=30+z*z*(portrait?880:1000);c.strokeStyle=j%2?'#f2ca7a77':'#60dfff55';c.lineWidth=1+z*3;c.beginPath();c.moveTo(-r*.58,-r*.43);c.lineTo(r*.58,-r*.43);c.lineTo(r*.58,r*.43);c.lineTo(-r*.58,r*.43);c.closePath();c.stroke()}c.restore()}
 const intro=s.i===0,last=s.i===6;
 if(last){c.fillStyle='#02091680';c.fillRect(0,0,w,h)}
 if(portrait){
  text(c,'MATHEMATICS III / THE INFINITE SUM',w/2,82,13,'#8bcfe0');
  text(c,intro?'定積分と極限':s.title,w/2,143,intro?46:29);
  text(c,intro?'無限の長方形が、面積を生む':last?'区分求積法で、面積が見える。':s.i===5?'1/n → 0   →   S_n → 1/3':'y = x²　｜　0 ≤ x ≤ 1',w/2,191,20,'#e9c686');
  c.save();if(last)c.globalAlpha=.4;drawGraph(c,{x:32,y:265,w:650,h:590,n:s.n,t,view:'3d',fill:true,showRects:!intro&&!last,reveal:intro?Math.min(1,s.p*2):1,highlight:s.i===1||s.i===3?Math.floor(s.local*3)%s.n+1:-1});c.restore();
  if(s.i===2){panel(c,210,239,300,72);text(c,'n → ∞',360,291,49,'#ffe0a2')}
  if(!intro&&!last){text(c,`n = ${s.n}     S_n = ${rightSum(s.n).toFixed(6)}`,w/2,866,23,'#f2d19a');text(c,`はみ出しの面積 = ${error(s.n).toFixed(6)}`,w/2,904,17,'#f5b48f')}
  if(!last){panel(c,28,946,664,170);formula(c,intro?'final':s.i===2?'simplified':s.formula,w/2,1023,610,92)}
  else{panel(c,45,492,630,252);formula(c,'final',360,618,560,170,Math.min(1,s.p*4));text(c,'S = 1/3',360,948,43,'#ffdc94')}
  text(c,intro?'曲線の下の面積は、どう求めるのか。':last?'無限の和が、定積分になる。':s.i===1?'幅 1/n × 右端の高さ (k/n)²':s.i===2?'細かい長方形ほど、曲線に近づく':s.i===3?'幅 × 高さを、すべて足す':s.i===4?'平方和の公式を代入して整理':'長方形と曲線の差が、0へ近づく',w/2,1173,21,'#afccd9');
 }else{
  text(c,'MATHEMATICS III / THE INFINITE SUM',65,54,12,'#87bccc','left');text(c,String(s.i+1).padStart(2,'0')+' / 07',1210,54,14,'#7d9bad','right');
  text(c,intro?'数学Ⅲ｜定積分と極限':s.title,65,110,intro?38:32,'#e9f7ff','left');
  text(c,intro?'無限の長方形が、面積を生む':last?'無限の和が、定積分になる':s.i===5?'極限の回廊 — n → ∞':'y = x²　｜　区間 [0,1] を n 等分',65,151,18,'#d5b87e','left');
  const gx=last?210:24,gw=last?840:720;
  c.save();if(last)c.globalAlpha=.4;drawGraph(c,{x:gx,y:178,w:gw,h:438,n:s.n,t,view:s.i===1?'2d':'3d',fill:true,showRects:!intro&&!last,reveal:intro?Math.min(1,s.p*1.8):1,highlight:s.i===1||s.i===3?Math.floor(s.local*.8)%s.n+1:-1});c.restore();
  if(!intro&&!last){
   panel(c,785,205,440,315);text(c,`n = ${s.n}`,1005,254,35,'#ffd285');text(c,'長方形の和（右端和）',1005,296,17,'#9dbdce');text(c,rightSum(s.n).toFixed(6),1005,348,43,'#e4f7ff');text(c,'真の面積 1/3 = 0.333333…',1005,391,18,'#ebc785');text(c,`誤差 ${error(s.n).toFixed(6)}`,1005,433,23,'#ffb18a');
   if(s.i===5)text(c,'n → ∞',1005,489,36,'#ffe0aa');else text(c,s.i===1?'高さは右端で決まる':'はみ出しが小さくなる',1005,482,17,'#8dccdf');
  }
  if(last){c.save();c.translate(640,portrait?618:367);c.rotate(t*.08);c.strokeStyle='#ffd17b55';c.lineWidth=1.5;for(let j=0;j<4;j++){const r=110+j*22+Math.sin(t*1.2)*6;c.beginPath();for(let k=0;k<=4;k++){const a=k/4*Math.PI*2;c.lineTo(Math.cos(a)*r,Math.sin(a)*r)}c.stroke()}c.restore()}
  if(!last){panel(c,54,583,1172,101);formula(c,intro?'final':s.formula,640,630,1080,70)}
  else{panel(c,265,282,750,173);formula(c,'final',640,367,650,128,Math.min(1,s.p*4));text(c,'無限の和が、定積分になる',640,640,28,'#ffdc94')}
  if(intro)text(c,'曲線の下の面積は、どう求めるのか。',640,548,24,'#d8e9ef');
 }
 // Fixed edge progress markers keep each act legible while the world moves.
 const count=7,gap=portrait?8:10,barW=portrait?66:70,start=(w-count*barW-(count-1)*gap)/2;
 for(let j=0;j<count;j++){c.fillStyle=j<=s.i?'#d4b57a':'#375063';c.fillRect(start+j*(barW+gap),h-24,barW,3)}
 c.restore();
}
