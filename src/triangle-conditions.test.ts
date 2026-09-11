import { describe, expect, it } from 'vitest'
// @ts-expect-error standalone browser module has no declaration file
import { isAcute, isTriangle, maxSideCase } from '../materials/triangle-conditions/logic.js'

describe('3辺が3, 4, xの三角形', () => {
  it.each([[0.9,false],[1,false],[1.1,true],[6.9,true],[7,false],[7.1,false]])('x=%s の成立判定', (x,want) => expect(isTriangle(x)).toBe(want))
  it.each([[Math.sqrt(7),false],[2.7,true],[4,true],[4.9,true],[5,false]])('x=%s の鋭角判定', (x,want) => expect(isAcute(x)).toBe(want))
  it('最大辺を4で場合分けする', () => { expect(maxSideCase(3.9)).toBe(1); expect(maxSideCase(4)).toBe(1); expect(maxSideCase(4.1)).toBe(2) })
})
