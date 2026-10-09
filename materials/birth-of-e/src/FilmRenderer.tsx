import React, { Component, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { Scene } from './Scene'
import {
  chapters,
  chapterAt,
  cueAt,
  cues,
  compound,
  limitExperiment,
  derivative,
  secant,
  logA,
  movieParameters,
  DURATION,
  type Parameters,
} from './model'
import './style.css'
const capture = new URLSearchParams(location.search).has('render')
function Formula({ s }: { s: string }) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(s, { throwOnError: false, strict: 'ignore' }),
      }}
    />
  )
}
class Guard extends Component<{ children: React.ReactNode }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() {
    return { error: true }
  }
  render() {
    return this.state.error ? (
      <div className="fallback">
        3Dを表示できません。WebGLの設定を確認してください。下の2D図と数値表で実験を続けられます。
      </div>
    ) : (
      this.props.children
    )
  }
}
const number = (v: number) => (Number.isFinite(v) ? v.toFixed(9) : '未定義')
type RecordRow = Parameters & {
  hypothesis: string
  compound: number
  positive: number
  negative: number
  slope: number
}
function load<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback
  } catch {
    return fallback
  }
}
function App() {
  const [mode, setMode] = useState<'inquiry' | 'movie' | 'mp4'>(capture ? 'movie' : 'inquiry'),
    [t, setT] = useState(0),
    [playing, setPlaying] = useState(false),
    [chapter, setChapter] = useState(0),
    [p, setP] = useState<Parameters>({ a: 2, x: 1, h: 0.1, n: 1 }),
    [reveal, setReveal] = useState(capture),
    [teacher, setTeacher] = useState(false),
    [flat, setFlat] = useState(false),
    [large, setLarge] = useState(false),
    [highlight, setHighlight] = useState(''),
    [effects, setEffects] = useState(!matchMedia('(prefers-reduced-motion: reduce)').matches),
    [voice, setVoice] = useState(true),
    [node, setNode] = useState('ln'),
    [hypothesis, setHypothesis] = useState(() => load('birth-e-hypothesis', '')),
    [reflection, setReflection] = useState(() => load('birth-e-reflection', '')),
    [records, setRecords] = useState<RecordRow[]>(() => load('birth-e-records', [])),
    [status, setStatus] = useState(''),
    [videoAvailable, setVideoAvailable] = useState(false)
  const video = useRef<HTMLVideoElement>(null),
    audio = useRef<HTMLAudioElement>(null),
    raf = useRef(0),
    c = mode === 'movie' ? chapterAt(t) : chapter,
    params = mode === 'movie' ? movieParameters(t) : p,
    show = reveal || mode === 'movie',
    q = chapters[c]
  useEffect(() => {
    fetch('../../media/birth-of-e-90s.mp4', { method: 'HEAD' })
      .then((r) =>
        setVideoAvailable(r.ok && Boolean(r.headers.get('content-type')?.includes('video'))),
      )
      .catch(() => {})
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem('birth-e-hypothesis', JSON.stringify(hypothesis))
      localStorage.setItem('birth-e-reflection', JSON.stringify(reflection))
      localStorage.setItem('birth-e-records', JSON.stringify(records))
    } catch {
      setStatus('端末への保存ができません。記録をJSONで書き出してください。')
    }
  }, [hypothesis, reflection, records])
  useEffect(() => {
    if (capture) {
      ;(window as any).__renderAt = (time: number) => {
        flushSync(() => {
          setT(time)
          setMode('movie')
          setReveal(true)
        })
        return new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        )
      }
      ;(window as any).__birthReady = true
    }
    return () => {
      delete (window as any).__renderAt
    }
  }, [])
  useEffect(() => {
    if (!playing || mode !== 'movie') return
    let prev = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - prev) / 1000)
      prev = now
      setT((v) => {
        const next = Math.min(
          DURATION,
          audio.current && audio.current.readyState >= 2 && !audio.current.paused
            ? audio.current.currentTime
            : v + dt,
        )
        if (next === DURATION) setPlaying(false)
        return next
      })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [playing, mode])
  useEffect(() => {
    if (!audio.current || capture) return
    if (playing && mode === 'movie') {
      audio.current.currentTime = t
      audio.current
        .play()
        .catch(() => setStatus('音声の再生を許可するため、再生ボタンをもう一度押してください。'))
    } else audio.current.pause()
  }, [playing, mode])
  useEffect(() => {
    if (capture || mode !== 'inquiry' || !effects) return
    let prev = performance.now(),
      id = 0
    const tick = (now: number) => {
      if (now - prev > 45) {
        setT((v) => v + (now - prev) / 1000)
        prev = now
      }
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [mode, effects])
  const update = (key: keyof Parameters, v: number) => {
    setP((prev) => ({ ...prev, [key]: v }))
    setStatus('')
  }
  const stop = () => {
    setPlaying(false)
    if (video.current) video.current.pause()
    if ('speechSynthesis' in window) speechSynthesis.cancel()
  }
  const select = (i: number) => {
    stop()
    setChapter(i)
    if (i === 4) setP((v) => ({ ...v, x: 1 }))
    setT(chapters[i].start)
    if (mode === 'mp4' && video.current) video.current.currentTime = chapters[i].start
  }
  const enter = (next: 'inquiry' | 'movie' | 'mp4') => {
    stop()
    setMode(next)
    if (next === 'inquiry') setReveal(false)
    if (next === 'movie') setT(0)
  }
  const slider = (label: string, key: keyof Parameters, min: number, max: number, step: number) => (
    <label className="slider">
      {label}
      <output>
        {key === 'h'
          ? params.h.toExponential(2)
          : params[key].toFixed(key === 'a' ? 3 : key === 'n' ? 0 : 2)}
      </output>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={params[key]}
        disabled={mode !== 'inquiry' || (key === 'x' && c === 4)}
        onChange={(e) => update(key, +e.target.value)}
      />
    </label>
  )
  const record = () => {
    if (!hypothesis.trim()) {
      setStatus('まず仮説を書いてから、結果を記録しましょう。')
      return
    }
    setRecords((v) => [
      ...v,
      {
        ...p,
        hypothesis,
        compound: compound(p.n),
        positive: limitExperiment(Math.abs(p.h)),
        negative: limitExperiment(-Math.abs(p.h)),
        slope: secant(p.x, p.h, p.a),
      },
    ])
    setStatus('仮説と現在の条件・測定結果を記録しました。')
  }
  const exportRecords = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ hypothesis, reflection, records }, null, 2)], {
        type: 'application/json',
      }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = 'birth-of-e-inquiry.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  const displayFormula =
    c === 0
      ? '(1+1/n)^n'
      : c === 1
        ? '(1+h)^{1/h}'
        : c === 2
          ? 'y=\\log_a x'
          : c === 3
            ? '\\frac{\\log_a(x+h)-\\log_a x}{h}'
            : c === 4
              ? show
                ? mode === 'movie' && t < 70
                  ? 'e:=\\lim_{h\\to0}(1+h)^{1/h}'
                  : '\\left.\\frac{d}{dx}\\log_a x\\right|_{x=1}=\\frac{1}{\\ln a}'
                : 'y=\\log_a x'
              : show
                ? params.a === Math.E
                  ? '\\frac{d}{dx}\\ln x=\\frac1x'
                  : '\\frac{d}{dx}\\log_a x=\\frac1{x\\ln a}'
                : 'y=\\log_a x'
  return (
    <div className={`app ${capture ? 'capture' : ''} ${large ? 'large' : ''}`}>
      <audio
        ref={audio}
        src="../../media/birth-of-e-narration.m4a"
        preload="auto"
        muted={!voice}
        onEnded={() => setPlaying(false)}
      />
      <header>
        <a href="../../">← 教材ライブラリ</a>
        <span>数学Ⅱ · 数学Ⅲ</span>
        <button
          onClick={() => {
            stop()
            setTeacher((v) => !v)
            setReveal(false)
            setMode('inquiry')
          }}
        >
          {teacher ? '生徒モード' : '教師モード'}
        </button>
        <button onClick={() => setLarge((v) => !v)}>文字 {large ? '標準' : '拡大'}</button>
      </header>
      <section className="intro">
        <div>
          <small>AN INTERACTIVE MATHEMATICAL DOCUMENTARY</small>
          <h1>
            The Birth of <i>e</i>
            <span>ネイピア数eの誕生</span>
          </h1>
          <p>変化の中に、変わらない数を見つける。</p>
        </div>
        <div className="duration">
          <b>90</b>
          <span>
            SECONDS
            <br />∞ DISCOVERIES
          </span>
        </div>
      </section>
      <div className="modebar">
        <button className={mode === 'inquiry' ? 'active' : ''} onClick={() => enter('inquiry')}>
          01　探究する
        </button>
        <button
          className={mode === 'movie' ? 'active' : ''}
          disabled={!reveal && !teacher}
          onClick={() => enter('movie')}
        >
          02　90秒の自動映像
        </button>
        {videoAvailable && (
          <button
            className={mode === 'mp4' ? 'active' : ''}
            disabled={!reveal && !teacher}
            onClick={() => enter('mp4')}
          >
            03　MP4を再生
          </button>
        )}
        <span>
          {!reveal && !teacher
            ? '解答を隠しています · 映像は解答公開後に視聴できます'
            : '同じ数値モデルで、映像と実験を同期'}
        </span>
      </div>
      <main>
        <section className="stage">
          <div className="stage-top">
            <span>
              <i /> {mode === 'movie' ? 'DOCUMENTARY' : 'LIVE EXPERIMENT'}
            </span>
            <span>{String(c + 1).padStart(2, '0')} / 06</span>
          </div>
          {mode === 'mp4' ? (
            <video
              ref={video}
              controls
              playsInline
              src="../../media/birth-of-e-90s.mp4"
              onTimeUpdate={(e) => {
                setT(e.currentTarget.currentTime)
                setChapter(chapterAt(e.currentTarget.currentTime))
              }}
            />
          ) : (
            <Guard>
              <Scene
                chapter={c}
                p={params}
                time={t}
                movie={mode === 'movie'}
                flat={flat}
                reveal={show}
                highlight={highlight}
                effects={effects}
                node={node}
              />
            </Guard>
          )}
          <div className="film-title">
            <small>{q.en}</small>
            <h2>{q.title}</h2>
          </div>
          <div
            className="formula-overlay"
            style={
              mode === 'movie'
                ? {
                    transform: `perspective(800px) rotateY(${Math.max(0, 1 - (t - q.start) / 0.8) * 35}deg) scale(${1 - Math.max(0, 1 - (t - q.start) / 0.8) * 0.12})`,
                    transformOrigin: 'left center',
                  }
                : undefined
            }
            onClick={() => setHighlight(highlight ? '' : 'curve')}
          >
            <Formula s={displayFormula} />
          </div>
          <div className="math-caption">
            {c === 0
              ? `元金1 → 1年後 ${number(compound(params.n))}　｜　n = ${params.n}`
              : c === 1
                ? `h > 0 : ${number(limitExperiment(Math.abs(params.h)))}　　h < 0 : ${number(limitExperiment(-Math.abs(params.h)))}`
                : c === 2
                  ? `青：y = logₐ x　金：y = aˣ　｜　a = ${params.a.toFixed(4)}`
                  : c === 3
                    ? `割線の傾き ${number(secant(params.x, params.h, params.a))}　｜　h = ${params.h.toExponential(2)}`
                    : c === 4
                      ? show
                        ? `${params.a === Math.E ? 'e ≈ 2.718281828459045　｜　' : ''}a ≈ ${params.a.toFixed(9)}　接線の傾き ≈ ${number(derivative(1, params.a))}`
                        : '底を変え、割線の傾きが1に近づく条件を探そう'
                      : show
                        ? `x = ${params.x.toFixed(3)}　接線の傾き ≈ ${number(derivative(params.x, params.a))}`
                        : 'xを動かし、傾きの変化を比べよう'}
          </div>
          {mode === 'movie' && <div className="subtitles">{cueAt(t)}</div>}
          <div className="stage-bottom">
            <span>
              {c === 1
                ? '横：−log₁₀|h|−1（右へ0に接近）／縦：10×(値−2.5)／奥行き：正負の比較'
                : '曲線は z=0 の同じ平面／奥行きは視点と比較のため'}
            </span>
            <span>
              {mode === 'movie' && t >= 86
                ? '音声：NITech HTS Voice / CC BY 3.0'
                : mode === 'movie'
                  ? `${t.toFixed(1)} / 90.0 s`
                  : 'ドラッグ：回転 · ピンチ：拡大 · 2本指：移動'}
            </span>
          </div>
        </section>
        <aside className="panel">
          <small>YOUR MATHEMATICS LAB</small>
          <h2>{teacher ? '教師の操作室' : '問いから、実験へ'}</h2>
          <p className="question">{q.question}</p>
          {slider('底 a', 'a', 0.2, 5, 0.001)}
          {Math.abs(params.a - 1) < 0.02 && (
            <p className="warning">
              a=1は対数の底にできません。1の近くでは傾きが非常に大きくなります。
            </p>
          )}
          {slider('接点 x', 'x', 0.2, 4, 0.01)}
          {slider('増分 h', 'h', -0.8, 0.8, 0.001)}
          <label className="slider">
            |h| の桁<output>{Math.abs(params.h).toExponential(1)}</output>
            <input
              aria-label="hの桁"
              type="range"
              min={-9}
              max={-0.1}
              step={0.1}
              disabled={mode !== 'inquiry'}
              value={Math.log10(Math.max(1e-9, Math.abs(params.h)))}
              onChange={(e) => update('h', (params.h < 0 ? -1 : 1) * 10 ** +e.target.value)}
            />
          </label>
          {slider('複利の分割 n', 'n', 1, 365, 1)}
          <div className="presets">
            {[1, 2, 4, 12, 365, 10000].map((n) => (
              <button key={n} disabled={mode !== 'inquiry'} onClick={() => update('n', n)}>
                {n}
              </button>
            ))}
          </div>
          <div className="actions">
            <button onClick={() => setFlat((v) => !v)}>{flat ? '3Dへ' : '2Dへ'}</button>
            <button onClick={() => setEffects((v) => !v)}>光・鼓動 {effects ? 'ON' : 'OFF'}</button>
            <button
              onClick={() => {
                setP({ a: 2, x: 1, h: 0.1, n: 1 })
                setStatus('条件を初期化しました。記録は保持しています。')
              }}
              disabled={mode !== 'inquiry'}
            >
              条件を戻す
            </button>
          </div>
          {params.h === 0 && <p className="warning">h=0は未定義。接線は極限から求めます。</p>}
          {params.x + params.h <= 0 && <p className="warning">x+h≤0では対数が定義できません。</p>}
          {mode === 'inquiry' && (
            <>
              <label>
                仮説
                <textarea
                  placeholder="例：分割回数を増やすと、元利合計は…"
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                />
              </label>
              <button className="primary" onClick={record}>
                この条件で結果を記録 ↗
              </button>
              <button className="reveal" onClick={() => setReveal((v) => !v)}>
                {reveal ? '解答を隠す' : '考察を終えて解答を公開する'}
              </button>
              {show && (
                <button onClick={() => update('a', Math.E)}>底を正確な e の計算値に設定</button>
              )}
            </>
          )}
          {mode === 'movie' && (
            <>
              <button
                className="primary"
                onClick={() => {
                  if (t >= 90) setT(0)
                  setPlaying((v) => !v)
                }}
              >
                {playing ? '一時停止' : '90秒の映像を再生'}
              </button>
              <label className="check">
                <input
                  type="checkbox"
                  checked={voice}
                  onChange={(e) => setVoice(e.target.checked)}
                />
                日本語ナレーション
              </label>
              <small>収録音声の再生時刻を基準に映像と字幕を同期します。</small>
            </>
          )}
          {status && <p role="status">{status}</p>}
        </aside>
      </main>
      {mode === 'movie' && (
        <label className="timeline">
          タイムライン
          <input
            type="range"
            aria-label="動画時刻"
            min="0"
            max="90"
            step=".1"
            value={t}
            onChange={(e) => {
              stop()
              setT(+e.target.value)
            }}
          />
        </label>
      )}
      <nav className="chapters" aria-label="シーン選択">
        {chapters.map((v, i) => (
          <button className={c === i ? 'selected' : ''} onClick={() => select(i)} key={v.start}>
            <small>
              {String(i + 1).padStart(2, '0')}　{v.start}–{v.end}s
            </small>
            <span>{v.title}</span>
          </button>
        ))}
      </nav>
      <section className="below">
        <div className="panel numeric">
          <small>OBSERVE BOTH SIDES</small>
          <h2>同じ条件を、数値で見る</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>|h|</th>
                  <th>正側 (1+h)¹ᐟʰ</th>
                  <th>負側 (1+h)¹ᐟʰ</th>
                </tr>
              </thead>
              <tbody>
                {[0.1, 0.01, 0.001, 0.00001, 1e-9].map((h) => (
                  <tr key={h}>
                    <td>{h.toExponential(0)}</td>
                    <td>{number(limitExperiment(h))}</td>
                    <td>{number(limitExperiment(-h))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ConvergenceChart reveal={show} />
          <p>
            有限の計算は近似値です。この表だけでは極限の証明になりません。定義域は h&gt;−1、h≠0。
          </p>
        </div>
        <div className="panel">
          <small>LINK FORMULA TO GEOMETRY</small>
          <h2>数式と図形を結ぶ</h2>
          <div className="formula-buttons">
            {[
              ['curve', '曲線', 'y=\\log_a x'],
              ['h', '2点の差', '\\Delta x=h'],
              ['slope', '接線', '\\Delta y/\\Delta x'],
            ].map(([key, label, s]) => (
              <button
                key={key}
                className={highlight === key ? 'selected' : ''}
                onClick={() => setHighlight(highlight === key ? '' : key)}
              >
                {label}
                <Formula s={s} />
              </button>
            ))}
          </div>
          <p>
            {highlight === 'curve'
              ? '青い曲線は、各xに対してlogₐxを対応させます。'
              : highlight === 'h'
                ? '赤い2点の横方向の差がh。赤い割線の傾きはΔy/Δxです。'
                : highlight === 'slope'
                  ? '金の線は曲線に接する接線。割線と接線はh≠0では別の直線です。'
                  : '要素を選択すると、対応する図形が強調されます。'}
          </p>
          {show && (
            <div className="answer">
              <Formula s={`m_{\\mathrm{sec}}=${number(secant(params.x, params.h, params.a))}`} />
              <br />
              <Formula
                s={`m_{\\mathrm{tan}}=\\frac1{x\\ln a}=${number(derivative(params.x, params.a))}`}
              />
              <p>
                底aを変えると曲線と接線を同時に再計算。0&lt;a&lt;1では傾きは負、a&gt;1では正です。
              </p>
            </div>
          )}
          <label>
            振り返り
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="予想と結果の違いは？ 次に変えたい条件は？"
            />
          </label>
          <small>記録はこの端末に保存されます。</small>
        </div>
      </section>
      <section className="panel records">
        <small>HYPOTHESIS → EVIDENCE → REFLECTION</small>
        <h2>
          実験の比較 <span>{records.length}件</span>
        </h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>仮説</th>
                <th>a / x / h / n</th>
                <th>元利合計</th>
                <th>正側 / 負側</th>
                <th>割線の傾き</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i}>
                  <td>{r.hypothesis}</td>
                  <td>
                    {r.a.toFixed(3)} / {r.x} / {r.h.toExponential(1)} / {r.n}
                  </td>
                  <td>{number(r.compound)}</td>
                  <td>
                    {number(r.positive)} / {number(r.negative)}
                  </td>
                  <td>{number(r.slope)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!records.length && (
          <p>仮説を書いて「この条件で結果を記録」を押すと、比較表に追加されます。</p>
        )}
        <button onClick={exportRecords}>記録をJSONで書き出す</button>
      </section>
      {show && (
        <section className="panel explanations">
          <small>THE MATHEMATICAL CONNECTIONS</small>
          <h2>数学の系譜</h2>
          <div className="nodes">
            {[
              ['ln', '自然対数'],
              ['exp', '指数関数'],
              ['diff', '微分'],
              ['integral', '積分'],
              ['growth', '連続成長'],
            ].map(([key, title]) => (
              <button
                className={node === key ? 'selected' : ''}
                key={key}
                onClick={() => {
                  setNode(key)
                  setChapter(key === 'growth' ? 0 : key === 'exp' ? 2 : 5)
                  setMode('inquiry')
                  stop()
                  setP((v) => ({ ...v, a: Math.E, x: 2 }))
                  setReveal(true)
                }}
              >
                {title}
              </button>
            ))}
          </div>
          <p>
            {node === 'ln'
              ? 'ln x は底がeの対数。定義域はx>0。'
              : node === 'exp'
                ? 'eˣとln xは逆関数。同じ平面上で直線y=xに関して反射した位置にあります。'
                : node === 'diff'
                  ? '自然対数の接線の傾きは1/x。指数関数eˣの接線の傾きはeˣです。'
                  : node === 'integral'
                    ? '赤い曲線はy=1/x。金の短冊は1からxまでの符号付き面積の近似。この積分はln xに等しく、元の青い曲線はln xです。'
                    : '成長速度が現在量に比例すると、y′=ry。解y=Ceʳᵗが連続成長を表します。年利100%の無限分割はr=1、期間1の例です。'}
          </p>
          <Formula
            s={
              node === 'integral'
                ? '\\int_1^x\\frac1t\\,dt=\\ln x'
                : node === 'exp'
                  ? '\\ln(e^x)=x,\\quad e^{\\ln x}=x\\ (x>0)'
                  : node === 'growth'
                    ? "y'=ry\\quad\\Longrightarrow\\quad y=Ce^{rt}"
                    : '\\frac{d}{dx}e^x=e^x,\\quad\\frac{d}{dx}\\ln x=1/x'
            }
          />
          <details open={teacher}>
            <summary>対数の微分：なぜ変数を置き換えるのか</summary>
            <p>
              x&gt;0、a&gt;0、a≠1。hを「xに対する割合」k=h/xに置き換え、xを極限の外へ分離します。
            </p>
            <Formula
              s={
                '\\frac{\\log_a(x+h)-\\log_a x}{h}=\\frac{\\log_a(1+h/x)}h=\\frac1x\\log_a(1+k)^{1/k}'
              }
            />
            <p>h→0ならk→0。金色の極限が、xによらない定数を与えます。</p>
            <div className="gold">
              <Formula s={'e:=\\lim_{k\\to0}(1+k)^{1/k}'} />
            </div>
            <Formula s={'\\frac{d}{dx}\\log_a x=\\frac{\\log_a e}{x}=\\frac1{x\\ln a}'} />
            <p>
              a=eとすればlogₑe=1なので、(ln x)′=1/x。底aは選べるパラメータ、eは固定された定数です。
            </p>
          </details>
          <details open={teacher}>
            <summary>定義・近似・歴史を区別する</summary>
            <p>
              この教材では e を上の両側極限で定義します。e≈2.718281828459045
              は有限桁の近似です。複利の式はk=1/nに相当し、同じ極限に近づきます。
            </p>
            <p>
              存在の説明：ln(1+h)/h は、区間の向きに注意して 1 と 1/(1+h)
              の間に挟まれ、h→0で1へ近づきます。ここでlnを∫₁ˣdt/tで定義すれば、連続な逆関数expにより式の極限はexp(1)。logの連続性と変換を用いるには、これらの前提が必要です。
            </p>
            <p>
              複利の極限は17世紀のヤコブ・ベルヌーイの研究と関係し、記号eは後にオイラーが用いました。ネイピアの対数の研究と、本教材の導出順序は歴史上の発見順序と同一ではありません。
            </p>
          </details>
        </section>
      )}
      <footer>
        <span>THE BIRTH OF e · 90秒と、その先の探究</span>
        <span>原作PDF照合待ち · 仕様に基づく制作版</span>
      </footer>
    </div>
  )
}
function ConvergenceChart({ reveal }: { reveal: boolean }) {
  const path = (sign: number) =>
    Array.from({ length: 100 }, (_, i) => {
      const l = 1 + (i / 99) * 5,
        h = sign * 10 ** -l
      return `${40 + ((l - 1) / 5) * 470},${145 - ((limitExperiment(h) - 2.58) / 0.3) * 125}`
    }).join(' L')
  return (
    <svg
      className="convergence-chart"
      viewBox="0 0 570 190"
      role="img"
      aria-label="hの正負両側から同じ値へ近づくグラフ"
    >
      <path d="M40 15V145H520" stroke="#758493" fill="none" />
      {[2.6, 2.7, 2.8].map((v) => (
        <g key={v}>
          <text x="2" y={150 - ((v - 2.58) / 0.3) * 125} fill="#a9b8c7" fontSize="11">
            {v}
          </text>
          <path d={`M40 ${145 - ((v - 2.58) / 0.3) * 125}H520`} stroke="#243444" />
        </g>
      ))}
      <path d={'M' + path(1)} stroke="#69d7dc" strokeWidth="3" fill="none" />
      <path d={'M' + path(-1)} stroke="#ee8a93" strokeWidth="3" fill="none" />
      {reveal && (
        <path
          d={`M40 ${145 - ((Math.E - 2.58) / 0.3) * 125}H520`}
          stroke="#e8bc73"
          strokeDasharray="5 4"
        />
      )}
      <text x="40" y="165" fill="#a9b8c7" fontSize="12">
        |h|=10⁻¹
      </text>
      <text x="447" y="165" fill="#a9b8c7" fontSize="12">
        |h|=10⁻⁶
      </text>
      <text x="172" y="186" fill="#a9b8c7" fontSize="12">
        横軸：−log₁₀|h|　右へ進むほど0に近い
      </text>
      <text x="150" y="18" fill="#69d7dc" fontSize="12">
        青：h&gt;0
      </text>
      <text x="250" y="18" fill="#ee8a93" fontSize="12">
        赤：h&lt;0
      </text>
    </svg>
  )
}

export { App as FilmRenderer }
