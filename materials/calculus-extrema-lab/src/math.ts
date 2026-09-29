export const TAU = 2 * Math.PI

export const polynomial = (x: number) => 3 * x ** 4 - 4 * x ** 3 - 12 * x ** 2 + 1
export const polynomialDerivative = (x: number) => 12 * x * (x - 2) * (x + 1)
export const polynomialCritical = [-1, 0, 2] as const

export const trigonometric = (x: number) => x + 2 * Math.cos(x)
export const trigonometricDerivative = (x: number) => 1 - 2 * Math.sin(x)
export const trigonometricCritical = [Math.PI / 6, 5 * Math.PI / 6] as const

export type Sign = '−' | '0' | '＋'
export const derivativeSign = (value: number, epsilon = 1e-7): Sign =>
  Math.abs(value) < epsilon ? '0' : value > 0 ? '＋' : '−'

export const polynomialSign = (x: number) => derivativeSign(polynomialDerivative(x))
export const trigonometricSign = (x: number) => derivativeSign(trigonometricDerivative(x))
