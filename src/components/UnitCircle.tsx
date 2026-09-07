import { trig } from '../math'

export default function UnitCircle({ angle, explorationStep = 0 }: { angle: number; explorationStep?: number }) {
  const { sin, cos } = trig(angle), cx = 260, cy = 238, r = 172
  const px = cx + cos * r, py = cy - sin * r
  const arcEndX = cx + Math.cos(angle * Math.PI / 180) * 45
  const arcEndY = cy - Math.sin(angle * Math.PI / 180) * 45
  const arc = `M ${cx+45} ${cy} A 45 45 0 ${angle > 180 ? 1 : 0} 0 ${arcEndX} ${arcEndY}`
  const showLine = explorationStep >= 2, showPoints = explorationStep >= 3
  return <div className="circle-wrap">
    <div className="figure-heading"><div><span className="live-dot"/>LIVE 単位円</div><span>半径 = 1</span></div>
    <svg className="unit-circle" viewBox="0 0 520 475" role="img" aria-label={`角度${angle}度の単位円`}>
      <defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#87909e"/></marker><filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <g className="grid">{[-1,-.5,.5,1].map(v => <g key={v}><line x1={cx+v*r} x2={cx+v*r} y1="45" y2="430"/><line y1={cy+v*r} y2={cy+v*r} x1="48" x2="472"/></g>)}</g>
      <line className="axis" x1="35" y1={cy} x2="485" y2={cy} markerEnd="url(#arrow)"/><line className="axis" x1={cx} y1="442" x2={cx} y2="28" markerEnd="url(#arrow)"/>
      <text x="477" y={cy-12}>x</text><text x={cx+12} y="35">y</text><text x={cx-20} y={cy+22}>O</text>
      <circle className="main-circle" cx={cx} cy={cy} r={r}/>
      {showLine && <><line className="explore-line" x1="50" x2="470" y1={cy-r/2} y2={cy-r/2}/><text className="explore-label" x="64" y={cy-r/2-10}>y = 1/2</text></>}
      {showPoints && <>{[30,150].map(a => { const x = cx+Math.cos(a*Math.PI/180)*r, y=cy-r/2; return <g key={a}><circle className="answer-point" cx={x} cy={y} r="10"/><text className="answer-label" x={x+(a===30?10:-74)} y={y-18}>θ = {a}°</text></g>})}</>}
      <path className="angle-arc" d={arc}/><text className="theta" x={cx+52} y={cy-22}>θ</text>
      <polygon className="triangle-fill" points={`${cx},${cy} ${px},${cy} ${px},${py}`}/>
      <line className="radius" x1={cx} y1={cy} x2={px} y2={py}/>
      <line className="cos-line" x1={cx} y1={cy} x2={px} y2={cy}/>
      <line className="sin-line" x1={px} y1={cy} x2={px} y2={py}/>
      <path className="right-angle" d={`M ${px+(cos>=0?-13:13)} ${cy} L ${px+(cos>=0?-13:13)} ${cy-13} L ${px} ${cy-13}`}/>
      <circle className="point" cx={px} cy={py} r="8"/><text className="point-label" x={px+(cos>=0?13:-150)} y={Math.max(24,py-13)}>P (cos θ, sin θ)</text>
      <text className="cos-label" x={(cx+px)/2-27} y={cy+28}>cos θ</text><text className="sin-label" x={px+(cos>=0?13:-68)} y={(cy+py)/2}>sin θ</text>
      <text className="radius-label" x={(cx+px)/2+(cos>=0?-12:4)} y={(cy+py)/2-12}>斜辺 = 1</text>
      <text className="tick-label" x={cx+r-5} y={cy+20}>1</text><text className="tick-label" x={cx-r-14} y={cy+20}>−1</text><text className="tick-label" x={cx+10} y={cy-r+5}>1</text>
    </svg>
    <div className="legend"><span><i className="sin-swatch"/>縦 = sin θ</span><span><i className="cos-swatch"/>横 = cos θ</span><span><i className="radius-swatch"/>斜辺 = 1</span></div>
  </div>
}
