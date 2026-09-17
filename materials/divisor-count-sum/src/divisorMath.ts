export type PrimeFactor = { prime: number; exponent: number }

export function isPrime(n: number): boolean {
  if (!Number.isSafeInteger(n) || n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false
  for (let divisor = 3; divisor * divisor <= n; divisor += 2) if (n % divisor === 0) return false
  return true
}

export function primeFactorization(n: number): PrimeFactor[] {
  if (!Number.isSafeInteger(n) || n < 2) throw new RangeError('2以上の整数を指定してください')
  const factors: PrimeFactor[] = []
  let remaining = n
  for (let prime = 2; prime * prime <= remaining; prime += prime === 2 ? 1 : 2) {
    if (remaining % prime !== 0) continue
    let exponent = 0
    while (remaining % prime === 0) { remaining /= prime; exponent++ }
    factors.push({ prime, exponent })
  }
  if (remaining > 1) factors.push({ prime: remaining, exponent: 1 })
  return factors
}

export function divideByPrime(current: number, prime: number): number | null {
  return isPrime(prime) && current % prime === 0 ? current / prime : null
}

export const countDivisors = (factors: PrimeFactor[]) => factors.reduce((total, factor) => total * (factor.exponent + 1), 1)

export const sumDivisors = (factors: PrimeFactor[]) => factors.reduce((total, { prime, exponent }) => {
  let sum = 0
  for (let power = 0; power <= exponent; power++) sum += prime ** power
  return total * sum
}, 1)

export function generateDivisors(factors: PrimeFactor[]): number[] {
  let divisors = [1]
  for (const { prime, exponent } of factors) {
    const next: number[] = []
    for (const divisor of divisors) for (let power = 0; power <= exponent; power++) next.push(divisor * prime ** power)
    divisors = next
  }
  return divisors.sort((a, b) => a - b)
}

export const formatPrimeFactorization = (factors: PrimeFactor[]) => factors
  .map(({ prime, exponent }) => exponent === 1 ? `${prime}` : `${prime}^${exponent}`)
  .join(' × ')
