import { Minus, Plus } from 'lucide-react'
const presets = [30,45,60,90,120,135,150]

export default function AngleSlider({ angle, onChange }: { angle: number; onChange: (n: number) => void }) {
  const set = (n: number) => onChange(Math.max(0, Math.min(180, n)))
  return <section className="angle-control card">
    <div className="angle-top"><div><span className="eyebrow">角度 θ</span><strong>{angle}<small>°</small></strong></div><div className="step-buttons"><button onClick={() => set(angle - 1)} disabled={angle === 0}><Minus size={20}/><span>1°</span></button><button onClick={() => set(angle + 1)} disabled={angle === 180}><Plus size={20}/><span>1°</span></button></div></div>
    <div className="range-wrap"><input aria-label="角度" type="range" min="0" max="180" step="1" value={angle} onChange={e => set(Number(e.target.value))} style={{'--progress': `${angle / 1.8}%`} as React.CSSProperties}/><div className="range-labels"><span>0°</span><span>90°</span><span>180°</span></div></div>
    <div className="presets"><span>代表角</span>{presets.map(n => <button key={n} className={angle === n ? 'active' : ''} onClick={() => set(n)}>{n}°</button>)}</div>
  </section>
}
