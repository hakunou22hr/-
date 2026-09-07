import { TrigName } from '../math'

type Props = { angle: number; activeRatio: TrigName; playing: boolean }

export function TriangleScene({ angle, activeRatio, playing }: Props) {
  const theta = { x: 115, y: 390 }
  const radians = angle * Math.PI / 180
  const hypotenuseLength = 480
  const right = { x: theta.x + Math.cos(radians) * hypotenuseLength, y: theta.y }
  const top = { x: right.x, y: right.y - Math.sin(radians) * hypotenuseLength }
  const offset = { x: 48, y: -37 }
  const back = (p: {x:number;y:number}) => ({ x: p.x + offset.x, y: p.y + offset.y })
  const path = activeRatio === 'sin'
    ? `M ${theta.x} ${theta.y} L ${top.x} ${top.y} L ${right.x} ${right.y}`
    : activeRatio === 'cos'
      ? `M ${theta.x} ${theta.y} L ${top.x} ${top.y} M ${theta.x} ${theta.y} L ${right.x} ${right.y}`
      : `M ${theta.x} ${theta.y} L ${right.x} ${right.y} L ${top.x} ${top.y}`
  const cosPath = `M ${top.x} ${top.y} L ${theta.x} ${theta.y} L ${right.x} ${right.y}`
  const active = (side: 'hypotenuse'|'base'|'height') => activeRatio === 'sin' ? side !== 'base' : activeRatio === 'cos' ? side !== 'height' : side !== 'hypotenuse'
  const arcR = 58
  const arcEnd = { x: theta.x + arcR * Math.cos(angle * Math.PI / 180), y: theta.y - arcR * Math.sin(angle * Math.PI / 180) }
  return <div className="triangle-stage">
    <svg viewBox="0 0 720 485" role="img" aria-label={`角度${angle}度の直角三角形`}>
      <defs>
        <filter id="goldGlow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="blueGlow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="redGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="face" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#0f3c43" stopOpacity=".5"/><stop offset="1" stopColor="#070b16" stopOpacity=".12"/></linearGradient>
      </defs>
      <g className="depth-shape">
        <polygon points={`${back(theta).x},${back(theta).y} ${back(right).x},${back(right).y} ${back(top).x},${back(top).y}`} />
        {[theta,right,top].map((p,i)=><line key={i} x1={p.x} y1={p.y} x2={back(p).x} y2={back(p).y}/>) }
      </g>
      <polygon className="triangle-face" points={`${theta.x},${theta.y} ${right.x},${right.y} ${top.x},${top.y}`} />
      <line className={`side base ${active('base')?'lit':''}`} x1={theta.x} y1={theta.y} x2={right.x} y2={right.y}/>
      <line className={`side height ${active('height')?'lit':''}`} x1={right.x} y1={right.y} x2={top.x} y2={top.y}/>
      <line className={`side hypotenuse ${active('hypotenuse')?'lit':''}`} x1={theta.x} y1={theta.y} x2={top.x} y2={top.y}/>
      <path className="right-angle" d={`M ${right.x-24} ${right.y} L ${right.x-24} ${right.y-24} L ${right.x} ${right.y-24}`} />
      <path className="theta-arc" d={`M ${theta.x+arcR} ${theta.y} A ${arcR} ${arcR} 0 0 0 ${arcEnd.x} ${arcEnd.y}`} />
      <text className="theta-label" x={theta.x+70} y={theta.y-27}>θ</text>
      <text className="side-label base-label" x={(theta.x+right.x)/2} y={right.y+40}>底辺 <tspan>（となり側）</tspan></text>
      <text className="side-label height-label" x={right.x+25} y={(right.y+top.y)/2}>高さ</text>
      <text className="side-label opposite-label" x={right.x+25} y={(right.y+top.y)/2+24}>（向かい側）</text>
      <text className="side-label hyp-label" x={(theta.x+top.x)/2-30} y={(theta.y+top.y)/2-24}>斜辺</text>
      {activeRatio === 'cos' ? (
        <g key="cos-motion" className={`motion cos-motion ${playing ? 'playing' : 'paused'}`}>
          <path className="motion-guide" d={cosPath}/>
          <path className="motion-trail" d={cosPath} pathLength="100">
            <animate attributeName="stroke-dashoffset" values="100;0;0" keyTimes="0;.857;1" dur="3.5s" repeatCount="indefinite"/>
          </path>
          <circle r="8"><animateMotion dur="3.5s" repeatCount="indefinite" path={cosPath} keyPoints="0;1;1" keyTimes="0;.857;1" calcMode="linear"/></circle>
        </g>
      ) : (
        <g key={`${activeRatio}-motion`} className={`motion ${playing ? 'playing' : 'paused'} ${activeRatio}`}>
          <path className="motion-guide" d={path}/>
          <path className="motion-trail" d={path} pathLength="100">
            <animate attributeName="stroke-dashoffset" values="100;0" dur="2.8s" repeatCount="indefinite"/>
          </path>
          <circle r="8"><animateMotion dur="2.8s" repeatCount="indefinite" path={path}/></circle>
        </g>
      )}
    </svg>
    <div className="scene-key"><span><i className="key-red"/>注目する角 θ</span><span><i className="key-pulse"/>光が「比べる辺」をたどります</span></div>
  </div>
}
