const VALUE_DEFINITIONS = {
  zero: { kind: 'integer', numerator: '0', value: 0, latex: '0' },
  one: { kind: 'integer', numerator: '1', value: 1, latex: '1' },
  minusOne: { kind: 'integer', numerator: '−1', value: -1, latex: '-1' },
  half: { kind: 'fraction', numerator: '1', denominator: '2', value: .5, latex: '\\frac{1}{2}' },
  minusHalf: { kind: 'fraction', numerator: '−1', denominator: '2', value: -.5, latex: '-\\frac{1}{2}' },
  sqrtHalf: { kind: 'fraction', numerator: '√3', denominator: '2', value: Math.sqrt(3) / 2, latex: '\\frac{\\sqrt{3}}{2}' },
  minusSqrtHalf: { kind: 'fraction', numerator: '−√3', denominator: '2', value: -Math.sqrt(3) / 2, latex: '-\\frac{\\sqrt{3}}{2}' },
}

// Calculation choices remain numeric; every user-facing exact value is rendered from a value definition.
export const VALUES = {
  sin: [[VALUE_DEFINITIONS.zero, 0], [VALUE_DEFINITIONS.half, .5], [{ kind: 'fraction', numerator: '1', denominator: '√2', latex: '\\frac{1}{\\sqrt{2}}' }, Math.SQRT1_2], [VALUE_DEFINITIONS.sqrtHalf, Math.sqrt(3) / 2], [VALUE_DEFINITIONS.one, 1]],
  cos: [[VALUE_DEFINITIONS.one, 1], [VALUE_DEFINITIONS.sqrtHalf, Math.sqrt(3) / 2], [VALUE_DEFINITIONS.half, .5], [VALUE_DEFINITIONS.zero, 0], [VALUE_DEFINITIONS.minusHalf, -.5], [VALUE_DEFINITIONS.minusSqrtHalf, -Math.sqrt(3) / 2], [VALUE_DEFINITIONS.minusOne, -1]],
  tan: [[{ kind: 'radical', numerator: '−√3', latex: '-\\sqrt{3}' }, -Math.sqrt(3)], [VALUE_DEFINITIONS.minusOne, -1], [{ kind: 'fraction', numerator: '−1', denominator: '√3', latex: '-\\frac{1}{\\sqrt{3}}' }, -1 / Math.sqrt(3)], [VALUE_DEFINITIONS.zero, 0], [{ kind: 'fraction', numerator: '1', denominator: '√3', latex: '\\frac{1}{\\sqrt{3}}' }, 1 / Math.sqrt(3)], [VALUE_DEFINITIONS.one, 1], [{ kind: 'radical', numerator: '√3', latex: '\\sqrt{3}' }, Math.sqrt(3)]],
}

const rad = d => d * Math.PI / 180
const deg = r => r * 180 / Math.PI
export const trig = (mode, d) => mode === 'sin' ? Math.sin(rad(d)) : mode === 'cos' ? Math.cos(rad(d)) : Math.abs(d - 90) < 1e-8 ? null : Math.tan(rad(d))
const passes = (x, op, c) => op === '>' ? x > c + 1e-8 : op === '<' ? x < c - 1e-8 : op === '>=' ? x >= c - 1e-8 : x <= c + 1e-8
export function solve(mode, op, c) {
  let roots = []
  if (mode === 'sin' && c >= 0 && c <= 1) { const a = deg(Math.asin(c)); roots = [a, 180 - a] }
  if (mode === 'cos' && c >= -1 && c <= 1) roots = [deg(Math.acos(c))]
  if (mode === 'tan') { const a = deg(Math.atan(c)); roots = [a < 0 ? a + 180 : a] }
  const cuts = [0, ...roots, 180, ...(mode === 'tan' ? [90] : [])].filter((x, i, a) => x >= 0 && x <= 180 && a.findIndex(y => Math.abs(y - x) < 1e-7) === i).sort((a, b) => a - b), out = []
  for (let i = 0; i < cuts.length - 1; i++) { const lo = cuts[i], hi = cuts[i + 1], v = trig(mode, (lo + hi) / 2); if (v !== null && passes(v, op, c)) out.push({ lo, hi, lc: trig(mode, lo) !== null && passes(trig(mode, lo), op, c), hc: trig(mode, hi) !== null && passes(trig(mode, hi), op, c) }) }
  for (const x of cuts) { const v = trig(mode, x); if (v !== null && passes(v, op, c) && !out.some(q => x >= q.lo - 1e-7 && x <= q.hi + 1e-7)) out.push({ lo: x, hi: x, lc: true, hc: true }) }
  return out.sort((a, b) => a.lo - b.lo)
}
const nice = n => Math.abs(n - Math.round(n)) < 1e-6 ? `${Math.round(n)}°` : `${Math.round(n * 10) / 10}°`
export const formatSolution = xs => xs.length ? xs.map(q => q.lo === q.hi ? `θ = ${nice(q.lo)}` : `${nice(q.lo)} ${q.lc ? '≦' : '<'} θ ${q.hc ? '≦' : '<'} ${nice(q.hi)}`).join('， ') : '解なし'

const presets = [
  { mode: 'cos', op: '>', c: -Math.sqrt(3) / 2, value: VALUE_DEFINITIONS.minusSqrtHalf, latex: '\\cos\\theta > -\\frac{\\sqrt{3}}{2}' },
  { mode: 'tan', op: '>=', c: -1, value: VALUE_DEFINITIONS.minusOne, latex: '\\tan\\theta \\geqq -1' },
  { mode: 'sin', op: '>', c: Math.sqrt(3) / 2, value: VALUE_DEFINITIONS.sqrtHalf, latex: '\\sin\\theta > \\frac{\\sqrt{3}}{2}' },
  { mode: 'sin', op: '>=', c: .5, value: VALUE_DEFINITIONS.half, latex: '\\sin\\theta \\geqq \\frac{1}{2}' },
  { mode: 'cos', op: '<=', c: .5, value: VALUE_DEFINITIONS.half, latex: '\\cos\\theta \\leqq \\frac{1}{2}' },
  { mode: 'tan', op: '<', c: 1, value: VALUE_DEFINITIONS.one, latex: '\\tan\\theta < 1' },
]
const $ = s => document.querySelector(s)
let state = { ...presets[0], theta: 45, step: 1, revealed: false, view: '2d', rx: -5, ry: 0, zoom: 1, px: 0, py: 0, playing: false }
let timer
const symbol = op => ({ '>': '>', '<': '<', '>=': '≧', '<=': '≦' }[op])
const mathOperator = op => ({ '>': '&gt;', '<': '&lt;', '>=': '≧', '<=': '≦' }[op])
const valueMath = value => value.kind === 'fraction'
  ? `<mfrac><mrow>${value.numerator.startsWith('−') ? '<mo>−</mo>' : ''}${value.numerator.includes('√') ? '<msqrt><mn>3</mn></msqrt>' : `<mn>${value.numerator.replace('−', '')}</mn>`}</mrow><mrow>${value.denominator.includes('√') ? '<msqrt><mn>3</mn></msqrt>' : `<mn>${value.denominator}</mn>`}</mrow></mfrac>`
  : value.numerator.includes('√') ? `<mrow>${value.numerator.startsWith('−') ? '<mo>−</mo>' : ''}<msqrt><mn>3</mn></msqrt></mrow>` : `<mn>${value.numerator}</mn>`

/** Shared renderer used by problem cards, CURRENT PROBLEM, steps, hints and SVG annotations. */
function TrigConditionMath(problem, className = 'trig-condition') {
  return `<math class="${className}" data-latex="${problem.latex}" aria-label="${problem.mode} theta ${symbol(problem.op)} ${problem.value.numerator}${problem.value.denominator ? ` over ${problem.value.denominator}` : ''}"><mrow><mi mathvariant="normal">${problem.mode}</mi><mi>θ</mi><mo>${mathOperator(problem.op)}</mo>${valueMath(problem.value)}</mrow></math>`
}
function BoundaryMath(problem) {
  return `<math class="boundary-math" data-latex="${problem.mode === 'cos' ? 'x' : problem.mode === 'sin' ? 'y' : problem.mode} = ${problem.value.latex}"><mi>${problem.mode === 'cos' ? 'x' : problem.mode === 'sin' ? 'y' : problem.mode}</mi><mo>=</mo>${valueMath(problem.value)}</math>`
}
function exactValueFromNumber(n) {
  const known = Object.values(VALUE_DEFINITIONS).find(v => Math.abs(v.value - n) < 1e-8)
  if (known) return known
  const rounded = String(Math.round(n * 1000) / 1000)
  return { kind: 'decimal', numerator: rounded, value: n, latex: rounded }
}
const E = (tag, a = {}, txt) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); if (txt != null) e.textContent = txt; return e }
const add = (s, t, a, x) => s.appendChild(E(t, a, x))
const line = (s, x1, y1, x2, y2, c) => add(s, 'line', { x1, y1, x2, y2, class: c })
function pathArc(a, b, cx, cy, r) { const p = []; for (let d = a; d <= b + .2; d += Math.max(.8, (b - a) / 100)) p.push([cx + r * Math.cos(rad(Math.min(d, b))), cy - r * Math.sin(rad(Math.min(d, b)))]); return p.map((v, i) => (i ? 'L' : 'M') + v.join(',')).join(' ') }
function addMathToSvg(s, x, y, html, width = 130) { const foreign = add(s, 'foreignObject', { x, y, width, height: 58, class: 'svg-math' }); const div = document.createElement('div'); div.innerHTML = html; foreign.appendChild(div) }
function draw() {
  const s = $('#circle')
  s.innerHTML = `<defs><filter id="redGlow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="goldGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><radialGradient id="overlapLight"><stop stop-color="#fff"/><stop offset=".24" stop-color="#ffb4c0"/><stop offset="1" stop-color="#ff2c50" stop-opacity="0"/></radialGradient><linearGradient id="sector" x1="0" x2="1"><stop stop-color="#ff284f" stop-opacity=".22"/><stop offset="1" stop-color="#ff284f" stop-opacity=".02"/></linearGradient></defs>`
  const cx = 355, cy = 382, R = 270
  for (let i = -1; i <= 1; i += .25) { line(s, cx + i * R, 70, cx + i * R, cy + 36, 'grid'); line(s, cx - R - 35, cy - i * R, cx + R + 35, cy - i * R, 'grid') }
  line(s, 38, cy, 700, cy, 'axis'); line(s, cx, 420, cx, 55, 'axis'); add(s, 'path', { d: pathArc(0, 180, cx, cy, R), class: 'base-arc' }); add(s, 'text', { x: 700, y: 374, class: 'axis-text' }, 'x'); add(s, 'text', { x: 366, y: 58, class: 'axis-text' }, 'y'); add(s, 'text', { x: 338, y: 404, class: 'axis-text' }, 'O')
  for (const d of [0, 30, 60, 90, 120, 150, 180]) { const x = cx + R * Math.cos(rad(d)), y = cy - R * Math.sin(rad(d)); line(s, x, y, cx + (R + 10) * Math.cos(rad(d)), cy - (R + 10) * Math.sin(rad(d)), 'tick'); add(s, 'text', { x: cx + (R + 28) * Math.cos(rad(d)), y: cy - (R + 28) * Math.sin(rad(d)) + 5, class: 'degree', 'text-anchor': 'middle' }, d + '°') }
  const intervals = solve(state.mode, state.op, state.c), showBoundary = state.step >= 2, showAnswer = state.step >= 4
  if (showAnswer) for (const q of intervals) { if (q.hi > q.lo) { add(s, 'path', { d: `M${cx},${cy} L${cx + 105 * Math.cos(rad(q.lo))},${cy - 105 * Math.sin(rad(q.lo))} A105,105 0 ${q.hi - q.lo > 180 ? 1 : 0} 0 ${cx + 105 * Math.cos(rad(q.hi))},${cy - 105 * Math.sin(rad(q.hi))} Z`, class: 'answer-sector' }); add(s, 'path', { d: pathArc(q.lo, q.hi, cx, cy, R), class: 'answer-arc' }) } for (const [d, closed] of [[q.lo, q.lc], [q.hi, q.hc]]) if (!(state.mode === 'tan' && d === 90)) add(s, 'circle', { cx: cx + R * Math.cos(rad(d)), cy: cy - R * Math.sin(rad(d)), r: 8, class: closed ? 'bound closed' : 'bound open' }) }
  const roots = []
  if (state.mode === 'sin' && state.c >= 0 && state.c <= 1) { const a = deg(Math.asin(state.c)); roots.push(a, 180 - a) } else if (state.mode === 'cos' && Math.abs(state.c) <= 1) roots.push(deg(Math.acos(state.c))); else if (state.mode === 'tan') { const a = deg(Math.atan(state.c)); roots.push(a < 0 ? a + 180 : a) }
  if (showBoundary) { if (state.mode === 'sin') { const y = cy - R * state.c; line(s, cx - R - 18, y, cx + R + 18, y, 'guide'); addMathToSvg(s, 55, y - 52, BoundaryMath(state)) } if (state.mode === 'cos') { const x = cx + R * state.c; line(s, x, cy + 18, x, 75, 'guide'); addMathToSvg(s, x + 8, 66, BoundaryMath(state)) } roots.forEach(d => { line(s, cx, cy, cx + R * Math.cos(rad(d)), cy - R * Math.sin(rad(d)), 'boundary-ray'); add(s, 'text', { x: cx + (R - 35) * Math.cos(rad(d)) + 5, y: cy - (R - 35) * Math.sin(rad(d)) - 9, class: 'boundary-label' }, `${Math.round(d)}°`) }) }
  if (state.mode === 'tan') { const tx = cx + R; line(s, tx, cy + 65, tx, 45, 'tangent'); add(s, 'text', { x: tx + 11, y: 66, class: 'guide-label' }, 'x = 1'); line(s, cx, 58, cx, cy, 'undefined'); add(s, 'text', { x: cx + 12, y: 78, class: 'warning' }, '⚠ tan 未定義'); if (state.theta !== 90) { const raw = cy - R * Math.tan(rad(state.theta)), ty = Math.max(35, Math.min(454, raw)); line(s, cx, cy, tx, ty, 'tan-ray'); add(s, 'circle', { cx: tx, cy: ty, r: 7, class: 't-point' }); add(s, 'text', { x: tx + 12, y: ty - 10, class: 'gold-label' }, raw !== ty ? 'T（画面外）' : 'T (1, tanθ)') } }
  const x = cx + R * Math.cos(rad(state.theta)), y = cy - R * Math.sin(rad(state.theta)), current = trig(state.mode, state.theta), satisfies = current !== null && passes(current, state.op, state.c)
  line(s, cx, cy, x, y, 'current-ray'); const endX = cx + 58 * Math.cos(rad(state.theta)), endY = cy - 58 * Math.sin(rad(state.theta)); add(s, 'path', { d: `M${cx + 58},${cy} A58,58 0 0 0 ${endX},${endY}`, class: 'theta-arc' })
  if (showAnswer && satisfies) { add(s, 'circle', { cx: x, cy: y, r: 26, class: 'overlap-glow' }); add(s, 'circle', { cx: x, cy: y, r: 13, class: 'p-pulse-ring' }) }
  add(s, 'circle', { cx: x, cy: y, r: 9, class: 'p-point' }); add(s, 'text', { x: x + (state.theta > 100 ? -52 : 15), y: y - 13, class: 'gold-label' }, 'P'); add(s, 'text', { x: cx + 75 * Math.cos(rad(state.theta / 2)), y: cy - 75 * Math.sin(rad(state.theta / 2)), class: 'theta-text' }, `${state.theta}°`)
}
function setCopyWithMath(target, before, math, after = '') { target.innerHTML = ''; if (before) target.append(document.createTextNode(before)); target.insertAdjacentHTML('beforeend', math); if (after) target.append(document.createTextNode(after)) }
function stepCopy() {
  const coord = state.mode === 'cos' ? 'x座標' : state.mode === 'sin' ? 'y座標' : 'Tのy座標（直線OPの傾き）', dir = state.mode === 'cos' ? (state.op[0] === '>' ? '右' : '左') : state.mode === 'sin' ? (state.op[0] === '>' ? '上' : '下') : (state.op[0] === '>' ? '上' : '下')
  const titles = ['まず、どこが境界になるだろう？', '境界になる角度は何度？', `${state.mode}θ は半円上の何を表していた？`, `${state.mode === 'cos' ? 'この縦線' : state.mode === 'sin' ? 'この水平線' : '基準の高さ'}より${dir}？`, 'この赤い円弧を θ の範囲で表すと？']
  $('#stepTitle').textContent = titles[state.step - 1]
  const text = $('#stepText')
  if (state.step === 1) setCopyWithMath(text, 'この不等式 ', TrigConditionMath(state, 'inline-condition'), ' の不等号をいったん「＝」にして考えます。')
  else if (state.step === 2) setCopyWithMath(text, '', BoundaryMath(state), ' となる位置を、青い動径で半円上に確認しよう。')
  else if (state.step === 3) text.textContent = '座標とのつながりを思い出して選んでください。'
  else if (state.step === 4) setCopyWithMath(text, `${coord}が `, `<math class="inline-value" data-latex="${state.value.latex}">${valueMath(state.value)}</math>`, ` より${dir}側にある点をたどると、円弧が赤く光ります。`)
  else text.textContent = '端の ○ は含まない、● は含むことにも注目しよう。'
  $('#stepNum').textContent = state.step; $('#stepDots').innerHTML = [1, 2, 3, 4, 5].map(n => `<i class="${n <= state.step ? 'on' : ''}"></i>`).join(''); $('#prev').disabled = state.step === 1; $('#next').textContent = state.step === 5 ? '答えを考える' : '次へ →'; $('#quiz').innerHTML = ''
  if (state.step === 3) { $('#quiz').innerHTML = ['x座標', 'y座標', 'OPの長さ'].map((x, i) => `<button data-answer="${x === coord || state.mode === 'tan' && i === 1}">${'ABC'[i]}　${x}</button>`).join(''); $('#quiz').querySelectorAll('button').forEach(b => b.onclick = () => { b.classList.add(b.dataset.answer === 'true' ? 'correct' : 'wrong'); if (b.dataset.answer === 'true') $('#stepText').textContent = `正解！ ${state.mode}θ は ${coord} を表します。` }) }
}
function update() {
  const val = trig(state.mode, state.theta), ok = val !== null && passes(val, state.op, state.c)
  $('#problem').innerHTML = TrigConditionMath(state, 'current-condition'); $('#angleOut').textContent = `θ = ${state.theta}°`; $('#sinVal').textContent = Math.sin(rad(state.theta)).toFixed(3); $('#cosVal').textContent = Math.cos(rad(state.theta)).toFixed(3); $('#tanVal').textContent = state.theta === 90 ? '未定義' : Math.abs(Math.tan(rad(state.theta))) > 999 ? '∞' : Math.tan(rad(state.theta)).toFixed(3); $('#tanWarning').classList.toggle('show', state.theta === 90 || state.mode === 'tan'); $('#status').className = 'status ' + (ok ? 'yes' : 'no'); $('#status').textContent = val === null ? '⚠ この角度では tanθ は未定義です' : ok ? '● この θ は条件を満たします' : '○ この θ は条件を満たしません'; $('#solution').textContent = state.revealed ? formatSolution(solve(state.mode, state.op, state.c)) : 'まだ答えはかくれています'; $('#solution').classList.toggle('shown', state.revealed); stepCopy(); draw()
}
function select(p, i = -1) { Object.assign(state, p, { step: 1, revealed: false }); document.querySelectorAll('.problem-tab').forEach((b, j) => b.classList.toggle('active', i === j)); update() }
function init() {
  const tabs = $('#presets'); presets.forEach((p, i) => { const b = document.createElement('button'); b.className = 'problem-tab' + (!i ? ' active' : ''); b.innerHTML = `<small>問題 ${String(i + 1).padStart(2, '0')}</small>${TrigConditionMath(p, 'card-condition')}`; b.onclick = () => select(p, i); tabs.append(b) })
  $('#angle').oninput = e => { state.theta = +e.target.value; update() }; $('#next').onclick = () => { if (state.step < 5) state.step++; else state.revealed = true; update() }; $('#prev').onclick = () => { state.step = Math.max(1, state.step - 1); update() }
  $('#hint').onclick = () => { $('#hintText').hidden = !$('#hintText').hidden; setCopyWithMath($('#hintText'), '不等式 ', TrigConditionMath(state, 'inline-condition'), ' の不等号を「＝」に置き換え、右辺と座標が等しくなる点を探そう。') }
  $('#reveal').onclick = () => { state.revealed = true; state.step = 5; update() }; $('#freeToggle').onclick = () => $('#freePanel').hidden = !$('#freePanel').hidden; $('#applyFree').onclick = () => { const mode = $('#freeMode').value, op = $('#freeOp').value, c = +$('#freeValue').value, value = exactValueFromNumber(c); select({ mode, op, c, value, latex: `\\${mode}\\theta ${op} ${value.latex}` }) }
  document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => { state.view = b.dataset.view; b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b)); $('#viewport').classList.toggle('is-3d', state.view === '3d'); applyView() }); $('#classMode').onclick = () => $('#app').classList.toggle('class-mode'); $('#resetView').onclick = () => { Object.assign(state, { rx: -5, ry: 0, zoom: 1, px: 0, py: 0 }); applyView() }; $('#restart').onclick = () => { state.step = 1; state.revealed = false; update() }; $('#stepBack').onclick = () => { state.step = Math.max(1, state.step - 1); update() }; $('#stepForward').onclick = () => { state.step = Math.min(5, state.step + 1); update() }; $('#play').onclick = () => { state.playing = true; clearInterval(timer); timer = setInterval(() => { if (state.step < 5) state.step++; else { state.revealed = true; state.playing = false; clearInterval(timer) } update() }, 1100) }; $('#pause').onclick = () => { state.playing = false; clearInterval(timer) }; gestures(); update()
}
function applyView() { $('#plane').style.transform = state.view === '3d' ? `translate(${state.px}px,${state.py}px) scale(${state.zoom}) rotateX(${state.rx}deg) rotateY(${state.ry}deg)` : 'none' }
function gestures() { let drag = false, last, touches = []; const v = $('#viewport'); v.onwheel = e => { if (state.view !== '3d') return; e.preventDefault(); state.zoom = Math.max(.55, Math.min(2.5, state.zoom * (e.deltaY > 0 ? .92 : 1.08))); applyView() }; v.onpointerdown = e => { if (state.view !== '3d') return; drag = true; last = [e.clientX, e.clientY]; v.setPointerCapture(e.pointerId) }; v.onpointermove = e => { if (!drag) return; const dx = e.clientX - last[0], dy = e.clientY - last[1]; if (e.shiftKey) { state.px += dx; state.py += dy } else { state.ry += dx * .35; state.rx -= dy * .35 } last = [e.clientX, e.clientY]; applyView() }; v.onpointerup = () => drag = false; v.ontouchmove = e => { if (state.view !== '3d' || e.touches.length !== 2) return; e.preventDefault(); const a = [...e.touches], dist = Math.hypot(a[0].clientX - a[1].clientX, a[0].clientY - a[1].clientY), mid = [(a[0].clientX + a[1].clientX) / 2, (a[0].clientY + a[1].clientY) / 2]; if (touches.length) { state.zoom = Math.max(.55, Math.min(2.5, state.zoom * dist / touches[0])); state.px += mid[0] - touches[1][0]; state.py += mid[1] - touches[1][1]; applyView() } touches = [dist, mid] }; v.ontouchend = () => touches = [] }
if (typeof document !== 'undefined') init()
