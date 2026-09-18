import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, FlipVertical2, Fullscreen, Lightbulb, LockKeyhole, Pause, Play, RotateCcw, RotateCw, Sparkles } from 'lucide-react'
import { rotations, sameCircular, sameNecklace } from './permutation'

const colors=['#ff5d72','#27d9ff','#ffd15c','#a778ff','#54e59a','#ff8c42','#ee65d5','#6e8cff']
const lessons=[
 ['まずは、ふつうの順列','5個を横一列に並べる方法は何通り？'],
 ['円にすると？','円形に並べても、本当に120通り全部違う？'],
 ['72° 回してみよう','位置は変わった。でも隣り合う関係は？'],
 ['同じものを発見','この5つは違う並びでしょうか？'],
 ['重複をまとめる','同じ円形配置を何回ずつ数えていた？'],
 ['重複を防ぐには？','1個を動かさないで固定してみよう。'],
 ['1個を固定','残りの4個だけを並べればよい！'],
 ['円順列を一般化','具体例から n 個の場合をつくろう。'],
 ['では、首飾りなら？','机から持ち上げて、裏返してみよう。'],
 ['裏返すと…','時計回りの順序が逆向きに見える。'],
 ['2つを1組にする','裏返して一致する円順列をペアにしよう。'],
 ['じゅず順列を一般化','最後に自分の言葉で公式を説明しよう。'],
]

function Fraction({top,bottom}:{top:string,bottom:string}){return <span className="frac"><span>{top}</span><span>{bottom}</span></span>}

function Ring({items, angle=0, small=false, fixed=false, flipped=false, mode3d=false, interactive=false, onSwap}:{items:number[],angle?:number,small?:boolean,fixed?:boolean,flipped?:boolean,mode3d?:boolean,interactive?:boolean,onSwap?:(a:number,b:number)=>void}){
 const drag=useRef<number|null>(null)
 return <div className={`ring ${small?'small':''} ${fixed?'has-fixed':''} ${flipped?'flipped':''} ${mode3d?'three':''}`} style={{transform:`rotateZ(${angle}deg) ${mode3d?'rotateX(58deg)':''}`}}>
  <div className="orbit"/>{items.map((n,i)=>{const a=i*360/items.length;return <button draggable={interactive} onDragStart={()=>drag.current=i} onDragOver={e=>e.preventDefault()} onDrop={()=>{if(drag.current!==null&&onSwap)onSwap(drag.current,i)}} aria-label={`宝石${n}`} className={`gem gem-${n} ${fixed&&n===1?'locked':''}`} style={{'--a':`${a}deg`,'--c':colors[n-1]} as React.CSSProperties} key={`${n}-${i}`}><span>{n}</span>{fixed&&n===1&&<LockKeyhole/>}</button>})}
 </div>
}

function RotationCards({merged}:{merged:boolean}){return <div className={`rotation-cards ${merged?'merged':''}`}>{rotations([1,2,3,4,5]).map((r,i)=><article key={i}><b>{i*72}°</b><Ring items={r} small/></article>)}</div>}

export default function App(){
 const [step,setStep]=useState(0), [circle,setCircle]=useState(false), [angle,setAngle]=useState(0), [mode3d,set3d]=useState(false), [flipped,setFlipped]=useState(false), [fixed,setFixed]=useState(false), [merged,setMerged]=useState(false), [teacher,setTeacher]=useState(false), [free,setFree]=useState(false), [count,setCount]=useState(5), [items,setItems]=useState([1,2,3,4,5]), [playing,setPlaying]=useState(false), [quiz,setQuiz]=useState(''), [view,setView]=useState({x:0,y:0,z:1}), [general,setGeneral]=useState(false)
 const drag=useRef<{x:number,y:number}|null>(null)
 useEffect(()=>{if(!playing)return;const id=setInterval(()=>setStep(s=>s>=lessons.length-1?(setPlaying(false),s):s+1),2600);return()=>clearInterval(id)},[playing])
 useEffect(()=>setGeneral(step>=7),[step])
 const rotate=(d:number)=>{setCircle(true);setAngle(a=>a+d*360/items.length)}
 const setN=(n:number)=>{setCount(n);setItems(Array.from({length:n},(_,i)=>i+1));setAngle(0)}
 const swap=(a:number,b:number)=>setItems(v=>{const x=[...v];[x[a],x[b]]=[x[b],x[a]];return x})
 const comparison=useMemo(()=>sameCircular([1,2,3,4,5],[2,3,4,5,1]),[])
 return <div className={`app ${teacher?'teacher':''}`}>
  <header><a href="../../"><ArrowLeft/> 教材一覧</a><div className="eyebrow"><Sparkles/> MATHEMATICS A · DISCOVERY LAB</div><div className="top-actions"><button onClick={()=>setTeacher(v=>!v)}><Fullscreen/>授業モード</button></div></header>
  <main>
   <section className="intro"><div><span className="badge">数学A｜場合の数・順列</span><h1>回したら<span>同じ？</span><br/>裏返しても<span>同じ？</span></h1><p>円順列・じゅず順列を見抜こう</p></div><div className="legend"><i className="gold"/>固定・注目 <i className="blue"/>回転 <i className="red"/>一致 <i className="purple"/>裏返し</div></section>
   <nav className="progress" aria-label="探究ステップ">{lessons.map((_,i)=><button aria-label={`ステップ${i+1}`} className={i===step?'active':i<step?'done':''} onClick={()=>setStep(i)} key={i}>{i+1}</button>)}</nav>
   <section className="question"><small>DISCOVERY {String(step+1).padStart(2,'0')} / {lessons.length}</small><h2>{lessons[step][0]}</h2><p>{lessons[step][1]}</p></section>
   <section className="lab">
    <div className="stage" onPointerDown={e=>drag.current={x:e.clientX-view.x,y:e.clientY-view.y}} onPointerMove={e=>{if(drag.current&&mode3d)setView(v=>({...v,x:e.clientX-drag.current!.x,y:e.clientY-drag.current!.y}))}} onPointerUp={()=>drag.current=null} onPointerLeave={()=>drag.current=null} onWheel={e=>mode3d&&setView(v=>({...v,z:Math.max(.65,Math.min(1.5,v.z-e.deltaY*.001))}))} onDoubleClick={()=>setView({x:0,y:0,z:1})}>
      <div className={`scene ${circle?'circle':''} ${mode3d?'mode3d':''}`} style={{transform:`translate(${view.x/8}px,${view.y/8}px) scale(${view.z})`}}>
       {!circle?<div className="line-gems">{items.map(n=><div className="loose-gem" style={{'--c':colors[n-1]} as React.CSSProperties} key={n}>{n}</div>)}</div>:<Ring items={items} angle={angle} fixed={fixed} flipped={flipped} mode3d={mode3d}/>} 
       {circle&&<button className="center-action" onClick={()=>rotate(1)}>回して<br/><b>{Math.round(360/items.length)}°</b></button>}
      </div>
      <div className="stage-label">{mode3d?'3D SPACE — ドラッグ・ホイール・ダブルクリック':'TOP VIEW — 2D'}</div>
    </div>
    <aside className="panel">
      <div className="seg"><button className={!mode3d?'on':''} onClick={()=>set3d(false)}>2D</button><button className={mode3d?'on':''} onClick={()=>{set3d(true);setCircle(true)}}>3D</button></div>
      <h3>操作して確かめる</h3><p>宝石の順序に注目しながら、円全体を動かしてみよう。</p>
      {!circle&&<button className="primary" onClick={()=>{setCircle(true);setStep(1)}}>円形にする <Sparkles/></button>}
      {circle&&<><div className="button-row"><button onClick={()=>rotate(-1)}><RotateCcw/>左回転</button><button onClick={()=>rotate(1)}><RotateCw/>右回転</button></div><button className={`flip ${flipped?'active':''}`} onClick={()=>{set3d(true);setFlipped(v=>!v);setStep(s=>Math.max(s,9))}}><FlipVertical2/>首飾りを裏返す</button><button className="fix" onClick={()=>{setFixed(true);setStep(s=>Math.max(s,6))}}><Lightbulb/>ヒント：1を固定</button><button onClick={()=>setView({x:0,y:0,z:1})}>表示リセット</button></>}
      <div className="angle"><span>現在の回転</span><b>{((angle%360)+360)%360}°</b></div>
    </aside>
   </section>

   <section className="compare"><div className="section-title"><small>ROTATION FAMILY</small><h2>この5つは違う並び？</h2><p>開始位置が違って見える5枚を見比べよう。</p></div><RotationCards merged={merged}/><div className="choice"><button onClick={()=>setQuiz('もう一度、隣り合う宝石を見てみよう。')}>違うと思う</button><button className="primary" onClick={()=>{setMerged(true);setQuiz('5つに見えたけれど、回転すると全部同じ並びだった！');setStep(4)}}>同じだと思う</button></div>{quiz&&<div className="match">{merged&&'MATCH!　'}{quiz}</div>}</section>

   <section className="proof-grid"><article><span>01 / 円順列</span><h2>回転の重複をまとめる</h2><div className="flow"><b>5! = 120</b><i>↓</i><em>同じものを5個ずつ</em><i>↓</i><strong><Fraction top="5!" bottom="5"/> = 4! = <mark>24</mark></strong></div><p>1を上に固定すれば、動かすのは残り4個。だから 4! 通り。</p></article><article><span>02 / じゅず順列</span><h2>裏返しもペアにする</h2><div className="flow purple-flow"><b>円順列 24通り</b><i>↓</i><em>裏返して一致する2個ずつ</em><i>↓</i><strong><Fraction top="4!" bottom="2"/> = <mark>12</mark></strong></div><p>表と裏で進む向きは逆。でも手に取れる首飾りなら同じもの。</p></article></section>

   <section className="mirror"><div><small>FRONT / BACK</small><h2>向きが逆になる瞬間を見る</h2><p><b>時計回り</b> 1 → 2 → 3 → 4 → 5</p><p className="purple-text"><b>反時計回り</b> 1 → 5 → 4 → 3 → 2</p><div className="verdict">{sameNecklace([1,2,3,4,5],[1,5,4,3,2])?'同じ首飾り！':''}</div></div><div className="twin"><div><label>裏返す前 ↻</label><Ring items={[1,2,3,4,5]} small/></div><div className="connector">1↔1<br/>2↔2<br/>3↔3<br/>4↔4<br/>5↔5</div><div><label>裏返した後 ↺</label><Ring items={[1,5,4,3,2]} small flipped/></div></div></section>

   <section className="quiz"><small>CHECK YOUR IDEA</small><h2>AとBは同じ円順列？</h2><div className="quiz-rings"><div><label>A</label><Ring items={[1,2,3,4,5]} small/></div><div><label>B</label><Ring items={[2,3,4,5,1]} small/></div></div><div className="choice"><button onClick={()=>setQuiz('不正解。Aを72°回して重ねてみよう。')}>違う</button><button className="primary" onClick={()=>setQuiz(comparison?'正解！ Aを72°回すとBに完全一致します。':'')}>同じ</button></div></section>

   <section className="free"><div className="section-title"><small>FREE LAB</small><h2>自由に試す</h2><p>宝石をドラッグして交換。個数を変えて同値グループを観察しよう。</p></div><div className="free-layout"><div><div className="count-select">{[3,4,5,6,7,8].map(n=><button className={n===count?'on':''} onClick={()=>setN(n)} key={n}>{n}</button>)}</div><div className="free-ring"><Ring items={items} interactive onSwap={swap} fixed={fixed} flipped={flipped}/></div></div><div className="free-tools"><button onClick={()=>setItems(v=>[...v.slice(1),v[0]])}><RotateCcw/>左回転</button><button onClick={()=>setItems(v=>[v.at(-1)!,...v.slice(0,-1)])}><RotateCw/>右回転</button><button onClick={()=>setFlipped(v=>!v)}><FlipVertical2/>裏返す</button><button onClick={()=>setFixed(v=>!v)}><LockKeyhole/>1つ固定</button><button onClick={()=>setFree(v=>!v)}><Sparkles/>この並びと同じもの</button><button onClick={()=>setN(count)}><RotateCcw/>リセット</button></div></div>{free&&<div className="equiv"><b>この {count} 個は1種類</b>{rotations(items).map((r,i)=><span key={i}>{r.join(' → ')}</span>)}</div>}</section>

   <section className="challenge"><div><small>CHALLENGE 03</small><h2>5個から3個を選ぶと？</h2><p><b>1, 2, 3</b>　<b>2, 3, 1</b>　<b>3, 1, 2</b><br/>この3つも、回転すると同じ円順列。</p></div><div className="big-formula"><Fraction top="₅P₃" bottom="3"/><span>=</span><mark>20</mark><small>3個ずつまとめる</small></div></section>

   <section className={`general ${general?'revealed':''}`}><small>GENERALIZE — 発見したあとで</small><h2>自分でたどり着いた公式</h2>{general?<div><article><span>異なる n 個の円順列</span><b><Fraction top="n!" bottom="n"/> = (n − 1)!</b></article><article><span>異なる n 個のじゅず順列</span><b><Fraction top="(n − 1)!" bottom="2"/></b></article></div>:<button onClick={()=>setGeneral(true)}>探究を進めて公式を開く</button>}</section>
  </main>
  <footer className="player"><button onClick={()=>setStep(s=>Math.max(0,s-1))}><ChevronLeft/>1ステップ</button><button className="play" onClick={()=>setPlaying(true)}><Play/>再生</button><button onClick={()=>setPlaying(false)}><Pause/>一時停止</button><div><span>STEP {step+1}</span><div className="track"><i style={{width:`${(step+1)/lessons.length*100}%`}}/></div></div><button onClick={()=>setStep(s=>Math.min(lessons.length-1,s+1))}>1ステップ<ChevronRight/></button></footer>
 </div>
}
