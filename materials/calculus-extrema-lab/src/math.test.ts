import { describe, expect, it } from 'vitest'
import { polynomial, polynomialCritical, polynomialDerivative, polynomialSign, trigonometric, trigonometricCritical, trigonometricDerivative, trigonometricSign } from './math'

describe('極値探究の数学モデル', () => {
  it('多項式の臨界点、符号、極値が正しい', () => {
    polynomialCritical.forEach((x) => expect(polynomialDerivative(x)).toBeCloseTo(0))
    expect([-2, -.5, 1, 3].map(polynomialSign)).toEqual(['−', '＋', '−', '＋'])
    expect(polynomialCritical.map(polynomial)).toEqual([-4, 1, -31])
  })
  it('三角関数の臨界点、符号、極値が正しい', () => {
    trigonometricCritical.forEach((x) => expect(trigonometricDerivative(x)).toBeCloseTo(0))
    expect([.1, 1, 3].map(trigonometricSign)).toEqual(['＋', '−', '＋'])
    expect(trigonometric(trigonometricCritical[0])).toBeCloseTo(Math.PI / 6 + Math.sqrt(3))
    expect(trigonometric(trigonometricCritical[1])).toBeCloseTo(5 * Math.PI / 6 - Math.sqrt(3))
  })
})
