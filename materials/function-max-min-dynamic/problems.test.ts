import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

type Problem = {
  critical: number[]
  points: number[]
  f: (x: number) => number
  df: (x: number) => number
}

// The teaching app is deliberately framework-free. Read its exported configuration so
// these checks exercise the same functions that drive both canvases and the answer cards.
const source = readFileSync(new URL('./script.js', import.meta.url), 'utf8')
const literal = source.match(/export const problems = (\{[\s\S]*?\n\});\nconst content/)?.[1]
if (!literal) throw new Error('problem configuration could not be read')
const problems = Function(`return (${literal})`)() as Record<string, Problem>

const near = (actual: number, expected: number) => expect(actual).toBeCloseTo(expected, 10)

describe('function maximum/minimum teaching data', () => {
  it('validates example 13', () => {
    const p = problems.ex13
    expect(p.critical).toEqual([4])
    near(p.f(0), 0); near(p.f(4), -4); near(p.f(25), 5)
  })

  it('validates example 14', () => {
    const p = problems.ex14
    expect(p.critical).toEqual([-2, 0])
    near(p.f(-3), 9 / Math.E ** 3); near(p.f(-2), 4 / Math.E ** 2)
    near(p.f(0), 0); near(p.f(1), Math.E)
  })

  it('validates exercises 31 and 32', () => {
    const a = problems.p31a, b = problems.p31b, c = problems.p32
    near(a.f(-1), -3 / Math.E); near(a.f(1), -Math.E); near(a.f(2), 0)
    near(b.f(0), 0); near(b.f(1), 1); near(b.f(2), 2 * Math.SQRT2 - 2)
    near(c.f(0), 0); near(c.f(Math.PI / 2), 3)
    near(c.f(3 * Math.PI / 2), -1); near(c.f(2 * Math.PI), 0)
    expect([a.critical, b.critical, c.critical]).toEqual([[1], [1], [Math.PI / 2, 3 * Math.PI / 2]])
  })
})
