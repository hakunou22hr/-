import { describe, expect, it } from 'vitest'
import { exactValue, trig } from './math'

describe('三角比の計算', () => {
  it.each([[0,0,1],[30,.5,Math.sqrt(3)/2],[45,Math.sqrt(2)/2,Math.sqrt(2)/2],[60,Math.sqrt(3)/2,.5],[90,1,0],[120,Math.sqrt(3)/2,-.5],[150,.5,-Math.sqrt(3)/2],[180,0,-1]])('%i°を正しく計算する', (a,s,c) => { expect(trig(a).sin).toBeCloseTo(s); expect(trig(a).cos).toBeCloseTo(c) })
  it('90°のtanを定義しない',()=>expect(trig(90).tan).toBeNull())
  it('代表角の正確な値を持つ',()=>{expect(exactValue(30,'sin')).toBe('1/2');expect(exactValue(150,'sin')).toBe('1/2')})
})
