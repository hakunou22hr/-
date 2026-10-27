import {drawMath,mathMetrics} from './math.js';import {reelsState} from './reels-model.js';import {constraints,ease} from './model.js';
// All foreground text is placed inside the Reels working safe area:
// x=90..930, y=210..1550. The animation/background may extend to the edges.
export function createReelsFilm(make,w=1080,h=1920){const canvas=make(w,h),g=canvas.getContext('2d'),bounds=[];
 function text(s,x,y,size=38,color='#e7f3fc',align='center'){g.font=`${size}px "Noto Sans CJK JP", "Noto Sans JP", sans-serif`;g.textAlign=align;g.textBaseline='middle';g.fillStyle=color;g.shadowColor='#020916';g.shadowBlur=7;g.fillText(s,x,y);g.shadowBlur=0;const width=g.measureText(s).width;bounds.push({key:s,left:align==='right'?x-width:align==='left'?x:x-width/2,right:align==='right'?x:align==='left'?x+width:x+width/2,top:y-size*.6,bottom:y+size*.6});}
 function math(key,x,y,size=88,color='#ffe0a1',max=800){const m=mathMetrics(key,size);if(m.width>max)size*=max/m.width;const b=drawMath(g,make,key,x,y,size,color);bounds.push({key,...b});}
 function panel(y0,y1){const a=g.createLinearGradient(0,y0,0,y1);a.addColorStop(0,'#02091600');a.addColorStop(.18,'#020916dc');a.addColorStop(.8,'#020916e8');a.addColorStop(1,'#02091600');g.fillStyle=a;g.fillRect(0,y0,1080,y1-y0);}
 function render(t,labels){const q=reelsState(t),{segment:s,shortU:u,k}=q;bounds.length=0;g.setTransform(w/1080,0,0,h/1920,0,0);g.clearRect(0,0,1080,1920);panel(0,550);panel(1320,1730);
  text('数学Ⅱ  /  CINEMA',510,225,27,'#7dcbe4');text('動く直線、答えの境界',510,290,45,'#f6eed8');
  if(s===0){text('四つの条件。',510,470,53);text('和の限界は、どこに？',510,565,49,'#ffe2a7');math('target',510,890,128);text('光の領域から、答えを探す。',510,1430,37);}
  else if(s===1){for(let i=0;i<4;i++){g.globalAlpha=i<q.reveal?1:.25;math('c'+i,i%2?735:300,i<2?420:520,49,constraints[i].color,385);g.globalAlpha=1;}text(q.common?'重なった場所が、領域 A。':'四つを、同時に満たす。',510,1425,41);text('膜の奥行きは、重なりを見せる演出。',510,1500,29,'#b6cfdf');}
  else if(s===2){math('sum',510,420,100);if(u>.3){math('line',510,530,69,'#79ddff');}text('求めたい「和」を、k と置く。',510,1410,40);text('切片の高さが、その値になる。',510,1490,35,'#ffdfa0');}
  else if(s===3){math('line',510,425,90,'#7fddff');text(`k = ${k.toFixed(2)}`,510,535,45,q.intersects?'#ffe2a1':'#8bb5ca');text(q.intersects?'直線を動かす。和が変わる。':'この高さでは、領域から離れる。',510,1425,39,q.intersects?'#f4edd9':'#9fc2d6');text('共有点をもてる、限界は？',510,1500,35,'#ffdf9a');}
  else if(s===4){math('max',510,425,89);math('evalMax',510,540,70);text('接点 (3, 2)  →  切片 (0, 5)',510,1425,38);text('最後に触れる高さ。最大値は 5。',510,1500,35,'#ffe1a0');}
  else if(s===5){math('min',510,425,89,'#82def8');math('evalMin',510,540,70);text('原点 (0, 0) で、最小値 0。',510,1425,40);text('x も y も、0 以上。',510,1500,35,'#bce6f3');}
  else{math('ans',510,425,84);text('領域 × 動く直線',510,1380,43,'#ffe1a1');text('線形計画法への、ひらめき。',510,1470,39);text('詳しい90秒版・操作実験は教材ライブラリへ',510,1540,29,'#9ebdce');}
  if(labels&&s>0){
   for(const tick of labels.ticks){if(q.objective&&tick.kind==='y'&&Math.abs(+tick.text-k)<.45)continue;text(tick.text,...tick.p,28,'#bad2df');}
   text('x',...labels.x,33,'#c8e7f5');text('y',...labels.y,33,'#c8e7f5');
   if(q.common){text('A',labels.vertices[2].p[0]-60,labels.vertices[2].p[1]+55,43,'#ffe1a0');
    if(!q.objective||Math.abs(k)>.6)text('(0, 0)',labels.origin[0]-30,labels.origin[1]+57,27,'#ffe1a0');
    text('(4, 0)',labels.vertices[1].p[0]+24,labels.vertices[1].p[1]+75,27,'#ffe1a0');
    text('(3, 2)',labels.vertices[2].p[0]+32,labels.vertices[2].p[1]-28,30,'#ffe1a0','left');
    if(!q.objective||Math.abs(k-4)>.6)text('(0, 4)',labels.vertices[3].p[0]-70,labels.vertices[3].p[1]-27,27,'#ffe1a0','right');}
   if(q.objective){const [x,y]=labels.intercept;g.strokeStyle='#ffe4ab';g.lineWidth=2;g.beginPath();g.moveTo(x-8,y);g.lineTo(x-38,y);g.stroke();text(`(0, ${q.min?'0':k.toFixed(s===3?1:0)})`,x-45,y-5,30,'#ffe3a5','right');if(s===4||s===6){g.strokeStyle='#ffe0a070';g.setLineDash([8,8]);g.beginPath();g.moveTo(...labels.intercept);g.lineTo(...labels.hit);g.stroke();g.setLineDash([]);}}
  }
  return {q,bounds:[...bounds]};
 }
 return {canvas,render};
}
