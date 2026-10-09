/** Shared by the interactive application and the deterministic MP4 renderer. */
export const DURATION = 90
export const FPS = 30
export const chapters = [
  {
    start: 0,
    end: 18,
    title: '変化する現実',
    en: 'CONTINUOUS GROWTH',
    question: '分割回数を増やすと、1年後の元利合計はどこまで増える？',
  },
  {
    start: 18,
    end: 36,
    title: '無限の実験室',
    en: 'APPROACHING ZERO',
    question: 'hの正側と負側では、近づく値は同じだろうか？',
  },
  {
    start: 36,
    end: 48,
    title: '対数の風景',
    en: 'A CHANGE OF PERSPECTIVE',
    question: '指数関数と対数関数は、直線 y=x に対してどう配置される？',
  },
  {
    start: 48,
    end: 64,
    title: '割線から接線へ',
    en: 'THE SHAPE OF CHANGE',
    question: '2点を近づけると、割線の傾きはどう変わる？',
  },
  {
    start: 64,
    end: 76,
    title: '特別な底の出現',
    en: 'THE BIRTH OF e',
    question: 'x=1で接線の傾きが1になる底を、自分で探そう。',
  },
  {
    start: 76,
    end: 90,
    title: '自然対数の微分',
    en: 'A LANGUAGE OF CHANGE',
    question: 'xを2倍にすると、自然対数の接線の傾きはどう変わる？',
  },
] as const
export type Parameters = { a: number; x: number; h: number; n: number }
export type Vec3 = [number, number, number]
export function validBase(a: number) {
  return Number.isFinite(a) && a > 0 && a !== 1
}
export function logA(x: number, a: number) {
  return x > 0 && validBase(a) ? Math.log(x) / Math.log(a) : NaN
}
export function derivative(x: number, a: number) {
  return x > 0 && validBase(a) ? 1 / (x * Math.log(a)) : NaN
}
export function secant(x: number, h: number, a: number) {
  return x > 0 && x + h > 0 && h !== 0 && validBase(a) ? Math.log1p(h / x) / (h * Math.log(a)) : NaN
}
export function compound(n: number) {
  return Number.isInteger(n) && n >= 1 ? Math.exp(n * Math.log1p(1 / n)) : NaN
}
export function limitExperiment(h: number) {
  return Number.isFinite(h) && h > -1 && h !== 0 ? Math.exp(Math.log1p(h) / h) : NaN
}
export function chapterAt(t: number) {
  return chapters.findIndex((c) => t < c.end) < 0 ? 5 : chapters.findIndex((c) => t < c.end)
}
const smooth = (v: number) => {
  const q = Math.max(0, Math.min(1, v))
  return q * q * (3 - 2 * q)
}
export function movieParameters(t: number): Parameters {
  const c = chapterAt(t),
    p = (t - chapters[c].start) / (chapters[c].end - chapters[c].start)
  if (c === 0)
    return { a: 2, x: 1, h: 0.3, n: [1, 2, 4, 12, 365, 10000][Math.min(5, Math.floor(p * 6))] }
  if (c === 1) return { a: 2, x: 1, h: Math.pow(10, -1 - 5 * p), n: 365 }
  if (c === 2) return { a: 2, x: 1, h: 0.3, n: 365 }
  if (c === 3) return { a: 2, x: 1, h: 0.7 * Math.pow(10, -4 * p), n: 365 }
  if (c === 4) return { a: 2 + (Math.E - 2) * smooth(p * 1.8), x: 1, h: 0.0001, n: 365 }
  return { a: Math.E, x: 1 + 2 * smooth(p), h: 0.0001, n: 365 }
}
export function graphPoints(a: number, inverse = false): Vec3[] {
  return Array.from({ length: 220 }, (_, i) => {
    const x = 0.08 + (i / 219) * 6,
      y = logA(x, a)
    return inverse ? [y, x, 0] : [x, y, 0]
  }).filter((p) => Math.abs(p[0]) < 6 && Math.abs(p[1]) < 6) as Vec3[]
}
export function convergencePoints(negative = false): Vec3[] {
  return Array.from({ length: 150 }, (_, i) => {
    const h = (negative ? -1 : 1) * Math.pow(10, -1 - (i / 149) * 6)
    return [
      -Math.log10(Math.abs(h)) - 1,
      (limitExperiment(h) - 2.5) * 10,
      negative ? -0.55 : 0.55,
    ] as Vec3
  })
}
export const cues = [
  {
    start: 0,
    end: 8,
    text: '変化は、私たちのまわりにある。ここでは年利100パーセントという、仮想の成長を考えよう。',
  },
  {
    start: 8,
    end: 18,
    text: '利息を一年に何回も組み入れる。1回、2回、365回。増え方は変わるが、限りなく大きくはならない。',
  },
  {
    start: 18,
    end: 27,
    text: '分割を細かくすることを、hをゼロへ近づける実験に置き換える。正の側と、負の側。',
  },
  {
    start: 27,
    end: 36,
    text: '光点は同じ値に近づく。ただしhがゼロの式は未定義。ゼロを代入したのではない。',
  },
  {
    start: 36,
    end: 48,
    text: '成長を座標へ移そう。指数関数と対数関数は逆関数。平面の曲線を、立体の視点から見つめる。',
  },
  {
    start: 48,
    end: 56,
    text: '対数曲線上の二点を結ぶ割線。二点を近づけると、一本の接線が見えてくる。',
  },
  {
    start: 56,
    end: 64,
    text: 'xが1の場所で、底を変えると接線の傾きも変わる。傾きが1になる底を探そう。',
  },
  {
    start: 64,
    end: 76,
    text: 'その特別な底が、ネイピア数、イー。極限として定まる数で、2.718は近似値。複利の極限とも一致する。',
  },
  {
    start: 76,
    end: 90,
    text: 'この底の対数を自然対数という。その微分は、x分の1。点を動かし、傾きの変化を確かめよう。続きは、あなたの実験で。',
  },
] as const
export function cueAt(t: number) {
  return cues.find((c) => t >= c.start && t < c.end)?.text || ''
}
