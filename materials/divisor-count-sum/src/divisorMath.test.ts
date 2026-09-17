import { describe, expect, it } from 'vitest'
import { countDivisors, divideByPrime, formatPrimeFactorization, generateDivisors, isPrime, primeFactorization, sumDivisors } from './divisorMath'

describe('divisor mathematics', () => {
  it.each([[360, '2^3 × 3^2 × 5', 24, 1170], [12, '2^2 × 3', 6, 28], [36, '2^2 × 3^2', 9, 91], [100, '2^2 × 5^2', 9, 217]] as const)(
    '%iを正しく処理する', (n, formatted, count, sum) => {
      const factors = primeFactorization(n)
      expect(formatPrimeFactorization(factors)).toBe(formatted)
      expect(countDivisors(factors)).toBe(count)
      expect(sumDivisors(factors)).toBe(sum)
      expect(generateDivisors(factors)).toHaveLength(count)
    },
  )
  it('入力する素数を検証して1回だけ割る', () => {
    expect(isPrime(2)).toBe(true); expect(isPrime(4)).toBe(false)
    expect(divideByPrime(360, 2)).toBe(180); expect(divideByPrime(45, 2)).toBeNull()
  })
  it('不正な自然数を拒否する', () => {
    expect(() => primeFactorization(0)).toThrow(); expect(() => primeFactorization(2.5)).toThrow()
  })
})
