// 3つの平面と、そこで使う式のステップデータ
const lessons = {
  acd: { no:'01', title:'△ACD ― 60° の面', question:'どうやって h を求める？', note:'直角三角形で「高さ」と「底辺」を直接つなぐので tan が使えます。', angle:'60°', base:'AC', points:['A','C','D'], steps:['tan 60° = <span class="frac"><span>h</span><span>AC</span></span>','tan 60° = √3 より','√3 = <span class="frac"><span>h</span><span>AC</span></span>','<strong>AC = <span class="frac"><span>h</span><span>√3</span></span></strong>','<span class="conclusion">ここでは AC を h で表すことができる。</span>'] },
  bcd: { no:'02', title:'△BCD ― 45° の面', question:'この面ではどんな式が立てられる？', note:'ここでも、仰角の向かいが h、隣が BC。tan がぴったりです。', angle:'45°', base:'BC', points:['B','C','D'], steps:['tan 45° = <span class="frac"><span>h</span><span>BC</span></span>','tan 45° = 1 より','1 = <span class="frac"><span>h</span><span>BC</span></span>','<strong>BC = h</strong>','<span class="conclusion">ここでは BC を h で表すことができる。</span>'] },
  abc: { no:'03', title:'△ABC ― 地面の面', question:'この三角形で h を求めるには、どの公式？', note:'2辺 AC、BC とその間の角30°、向かいの辺 AB が登場。余弦定理を使います。', ground:true, steps:['AB² = AC² + BC² − 2・AC・BC・cos ∠ACB','6² = (<span class="frac"><span>h</span><span>√3</span></span>)² + h² − 2・(<span class="frac"><span>h</span><span>√3</span></span>)・h・cos 30°','cos 30° = <span class="frac"><span>√3</span><span>2</span></span> を代入','36 = <span class="frac"><span>h²</span><span>3</span></span> + h² − 2・(<span class="frac"><span>h²</span><span>√3</span></span>)・(<span class="frac"><span>√3</span><span>2</span></span>)','36 = <span class="frac"><span>h²</span><span>3</span></span> + h² − h²','36 = <span class="frac"><span>h²</span><span>3</span></span>','h² = 108','<strong>h = 6√3</strong>','<span class="answer glow">答え：CD = h = 6√3 m</span>'] }
}

const formulas = {
  sin:{title:'sin（正弦）',shape:'sin θ = <span class="frac"><span>対辺</span><span>斜辺</span></span>',meaning:'高さに関係する比を表しやすい公式です。',when:'直角三角形で、斜辺と向かいの辺を結びたいとき。',use:'この問題では斜辺が不要なので、tan の方が直接的です。'},
  cos:{title:'cos（余弦）',shape:'cos θ = <span class="frac"><span>隣辺</span><span>斜辺</span></span>',meaning:'角の隣にある横の長さと斜辺の比です。',when:'直角三角形で、隣辺と斜辺を結びたいとき。',use:'補助的には使えますが、h を出すには tan が自然です。'},
  tan:{title:'tan（正接）',shape:'tan θ = <span class="frac"><span>対辺</span><span>隣辺</span></span>',meaning:'「高さ ÷ 底辺」の比を表します。',when:'高さと水平距離を直接結びたいとき。',use:'◎ △ACD と △BCD で、h と AC、BC を結びます。'},
  sine:{title:'正弦定理',shape:'<span class="frac"><span>a</span><span>sin A</span></span> = <span class="frac"><span>b</span><span>sin B</span></span> = <span class="frac"><span>c</span><span>sin C</span></span>',meaning:'辺と、その向かいの角との関係を表します。',when:'向かい合う辺と角の組が分かるとき。',use:'△ABC でも検討できますが、既知の情報からは余弦定理が自然です。'},
  cosine:{title:'余弦定理',shape:'a² = b² + c² − 2bc cos A',meaning:'2辺とその間の角から、残りの辺との関係を作ります。',when:'「2辺とその間の角」が登場するとき。',use:'◎ △ABC で AB、AC、BC、∠C を結ぶ最も有効な公式です。'}
}

const cutout = document.querySelector('#cutout')
const mainFigure = document.querySelector('.main-figure')

function triangleSvg(lesson){
  if(lesson.ground) return `<svg viewBox="0 0 430 300" role="img" aria-label="地面の三角形ABC"><path class="tri-fill" d="M55 245L375 245L295 55Z"/><path class="tri-base" d="M55 245L375 245"/><path class="tri-side" d="M375 245L295 55L55 245"/><path class="tri-angle" d="M295 55 Q276 89 309 91"/><text x="45" y="272" class="tri-text">A</text><text x="380" y="272" class="tri-text">B</text><text x="292" y="43" class="tri-text">C</text><text x="185" y="275" class="tri-text">AB = 6 m</text><g class="svg-fraction"><text x="132" y="143">AC =</text><text x="193" y="126">h</text><line x1="184" y1="133" x2="211" y2="133"/><text x="183" y="154">√3</text></g><text x="321" y="148" class="tri-text">BC = h</text><text x="311" y="91" class="tri-text">30°</text></svg>`
  return `<svg viewBox="0 0 430 300" role="img" aria-label="直角三角形${lesson.points.join('')}"><path class="tri-fill" d="M55 245L370 245L370 45Z"/><path class="tri-base" d="M55 245H370"/><path class="tri-height" d="M370 245V45"/><path class="tri-side" d="M55 245L370 45"/><path d="M346 245v-24h24" fill="none" stroke="#567" stroke-width="2"/><path class="tri-angle" d="M95 245A40 40 0 0 0 89 224"/><text x="45" y="274" class="tri-text">${lesson.points[0]}</text><text x="375" y="273" class="tri-text">C</text><text x="375" y="43" class="tri-text">D</text><text x="185" y="274" class="tri-text">${lesson.base}</text><text x="383" y="150" class="tri-text tri-red">CD = h</text><text x="95" y="225" class="tri-text">${lesson.angle}</text></svg>`
}

function selectFace(key){
  const lesson=lessons[key]
  mainFigure.dataset.active=key
  document.querySelectorAll('[data-face]').forEach(b=>b.classList.toggle('active',b.dataset.face===key))
  cutout.innerHTML=`<div class="lesson-head"><span>${lesson.no}</span><h2>選んだ面を切り抜く：${lesson.title}</h2></div><div class="lesson-body"><div class="plane-card">${triangleSvg(lesson)}</div><div class="reason"><h3>${lesson.question}</h3><p class="question">まず、この面で分かっている辺と角を確認しよう。</p><div class="why"><b>なぜこの公式？</b> ${lesson.note}</div><div class="steps">${lesson.steps.map((s,i)=>`<div class="math-step${i===0?' visible':''}">${s}</div>`).join('')}</div><div class="step-controls"><button class="next-btn">次の式へ →</button><span class="progress-text">1 / ${lesson.steps.length}</span>${key==='abc'?'<button class="summary-btn" hidden>まとめを見る</button>':''}</div></div></div>`
  let shown=1
  const next=cutout.querySelector('.next-btn'), all=cutout.querySelectorAll('.math-step'), count=cutout.querySelector('.progress-text')
  next.onclick=()=>{if(shown<all.length){all[shown++].classList.add('visible');count.textContent=`${shown} / ${all.length}`;all[shown-1].scrollIntoView({behavior:'smooth',block:'nearest'})}if(shown===all.length){next.hidden=true;const s=cutout.querySelector('.summary-btn');if(s)s.hidden=false}}
  const sum=cutout.querySelector('.summary-btn');if(sum)sum.onclick=openSummary
  cutout.scrollIntoView({behavior:'smooth',block:'start'})
}

document.querySelectorAll('[data-face]').forEach(button=>button.addEventListener('click',()=>selectFace(button.dataset.face)))

const formulaDialog=document.querySelector('#formulaDialog')
document.querySelectorAll('[data-formula]').forEach(button=>button.addEventListener('click',()=>{
  const f=formulas[button.dataset.formula]
  document.querySelector('#formulaContent').innerHTML=`<div class="formula-modal"><span class="tag">FORMULA GUIDE</span><h2>${f.title}</h2><div class="formula-visual">△　${f.shape}</div><div class="modal-grid"><div><b>何を表す？</b><p>${f.meaning}</p></div><div><b>どんな場面？</b><p>${f.when}</p></div><div style="grid-column:1/-1"><b>この問題では？</b><p>${f.use}</p></div></div></div>`
  formulaDialog.showModal()
}))

const summaryDialog=document.querySelector('#summaryDialog')
function openSummary(){document.querySelector('#summaryContent').innerHTML=`<div class="summary-content"><p class="kicker">LESSON SUMMARY</p><h2>3つの平面をつないだら、解けた。</h2><div class="flow"><div><span>1</span><p><b>△ACD：</b> tan 60° = <span class="frac"><span>h</span><span>AC</span></span>　→　AC = <span class="frac"><span>h</span><span>√3</span></span></p></div><div><span>2</span><p><b>△BCD：</b> tan 45° = <span class="frac"><span>h</span><span>BC</span></span>　→　BC = h</p></div><div><span>3</span><p><b>△ABC：</b> AC、BC、間の角30°を余弦定理へ</p></div><div><span>4</span><p>36 = <span class="frac"><span>h²</span><span>3</span></span>　→　h² = 108</p></div></div><p class="final-answer">CD = h = 6√3 m</p></div>`;summaryDialog.showModal()}
document.querySelector('#summaryTop').onclick=openSummary
document.querySelectorAll('.dialog-close').forEach(b=>b.onclick=()=>b.closest('dialog').close())
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}))
