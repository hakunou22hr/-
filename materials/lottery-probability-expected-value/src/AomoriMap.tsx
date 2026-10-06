import { useMemo, useState } from 'react'
import AnimatedNumber from './AnimatedNumber'
import { aomoriWins } from './data/aomoriHighWins'

const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026] as const
export default function AomoriMap() {
  const [year, setYear] = useState<number | 'all'>('all')
  const [selected, setSelected] = useState(aomoriWins[0].id)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const shown = useMemo(() => year === 'all' ? aomoriWins : aomoriWins.filter(x => x.fiscalYear === year), [year])
  const active = aomoriWins.find(x => x.id === selected) ?? shown[0]
  const ranked = [...shown].sort((a, b) => b.prizeAmount - a.prizeAmount)
  return <section className="aomori-lab">
    <div className="map-filter">{years.map(y => <button key={y} className={year === y ? 'on' : ''} onClick={() => setYear(y)}>{y}</button>)}<button className={year === 'all' ? 'on' : ''} onClick={() => setYear('all')}>すべて</button></div>
    <div className="map-grid">
      <div className="aomori-map-frame" onWheel={e => setTransform(t => ({ ...t, scale: Math.max(.8, Math.min(1.8, t.scale - e.deltaY / 1000)) }))}>
        <div className="map-toolbar"><button onClick={() => setTransform(t => ({ ...t, scale: Math.min(1.8, t.scale + .2) }))}>＋</button><button onClick={() => setTransform(t => ({ ...t, scale: Math.max(.8, t.scale - .2) }))}>−</button><button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}>リセット</button></div>
        <svg viewBox="0 0 100 100" role="img" aria-label="青森県模式地図" style={{ transform: `translate(${transform.x}px,${transform.y}px) scale(${transform.scale})` }}>
          <defs><filter id="pinGlow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          <path className="prefecture" d="M9 58 15 41 26 31 35 30 39 18 47 9 53 11 55 33 64 35 69 15 76 8 82 18 79 36 91 49 86 62 78 70 73 88 57 92 46 83 34 88 26 74 15 70Z"/>
          <path className="map-grid-line" d="M10 58H88M26 31 73 88M55 33 34 88"/>
          {shown.map(win => <g key={win.id} className={`map-pin ${selected === win.id ? 'selected' : ''}`} onClick={() => setSelected(win.id)} role="button" aria-label={`${win.city} ${win.shop}`} tabIndex={0} onKeyDown={e => e.key === 'Enter' && setSelected(win.id)}><circle className="pin-wave" cx={win.x} cy={win.y} r="7"/><circle cx={win.x} cy={win.y} r="3"/><text x={win.x} y={win.y - 7}>{win.city}</text></g>)}
        </svg>
        {!shown.length && <div className="no-record"><b>公式公開情報から確認できる該当データなし</b><span>「0件」や「当せんなし」を意味しません。</span></div>}
      </div>
      <div className="ranking"><h3>高額当せん額ランキング</h3>{ranked.length ? ranked.map((win, i) => <button key={win.id} className={selected === win.id ? 'on' : ''} onClick={() => setSelected(win.id)}><i>{i + 1}</i><span>{win.city}<small>{win.lottery}</small></span><b>{win.prizeAmount >= 100_000_000 ? `${win.prizeAmount / 100_000_000}億円` : `${win.prizeAmount / 10_000}万円`}</b></button>) : <p>この年度は表示できる確認済み記録がありません。</p>}</div>
    </div>
    {active && shown.some(x => x.id === active.id) && <article className="spot-card" key={active.id}>
      <div><small>{active.fiscalYear}年度 / {active.lottery}{active.issueNumber ? ` 第${active.issueNumber}回` : ''}</small><h3>{active.city}</h3><p>{active.shop}</p></div>
      <div><span>{active.prizeRank}</span><strong><AnimatedNumber value={active.prizeAmount} suffix="円" /></strong><em>{active.prizeAmount >= 100_000_000 ? `${active.prizeAmount / 100_000_000}億円` : `${active.prizeAmount / 10_000}万円`}</em></div>
      <footer><a href={active.sourceUrl} target="_blank" rel="noreferrer">出典：{active.sourceName} ↗</a><span>確認日 {active.checkedAt}</span></footer>
    </article>}
    <aside className="map-caution"><b>過去の実績 ≠ 次回の当せん確率</b><p>地点は公式に確認できた過去の記録です。その売り場の次の1枚が当たりやすくなる根拠ではありません。</p></aside>
  </section>
}
