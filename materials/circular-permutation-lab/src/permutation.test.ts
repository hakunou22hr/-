import { describe, expect, it } from 'vitest'
import { factorial, permutation, reflectAcrossYAxis, sameCircular, sameNecklace } from './permutation'
describe('順列の同値判定', () => {
  const a = [1,2,3,4,5]
  it('巡回シフトだけを円順列として同一視する', () => {
    expect(sameCircular(a, [2,3,4,5,1])).toBe(true)
    expect(sameCircular(a, [1,5,4,3,2])).toBe(false)
  })
  it('じゅず順列では反転も同一視する', () => expect(sameNecklace(a, [1,5,4,3,2])).toBe(true))
  it('y軸反転では上下を保ち、左右と巡回方向だけを反転する', () => {
    const six = [5,6,1,2,3,4]
    const reflected = reflectAcrossYAxis(six)
    expect(reflected).toEqual([5,4,3,2,1,6])
    expect(reflectAcrossYAxis(reflected)).toEqual(six)
    expect(sameNecklace(six, reflected)).toBe(true)
  })
  it('教材内の数を正しく計算する', () => {
    expect(factorial(5)/5).toBe(24); expect(factorial(4)/2).toBe(12); expect(permutation(5,3)/3).toBe(20)
  })
})
