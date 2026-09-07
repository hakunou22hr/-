import { describe, expect, it } from 'vitest'
import { trig } from './math'

describe('直角三角形の三角比', () => {
  it.each([[30,.5,Math.sqrt(3)/2,1/Math.sqrt(3)],[45,Math.sqrt(2)/2,Math.sqrt(2)/2,1],[60,Math.sqrt(3)/2,.5,Math.sqrt(3)]])('%i°を正しく計算する', (angle,sin,cos,tan) => {
    const value = trig(angle)
    expect(value.sin).toBeCloseTo(sin)
    expect(value.cos).toBeCloseTo(cos)
    expect(value.tan).toBeCloseTo(tan)
  })
})
