import { Info, Lightbulb } from 'lucide-react'
import type { Mode } from './Header'

const copy: Record<Mode, {title:string; lines:string[]}> = {
  '基本': {title:'三角比は「辺の割合」',lines:['sin θ = 高さ ÷ 斜辺','cos θ = 底辺 ÷ 斜辺','tan θ = 高さ ÷ 底辺']},
  '単位円': {title:'斜辺が1なら、もっとシンプル',lines:['sin θ = y座標（高さ）','cos θ = x座標（横）','点Pは円の上を動きます']},
  '鈍角': {title:'90°を超えると？',lines:['点Pは左側（第2象限）へ進む','左側のx座標はマイナス','だから cos θ と tan θ は負']},
  '方程式': {title:'同じ高さの点は？',lines:['sin θ は点Pのy座標','水平線と円は2点で交わることがある','左右の角度を比べよう']},
  '探究': {title:'今日の探究',lines:['sin θ = 1/2 となる角度は？','30°のほかにもあるのか、図で探そう']},
}
export default function LearningPanel({ mode, angle }: { mode: Mode; angle: number }) {
 const c=copy[mode], obtuse=angle>90
 return <section className="learning-card card"><div className="learn-icon"><Lightbulb size={22}/></div><div><span className="eyebrow">ミニ解説</span><h3>{c.title}</h3>{c.lines.map((l,i)=><p key={i}>{l}</p>)}{obtuse && <div className="obtuse-note"><Info size={19}/><span><b>第2象限にいます</b><br/>sinは正、cosとtanは負です。</span></div>}</div></section>
}
