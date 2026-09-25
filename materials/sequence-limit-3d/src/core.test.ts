import {describe,expect,it} from 'vitest'
import {problems} from './core'
describe('sequence limit problems',()=>{
 it('contains all six questions',()=>expect(problems).toHaveLength(6))
 it.each([['2-1',0],['2-3',.5],['2-4',0],['2-5',-.5],['2-6',5/3]])('%s approaches its finite limit',(id,limit)=>{const p=problems.find(x=>x.id===id)!; expect(p.values(1e7)[2]).toBeCloseTo(limit,5)})
 it('keeps each derivation tied to its own problem data',()=>{
  for(const problem of problems){
   expect(problem.derivation[0].latex).toContain(problem.formulaLatex.replace('\\displaystyle','').trim())
   expect(problem.derivation.at(-1)?.final).toBe(true)
  }
  expect(problems[0].derivation.map(step=>step.latex).join(' ')).not.toContain('n^3')
 })
 it('question 2-2 diverges upward',()=>{const p=problems[1];expect(p.values(1000)[2]).toBeGreaterThan(p.values(100)[2])})
})
