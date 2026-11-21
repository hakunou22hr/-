import { describe, it, expect } from 'vitest'
import {
  compound,
  limitExperiment,
  derivative,
  secant,
  logA,
  graphPoints,
  chapters,
  cues,
  movieParameters,
  chapterAt,
} from './model'
describe('shared numerical model', () => {
  it('compounds monotonically toward e without overflow', () => {
    let prev = 0
    for (const n of [1, 2, 4, 12, 365, 10000, 1e12]) {
      const v = compound(n)
      expect(v).toBeGreaterThan(prev)
      expect(v).toBeLessThanOrEqual(Math.E)
      prev = v
    }
    expect(prev).toBeCloseTo(Math.E, 10)
  })
  it('approaches e from both sides with stable log1p', () => {
    for (const h of [1e-2, 1e-5, 1e-9, 1e-12]) {
      expect(limitExperiment(h)).toBeLessThanOrEqual(Math.E)
      expect(limitExperiment(-h)).toBeGreaterThanOrEqual(Math.E)
      expect(limitExperiment(h)).toBeCloseTo(Math.E, Math.max(1, -Math.log10(h) - 1))
    }
    expect(limitExperiment(0)).toBeNaN()
    expect(limitExperiment(-1)).toBeNaN()
  })
  it('synchronizes base, x and the true tangent; both signed secants converge', () => {
    for (const a of [0.5, 2, Math.E, 10])
      for (const x of [0.2, 1, 3]) {
        for (const h of [-1e-8, 1e-8]) expect(secant(x, h, a)).toBeCloseTo(derivative(x, a), 5)
      }
    expect(derivative(1, Math.E)).toBeCloseTo(1, 14)
    expect(derivative(2, Math.E)).toBeCloseTo(0.5, 14)
    expect(derivative(1, 1)).toBeNaN()
    expect(secant(1, -1, 2)).toBeNaN()
  })
  it('keeps inverse graphs in the same mathematical plane', () => {
    const normal = graphPoints(2),
      inverse = graphPoints(2, true)
    expect(normal.length).toBe(inverse.length)
    normal.forEach((p, i) => {
      expect(p[2]).toBe(0)
      expect(inverse[i]).toEqual([p[1], p[0], 0])
      expect(Math.pow(2, logA(p[0], 2))).toBeCloseTo(p[0], 10)
    })
  })
  it('covers exactly 2700 frames and has contiguous narration cues', () => {
    expect(chapters[5].end).toBe(90)
    for (let i = 1; i < chapters.length; i++) expect(chapters[i].start).toBe(chapters[i - 1].end)
    for (let i = 1; i < cues.length; i++) expect(cues[i].start).toBe(cues[i - 1].end)
    for (let f = 0; f < 2700; f++) {
      const p = movieParameters(f / 30)
      expect(Number.isFinite(derivative(p.x, p.a))).toBe(true)
      expect(chapterAt(f / 30)).toBeGreaterThanOrEqual(0)
    }
  })
})
