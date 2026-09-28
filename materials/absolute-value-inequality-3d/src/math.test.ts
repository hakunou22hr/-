import { describe, expect, it } from 'vitest'
import { CENTER, LEFT, RIGHT, distanceFromCenter, verdict } from './math'

describe('absolute value inequality', () => {
  it('uses -sqrt(2) as its center', () => expect(distanceFromCenter(CENTER)).toBe(0))
  it('recognizes the open solution interval', () => {
    expect(verdict(CENTER)).toBe('inside')
    expect(verdict(LEFT)).toBe('boundary')
    expect(verdict(RIGHT)).toBe('boundary')
    expect(verdict(5)).toBe('outside')
  })
})
