import{describe,it,expect}from'vitest'
import{answer,inequalityVisual,parseInequality,solve}from'./math'
const p=(text:string)=>parseInequality(text)!
describe('compound inequalities',()=>{
 it('parses ASCII and unicode',()=>{expect(p('x >= -2')).toEqual({op:'>=',value:-2});expect(p('x ≤ 1.5')).toEqual({op:'<=',value:1.5})})
 it.each([
  ['x > 1','open','right'],['x >= 1','closed','right'],
  ['x < 5','open','left'],['x <= 5','closed','left'],
 ] as const)('%s draws a %s endpoint toward the %s',(text,endpoint,direction)=>{
  expect(inequalityVisual(p(text))).toMatchObject({endpoint,direction})
 })
 it('specifically sends x < 5 left from 5',()=>expect(inequalityVisual(p('x < 5'))).toEqual({boundary:5,endpoint:'open',direction:'left'}))
 it('finds 1 < x < 5',()=>expect(answer(solve([p('x>1'),p('x<5')]))).toBe('1 < x < 5'))
 it('finds the single point x = 1',()=>expect(answer(solve([p('x>=1'),p('x<=1')]))).toBe('x = 1'))
 it('finds no solution',()=>expect(answer(solve([p('x<-2'),p('x>3')]))).toBe('解なし'))
})
