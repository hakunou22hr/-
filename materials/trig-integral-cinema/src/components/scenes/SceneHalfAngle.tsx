import { FormulaDebris } from "../FormulaDebris";
import { motion } from "framer-motion";
import { formulas as f } from "../../data/formulas";
import { Reveal, Label, type SceneProps } from "./shared";
export default function SceneHalfAngle({ local }: SceneProps) {
  const formed = local > 4.5;
  return (
    <div className="scene-body">
      <Label>HALF-ANGLE / 半角公式</Label>
      <motion.div
        animate={{
          opacity: formed ? 0 : Math.max(0, 1 - local / 2),
          scale: 1 + local * 0.09,
          filter: `blur(${Math.min(16, local * 5)}px)`,
        }}
        className="morph-source"
      >
        <Reveal tex={f.square} />
      </motion.div>
      <FormulaDebris local={local} />
      <Reveal tex={f.half} visible={formed} gold />
      {formed && <div className="gold-halo" />}
    </div>
  );
}
