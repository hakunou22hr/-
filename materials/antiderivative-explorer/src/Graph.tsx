import { useId } from "react";
import {
  derivativeNumeric,
  fmt,
  primitiveTerms,
  samples,
  type Problem,
} from "./math";
type Props = {
  p: Problem;
  x: number;
  c: number;
  a: number;
  range: [number, number];
  zoom: number;
  kind: "f" | "F";
  areaMode?: boolean;
  terms?: boolean;
  trace: number[];
  low: boolean;
  logCompare?: string;
  reveal: number;
  verify?: boolean;
};
export default function Graph({
  p,
  x,
  c,
  a,
  range,
  zoom,
  kind,
  areaMode,
  terms,
  trace,
  low,
  logCompare,
  reveal,
  verify,
}: Props) {
  const id = useId().replace(/:/g, "");
  const W = 680,
    H = 270,
    L = 52,
    R = 18,
    T = 22,
    B = 30;
  const yw = 8 / zoom;
  const [lo, hi] = range;
  const X = (t: number) => L + ((t - lo) / (hi - lo)) * (W - L - R);
  const Y = (v: number) => T + ((yw - v) / (2 * yw)) * (H - T - B);
  const fun = kind === "f" ? p.f : (t: number) => p.F(t) + c;
  const value = fun(x),
    slope = p.f(x);
  const color =
    slope > 1e-9 ? "#61e6a7" : slope < -1e-9 ? "#ff8193" : "#ffcf75";
  const path = (
    fn: (v: number) => number,
    start = lo,
    end = hi,
    n = low ? 90 : 320,
  ) =>
    samples(fn, start, end, n)
      .map(
        ([t, v], i) =>
          `${i ? "L" : "M"}${X(t).toFixed(2)},${Y(Math.max(-yw * 20, Math.min(yw * 20, v))).toFixed(2)}`,
      )
      .join(" ");
  const curveEnd = lo + (hi - lo) * reveal;
  const pointVisible = Math.abs(value) <= yw;
  const step = Math.max(1, Math.ceil(yw / 4));
  const ys = [];
  for (let v = -Math.floor(yw / step) * step; v <= yw; v += step) ys.push(v);
  const shading = () => {
    const s = Math.min(a, x),
      e = Math.max(a, x),
      n = low ? 60 : 200;
    const zeros: Record<string, number[]> = { e2: [2, 3], p1: [1], p3: [3] };
    const grid = [
      ...new Set([
        ...samples(p.f, s, e, n).map(([t]) => t),
        ...(zeros[p.id] || []).filter((t) => t > s && t < e),
      ]),
    ].sort((a, b) => a - b);
    return grid.slice(0, -1).map((t, i) => {
      const v = p.f(t),
        t2 = grid[i + 1],
        v2 = p.f(t2);
      return (
        <path
          key={i}
          d={`M${X(t)},${Y(0)} L${X(t)},${Y(v)} L${X(t2)},${Y(v2)} L${X(t2)},${Y(0)} Z`}
          fill={p.f((t + t2) / 2) >= 0 ? "#61e6a7" : "#ff8193"}
          opacity=".23"
        />
      );
    });
  };
  return (
    <section className="plot">
      <div className="plot-heading">
        <b>{kind === "f" ? "01  元の関数" : "02  原始関数"}</b>
        <span>
          {kind === "f" ? "高さ f(x)" : "接線の傾き F′(x)"} = {fmt(slope)}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={
          kind === "f" ? "元の関数のグラフ" : "原始関数と接線のグラフ"
        }
      >
        <defs>
          <clipPath id={`clip${id}`}>
            <rect x={L} y={T} width={W - L - R} height={H - T - B} />
          </clipPath>
          <filter id={`glow${id}`}>
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        {ys.map((v) => (
          <g key={v}>
            <line
              x1={L}
              x2={W - R}
              y1={Y(v)}
              y2={Y(v)}
              stroke={v === 0 ? "#8295ac" : "#213148"}
            />
            <text x={L - 8} y={Y(v) + 4} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {Array.from({ length: 7 }, (_, i) => i - 6 * (hi < 0 ? 1 : 0))
          .filter((t) => t >= lo && t <= hi)
          .map((t) => (
            <g key={t}>
              <line x1={X(t)} x2={X(t)} y1={T} y2={H - B} stroke="#213148" />
              <text x={X(t)} y={H - 8} textAnchor="middle">
                {t}
              </text>
            </g>
          ))}
        <line
          x1={X(0)}
          x2={X(0)}
          y1={T}
          y2={H - B}
          stroke="#ffb778"
          strokeDasharray="4 4"
        />
        <text x={W - 20} y={H - 8}>
          x
        </text>
        <text x={20} y={T}>
          y
        </text>
        <g clipPath={`url(#clip${id})`}>
          {areaMode && kind === "f" && shading()}
          {terms &&
            (kind === "f" ? p.terms : primitiveTerms[p.id]).map((term) => (
              <path
                key={term.latex}
                d={path(term.fn, lo, curveEnd)}
                fill="none"
                stroke={term.color}
                strokeWidth="1.5"
                strokeDasharray="5 5"
                opacity=".8"
              />
            ))}
          {logCompare === "log x" && kind === "F" && hi < 0 ? null : (
            <>
              <path
                d={path(fun, lo, curveEnd)}
                fill="none"
                stroke={
                  kind === "f"
                    ? p.id === "log" && hi < 0
                      ? "#bb9dff"
                      : "#65ceff"
                    : "#8191ad"
                }
                strokeWidth="2.5"
              />
              {kind === "F" &&
                samples(fun, lo, curveEnd, low ? 90 : 320)
                  .slice(0, -1)
                  .map(([t, v], i) => {
                    const dt = (curveEnd - lo) / (low ? 90 : 320);
                    return (
                      <path
                        key={i}
                        d={`M${X(t)},${Y(v)} L${X(t + dt)},${Y(fun(t + dt))}`}
                        stroke={p.f(t) >= 0 ? "#61e6a7" : "#ff8193"}
                        strokeWidth="2.5"
                      />
                    );
                  })}
            </>
          )}
          {reveal === 1 && trace.length > 1 && (
            <path
              d={trace
                .map((t, i) => `${i ? "L" : "M"}${X(t)},${Y(fun(t))}`)
                .join(" ")}
              fill="none"
              stroke={kind === "f" ? "#65ceff" : color}
              strokeWidth="5"
              opacity=".75"
              filter={low ? undefined : `url(#glow${id})`}
            />
          )}
          <line
            x1={X(x)}
            x2={X(x)}
            y1={T}
            y2={H - B}
            stroke="#a3b4c9"
            strokeDasharray="4 5"
            opacity=".6"
          />
          {kind === "F" && verify && (
            <path
              d={path(
                (t) => value + derivativeNumeric(p, x) * (t - x),
                Math.max(lo, x - 0.9),
                Math.min(hi, x + 0.9),
                2,
              )}
              fill="none"
              stroke="#65ceff"
              strokeWidth="5"
              strokeDasharray="5 4"
              opacity=".6"
            />
          )}
          {kind === "F" && !(logCompare === "log x" && hi < 0) && (
            <path
              d={path(
                (t) => value + slope * (t - x),
                Math.max(lo, x - 0.9),
                Math.min(hi, x + 0.9),
                2,
              )}
              fill="none"
              stroke="#ffcf75"
              strokeWidth="2.5"
            />
          )}
          {areaMode && kind === "f" && (
            <line
              x1={X(a)}
              x2={X(a)}
              y1={T}
              y2={H - B}
              stroke="#bb9dff"
              strokeDasharray="5 4"
            />
          )}
          {pointVisible &&
            x <= curveEnd &&
            !(logCompare === "log x" && hi < 0) && (
              <g className={low ? "" : "pulse"}>
                <circle
                  cx={X(x)}
                  cy={Y(value)}
                  r="10"
                  fill={
                    kind === "f"
                      ? p.id === "log" && hi < 0
                        ? "#bb9dff"
                        : "#65ceff"
                      : color
                  }
                  opacity=".3"
                />
                <circle
                  cx={X(x)}
                  cy={Y(value)}
                  r="5"
                  fill={
                    kind === "f"
                      ? p.id === "log" && hi < 0
                        ? "#bb9dff"
                        : "#65ceff"
                      : color
                  }
                />
              </g>
            )}
        </g>
      </svg>
      <div className="plot-foot">
        <span>x=0 は定義域外</span>
        <span>
          x = {fmt(x)}　{kind === "f" ? "f(x)" : "F(x)+C"} = {fmt(value)}
        </span>
        <span>
          {!pointVisible
            ? "点は表示範囲外：ズームアウトできます"
            : kind === "F"
              ? "金色：接線／緑：増加／赤：減少"
              : p.id === "log" && hi < 0
                ? "紫：負の区間／破線：共有するx"
                : "水色：関数／破線：共有するx"}
        </span>
      </div>
    </section>
  );
}
