import {drawMath,mathMetrics} from './math.js';import {state,ease,MAX} from './model.js';
export function createFilm(make,portrait=false){const W=portrait?1080:1920,H=portrait?1920:1080,canvas=make(W,H),g=canvas.getContext('2d'),bounds=[];
 const gold='#ffe0a0',white='#edf6ff',ice='#8bd8f1';
 function text(s,x,y,size=32,color=white,align='left',font='Noto Sans CJK JP'){g.font=`${size}px "${font}",sans-serif`;g.textAlign=align;g.textBaseline='middle';g.fillStyle=color;g.shadowColor='#020816';g.shadowBlur=8;g.fillText(s,x,y);g.shadowBlur=0;const m=g.measureText(s).width;bounds.push({key:s,left:align==='center'?x-m/2:align==='right'?x-m:x,right:align==='center'?x+m/2:align==='right'?x:x+m,top:y-size*.6,bottom:y+size*.6});}
 function math(key,x,y,size=64,color=gold,max=700){const m=mathMetrics(key,size);if(m.width>max)size*=max/m.width;bounds.push({key,...drawMath(g,make,key,x,y,size,color)});}
 function shade(x,y,w,h,stops,vertical=false){const gr=g.createLinearGradient(x,y,x+(vertical?0:w),y+(vertical?h:0));for(const [p,c] of stops)gr.addColorStop(p,c);g.fillStyle=gr;g.fillRect(x,y,w,h);}
 function rule(x,y,w){g.strokeStyle='#7da4b44d';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y);g.stroke();}
 const titles=['この領域で、和の限界を探す','黄金の直線に、和を託す','直線を動かし、確かめる','最初に触れる、その瞬間','さらに大きな k へ','最後に触れる、その瞬間','動く直線が、極値を暴く'];
 function render(t,labels){const q=state(t,portrait),{s,u,k,min,max}=q;bounds.length=0;g.clearRect(0,0,W,H);
  if(portrait){shade(0,0,W,665,[[0,'#020815e8'],[.65,'#020815df'],[1,'#02081500']],true);shade(0,1320,W,600,[[0,'#02081500'],[.26,'#020815de'],[1,'#020815f2']],true);}
  else {shade(0,0,980,H,[[0,'#020815f0'],[.7,'#020815d2'],[1,'#02081500']]);shade(0,0,W,230,[[0,'#020815d0'],[1,'#02081500']],true);shade(0,925,W,155,[[0,'#02081500'],[1,'#020815ed']],true);}
  const cx=portrait?520:445;
  if(portrait){text('MATH CINEMA  /  黄金の直線',520,215,26,ice,'center');text('黄金の直線が暴く',520,275,42,white,'center');text('最大値・最小値',520,330,44,gold,'center');}
  else {text('MATH CINEMA  /  REGION & EXTREMA',100,71,22,ice);text('黄金の直線が暴く  最大値・最小値',100,132,36,white);text(`${String(s+1).padStart(2,'0')}  /  ${titles[s]}`,100,198,25,gold);text('GOLDEN LINE',1820,72,21,'#7fa9bb','right');}
  const top=portrait?440:350;
  let sub='',sub2='';
  g.save();g.globalAlpha=s===6?1:Math.min(1,.35+ease(u*8));
  if(s===0){
   if(portrait){math('disk',520,448,64,white,870);math('half',520,545,64,ice,870);sub='この領域で、x + y の限界は？';sub2='円と直線が、探す場所を決める。';}
   else{ text('この領域で、',100,326,39);math('disk',cx,435,72,white,690);math('half',cx,574,72,ice,690);rule(100,670,670);math('target',cx,760,86,gold);sub='円と直線に囲まれた場所で、最大・最小を探す。';}
  }else if(s===1){
   math('sum',cx,top,portrait?90:102,gold,portrait?850:720);math('line',cx,portrait?545:512,portrait?63:72,ice,portrait?850:690);
   if(!portrait){rule(100,613,670);text(`k = ${k.toFixed(3)}`,100,705,65,gold);text('傾き −1 のまま、平行移動する。',100,820,30);}
   else text(`k = ${k.toFixed(3)}`,520,620,35,gold,'center');
   sub='求めたい「和」を、k と置く。';sub2='k が変わると、直線が動く。';
  }else if(s===2){math('sum',cx,top,98);math('line',cx,500,65,ice);rule(100,596,670);text(`k = ${k.toFixed(3)}`,100,688,72,gold);text(q.intersects?'領域 A と共有点をもつ':'まだ、領域 A に届かない',100,802,32,q.intersects?gold:ice);sub='共有点をもつとき、その k が取りうる値になる。';}
  else if(s===3){
   if(!min){math('sum',cx,top,88);text(`k = ${k.toFixed(3)}`,100,520,66,gold);text('小さい k から、もう一度。',100,666,35);text('最初に触れる瞬間を探す。',100,748,32,ice);sub='直線を、小さい側から領域へ近づける。';}
   else{ text('MINIMUM',portrait?520:100,portrait?417:301,portrait?33:30,gold,portrait?'center':'left');math('mink',cx,portrait?500:431,portrait?102:122);math('minPoint',cx,portrait?613:602,portrait?62:76,ice);if(!portrait){math('evalMin',cx,744,70);text('最初に触れる点',100,851,30);}
    sub='最初に触れる点は、(3, −1)。';sub2='最小値は 2。';}
  }else if(s===4){math('sum',cx,top,portrait?88:95);if(portrait)text(`k = ${k.toFixed(3)}`,520,548,44,gold,'center');else{math('line',cx,500,65,ice);text(`k = ${k.toFixed(3)}`,100,676,72,gold);text('交わりながら、さらに上へ。',100,814,32);}
   sub=portrait?'y 切片 (0, k) が上がる。':'y 切片 (0, k) が上がる。直線をさらに動かす。';sub2='最後に触れる直線は、どこに？';
  }else if(s===5){text('MAXIMUM',portrait?520:100,portrait?417:301,portrait?33:30,gold,portrait?'center':'left');math('maxk',cx,portrait?500:431,portrait?94:110);math('maxPoint',cx,portrait?613:602,portrait?61:76,ice,portrait?850:720);if(!portrait){math('evalMax',cx,744,66);text('円との接点',100,851,30);text('y 切片：(0, 2√5)',100,911,28,gold);}
   sub=portrait?'円との接点と、y 軸との交点に注目。':'円との接点 (√5, √5) と、y 切片 (0, 2√5)。';sub2='最大値は 2√5。';
  }else {math('range',cx,portrait?451:360,portrait?77:72,gold,portrait?870:730);
   if(portrait){text('最小 2  /  最大 2√5',520,562,42,white,'center');sub='極値は、触れる瞬間に現れる。';sub2='動く直線が、最大値・最小値を可視化する。';}
   else {math('min',cx,525,65);math('minPoint',cx,618,50,ice);math('max',cx,753,65);math('maxPoint',cx,846,50,ice);sub='極値は、領域に触れる瞬間に現れる。';}}
  g.restore();
  if(labels&&q.graph&&q.reveal>.8){
   const labelSize=portrait?27:23;
   for(const tick of labels.ticks){const [x,y]=tick.p;if(portrait&&(x<110||x>960||y<665||y>1320))continue;if(!portrait&&(x<900||y<230||y>930))continue;text(tick.text,x,y,labelSize,'#9cb7ca','center');}
   text('x',...labels.x,portrait?34:29,ice,'center');text('y',...labels.y,portrait?34:29,ice,'center');text('O',labels.origin[0]-21,labels.origin[1]+23,labelSize,ice,'center');
   if(s!==0||q.reveal>.9){text('A',...labels.region,portrait?44:36,'#b4e9ed','center');
    // The labelled point itself and the callout are separated by a leader.
    const callout=(p,label,dx,dy,color=gold)=>{const [x,y]=p,tx=x+dx,ty=y+dy;g.strokeStyle=color+'90';g.lineWidth=1;g.beginPath();g.moveTo(x+Math.sign(dx)*12,y+Math.sign(dy)*10);g.lineTo(tx-Math.sign(dx)*10,ty);g.stroke();text(label,tx,ty,labelSize,color,dx>0?'left':'right');};
    if(s<5||s===6)callout(labels.other,'(1, 3)',-30,-41,ice);
    if(s<5||s===6)callout(labels.min,'(3, −1)',portrait?-45:35,portrait?65:58,gold);
    if(max){callout(labels.max,'(√5, √5)',portrait?-30:-35,portrait?-75:-67,gold);}
    if(labels.yIntercept){callout(labels.yIntercept,max?'y 切片 (0, 2√5)':`y 切片 (0, ${k.toFixed(3)})`,-38,-14,gold);}
   }
  }
  if(portrait){text(sub,520,1450,s===6?39:37,white,'center');text(sub2,520,1530,s===6?30:35,gold,'center');}
  else{text(sub,960,1015,32,white,'center');}
  // Optical flare on impact, with typography protected by the separate overlay.
  if(q.impact>.02){g.fillStyle=`rgba(255,225,161,${q.impact*.055})`;g.fillRect(0,0,W,H);}
  const fadeIn=ease(t/(portrait?.65:1.2)),fadeOut=ease(((portrait?30:90)-t)/.7);g.fillStyle=`rgba(1,5,12,${1-fadeIn*fadeOut})`;g.fillRect(0,0,W,H);
  return {q,bounds:[...bounds]};
 }
 return {canvas,render};
}
