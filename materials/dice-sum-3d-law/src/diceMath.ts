export type DiceTriple = readonly [number, number, number]

export function generateOrderedTriples(): DiceTriple[] {
  return Array.from({ length: 216 }, (_, index) => [
    Math.floor(index / 36) + 1,
    Math.floor(index / 6) % 6 + 1,
    index % 6 + 1,
  ] as DiceTriple)
}

export function toUnorderedRepresentative(triple: DiceTriple): DiceTriple {
  return [...triple].sort((a, b) => a - b) as unknown as DiceTriple
}

export function generateUnorderedTriples(): DiceTriple[] {
  return generateOrderedTriples().filter(([a, b, c]) => a <= b && b <= c)
}

export const sumOf = (triple: DiceTriple) => triple.reduce((sum, value) => sum + value, 0)
export const triplesWithSum = (sum: number) => generateUnorderedTriples().filter((triple) => sumOf(triple) === sum)
export const relevantMultiplesOfSeven = () => [7, 14]
export const countWinningTriples = () => relevantMultiplesOfSeven().reduce((count, sum) => count + triplesWithSum(sum).length, 0)
export const formatTriple = (triple: DiceTriple) => `{${triple.join(', ')}}`
