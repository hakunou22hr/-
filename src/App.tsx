import { useMemo, useState } from 'react'
import { ArrowRight, BookOpen, Search, Sigma, SlidersHorizontal, X } from 'lucide-react'
import { filterMaterials, materials, type Material } from './materials'

const filters = [
  'すべて',
  '数学Ⅰ',
  '数学Ⅱ',
  '数学A',
  '三角比',
  '集合・命題',
  '図形と方程式',
] as const

function MaterialCard({ material, index }: { material: Material; index: number }) {
  const href = `./materials/${material.id}/`

  return (
    <article className={`card tone-${index % 4}`}>
      <div className="card-top">
        <span>{material.subject}</span>
        <span>{material.unit}</span>
      </div>
      <div className="icon" aria-hidden="true"><BookOpen /></div>
      <h3>{material.name}</h3>
      <p>{material.description}</p>
      <a href={href} aria-label={`${material.name}を開く`}>
        教材を開く <ArrowRight />
      </a>
    </article>
  )
}

export default function App() {
  const [active, setActive] = useState('すべて')
  const [query, setQuery] = useState('')
  const visible = useMemo(
    () => filterMaterials(materials, active, query),
    [active, query],
  )

  const resetFilters = () => {
    setQuery('')
    setActive('すべて')
  }

  return (
    <div className="portal">
      <header className="hero">
        <nav aria-label="サイト情報">
          <a className="brand" href="./" aria-label="数学教材ポータル ホーム">
            <Sigma />
            <span><b>数学教材ポータル</b><small>INTERACTIVE MATHEMATICS</small></span>
          </a>
          <span className="count">登録教材 <b>{materials.length}</b></span>
        </nav>
        <div className="hero-copy">
          <span>高校数学 Interactive Learning Materials</span>
          <h1>図を動かす。数式を確かめる。<br /><em>考え方を発見する。</em></h1>
          <p>見るだけではなく、手を動かして気づく。高校数学のためのインタラクティブ教材コレクションです。</p>
        </div>
        <div className="math-mark" aria-hidden="true">∑</div>
      </header>

      <main>
        <section className="tools" aria-label="教材の検索と絞り込み">
          <label className="search-box">
            <Search aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="教材を検索"
              aria-label="教材を検索"
              type="search"
            />
            {query && (
              <button className="clear-search" onClick={() => setQuery('')} aria-label="検索語を消去">
                <X />
              </button>
            )}
            <output aria-live="polite">{visible.length} 件</output>
          </label>
          <div className="filters" role="group" aria-label="カテゴリーで絞り込む">
            <SlidersHorizontal aria-hidden="true" />
            <span>絞り込み</span>
            {filters.map((filter) => (
              <button
                className={active === filter ? 'active' : ''}
                aria-pressed={active === filter}
                onClick={() => setActive(filter)}
                key={filter}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        <section className="library" aria-labelledby="library-title">
          <div className="section-heading">
            <div>
              <small>MATERIAL LIBRARY</small>
              <h2 id="library-title">{active === 'すべて' ? 'すべての教材' : active}</h2>
            </div>
            <p>学びたい教材を選んでください</p>
          </div>
          {visible.length ? (
            <div className="grid">
              {visible.map((material, index) => (
                <MaterialCard material={material} index={index} key={material.id} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <Search aria-hidden="true" />
              <h3>教材が見つかりませんでした</h3>
              <p>検索語や絞り込み条件を変更してください。</p>
              <button onClick={resetFilters}>条件をリセット</button>
            </div>
          )}
        </section>
      </main>

      <footer>
        <b>数学教材ポータル</b>
        <span>高校数学を、もっと視覚的に。</span>
        <a href="./apps/courtside-scorebook/">COURTSIDE SCOREBOOK</a>
        <small>© Interactive Learning Materials</small>
      </footer>
    </div>
  )
}
