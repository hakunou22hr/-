import { Eye, EyeOff, Focus } from 'lucide-react'

export type Mode = '基本' | '単位円' | '鈍角' | '方程式' | '探究'
const modes: { key: Mode; label: string }[] = [
  { key: '基本', label: '① 三角比の基本' }, { key: '単位円', label: '② 単位円' },
  { key: '鈍角', label: '③ 鈍角' }, { key: '方程式', label: '④ 方程式' }, { key: '探究', label: '⑤ 探究' },
]

export default function Header({ mode, onMode, answers, onAnswers, figureOnly, onFigureOnly }: { mode: Mode; onMode: (m: Mode) => void; answers: boolean; onAnswers: () => void; figureOnly: boolean; onFigureOnly: () => void }) {
  return <>
    <header className="header">
      <div className="brand"><div className="logo">sin</div><div><h1>三角比を図で理解しよう</h1><p>角度を動かして、sin・cos・tanの変化を発見しよう</p></div></div>
      <div className="teacher-tools">
        <button className="tool-button" onClick={onAnswers}>{answers ? <EyeOff size={18}/> : <Eye size={18}/>} 答えを{answers ? '隠す' : '表示'}</button>
        <button className={`tool-button ${figureOnly ? 'active' : ''}`} onClick={onFigureOnly}><Focus size={18}/> 図だけ表示</button>
      </div>
    </header>
    {!figureOnly && <nav className="mode-tabs" aria-label="学習モード">{modes.map(m => <button key={m.key} className={mode === m.key ? 'active' : ''} onClick={() => onMode(m.key)}>{m.label}</button>)}</nav>}
  </>
}
