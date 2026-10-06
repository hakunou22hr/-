export type AomoriHighWin = {
  id: string
  city: string
  shop: string
  lottery: string
  fiscalYear: number
  issueNumber?: number
  prizeRank: string
  prizeAmount: number
  sourceName: string
  sourceUrl: string
  checkedAt: string
  x: number
  y: number
}

const archive2023 = 'https://www.takarakuji-official.jp/special/kougaku-tousen/archive/archive2023/'
const currentOfficial = 'https://www.takarakuji-official.jp/special/kougaku-tousen/'

/** 宝くじ公式サイトの売り場別高額当せん情報で確認できたレコードだけを収録。 */
export const aomoriWins: AomoriHighWin[] = [
  { id: 'tsugaru-2023', city: 'つがる市', shop: 'イオンモールつがる柏チャンスセンター', lottery: '年末ジャンボ', fiscalYear: 2023, issueNumber: 984, prizeRank: '1等', prizeAmount: 700_000_000, sourceName: '宝くじ公式サイト 2023年度高額当せん情報', sourceUrl: archive2023, checkedAt: '2026-10-06', x: 31, y: 43 },
  { id: 'towada-2023', city: '十和田市', shop: 'トライアル十和田店吉金宝くじBOX', lottery: '年末ジャンボ', fiscalYear: 2023, issueNumber: 984, prizeRank: '1等', prizeAmount: 700_000_000, sourceName: '宝くじ公式サイト 2023年度高額当せん情報', sourceUrl: archive2023, checkedAt: '2026-10-06', x: 67, y: 69 },
  { id: 'hirosaki-2023', city: '弘前市', shop: 'ユニバース城東店', lottery: 'バレンタインジャンボミニ', fiscalYear: 2023, prizeRank: '1等', prizeAmount: 20_000_000, sourceName: '宝くじ公式サイト 2023年度高額当せん情報', sourceUrl: archive2023, checkedAt: '2026-10-06', x: 38, y: 62 },
  { id: 'hirakawa-2023', city: '平川市', shop: '平賀イオンタウンチャンスセンター', lottery: '年末ジャンボミニ', fiscalYear: 2023, issueNumber: 985, prizeRank: '1等', prizeAmount: 30_000_000, sourceName: '宝くじ公式サイト 2023年度高額当せん情報', sourceUrl: archive2023, checkedAt: '2026-10-06', x: 45, y: 68 },
  { id: 'mutsu-2026', city: 'むつ市', shop: 'マエダストアむつ中央チャンスセンター', lottery: 'サマージャンボプレミアム', fiscalYear: 2026, issueNumber: 1114, prizeRank: '2等', prizeAmount: 100_000_000, sourceName: '宝くじ公式サイト 2026年度高額当せん情報', sourceUrl: currentOfficial, checkedAt: '2026-10-06', x: 67, y: 28 },
]

export const allJumbo = [{ year: 2020, count: 1 }, { year: 2021, count: 3 }]

/** 後方互換：教材全体の出典モーダルが参照する2023年度公式ページ。 */
export const source = archive2023
