import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  BookOpen,
  ChevronRight,
  Home,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  StepForward,
} from "lucide-react";
import Graph from "./Graph";
import Family from "./Family";
import {
  area,
  derivativeNumeric,
  fmt,
  interval,
  primitiveTerms,
  problems,
} from "./math";
import "./style.css";
function MathText({ tex }: { tex: string }) {
  return (
    <span
      className="math"
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(tex, {
          throwOnError: false,
          strict: "ignore",
          output: "htmlAndMathml",
        }),
      }}
    />
  );
}
const steps = [
  "問題理解",
  "式変形",
  "グラフ探究",
  "積分計算",
  "微分による検証",
];
const questions = [
  {
    q: "元の関数が負になる区間では、原始関数はどう変化するか。",
    hint: "2Dで赤い曲線と金色の接線を観察しよう。",
    explain:
      "F′(x)=f(x)<0 なら接線の傾きは負。原始関数はその区間で減少する。例題1 (2)の 2<x<3 で確かめよう。",
  },
  {
    q: "積分定数Cを変えると、接線の傾きも変化するか。",
    hint: "3DモードでCを動かし、傾きの数値を比べよう。",
    explain:
      "定数の微分は0。d(F+C)/dx=F′+0=f。高さは変わるが、同じxで接線の傾きは変わらない。",
  },
  {
    q: "なぜlog xではなくlog|x|なのか。",
    hint: "絶対値モードで負の区間を選び、3つの式を切り替えよう。負の1/xは紫、正の1/xは水色です。",
    explain:
      "x<0でlog xは実数として未定義。log(-x)なら -x>0 で定義され、微分は (-1)/(-x)=1/x。両区間をlog|x|と表せるが、x=0では未定義で定数は独立。",
  },
  {
    q: "元の関数がx軸を横切らなくても原始関数は増減するか。",
    hint: "練習2 (2)では f(x)>0 がずっと成り立つ。練習2 (1)のx=1でも観察しよう。",
    explain:
      "増減はfの符号で決まる。横切らなくても正なら増加、負なら減少。練習2 (1)はx=1でf=0でも前後は正であり、増減は切り替わらない。",
  },
  {
    q: "式を展開・整理すると、なぜ積分が簡単になるのか。",
    hint: "式変形段階で点線の各項と、それらの和を比べよう。",
    explain:
      "分母で項ごとに割ると、べき関数と1/xの和になる。積分の線形性により各項に公式を使える。同値な式は同じ関数を表すので和のグラフは変わらない。",
  },
];
function App() {
  const [pid, setPid] = useState("e2"),
    [mode, setMode] = useState("2d"),
    [step, setStep] = useState(0),
    [side, setSide] = useState(1),
    [near, setNear] = useState(false),
    [x, setX] = useState(2.5),
    [a, setA] = useState(1),
    [cp, setCp] = useState(0),
    [cn, setCn] = useState(0),
    [zoom, setZoom] = useState(1),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(0.6),
    [low, setLow] = useState(false),
    [effects, setEffects] = useState(
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [teacher, setTeacher] = useState(false),
    [trace, setTrace] = useState<number[]>([]),
    [comparison, setComparison] = useState("log|x|"),
    [q, setQ] = useState(0),
    [activity, setActivity] = useState(0),
    [predictions, setPredictions] = useState<string[]>(Array(5).fill("")),
    [reflections, setReflections] = useState<string[]>(Array(5).fill("")),
    [hint, setHint] = useState(0),
    [answer, setAnswer] = useState(""),
    [checked, setChecked] = useState(false),
    [forming, setForming] = useState(false),
    [reveal, setReveal] = useState(1);
  const p = problems.find((v) => v.id === (mode === "log" ? "log" : pid))!;
  const range = useMemo(() => interval(side, near), [side, near]);
  const c = side > 0 ? cp : cn;
  const min = range[0],
    max = range[1];
  const f = p.f(x),
    A = area(p, a, x);
  const lastX = useRef(x);
  function changeInterval(s: number, n = near) {
    setPlaying(false);
    setForming(false);
    setReveal(1);
    setSide(s);
    setNear(n);
    const [l, h] = interval(s, n);
    setX(s > 0 ? Math.min(2.5, h) : Math.max(-2.5, l));
    setA(s > 0 ? 1 : -1);
    setTrace([]);
  }
  function changeProblem(id: string) {
    setPid(id);
    setStep(0);
    setHint(0);
    setChecked(false);
    setPlaying(false);
    setMode("2d");
    changeInterval(problems.find((t) => t.id === id)?.positiveOnly ? 1 : side);
  }
  function changeMode(m: string) {
    setMode(m);
    setPlaying(false);
    setForming(false);
    setReveal(1);
    setTrace([]);
    if (
      m !== "log" &&
      problems.find((t) => t.id === pid)?.positiveOnly &&
      side < 0
    )
      changeInterval(1);
  }
  function move(v: number) {
    setForming(false);
    setReveal(1);
    setX(Math.max(min, Math.min(max, v)));
  }
  useEffect(() => {
    if (!playing) return;
    let previous = performance.now(),
      frame: number;
    const animate = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.1);
      previous = now;
      setX((old) => {
        const next = old + dt * speed;
        if (next >= max) {
          setPlaying(false);
          return max;
        }
        return next;
      });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, max]);
  useEffect(() => {
    if (effects && Math.abs(x - lastX.current) < 0.5)
      setTrace((t) => [...t, x].slice(-100));
    else setTrace([]);
    lastX.current = x;
  }, [x, effects]);
  function reset() {
    setPid("e2");
    setMode("2d");
    setStep(0);
    setSide(1);
    setNear(false);
    setX(2.5);
    setA(1);
    setCp(0);
    setCn(0);
    setZoom(1);
    setPlaying(false);
    setForming(false);
    setReveal(1);
    setTrace([]);
    setActivity(0);
    setQ(0);
    setHint(0);
    setChecked(false);
    setLow(false);
    setTeacher(false);
    setSpeed(0.6);
    setEffects(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setAnswer("");
    setComparison("log|x|");
  }
  useEffect(() => {
    if (!forming) return;
    let frame: number,
      previous = performance.now();
    const draw = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.1);
      previous = now;
      setReveal((v) => {
        const next = Math.min(1, v + dt * 0.4);
        if (next === 1) setForming(false);
        return next;
      });
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [forming]);
  const domain = p.positiveOnly ? "x>0" : "x≠0";
  const equivalentError = Math.abs(p.raw(x) - p.f(x));
  const forbidden =
    mode === "log" &&
    ((comparison === "log x" && side < 0) ||
      (comparison === "log(-x)" && side > 0));
  return (
    <div className={`app ${!effects || low ? "still" : ""}`}>
      <header>
        <a className="back" href="../../">
          <Home size={17} />
          教材ライブラリ
        </a>
        <span className="tag">数学Ⅲ · 積分法</span>
        <button onClick={reset}>
          <RotateCcw size={16} />
          初期画面
        </button>
      </header>
      <main>
        <div className="intro">
          <div>
            <p className="eyebrow">ANTIDERIVATIVE EXPLORER</p>
            <h1>
              不定積分と原始関数 <span>2D・3D探究</span>
            </h1>
            <p>
              関数の「高さ」が、原始関数の「傾き」になる。そのつながりを動かして見つけよう。
            </p>
          </div>
          <div className="identity">
            <MathText tex={"F'(x)=f(x)"} />
            <small>微分と積分をつなぐ関係</small>
          </div>
        </div>
        <div className="workspace">
          <aside className="sidebar">
            <section className="panel">
              <div className="section-title">
                <BookOpen size={18} />
                <b>問題を選ぶ</b>
                <small>教科書 p.136 対応</small>
              </div>
              <label>
                例題・練習
                <select
                  value={pid}
                  onChange={(e) => changeProblem(e.target.value)}
                >
                  {problems
                    .filter((t) => t.id !== "log")
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </label>
              <div className="equation">
                <MathText tex={`\\int ${p.source}\\,dx`} />
              </div>
              <div className="badge">定義域：{domain}　／　log は自然対数</div>
              <ol className="steps">
                {steps.map((s, i) => (
                  <li key={s}>
                    <button
                      className={step === i ? "selected" : ""}
                      onClick={() => {
                        setStep(i);
                        setHint(0);
                      }}
                    >
                      <span>{i + 1}</span>
                      {s}
                      <ChevronRight size={14} />
                    </button>
                  </li>
                ))}
              </ol>
            </section>
            <section className="panel controls">
              <div className="section-title">
                <Settings2 size={18} />
                <b>実験コントロール</b>
              </div>
              <label>
                定義域の区間
                <select
                  aria-label="定義域の区間"
                  value={side}
                  onChange={(e) => changeInterval(Number(e.target.value))}
                >
                  <option value={1}>正の区間 x &gt; 0</option>
                  {!p.positiveOnly && (
                    <option value={-1}>負の区間 x &lt; 0</option>
                  )}
                </select>
              </label>
              <label className="slider-label">
                共有する x <output>{fmt(x)}</output>
                <input
                  aria-label="共有するx"
                  type="range"
                  min={min}
                  max={max}
                  step=".001"
                  value={x}
                  onChange={(e) => {
                    setPlaying(false);
                    move(+e.target.value);
                  }}
                />
              </label>
              <div className="playback">
                <button
                  aria-label={playing || forming ? "停止" : "再生"}
                  onClick={() => {
                    if (playing || forming) {
                      setPlaying(false);
                      setForming(false);
                    } else {
                      if (x >= max) move(min);
                      setReveal(1);
                      setPlaying(true);
                    }
                  }}
                >
                  {playing || forming ? (
                    <Pause size={17} />
                  ) : (
                    <Play size={17} />
                  )}{" "}
                  {playing || forming ? "停止" : "再生"}
                </button>
                <button
                  aria-label="前へコマ送り"
                  onClick={() => {
                    setPlaying(false);
                    move(x - 0.05);
                  }}
                >
                  −0.05
                </button>
                <button
                  aria-label="コマ送り"
                  onClick={() => {
                    setPlaying(false);
                    move(x + 0.05);
                  }}
                >
                  <StepForward size={16} />
                  +0.05
                </button>
              </div>
              <button
                className="draw-button"
                onClick={() => {
                  setPlaying(false);
                  setReveal(effects ? 0 : 1);
                  setForming(effects);
                }}
              >
                曲線を描き直す
              </button>
              <label>
                再生速度
                <select
                  aria-label="再生速度"
                  value={speed}
                  onChange={(e) => setSpeed(+e.target.value)}
                >
                  <option value={0.15}>スロー ×0.25</option>
                  <option value={0.6}>標準 ×1</option>
                  <option value={1.2}>×2</option>
                </select>
              </label>
              <label className="slider-label">
                {p.positiveOnly
                  ? "積分定数 C"
                  : side > 0
                    ? "積分定数 C₊（正の区間）"
                    : "積分定数 C₋（負の区間）"}
                <output>{c.toFixed(2)}</output>
                <input
                  aria-label="積分定数C"
                  type="range"
                  min={-4}
                  max={4}
                  step=".05"
                  value={c}
                  onChange={(e) => (side > 0 ? setCp : setCn)(+e.target.value)}
                />
              </label>
              {!p.positiveOnly && (
                <small>
                  C₊ = {cp.toFixed(2)} ／ C₋ = {cn.toFixed(2)}
                  <br />
                  別々の区間なので、定数も独立。
                </small>
              )}
              <label className="slider-label">
                2D縦軸ズーム<output>{zoom.toFixed(2)}×</output>
                <input
                  aria-label="縦軸ズーム"
                  type="range"
                  min=".1"
                  max="3"
                  step=".05"
                  value={zoom}
                  onChange={(e) => setZoom(+e.target.value)}
                />
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={near}
                  onChange={(e) => changeInterval(side, e.target.checked)}
                />
                0にさらに近づく（最小 |x| = 0.015）
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={effects}
                  onChange={(e) => {
                    setEffects(e.target.checked);
                    setTrace([]);
                    setForming(false);
                    setReveal(1);
                  }}
                />
                発光・軌跡の演出
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={low}
                  onChange={(e) => setLow(e.target.checked)}
                />
                低負荷モード
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={teacher}
                  onChange={(e) => setTeacher(e.target.checked)}
                />
                教師用解説を表示
              </label>
            </section>
          </aside>
          <div className="stage">
            <nav className="tabs" aria-label="探究モード">
              {[
                ["2d", "2D 原始関数"],
                ["3d", "3D ファミリー"],
                ["log", "絶対値と対数"],
                ["area", "面積の変化"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={mode === id ? "active" : ""}
                  aria-pressed={mode === id}
                  onClick={() => changeMode(id)}
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="readouts">
              <div>
                <small>元の関数の高さ</small>
                <strong className="blue">{fmt(f)}</strong>
                <span>f(x)</span>
              </div>
              <div>
                <small>原始関数の接線の傾き</small>
                <strong
                  style={{
                    color:
                      f > 1e-9 ? "#61e6a7" : f < -1e-9 ? "#ff8193" : "#ffcf75",
                  }}
                >
                  {forbidden ? "未定義" : fmt(f)}
                </strong>
                <span>
                  {forbidden ? "選択した対数の実数グラフなし" : "F′(x) = f(x)"}
                </span>
              </div>
              <div>
                <small>いまの原始関数</small>
                <strong>
                  {forbidden
                    ? "実数では未定義"
                    : Math.abs(f) < 1e-9
                      ? "水平な接線"
                      : f > 0
                        ? "増加 ↗"
                        : "減少 ↘"}
                </strong>
                <span>
                  x = {fmt(x)} ／ C = {c.toFixed(2)}
                </span>
              </div>
            </div>
            {mode === "log" && (
              <section className="notice">
                <b>基本探究 1/x：絶対値は「負の区間も含める」ために必要</b>
                <div className="pills">
                  {["log x", "log(-x)", "log|x|"].map((t) => (
                    <button
                      aria-pressed={comparison === t}
                      key={t}
                      className={comparison === t ? "active" : ""}
                      onClick={() => setComparison(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <MathText
                  tex={
                    "\\int\\frac1x\\,dx=\\begin{cases}\\log x+C_+ & x>0\\\\\\log(-x)+C_- & x<0\\end{cases}"
                  }
                />
                <p>
                  {forbidden
                    ? `${comparison} は選択した区間では実数として定義されません。原始関数のグラフは表示しません。`
                    : "log|x| は x>0 で log x、x<0 で log(-x)。0を越えてつなげることはできません。"}{" "}
                  x=0は縦の漸近線です。表示範囲外でも発散は続きます。
                </p>
              </section>
            )}
            {mode === "area" && (
              <section className="notice">
                <b>符号付き面積は定積分。原始関数の族は不定積分。</b>
                <label className="slider-label">
                  面積の基準 a<output>{fmt(a)}</output>
                  <input
                    aria-label="面積の基準a"
                    type="range"
                    min={min}
                    max={max}
                    step=".01"
                    value={a}
                    onChange={(e) => setA(+e.target.value)}
                  />
                </label>
                <MathText
                  tex={"A(x)=\\int_a^x f(t)\\,dt=F(x)-F(a),\\quad A'(x)=f(x)"}
                />
                <p>
                  A(x) = {fmt(A)} ／ A(a)=0 ／ F(x)+C = A(x)+F(a)+C
                  <br />
                  {x < a
                    ? "x<a なので積分の向きが逆。表示領域の符号を反転して面積を数えます。"
                    : "上の緑の領域は正、下の赤の領域は負として加えます。"}{" "}
                  基準aとxは必ず同じ定義域区間にあります。
                </p>
                <small>
                  Cを動かしてもA(x)は変わりません。高さの差によりCは相殺されます。
                </small>
              </section>
            )}
            <div className="mobile-controls">
              <label className="slider-label">
                x <output>{fmt(x)}</output>
                <input
                  type="range"
                  aria-label="モバイル共有x"
                  min={min}
                  max={max}
                  step=".001"
                  value={x}
                  onChange={(e) => {
                    setPlaying(false);
                    move(+e.target.value);
                  }}
                />
              </label>
              <label className="slider-label">
                C <output>{c.toFixed(2)}</output>
                <input
                  type="range"
                  aria-label="モバイル積分定数C"
                  min={-4}
                  max={4}
                  step=".05"
                  value={c}
                  onChange={(e) => (side > 0 ? setCp : setCn)(+e.target.value)}
                />
              </label>
              <button
                onClick={() => {
                  if (playing || forming) {
                    setPlaying(false);
                    setForming(false);
                  } else {
                    if (x >= max) move(min);
                    setReveal(1);
                    setPlaying(true);
                  }
                }}
              >
                {playing || forming ? <Pause size={16} /> : <Play size={16} />}{" "}
                {playing || forming ? "停止する" : "動かす"}
              </button>
              <button
                onClick={() => {
                  setPlaying(false);
                  move(x + 0.05);
                }}
              >
                <StepForward size={16} /> 1コマ進める
              </button>
            </div>
            <Graph
              p={p}
              x={x}
              c={c}
              a={a}
              range={range}
              zoom={zoom}
              kind="f"
              reveal={reveal}
              areaMode={mode === "area"}
              terms={step === 1}
              trace={trace}
              low={low || !effects}
            />
            {forbidden ? (
              <section className="plot undefined">
                <MathText
                  tex={
                    comparison === "log x"
                      ? "\\log x\\quad(x<0)：\\text{実数では未定義}"
                      : "\\log(-x)\\quad(x>0)：\\text{実数では未定義}"
                  }
                />
                <p>反対の区間を選ぶか、log|x|に切り替えて比べよう。</p>
              </section>
            ) : (
              <Graph
                p={p}
                x={x}
                c={c}
                a={a}
                range={range}
                zoom={zoom}
                kind="F"
                reveal={reveal}
                terms={step === 3}
                verify={step === 4}
                trace={trace}
                low={low || !effects}
              />
            )}
            {mode === "3d" && (
              <>
                <Family p={p} range={range} x={x} c={c} low={low} />
                <section className="notice">
                  <MathText
                    tex={
                      "\\frac{\\partial}{\\partial x}\\bigl(F(x)+C\\bigr)=F'(x)+0=f(x)"
                    }
                  />
                  <p>
                    Cを固定した曲線の接線は
                    (1,0,f(x))。Cを変えてもこの方向は同じです。y=Cの位置とzの高さが同時に変わります。
                  </p>
                  <label className="slider-label">
                    3Dからも同じ x を操作<output>{fmt(x)}</output>
                    <input
                      aria-label="3D共有x"
                      type="range"
                      min={min}
                      max={max}
                      step=".001"
                      value={x}
                      onChange={(e) => {
                        setPlaying(false);
                        move(+e.target.value);
                      }}
                    />
                  </label>
                  <label className="slider-label">
                    金色の曲線 C<output>{c.toFixed(2)}</output>
                    <input
                      aria-label="3D積分定数C"
                      type="range"
                      min={-4}
                      max={4}
                      step=".05"
                      value={c}
                      onChange={(e) =>
                        (side > 0 ? setCp : setCn)(+e.target.value)
                      }
                    />
                  </label>
                </section>
              </>
            )}
            <section className="panel learning">
              <div className="section-title">
                <span className="tag">STEP {step + 1}</span>
                <h2>{steps[step]}</h2>
              </div>
              {step === 0 && (
                <>
                  <p>
                    分母が0になる点を除き、原始関数を区間ごとに考えます。まず、元の関数の符号と原始関数の増減を予想しよう。
                  </p>
                  <MathText
                    tex={`f(x)=${p.source},\\quad ${p.positiveOnly ? "x>0" : "x\\ne0"}`}
                  />
                </>
              )}
              {step === 1 && (
                <>
                  <MathText tex={`${p.source}=${p.expanded}`} />
                  <p>
                    点線は整理した各項、実線はその和。同値な式に変形しても元の関数のグラフは同じです。
                  </p>
                  <div className="term-key">
                    {p.terms.map((t) => (
                      <span key={t.latex} style={{ color: t.color }}>
                        <MathText tex={t.latex} />
                      </span>
                    ))}
                  </div>
                  <p>
                    元の式：{fmt(p.raw(x))} ／ 整理後：{fmt(p.f(x))} ／ 誤差：
                    {equivalentError.toExponential(1)}
                  </p>
                </>
              )}
              {step === 2 && (
                <>
                  <p>
                    xを動かして、上の点の高さと下の接線の傾きを比較しよう。定数Cを動かして、変わるものと変わらないものを探そう。
                  </p>
                  <MathText tex={"F'(x)=f(x)"} />
                  <p>
                    f(x)=0となる点にコマ送りで近づこう。練習2 (1)はx=1、例題1
                    (2)はx=2,3、練習2 (3)はx=3です。
                  </p>
                </>
              )}
              {step === 3 && (
                <>
                  <MathText
                    tex={`\\int\\left(${p.expanded}\\right)dx=${p.primitive}+C`}
                  />
                  <p>
                    各項にべき関数・対数の公式を適用します。Cは定義域の各区間で任意の定数です。
                  </p>
                  <div className="term-key">
                    {primitiveTerms[p.id].map((t) => (
                      <span key={t.latex} style={{ color: t.color }}>
                        <MathText tex={t.latex} />
                      </span>
                    ))}
                  </div>
                  <p>
                    点線は各項の原始関数（C=0）、実線はその和にCを加えた曲線。
                  </p>
                  <p>
                    グラフの原始関数の高さ：{fmt(p.F(x) + c)}
                    。積分定数スライダーで、答えが1本ではなく族であることを確認しよう。
                  </p>
                </>
              )}
              {step === 4 && (
                <>
                  <MathText
                    tex={`\\frac{d}{dx}\\left(${p.primitive}+C\\right)=${p.derivative}`}
                  />
                  <p>
                    解析的な微分：{fmt(p.dF(x))} ／ 元の式：{fmt(p.raw(x))}
                  </p>
                  <p>
                    水色の点線は数値微分による接線。金色の解析的な接線と重なるか確かめよう。
                  </p>
                  <p>
                    数値微分による独立な検算：{fmt(derivativeNumeric(p, x))} ／
                    誤差：
                    {Math.abs(derivativeNumeric(p, x) - p.raw(x)).toExponential(
                      2,
                    )}
                  </p>
                  <small>
                    数値微分は近似です。0付近は変化が急で、誤差が大きくなります。証明は上の微分式です。
                  </small>
                </>
              )}
              <a href="#formulas">積分公式・既習事項を見る ↓</a>
              <div className="learning-actions">
                <button onClick={() => setHint((v) => Math.min(3, v + 1))}>
                  ヒント {hint}/3
                </button>
                <button
                  onClick={() => {
                    setStep((step + 1) % 5);
                    setHint(0);
                  }}
                >
                  {step === 4 ? "問題理解へ" : "次の段階へ"}
                  <ChevronRight size={15} />
                </button>
              </div>
              {hint > 0 && (
                <div className="hint">
                  {[
                    "まず分子を展開し、各項を分母で割ろう。",
                    "x⁻¹の項にはlog|x|、それ以外にはべき関数の積分公式を使おう。",
                    "積分後に必ず微分し、Cの微分が0になることも確認しよう。",
                  ]
                    .slice(0, hint)
                    .map((t) => (
                      <p key={t}>{t}</p>
                    ))}
                </div>
              )}
              {teacher && (
                <div className="teacher">
                  <b>教師用解説</b>
                  <p>
                    原始関数は開区間で定義する。同じ連結区間で導関数が等しければ差は定数（平均値の定理）。x=0を除く場合、正負の区間で定数を共有する必要はない。面積モードではaとxを同一区間に制限し、特異点を跨ぐ通常の定積分を作らない。練習2
                    (1)のx=1は停留点だが極値ではない。
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
        <section className="panel inquiry">
          <div className="section-title">
            <span className="tag">INQUIRY</span>
            <h2>予想して、動かして、確かめる</h2>
            <span className="badge">生徒用探究</span>
          </div>
          <select
            aria-label="探究の問い"
            value={q}
            onChange={(e) => {
              setQ(+e.target.value);
              setActivity(0);
            }}
          >
            {questions.map((t, i) => (
              <option value={i} key={t.q}>
                問い{i + 1}：{t.q}
              </option>
            ))}
          </select>
          <div className="activity-track">
            {["予想入力", "動的実験", "数学的解説", "振り返り"].map((s, i) => (
              <span key={s} className={activity === i ? "current" : ""}>
                {i + 1} {s}
              </span>
            ))}
          </div>
          <h3>{questions[q].q}</h3>
          {activity === 0 && (
            <label>
              あなたの予想
              <textarea
                value={predictions[q]}
                onChange={(e) =>
                  setPredictions((v) =>
                    v.map((s, i) => (i === q ? e.target.value : s)),
                  )
                }
                placeholder="どのように変化する？理由も書こう。"
              />
            </label>
          )}
          {activity === 1 && (
            <>
              <p>{questions[q].hint}</p>
              <button
                onClick={() => {
                  if (q === 0) {
                    changeProblem("e2");
                    changeInterval(1);
                    setX(2.5);
                  } else if (q === 1) changeMode("3d");
                  else if (q === 2) changeMode("log");
                  else if (q === 3) {
                    changeProblem("p2");
                  } else {
                    changeMode("2d");
                    setStep(1);
                  }
                  document
                    .querySelector(".workspace")
                    ?.scrollIntoView({ behavior: effects ? "smooth" : "auto" });
                }}
              >
                実験するグラフへ ↑
              </button>
            </>
          )}
          {activity === 2 && (
            <div className="notice">
              <p>{questions[q].explain}</p>
              <small>あなたの予想：{predictions[q]}</small>
            </div>
          )}
          {activity === 3 && (
            <label>
              観察から分かったこと・予想が変わった理由
              <textarea
                value={reflections[q]}
                onChange={(e) =>
                  setReflections((v) =>
                    v.map((s, i) => (i === q ? e.target.value : s)),
                  )
                }
                placeholder="グラフと数式の両方を使って説明しよう。"
              />
              <small>入力はこのページを開いている間だけ保持されます。</small>
            </label>
          )}
          <button
            disabled={activity === 0 && !predictions[q].trim()}
            onClick={() => setActivity((v) => (v + 1) % 4)}
          >
            {activity === 3
              ? "もう一度予想する"
              : activity === 0
                ? "予想を記録して実験へ"
                : activity === 1
                  ? "観察を終えて解説へ"
                  : "振り返りへ"}
            <ChevronRight size={16} />
          </button>
        </section>
        <div className="bottom-grid">
          <section className="panel" id="formulas">
            <h2>公式・既習事項</h2>
            <p>積分公式は、右辺を微分すれば検証できます。</p>
            <MathText
              tex={"\\int x^n dx=\\frac{x^{n+1}}{n+1}+C\\quad(n\\ne-1)"}
            />
            <MathText tex={"\\int\\frac1x dx=\\log|x|+C\\quad(x\\ne0)"} />
            <MathText tex={"\\int(af+bg)dx=a\\int fdx+b\\int gdx"} />
            <MathText tex={"(\\log x)'=1/x\\quad(x>0),\\quad(C)'=0"} />
            <a href="#formulas">べき関数・対数・線形性の公式一覧</a>
            <p>logは底eの自然対数。分数指数はこの教材ではx&gt;0で扱います。</p>
          </section>
          <section className="panel">
            <h2>確認問題</h2>
            <p>f(x)=1/x、a=1、x=e のとき、符号付き面積 A(e) は？</p>
            <label>
              数値を入力
              <input
                aria-label="確認問題の答え"
                type="number"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setChecked(false);
                }}
              />
            </label>
            <button onClick={() => setChecked(true)} disabled={!answer.trim()}>
              答え合わせ
            </button>
            {checked && (
              <p role="status" className="notice">
                {Math.abs(Number(answer) - 1) < 1e-9
                  ? "正解。"
                  : "もう一度考えよう。"}{" "}
                A(e)=log e−log 1=1。Cには依存しません。
              </p>
            )}
            <details>
              <summary>もう一問：f(x)=0なら必ず極値？</summary>
              <p>
                いいえ。練習2
                (1)のx=1では前後でfが正なので原始関数は増加を続けます。符号の変化が必要です。
              </p>
            </details>
          </section>
        </div>
      </main>
      <footer>
        不定積分と原始関数 2D・3D探究 · 無料ライブラリのみ · 外部API不要
        <a href="../../">教材一覧に戻る</a>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
