export type Point = { x: number; y: number }
export type GridLine = { key: string; a: number; b: number; c: number; points: Point[] }

export const gridPoints: Point[] = Array.from({ length: 4 }, (_, y) =>
  Array.from({ length: 5 }, (_, x) => ({ x, y })),
).flat()

export function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

export function lineThrough(p: Point, q: Point): Omit<GridLine, 'points'> {
  let a = q.y - p.y
  let b = p.x - q.x
  let c = -(a * p.x + b * p.y)
  const divisor = gcd(gcd(a, b), c) || 1
  a /= divisor; b /= divisor; c /= divisor
  if (a < 0 || (a === 0 && b < 0)) { a *= -1; b *= -1; c *= -1 }
  return { key: `${a},${b},${c}`, a, b, c }
}

export function areCollinear(p: Point, q: Point, r: Point) {
  return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x) === 0
}

export function findMaximalLines(points: Point[] = gridPoints): GridLine[] {
  const candidates = new Map<string, Omit<GridLine, 'points'>>()
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
    const line = lineThrough(points[i], points[j]); candidates.set(line.key, line)
  }
  return [...candidates.values()].map(line => ({
    ...line, points: points.filter(p => line.a * p.x + line.b * p.y + line.c === 0),
  })).filter(line => line.points.length >= 3)
}

export const linesBySize = (size: 3 | 4 | 5) => findMaximalLines()
  .filter(line => line.points.length === size)
  // In the four-point lesson, show the five originally drawn columns first.
  .sort((left, right) => Number(right.b === 0) - Number(left.b === 0) || left.key.localeCompare(right.key))
export const choose = (n: number, r: number) => {
  if (r < 0 || r > n) return 0
  let result = 1
  for (let i = 1; i <= r; i++) result = result * (n - r + i) / i
  return result
}
