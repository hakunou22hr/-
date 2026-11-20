// Animated portal background: light curves flowing over the static artwork.
// Drawn on a fixed canvas behind the page content. Kept light by rendering
// at half resolution, capping at 30 fps, pausing while the tab is hidden,
// and using fewer curves on narrow screens. With reduced-motion settings
// (or no canvas support) the static artwork simply stays as it was.

type Curve = {
  base: number
  amp1: number
  amp2: number
  k1: number
  k2: number
  speed1: number
  speed2: number
  hue: number
  alpha: number
  width: number
}

const HUES = [190, 174, 205, 42, 262, 322]

function buildCurves(count: number): Curve[] {
  const curves: Curve[] = []
  for (let i = 0; i < count; i += 1) {
    curves.push({
      base: (i + 0.5) / count,
      amp1: 0.028 + (i % 4) * 0.011,
      amp2: 0.012 + (i % 3) * 0.007,
      k1: 1.4 + (i % 5) * 0.45,
      k2: 3.1 + (i % 4) * 0.8,
      speed1: 0.05 + (i % 5) * 0.016,
      speed2: 0.09 + (i % 3) * 0.03,
      hue: HUES[i % HUES.length],
      alpha: 0.16 + (i % 3) * 0.07,
      width: 1.1 + (i % 3) * 0.55,
    })
  }
  return curves
}

function startBackground(): void {
  const canvas = document.createElement('canvas')
  canvas.className = 'bg-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.prepend(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    canvas.remove()
    return
  }

  const SCALE = 0.5
  const narrow = Math.min(window.innerWidth, window.innerHeight) < 700
  const curves = buildCurves(narrow ? 8 : 14)
  let raf = 0
  let lastDraw = 0

  const resize = () => {
    canvas.width = Math.max(2, Math.round(window.innerWidth * SCALE))
    canvas.height = Math.max(2, Math.round(window.innerHeight * SCALE))
  }
  resize()
  window.addEventListener('resize', resize)

  const draw = (timeMs: number) => {
    const t = timeMs / 1000
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineCap = 'round'
    const step = 7
    for (const c of curves) {
      const p1 = t * c.speed1 * Math.PI * 2 + c.base * 9
      const p2 = t * c.speed2 * Math.PI * 2 + c.base * 17
      ctx.beginPath()
      for (let x = 0; x <= w; x += step) {
        const u = x / w
        const y =
          c.base * h +
          Math.sin(u * c.k1 * Math.PI * 2 + p1) * c.amp1 * h +
          Math.sin(u * c.k2 * Math.PI * 2 + p2) * c.amp2 * h
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = `hsla(${c.hue}, 92%, 66%, ${c.alpha})`
      ctx.lineWidth = c.width
      ctx.shadowColor = `hsla(${c.hue}, 95%, 60%, 0.8)`
      ctx.shadowBlur = 10
      ctx.stroke()
    }
    ctx.shadowBlur = 0
    ctx.globalCompositeOperation = 'source-over'
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    draw(1200)
    return
  }

  const loop = (timeMs: number) => {
    raf = requestAnimationFrame(loop)
    if (timeMs - lastDraw < 1000 / 30) return
    lastDraw = timeMs
    draw(timeMs)
  }
  raf = requestAnimationFrame(loop)

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf)
    } else {
      lastDraw = 0
      raf = requestAnimationFrame(loop)
    }
  })
}

if (document.body) startBackground()
else window.addEventListener('DOMContentLoaded', startBackground)
