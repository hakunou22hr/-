export const values = (x: number) => ({ exp: Math.exp(x), line: 1+x, gap: Math.expm1(x)-x, slope: Math.expm1(x) })
export const tangent = (x:number, t:number) => values(x).gap + values(x).slope*(t-x)
export const logGap = (x:number) => x-Math.log1p(x)
export const logSlope = (x:number) => x/(1+x)
