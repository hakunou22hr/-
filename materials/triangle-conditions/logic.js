export const isTriangle = x => x > 1 && x < 7
export const isAcute = x => isTriangle(x) && x > Math.sqrt(7) && x < 5
export const maxSideCase = x => x <= 4 ? 1 : 2

/** A=(0,0), B=(4,0), AC=3, BC=x としたときの上側の頂点。 */
export const triangleVertex = x => {
  if (!isTriangle(x)) return null
  const u = (3 ** 2 + 4 ** 2 - x ** 2) / (2 * 4)
  return { u, v: Math.sqrt(3 ** 2 - u ** 2) }
}
