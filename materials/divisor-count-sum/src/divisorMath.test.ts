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
    for (const prime of [13, 17, 23, 97]) expect(isPrime(prime)).toBe(true)
    expect(divideByPrime(360, 2)).toBe(180); expect(divideByPrime(45, 2)).toBeNull()
    for (const prime of [13, 17, 23]) expect(divideByPrime(prime, prime)).toBe(1)
  })
  it.each([
    [26, '2 × 13'],
    [34, '2 × 17'],
    [39, '3 × 13'],
    [46, '2 × 23'],
    [77, '7 × 11'],
    [97, '97'],
  ] as const)('%iを大きな素因数まで正しく素因数分解する', (n, formatted) => {
    expect(formatPrimeFactorization(primeFactorization(n))).toBe(formatted)
  })
  it('不正な自然数を拒否する', () => {
    expect(() => primeFactorization(0)).toThrow(); expect(() => primeFactorization(2.5)).toThrow()
  })
})
