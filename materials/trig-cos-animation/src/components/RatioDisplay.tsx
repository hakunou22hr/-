import { TrigName } from '../math'

type Values = { sin: number; cos: number; tan: number | null }
type Props = { angle: number; activeRatio: TrigName; values: Values }

export function RatioDisplay({ angle, activeRatio, values }: Props) {
  return <section className="values-panel panel">
    <div className="section-label"><span>REAL-TIME VALUES</span><strong>{angle}°</strong></div>
    <div className="value-list">
      {(['sin', 'cos', 'tan'] as TrigName[]).map(name => <div key={name} className={`value-row ${name} ${activeRatio === name ? 'selected' : ''}`}>
        <div><span className="ratio-name">{name}<i>θ</i></span><small>{name === 'sin' ? '向かい側 / 斜辺' : name === 'cos' ? 'となり側 / 斜辺' : '向かい側 / となり側'}</small></div>
        <strong>{values[name]!.toFixed(3)}</strong>
      </div>)}
    </div>
  </section>
}
