import { TrigName } from '../math'

type Props = { angle: number; onAngle: (value: number) => void; activeRatio: TrigName; onRatio: (ratio: TrigName) => void }

export function Controls({ angle, onAngle, activeRatio, onRatio }: Props) {
  return <div className="controls">
    <div className="angle-control">
      <div className="angle-readout"><span>ANGLE</span><strong>θ = {angle}°</strong></div>
      <div className="slider-wrap">
        <input aria-label="角度 θ" type="range" min="10" max="80" value={angle} onChange={e => onAngle(Number(e.target.value))} style={{ '--range': `${(angle - 10) / 70 * 100}%` } as React.CSSProperties} />
        <div><span>10°</span><span>45°</span><span>80°</span></div>
      </div>
    </div>
    <div className="ratio-buttons" aria-label="表示する三角比">
      {(['sin', 'cos', 'tan'] as TrigName[]).map(ratio => <button key={ratio} className={activeRatio === ratio ? `active ${ratio}` : ratio} onClick={() => onRatio(ratio)}><span>{ratio}</span><small>{ratio === 'sin' ? '高さ ÷ 斜辺' : ratio === 'cos' ? '底辺 ÷ 斜辺' : '高さ ÷ 底辺'}</small></button>)}
    </div>
  </div>
}
