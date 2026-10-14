export const timeline = [
  { id: 1, start: 0, end: 8, name: "静寂の数式空間" },
  { id: 2, start: 8, end: 18, name: "数式の中へ" },
  { id: 3, start: 18, end: 30, name: "見える形へ" },
  { id: 4, start: 30, end: 42, name: "半角公式" },
  { id: 5, start: 42, end: 54, name: "波形の一致" },
  { id: 6, start: 54, end: 64, name: "第1問の積分" },
  { id: 7, start: 64, end: 72, name: "積なら、和へ" },
  { id: 8, start: 72, end: 84, name: "積和公式" },
  { id: 9, start: 84, end: 88, name: "第2問の積分" },
  { id: 10, start: 88, end: 90, name: "変形が、答えをひらく" },
] as const;
export const DURATION = 90;
export function sceneAt(t: number) {
  return timeline.find((s) => t >= s.start && t < s.end) ?? timeline[9];
}
