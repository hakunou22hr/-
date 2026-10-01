const $ = (s) => document.querySelector(s)
const $$ = (s) => [...document.querySelectorAll(s)]
const f = x => x === 1 ? NaN : x * x / (x - 1)
const d1 = x => x === 1 ? NaN : x * (x - 2) / ((x - 1) ** 2)
const d2 = x => x === 1 ? NaN : 2 / ((x - 1) ** 3)
const tabs = ['まず関数を見る', "f′ と増減", "f″ と凹凸", '漸近線', '増減・凹凸表', 'グラフ完成', '3D解析', '現実世界', '確認問題']
const state = { tab: 0, x: -2, range: 10, zoom: false, reveal: 0, show: { graph: true, vertical: true, oblique: true, tangent: true, d1: false, d2: false }, threeMode: false, quiz: 0, rotX: -.35, rotY: .65, zMode: 'd1', a: 1 }

$('#tabs').innerHTML = tabs.map((t, i) => `<button data-tab="${i}" class="${i === 0 ? 'active' : ''}">${i + 1}. ${t}</button>`).join('')

const lessons = [
  `<span class="step">STEP 01 / DOMAIN</span><h2>まず「描けない場所」を探そう</h2><div class="big-math">f(x) = x² / (x−1)</div><p class="question">問い：x=1 を代入すると、分母はどうなる？</p><p>分母が 0 になるため、<b>x=1 では定義されません</b>。グラフにとって「通過できない境界」です。</p><p class="warning">スライダーを x=1 に合わせて確かめよう。点Pは境界を通過せず、一度消えて反対側の枝に現れます。</p>`,
  `<span class="step">STEP 02–05 / FIRST DERIVATIVE</span><h2>傾きの符号から動きを読む</h2><div class="math-steps"><div>f = x+1 + 1/(x−1)</div><div>f′ = 1 − 1/(x−1)²</div><div>= ((x−1)²−1)/(x−1)²</div><div>= (x²−2x)/(x−1)²</div><div>= x(x−2)/(x−1)²</div></div><p class="question">なぜ (x−1)² は符号判断に影響しない？</p><p>(x−1)²&gt;0（x≠1）なので、符号は分子 x(x−2) だけで決まります。</p>`,
  `<span class="step">STEP 06–07 / SECOND DERIVATIVE</span><h2>曲がり方を見分ける</h2><div class="big-math">f″(x) = 2/(x−1)³</div><p><b>x&lt;1：f″&lt;0</b><br><b>x&gt;1：f″&gt;0</b></p><p class="warning"><b>x=1 は変曲点ではありません。</b> f″=0 でもなく、f 自体が未定義です。変曲点は曲線上の点である必要があります。</p><p class="question">符号が変わるだけでは、なぜ不十分だろう？</p>`,
  `<span class="step">STEP 08–11 / ASYMPTOTES</span><h2>2種類の漸近線を発見する</h2><div class="math-steps"><div>x² = (x−1)(x+1)+1</div><div>x²/(x−1) = x+1+1/(x−1)</div><div>f(x)−(x+1) = 1/(x−1)</div><div>x→±∞ で 1/(x−1)→0</div></div><p><b class="vertical">垂直：x=1</b><br><b class="oblique">斜：y=x+1</b></p><p class="question">垂直漸近線の左右で、なぜ逆方向へ発散する？</p>`,
  `<span class="step">STEP 04–07 / SIGN CHART</span><h2>増減と凹凸を1枚につなぐ</h2><p>0・1・2をタップして、表と点Pを同期しよう。x=1 は値ではなく断絶です。</p><p class="question">f′ のグラフだけから f の増減を予想できる？</p>`,
  `<span class="step">STEP 12 / CONSTRUCTION</span><h2>根拠を1つずつ重ねる</h2><p>完成図を覚えるのではなく、調べた情報から組み立てます。</p><div class="reveal-list"><button id="nextLayer">1つずつ表示</button><b id="layerText">開始前：座標軸だけ</b></div><p class="question">極大点・極小点では接線はどうなる？</p>`,
  `<span class="step">ANALYSIS SPACE</span><h2>値と傾きを同時に見る</h2><p>これは元の1変数関数を3D化したものではなく、<b>(x, f(x), f′(x))</b> または <b>(x, f(x), f″(x))</b> を観察する解析表示です。</p><p>x=1 の半透明面は「定義不能面」。ドラッグで回転、ホイールで拡大・縮小できます。</p>`,
  `<span class="step">MATHEMATICAL ANALOGY</span><h2>限界付近で急増する応答</h2><p>負荷 x と余裕 x−1 の比を考える<b>教材用の模式例</b>です。特定の実在システムを表す厳密な式ではありません。</p><p class="question">分母が 0 に近づくモデルは、どんな場面で注意が必要だろう？</p>`,
  `<span class="step">PRACTICE 35</span><h2>自力で概形を組み立てる</h2><div class="big-math">g(x)=(x²−x+4)/x</div><p>定義域から漸近線まで、10段階で挑戦しよう。</p><p class="question">まず「描けない場所」はどこ？</p>`
]

function currentCell(x) { if (x < 0) return 0; if (x === 0) return 1; if (x < 1) return 2; if (x === 1) return 3; if (x < 2) return 4; if (x === 2) return 5; return 6 }
function fmt(v) { return Number.isFinite(v) ? (Math.abs(v) > 999 ? (v > 0 ? '+∞' : '−∞') : v.toFixed(2).replace('-', '−')) : '—' }

function renderBelow() {
  const t = state.tab
  if (t === 1) $('#below').innerHTML = `<div class="wide-card"><h2>符号の地図</h2><table><tr><th>x</th><td>(−∞,0)</td><td>0</td><td>(0,1)</td><td class="blocked">1<br>未定義</td><td>(1,2)</td><td>2</td><td>(2,∞)</td></tr><tr><th>f′</th><td>＋ 増加</td><td>0</td><td>− 減少</td><td class="blocked">｜</td><td>− 減少</td><td>0</td><td>＋ 増加</td></tr></table></div>`
  else if (t === 3) $('#below').innerHTML = `<div class="wide-card"><h2>表示を比較する</h2><div class="toggle-row">${[['vertical','垂直漸近線'],['oblique','斜漸近線'],['graph','グラフ'],['tangent','接線'],['d1',"f′符号"],['d2',"f″符号"]].map(([k,l])=>`<label><input data-show="${k}" type="checkbox" ${state.show[k]?'checked':''}> ${l}</label>`).join('')}</div></div>`
  else if (t === 4) $('#below').innerHTML = `<div class="wide-card"><h2>動的 増減・凹凸表</h2><table id="signTable"><tr><th>x</th>${['−∞…0','0','0…1','1','1…2','2','2…∞'].map((v,i)=>`<td data-jump="${[null,0,.5,1,1.5,2,null][i]}" class="${i===3?'blocked ':''}${i===currentCell(state.x)?'current':''}">${v}</td>`).join('')}</tr><tr><th>f′</th><td>＋</td><td>0</td><td>−</td><td class="blocked">未定義</td><td>−</td><td>0</td><td>＋</td></tr><tr><th>f″</th><td>−</td><td>−</td><td>−</td><td class="blocked">未定義</td><td>＋</td><td>＋</td><td>＋</td></tr><tr><th>f</th><td>↗ 増加</td><td>極大<br>(0,0)</td><td>↘ 減少</td><td class="blocked">断絶</td><td>↘ 減少</td><td>極小<br>(2,4)</td><td>↗ 増加</td></tr></table></div>`
  else if (t === 5) $('#below').innerHTML = `<div class="wide-card"><h2>f・f′・f″ 同期ビュー</h2><button id="threeToggle">${state.threeMode?'通常グラフへ':'3グラフを同時表示'}</button><div class="three-canvases" ${state.threeMode?'':'hidden'}><canvas class="mini" id="miniF"></canvas><canvas class="mini" id="miniD1"></canvas><canvas class="mini" id="miniD2"></canvas></div></div>`
  else if (t === 6) $('#below').innerHTML = `<div class="wide-card mode3d"><canvas id="space3d" aria-label="3D解析空間"></canvas><div><h2>解析空間</h2><button data-z="d1" class="${state.zMode==='d1'?'active':''}">(x, f, f′)</button> <button data-z="d2" class="${state.zMode==='d2'?'active':''}">(x, f, f″)</button><p>橙色の面：x=1 定義不能面</p><p>水色線：斜漸近線の参考線</p><p>● 点Pは2Dグラフと同期</p></div></div>`
  else if (t === 7) $('#below').innerHTML = `<div class="wide-card"><h2>容量限界／フィードバックの模式メーター</h2><div class="meter"><i style="width:${Math.min(100,Math.abs(f(state.x))*8)}%"></i></div><p>分母 |x−1| が小さいほど応答が急増します。これは<b>数学的類似</b>であり、実在装置の厳密なモデルではありません。</p></div><div class="wide-card"><p class="eyebrow">発展探究（元問題とは別）</p><h2>y=x²/(x−a)</h2><p>「垂直漸近線は？」「斜漸近線の切片は？」「極値は？」まず予想してから動かそう。</p><label>a = <b id="aOut">${state.a.toFixed(1)}</b><input id="aSlider" type="range" min="0.5" max="3" step="0.1" value="${state.a}"></label><button id="aReveal">答えを確かめる</button><p id="aAnswer"></p></div>`
  else if (t === 8) renderQuiz()
  else $('#below').innerHTML = `<div class="wide-card"><h2>グラフを描く前の12ステップ</h2><p>①定義域 → ②式変形 → ③f′ → ④増減 → ⑤極値 → ⑥f″ → ⑦凹凸 → ⑧x=1付近 → ⑨垂直漸近線 → ⑩無限遠 → ⑪斜漸近線 → ⑫概形</p></div>`
  bindBelow(); drawAll()
}

const quizSteps = [
 ['定義域','分母 x に注目','x≠0'],['式の変形','x²−x+4 を x で割る','g=x−1+4/x'],["g′",'4/x を微分',"g′=1−4/x²"],["g′=0",'x²=4', 'x=−2, 2'],['増減','分母 x² は正', '増加：(−∞,−2),(2,∞)、減少：(−2,0),(0,2)'],["g″",'−4x⁻² を微分',"g″=8/x³"],['凹凸','x³の符号を見る','x<0 で負、x>0 で正。x=0は変曲点ではない'],['垂直漸近線','x→0±を調べる','x=0'],['斜漸近線','g−(x−1) を調べる','y=x−1'],['グラフ完成','極値と2本の漸近線を統合','極大(−2,−5)、極小(2,3)']]
function renderQuiz(){ const [title,hint,answer]=quizSteps[state.quiz]; $('#below').innerHTML=`<div class="wide-card"><p class="step">${state.quiz+1} / 10</p><h2>${title}</h2><div id="quizText">自分の式をノートに書いてから進もう。</div><div class="quiz-controls"><button id="hint">ヒント</button><button id="answer">解答を見る</button><button id="quizNext">次へ</button></div><template id="hintText">${hint}</template><template id="answerText">${answer}</template></div>` }

function bindBelow(){
  $$('[data-show]').forEach(el=>el.onchange=()=>{state.show[el.dataset.show]=el.checked;draw()})
  $$('[data-jump]').forEach(el=>el.onclick=()=>{const v=Number(el.dataset.jump); setX(v); if(v===1) $('#insight').textContent='この点では関数は定義されません。'})
  $('#threeToggle')?.addEventListener('click',()=>{state.threeMode=!state.threeMode;renderBelow()})
  $$('[data-z]').forEach(b=>b.onclick=()=>{state.zMode=b.dataset.z;renderBelow()})
  $('#aSlider')?.addEventListener('input',e=>{state.a=+e.target.value;$('#aOut').textContent=state.a.toFixed(1)})
  $('#aReveal')?.addEventListener('click',()=>$('#aAnswer').innerHTML=`垂直：x=${state.a.toFixed(1)} ／ 斜：y=x+${state.a.toFixed(1)} ／ 停留点：x=0, ${(2*state.a).toFixed(1)}`)
  $('#hint')?.addEventListener('click',()=>$('#quizText').textContent=$('#hintText').content.textContent)
  $('#answer')?.addEventListener('click',()=>$('#quizText').innerHTML=`<b>${$('#answerText').content.textContent}</b>`)
  $('#quizNext')?.addEventListener('click',()=>{state.quiz=(state.quiz+1)%10;renderBelow()})
  $('#nextLayer')?.addEventListener('click',()=>{state.reveal=Math.min(9,state.reveal+1);$('#layerText').textContent=['','① 定義域 x≠1','② 垂直漸近線 x=1','③ f′の符号','④ 極大点 (0,0)','⑤ 極小点 (2,4)','⑥ f″の符号','⑦ 斜漸近線 y=x+1','⑧ 左側の曲線','⑨ 右側の曲線：完成！'][state.reveal];draw()})
  const c=$('#space3d'); if(c) setup3D(c)
}

function renderTab(){ $('#lesson').innerHTML=lessons[state.tab]; $$('#tabs button').forEach((b,i)=>b.classList.toggle('active',i===state.tab)); $('#graphTitle').textContent=tabs[state.tab]; renderBelow(); update() }
$$('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=+b.dataset.tab;renderTab()})

function setupCanvas(c){const d=devicePixelRatio||1, r=c.getBoundingClientRect(); if(c.width!==Math.round(r.width*d)||c.height!==Math.round(r.height*d)){c.width=Math.round(r.width*d);c.height=Math.round(r.height*d)} const ctx=c.getContext('2d');ctx.setTransform(d,0,0,d,0,0);return {ctx,w:r.width,h:r.height}}
function drawGraph(c,fn=f,label='f(x)',mini=false){
  const {ctx,w,h}=setupCanvas(c), zoom=state.zoom&&!mini, xmin=zoom ? .5 : -state.range,xmax=zoom?1.5:state.range, yr=zoom?20:Math.max(6,state.range*.75), ymin=-yr,ymax=yr
  const X=x=>(x-xmin)/(xmax-xmin)*w, Y=y=>h-(y-ymin)/(ymax-ymin)*h
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#06121d';ctx.fillRect(0,0,w,h)
  if(state.show.d2&&!mini){ctx.fillStyle='#ff668510';ctx.fillRect(0,0,X(1),h);ctx.fillStyle='#49e6a410';ctx.fillRect(X(1),0,w-X(1),h)}
  ctx.strokeStyle='#173348';ctx.lineWidth=1;for(let x=Math.ceil(xmin);x<=xmax;x++){ctx.beginPath();ctx.moveTo(X(x),0);ctx.lineTo(X(x),h);ctx.stroke()}for(let y=Math.ceil(ymin);y<=ymax;y+=Math.max(1,Math.ceil(yr/6))){ctx.beginPath();ctx.moveTo(0,Y(y));ctx.lineTo(w,Y(y));ctx.stroke()}
  ctx.strokeStyle='#7895a7';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,Y(0));ctx.lineTo(w,Y(0));ctx.moveTo(X(0),h);ctx.lineTo(X(0),0);ctx.stroke();ctx.fillStyle='#a9c0ce';ctx.font='11px sans-serif';ctx.fillText('x →',w-25,Y(0)-7);ctx.fillText('y ↑',X(0)+7,13);ctx.fillText('O',X(0)+5,Y(0)+14)
  if(state.show.vertical){ctx.save();ctx.strokeStyle='#ff8a4c';ctx.shadowBlur=12;ctx.shadowColor='#ff8a4c';ctx.setLineDash([7,6]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(1),0);ctx.lineTo(X(1),h);ctx.stroke();ctx.restore();ctx.fillStyle='#ffad7d';ctx.fillText('x=1 通過できない境界',Math.min(w-145,X(1)+7),18)}
  if(state.show.oblique&&fn===f){ctx.strokeStyle='#55d8ff';ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(X(xmin),Y(xmin+1));ctx.lineTo(X(xmax),Y(xmax+1));ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#55d8ff';ctx.fillText('y=x+1',X(xmax)-55,Y(xmax+1)+15)}
  const allowGraph=state.tab!==0 && (state.tab!==5||state.reveal>=8); if(state.show.graph&&allowGraph){[[xmin,Math.min(.997,xmax)],[Math.max(1.003,xmin),xmax]].forEach(([a,b],idx)=>{if(a>=b)return;ctx.strokeStyle=idx?'#ffe5a3':'#ffd166';ctx.lineWidth=mini?2:3;ctx.shadowBlur=mini?0:5;ctx.shadowColor='#ffd166';ctx.beginPath();let began=false;for(let px=0;px<=w;px++){const x=a+(b-a)*px/w,y=fn(x);if(y<ymin*1.2||y>ymax*1.2){began=false;continue}if(!began){ctx.moveTo(X(x),Y(y));began=true}else ctx.lineTo(X(x),Y(y))}ctx.stroke();ctx.shadowBlur=0})}
  if(fn===f&&!mini&&state.x!==1){const y=f(state.x),s=d1(state.x);if(y>ymin&&y<ymax){if(state.show.tangent&&(state.tab===1||state.tab===3)){ctx.strokeStyle=Math.abs(s)<.01?'#55d8ff':s>0?'#49e6a4':'#ff6685';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(state.x-2),Y(y-2*s));ctx.lineTo(X(state.x+2),Y(y+2*s));ctx.stroke()}ctx.fillStyle='#fff';ctx.shadowBlur=15;ctx.shadowColor='#ffd166';ctx.beginPath();ctx.arc(X(state.x),Y(y),6,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}}
  if(fn===f&&!mini&&state.tab!==0){[[0,0,'極大 (0,0)'],[2,4,'極小 (2,4)']].forEach(([x,y,l])=>{if(y>ymin&&y<ymax){ctx.fillStyle='#ffd166';ctx.beginPath();ctx.arc(X(x),Y(y),5,0,7);ctx.fill();ctx.fillText(l,X(x)+8,Y(y)-8)}})}
  ctx.fillStyle='#c9dbe5';ctx.font='11px sans-serif';ctx.fillText(label,10,16)
  if(mini&&state.x!==1){ctx.strokeStyle='#fff8';ctx.beginPath();ctx.moveTo(X(state.x),0);ctx.lineTo(X(state.x),h);ctx.stroke()}
}
function draw(){drawGraph($('#graph'));if(state.threeMode){drawGraph($('#miniF'),f,'f(x)',true);drawGraph($('#miniD1'),d1,"f′(x)",true);drawGraph($('#miniD2'),d2,"f″(x)",true)}if($('#space3d'))draw3D($('#space3d'))}
function drawAll(){requestAnimationFrame(draw)}

function update(){const x=state.x, bad=x===1, vals=[f(x),d1(x),d2(x)];$('#xVal').textContent=fmt(x);$('#fVal').textContent=fmt(vals[0]);$('#dVal').textContent=fmt(vals[1]);$('#ddVal').textContent=fmt(vals[2]);$('#sliderOut').textContent=`x = ${fmt(x)}`;$('#distance').textContent=bad?'—':Math.abs(1/(x-1)).toFixed(3);$('#undefined').classList.toggle('show',bad);$('#insight').textContent=bad?'分母が0。点Pはここには存在しません。':Math.abs(x)<.01?'接線は水平。増加から減少へ変わるので極大です。':Math.abs(x-2)<.01?'接線は水平。減少から増加へ変わるので極小です。':d1(x)>0?'f′>0：この区間で f は増加します。':'f′<0：この区間で f は減少します。';drawAll();if(state.tab===4)renderBelow()}
function setX(x){state.x=Math.round(x*100)/100;$('#xSlider').value=state.x;update()}
$('#xSlider').oninput=e=>setX(+e.target.value)
$$('[data-range]').forEach(b=>b.onclick=()=>{state.range=+b.dataset.range;state.zoom=false;$$('[data-range]').forEach(x=>x.classList.toggle('active',x===b));draw()})
$('#zoom').onclick=()=>{state.zoom=!state.zoom;$('#zoom').classList.toggle('active',state.zoom);draw()}

function draw3D(c){
  const {ctx,w,h}=setupCanvas(c);ctx.fillStyle='#06121d';ctx.fillRect(0,0,w,h);const sc=Math.min(w,h)/14, ox=w/2,oy=h/2;const proj=(x,y,z)=>{let X=x*Math.cos(state.rotY)-z*Math.sin(state.rotY),Z=x*Math.sin(state.rotY)+z*Math.cos(state.rotY),Y=y*Math.cos(state.rotX)-Z*Math.sin(state.rotX);return[ox+X*sc,oy-Y*sc]};const line=(pts,color,width=1)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();pts.forEach((p,i)=>{const q=proj(...p);i?ctx.lineTo(...q):ctx.moveTo(...q)});ctx.stroke()};line([[-6,0,0],[6,0,0]],'#68899d');line([[0,-6,0],[0,6,0]],'#68899d');line([[0,0,-6],[0,0,6]],'#68899d');ctx.fillStyle='#9ab2c1';ctx.fillText('x',...proj(6,0,0));ctx.fillText('f(x)',...proj(0,6,0));ctx.fillText(state.zMode==='d1'?"f′(x)":"f″(x)",...proj(0,0,6));const fn=state.zMode==='d1'?d1:d2;[-1,1].forEach(side=>{const pts=[];for(let x=side<0?-5:1.05;x<(side<0?.95:5);x+=.05){const y=Math.max(-5,Math.min(5,f(x))),z=Math.max(-5,Math.min(5,fn(x)));pts.push([x,y,z])}line(pts,'#ffd166',2)});ctx.fillStyle='#ff8a4c33';const a=proj(1,-5,-5),b=proj(1,5,-5),cc=proj(1,5,5),dd=proj(1,-5,5);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...cc);ctx.lineTo(...dd);ctx.closePath();ctx.fill();line([[-5,-4,0],[5,6,0]],'#55d8ff');if(state.x!==1){const p=proj(state.x,Math.max(-5,Math.min(5,f(state.x))),Math.max(-5,Math.min(5,fn(state.x))));ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(...p,6,0,7);ctx.fill()}}
function setup3D(c){let drag=false,last; c.onpointerdown=e=>{drag=true;last=e;c.setPointerCapture(e.pointerId)};c.onpointermove=e=>{if(!drag)return;state.rotY+=(e.clientX-last.clientX)*.01;state.rotX+=(e.clientY-last.clientY)*.01;last=e;draw3D(c)};c.onpointerup=()=>drag=false;c.onwheel=e=>{e.preventDefault();state.rotX+=e.deltaY*.0005;draw3D(c)}}
addEventListener('resize',drawAll);renderTab()
