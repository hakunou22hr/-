import { useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, CircleHelp, Eye, History, Pause, Play, RotateCcw, Sparkles, Users } from 'lucide-react'

type Room = 'A' | 'B'
type Mode = 'named' | 'unnamed'

const people = [1, 2, 3, 4, 5, 6, 7]
const demoMessages = [
  '一人ずつ、AかBを選びます', '7人それぞれに2つの選択肢', 'もし全員がAに入ったら？',
  'もし全員がBに入ったら？', '空室になる2ケースは条件違反', '2⁷ − 2 = 126',
  '左右の部屋を入れ替えてみよう', '名前がなければ、これは同じ分け方', '126 ÷ 2', '答えは63通り',
]

function Person({ id, room, selected, onSelect, onMove }: { id:number; room:Room; selected:boolean; onSelect:()=>void; onMove:(r:Room)=>void }) {
  return <button className={`person p${id} ${selected?'selected':''}`} draggable onDragStart={e=>e.dataTransfer.setData('person',String(id))} onClick={onSelect} aria-label={`${id}番、ROOM ${room}`}>
    <span className="number">{id}</span><span className="head"/><span className="body"/><span className="shadow"/>
    {selected && <span className="move-pop"><i onClick={e=>{e.stopPropagation();onMove('A')}}>Aへ</i><i onClick={e=>{e.stopPropagation();onMove('B')}}>Bへ</i></span>}
  </button>
}

export default function App() {
  const [started,setStarted]=useState(false), [mode,setMode]=useState<Mode>('named')
  const [rooms,setRooms]=useState<Record<number,Room>>(()=>Object.fromEntries(people.map((n,i)=>[n,i<3?'A':'B'])) as Record<number,Room>)
  const [selected,setSelected]=useState<number|null>(null), [flash,setFlash]=useState<Room|null>(null)
  const [stage,setStage]=useState(0), [history,setHistory]=useState<string[]>([]), [toast,setToast]=useState('')
  const [teacher,setTeacher]=useState(false), [view,setView]=useState<'front'|'top'>('front'), [zoom,setZoom]=useState(1)
  const [demo,setDemo]=useState(false), [playing,setPlaying]=useState(false), [explore,setExplore]=useState(false), [n,setN]=useState(7)
  const [results,setResults]=useState<Record<number,[number,number]>>({}), timer=useRef<number|undefined>(undefined)
  const activePeople=people.slice(0,n)
  const members=(r:Room)=>activePeople.filter(p=>rooms[p]===r)
  const valid=members('A').length>0&&members('B').length>0
  const reveal=stage>=5 || (demo&&stage>=5)
  const status=demo ? demoMessages[stage] : stage<2?'人物を動かして、分け方を試してみよう':stage<5?'一人ひとりの選択を積み重ねよう':stage<7?'本当に128通りでいい？':'部屋の名前をなくすと何が変わる？'

  const move=(id:number,r:Room)=>{ setRooms(x=>({...x,[id]:r}));setSelected(null);setFlash(r);window.setTimeout(()=>setFlash(null),650) }
  const allTo=(r:Room)=>{setRooms(x=>({...x,...Object.fromEntries(activePeople.map(p=>[p,r]))}));setFlash(r);setStage(Math.max(stage,3));window.setTimeout(()=>setFlash(null),650)}
  const random=()=>{let next:Record<number,Room>;do{next={...rooms};activePeople.forEach(p=>next[p]=Math.random()>.5?'A':'B')}while(activePeople.every(p=>next[p]===next[1]));setRooms(next);setStage(Math.max(stage,1))}
  const swap=()=>{setRooms(x=>Object.fromEntries(Object.entries(x).map(([k,v])=>[k,v==='A'?'B':'A'])) as unknown as Record<number,Room>);setStage(Math.max(stage,7));setToast(mode==='unnamed'?'同じ分け方！':'AとBが入れ替わった別の配置');window.setTimeout(()=>setToast(''),1900)}
  const signature=()=>{const a=members('A').join(',');const b=members('B').join(',');return mode==='named'?`${a}|${b}`:[a,b].sort().join('|')}
  const record=()=>{if(!valid){setToast('両方の部屋に1人以上入れよう');return}const s=signature();if(history.includes(s)){setToast(mode==='named'?'すでにあります':'左右を入れ替えても同じ分け方です');return}setHistory(h=>[...h,s]);setToast('配置を記録しました');window.setTimeout(()=>setToast(''),1500)}
  const drop=(r:Room,e:React.DragEvent)=>{e.preventDefault();const id=Number(e.dataTransfer.getData('person'));if(id)move(id,r)}
  const advance=()=>setStage(s=>Math.min(9,s+1)), back=()=>setStage(s=>Math.max(0,s-1))

  useEffect(()=>{ if(playing&&demo){timer.current=window.setTimeout(()=>setStage(s=>s>=9?(setPlaying(false),9):s+1),1800);return()=>clearTimeout(timer.current)} },[playing,demo,stage])
  useEffect(()=>{if(!demo)return;if(stage===2)allTo('A');else if(stage===3)allTo('B');else if(stage===6)swap()},[demo,stage]) // eslint-disable-line react-hooks/exhaustive-deps
  const countCards=useMemo(()=>activePeople.map(p=><div className={stage>0?'lit':''} key={p}><b>{p}</b><span>A</span><em>/</em><span>B</span></div>),[n,stage])

  if(!started)return <main className="landing"><div className="orb one"/><div className="orb two"/><header><span className="logo">MATH <b>LAB</b></span><button onClick={()=>setTeacher(true)}>教師モード</button></header><section><div className="eyebrow">MATHEMATICS A · EXPLORATION 01</div><h1>7人を2つの部屋に<br/><strong>分けてみよう！</strong></h1><p>何通りの分け方があるだろう？</p><button className="start" onClick={()=>setStarted(true)}>自由に試す <ChevronRight/></button><small>DRAG · DISCOVER · PROVE</small></section><div className="landing-rooms"><i>ROOM A</i><i>ROOM B</i></div></main>

  return <div className="app">
    <header className="topbar"><span className="logo">MATH <b>LAB</b></span><div><button className="teacher-btn" onClick={()=>setTeacher(!teacher)}><BookOpen/>教師モード</button><button aria-label="リセット" onClick={()=>location.reload()}><RotateCcw/></button></div></header>
    <section className="lesson-head"><div><span>MATHEMATICS A / 場合の数</span><h1>7人を2つの部屋に分けてみよう！</h1></div><div className="mode-switch"><button className={mode==='named'?'active':''} onClick={()=>setMode('named')}>部屋を区別する</button><button className={mode==='unnamed'?'active gold':''} onClick={()=>{setMode('unnamed');setStage(Math.max(stage,7))}}>部屋を区別しない</button></div></section>
    <main className="workspace">
      <section className="scene-panel">
        <div className="scene-tools"><span><Sparkles/> INTERACTIVE 3D</span><div><button onClick={()=>setView('front')} className={view==='front'?'active':''}><Eye/>正面</button><button onClick={()=>setView('top')} className={view==='top'?'active':''}>上から見る</button><button onClick={()=>setZoom(1)}><RotateCcw/>リセット</button></div></div>
        <div className={`scene ${view}`} style={{'--zoom':zoom} as React.CSSProperties} onWheel={e=>setZoom(z=>Math.max(.8,Math.min(1.18,z-e.deltaY*.0005)))}>
          <div className="grid-floor"/>
          {(['A','B'] as Room[]).map(r=><div key={r} className={`room room-${r.toLowerCase()} ${flash===r?'flash':''} ${!members(r).length?'empty':''} ${mode==='unnamed'?'same':''}`} onDragOver={e=>e.preventDefault()} onDrop={e=>drop(r,e)}>
            <div className="room-title"><small>{mode==='named'?`ROOM ${r}`:'ROOM'}</small><b>{members(r).length}</b><span>PEOPLE</span></div><div className="backwall"/><div className="floor">
              {members(r).map(id=><Person key={id} id={id} room={r} selected={selected===id} onSelect={()=>setSelected(selected===id?null:id)} onMove={x=>move(id,x)}/>)}</div>
            {!members(r).length&&<div className="empty-alert">! ROOM {mode==='named'?r:''} が空です</div>}
          </div>)}
          {toast&&<div className="toast">{toast}</div>}
        </div>
        <div className="scene-bottom"><div><button onClick={()=>allTo('A')}>すべてAへ</button><button onClick={()=>allTo('B')}>すべてBへ</button><button onClick={random}>ランダム配置</button></div><button className="swap" onClick={swap}>↔ 入れ替えてみる</button></div>
      </section>
      <aside className="insight">
        <div className="step"><span>探究ステップ {stage+1}<i>/ 10</i></span><div>{Array.from({length:10},(_,i)=><b className={i<=stage?'on':''} key={i}/>)}</div></div>
        <section className="question"><small>QUESTION</small><h2>{status}</h2>{stage<2&&<p>番号をタップ、または部屋へドラッグできます。</p>}{stage>=2&&stage<5&&<p>①さんはどちらの部屋に入ることができる？</p>}</section>
        <section className="sets"><div><span>{mode==='named'?'ROOM A':'ROOM'}</span><b>{`{ ${members('A').join(', ')} }`}</b></div><div><span>{mode==='named'?'ROOM B':'ROOM'}</span><b>{`{ ${members('B').join(', ')} }`}</b></div></section>
        <section className="choice-cards"><header><Users/>選択の積み重ね</header>{countCards}<p className={stage>=2?'show':''}>2 × 2 × 2 × 2 × 2 × 2 × 2</p>{stage>=2&&<h3>2⁷ = 128 <small>答えは128通り？</small></h3>}</section>
        {stage>=3&&<div className={`condition ${valid?'ok':'bad'}`}><b>{valid?'✓ 条件を満たしています':'! 条件違反です'}</b><span>それぞれの部屋に少なくとも1人</span></div>}
        {reveal&&<div className="result"><span>部屋を区別する場合</span><b>2⁷ − 2 = <strong>126</strong></b>{stage>=8&&<><span>部屋を区別しない場合</span><b>126 ÷ 2 = <strong>63</strong></b></>}</div>}
        <button className="record" onClick={record}><History/>この配置を記録 <span>{history.length}</span></button>
      </aside>
    </main>
    <section className="controls"><button onClick={back}><ChevronLeft/>戻る</button><button onClick={()=>{setDemo(true);setPlaying(!playing)}}>{playing?<Pause/>:<Play/>}{playing?'一時停止':'自動デモ'}</button><button onClick={advance}>次へ<ChevronRight/></button><button onClick={()=>setExplore(!explore)}>もっと試す</button></section>
    {explore&&<section className="explore"><div><small>EXTENDED EXPLORATION</small><h2>人数を変えて、規則を探そう</h2><p>まず操作してから、結果を記録しよう。</p></div><div className="n-picker">{[2,3,4,5,6,7].map(x=><button className={n===x?'active':''} onClick={()=>setN(x)} key={x}>{x}人</button>)}</div><button className="fill" onClick={()=>setResults(x=>({...x,[n]:[2**n-2,(2**n-2)/2]}))}>この人数の結果を確かめる</button><table><thead><tr><th>人数 n</th><th>区別あり</th><th>区別なし</th></tr></thead><tbody>{[2,3,4,5,6,7].map(x=><tr key={x}><td>{x}</td><td>{results[x]?.[0]??'—'}</td><td>{results[x]?.[1]??'—'}</td></tr>)}</tbody></table>{Object.keys(results).length>=3&&<div className="general"><CircleHelp/>何か規則が見えてきた？ <b>2ⁿ − 2</b><b>(2ⁿ − 2) ÷ 2</b></div>}</section>}
    {teacher&&<aside className="teacher"><button onClick={()=>setTeacher(false)}>×</button><small>TEACHER MONITOR</small><h2>教師モード</h2><dl><dt>現在の配置</dt><dd>A:{`{${members('A')}}`} / B:{`{${members('B')}}`}</dd><dt>人数</dt><dd>A {members('A').length}人・B {members('B').length}人</dd><dt>条件</dt><dd className={valid?'good':'warn'}>{valid?'満たしている':'空室あり'}</dd><dt>モード</dt><dd>{mode==='named'?'区別あり':'区別なし'}</dd><dt>学習ステップ</dt><dd>{stage+1} / 10</dd><dt>正解</dt><dd>区別あり 126 / 区別なし 63</dd><dt>ヒント</dt><dd>左右を交換した配置に注目</dd></dl></aside>}
  </div>
}
