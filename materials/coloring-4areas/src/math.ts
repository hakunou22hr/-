export const COLORS = ['red', 'blue', 'yellow', 'white'] as const
export type Color = typeof COLORS[number]
export type Region = 'A' | 'B' | 'C' | 'D'
export type Coloring = Record<Region, Color>

export const ADJACENT: [Region, Region][] = [['A', 'B'], ['A', 'C'], ['B', 'C'], ['C', 'D']]

/** 4^4 通りを実際に生成し、問題の条件で絞り込む。 */
export function generatePatterns(problem: 1 | 2): Coloring[] {
  const result: Coloring[] = []
  for (const A of COLORS) for (const B of COLORS) for (const C of COLORS) for (const D of COLORS) {
    const item = { A, B, C, D }
    const valid = problem === 1
      ? new Set(Object.values(item)).size === 4
      : ADJACENT.every(([x, y]) => item[x] !== item[y])
    if (valid) result.push(item)
  }
  return result
}

export const hasViolation = (coloring: Partial<Coloring>) =>
  ADJACENT.find(([a, b]) => coloring[a] && coloring[a] === coloring[b])
