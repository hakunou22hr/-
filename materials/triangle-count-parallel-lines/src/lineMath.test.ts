import { describe, expect, it } from 'vitest'
import { areCollinear, choose, gridPoints, linesBySize } from './lineMath'

describe('5 × 4 grid line mathematics', () => {
  it('has 20 intersections and 20C3 = 1140', () => {
    expect(gridPoints).toHaveLength(20)
    expect(choose(20, 3)).toBe(1140)
  })
  it.each([[5, 4], [4, 9], [3, 8]] as const)('finds %i-point maximal lines', (size, count) => {
    expect(linesBySize(size)).toHaveLength(count)
  })
  it('computes every exclusion and the final answer', () => {
    expect(choose(5, 3) * 4).toBe(40)
    expect(choose(4, 3) * 9).toBe(36)
    expect(choose(3, 3) * 8).toBe(8)
    expect(choose(20, 3) - 40 - 36 - 8).toBe(1056)
  })
  it('judges arbitrary triples by their cross product', () => {
    expect(areCollinear({ x: 0, y: 0 }, { x: 2, y: 1 }, { x: 4, y: 2 })).toBe(true)
    expect(areCollinear({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 })).toBe(false)
  })
})
