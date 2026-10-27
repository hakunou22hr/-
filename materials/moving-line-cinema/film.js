import {state,ease,clamp,constraints} from './model.js';import {drawMath,mathMetrics} from './math.js';
export const chapters=['四つの条件、その先へ','光の膜が、重なる','すべてを満たす場所','和に、名前をつける','直線を動かして、探す','最後に触れる、最大','最初に触れる、最小','動く直線、答えの境界'];
export function createFilm(make,w=1920,h=1080){const canvas=make(w,h),g=canvas.getContext('2d'),bounds=[];
 const text=(s,x,y,size=30,color='#eaf5ff',align='left')=>{g.font=`${size}px "Noto Sans CJK JP", "Noto Sans JP", sans-serif`;g.textAlign=align;g.textBaseline='middle';g.fillStyle=color;g.shadowColor='#020713';g.shadowBlur=5;g.fillText(s,x,y);g.shadowBlur=0;};
 function math(key,x,y,size=58,color='#fff0cb',max=700){const metrics=mathMetrics(key,size);if(metrics&&metrics.width>max)size*=max/metrics.width;const b=drawMath(g,make,key,x,y,size,color);if(b)bounds.push({key,...b});}
 function rule(y){g.strokeStyle='#6094ac55';g.lineWidth=1;g.beginPath();g.moveTo(105,y);g.lineTo(775,y);g.stroke();}
 function tag(s,y,color='#70d9ff'){text(s,110,y,23,color);}
 function render(t,labels,options={}){bounds.length=0;const q=state(t,options),{s,u,k}=q;g.setTransform(w/1920,0,0,h/1080,0,0);g.clearRect(0,0,1920,1080);
  const shade=g.createLinearGradient(0,0,1000,0);shade.addColorStop(0,'#020916f5');shade.addColorStop(.72,'#020916dd');shade.addColorStop(1,'#02091600');g.fillStyle=shade;g.fillRect(0,0,s===0?1920:1000,1080);
  const top=g.createLinearGradient(0,0,0,210);top.addColorStop(0,'#030917e8');top.addColorStop(1,'#03091700');g.fillStyle=top;g.fillRect(0,0,1920,210);
  text('数学Ⅱ  /  REGION · OPTIMIZATION',100,61,22,'#70b9d5');text('動く直線、答えの境界',100,120,43);text(q.manual?'LAB  /  直線を、自分の手で動かす':`${String(s+1).padStart(2,'0')}  /  ${chapters[s]}`,100,185,25,'#ffda8d');text(q.manual?'INTERACTIVE':`${String(Math.floor(t)).padStart(2,'0')} / 90`,1815,67,20,'#7da5bd','right');
  let subtitle='';
  if(s===0&&!q.manual){text('四つの条件。',960,350,53,'#eff6fc','center');text('そのすべてを満たす場所で、',960,430,39,'#b8d5e5','center');math('target',960,575,112,'#ffdf9d',1200);text('和の「最大」と「最小」を探す。',960,735,38,'#fff1d3','center');subtitle='条件が、領域になる。領域が、答えを教えてくれる。';}
  else if(s===1&&!q.manual){tag('FOUR CONDITIONS',280);for(let i=0;i<4;i++){const active=i<q.reveal;g.globalAlpha=active?1:.22;g.fillStyle=constraints[i].color;g.beginPath();g.arc(124,375+i*117,6,0,Math.PI*2);g.fill();math('c'+i,440,375+i*117,58,constraints[i].color,590);g.globalAlpha=1;}text('色の膜は、それぞれの半平面。',110,887,27,'#bfd9e8');subtitle=q.t<25?'四つの不等式を、一枚ずつ光の膜へ。':'重なる場所だけを、同じ座標平面に集める。';text('奥行きは重なりを見せる演出。数学の座標は x・y の二つ。',1000,947,19,'#b1c8d8');}
  else if(s===2&&!q.manual){tag('THE FEASIBLE REGION',280);text('四つを同時に満たす',110,364,36);text('共通部分を A とする。',110,425,36,'#ffda8d');rule(487);text('頂点',110,547,25,'#7fcce9');text('(0, 0)        (4, 0)',110,615,38,'#ffe1a0');text('(3, 2)        (0, 4)',110,685,38,'#ffe1a0');text('境界も、内側も含む。',110,815,30);subtitle='探す場所は、この金色の四角形。';}
  else if(s===3&&!q.manual){tag('THE INSIGHT',280);math('sum',440,390,88);if(u>.18){const a=ease((u-.18)/.15);g.globalAlpha=a;text('求めたい「和」を、一つの量 k に。',110,500,30);g.globalAlpha=1;}if(u>.35){math('line',440,635,78,'#79ddff');text('傾き −1 を保つ、平行な直線。',110,745,29);text('y 軸との交点は (0, k)。',110,815,29,'#ffdb8a');}subtitle='x + y = k。その値は、直線の切片の高さになる。';}
  else if(s===4||q.manual){tag(q.manual?'MOVE k · FIND THE LIMIT':'A MOVING OBJECTIVE',280);math('sum',440,370,75);math('line',440,500,64,'#78dcff');rule(577);text(`k = ${k.toFixed(2)}`,110,657,68,q.intersects?'#ffdf96':'#85b7cc');text(q.intersects?'領域 A と共有点がある':'領域 A と共有点がない',110,758,31,q.intersects?'#fff0c3':'#8fb1c3');text('切片が上がるほど、和は大きくなる。',110,846,27);subtitle=q.manual?'金色の直線と y 軸上の光点が、同じ k で動く。':'直線が領域を通れる、k の範囲は？';if(q.manual&&!q.enabled.every(Boolean))subtitle='条件を外した実験中：画面内の共通部分を表示（元の答えとは別）。';}
  else if(s===5){tag('THE LAST CONTACT · MAXIMUM',280);math('max',440,399,73);math('maxPoint',440,554,62,'#79ddff');math('evalMax',440,687,70);text('接点 (3, 2)  →  切片 (0, 5)',110,820,28);subtitle='これ以上、上へ動かすと、領域から離れてしまう。';}
  else if(s===6){tag('THE FIRST CONTACT · MINIMUM',280);math('min',440,399,73);math('minPoint',440,554,62,'#79ddff');math('evalMin',440,687,70);text('接点も、切片も、原点 (0, 0)。',110,820,28);subtitle='x も y も 0 以上。和が 0 より小さくなることはない。';}
  else {tag('LINEAR PROGRAMMING',280);math('ans',440,395,71);math('max',440,555,57);math('min',440,665,57,'#79ddff');text('条件の領域 × 動く目的の直線',110,801,30);text('線形計画法につながる考え方。',110,865,27,'#79ddff');subtitle='式を動かすと、答えの限界が見えてくる。';}
  if(labels&&(s>0||q.manual)){
   for(const tick of labels.ticks){const [x,y]=tick.p;if(q.objective&&tick.kind==='y'&&Math.abs(Number(tick.text)-k)<.4)continue;text(tick.text,x,y,21,'#9fbccf','center');}
   text('x',...labels.x,27,'#c9e6f5','center');text('y',...labels.y,27,'#c9e6f5','center');if(!q.objective||Math.abs(k)>.55)text('O',labels.origin[0]-22,labels.origin[1]+27,23,'#d4e6ee');
   if(q.common&&q.enabled.every(Boolean)){const offsets=[[-45,55],[55,65],[55,-16],[-105,-16]];labels.vertices.forEach((v,i)=>{if(q.objective&&((i===0&&Math.abs(k)<.55)||(i===3&&Math.abs(k-4)<.55)))return;text(v.text,v.p[0]+offsets[i][0],v.p[1]+offsets[i][1],24,'#ffdfa5',i===2?'left':'center');});text('A',...labels.vertices[2].p.map((v,i)=>v+(i?50:-70)),42,'#ffdda0','center');}
   if(q.objective){const [x,y]=labels.intercept;g.strokeStyle='#ffe2a4';g.lineWidth=1.5;g.beginPath();g.moveTo(x-15,y);g.lineTo(x-70,y);g.stroke();text(`(0, ${Math.abs(k)<.005?'0':k.toFixed(q.manual||s===4?2:0)})`,x-85,y+(q.min?12:-4),27,'#ffe6a8','right');if((s===5||s===7)&&q.enabled.every(Boolean)){g.save();g.setLineDash([7,7]);g.strokeStyle='#ffe0a080';g.beginPath();g.moveTo(...labels.intercept);g.lineTo(...labels.hit);g.stroke();g.restore();}}
  }
  const bottom=g.createLinearGradient(0,965,0,1080);bottom.addColorStop(0,'#02091600');bottom.addColorStop(1,'#020916f0');g.fillStyle=bottom;g.fillRect(0,965,1920,115);text(subtitle,960,1029,31,'#edf6fc','center');return {q,bounds:[...bounds]};
 }
 return {canvas,render};
}
