import { useState } from 'react'
import { BookOpen, Pause, Play, RotateCcw } from 'lucide-react'
import { Controls } from './components/Controls'
import { InfoPanel } from './components/InfoPanel'
import { RatioDisplay } from './components/RatioDisplay'
import { TriangleScene } from './components/TriangleScene'
import { TrigName, trig } from './math'

export default function App() {
  const [angle, setAngle] = useState(40)
  const [activeRatio, setActiveRatio] = useState<TrigName>('sin')
  const [playing, setPlaying] = useState(true)
  const values = trig(angle)

  const reset = () => {
    setAngle(40)
    setActiveRatio('sin')
    setPlaying(true)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark"><span>θ</span></div>
        <div>
          <p className="kicker">MATHEMATICS I · INTERACTIVE LAB</p>
          <h1>直角三角形でわかる <em>三角比</em></h1>
        </div>
        <div className="lesson-badge"><BookOpen size={17} /> 数学Ⅰ</div>
      </header>

      <main>
        <section className="hero-grid">
          <div className="scene-card panel">
            <div className="panel-heading">
              <div><span className="live-dot" /> LIVE TRIANGLE</div>
              <span>角 θ から見た辺の関係</span>
            </div>
            <TriangleScene angle={angle} activeRatio={activeRatio} playing={playing} />
          </div>

          <aside className="side-column">
            <RatioDisplay angle={angle} activeRatio={activeRatio} values={values} />
            <InfoPanel activeRatio={activeRatio} />
          </aside>
        </section>

        <section className="control-deck panel">
          <Controls angle={angle} onAngle={setAngle} activeRatio={activeRatio} onRatio={setActiveRatio} />
          <div className="playback" aria-label="アニメーション操作">
            <button onClick={() => setPlaying(!playing)} aria-label={playing ? 'アニメーションを停止' : 'アニメーションを再生'}>
              {playing ? <Pause size={18} /> : <Play size={18} />}<span>{playing ? '停止' : '再生'}</span>
            </button>
            <button onClick={reset} aria-label="初期状態に戻す"><RotateCcw size={18} /><span>リセット</span></button>
          </div>
        </section>
      </main>
      <footer>角度を動かして、光の道すじと「辺の比」をつなげよう。</footer>
    </div>
  )
}
