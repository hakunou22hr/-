export const TAU = 2 * Math.PI

/** Maps a mathematical coordinate to the percentage used by a horizontal scale. */
export const rangePositionPercent = (value: number, start: number, end: number) =>
  ((value - start) / (end - start)) * 100

export const polynomial = (x: number) => 3 * x ** 4 - 4 * x ** 3 - 12 * x ** 2 + 1
export const polynomialDerivative = (x: number) => 12 * x * (x - 2) * (x + 1)
export const polynomialCritical = [-1, 0, 2] as const

export const trigonometric = (x: number) => x + 2 * Math.cos(x)
export const trigonometricDerivative = (x: number) => 1 - 2 * Math.sin(x)
export const trigonometricCritical = [Math.PI / 6, 5 * Math.PI / 6] as const

export type Sign = '−' | '0' | '＋'
export type DerivativeState = 'negative' | 'zero' | 'positive'
export type Movement = '増加' | '減少' | '極値の候補'
export const derivativeSign = (value: number, epsilon = 1e-7): Sign =>
  Math.abs(value) < epsilon ? '0' : value > 0 ? '＋' : '−'

export const polynomialSign = (x: number) => derivativeSign(polynomialDerivative(x))
export const trigonometricSign = (x: number) => derivativeSign(trigonometricDerivative(x))

/** The single source of truth used by every synchronized trigonometric view. */
export const trigonometricState = (x: number, epsilon = 1e-3): DerivativeState => {
  const derivative = trigonometricDerivative(x)
  if (Math.abs(derivative) < epsilon) return 'zero'
  return derivative > 0 ? 'positive' : 'negative'
}

export type TrigonometricSnapshot = {
  x: number
  sine: number
  twiceSine: number
  derivative: number
  state: DerivativeState
  movement: Movement
  comparison: 'above' | 'equal' | 'below'
  extremum: 'maximum' | 'minimum' | null
}

/** One calculation supplies every visual and textual view in the synchronized mode. */
export const getTrigonometricSnapshot = (x: number, epsilon = 1e-3): TrigonometricSnapshot => {
  const sine = Math.sin(x)
  const derivative = 1 - 2 * sine
  const state: DerivativeState = Math.abs(derivative) < epsilon
    ? 'zero'
    : derivative > 0 ? 'positive' : 'negative'
  const nearAngle = (angle: number) => Math.abs(x - angle) < epsilon

  return {
    x,
    sine,
    twiceSine: 2 * sine,
    derivative,
    state,
    movement: state === 'positive' ? '増加' : state === 'negative' ? '減少' : '極値の候補',
    comparison: state === 'zero' ? 'equal' : sine > .5 ? 'above' : 'below',
    extremum: nearAngle(trigonometricCritical[0]) ? 'maximum'
      : nearAngle(trigonometricCritical[1]) ? 'minimum' : null,
  }
}

export const trigonometricIntervals = [
  { start: 0, end: Math.PI / 6, state: 'positive' },
  { start: Math.PI / 6, end: 5 * Math.PI / 6, state: 'negative' },
  { start: 5 * Math.PI / 6, end: TAU, state: 'positive' },
] as const satisfies readonly { start: number; end: number; state: DerivativeState }[]
