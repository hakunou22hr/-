import { TrigName } from '../math'

const data = {
  sin: { formula: 'sinθ = 高さ ÷ 斜辺', copy: 'sin は「向かい側の高さ」÷「斜辺」', step: '金色の斜辺から、青い高さへ光が進みます。' },
  cos: { formula: 'cosθ = 底辺 ÷ 斜辺', copy: 'cos は「となり側の底辺」÷「斜辺」', step: '金色の斜辺と、緑の底辺を比べます。' },
  tan: { formula: 'tanθ = 高さ ÷ 底辺', copy: 'tan は「向かい側の高さ」÷「となり側の底辺」', step: '緑の底辺から、青い高さへ光が進みます。' },
}

export function InfoPanel({ activeRatio }: { activeRatio: TrigName }) {
  const item = data[activeRatio]
  return <section className={`info-panel panel ${activeRatio}`}>
    <p className="section-label">NOW LEARNING</p>
    <div className="formula">{item.formula}</div>
    <p className="explain">{item.copy}</p>
    <p className="motion-note"><span>●</span>{item.step}</p>
    <div className="mini-guide">
      <div><i className="opposite" />向かい側 <b>高さ</b></div>
      <div><i className="adjacent" />となり側 <b>底辺</b></div>
      <div><i className="hypotenuse" />いちばん長い <b>斜辺</b></div>
    </div>
  </section>
}
