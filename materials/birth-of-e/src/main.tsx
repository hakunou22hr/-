import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
function MoviePlayer() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let active = true
    const check = () =>
      fetch('../../media/birth-of-e-ready.json?check=' + Date.now(), {
        cache: 'no-store',
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((v) => {
          if (active && v?.duration === 90) setReady(true)
        })
        .catch(() => {})
    check()
    const id = setInterval(check, 10000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])
  return (
    <div className="movie-only">
      <small>90 SECOND MATHEMATICAL DOCUMENTARY</small>
      <h1>
        The Birth of <i>e</i>
        <span>ネイピア数eの誕生</span>
      </h1>
      {ready ? (
        <>
          <video
            controls
            playsInline
            preload="metadata"
            src="../../media/birth-of-e-90s.mp4?v=clear-v2"
          />
          <a
            className="download-movie"
            href="../../media/birth-of-e-90s.mp4"
            download="ネイピア数eの誕生-90秒.mp4"
          >
            MP4をダウンロード
          </a>
          <p>90秒 · 1920×1080 · 30fps · 日本語ナレーション</p>
          <small>
            音声：NITech HTS Voice ·{' '}
            <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>
          </small>
        </>
      ) : (
        <div className="movie-progress">
          <p>90秒の動画を書き出しています。</p>
          <p>完成すると、この画面で再生・ダウンロードできます。</p>
        </div>
      )}
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
if (new URLSearchParams(location.search).has('render')) {
  import('./FilmRenderer').then(({ FilmRenderer }) => root.render(<FilmRenderer />))
} else {
  root.render(<MoviePlayer />)
}
