import { useEffect, useMemo, useState } from 'react'
import DiceScene, { type ViewName } from './scene'
import { formatTriple, triplesWithSum, type DiceTriple } from './diceMath'

const steps = ['問題','空間で表す','区別を整理','7の倍数','和が7','和が14','和の法則','解答']
const descriptions = [
  <>同じ大きさで区別のできない3個のさいころを投げて，<strong>目の和が7の倍数になる場合</strong>は何通りあるか。<br/><em>3つの出目を立体的に見てみよう。</em></>,
  <>底面の1マスが1個目と2個目の出目を表し，その上の<strong>高さが3個目</strong>の出目を表します。ドラッグして空間を回してみよう。</>,
  <><code>(1,2,4)</code>、<code>(2,1,4)</code>、<code>(4,2,1)</code> は空間では別の点。でも区別できないので，小さい順に並べて<strong>{'{1,2,4}'}という1つの場合</strong>にします。</>,
  <>3個の目の和は <strong>最小 3、最大 18</strong>。この間にある7の倍数は、<span className="cold">7</span> と <span className="warm">14</span> だけです。</>,
  <>冷たい色に光る点を順に見つけよう。どれも <strong>a ≤ b ≤ c</strong> を満たす代表です。</>,
  <>暖かい色に光る点を順に見つけよう。順番を入れ替えただけの点は同じ場合です。</>,
  <>「和が7」と「和が14」は同時には起こりません。だから<strong>和の法則</strong>で足すことができます。</>,
  <>和が7のとき4通り、和が14のとき4通り。区別できない組は全部で<strong>8通り</strong>です。</>,
]

type SumMode = 'normal' | '7' | '14' | 'both'
export default function App() {
  const [step,setStep] = useState(0); const [sumMode,setSumMode] = useState<SumMode>('normal')
  const [ordered,setOrdered] = useState(false); const [showAll,setShowAll] = useState(true)
  const [item,setItem] = useState(0); const [view,setView] = useState<ViewName>('angle'); const [resetKey,setResetKey] = useState(0)
  const sums = sumMode === 'normal' ? [] : sumMode === 'both' ? [7,14] : [Number(sumMode)]
  const focusedSum = sumMode === '14' ? 14 : 7
  const combinations = useMemo(() => triplesWithSum(focusedSum), [focusedSum])
  const current: DiceTriple | null = showAll || !sums.length ? null : combinations[item % 4]
  useEffect(() => { if (step === 4) { setSumMode('7'); setShowAll(false); setItem(0) } if (step === 5) { setSumMode('14'); setShowAll(false); setItem(0) } if (step === 6 || step === 7) { setSumMode('both'); setShowAll(true) } }, [step])
  const reset = () => { setSumMode('normal');setOrdered(false);setShowAll(true);setItem(0);setView('angle');setResetKey(k=>k+1) }
  return <main className="lesson">
    <header><a href="../../">← 教材一覧</a><div><small>数学A ／ 場合の数</small><h1>3個のさいころの和 <span>― 3Dで見る和の法則</span></h1></div><div className="progress"><b>{step+1}</b> / 8</div></header>
    <nav className="steps" aria-label="学習ステップ">{steps.map((name,i)=><button key={name} className={step===i?'active':step>i?'done':''} onClick={()=>setStep(i)}><i>{i+1}</i><span>{name}</span></button>)}</nav>
    <section className="workspace">
      <div className="visual">
        <div className="canvas-wrap"><DiceScene ordered={ordered} sums={sums} current={current} showAll={showAll} view={view} resetKey={resetKey}/><div className="legend"><span><i className="dot cold-bg"/>和が7</span><span><i className="dot warm-bg"/>和が14</span><span><i className="dot base-bg"/>空間の点</span></div></div>
        <div className="controls">
          <div><label>表示する和</label>{([['normal','通常表示'],['7','和が7'],['14','和が14'],['both','両方']] as const).map(([v,l])=><button className={sumMode===v?'on':''} onClick={()=>setSumMode(v)} key={v}>{l}</button>)}</div>
          <div><label>見せ方</label><button className={!showAll?'on':''} onClick={()=>setShowAll(false)}>1つずつ表示</button><button className={showAll?'on':''} onClick={()=>setShowAll(true)}>全部表示</button></div>
          <div><label>さいころ</label><button className={ordered?'on':''} onClick={()=>setOrdered(true)}>順序つき</button><button className={!ordered?'on':''} onClick={()=>setOrdered(false)}>区別しない代表</button></div>
          <div><label>視点</label>{([['front','正面'],['top','上から'],['angle','斜め']] as const).map(([v,l])=><button className={view===v?'on':''} onClick={()=>setView(v)} key={v}>{l}</button>)}<button onClick={reset}>リセット</button></div>
        </div>
      </div>
      <aside>
        <div className="eyebrow">STEP {step+1}</div><h2>{steps[step]}</h2><div className="description">{descriptions[step]}</div>
        {(step===4||step===5||sumMode==='7'||sumMode==='14') && <section className={`case-card sum-${focusedSum}`}><div className="case-head"><span>和が{focusedSum}</span><b>{showAll?'4つすべて':`${item+1} / 4`}</b></div><ul>{combinations.map((t,i)=><li className={showAll||i===item?'found':''} key={formatTriple(t)}><button onClick={()=>{setItem(i);setShowAll(false)}}><span>{formatTriple(t)}</span><small>{t.join(' + ')} = {focusedSum}</small></button></li>)}</ul><p>和が{focusedSum}になる場合は <strong>4通り</strong></p>{!showAll&&<div className="case-nav"><button onClick={()=>setItem((item+3)%4)}>← 前へ</button><button onClick={()=>setItem((item+1)%4)}>次へ →</button></div>}</section>}
        {step===3&&<div className="range"><span>3</span><i/><strong>7</strong><i/><strong>14</strong><i/><span>18</span></div>}
        {step===6&&<div className="equation"><small>和の法則</small><strong><span>4</span> + <em>4</em> = 8</strong></div>}
        {step===7&&<div className="answer"><small>ANSWER</small><strong>答え <b>8</b> 通り</strong><p>和が7：4通り ＋ 和が14：4通り</p></div>}
        <div className="tip">☝ 3D画面をドラッグして回転・ピンチして拡大できます</div>
        <div className="step-nav"><button disabled={step===0} onClick={()=>setStep(step-1)}>← 戻る</button><button disabled={step===7} onClick={()=>setStep(step+1)}>次へ →</button></div>
      </aside>
    </section>
  </main>
}
