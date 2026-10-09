/** Shared by the interactive application and the deterministic MP4 renderer. */
export const DURATION = 90;
export const FPS = 30;
export const chapters = [
  {
    start: 0,
    end: 18,
    title: "1万円は、いくらになる？",
    en: "CONTINUOUS GROWTH",
    question: "分割回数を増やすと、1年後の元利合計はどこまで増える？",
  },
  {
    start: 18,
    end: 36,
    title: "回数を増やしても、無限には増えない",
    en: "APPROACHING ZERO",
    question: "hの正側と負側では、近づく値は同じだろうか？",
  },
  {
    start: 36,
    end: 48,
    title: "対数は「何乗？」に答える",
    en: "A CHANGE OF PERSPECTIVE",
    question: "指数関数と対数関数は、直線 y=x に対してどう配置される？",
  },
  {
    start: 48,
    end: 64,
    title: "接線は、その場所での傾き",
    en: "THE SHAPE OF CHANGE",
    question: "2点を近づけると、割線の傾きはどう変わる？",
  },
  {
    start: 64,
    end: 76,
    title: "同じ数が、接線にも現れる",
    en: "THE BIRTH OF e",
    question: "x=1で接線の傾きが1になる底を、自分で探そう。",
  },
  {
    start: 76,
    end: 90,
    title: "自然対数なら、傾きは1/x",
    en: "A LANGUAGE OF CHANGE",
    question: "xを2倍にすると、自然対数の接線の傾きはどう変わる？",
  },
] as const;
export type Parameters = { a: number; x: number; h: number; n: number };
export type Vec3 = [number, number, number];
export function validBase(a: number) {
  return Number.isFinite(a) && a > 0 && a !== 1;
}
export function logA(x: number, a: number) {
  return x > 0 && validBase(a) ? Math.log(x) / Math.log(a) : NaN;
}
export function derivative(x: number, a: number) {
  return x > 0 && validBase(a) ? 1 / (x * Math.log(a)) : NaN;
}
export function secant(x: number, h: number, a: number) {
  return x > 0 && x + h > 0 && h !== 0 && validBase(a)
    ? Math.log1p(h / x) / (h * Math.log(a))
    : NaN;
}
export function compound(n: number) {
  return Number.isInteger(n) && n >= 1 ? Math.exp(n * Math.log1p(1 / n)) : NaN;
}
export function limitExperiment(h: number) {
  return Number.isFinite(h) && h > -1 && h !== 0
    ? Math.exp(Math.log1p(h) / h)
    : NaN;
}
export function chapterAt(t: number) {
  return chapters.findIndex((c) => t < c.end) < 0
    ? 5
    : chapters.findIndex((c) => t < c.end);
}
const smooth = (v: number) => {
  const q = Math.max(0, Math.min(1, v));
  return q * q * (3 - 2 * q);
};
export function movieParameters(t: number): Parameters {
  const c = chapterAt(t),
    p = (t - chapters[c].start) / (chapters[c].end - chapters[c].start);
  if (c === 0)
    return {
      a: 2,
      x: 1,
      h: 0.3,
      n: [1, 2, 365][Math.min(2, Math.floor(p * 3))],
    };
  if (c === 1) return { a: 2, x: 1, h: Math.pow(10, -1 - 5 * p), n: 365 };
  if (c === 2) return { a: 2, x: 4, h: 0.3, n: 365 };
  if (c === 3)
    return {
      a: 2,
      x: 1,
      h: 0.7 * Math.pow(10, -4 * Math.max(0, (t - 56) / 8)),
      n: 365,
    };
  if (c === 4)
    return { a: 2 + (Math.E - 2) * smooth(p * 1.8), x: 1, h: 0.0001, n: 365 };
  return { a: Math.E, x: t < 81 ? 1 : t < 84 ? 2 : 3, h: 0.0001, n: 365 };
}
export function graphPoints(a: number, inverse = false): Vec3[] {
  return Array.from({ length: 220 }, (_, i) => {
    const x = 0.08 + (i / 219) * 6,
      y = logA(x, a);
    return inverse ? [y, x, 0] : [x, y, 0];
  }).filter((p) => Math.abs(p[0]) < 6 && Math.abs(p[1]) < 6) as Vec3[];
}
export function convergencePoints(negative = false): Vec3[] {
  return Array.from({ length: 150 }, (_, i) => {
    const h = (negative ? -1 : 1) * Math.pow(10, -1 - (i / 149) * 6);
    return [
      -Math.log10(Math.abs(h)) - 1,
      (limitExperiment(h) - 2.5) * 10,
      negative ? -0.55 : 0.55,
    ] as Vec3;
  });
}
export const cues = [
  {
    start: 0,
    end: 6,
    text: "年利百パーセント。年末に利息をつけると、一万円は二万円に。",
  },
  {
    start: 6,
    end: 12,
    text: "半年ごとに五十パーセントずつなら、二万二千五百円。",
  },
  {
    start: 12,
    end: 18,
    text: "毎日つけると、およそ二万七千百四十六円。",
  },
  {
    start: 18,
    end: 27,
    text: "回数を、さらに増やす。元金の何倍になるかは、この式。二点七一八に近づきます。",
  },
  {
    start: 27,
    end: 36,
    text: "エイチは一回あたりの利率。ゼロに近づけると、両側から同じ値へ。ゼロを代入するのではありません。",
  },
  {
    start: 36,
    end: 48,
    text: "次は対数。二を何乗すれば四になる？ 答えは二。対数は、この何乗という問いに答える関数です。",
  },
  {
    start: 48,
    end: 56,
    text: "曲線上の二点を結ぶ線。その傾きは、縦の変化を、横の変化で割った値です。",
  },
  {
    start: 56,
    end: 64,
    text: "二点を近づけると、接線になります。接線の傾きが、その場所での微分係数です。",
  },
  {
    start: 64,
    end: 76,
    text: "横が一の場所。底を変えると、傾きも変わる。底がイーなら、傾きは一。このイーは、複利の極限と同じ数です。",
  },
  {
    start: 76,
    end: 83,
    text: "イーを底にすると、自然対数。横が一なら傾きは一。二なら二分の一。",
  },
  {
    start: 83,
    end: 90,
    text: "三なら三分の一。自然対数の微分は、エックス分の一です。",
  },
] as const;
export function cueAt(t: number) {
  return cues.find((c) => t >= c.start && t < c.end)?.text || "";
}
