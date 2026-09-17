import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronRight, Lightbulb, RotateCcw, Sparkles } from 'lucide-react'
import { countDivisors, divideByPrime, formatPrimeFactorization, generateDivisors, isPrime, primeFactorization, sumDivisors, type PrimeFactor } from './divisorMath'

const MAX_NUMBER = 100000
const labels = ['問題', '素因数分解', '指数を見る', '約数はどう作られる？', '約数の個数', '約数の総和', '約数を実際に確認', 'まとめ']
const superscript = (n: number) => String(n).replace(/0/g, '⁰').replace(/1/g, '¹').replace(/2/g, '²').replace(/3/g, '³').replace(/4/g, '⁴').replace(/5/g, '⁵').replace(/6/g, '⁶').replace(/7/g, '⁷').replace(/8/g, '⁸').replace(/9/g, '⁹')
const powerLabel = (prime: number, power: number) => power === 0 ? '1' : power === 1 ? `${prime}` : `${prime}${superscript(power)}`

function Formula({ n, factors }: { n: number; factors: PrimeFactor[] }) {
  return <div className="factor-formula">{n} = {factors.map(({ prime, exponent }, index) => <span key={prime}>{index > 0 && ' × '}{prime}<sup>{exponent > 1 ? exponent : ''}</sup></span>)}</div>
}

export default function App() {
  const [step, setStep] = useState(0)
  const [target, setTarget] = useState(360)
  const [current, setCurrent] = useState(360)
  const [chain, setChain] = useState<{ from: number; prime: number; result: number }[]>([])
  const [primeInput, setPrimeInput] = useState('')
  const [message, setMessage] = useState('小さい素数から試してみよう。')
  const [customOpen, setCustomOpen] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [countReveal, setCountReveal] = useState(0)
  const [sumReveal, setSumReveal] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const [reflection, setReflection] = useState('')
  const [exponentAnswers, setExponentAnswers] = useState<string[]>([])
  const [exponentProgress, setExponentProgress] = useState(0)

  const factors = useMemo(() => primeFactorization(target), [target])
  const complete = current === 1
  const divisors = useMemo(() => generateDivisors(factors), [factors])
  const choices = selected.length === factors.length ? selected : factors.map(() => 0)
  const selectedDivisor = factors.reduce((value, factor, index) => value * factor.prime ** choices[index], 1)
  const usedPrimes = chain.map(item => item.prime)

  const reset = (n = target) => {
    setTarget(n); setCurrent(n); setChain([]); setPrimeInput(''); setMessage('小さい素数から試してみよう。')
    setSelected(primeFactorization(n).map(() => 0)); setStep(0); setCountReveal(0); setSumReveal(0); setExpanded(false); setModelOpen(false); setCustomOpen(false); setExponentAnswers([]); setExponentProgress(0)
  }
  const tryDivide = () => {
    const prime = Number(primeInput)
    if (!Number.isInteger(prime) || !isPrime(prime)) { setMessage(`${primeInput || '入力値'}は素数ではありません。素数を入力してください。`); return }
    const result = divideByPrime(current, prime)
    if (result === null) { setMessage(`${prime}は素数ですが、${current}は${prime}では割り切れません。${current}を割り切れる小さい素数を探そう。`); return }
    setChain(items => [...items, { from: current, prime, result }]); setCurrent(result); setPrimeInput('')
    setMessage(result === 1 ? '素因数分解が完成しました！ 同じ素数を指数でまとめよう。' : `${prime}で1回割ると${result}。次の素数を考えよう。`)
  }
  const startCustom = () => {
    const n = Number(customInput)
    if (!Number.isInteger(n) || n < 2 || n > MAX_NUMBER) { setMessage(`2〜${MAX_NUMBER.toLocaleString()}の整数を入力してください。`); return }
    reset(n); setStep(1)
  }
  const go = (next: number) => {
    if (next > 1 && !complete) { setStep(1); setMessage('まず、商が1になるまで素因数で割ろう。'); return }
    if (next > 1 && exponentProgress < factors.length) { setStep(1); setMessage('左側の素数の個数を数えて、指数を確認しよう。'); return }
    setStep(next)
  }
  const selectPower = (factorIndex: number, power: number) => {
    const next = [...choices]; next[factorIndex] = power; setSelected(next)
  }
  const sums = factors.map(({ prime, exponent }) => Array.from({ length: exponent + 1 }, (_, power) => prime ** power).reduce((a, b) => a + b, 0))
  const checkExponent = () => {
    const factor = factors[exponentProgress]
    if (Number(exponentAnswers[exponentProgress]) !== factor.exponent) {
      setMessage(`左側に並んだ ${factor.prime} を、もう一度数えてみよう。`)
      return
    }
    const next = exponentProgress + 1
    setExponentProgress(next)
    setMessage(next === factors.length ? 'すべて正解！ 同じ素数を指数でまとめよう。' : '正解！ 次の素数も数えてみよう。')
  }

  return <div className="lesson">
    <header>
      <a href="../../" className="back"><ArrowLeft /> 教材一覧</a>
      <div><span className="eyebrow">数学A ／ 場合の数</span><h1>約数の個数と総和 <small>― 素因数分解から考える</small></h1></div>
      <button className="ghost" onClick={() => reset()}><RotateCcw /> リセット</button>
    </header>

    <nav className="stepper" aria-label="学習ステップ">{labels.map((label, index) => <button key={label} className={step === index ? 'active' : ''} onClick={() => go(index)}><b>STEP {index + 1}</b><span>{label}</span></button>)}</nav>
    <main>
      <div className="progress"><span style={{ width: `${(step + 1) / 8 * 100}%` }} /></div>
      {step === 0 && <section className="hero-panel panel">
        <span className="section-tag">STEP 1 · 問題</span><p className="kicker">今日の問い</p>
        <h2><strong>{target}</strong>の正の約数は全部で何個あるか。<br />また、その約数の総和を求めよ。</h2>
        <div className="question">約数を全部書き出さずに求める方法はないだろうか？</div>
        <textarea value={reflection} onChange={e => setReflection(e.target.value)} placeholder="予想や気づきを書いてみよう" aria-label="予想や気づき" />
        <button className="primary" onClick={() => setStep(1)}>考えてみる <ChevronRight /></button>
      </section>}

      {step === 1 && <section className="panel factor-step">
        <span className="section-tag">STEP 2 · 素因数分解</span><h2>素数で、1回ずつ割ってみよう</h2>
        <p className="lead">素因数分解は「どの素数で割れるか」を見つけるところから。</p>
        <div className="factor-workspace">
          <div className="division-chain" aria-live="polite">
            {chain.length === 0 && <div className="short-start">{target}</div>}
            {chain.map((item, index) => <div className="short-row" key={index}>
              <span className={index === chain.length - 1 ? 'short-prime latest-prime' : 'short-prime'}>{item.prime}</span>
              <span className="short-bracket">)</span>
              <span className="short-dividend">{item.from}</span>
            </div>)}
            {chain.length > 0 && <div className="short-result"><span className="number latest">{current}</span></div>}
          </div>
          <div className="input-card"><label htmlFor="prime">どの素数で割りますか？</label><div><input id="prime" inputMode="numeric" value={primeInput} onChange={e => setPrimeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && tryDivide()} disabled={complete} placeholder="例：2" /><button className="primary" onClick={tryDivide} disabled={complete}>割る</button></div><p className="feedback">{message}</p><div className="quick">試してみる：{[2, 3, 5, 7].map(p => <button onClick={() => setPrimeInput(String(p))} key={p}>{p}</button>)}</div></div>
        </div>
        {complete && <div className="completion"><Sparkles /><h3>短除法が完成！ 左側の素数を数えよう</h3>
          {exponentProgress < factors.length ? <div className="exponent-check"><label htmlFor="exponent-answer">左側に <strong>{factors[exponentProgress].prime}</strong> はいくつありますか？</label><div><input id="exponent-answer" inputMode="numeric" value={exponentAnswers[exponentProgress] ?? ''} onChange={e => { const next = [...exponentAnswers]; next[exponentProgress] = e.target.value; setExponentAnswers(next) }} onKeyDown={e => e.key === 'Enter' && checkExponent()} /><button className="primary" onClick={checkExponent}>確認する</button></div></div> : <><div className="prime-reorder"><span>{usedPrimes.join('　')}</span><b>↓ 横に並べる</b><strong>{usedPrimes.join(' × ')}</strong></div><Formula n={target} factors={factors} /><button className="primary" onClick={() => setStep(2)}>指数でまとめる <ChevronRight /></button></>}
          <p className="feedback">{message}</p></div>}
      </section>}

      {step === 2 && <section className="panel"><span className="section-tag">STEP 3 · 指数で表す</span><h2>同じ素数をグループにしよう</h2><div className="raw-formula">{target} = {usedPrimes.join(' × ')}</div><div className="group-row">{factors.map(({ prime, exponent }) => <div className="group" key={prime}><span>{Array(exponent).fill(prime).join(' × ')}</span><b>→</b><strong>{prime}<sup>{exponent}</sup></strong><small>{prime}は何回？　{exponent}回</small></div>)}</div><Formula n={target} factors={factors} /><button className="primary centered" onClick={() => setStep(3)}>約数の作り方へ <ChevronRight /></button></section>}

      {step === 3 && <section className="panel"><span className="section-tag">STEP 4 · 約数はどう作られる？</span><h2>指数を1つずつ選ぶと、約数が1つ決まる</h2><Formula n={target} factors={factors} /><div className="choice-machine"><div className="choice-panels">{factors.map((factor, fi) => <div className="choice" key={factor.prime}><h3>{factor.prime} の指数</h3><div>{Array.from({ length: factor.exponent + 1 }, (_, power) => <button className={choices[fi] === power ? 'selected' : ''} onClick={() => selectPower(fi, power)} key={power}>{power}</button>)}</div><p>{factor.exponent + 1}通り</p></div>)}</div><div className="flow-lines" aria-hidden="true"><span>＼</span><span>─→</span><span>／</span></div><div className="divisor-result"><p>{factors.map((f, i) => `${f.prime}${superscript(choices[i])}`).join(' × ')}</p><strong>= {selectedDivisor}</strong><span>{selectedDivisor} は {target} の約数</span></div></div><button className="primary centered" onClick={() => setStep(4)}>選び方を数える <ChevronRight /></button></section>}

      {step === 4 && <section className="panel"><span className="section-tag">STEP 5 · 約数の個数</span><h2>指数の選び方は全部で何通り？</h2><div className="reveal-questions">{factors.map(({ prime, exponent }) => <div key={prime}><span>{prime}の指数は 0〜{exponent}</span><strong>{exponent + 1}通り</strong></div>)}</div><textarea placeholder="なぜ掛け算になると思いますか？" aria-label="個数についての考え" />{countReveal === 0 && <button className="secondary centered" onClick={() => setCountReveal(1)}><Lightbulb /> ヒント</button>}{countReveal >= 1 && <p className="hint">それぞれの選び方から1つずつ選ぶ組合せを考えよう。</p>}{countReveal === 1 && <button className="secondary centered" onClick={() => setCountReveal(2)}>式を見る</button>}{countReveal >= 2 && <div className="count-equation">{factors.map(f => f.exponent + 1).join(' × ')}</div>}{countReveal === 2 && <button className="primary centered" onClick={() => setCountReveal(3)}>答えを見る</button>}{countReveal >= 3 && <div className="gold-answer">{factors.map(f => f.exponent + 1).join(' × ')} = {countDivisors(factors)}<small>{target}の正の約数は {countDivisors(factors)} 個</small></div>}
        <div className="cube-grid">{divisors.map((divisor, index) => <span key={divisor} title={`指数の組 #${index + 1} → ${divisor}`}>{divisor}</span>)}</div><p className="caption">1枚のカードが指数の組1つ、つまり約数1つに対応します。</p>{countReveal >= 3 && <button className="primary centered" onClick={() => setStep(5)}>総和を考える <ChevronRight /></button>}</section>}

      {step === 5 && <section className="panel"><span className="section-tag">STEP 6 · 約数の総和</span><h2>{countDivisors(factors)}個の約数を、全部足すには？</h2><div className="sum-groups">{factors.map(({ prime, exponent }, index) => <div key={prime}>{index > 0 && <b className="times">×</b>}<div className="term-cards">{Array.from({ length: exponent + 1 }, (_, power) => <span key={power}>{powerLabel(prime, power)}</span>)}</div></div>)}</div><textarea placeholder="約数の総和を求める式を書こう" aria-label="総和を求める式" />
        {sumReveal === 0 && <button className="secondary centered" onClick={() => setSumReveal(1)}><Lightbulb /> ヒント</button>}{sumReveal >= 1 && <p className="hint">各素因数から選べる累乗を「足した式」にして、掛け合わせよう。</p>}{sumReveal === 1 && <button className="secondary centered" onClick={() => setSumReveal(2)}>式を見る</button>}{sumReveal >= 2 && <div className="sum-formula">{factors.map(({ prime, exponent }) => `(${Array.from({ length: exponent + 1 }, (_, power) => powerLabel(prime, power)).join(' + ')})`).join(' ')}</div>}{sumReveal === 2 && <button className="primary centered" onClick={() => setSumReveal(3)}>答えを見る</button>}{sumReveal >= 3 && <><div className="sum-details">{factors.map(({ prime, exponent }, i) => <div key={prime}><span>{Array.from({ length: exponent + 1 }, (_, power) => powerLabel(prime, power)).join(' + ')}</span><span>= {Array.from({ length: exponent + 1 }, (_, power) => prime ** power).join(' + ')}</span><strong>= {sums[i]}</strong></div>)}</div><div className="gold-answer">{sums.join(' × ')} = {sumDivisors(factors)}<small>{target}の正の約数の総和は {sumDivisors(factors)}</small></div></>}<button className="secondary centered" onClick={() => setExpanded(v => !v)}>{expanded ? '展開を閉じる' : '展開を見る'}</button>{expanded && <div className="divisor-cards">{divisors.map(d => <span key={d}>{d}</span>)}</div>}</section>}

      {step === 6 && <section className="panel"><span className="section-tag">STEP 7 · 約数を実際に確認</span><h2>{target}の約数を、小さい順に確認しよう</h2><div className="divisor-cards large">{divisors.map(d => <span key={d}>{d}</span>)}</div><div className="check-stats"><p><strong>{divisors.length}</strong>個</p><p>総和 <strong>{divisors.reduce((a, b) => a + b, 0)}</strong></p></div><p className="caption">各カードは、各素因数の累乗を1つずつ選んだ積です。</p><button className="primary centered" onClick={() => setStep(7)}>まとめへ <ChevronRight /></button></section>}

      {step === 7 && <section className="panel summary"><span className="section-tag">STEP 8 · まとめ</span><h2>指数の「選び方」が鍵だった</h2><Formula n={target} factors={factors} /><div className="summary-grid"><article><span>約数の個数</span><p>{factors.map(f => `(${f.exponent}+1)`).join('')}</p><strong>{countDivisors(factors)}個</strong></article><article><span>約数の総和</span><p>{factors.map(({ prime, exponent }) => `(1+${prime}+…+${powerLabel(prime, exponent)})`).join('')}</p><strong>{sumDivisors(factors)}</strong></article></div><button className="secondary centered" onClick={() => setModelOpen(v => !v)}>考え方を確認</button>{modelOpen && <div className="model-answer"><p>各素因数の指数を、それぞれ0から最大の指数まで1つずつ選ぶので、積の法則で選択肢の数を掛けます。</p><p>各素因数について選べる累乗を足した式を掛け合わせると、分配法則によってすべての約数が1回ずつ現れます。</p></div>}<button className="primary centered" onClick={() => setCustomOpen(true)}>別の数で挑戦</button></section>}
    </main>

    <div className="modebar"><button onClick={() => setStep(0)}>問題</button><button onClick={() => go(1)}>素因数分解</button><button onClick={() => go(2)}>指数を見る</button><button onClick={() => go(4)}>約数の個数</button><button onClick={() => go(5)}>約数の総和</button><button onClick={() => go(6)}>{countDivisors(factors)}個の約数を見る</button><button onClick={() => setCustomOpen(true)}>別の数で挑戦</button><button onClick={() => reset()}><RotateCcw /> リセット</button></div>
    {customOpen && <div className="modal" role="dialog" aria-modal="true" aria-labelledby="custom-title"><div><button className="close" onClick={() => setCustomOpen(false)}>×</button><span className="section-tag">CHALLENGE</span><h2 id="custom-title">別の数で挑戦</h2><p>2〜100,000の自然数を入力してください。</p><input autoFocus type="number" min="2" max={MAX_NUMBER} value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="例：72" /><p className="feedback">{message}</p><button className="primary" onClick={startCustom}>この数で始める</button></div></div>}
  </div>
}
