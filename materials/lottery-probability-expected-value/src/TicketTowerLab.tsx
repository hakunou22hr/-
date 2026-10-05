import { useEffect, useRef, useState } from 'react'
import katex from 'katex'
import AnimatedNumber from './AnimatedNumber'
import { atLeast } from './core'

const choices = [1, 3, 10, 30, 100, 1_000, 10_000]
const highPrizeP = 1_104 / 460_000_000 // 2025年末ジャンボ「100万円以上」

function ParticleCanvas({ intensity, reduced }: { intensity: number; reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas || reduced) return
    const context = canvas.getContext('2d')
    if (!context) return
    let frame = 0
    const particles = Array.from({ length: Math.min(70, 16 + intensity * 9) }, () => ({ x: Math.random(), y: Math.random(), s: 0.3 + Math.random() * 1.5, a: Math.random() }))
    const draw = () => {
      const ratio = Math.min(devicePixelRatio, 2)
      const box = canvas.getBoundingClientRect()
      if (canvas.width !== box.width * ratio) { canvas.width = box.width * ratio; canvas.height = box.height * ratio }
      context.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.y -= 0.0015 * p.s
        if (p.y < 0) p.y = 1
        context.fillStyle = `rgba(94,235,255,${0.2 + p.a * 0.65})`
        context.beginPath(); context.arc(p.x * canvas.width, p.y * canvas.height, p.s * ratio, 0, Math.PI * 2); context.fill()
      }
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [intensity, reduced])
  return <canvas ref={ref} className="tower-particles" aria-hidden="true" />
}

export default function TicketTowerLab({ count, setCount, expected, onExperiment }: { count: number; setCount: (n: number) => void; expected: number; onExperiment: () => void }) {
  const [rotation, setRotation] = useState({ x: -13, y: -24 })
  const [zoom, setZoom] = useState(1)
  const [scale, setScale] = useState<'linear' | 'log'>('log')
  const [reduced, setReduced] = useState(false)
  const [step, setStep] = useState(0)
  const last = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const level = choices.indexOf(count)
  const purchase = count * 300
  const returnValue = count * expected
  const loss = returnValue - purchase
  const probability = atLeast(highPrizeP, count)
  const towerHeight = 40 + level * 36
  const max = scale === 'linear' ? 3_000_000 : Math.log10(3_000_001)
  const heightFor = (value: number) => `${Math.max(4, (scale === 'linear' ? value : Math.log10(value + 1)) / max * 100)}%`
  const reset = () => { setRotation({ x: -13, y: -24 }); setZoom(1) }
  const pointerDown = (e: React.PointerEvent) => { dragging.current = true; last.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId) }
  const pointerMove = (e: React.PointerEvent) => { if (!dragging.current) return; setRotation(r => ({ x: Math.max(-45, Math.min(20, r.x - (e.clientY - last.current.y) * .25)), y: r.y + (e.clientX - last.current.x) * .35 })); last.current = { x: e.clientX, y: e.clientY } }
  return <section className="tower-lab">
    <div className="inquiry-flow" aria-label="探究の進め方">{['予想する', '動かして確かめる', '数式で確かめる', '考察する'].map((x, i) => <button key={x} className={step === i ? 'on' : ''} onClick={() => setStep(i)}>{i + 1}. {x}</button>)}</div>
    {step === 0 && <div className="prediction"><h3>当たりやすくなる ＝ 得をする？</h3><p>Q1. 100枚なら1枚の100倍当たりやすい？　Q2. 1万枚なら期待損益はプラスになる？</p><button onClick={() => setStep(1)}>予想を心に決めて、動かす</button></div>}
    <div className="tower-layout">
      <div className="tower-stage" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={() => { dragging.current = false }} onWheel={e => setZoom(z => Math.max(.65, Math.min(1.4, z - e.deltaY / 900)))}>
        <ParticleCanvas intensity={level} reduced={reduced} />
        <div className="chance-dome" style={{ '--dome': `${42 + level * 18}%` } as React.CSSProperties}><span /></div>
        <div className="tower-camera" style={{ transform: `scale(${zoom * (count === 10_000 ? .82 : 1)}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}>
          <div className="ticket-stack" style={{ '--tower-height': `${towerHeight}px` } as React.CSSProperties}>
            {Array.from({ length: Math.min(18, 2 + level * 3) }, (_, i) => <i key={i} style={{ transform: `translate3d(0,${-i * towerHeight / Math.min(18, 2 + level * 3)}px,${i * 2}px)` }} />)}
            <b><AnimatedNumber value={count} suffix="枚" /></b>
          </div>
          {count === 10_000 && <><div className="orbit orbit-a"/><div className="orbit orbit-b"/></>}
        </div>
        <div className="stage-controls"><button onClick={reset}>視点リセット</button><button className={reduced ? 'on' : ''} onClick={() => setReduced(x => !x)}>低負荷モード</button></div>
        <small>ドラッグ：回転　ホイール／ピンチ：拡大縮小</small>
      </div>
      <div className="pulse-readout">
        <p>2025年末ジャンボ・100万円以上を対象</p>
        <div><span>購入金額</span><AnimatedNumber value={purchase} suffix="円" /></div>
        <div><span>期待払戻</span><AnimatedNumber value={returnValue} digits={3} suffix="円" /></div>
        <div className="loss"><span>期待損益</span><AnimatedNumber value={loss} digits={3} suffix="円" /></div>
        <div><span>少なくとも1枚</span><AnimatedNumber value={probability * 100} digits={6} suffix="%" /></div>
      </div>
    </div>
    <div className="count-rail">{choices.map(value => <button key={value} className={value === count ? 'on' : ''} onClick={() => { setCount(value); setStep(1) }}>{value.toLocaleString()}枚</button>)}</div>
    <div className="scale-switch"><span>金額の柱</span><button className={scale === 'linear' ? 'on' : ''} onClick={() => setScale('linear')}>線形</button><button className={scale === 'log' ? 'on' : ''} onClick={() => setScale('log')}>対数</button></div>
    <div className="value-columns" aria-label="金額の3D棒グラフ">
      {[['購入金額', purchase, 'purchase'], ['期待払戻', returnValue, 'return'], ['期待損失の大きさ', Math.abs(loss), 'loss']].map(([label, value, tone]) => <div key={String(tone)}><div className={`value-column ${tone}`} style={{ height: heightFor(Number(value)) }}><i/><b>{Number(value).toLocaleString('ja-JP', { maximumFractionDigits: 3 })}円</b></div><span>{label}</span></div>)}
    </div>
    <p className="inquiry-question">なぜ対数表示にすると、300円と300万円を同じ画面で比較しやすい？</p>
    <div className="probability-derivation">
      <F tex={`P(\\text{100万円以上が少なくとも1枚})=1-(1-p)^{${count.toLocaleString()}}`} />
      <div><span>(1 − {highPrizeP.toPrecision(5)})<sup>{count.toLocaleString()}</sup></span><i>↓</i><span>1 − (1 − p)<sup>n</sup></span><i>↓</i><strong><AnimatedNumber value={probability * 100} digits={6} suffix="%" /></strong></div>
    </div>
    <div className="opposite-motion"><div><span>当せん確率</span><b>↑</b></div><strong>当たりやすくなる ＝ 得をする？</strong><div><span>期待損益</span><b>↓</b></div></div>
    <p className="inquiry-question">見た目のチャンス空間は大きくなる。でも実際の確率値はどうだろう？ 購入枚数が増えると期待払戻も増えるのに、なぜ期待損益は負方向へ大きくなる？</p>
    <button className="experiment-launch" onClick={onExperiment}>この条件で{count.toLocaleString()}回実験する →</button>
  </section>
}
function F({ tex }: { tex: string }) { return <span className="formula" dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { throwOnError: false }) }} /> }
