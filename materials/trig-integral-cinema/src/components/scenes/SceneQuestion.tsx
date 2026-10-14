import { formulas as f } from "../../data/formulas";
import { Reveal, Label, type SceneProps } from "./shared";
import { Formula } from "../Formula";
export default function SceneQuestion({ local }: SceneProps) {
  return (
    <div className="scene-body">
      <Label>変形の鍵を探す</Label>
      <div className="pulse-square">
        <Formula tex={f.square} />
      </div>
      <div className="stopped-light" />
      <div
        className="formula-fragments"
        style={{ opacity: Math.min(1, local / 7) }}
      >
        <Formula tex={String.raw`1-\cos 2x`} />
        <Formula tex={String.raw`\frac12`} />
      </div>
      <Reveal tex={f.half} visible={local > 9} className="whisper" />
    </div>
  );
}
