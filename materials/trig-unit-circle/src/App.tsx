import { useState } from 'react'
import Header, { Mode } from './components/Header'
import AngleSlider from './components/AngleSlider'
import UnitCircle from './components/UnitCircle'
import TrigValues from './components/TrigValues'
import LearningPanel from './components/LearningPanel'
import ExplorationMode from './components/ExplorationMode'

export default function App() {
 const [angle,setAngle]=useState(30), [mode,setMode]=useState<Mode>('基本'), [answers,setAnswers]=useState(true), [figureOnly,setFigureOnly]=useState(false), [step,setStep]=useState(1)
 const changeMode=(m:Mode)=>{setMode(m); if(m==='探究')setStep(1)}
 return <div className={figureOnly?'app figure-only':'app'}><Header mode={mode} onMode={changeMode} answers={answers} onAnswers={()=>setAnswers(!answers)} figureOnly={figureOnly} onFigureOnly={()=>setFigureOnly(!figureOnly)}/><main>
   {!figureOnly && <AngleSlider angle={angle} onChange={setAngle}/>}<div className="workspace"><section className="visual card"><UnitCircle angle={angle} explorationStep={mode==='探究'?step:0}/></section>
   {!figureOnly && <aside><TrigValues angle={angle} answers={answers}/><LearningPanel mode={mode} angle={angle}/></aside>}</div>
   {!figureOnly && mode==='探究' && <ExplorationMode step={step} setStep={setStep} answers={answers}/>} {!figureOnly && <footer>θを動かして、図と数字の「つながり」を見つけよう。</footer>}
 </main></div>
}
