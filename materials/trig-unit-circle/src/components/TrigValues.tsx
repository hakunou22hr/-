import { decimal, exactValue, trig, TrigName } from '../math'

const config: {name: TrigName; jp: string; color: string}[] = [{name:'sin',jp:'高さを見る',color:'pink'},{name:'cos',jp:'横を見る',color:'blue'},{name:'tan',jp:'傾きを見る',color:'amber'}]
export default function TrigValues({ angle, answers }: { angle: number; answers: boolean }) {
  const values = trig(angle)
  return <section className="value-section"><div className="section-title"><span>現在の値</span><small>θ = {angle}°</small></div>
    <div className="value-grid">{config.map(({name,jp,color}) => { const val=values[name], ex=exactValue(angle,name); return <article className={`value-card ${color}`} key={name}><div className="value-label"><b>{name}</b> θ <span>{jp}</span></div><div className={`big-value ${val===null?'undefined':''}`}>{answers ? (val===null ? '定義されません' : decimal(val)) : '— — —'}</div>{answers && ex && <div className="exact">{name}{angle}° = <strong>{ex}</strong>{val !== null && ex !== decimal(val) && <span> ≈ {decimal(val)}</span>}</div>}</article>})}</div>
  </section>
}
