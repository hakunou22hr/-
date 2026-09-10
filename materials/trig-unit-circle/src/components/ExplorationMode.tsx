import { ArrowRight, RotateCcw } from 'lucide-react'
const steps = [
  {n:1,title:'sin θは単位円のどこの値？',body:'ヒント：点Pの「高さ」に注目しよう。'},
  {n:2,title:'y = 1/2 となる場所を探してみよう',body:'図に現れたピンクの水平線を見てみよう。'},
  {n:3,title:'円との交点はいくつある？',body:'左側と右側に1つずつ。全部で2つ！'},
  {n:4,title:'それぞれの角度を確認しよう',body:'同じ高さでも、右と30°、左と150°があります。'},
]
export default function ExplorationMode({ step, setStep, answers }: { step:number; setStep:(n:number)=>void; answers:boolean }) {
 const item=steps[Math.max(0,step-1)]
 return <section className="exploration card"><div className="explore-head"><div><span className="eyebrow">DISCOVERY MISSION</span><h2>sin θ = 1/2 の角度を探そう</h2></div><div className="step-count">STEP <b>{step}</b> / 4</div></div>
  <div className="progress">{steps.map(s=><i key={s.n} className={s.n<=step?'done':''}/>)}</div>
  <div className="question"><span>STEP {item.n}</span><h3>{item.title}</h3><p>{item.body}</p></div>
  {step===4 && answers && <div className="final-answer"><small>発見！</small><strong>sin θ = 1/2 <ArrowRight/> θ = 30°, 150°</strong></div>}
  <div className="explore-actions">{step>1 && <button className="back" onClick={()=>setStep(step-1)}>ひとつ戻る</button>}<button className="next" onClick={()=>setStep(step===4?1:step+1)}>{step===4?<><RotateCcw size={18}/>もう一度</>:<>次のSTEPへ<ArrowRight size={18}/></>}</button></div>
 </section>
}
