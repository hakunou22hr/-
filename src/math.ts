export type TrigName = 'sin' | 'cos' | 'tan'

const exact: Record<number, Record<TrigName, string>> = {
  0: { sin: '0', cos: '1', tan: '0' },
  30: { sin: '1/2', cos: '√3/2', tan: '1/√3' },
  45: { sin: '√2/2', cos: '√2/2', tan: '1' },
  60: { sin: '√3/2', cos: '1/2', tan: '√3' },
  90: { sin: '1', cos: '0', tan: '定義されません' },
  120: { sin: '√3/2', cos: '−1/2', tan: '−√3' },
  135: { sin: '√2/2', cos: '−√2/2', tan: '−1' },
  150: { sin: '1/2', cos: '−√3/2', tan: '−1/√3' },
  180: { sin: '0', cos: '−1', tan: '0' },
}

export const trig = (angle: number) => {
  const rad = angle * Math.PI / 180
  const clean = (n: number) => Math.abs(n) < 1e-10 ? 0 : n
  return { sin: clean(Math.sin(rad)), cos: clean(Math.cos(rad)), tan: angle === 90 ? null : clean(Math.tan(rad)) }
}
export const exactValue = (angle: number, name: TrigName) => exact[angle]?.[name]
export const decimal = (value: number) => value.toFixed(3).replace('-0.000', '0.000')
