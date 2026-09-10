import { ArrowRight, BookOpen, LibraryBig, Shapes } from 'lucide-react'
import { materials } from './materials'

export default function App() {
  return <div className="portal-shell">
    <header className="portal-header">
      <a className="brand" href="./" aria-label="数学教材ライブラリのトップ">
        <LibraryBig aria-hidden="true" />
        <span>MATH MATERIALS</span>
      </a>
      <p>見て、触れて、考える。</p>
    </header>
    <main>
      <section className="hero">
        <div className="hero-mark"><Shapes aria-hidden="true" /></div>
        <p className="eyebrow">INTERACTIVE LEARNING PORTAL</p>
        <h1>数学教材<span>ライブラリ</span></h1>
        <p className="lead">図を動かし、変化を確かめながら学べる数学教材を集めました。</p>
        <div className="count"><strong>{materials.length}</strong><span>教材を公開中</span></div>
      </section>

      <section className="library" aria-labelledby="library-heading">
        <div className="section-title">
          <div><p>EXPLORE MATERIALS</p><h2 id="library-heading">数学教材一覧</h2></div>
          <span>{materials.length} MATERIALS</span>
        </div>
        <div className="cards">
          {materials.map((material, index) => <article className="card" key={material.id}>
            <div className="card-number">{String(index + 1).padStart(2, '0')}</div>
            <div className="tags"><span>{material.subject}</span><span>{material.unit}</span></div>
            <BookOpen className="card-icon" aria-hidden="true" />
            <h3>{material.name}</h3>
            <p>{material.description}</p>
            <a href={`./materials/${material.id}/`}>教材を開く <ArrowRight aria-hidden="true" /></a>
          </article>)}
        </div>
      </section>
    </main>
    <footer><span>MATHEMATICS MATERIAL LIBRARY</span><p>それぞれの教材は独立したページとして保存されています。</p></footer>
  </div>
}
