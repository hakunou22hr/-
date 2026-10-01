import { describe, expect, it } from 'vitest'
import { countShortestPaths, countPathsViaPoint, countPathsAvoidPoint, generateShortestRoutes } from './math.js'

describe('最短経路の数学処理', () => {
  it('基本問題は35通り', () => expect(countShortestPaths(4, 3)).toBe(35n))
  it('練習問題の値を計算する', () => {
    const a={x:0,y:0}, c={x:2,y:1}, b={x:5,y:3}
    expect(countShortestPaths(5,3)).toBe(56n)
    expect(countShortestPaths(2,1)).toBe(3n)
    expect(countShortestPaths(3,2)).toBe(10n)
    expect(countPathsViaPoint(a,c,b)).toBe(30n)
    expect(countPathsAvoidPoint(a,c,b)).toBe(26n)
  })
  it('35経路は重複せず、右4・上3でBに着く', () => {
    const routes=generateShortestRoutes(4,3)
    expect(routes).toHaveLength(35)
    expect(new Set(routes).size).toBe(35)
    for(const route of routes){
      expect(route).toHaveLength(7)
      expect(route.match(/R/g)).toHaveLength(4)
      expect(route.match(/U/g)).toHaveLength(3)
    }
  })
})
