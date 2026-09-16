import { describe, expect, it } from 'vitest'
import { countWinningTriples, formatTriple, generateOrderedTriples, generateUnorderedTriples, relevantMultiplesOfSeven, sumOf, toUnorderedRepresentative, triplesWithSum } from './diceMath'

const seven = [[1,1,5],[1,2,4],[1,3,3],[2,2,3]]
const fourteen = [[2,6,6],[3,5,6],[4,4,6],[4,5,5]]

describe('dice combinations', () => {
  it('generates all ordered and 56 unordered triples', () => {
    expect(generateOrderedTriples()).toHaveLength(216)
    const triples = generateUnorderedTriples()
    expect(triples).toHaveLength(56)
    expect(triples.every(([a,b,c]) => a <= b && b <= c)).toBe(true)
  })
  it('finds the four combinations whose sum is 7', () => expect(triplesWithSum(7)).toEqual(seven))
  it('finds the four combinations whose sum is 14', () => expect(triplesWithSum(14)).toEqual(fourteen))
  it('counts eight winning combinations', () => expect(countWinningTriples()).toBe(8))
  it('has minimum sum 3 and maximum sum 18', () => {
    const sums = generateOrderedTriples().map(sumOf)
    expect(Math.min(...sums)).toBe(3); expect(Math.max(...sums)).toBe(18)
  })
  it('uses only 7 and 14 as multiples of seven', () => expect(relevantMultiplesOfSeven()).toEqual([7,14]))
  it('normalizes ordered triples', () => {
    expect(toUnorderedRepresentative([4,1,2])).toEqual([1,2,4])
    expect(toUnorderedRepresentative([6,2,6])).toEqual([2,6,6])
  })
  it('formats an accessible label', () => expect(formatTriple([1,2,4])).toBe('{1, 2, 4}'))
})
