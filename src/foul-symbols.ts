export const foulSymbolRules = {
  Personal: 'P', Shooting: 'P', Offensive: 'P', Technical: 'T',
  Unsportsmanlike: 'U', Disqualifying: 'D',
} as const
export type FoulKind = keyof typeof foulSymbolRules
export const starterMark = '×'
