import { cinema } from "../../data/cinema";
import { motion } from "framer-motion";
import { formulas as f } from "../../data/formulas";
import { Reveal, Label, type SceneProps } from "./shared";
export default function SceneHalfAngle({ local }: SceneProps) {
  const formed = local >= cinema.morph.assemble;
  return (
    <div className="scene-body">
      <Label>HALF-ANGLE / 半角公式</Label>
      <motion.div
        animate={{
          opacity: Math.max(0, 1 - local / cinema.morph.split),
          scale: 1 + local * 0.09,
          filter: `blur(${Math.min(16, local * 5)}px)`,
        }}
        className="morph-source"
      >
        <Reveal tex={f.square} />
      </motion.div>

      <Reveal tex={f.half} visible={formed} gold />
      {formed && <div className="gold-halo" />}
    </div>
  );
}
