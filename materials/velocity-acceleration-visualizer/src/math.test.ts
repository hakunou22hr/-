import { describe, expect, it } from 'vitest'
import { averageVelocity, directionFromVelocity, motions, signs } from './math'
describe('velocity and acceleration models',()=>{
  it('implements example 21',()=>{ expect(motions.ex21.v(1)).toBe(-1); expect(motions.ex21.a(1)).toBe(2); expect(motions.ex21.v(2)).toBe(1) })
  it('implements practice 39',()=>{ expect(motions.p39.v(2)).toBe(4); expect(motions.p39.a(2)).toBe(12) })
  it('implements vertical throws and apexes',()=>{ expect(motions.throw245.v(2.5)).toBe(0); expect(motions.throw245.a(2.5)).toBe(-9.8); expect(motions.throw196.v(2)).toBeCloseTo(0); expect(motions.throw196.a(2)).toBe(-9.8) })
  it('average velocity converges',()=>expect(averageVelocity(motions.ex21,1,.00001)).toBeCloseTo(-1,4))
  it('explains signs',()=>{ expect(signs(-1,2).speed).toBe('速さが減る'); expect(signs(-1,-2).speed).toBe('速さが増える') })
  it('points a vehicle along its velocity and keeps its direction while stopped',()=>{
    expect(directionFromVelocity(3,'left')).toBe('right')
    expect(directionFromVelocity(-3,'right')).toBe('left')
    expect(directionFromVelocity(0,'right')).toBe('right')
    expect(directionFromVelocity(0,'left')).toBe('left')
  })
})
