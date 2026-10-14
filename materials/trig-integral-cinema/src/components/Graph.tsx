import { Formula } from "./Formula";
import { formulas as f } from "../data/formulas";
import { theme } from "../data/theme";
export function Graph({
  progress = 1,
  product = false,
}: {
  progress?: number;
  product?: boolean;
}) {
  const path = (fn: (x: number) => number) =>
    Array.from({ length: 401 }, (_, i) => {
      const x = (i / 400) * Math.PI * 4;
      return `${i ? "L" : "M"}${(55 + (i / 400) * 790).toFixed(2)},${(product ? 155 - fn(x) * 88 : 205 - fn(x) * 130).toFixed(2)}`;
    }).join(" ");
  const shift = product ? 0 : Math.max(0, 1 - progress) * 48;
  const a = path(product ? (x) => Math.sin(3 * x) : (x) => Math.sin(x) ** 2),
    b = path(product ? (x) => Math.cos(x) : (x) => (1 - Math.cos(2 * x)) / 2);
  return (
    <div className={"graph " + (product ? "cross-waves" : "")}>
      <svg
        viewBox="0 0 900 290"
        role="img"
        aria-label={
          product
            ? "sin 3x と cos x の交差する波形"
            : "sin²x と (1−cos 2x)/2 の同一波形。共通の座標軸上で重なる。"
        }
      >
        <defs>
          <filter id="waveGlow">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line
              x1={55 + i * 197.5}
              x2={55 + i * 197.5}
              y1="45"
              y2="225"
              stroke="#23364b"
            />
            <text x={55 + i * 197.5} y="250" textAnchor="middle">
              {["0", "π", "2π", "3π", "4π"][i]}
            </text>
          </g>
        ))}
        <line
          x1="55"
          x2="855"
          y1={product ? 155 : 205}
          y2={product ? 155 : 205}
          stroke="#537183"
        />
        <line x1="55" x2="55" y1="38" y2="225" stroke="#537183" />
        {!product && (
          <>
            <text x="35" y="80">
              1
            </text>
            <text x="34" y="210">
              0
            </text>
          </>
        )}
        <text x="867" y="210">
          x
        </text>
        <g stroke={theme.red} fill="none">
          <path d={a} strokeWidth="7" opacity=".5" filter="url(#waveGlow)" />
          <path d={a} strokeWidth="2.5" />
        </g>
        <g
          stroke={theme.cyan}
          fill="none"
          transform={`translate(0,${shift})`}
          opacity={Math.min(1, progress * 3)}
        >
          <path d={b} strokeWidth="8" opacity=".5" filter="url(#waveGlow)" />
          <path
            d={b}
            strokeWidth="2"
            strokeDasharray={product ? "none" : "7 4"}
          />
        </g>
        {!product && progress >= 1 && (
          <path d={a} fill="none" stroke="white" strokeWidth="1" />
        )}
      </svg>
      {!product && (
        <div className="graph-legend">
          <span>
            <i style={{ background: theme.red }} />
            <Formula tex={f.graph1} />
          </span>
          <span>
            <i style={{ background: theme.cyan }} />
            <Formula tex={f.graph2} />
          </span>
        </div>
      )}
      {!product && progress < 1 && (
        <small className="graph-note">表示位置を合わせています</small>
      )}
      {!product && progress >= 1 && (
        <small className="match">同じ x、同じ y。すべての点が一致する。</small>
      )}
    </div>
  );
}
