const PI=Math.PI, f=x=>Math.cos(x)*(1+Math.sin(x)), d=x=>(1+Math.sin(x))*(1-2*Math.sin(x));
const xMax=PI/6,xMin=5*PI/6,xFlat=3*PI/2;
const yMax=f(xMax),yMin=f(xMin),yFlat=f(xFlat);
// Keep all three stationary abscissas even when a uniform mesh misses them.
const spaceSamples=[...new Set([...Array.from({length:150},(_,i)=>i/149*2*PI),xMax,xMin,xFlat])].sort((a,b)=>a-b);
const importantPoints=[
 {x:xMax,y:yMax,color:'#ffd66b',label:'極大',flat:false},
 {x:xMin,y:yMin,color:'#69c7ff',label:'極小',flat:false},
 {x:xFlat,y:yFlat,color:'#ffad62',label:'停留点',flat:true}
];
let x=0, deriveStep=0, yaw=-.55, pitch=.42, zoom=1;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function switchTab(id){$$('.panel').forEach(p=>p.classList.toggle('active',p.id===id));$$('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));requestAnimationFrame(drawAll);scrollTo({top:Math.min(scrollY,$('#tabs').offsetTop),behavior:'smooth'})}
$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
function resize(c){const r=c.getBoundingClientRect(),q=Math.min(devicePixelRatio,2);if(c.width!==r.width*q||c.height!==r.height*q){c.width=r.width*q;c.height=r.height*q}const g=c.getContext('2d');g.setTransform(q,0,0,q,0,0);return [g,r.width,r.height]}
function line(g,pts,color,w=2,glow=0){g.save();g.strokeStyle=color;g.lineWidth=w;g.shadowColor=color;g.shadowBlur=glow;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke();g.restore()}
function graph(){const c=$('#graphCanvas');if(!c)return;const [g,w,h]=resize(c),pad=42,X=t=>pad+t/(2*PI)*(w-2*pad),Y=v=>h/2-v/3.3*(h-55);g.clearRect(0,0,w,h);g.strokeStyle='#233a57';g.lineWidth=1;for(let i=0;i<=4;i++){const xx=pad+i*(w-2*pad)/4;g.beginPath();g.moveTo(xx,20);g.lineTo(xx,h-25);g.stroke();g.fillStyle='#7890aa';g.font='10px sans-serif';g.fillText(['0','π/2','π','3π/2','2π'][i],xx-6,h-8)}line(g,[[pad,h/2],[w-pad,h/2]],'#526984');const pts=[];for(let t=0;t<=2*PI+.02;t+=.02)pts.push([X(t),Y(f(t))]);line(g,pts,'#65d9ef',4,10);[[PI/6,'#ffd66b'],[5*PI/6,'#61bdfc'],[3*PI/2,'#ffad62']].forEach(([t,col])=>{g.fillStyle=col;g.shadowColor=col;g.shadowBlur=18;g.beginPath();g.arc(X(t),Y(f(t)),5,0,7);g.fill()});if($('#tangent').checked){const slope=d(x),len=.7;line(g,[[X(Math.max(0,x-len)),Y(f(x)+slope*(Math.max(0,x-len)-x))],[X(Math.min(2*PI,x+len)),Y(f(x)+slope*(Math.min(2*PI,x+len)-x))]],'#ffdd73',2,8)}g.fillStyle='white';g.shadowColor='#fff';g.shadowBlur=18;g.beginPath();g.arc(X(x),Y(f(x)),6,0,7);g.fill()}
function drawBar(sel,fn){const c=$(sel),[g,w,h]=resize(c);g.clearRect(0,0,w,h);for(let i=0;i<w;i++){const t=i/w*2*PI,v=fn(t);g.fillStyle=Math.abs(v)<.025?'#ffe36e':v>0?'#31d99a':'#f05e79';g.fillRect(i,0,2,h)}[PI/6,5*PI/6,3*PI/2].forEach(t=>{const xx=t/(2*PI)*w;g.fillStyle='#fff';g.fillRect(xx-1,0,2,h)});g.fillStyle='#fff';g.shadowColor='#fff';g.shadowBlur=10;g.fillRect(x/(2*PI)*w-2,0,4,h)}
function zone(){if(x<PI/6)return 0;if(x<5*PI/6)return 1;if(x<3*PI/2)return 2;return 3}
function update(){const val=d(x),eps=.008;$('#xVal').textContent=x.toFixed(2);$('#fVal').textContent=f(x).toFixed(3);$('#dVal').textContent=val.toFixed(3);$('#fac1').textContent=(1+Math.sin(x)).toFixed(3);$('#fac2').textContent=(1-2*Math.sin(x)).toFixed(3);$('#facD').textContent=val.toFixed(3);const s=$('#status');s.className='status '+(Math.abs(val)<eps?'zero':val>0?'positive':'negative');s.textContent=Math.abs(val)<eps?'f′(x) = 0　• 停留点':val>0?'f′(x) > 0　↗ 増加中':'f′(x) < 0　↘ 減少中';$$('[data-zone]').forEach(e=>e.classList.toggle('lit',+e.dataset.zone===zone()));$$('input[type=range]').forEach(r=>{if(Math.abs(+r.value-x)>.001)r.value=x});drawAll()}
$$('input[type=range]').forEach(r=>r.addEventListener('input',e=>{x=+e.target.value;update()}));$('#tangent').addEventListener('change',graph);
const steps=[['f(x) = cos x(1 + sin x)','出発点。2つの関数の積に注目しよう。'],['積の微分法：(uv)′ = u′v + uv′','cos x と (1 + sin x) をそれぞれ微分します。'],["f′(x) = (−sin x)(1 + sin x) + cos x(cos x)",'2つの項を落とさず、積の微分法を適用します。'],["f′(x) = −sin x(1 + sin x) + cos²x",'同じ式を見やすく整理します。'],["f′(x) = cos²x − sin x − sin²x",'括弧を展開し、sin x の式へ近づけます。'],['cos²x = 1 − sin²x','三角関数の基本関係 sin²x + cos²x = 1 を使います。'],["f′(x) = 1 − sin x − 2sin²x",'sin x だけの2次式になりました。'],["f′(x) = (1 + sin x)(1 − 2sin x)",'因数分解すると、各因子から符号を読めます。これが探究のカギ！']];
$('#derivation').innerHTML=steps.map((s,i)=>`<div class="derive-line"><b>${s[0]}</b><p>${s[1]}</p></div>`).join('');function renderDerive(){$$('.derive-line').forEach((e,i)=>e.className='derive-line '+(i===deriveStep?'current':i<deriveStep?'done':''));$('#deriveCount').textContent=`${deriveStep+1} / ${steps.length}`;$('#prevDerive').disabled=deriveStep===0;$('#nextDerive').textContent=deriveStep===steps.length-1?'符号を調べる →':'次の変形 →'}$('#nextDerive').onclick=()=>deriveStep===steps.length-1?switchTab('sign'):(deriveStep++,renderDerive());$('#prevDerive').onclick=()=>{deriveStep=Math.max(0,deriveStep-1);renderDerive()};
function space(){
 const c=$('#spaceCanvas');if(!c)return;const [g,w,h]=resize(c);g.clearRect(0,0,w,h);
 // Preserve main's coordinates: (x, f(x), f′(x)), rather than flattening f′ to zero.
 const project=(a,b,z)=>{a=(a-PI)*.75;b*=1.2;z*=.75;let X=a*Math.cos(yaw)-z*Math.sin(yaw),Z=a*Math.sin(yaw)+z*Math.cos(yaw),Y=b*Math.cos(pitch)-Z*Math.sin(pitch);Z=b*Math.sin(pitch)+Z*Math.cos(pitch);const s=75*zoom/(1+Z*.055);return[w/2+X*s,h/2-Y*s,s]};
 const floorY=-1.7,grid=[];
 for(let i=0;i<=8;i++){const a=i/8*2*PI;grid.push([project(a,floorY,-2),project(a,floorY,2)])}
 grid.forEach(p=>line(g,p.map(q=>q.slice(0,2)),'#1c3550'));
 for(let i=0;i<spaceSamples.length-1;i++){
  const a=spaceSamples[i],b=spaceSamples[i+1],col=d((a+b)/2)>=0?'#32e5a0':'#ff5d78';
  line(g,[project(a,floorY,0).slice(0,2),project(b,floorY,0).slice(0,2)],col,5,9);
  line(g,[project(a,f(a),d(a)).slice(0,2),project(b,f(b),d(b)).slice(0,2)],col,3,6);
 }
 const labels=[];
 importantPoints.forEach(point=>{
  const q=project(point.x,point.y,d(point.x)),floor=project(point.x,floorY,0);
  line(g,[q.slice(0,2),floor.slice(0,2)],point.color,point.flat?1.5:2,point.flat?6:12);
  g.save();g.strokeStyle=point.color;g.lineWidth=point.flat?2:3;g.shadowColor=point.color;g.shadowBlur=point.flat?10:22;
  g.beginPath();g.arc(q[0],q[1],point.flat?7:10,0,2*PI);g.stroke();
  g.fillStyle=point.color;g.beginPath();g.arc(q[0],q[1],point.flat?4:6,0,2*PI);g.fill();g.restore();
  labels.push({point,q});
 });
 const p=project(x,f(x),d(x)),floor=project(x,floorY,0);
 line(g,[p.slice(0,2),floor.slice(0,2)],'#ffe07d',2,10);
 g.save();g.fillStyle='#fff';g.shadowColor='#fff';g.shadowBlur=18;g.beginPath();g.arc(p[0],p[1],7,0,2*PI);g.fill();g.restore();
 // Paint opaque labels last, keep them inside the viewport and separate overlapping badges.
 const placed=[];
 g.save();g.font='700 13px sans-serif';g.shadowBlur=0;
 labels.forEach(({point,q})=>{
  const bw=g.measureText(point.label).width+16,bh=24;
  const left=Math.max(4,Math.min(w-bw-4,q[0]+14));
  const preferred=Math.max(30,Math.min(h-bh-4,q[1]-30));
  const candidates=[preferred,...Array.from({length:Math.max(1,Math.floor((h-38)/28))},(_,i)=>30+i*28)];
  const top=candidates.find(y=>!placed.some(r=>left<r.left+r.width+4&&left+bw+4>r.left&&y<r.top+bh+4&&y+bh+4>r.top))??preferred;
  placed.push({left,top,width:bw});
  line(g,[q.slice(0,2),[left+bw/2,top+bh/2]],point.color,1);
  g.fillStyle='#071225';g.fillRect(left,top,bw,bh);g.strokeStyle=point.color;g.lineWidth=1;g.strokeRect(left,top,bw,bh);
  g.fillStyle=point.color;g.fillText(point.label,left+8,top+17);
 });
 g.fillStyle='#8da4be';g.font='11px sans-serif';g.fillText('x →',w-45,h-25);g.fillText('高さ f(x) / 傾き f′(x)',15,22);g.restore();
}
const sc=$('#spaceCanvas'),pointers=new Map();
let pinchDistance=0;
const distance=()=>{const [a,b]=[...pointers.values()];return Math.hypot(a[0]-b[0],a[1]-b[1])};
sc.addEventListener('pointerdown',e=>{e.preventDefault();pointers.set(e.pointerId,[e.clientX,e.clientY]);sc.setPointerCapture(e.pointerId);if(pointers.size===2)pinchDistance=distance()});
sc.addEventListener('pointermove',e=>{const previous=pointers.get(e.pointerId);if(!previous)return;e.preventDefault();pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===1){yaw+=(e.clientX-previous[0])*.008;pitch=Math.max(-1,Math.min(1,pitch+(e.clientY-previous[1])*.006))}else if(pointers.size===2){const nextDistance=distance();if(pinchDistance)zoom=Math.max(.55,Math.min(1.8,zoom*nextDistance/pinchDistance));pinchDistance=nextDistance}space()});
const releasePointer=e=>{pointers.delete(e.pointerId);pinchDistance=pointers.size===2?distance():0};
sc.addEventListener('pointerup',releasePointer);sc.addEventListener('pointercancel',releasePointer);sc.addEventListener('lostpointercapture',releasePointer);
sc.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.55,Math.min(1.8,zoom*(e.deltaY>0?.92:1.08)));space()},{passive:false});
function drawAll(){graph();drawBar('#bar1',t=>1+Math.sin(t));drawBar('#bar2',t=>1-2*Math.sin(t));drawBar('#barD',d);space()}addEventListener('resize',drawAll);renderDerive();update();

