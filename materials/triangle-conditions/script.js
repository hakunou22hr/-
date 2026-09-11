import { isAcute, isTriangle, maxSideCase, triangleVertex } from './logic.js'
export { isAcute, isTriangle, maxSideCase, triangleVertex } from './logic.js'

const $ = s => document.querySelector(s)
const $$ = s => [...document.querySelectorAll(s)]
const NS = 'http://www.w3.org/2000/svg'
const xRange = $('#xRange')

function svgEl(name, attrs, text='') { const e=document.createElementNS(NS,name); Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v))); e.textContent=text; return e }
function drawTriangle(x) {
  const svg=$('#triangle'); svg.replaceChildren(); const valid=isTriangle(x)
  // AB=4, AC=3, BC=x を同じ縮尺（105px/単位）で描く。
  const unit=105, A={x:105,y:310}, B={x:105+4*unit,y:310}; let C
  if(valid){const {u,v}=triangleVertex(x); C={x:A.x+u*unit,y:A.y-v*unit}}
  else C=x<=1?{x:A.x+3*unit,y:A.y-18}:{x:A.x-3*unit,y:A.y-18}
  const color=valid?'#17b8a1':'#ef5965'
  const defs=svgEl('defs',{}), glow=svgEl('filter',{id:'edgeGlow',x:'-30%',y:'-30%',width:'160%',height:'160%'}); glow.append(svgEl('feGaussianBlur',{stdDeviation:4,result:'blur'}),svgEl('feMerge',{})); defs.append(glow); svg.append(defs)
  svg.append(svgEl('line',{x1:A.x,y1:A.y,x2:B.x,y2:B.y,stroke:'#1677d2','stroke-width':9,'stroke-linecap':'round'}))
  svg.append(svgEl('line',{x1:A.x,y1:A.y,x2:C.x,y2:C.y,stroke:color,'stroke-width':9,'stroke-linecap':'round'}))
  if(valid) svg.append(svgEl('line',{x1:B.x,y1:B.y,x2:C.x,y2:C.y,stroke:color,'stroke-width':9,'stroke-linecap':'round'}))
  else {
    const dx=C.x-B.x,dy=C.y-B.y,d=Math.hypot(dx,dy)||1,end={x:B.x+dx/d*x*unit,y:B.y+dy/d*x*unit}
    svg.append(svgEl('line',{x1:B.x,y1:B.y,x2:end.x,y2:end.y,stroke:color,'stroke-width':9,'stroke-linecap':'round','stroke-dasharray':'13 9'}))
    svg.append(svgEl('line',{x1:C.x,y1:C.y,x2:end.x,y2:end.y,stroke:'#ef596588','stroke-width':2,'stroke-dasharray':'5 6'}))
    svg.append(svgEl('text',{x:(C.x+end.x)/2,y:Math.min(C.y,end.y)-15,'text-anchor':'middle',fill:'#c83849','font-size':15,'font-weight':800},x<=1?'届かない！':'交点ができない！'))
  }
  ;[A,B,C].forEach(p=>svg.append(svgEl('circle',{cx:p.x,cy:p.y,r:7,fill:'#fff',stroke:color,'stroke-width':4})))
  svg.append(svgEl('text',{x:(A.x+B.x)/2,y:A.y+34,'text-anchor':'middle',fill:'#1677d2','font-size':22,'font-weight':800},'4（固定）'))
  svg.append(svgEl('text',{x:(A.x+C.x)/2-18,y:(A.y+C.y)/2-10,fill:'#087d68','font-size':22,'font-weight':800},'3'))
  const xEnd=valid?C:(()=>{const dx=C.x-B.x,dy=C.y-B.y,d=Math.hypot(dx,dy)||1;return{x:B.x+dx/d*x*unit,y:B.y+dy/d*x*unit}})()
  svg.append(svgEl('text',{x:(B.x+xEnd.x)/2+18,y:(B.y+xEnd.y)/2-10,fill:'#c83849','font-size':22,'font-weight':800},'x = '+x.toFixed(1)))
  svg.append(svgEl('text',{x:A.x,y:A.y+62,'text-anchor':'middle',fill:'#64798c','font-size':14},'A'))
  svg.append(svgEl('text',{x:B.x,y:B.y+62,'text-anchor':'middle',fill:'#64798c','font-size':14},'B'))
  $('#visualCard').className='visual-card '+(valid?'valid':'invalid'); $('#status').textContent=valid?'できる':'できない'
  $('#kind').textContent=!valid?'三角形が成立しません':isAcute(x)?'鋭角三角形':(Math.abs(x-Math.sqrt(7))<.051||Math.abs(x-5)<.051?'直角三角形':'鈍角三角形')
  $('#edgeNote').textContent=!valid?(x<=1?'辺3と辺xをつないでも、底辺4まで届きません。':'辺xが長すぎて交点を作れません。'):(Math.min(x-1,7-x)<.35?'高さが小さくなり、一直線につぶれそう！':'辺4 ＞ 辺3。すべて同じ縮尺で描いています。')
}
function update(){const x=Number(xRange.value);$('#xOut').textContent=x.toFixed(1);$('#compareX').textContent=x.toFixed(1);const c=maxSideCase(x);$('#compareSign').textContent=x<4?'>':x>4?'<':'＝';$('#maxMessage').textContent=x<4?'最大辺は 4 → 辺4の向かいの角に注目':x>4?'最大辺は x → 辺xの向かいの角に注目':'4 と x は同じ長さ（どちらの式でも確認できる）';drawTriangle(x)}

function numberline(container, rows, min=-2,max=8){const W=900,left=105,right=25,rowGap=42,axisY=rows.length*rowGap+48,H=axisY+42,scale=v=>left+(v-min)/(max-min)*(W-left-right);let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="1本の共通x軸上に条件を段差表示した数直線"><defs><filter id="lineGlow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;rows.forEach((r,i)=>{const y=25+i*rowGap,isCommon=r.label==='共通';s+=`<text x="6" y="${y+5}" font-size="14" font-weight="800" fill="${r.color}">${isCommon?'共通の範囲':r.label}</text><line x1="${left}" y1="${y}" x2="${W-right}" y2="${y}" stroke="#dce7ed" stroke-width="2" stroke-dasharray="3 6"/>`;const a=Math.max(min,r.from),b=Math.min(max,r.to);s+=`<line x1="${scale(a)}" y1="${y}" x2="${scale(b)}" y2="${y}" stroke="${r.color}" stroke-width="${isCommon?14:9}" stroke-linecap="round" ${isCommon?'filter="url(#lineGlow)"':''}/>`;if(r.from>min)s+=`<circle cx="${scale(r.from)}" cy="${y}" r="7" fill="${r.openFrom?'white':r.color}" stroke="${r.color}" stroke-width="3"/>`;if(r.to<max)s+=`<circle cx="${scale(r.to)}" cy="${y}" r="7" fill="${r.openTo?'white':r.color}" stroke="${r.color}" stroke-width="3"/>`});s+=`<line x1="${left}" y1="${axisY}" x2="${W-right}" y2="${axisY}" stroke="#526f83" stroke-width="3"/><path d="M${W-right},${axisY} l-10,-6 v12 z" fill="#526f83"/><text x="${W-17}" y="${axisY-9}" fill="#526f83" font-weight="800">x</text>`;for(let n=min;n<=max;n++)s+=`<line x1="${scale(n)}" y1="${axisY-6}" x2="${scale(n)}" y2="${axisY+6}" stroke="#526f83"/><text x="${scale(n)}" y="${axisY+24}" text-anchor="middle" font-size="12" fill="#526f83">${n}</text>`;container.innerHTML=s+'</svg>'}
function renderLine1(){const checked=new Set($$('#conditionToggles input:checked').map(e=>e.value));const rows=[];if(checked.has('lt7'))rows.push({label:'x<7',from:-2,to:7,openTo:true,color:'#1db8cf'});if(checked.has('gt1'))rows.push({label:'x>1',from:1,to:8,openFrom:true,color:'#ff9d3d'});if(checked.has('gtn1'))rows.push({label:'x>−1',from:-1,to:8,openFrom:true,color:'#8c72d9'});if(checked.size===3)rows.push({label:'共通',from:1,to:7,openFrom:true,openTo:true,color:'#087d68'});numberline($('#line1'),rows)}
function drawGraphs(){ $$('canvas[data-graph]').forEach(c=>{const ctx=c.getContext('2d'),up=c.dataset.graph==='up',W=c.width,H=c.height,sx=x=>W/2+x*42,sy=y=>H/2-y*4;ctx.clearRect(0,0,W,H);ctx.strokeStyle='#9bb0be';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(25,sy(0));ctx.lineTo(W-20,sy(0));ctx.moveTo(sx(0),15);ctx.lineTo(sx(0),H-15);ctx.stroke();ctx.fillStyle='#718797';ctx.font='12px sans-serif';ctx.fillText('x',W-25,sy(0)-7);ctx.fillText('y',sx(0)+7,17);ctx.strokeStyle='#1677d2';ctx.lineWidth=4;ctx.beginPath();for(let px=25;px<W-20;px++){let x=(px-W/2)/42,y=up?x*x-7:25-x*x;let py=sy(y);px===25?ctx.moveTo(px,py):ctx.lineTo(px,py)}ctx.stroke();const roots=up?[-Math.sqrt(7),Math.sqrt(7)]:[-5,5];roots.forEach(r=>{ctx.fillStyle='#ef5965';ctx.beginPath();ctx.arc(sx(r),sy(0),5,0,Math.PI*2);ctx.fill();ctx.fillText((r<0?'−':'')+(up?'√7':'5'),sx(r)-11,sy(0)+19)});ctx.strokeStyle='#18b89f';ctx.lineWidth=7;ctx.beginPath();if(up){ctx.moveTo(25,sy(0));ctx.lineTo(sx(roots[0]),sy(0));ctx.moveTo(sx(roots[1]),sy(0));ctx.lineTo(W-20,sy(0))}else{ctx.moveTo(sx(-5),sy(0));ctx.lineTo(sx(5),sy(0))}ctx.stroke()})}

xRange.addEventListener('input',update);$$('[data-x]').forEach(b=>b.onclick=()=>{xRange.value=b.dataset.x;update()});$$('[data-jump]').forEach(b=>b.onclick=()=>$('#step'+Math.min(Number(b.dataset.jump),7)).scrollIntoView({behavior:'smooth'}));$('#triangleReveal [data-reveal]').onclick=e=>{const s=$('#triangleReveal .reveal-stage'),n=Math.min(3,Number(s.dataset.level)+1);s.dataset.level=String(n);e.currentTarget.innerHTML=n<3?'次の式へ <span>→</span>':'3つの共通部分！'};$$('#conditionToggles input').forEach(i=>i.onchange=renderLine1);$$('[data-case]').forEach(b=>b.onclick=()=>{$$('[data-case]').forEach(x=>x.classList.toggle('active',x===b));$$('.case-content').forEach(x=>x.classList.toggle('hidden',x.id!=='case'+b.dataset.case))});$$('.reveal-case').forEach(b=>b.onclick=()=>{$('#'+b.dataset.target).classList.add('open');b.style.display='none'});$('#showGraphs').onclick=()=>{$('#graphs').classList.remove('hidden');drawGraphs()};$('#showCaseLine').onclick=()=>$('#caseLine').scrollIntoView({behavior:'smooth',block:'center'});$('#answerButton').onclick=()=>{$('#answers').classList.add('open');$('#answerButton').style.display='none'};$('#reset').onclick=()=>{xRange.value=3;update();$('#triangleReveal .reveal-stage').dataset.level='0';$$('.case-steps').forEach(x=>x.classList.remove('open'));$$('.reveal-case').forEach(x=>x.style.display='');$('#graphs').classList.add('hidden');$('#answers').classList.remove('open');$('#answerButton').style.display='';window.scrollTo({top:0,behavior:'smooth'})}
numberline($('#caseLine'),[{label:'場合1',from:Math.sqrt(7),to:4,openFrom:true,color:'#1db8cf'},{label:'場合2',from:4,to:5,openTo:true,color:'#ff9d3d'}],0,7)
numberline($('#finalLine'),[{label:'成立',from:1,to:7,openFrom:true,openTo:true,color:'#9ab3c3'},{label:'場合1',from:Math.sqrt(7),to:4,openFrom:true,color:'#1db8cf'},{label:'場合2',from:4,to:5,openTo:true,color:'#ff9d3d'},{label:'鋭角',from:Math.sqrt(7),to:5,openFrom:true,openTo:true,color:'#087d68'}],0,8)
renderLine1();update()
