import { describe, it, expect } from "vitest";
import katex from "katex";
import {
  primitiveTerms,
  area,
  derivativeNumeric,
  interval,
  problems,
  sameInterval,
  samples,
  valid,
} from "./math";
describe("原始関数の数学的検証", () => {
  for (const p of problems) {
    describe(p.name, () => {
      it("各項の原始関数の和と数式が正しい", () => {
        for (const x of p.positiveOnly ? [0.5, 2, 4] : [-4, -0.5, 0.5, 2, 4])
          if (primitiveTerms[p.id].length)
            expect(
              primitiveTerms[p.id].reduce((s, t) => s + t.fn(x), 0),
            ).toBeCloseTo(p.F(x), 10);
        for (const tex of [
          p.source,
          p.expanded,
          p.primitive,
          p.derivative,
          ...p.terms.map((t) => t.latex),
          ...primitiveTerms[p.id].map((t) => t.latex),
        ])
          expect(() =>
            katex.renderToString(tex, { throwOnError: true }),
          ).not.toThrow();
      });
      it("元の式・整理した式・解析的微分・独立な中心差分が一致する", () => {
        for (const sign of p.positiveOnly ? [1] : [-1, 1])
          for (const v of [0.015, 0.05, 0.15, 0.5, 1, 2, 2.5, 3, 5.9]) {
            const x = sign * v;
            const f = p.raw(x);
            expect(p.f(x)).toBeCloseTo(f, 6);
            expect(p.dF(x)).toBeCloseTo(f, 6);
            expect(
              Math.abs(derivativeNumeric(p, x) - f) / Math.max(1, Math.abs(f)),
            ).toBeLessThan(3e-6);
          }
      });
      it("定積分は高さの差でCに依存せず、Aの微分がfになる", () => {
        const a = 1,
          x = 2.5,
          h = 1e-5;
        expect(area(p, a, a)).toBe(0);
        expect(area(p, a, x)).toBeCloseTo(p.F(x) - p.F(a), 10);
        for (const C of [-4, 0, 4])
          expect(p.F(x) + C - (p.F(a) + C)).toBeCloseTo(area(p, a, x), 10);
        expect((area(p, a, x + h) - area(p, a, x - h)) / (2 * h)).toBeCloseTo(
          p.f(x),
          6,
        );
        expect(area(p, x, a)).toBeCloseTo(-area(p, a, x), 10);
      });
      it("特異点を跨ぐ面積・定義域外を拒否する", () => {
        expect(valid(p, 0)).toBe(false);
        expect(sameInterval(p, -1, 1)).toBe(false);
        expect(Number.isNaN(area(p, -1, 1))).toBe(true);
        if (p.positiveOnly) expect(valid(p, -1)).toBe(false);
      });
    });
  }
  it("サンプルは正負の各区間内に留まり、0を含まない", () => {
    for (const side of [-1, 1])
      for (const near of [true, false]) {
        const [lo, hi] = interval(side, near);
        const pts = samples((x) => 1 / x, lo, hi);
        expect(
          pts.every(([x, y]) => Math.sign(x) === side && Number.isFinite(y)),
        ).toBe(true);
      }
  });
  it("零点・増減・停留点を区別する", () => {
    const e = problems[1],
      p = problems[2],
      r = problems[4];
    expect(e.f(2)).toBe(0);
    expect(e.f(3)).toBeCloseTo(0, 12);
    expect(e.f(2.5)).toBeLessThan(0);
    expect(e.f(1)).toBeGreaterThan(0);
    expect(e.f(4)).toBeGreaterThan(0);
    expect(p.f(1)).toBe(0);
    expect(p.f(0.9)).toBeGreaterThan(0);
    expect(p.f(1.1)).toBeGreaterThan(0);
    expect(r.f(3)).toBeCloseTo(0, 12);
  });
  it("log|x|の両側の微分と発散", () => {
    const p = problems[5];
    expect(derivativeNumeric(p, -2)).toBeCloseTo(-0.5, 8);
    expect(derivativeNumeric(p, 2)).toBeCloseTo(0.5, 8);
    expect(p.F(-1)).toBe(0);
    expect(p.F(1)).toBe(0);
    expect(p.F(0.00001)).toBeLessThan(p.F(0.01));
    expect(p.f(0.00001)).toBeGreaterThan(p.f(0.01));
    expect(p.f(-0.00001)).toBeLessThan(p.f(-0.01));
  });
});
