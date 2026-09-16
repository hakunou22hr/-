import { useMemo, useState } from 'react'
import { areCollinear, gridPoints, lineThrough, linesBySize, type GridLine, type Point } from './lineMath'

const stepNames = ['問題', '交点はいくつ？', '20点から3点を選ぶ', 'ダメな選び方とは？', '5点が並ぶ直線', '4点が並ぶ直線', '3点が並ぶ直線', '最終計算']
type Mode = 'normal' | 'five' | 'four' | 'three' | 'all' | 'pick'
const modeLabels: [Mode, string][] = [['normal', '通常表示'], ['five', '5点の直線'], ['four', '4点の直線'], ['three', '3点の直線'], ['all', 'ダメな直線を全部表示'], ['pick', '自分で3点を選ぶ']]

export default function App() {
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<Mode>('normal')
  const [lineIndex, setLineIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [badAnswer, setBadAnswer] = useState<boolean | null>(null)
  const [diagonals, setDiagonals] = useState(0)
  const [showAllThree, setShowAllThree] = useState(false)
  const [selected, setSelected] = useState<Point[]>([])
  const five = useMemo(() => linesBySize(5), []), four = useMemo(() => linesBySize(4), []), three = useMemo(() => linesBySize(3), [])
  const reset = () => { setMode('normal'); setLineIndex(0); setSelected([]); setShowAllThree(false) }
  const chooseMode = (next: Mode) => { setMode(next); setLineIndex(0); setSelected([]); setShowAllThree(false) }
  const activeLines = mode === 'five' ? [five[lineIndex % five.length]]
    : mode === 'four' ? [four[lineIndex % four.length]]
    : mode === 'three' ? (showAllThree ? three : [three[lineIndex % three.length]])
    : mode === 'all' ? [...five, ...four, ...three] : []
  const onPoint = (point: Point) => {
    if (mode !== 'pick' || selected.length === 3) return
    if (!selected.some(p => p.x === point.x && p.y === point.y)) setSelected([...selected, point])
  }
  const selectedCollinear = selected.length === 3 && areCollinear(selected[0], selected[1], selected[2])
  const go = (next: number) => {
    const value = Math.max(0, Math.min(7, next)); setStep(value); setShowAnswer(false); setBadAnswer(null); setDiagonals(0)
    if (value === 4) chooseMode('five'); else if (value === 5) chooseMode('four'); else if (value === 6) chooseMode('three'); else reset()
  }

  return <div className="app">
    <header className="hero"><div><span>数学A ・ 場合の数／組合せ</span><h1>三角形の個数 <small>― 4本×5本の平行線</small></h1><p>「全部三角形になる？」から、見落としやすい斜めの直線を発見しよう。</p></div><div className="answer-badge"><small>今日の問い</small><b>20個の交点から<br/>三角形はいくつ？</b></div></header>
    <nav className="steps" aria-label="授業の進行">{stepNames.map((name, i) => <button key={name} className={i === step ? 'active' : i < step ? 'done' : ''} onClick={() => go(i)}><span>{i < step ? '✓' : i + 1}</span><small>STEP {i + 1}</small>{name}</button>)}</nav>
    <main>
      <section className="visual-card">
        <div className="mode-bar">{modeLabels.map(([key, label]) => <button key={key} className={mode === key ? 'active' : ''} onClick={() => chooseMode(key)}>{label}</button>)}<button onClick={reset}>リセット</button></div>
        <Grid activeLines={activeLines.filter(Boolean)} mode={mode} selected={selected} onPoint={onPoint} allFaint={mode === 'all' || (mode === 'three' && showAllThree)} countAnimation={step === 1}/>
        <div className="figure-status">
          {mode === 'normal' && <><b>青い点が20個</b><span>4本の横線 × 5本の斜めの平行線</span></>}
          {mode === 'five' && <><b>5点が並ぶ直線　{lineIndex % 4 + 1} / 4</b><LinePager count={4} index={lineIndex} set={setLineIndex}/></>}
          {mode === 'four' && <><b>4点が並ぶ直線　{lineIndex % 9 + 1} / 9</b><LinePager count={9} index={lineIndex} set={setLineIndex}/></>}
          {mode === 'three' && <><b>3点が並ぶ直線　{showAllThree ? '全8本' : `${lineIndex % 8 + 1} / 8`}</b><LinePager count={8} index={lineIndex} set={setLineIndex}/><button onClick={() => setShowAllThree(v => !v)}>{showAllThree ? '1本ずつ見る' : '8本をすべて表示'}</button></>}
          {mode === 'all' && <><b>三角形にならない直線：21本</b><span>5点：4本　4点：9本　3点：8本</span></>}
          {mode === 'pick' && <PickStatus selected={selected} collinear={selectedCollinear} reset={() => setSelected([])}/>} 
        </div>
      </section>
      <section className="lesson-card"><StepContent step={step} answer={showAnswer} setAnswer={setShowAnswer} badAnswer={badAnswer} setBadAnswer={setBadAnswer} diagonals={diagonals} setDiagonals={setDiagonals} setLineIndex={setLineIndex}/><footer><button disabled={step === 0} onClick={() => go(step - 1)}>← 戻る</button><span>{step + 1} / 8</span><button className="primary" disabled={step === 7} onClick={() => go(step + 1)}>次へ →</button></footer></section>
    </main>
    <aside className="discovery"><b>発見のポイント</b><p>三角形にならないのは、選んだ3点が同じ直線上にある場合。元から描かれた平行線だけでなく、<strong>交点同士を結ぶと現れる新しい斜めの直線</strong>も探す必要があります。</p></aside>
  </div>
}

function pt(p: Point) { return { x: 76 + p.x * 96 + p.y * 17, y: 62 + p.y * 100 } }
function Grid({ activeLines, mode, selected, onPoint, allFaint, countAnimation }: { activeLines: GridLine[]; mode: Mode; selected: Point[]; onPoint: (p: Point) => void; allFaint: boolean; countAnimation: boolean }) {
  const collinear = selected.length === 3 && areCollinear(selected[0], selected[1], selected[2])
  const selectedLine = collinear ? { ...lineThrough(selected[0], selected[1]), points: selected } : null
  return <svg className="grid" viewBox="0 0 570 430" role="img" aria-label="4本と5本の平行線の20個の交点">
    <g className="base-lines">{[0, 1, 2, 3].map(y => { const a = pt({ x: -.45, y }), b = pt({ x: 4.45, y }); return <line key={`r${y}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}/> })}{[0, 1, 2, 3, 4].map(x => { const a = pt({ x, y: -.35 }), b = pt({ x, y: 3.35 }); return <line key={`c${x}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}/> })}</g>
    <g className={allFaint ? 'bad-lines faint' : 'bad-lines'}>{activeLines.map(line => <Line line={line} key={line.key}/>)}</g>
    {selected.length === 3 && !collinear && <polygon className="chosen-triangle" points={selected.map(p => { const s = pt(p); return `${s.x},${s.y}` }).join(' ')}/>} {selectedLine && <g className="bad-lines"><Line line={selectedLine}/></g>}
    <g>{gridPoints.map((p, i) => { const s = pt(p), highlighted = activeLines.some(l => l.points.some(q => q.x === p.x && q.y === p.y)) || (collinear && selected.some(q => q.x === p.x && q.y === p.y)), picked = selected.some(q => q.x === p.x && q.y === p.y); return <g key={`${p.x}-${p.y}`} className={`${countAnimation ? 'count-in' : ''}`} style={{ animationDelay: `${i * .055}s` }}><circle className={`intersection ${highlighted ? 'bad' : ''} ${picked ? 'picked' : ''}`} cx={s.x} cy={s.y} r={highlighted || picked ? 8 : 6}/>{mode === 'pick' && <circle className="hit" cx={s.x} cy={s.y} r="20" onClick={() => onPoint(p)}><title>点 ({p.x}, {p.y}) を選ぶ</title></circle>}</g> })}</g>
  </svg>
}
function Line({ line }: { line: GridLine }) { const sorted = [...line.points].sort((p, q) => p.x - q.x || p.y - q.y), a = pt(sorted[0]), b = pt(sorted.at(-1)!); const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy), extend = 23; return <line x1={a.x - dx / length * extend} y1={a.y - dy / length * extend} x2={b.x + dx / length * extend} y2={b.y + dy / length * extend}/> }
function LinePager({ count, index, set }: { count: number; index: number; set: (n: number) => void }) { return <span className="pager"><button onClick={() => set((index - 1 + count) % count)}>前へ</button><button onClick={() => set((index + 1) % count)}>次へ</button></span> }
function PickStatus({ selected, collinear, reset }: { selected: Point[]; collinear: boolean; reset: () => void }) { return <>{selected.length < 3 ? <><b>点を3つ選ぼう（{selected.length} / 3）</b><span>青い点をタップしてください</span></> : collinear ? <><b className="no">× 三角形になりません</b><span>3点が一直線上に並んでいます</span></> : <><b className="yes">○ 三角形ができます</b><span>3点は一直線上ではありません</span></>} {selected.length > 0 && <button onClick={reset}>選び直す</button>}</> }

function StepContent({ step, answer, setAnswer, badAnswer, setBadAnswer, diagonals, setDiagonals, setLineIndex }: { step: number; answer: boolean; setAnswer: (v: boolean) => void; badAnswer: boolean | null; setBadAnswer: (v: boolean) => void; diagonals: number; setDiagonals: (v: number) => void; setLineIndex: (v: number) => void }) {
  if (step === 0) return <Lesson n="01" title="まず図を見て考えよう"><p className="lead">4本の互いに平行な直線と、それらと交わる5本の互いに平行な直線があります。交点から3点を選ぶと、三角形はいくつできるでしょう？</p><Callout>公式を急がず、「三角形にならない選び方」があるか考えよう。</Callout></Lesson>
  if (step === 1) return <Lesson n="02" title="交点はいくつ？"><p>1本の横線に交点が5個。それが4本あります。</p><Formula>4 × 5 = <em>20</em></Formula><p>図では20個の点が順番に現れます。</p></Lesson>
  if (step === 2) return <Lesson n="03" title="20点から3点を選ぶ"><Question>20個から3点を選ぶ方法は？</Question><div className="staged"><span>₂₀C₃</span><span>= 20 × 19 × 18 / (3 × 2 × 1)</span><b>= 1140通り</b></div><Callout>でも、この1140通りは全部「三角形」になるでしょうか？</Callout></Lesson>
  if (step === 3) return <Lesson n="04" title="ダメな選び方とは？"><Question>1140通り全部が三角形になる？</Question><div className="choice"><button onClick={() => setBadAnswer(true)}>はい</button><button onClick={() => setBadAnswer(false)}>いいえ</button></div>{badAnswer !== null && (badAnswer ? <p className="feedback no">もう一度。3点が重ならなくても、形がつぶれる場合は？</p> : <><p className="feedback yes">正解！ 3点が一直線上に並ぶと三角形になりません。</p><Callout>そこで、20個の交点の中に、3個以上の点を通る直線が何本あるか探します。</Callout></>)}</Lesson>
  if (step === 4) return <Lesson n="05" title="5点が一直線上にある"><Question>この5点の中から3点を選ぶ方法は何通り？</Question>{!answer ? <button className="reveal" onClick={() => setAnswer(true)}>答えを見る</button> : <><Formula>₅C₃ = <em>10</em></Formula><p>このような横線は4本。図の「前へ・次へ」で1本ずつ確認できます。</p><div className="result-box">₅C₃ × 4<br/><b>= 10 × 4 = 40</b></div></>}</Lesson>
  if (step === 5) return <Lesson n="06" title="4点が一直線上にある"><Question>4点から3点を選ぶ方法は？</Question><Formula>₄C₃ = <em>4</em></Formula><h3>4点の直線は、5本だけだと思った？</h3><p>最初から描かれた斜めの平行線が5本。さらに、格子を横切る別の斜め方向にも4本あります。</p><button className="reveal" disabled={diagonals === 4} onClick={() => { const next = Math.min(4, diagonals + 1); setDiagonals(next); setLineIndex(4 + next) }}>斜めの直線を探す（{diagonals} / 4）</button>{diagonals === 4 && <><Formula>5 + 4 = <em>9本</em></Formula><div className="result-box">₄C₃ × 9<br/><b>= 4 × 9 = 36</b></div></>}</Lesson>
  if (step === 6) return <Lesson n="07" title="3点が一直線上にある"><p>さらに見落としやすい「3点だけ」が並ぶ斜めの直線もあります。図の前へ・次へで8パターンを確認しよう。</p><Formula>₃C₃ = <em>1</em></Formula><div className="result-box">₃C₃ × 8<br/><b>= 8</b></div></Lesson>
  return <Lesson n="08" title="三角形になる選び方"><div className="summary-calc"><div><small>全ての選び方</small><b>₂₀C₃ = 1140</b></div><h3>三角形にならない選び方</h3><p><span>5点一直線</span> ₅C₃ × 4 = <b>40</b></p><p><span>4点一直線</span> ₄C₃ × 9 = <b>36</b></p><p><span>3点一直線</span> ₃C₃ × 8 = <b>8</b></p><ol><li>1140</li><li>1140 − 40</li><li>1140 − 40 − 36</li><li>1140 − 40 − 36 − 8</li></ol><strong>答え　1056個</strong></div></Lesson>
}
const Lesson = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => <div className="lesson"><span className="tag">STEP {n}</span><h2>{title}</h2>{children}</div>
const Question = ({ children }: { children: React.ReactNode }) => <h3 className="question">Q. {children}</h3>
const Formula = ({ children }: { children: React.ReactNode }) => <div className="formula">{children}</div>
const Callout = ({ children }: { children: React.ReactNode }) => <div className="callout">💡 <p>{children}</p></div>
