import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, EyeOff, FlaskConical, Grid3X3, Pause, Play, RotateCcw, X } from 'lucide-react'
import { COLORS, Color, Coloring, Region, generatePatterns, hasViolation } from './math'

const names: Record<Color, string> = { red: '赤', blue: '青', yellow: '黄', white: '白' }
const paths: Record<Region, string> = {
  A: 'M12 12 H116 L145 105 H12 Z', B: 'M12 105 H145 L116 198 H12 Z',
  C: 'M116 12 L255 55 V155 L116 198 L145 105 Z', D: 'M255 55 L348 30 V180 L255 155 Z'
}
const centers: Record<Region, [number, number]> = { A:[72,65], B:[72,151], C:[193,105], D:[303,105] }

function MapSvg({ colors = {}, small=false, active, onRegion, violation }: { colors?:Partial<Coloring>, small?:boolean, active?:Region, onRegion?:(r:Region)=>void, violation?:[Region,Region] }) {
  return <svg className={`map ${small?'small':''}`} viewBox="0 0 360 210" role="img" aria-label="A、B、C、Dの4領域">
    {(Object.keys(paths) as Region[]).map(r => <g key={r} onClick={()=>onRegion?.(r)} className={`${onRegion?'clickable':''} ${active===r?'active':''}`}>
      <path d={paths[r]} className={`region color-${colors[r]??'empty'}`} />
      <text x={centers[r][0]} y={centers[r][1]}>{r}</text>
    </g>)}
    {violation && <path className="violation" d={violation.sort().join('')==='AB'?'M12 105 H145':violation.includes('D')?'M255 55 V155':violation.includes('B')?'M116 198 L145 105':'M116 12 L145 105'} />}
  </svg>
}

export default function App() {
  const [problem,setProblem]=useState<1|2>(1), patterns=useMemo(()=>generatePatterns(problem),[problem])
  const [answers,setAnswers]=useState(false), [showAll,setShowAll]=useState(false), [index,setIndex]=useState(0), [playing,setPlaying]=useState(false)
  const [guess,setGuess]=useState(''), [feedback,setFeedback]=useState(''), [detail,setDetail]=useState<number|null>(null)
  const [experiment,setExperiment]=useState(false), [paint,setPaint]=useState<Partial<Coloring>>({}), [message,setMessage]=useState('領域をクリックして色を選ぼう。')
  const [explain,setExplain]=useState(false), [step,setStep]=useState(0)
  const answer=patterns.length
  useEffect(()=>{setShowAll(false);setIndex(0);setPlaying(false);setGuess('');setFeedback('');setPaint({});setExplain(false)},[problem])
  useEffect(()=>{if(!playing)return;const id=setInterval(()=>setIndex(i=>(i+1)%patterns.length),550);return()=>clearInterval(id)},[playing,patterns.length])
  const choose=(r:Region)=>{const old=paint[r], next=old?COLORS[(COLORS.indexOf(old)+1)%5]:COLORS[0]; const updated={...paint}; if(next)updated[r]=next;else delete updated[r];setPaint(updated);const bad=hasViolation(updated);setMessage(bad?`${bad[0]}と${bad[1]}は隣り合っているので同じ色にはできません`:'条件に合っています。次の領域も塗ってみよう！')}
  const activeOrder:Region[]=problem===1?['A','B','C','D']:['C','A','B','D']
  return <div className="app-shell">
    <header><div className="brand">MATH <b>A</b></div><div><p>INTERACTIVE COUNTING LAB</p><h1>数学A <span>塗り分けと場合の数</span></h1></div><button className="answer-toggle" onClick={()=>setAnswers(v=>!v)}>{answers?<EyeOff/>:<Eye/>} 答えを{answers?'隠す':'表示'}</button></header>
    <main>
      <nav className="tabs"><button className={problem===1?'selected':''} onClick={()=>setProblem(1)}><i>01</i><span>問題1<small>すべて異なる色</small></span></button><button className={problem===2?'selected':''} onClick={()=>setProblem(2)}><i>02</i><span>問題2<small>隣り合う部分は異なる色</small></span></button></nav>
      <section className="hero panel">
        <div className="diagram"><div className="eyebrow"><span/> COLORING MAP</div><MapSvg colors={experiment?paint:patterns[index]} onRegion={experiment?choose:undefined} violation={experiment?hasViolation(paint):undefined}/><div className="legend">{COLORS.map(c=><span key={c}><i className={`color-${c}`}/>{names[c]}</span>)}</div></div>
        <div className="prompt">
          <p className="number">QUESTION {problem}</p><h2>{problem===1?'4つの領域を、すべて異なる色で塗る。':'同じ色は何度でも使えます。'}</h2><p>{problem===1?'赤・青・黄・白を1回ずつ使うと、塗り方は全部で何通り？':'ただし、隣り合う領域は必ず異なる色にします。塗り方は全部で何通り？'}</p>
          <div className="condition"><b>条件</b>{problem===1?'A・B・C・D はすべて異なる色':'A≠B　A≠C　B≠C　C≠D'}</div>
          <label>予想してみよう <span><input inputMode="numeric" value={guess} onChange={e=>setGuess(e.target.value)} placeholder="?"/> 通り <button onClick={()=>setFeedback(Number(guess)===answer?'正解！':'もう一度、図を見て考えてみよう')}>確認</button></span></label>
          {feedback&&<p className={feedback==='正解！'?'correct':'retry'}>{feedback}</p>}
          {answers?<div className="answer"><small>全探索の結果</small><strong>{answer}</strong> 通り</div>:<div className="hidden-answer"><EyeOff/> 答えは隠れています</div>}
        </div>
      </section>
      <div className="action-row"><button className="primary" onClick={()=>setShowAll(true)}><Grid3X3/>すべてのパターンを見る</button><button onClick={()=>{setShowAll(true);setPlaying(true)}}><Play/>順番に見る</button><button className={experiment?'active-button':''} onClick={()=>setExperiment(v=>!v)}><FlaskConical/>自分で塗ってみる</button></div>
      {experiment&&<section className="experiment panel"><b>塗り分け実験</b><span>{message}</span><button onClick={()=>{setPaint({});setMessage('領域をクリックして色を選ぼう。')}}><RotateCcw/>リセット</button></section>}
      {showAll&&<section className="results">
        <div className="result-head"><div><p>PROGRAMMATIC ENUMERATION</p><h2>条件を満たす塗り分け</h2></div><div className={answers?'total':'total concealed'}>{answers?<><strong>{answer}</strong> 通り</>:'?? 通り'}</div></div>
        <div className="player panel"><MapSvg colors={patterns[index]}/><div><span>SEQUENCE VIEW</span><strong>No. {index+1}</strong><p>{(['A','B','C','D'] as Region[]).map(r=>`${r}＝${names[patterns[index][r]]}`).join('　')}</p><div className="player-buttons"><button onClick={()=>setIndex(0)}><RotateCcw/>最初</button><button onClick={()=>setIndex(i=>(i-1+answer)%answer)}><ChevronLeft/>前へ</button><button className="play" onClick={()=>setPlaying(v=>!v)}>{playing?<Pause/>:<Play/>}{playing?'一時停止':'再生'}</button><button onClick={()=>setIndex(i=>(i+1)%answer)}>次へ<ChevronRight/></button></div><em>{index+1} / {answer}</em></div></div>
        <div className="grid">{patterns.map((p,i)=><button key={JSON.stringify(p)} onClick={()=>{setIndex(i);setDetail(i)}} className={index===i?'current':''}><b>No. {i+1}</b><MapSvg colors={p} small/></button>)}</div>
        <button className="why" onClick={()=>setExplain(v=>!v)}>なぜこの数になる？ <span>{explain?'−':'＋'}</span></button>
        {explain&&<div className="explanation panel"><div className="explain-map"><MapSvg active={activeOrder[step]}/><p>光っている領域に注目</p></div><div className="steps">{(problem===1?[['A','4通り','最初の色を選ぶ'],['B','3通り','残りの色から選ぶ'],['C','2通り','残りの色から選ぶ'],['D','1通り','最後の1色']]:[['C','4通り','まず中心の色を決める'],['A','3通り','Cと違う色'],['B','2通り','AとCの両方と違う色'],['D','3通り','Cとだけ隣り合う']]).map((s,i)=><button key={s[0]} className={step===i?'on':''} onClick={()=>setStep(i)}><i>{i+1}</i><b>{s[0]} → {s[1]}</b><span>{s[2]}</span></button>)}<div className={`formula ${answers?'':'masked'}`}>{answers?(problem===1?<><b>4 × 3 × 2 × 1</b><span>＝ 4! ＝ 24通り</span></>:<><b>4 × 3 × 2 × 3</b><span>＝ 72通り</span></>):'答えを表示すると計算式が見えます'}</div></div></div>}
        <div className="conclusion"><span>列挙して数える方法</span><b>{answers?`${answer}個`:'??個'}</b><i>＝</i><span>数学的に数える方法</span><b>{answers?(problem===1?'4×3×2×1':'4×3×2×3'):'計算式'}</b></div>
      </section>}
    </main>
    {detail!==null&&<div className="modal" onClick={()=>setDetail(null)}><div className="modal-card" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setDetail(null)}><X/></button><small>PATTERN</small><h2>No. {detail+1}</h2><MapSvg colors={patterns[detail]}/><p>{(['A','B','C','D'] as Region[]).map(r=><span key={r}>{r}＝<b>{names[patterns[detail][r]]}</b></span>)}</p></div></div>}
  </div>
}
