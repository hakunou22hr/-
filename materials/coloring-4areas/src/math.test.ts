import { describe, expect, it } from 'vitest'
import { ADJACENT, generatePatterns } from './math'

describe('塗り分けの全探索', () => {
  it.each([[1, 24], [2, 72]] as const)('問題%iは%i通りで、重複がない', (problem, count) => {
    const patterns = generatePatterns(problem)
    expect(patterns).toHaveLength(count)
    expect(new Set(patterns.map(p => JSON.stringify(p))).size).toBe(count)
  })
  it('問題1は全領域が異なる', () => {
    expect(generatePatterns(1).every(p => new Set(Object.values(p)).size === 4)).toBe(true)
  })
  it('問題2はすべての隣接条件を守る', () => {
    expect(generatePatterns(2).every(p => ADJACENT.every(([a,b]) => p[a] !== p[b]))).toBe(true)
  })
})
