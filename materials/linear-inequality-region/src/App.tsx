import {useMemo,useState} from 'react'
import {Check,Eye,Lightbulb,RotateCcw} from 'lucide-react'
import {INEQUALITIES,Inequality,Point,commonPolygon,extrema,feasibleVertices,formatNumber} from './math'

const MIN=-2,MAX=9,SIZE=660,PAD=42,SPAN=MAX-MIN
const sx=(x:number)=>PAD+(x-MIN)*(SIZE-2*PAD)/SPAN
const sy=(y:number)=>SIZE-PAD-(y-MIN)*(SIZE-2*PAD)/SPAN
const points=(p:Point[])=>p.map(v=>`${sx(v.x)},${sy(v.y)}`).join(' ')
const lineEnds=(q:Inequality)=>q.b!==0?[{x:MIN,y:(q.c-q.a*MIN)/q.b},{x:MAX,y:(q.c-q.a*MAX)/q.b}]:[{x:q.c/q.a,y:MIN},{x:q.c/q.a,y:MAX}]

function Graph({active,k,showCommon,showLine,onVertex}:{active:Inequality[],k:number,showCommon:boolean,showLine:boolean,onVertex:(i:number)=>void}){
 const vertices=useMemo(()=>feasibleVertices(active),[active]), common=useMemo(()=>commonPolygon(active,MIN,MAX),[active])
 const hit=vertices.findIndex(v=>Math.abs(v.x+v.y-k)<=.06)
 const objective:Inequality={id:'k',label:'',boundary:'',a:1,b:1,c:k,color:'#d62f52'}
 return <div className="graph-wrap"><svg className="graph" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="選択した連立不等式の座標平面">
  <defs><clipPath id="plot"><rect x={PAD} y={PAD} width={SIZE-2*PAD} height={SIZE-2*PAD}/></clipPath></defs>
  <rect className="plot-bg" x={PAD} y={PAD} width={SIZE-2*PAD} height={SIZE-2*PAD}/>
  {Array.from({length:12},(_,i)=>i+MIN).map(n=><g key={n}><line className="grid" x1={sx(n)} y1={sy(MIN)} x2={sx(n)} y2={sy(MAX)}/><line className="grid" x1={sx(MIN)} y1={sy(n)} x2={sx(MAX)} y2={sy(n)}/>{n!==0&&<><text className="tick x-tick" x={sx(n)} y={sy(0)+22}>{n}</text><text className="tick" x={sx(0)-13} y={sy(n)+5}>{n}</text></>}</g>)}
  <line className="axis" x1={sx(MIN)} y1={sy(0)} x2={sx(MAX)} y2={sy(0)}/><line className="axis" x1={sx(0)} y1={sy(MIN)} x2={sx(0)} y2={sy(MAX)}/><path className="arrow" d={`M${sx(MAX)-10},${sy(0)-5}L${sx(MAX)},${sy(0)}L${sx(MAX)-10},${sy(0)+5}M${sx(0)-5},${sy(MAX)+10}L${sx(0)},${sy(MAX)}L${sx(0)+5},${sy(MAX)+10}`}/><text className="axis-label" x={sx(MAX)-14} y={sy(0)-11}>x</text><text className="axis-label" x={sx(0)+12} y={sy(MAX)+16}>y</text><text className="origin" x={sx(0)-18} y={sy(0)+22}>O</text>
  <g clipPath="url(#plot)">{active.map(q=><polygon key={`area-${q.id}`} points={points(commonPolygon([q],MIN,MAX))} fill={q.color} className="single-area"/>)}
   {showCommon&&active.length>1&&<polygon points={points(common)} className="common-area"/>}
   {active.map(q=>{const e=lineEnds(q);return <line key={q.id} className="boundary" stroke={q.color} x1={sx(e[0].x)} y1={sy(e[0].y)} x2={sx(e[1].x)} y2={sy(e[1].y)}/>})}
   {showLine&&(()=>{const e=lineEnds(objective);return <line className="objective" x1={sx(e[0].x)} y1={sy(e[0].y)} x2={sx(e[1].x)} y2={sy(e[1].y)}/>})()}
  </g>
  {showCommon&&vertices.map((v,i)=><g className={`vertex ${hit===i?'hit':''}`} key={`${v.x}-${v.y}`} onClick={()=>onVertex(i)} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')onVertex(i)}} aria-label={`点${String.fromCharCode(65+i)}、座標${formatNumber(v.x)},${formatNumber(v.y)}`}><circle className="vertex-hit" cx={sx(v.x)} cy={sy(v.y)} r="18"/><circle cx={sx(v.x)} cy={sy(v.y)} r="6"/><text x={sx(v.x)+11} y={sy(v.y)-10}>{String.fromCharCode(65+i)}</text></g>)}
  {showLine&&<text className="line-label" x={sx(Math.max(MIN,Math.min(MAX,k/2)))} y={sy(Math.max(MIN,Math.min(MAX,k-Math.max(MIN,Math.min(MAX,k/2)))))-13}>x + y = {formatNumber(k)}</text>}
 </svg>{hit>=0&&<div className="hit-card"><small>頂点に到達！</small><strong>（{formatNumber(vertices[hit].x)}，{formatNumber(vertices[hit].y)}）</strong><span>x + y = {formatNumber(vertices[hit].x)} + {formatNumber(vertices[hit].y)} = {formatNumber(vertices[hit].x+vertices[hit].y)}</span><b>k = {formatNumber(vertices[hit].x+vertices[hit].y)}</b></div>}</div>
}

export default function App(){
 const [ids,setIds]=useState<string[]>([]),[k,setK]=useState(2),[mode,setMode]=useState(1),[selected,setSelected]=useState<number|null>(null),[answers,setAnswers]=useState(false)
 const active=INEQUALITIES.filter(q=>ids.includes(q.id)),vertices=useMemo(()=>feasibleVertices(active),[active]),result=useMemo(()=>active.length===4?extrema(vertices):null,[active.length,vertices])
 const reset=()=>{setIds([]);setK(2);setMode(1);setSelected(null);setAnswers(false)}
 const toggle=(id:string)=>{setIds(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);setSelected(null);setAnswers(false)}
 const vertexInfo=selected===null?null:vertices[selected]
 return <div className="app"><header><a href="../../">← 教材一覧</a><div><p>MATHEMATICS II · INTERACTIVE LESSON</p><h1>連立不等式の領域と <span>最大・最小</span></h1></div><button className="reset" onClick={reset}><RotateCcw/>リセット</button></header>
  <nav className="modes" aria-label="表示モード">{['領域を見る','共通領域を見る','x+y=kを動かす','最大・最小を考える'].map((x,i)=><button key={x} className={mode===i+1?'on':''} onClick={()=>setMode(i+1)}><i>{i+1}</i>{x}</button>)}</nav>
  <main><section className="control-panel"><div className="section-title"><span>01</span><div><small>INEQUALITIES</small><h2>不等式を選ぼう</h2></div></div><p className="guide">ボタンを押すと、その式を満たす側が光ります。複数選んで共通部分を探そう。</p><div className="choices">{INEQUALITIES.map(q=>{const on=ids.includes(q.id);return <button key={q.id} aria-pressed={on} className={on?'on':''} style={{'--c':q.color} as React.CSSProperties} onClick={()=>toggle(q.id)}><span>{on?<Check/>:null}</span><b>{q.label}</b><small>境界：{q.boundary}</small></button>})}</div>
   <div className="legend"><b><i/>現在の共通領域</b><span>{active.length<2?'2つ以上の式を選ぶと表示されます':`${active.length}つの式を同時に満たす部分`}</span></div>
   {mode>=3&&<div className="slider"><div><label htmlFor="k">x + y = k</label><output>現在の k = <b>{formatNumber(k)}</b></output></div><input id="k" type="range" min="-4" max="18" step="0.1" value={k} onChange={e=>setK(Number(e.target.value))}/><div className="range"><span>−4</span><span>小さく ← 平行移動 → 大きく</span><span>18</span></div></div>}
   {vertexInfo&&<div className="vertex-info"><small>選んだ頂点</small><b>点{String.fromCharCode(65+selected!)}　（{formatNumber(vertexInfo.x)}，{formatNumber(vertexInfo.y)}）</b><span>x + y = {formatNumber(vertexInfo.x)} + {formatNumber(vertexInfo.y)} = <strong>{formatNumber(vertexInfo.x+vertexInfo.y)}</strong></span></div>}
  </section>
  <section className="graph-panel"><div className="graph-heading"><div><span>02</span><small>COORDINATE PLANE</small><h2>{active.length?`${active.length}つの不等式を表示中`:'不等式を選択してください'}</h2></div><div className="key"><i/>共通領域 <em/>x+y=k</div></div><Graph active={active} k={k} showCommon={mode>=2} showLine={mode>=3} onVertex={setSelected}/></section></main>
  {mode>=4&&<section className="thinking"><div className="think-head"><Lightbulb/><div><small>DISCOVERY STEPS</small><h2>考えてみよう</h2></div></div><ol><li><b>問い1</b>x + y = k の直線を動かしてみよう。kを大きくすると、直線はどちらへ動くだろう？</li><li><b>問い2</b>共通領域と交わる範囲で、kをできるだけ大きくしてみよう。</li><li><b>問い3</b>最後に直線が共通領域と触れるのは、どの点だろう？</li><li><b>問い4</b>その点の座標を使って、x + y の値を求めよう。</li><li><b>問い5</b>反対に、kを小さくしていくと、最小値はどの点で決まるだろう？</li></ol><button className="answer-button" disabled={!result} onClick={()=>setAnswers(v=>!v)}><Eye/>答えを{answers?'隠す':'確認'}</button>{!result&&<p className="answer-hint">4つの不等式を選ぶと、最大・最小を確認できます。</p>}{answers&&result&&<div className="answers"><Answer title="最大値" p={result.max} vertices={vertices}/><Answer title="最小値" p={result.min} vertices={vertices}/></div>}</section>}
 </div>
}
function Answer({title,p,vertices}:{title:string,p:Point,vertices:Point[]}){const i=vertices.indexOf(p);return <div><small>{title}</small><h3>{title}となる点：点{String.fromCharCode(65+i)}（{formatNumber(p.x)}，{formatNumber(p.y)}）</h3><p>x + y = {formatNumber(p.x)} + {formatNumber(p.y)} = <strong>{formatNumber(p.x+p.y)}</strong></p><b>そのとき k = {formatNumber(p.x+p.y)}</b></div>}
