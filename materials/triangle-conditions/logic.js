export const isTriangle = x => x > 1 && x < 7
export const isAcute = x => isTriangle(x) && x > Math.sqrt(7) && x < 5
export const maxSideCase = x => x <= 4 ? 1 : 2
