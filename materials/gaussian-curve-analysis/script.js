import renderMathInElement from 'katex/contrib/auto-render'
import 'katex/dist/katex.min.css'

const $ = (q, root = document) => root.querySelector(q)
const $$ = (q, root = document) => [...root.querySelectorAll(q)]
const state = { x: -3, a: 2, tab: 'observe', playing: false, reveal: 0 }
const f = x => Math.exp(-state.a * x * x)
const fp = x => -2 * state.a * x * f(x)
const fpp = x => 2 * state.a * (2 * state.a * x * x - 1) * f(x)
const fix = (n, d = 3) => Math.abs(n) < 5e-7 ? (0).toFixed(d) : n.toFixed(d).replace('-', '−')

const graph = $('#graph'), ctx = graph.getContext('2d')
function fit(canvas) {
  const dpr = Math.min(devicePixelRatio || 1, 2), r = canvas.getBoundingClientRect()
  if (canvas.width !== Math.round(r.width * dpr) || canvas.height !== Math.round(r.height * dpr)) {
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr)
  }
  const c = canvas.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); return [c, r.width, r.height]
}
function drawAxes(c, w, h, ymin = -.35, ymax = 1.2) {
  const X = x => (x + 3.2) / 6.4 * w, Y = y => h - (y - ymin) / (ymax - ymin) * h
  c.clearRect(0, 0, w, h); c.strokeStyle = '#1c314b'; c.lineWidth = 1
  for (let x = -3; x <= 3; x++) { c.beginPath(); c.moveTo(X(x), 0); c.lineTo(X(x), h); c.stroke() }
  for (let y = Math.ceil(ymin * 4) / 4; y < ymax; y += .25) { c.beginPath(); c.moveTo(0, Y(y)); c.lineTo(w, Y(y)); c.stroke() }
  c.strokeStyle = '#8191a7'; c.lineWidth = 1.5;c.beginPath();c.moveTo(0,Y(0));c.lineTo(w,Y(0));c.moveTo(X(0),0);c.lineTo(X(0),h);c.stroke()
  c.fillStyle='#9cadc1';c.font='11px system-ui'; for(let x=-3;x<=3;x++)c.fillText(String(x),X(x)+3,Y(0)+14)
  return { X, Y }
}
function path(c, fn, X, Y, from, to, color, width = 2.5) {
  c.beginPath(); let first = true
  for (let x = from; x <= to; x += .018) { const y=fn(x); if(Number.isFinite(y)){first?c.moveTo(X(x),Y(y)):c.lineTo(X(x),Y(y));first=false} }
  c.strokeStyle=color;c.lineWidth=width;c.stroke()
}
function dot(c,x,y,X,Y,color,r=6){c.save();c.shadowColor=color;c.shadowBlur=14;c.fillStyle=color;c.beginPath();c.arc(X(x),Y(y),r,0,Math.PI*2);c.fill();c.restore()}
function drawMain() {
  const [c,w,h]=fit(graph), {X,Y}=drawAxes(c,w,h)
  if(state.tab==='second'){ // curvature regions
    const inf=1/Math.sqrt(2*state.a);c.globalAlpha=.09;c.fillStyle='#65b8ff';c.fillRect(0,0,X(-inf),h);c.fillRect(X(inf),0,w-X(inf),h);c.fillStyle='#c792ff';c.fillRect(X(-inf),0,X(inf)-X(-inf),h);c.globalAlpha=1
  }
  const end=state.tab==='observe'?state.x:3.2; path(c,f,X,Y,-3.2,end,'#ffd166',3)
  const x=state.x,y=f(x),s=fp(x); dot(c,x,y,X,Y,'#ffd166',7)
  if(state.tab==='observe'){dot(c,-x,y,X,Y,'#c792ff',5);c.setLineDash([4,5]);c.strokeStyle='#c792ff';c.beginPath();c.moveTo(X(x),Y(y));c.lineTo(X(-x),Y(y));c.stroke();c.setLineDash([])}
  if(['first','second','table'].includes(state.tab)){
    const dx=.48, color=Math.abs(s)<.015?'#ffd166':s>0?'#45d49d':'#ff6b76';c.strokeStyle=color;c.lineWidth=3;c.beginPath();c.moveTo(X(x-dx),Y(y-s*dx));c.lineTo(X(x+dx),Y(y+s*dx));c.stroke()
  }
  if(state.tab==='second'){
    const inf=1/Math.sqrt(2*state.a);[-inf,inf].forEach(v=>{c.setLineDash([5,5]);c.strokeStyle='#c792ff';c.beginPath();c.moveTo(X(v),0);c.lineTo(X(v),h);c.stroke();c.setLineDash([]);dot(c,v,f(v),X,Y,'#c792ff',6)})
    ;[-.16,.16].forEach(d=>{let xx=x+d,ss=fp(xx),dx=.17;c.strokeStyle='#65b8ff';c.lineWidth=1.5;c.beginPath();c.moveTo(X(xx-dx),Y(f(xx)-ss*dx));c.lineTo(X(xx+dx),Y(f(xx)+ss*dx));c.stroke()})
  }
  if(state.tab==='complete'&&state.reveal>=6){c.strokeStyle='#ff9f43';c.shadowColor='#ff9f43';c.shadowBlur=10;c.lineWidth=3;c.beginPath();c.moveTo(0,Y(0));c.lineTo(w,Y(0));c.stroke();c.shadowBlur=0}
  c.fillStyle='#ffd166';c.font='bold 12px system-ui';c.fillText('P',X(x)+10,Y(y)-8)
}
function intervalIndex(x){if(x<-.5)return 1;if(Math.abs(x+.5)<.006)return 2;if(x<0)return 3;if(Math.abs(x)<.006)return 4;if(x<.5)return 5;if(Math.abs(x-.5)<.006)return 6;return 7}
function update() {
  const {x}=state, y=f(x),d1=fp(x),d2=fpp(x), inf=1/Math.sqrt(2*state.a)
  $('#xRange').value=String(x);$('#aRange').value=String(state.a);$('#xOut').textContent=fix(x,2);$('#aOut').textContent=state.a.toFixed(2)
  $('#vx').textContent=fix(x);$('#vf').textContent=fix(y);$('#vfp').textContent=fix(d1);$('#vfpp').textContent=fix(d2)
  $('#motion').textContent=Math.abs(d1)<.001?'停留（f′=0）':d1>0?'増加 ↑（f′>0）':'減少 ↓（f′<0）'
  $('#curve').textContent=Math.abs(d2)<.003?'変曲（f″=0）':d2>0?'下に凸（f″>0）':'上に凸（f″<0）'
  $('#status').innerHTML=Math.abs(x)<.006?'<b>極大点 (0, 1)</b>：増加から減少へ':Math.abs(Math.abs(x)-inf)<.008?`<b>変曲点</b>：曲がり方が交代（高さ ${fix(y)}）`:d1>0?'上り坂：接線の傾きは正':'下り坂：接線の傾きは負'
  $$('#variation tr').forEach(row=>$$('th,td',row).forEach((cell,i)=>cell.classList.toggle('current-cell',i===intervalIndex(x))))
  $('#distance').textContent=Math.abs(x).toFixed(2);$('#intensity').textContent=y.toFixed(3);$('#beam i').style.left=`${(x+3)/6*100}%`;$('#particle').style.left=`calc(${(x+3)/6*100}% - 6px)`
  drawMain(); drawSmall()
}
$('#xRange').addEventListener('input',e=>{state.x=+e.target.value;update()});$('#aRange').addEventListener('input',e=>{state.a=+e.target.value;update()})
$('#play').addEventListener('click',()=>{state.playing=!state.playing;$('#play').textContent=state.playing?'❚❚ 一時停止':'▶ 自動再生';if(state.playing&&state.x>=2.99)state.x=-3;animate()})
function animate(){if(!state.playing)return;state.x=Math.min(3,state.x+.018);update();if(state.x>=3){state.playing=false;$('#play').textContent='▶ 自動再生'}else requestAnimationFrame(animate)}

$$('.tabs button').forEach(b=>b.addEventListener('click',()=>{$$('.tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.panel').forEach(x=>x.classList.remove('active'));state.tab=b.dataset.tab;$('#'+state.tab).classList.add('active');$('#graphTitle').textContent={observe:'点を動かして、形を予想しよう',first:'接線の傾きと増減',second:'曲率と変曲点',table:'3つの値を同時に読む',complete:'根拠を重ねて完成',three:'1Dから2Dへの拡張',real:'現象と数式をつなぐ',quiz:'自分で確かめる'}[state.tab];update();if(state.tab==='three')drawSurface()}))
$$('#variation button').forEach(b=>b.addEventListener('click',()=>{state.x=+b.dataset.x;update()}));$$('[data-far]').forEach(b=>b.addEventListener('click',()=>{state.x=+b.dataset.far*3;update()}))

function drawSmall(){ $$('.triptych canvas').forEach((canvas,i)=>{const [c,w,h]=fit(canvas),kind=canvas.dataset.kind,fn={f,fp,fpp}[kind],range=kind==='f'?[-.2,1.1]:kind==='fp'?[-1.8,1.8]:[-4.5,2.5],{X,Y}=drawAxes(c,w,h,...range),colors=['#ffd166','#45d49d','#65b8ff'];path(c,fn,X,Y,-3.2,3.2,colors[i],2);c.strokeStyle='#fff6';c.setLineDash([3,3]);c.beginPath();c.moveTo(X(state.x),0);c.lineTo(X(state.x),h);c.stroke();c.setLineDash([]);dot(c,state.x,fn(state.x),X,Y,colors[i],4);c.fillStyle=colors[i];c.font='bold 12px system-ui';c.fillText(["f(x)","f′(x)","f″(x)"][i],8,16)})}
$('#reveal').addEventListener('click',()=>{if(state.reveal<6)state.reveal++;$$('#revealList li').forEach((li,i)=>li.classList.toggle('shown',i<state.reveal));update()});$('#resetReveal').addEventListener('click',()=>{state.reveal=0;$$('#revealList li').forEach(li=>li.classList.remove('shown'));update()})

// Dependency-free canvas 3D: the mesh remains available when WebGL is unavailable.
const surface=$('#surface'), surf={yaw:-.65,pitch:.7,zoom:1,drag:false,last:[0,0],slice:false}
function drawSurface(){const [c,w,h]=fit(surface);c.clearRect(0,0,w,h);const project=(x,y,z)=>{let cy=Math.cos(surf.yaw),sy=Math.sin(surf.yaw),cp=Math.cos(surf.pitch),sp=Math.sin(surf.pitch),X=x*cy-y*sy,Y=x*sy+y*cy,Z=z*2.5-1.1,Y2=Y*cp-Z*sp,Z2=Y*sp+Z*cp,scale=Math.min(w,h)*.13*surf.zoom/(1+Z2*.055);return[w/2+X*scale,h*.57+Y2*scale]};const N=26,lo=-2,step=4/N;c.lineWidth=.8;for(let j=0;j<=N;j++){c.beginPath();for(let i=0;i<=N;i++){let x=lo+i*step,y=lo+j*step,z=Math.exp(-2*(x*x+y*y)),p=project(x,y,z);i?c.lineTo(...p):c.moveTo(...p)}c.strokeStyle=`rgba(101,184,255,${.22+j/N*.35})`;c.stroke()}for(let i=0;i<=N;i++){c.beginPath();for(let j=0;j<=N;j++){let x=lo+i*step,y=lo+j*step,z=Math.exp(-2*(x*x+y*y)),p=project(x,y,z);j?c.lineTo(...p):c.moveTo(...p)}c.strokeStyle='#65b8ff55';c.stroke()}if(surf.slice){c.beginPath();for(let i=0;i<=100;i++){let x=-2+i*.04,p=project(x,0,Math.exp(-2*x*x));i?c.lineTo(...p):c.moveTo(...p)}c.strokeStyle='#ffd166';c.lineWidth=4;c.shadowColor='#ffd166';c.shadowBlur=10;c.stroke();c.shadowBlur=0}c.fillStyle='#dbe9fa';c.font='12px system-ui';c.fillText('ドラッグ：回転　ホイール／ピンチ：拡大・縮小',10,h-12)}
surface.addEventListener('pointerdown',e=>{surf.drag=true;surf.last=[e.clientX,e.clientY];surface.setPointerCapture(e.pointerId)});surface.addEventListener('pointermove',e=>{if(!surf.drag)return;surf.yaw+=(e.clientX-surf.last[0])*.01;surf.pitch=Math.max(.15,Math.min(1.4,surf.pitch+(e.clientY-surf.last[1])*.01));surf.last=[e.clientX,e.clientY];drawSurface()});surface.addEventListener('pointerup',()=>surf.drag=false);surface.addEventListener('wheel',e=>{e.preventDefault();surf.zoom=Math.max(.55,Math.min(1.8,surf.zoom-e.deltaY*.001));drawSurface()},{passive:false});$('#slice').addEventListener('click',()=>{surf.slice=!surf.slice;$('#sliceText').classList.toggle('shown',surf.slice);$('#slice').textContent=surf.slice?'断面を隠す':'断面を見る';drawSurface()})

const questions=[
 ['\\(y\'\\) を求める','合成関数の微分を使い、指数部分も微分しよう。','指数 \\(-x^2/2\\) の微分は？','\\(y\'=-xe^{-x^2/2}\\)'],
 ['\\(y\'=0\\) を解く','指数関数が常に正であることを使おう。','\\(e^{-x^2/2}>0\\)','\\(x=0\\)'],
 ['増減を判断','\\(y\'\\) の符号はどこで変わる？','\\(-x\\) の符号表を書こう。','\\(x<0\\) で増加、\\(x>0\\) で減少。\\((0,1)\\) は極大点。'],
 ['\\(y\'\'\\) を求める','積の微分を使おう。','\\((-x)\'=-1\\)','\\(y\'\'=(x^2-1)e^{-x^2/2}\\)'],
 ['\\(y\'\'=0\\) を解く','正の指数因子を除いて考えよう。','\\(x^2-1=0\\)','\\(x=\\pm1\\)'],
 ['凹凸を判断','\\(x^2-1\\) の符号を調べよう。','\\(|x|=1\\) を境に符号が変わる。','\\(|x|>1\\) で \\(y\'\'>0\\)、\\(|x|<1\\) で \\(y\'\'<0\\)。変曲点は \\(\\left(\\pm1,e^{-1/2}\\right)\\)。'],
 ['極限を調べる','左右へ遠ざかると指数はどうなる？','\\(-x^2/2\\to-\\infty\\)','\\(\\lim_{x\\to\\pm\\infty}e^{-x^2/2}=0\\)。水平漸近線は \\(y=0\\)。'],
 ['グラフを完成','対称性・極大・変曲点・漸近線を統合しよう。','偶関数なので \\(y\\) 軸対称。','\\(y\\) 軸対称で \\((0,1)\\) が極大、\\(\\pm1,e^{-1/2}\\) が変曲点。両端で \\(y=0\\) に上側から近づく。']]
const typeset = root => renderMathInElement(root,{delimiters:[{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true}],throwOnError:false})
let qi=0;function renderQuiz(){let q=questions[qi];$('#qnum').textContent=`${qi+1} / 8`;$('#qtitle').innerHTML=q[0];$('#qprompt').innerHTML=q[1];$('#qanswer').hidden=true;$('#qanswer').innerHTML='';$$('#progress li').forEach((li,i)=>{li.classList.toggle('done',i<qi);li.classList.toggle('current',i===qi)});typeset($('#quiz'))}$('#hint').addEventListener('click',()=>{$('#qanswer').hidden=false;$('#qanswer').innerHTML='ヒント：'+questions[qi][2];typeset($('#qanswer'))});$('#answer').addEventListener('click',()=>{$('#qanswer').hidden=false;$('#qanswer').innerHTML='解答：'+questions[qi][3];typeset($('#qanswer'))});$('#next').addEventListener('click',()=>{qi=(qi+1)%questions.length;renderQuiz()})
typeset(document.body);window.addEventListener('resize',()=>{drawMain();drawSmall();drawSurface()});renderQuiz();update();drawSurface()
