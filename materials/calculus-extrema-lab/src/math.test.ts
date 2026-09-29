import { describe, expect, it } from 'vitest'
import { getTrigonometricSnapshot, polynomial, polynomialCritical, polynomialDerivative, polynomialSign, TAU, trigonometric, trigonometricCritical, trigonometricDerivative, trigonometricSign, trigonometricState } from './math'

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
  it('導関数の重要値と全ビュー共通状態を数値検算する', () => {
    const samples = [
      [0, 0, 1, 'positive'], [Math.PI / 6, .5, 0, 'zero'],
      [Math.PI / 2, 1, -1, 'negative'], [2.08, Math.sin(2.08), 1 - 2 * Math.sin(2.08), 'negative'],
      [5 * Math.PI / 6, .5, 0, 'zero'], [Math.PI, 0, 1, 'positive'],
      [3 * Math.PI / 2, -1, 3, 'positive'], [TAU, 0, 1, 'positive'],
    ] as const
    samples.forEach(([x, sine, derivative, state]) => {
      const snapshot = getTrigonometricSnapshot(x)
      expect(Math.sin(x)).toBeCloseTo(sine)
      expect(trigonometricDerivative(x)).toBeCloseTo(derivative)
      expect(trigonometricState(x)).toBe(state)
      expect(snapshot.sine).toBeCloseTo(sine)
      expect(snapshot.derivative).toBeCloseTo(derivative)
      expect(snapshot.state).toBe(state)
      expect(snapshot.movement).toBe(state === 'positive' ? '増加' : state === 'negative' ? '減少' : '極値の候補')
    })
    expect(getTrigonometricSnapshot(Math.PI / 6).extremum).toBe('maximum')
    expect(getTrigonometricSnapshot(5 * Math.PI / 6).extremum).toBe('minimum')
  })
})
