export type Problem = {
  id: string;
  name: string;
  source: string;
  expanded: string;
  primitive: string;
  derivative: string;
  positiveOnly?: boolean;
  f: (x: number) => number;
  F: (x: number) => number;
  raw: (x: number) => number;
  dF: (x: number) => number;
  terms: { latex: string; fn: (x: number) => number; color: string }[];
};
const log = (x: number) => Math.log(Math.abs(x));
export const problems: Problem[] = [
  {
    id: "e1",
    name: "例題1 (1)",
    source: "\\frac{3x^2+1}{x^3}",
    expanded: "\\frac3x+\\frac1{x^3}",
    primitive: "3\\log|x|-\\frac1{2x^2}",
    derivative: "\\frac3x+x^{-3}=\\frac{3x^2+1}{x^3}",
    f: (x) => 3 / x + 1 / x ** 3,
    F: (x) => 3 * log(x) - 1 / (2 * x * x),
    raw: (x) => (3 * x * x + 1) / x ** 3,
    dF: (x) => 3 / x + 1 / x ** 3,
    terms: [
      { latex: "3/x", fn: (x) => 3 / x, color: "#66cfff" },
      { latex: "1/x^3", fn: (x) => 1 / x ** 3, color: "#bb9dff" },
    ],
  },
  {
    id: "e2",
    name: "例題1 (2)",
    source: "\\frac{(x-2)(x-3)}{x^2}",
    expanded: "1-\\frac5x+\\frac6{x^2}",
    primitive: "x-5\\log|x|-\\frac6x",
    derivative: "1-\\frac5x+\\frac6{x^2}=\\frac{(x-2)(x-3)}{x^2}",
    f: (x) => 1 - 5 / x + 6 / x ** 2,
    F: (x) => x - 5 * log(x) - 6 / x,
    raw: (x) => ((x - 2) * (x - 3)) / x ** 2,
    dF: (x) => 1 - 5 / x + 6 / x ** 2,
    terms: [
      { latex: "1", fn: () => 1, color: "#66cfff" },
      { latex: "-5/x", fn: (x) => -5 / x, color: "#bb9dff" },
      { latex: "6/x^2", fn: (x) => 6 / x ** 2, color: "#ffcd73" },
    ],
  },
  {
    id: "p1",
    name: "練習2 (1)",
    source: "\\frac{x^2-2x+1}{x^3}",
    expanded: "\\frac1x-\\frac2{x^2}+\\frac1{x^3}",
    primitive: "\\log|x|+\\frac2x-\\frac1{2x^2}",
    derivative: "\\frac1x-\\frac2{x^2}+\\frac1{x^3}=\\frac{x^2-2x+1}{x^3}",
    f: (x) => 1 / x - 2 / x ** 2 + 1 / x ** 3,
    F: (x) => log(x) + 2 / x - 1 / (2 * x * x),
    raw: (x) => (x * x - 2 * x + 1) / x ** 3,
    dF: (x) => 1 / x - 2 / x ** 2 + 1 / x ** 3,
    terms: [
      { latex: "1/x", fn: (x) => 1 / x, color: "#66cfff" },
      { latex: "-2/x^2", fn: (x) => -2 / x ** 2, color: "#bb9dff" },
      { latex: "1/x^3", fn: (x) => 1 / x ** 3, color: "#ffcd73" },
    ],
  },
  {
    id: "p2",
    name: "練習2 (2)",
    source: "\\frac{(x^2+1)(x^2+3)}{x^4}",
    expanded: "1+\\frac4{x^2}+\\frac3{x^4}",
    primitive: "x-\\frac4x-\\frac1{x^3}",
    derivative: "1+\\frac4{x^2}+\\frac3{x^4}=\\frac{(x^2+1)(x^2+3)}{x^4}",
    f: (x) => 1 + 4 / x ** 2 + 3 / x ** 4,
    F: (x) => x - 4 / x - 1 / x ** 3,
    raw: (x) => ((x * x + 1) * (x * x + 3)) / x ** 4,
    dF: (x) => 1 + 4 / x ** 2 + 3 / x ** 4,
    terms: [
      { latex: "1", fn: () => 1, color: "#66cfff" },
      { latex: "4/x^2", fn: (x) => 4 / x ** 2, color: "#bb9dff" },
      { latex: "3/x^4", fn: (x) => 3 / x ** 4, color: "#ffcd73" },
    ],
  },
  {
    id: "p3",
    name: "練習2 (3)",
    source: "\\frac{x-3}{\\sqrt{x}}",
    expanded: "x^{1/2}-3x^{-1/2}",
    primitive: "\\frac23x^{3/2}-6\\sqrt{x}",
    derivative: "x^{1/2}-3x^{-1/2}=\\frac{x-3}{\\sqrt{x}}",
    positiveOnly: true,
    f: (x) => Math.sqrt(x) - 3 / Math.sqrt(x),
    F: (x) => (2 / 3) * x ** 1.5 - 6 * Math.sqrt(x),
    raw: (x) => (x - 3) / Math.sqrt(x),
    dF: (x) => Math.sqrt(x) - 3 / Math.sqrt(x),
    terms: [
      { latex: "x^{1/2}", fn: (x) => Math.sqrt(x), color: "#66cfff" },
      { latex: "-3x^{-1/2}", fn: (x) => -3 / Math.sqrt(x), color: "#bb9dff" },
    ],
  },
  {
    id: "log",
    name: "基本探究 1/x",
    source: "\\frac1x",
    expanded: "x^{-1}",
    primitive: "\\log|x|",
    derivative: "\\frac1x",
    f: (x) => 1 / x,
    F: log,
    raw: (x) => 1 / x,
    dF: (x) => 1 / x,
    terms: [],
  },
];
export const valid = (p: Problem, x: number) =>
  Number.isFinite(x) && x !== 0 && (!p.positiveOnly || x > 0);
export const sameInterval = (p: Problem, a: number, x: number) =>
  valid(p, a) && valid(p, x) && Math.sign(a) === Math.sign(x);
export function area(p: Problem, a: number, x: number) {
  return sameInterval(p, a, x) ? p.F(x) - p.F(a) : NaN;
}
export function interval(
  side: number,
  near: boolean = false,
): [number, number] {
  const epsilon = near ? 0.015 : 0.15;
  return side > 0 ? [epsilon, 6] : [-6, -epsilon];
}
export function samples(
  fn: (x: number) => number,
  lo: number,
  hi: number,
  n = 240,
) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = lo + ((hi - lo) * i) / n;
    return [x, fn(x)] as [number, number];
  });
}
export function derivativeNumeric(p: Problem, x: number) {
  const h = Math.min(1e-5 * Math.max(1, Math.abs(x)), Math.abs(x) / 100);
  return (p.F(x + h) - p.F(x - h)) / (2 * h);
}
export const fmt = (v: number) =>
  Number.isFinite(v)
    ? Math.abs(v) > 1e5
      ? v.toExponential(3)
      : v.toFixed(3)
    : "未定義";
export const primitiveTerms: Record<
  string,
  { latex: string; fn: (x: number) => number; color: string }[]
> = {
  e1: [
    { latex: "3\\log|x|", fn: (x) => 3 * log(x), color: "#66cfff" },
    { latex: "-1/(2x^2)", fn: (x) => -1 / (2 * x * x), color: "#bb9dff" },
  ],
  e2: [
    { latex: "x", fn: (x) => x, color: "#66cfff" },
    { latex: "-5\\log|x|", fn: (x) => -5 * log(x), color: "#bb9dff" },
    { latex: "-6/x", fn: (x) => -6 / x, color: "#ffcd73" },
  ],
  p1: [
    { latex: "\\log|x|", fn: log, color: "#66cfff" },
    { latex: "2/x", fn: (x) => 2 / x, color: "#bb9dff" },
    { latex: "-1/(2x^2)", fn: (x) => -1 / (2 * x * x), color: "#ffcd73" },
  ],
  p2: [
    { latex: "x", fn: (x) => x, color: "#66cfff" },
    { latex: "-4/x", fn: (x) => -4 / x, color: "#bb9dff" },
    { latex: "-1/x^3", fn: (x) => -1 / x ** 3, color: "#ffcd73" },
  ],
  p3: [
    { latex: "(2/3)x^{3/2}", fn: (x) => (2 / 3) * x ** 1.5, color: "#66cfff" },
    { latex: "-6\\sqrt{x}", fn: (x) => -6 * Math.sqrt(x), color: "#bb9dff" },
  ],
  log: [],
};
