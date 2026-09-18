import { describe, expect, it } from 'vitest'
// @ts-expect-error standalone browser module has no declaration file
import { solve, formatSolution, trig, mathHTML, formatFraction, formatTrigCondition } from '../materials/trig-inequality-semicircle/script.js'

const f=(mode:string,op:string,c:number)=>formatSolution(solve(mode,op,c))
describe('半円上の三角比不等式',()=>{
  it.each([
    ['sin','>',.5,'30° < θ < 150°'],['sin','>=',.5,'30° ≦ θ ≦ 150°'],
    ['sin','<',.5,'0° ≦ θ < 30°， 150° < θ ≦ 180°'],['cos','<=',-.5,'120° ≦ θ ≦ 180°'],
    ['cos','>',0,'0° ≦ θ < 90°'],['tan','>',1,'45° < θ < 90°'],
    ['tan','<=',-1,'90° < θ ≦ 135°'],['tan','<',0,'90° < θ < 180°'],
  ])('%sθ %s %s', (m,o,c,want)=>expect(f(m,o,c)).toBe(want))
  it('90°のtanは未定義',()=>expect(trig('tan',90)).toBeNull())
  it('代表角の値が正しい',()=>{expect(trig('sin',30)).toBeCloseTo(.5);expect(trig('cos',120)).toBeCloseTo(-.5);expect(trig('tan',45)).toBeCloseTo(1)})
  it('分数と根号を共通の縦型分数で表示する',()=>{
    expect(mathHTML('1/2')).toBe(formatFraction('1','2'))
    expect(mathHTML('−√3/2')).toContain('<span class="math-frac"><span>√3</span><span>2</span></span>')
    expect(formatTrigCondition('cos','<=','1/2')).toContain('cosθ ≦ <span class="math-frac">')
  })
})
