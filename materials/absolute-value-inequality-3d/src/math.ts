export const CENTER = -Math.SQRT2
export const RADIUS = 3
export const LEFT = CENTER - RADIUS
export const RIGHT = CENTER + RADIUS
export type Verdict = 'inside' | 'boundary' | 'outside'

export function distanceFromCenter(x: number) { return Math.abs(x - CENTER) }
export function verdict(x: number, epsilon = 0.015): Verdict {
  const distance = distanceFromCenter(x)
  if (Math.abs(distance - RADIUS) <= epsilon) return 'boundary'
  return distance < RADIUS ? 'inside' : 'outside'
}
