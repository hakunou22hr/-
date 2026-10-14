import { motion } from "framer-motion";
import { Formula } from "./Formula";
export function FormulaDebris({
  local,
  product = false,
}: {
  local: number;
  product?: boolean;
}) {
  const fragments = product
    ? [
        String.raw`\sin3x`,
        String.raw`\cos x`,
        String.raw`\frac12`,
        String.raw`\sin4x`,
        String.raw`+`,
        String.raw`\sin2x`,
      ]
    : [
        String.raw`\sin`,
        String.raw`x`,
        String.raw`2`,
        String.raw`1`,
        String.raw`\cos2x`,
        String.raw`\frac12`,
      ];
  const stage = local < 2 ? 0 : local < 4.5 ? 1 : 2;
  return (
    <div className="formula-debris" aria-hidden="true">
      {fragments.map((tex, i) => (
        <motion.div
          key={tex + i}
          initial={false}
          animate={{
            x:
              stage === 0
                ? (i - 2.5) * 35
                : stage === 1
                  ? Math.cos(i * 1.7) * 280
                  : (i - 2.5) * 55,
            y: stage === 1 ? Math.sin(i * 1.7) * 130 : 0,
            rotate: stage === 1 ? (i - 2) * 30 : 0,
            opacity: stage === 2 ? 0 : stage === 0 ? 0.6 : 1,
            scale: stage === 1 ? 0.65 : 1,
            filter: stage === 2 ? "blur(10px)" : "blur(0px)",
          }}
          transition={{ duration: stage === 2 ? 1 : 0.9 }}
        >
          <Formula tex={tex} />
        </motion.div>
      ))}
    </div>
  );
}
