export const rotations = <T,>(items: T[]): T[][] => items.map((_, i) => [...items.slice(i), ...items.slice(0, i)])
export const sameCircular = <T,>(a: T[], b: T[]) => a.length === b.length && rotations(a).some(r => r.every((v, i) => v === b[i]))
export const sameNecklace = <T,>(a: T[], b: T[]) => sameCircular(a, b) || sameCircular([...a].reverse(), b)
// Index 0 is at 12 o'clock; reversing the rest maps (x, y) to (-x, y).
export const reflectAcrossYAxis = <T,>(items: T[]): T[] => items.length < 2
  ? [...items]
  : [items[0], ...items.slice(1).reverse()]
export const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1)
export const permutation = (n: number, r: number) => factorial(n) / factorial(n - r)
