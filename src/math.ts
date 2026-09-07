export type TrigName = 'sin' | 'cos' | 'tan'

export const trig = (angle: number) => {
  const rad = angle * Math.PI / 180
  return { sin: Math.sin(rad), cos: Math.cos(rad), tan: Math.tan(rad) }
}
