import { describe, expect, it } from 'vitest'
import { jumboData } from './data/yearEndJumbo'
import { aomoriWins } from './data/aomoriHighWins'
import { atLeast, expectedValue, highCount } from './core'

describe('年末ジャンボ公式データの計算', () => {
  it('2020〜2025年は各年とも期待払戻額が約149.995円', () => {
    jumboData.forEach(data => expect(expectedValue(data)).toBeCloseTo(149.995, 3))
  })
  it('3枚購入の期待払戻額と期待損益', () => {
    const expected = expectedValue(jumboData[5]) * 3
    expect(expected).toBeCloseTo(449.985, 3)
    expect(expected - 900).toBeCloseTo(-450.015, 3)
  })
  it('1等と少なくとも1回の確率', () => {
    expect(jumboData[0].prizes[0].count / jumboData[0].totalTickets).toBe(1 / 20_000_000)
    expect(atLeast(1 / 20_000_000, 3)).toBeCloseTo(1 - (1 - 1 / 20_000_000) ** 3, 15)
  })
  it('100万円以上の本数', () => {
    expect(highCount(jumboData[3], 1_000_000)).toBe(9_453)
    expect(highCount(jumboData[5], 1_000_000)).toBe(1_104)
  })
  it('青森県の確認済みスポットは出典情報を持つ', () => {
    expect(aomoriWins).toHaveLength(5)
    expect(aomoriWins.filter(x => x.lottery === '年末ジャンボ' && x.fiscalYear === 2023)).toHaveLength(2)
    expect(aomoriWins.map(x => x.city)).toEqual(['つがる市', '十和田市', '弘前市', '平川市', 'むつ市'])
    aomoriWins.forEach(win => {
      expect(win.sourceUrl).toMatch(/^https:\/\/www\.takarakuji-official\.jp\//)
      expect(win.checkedAt).toBe('2026-10-06')
    })
  })
})
