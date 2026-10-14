import { formulas as f } from "../../data/formulas";
import { Reveal, Label, type SceneProps } from "./shared";
export default function SceneIntegral1({ local }: SceneProps) {
  return (
    <div className="scene-body calculation">
      <Label>01 / INTEGRATE</Label>
      <Reveal tex={f.problem1} />
      <Reveal tex={f.integral1} visible={local > 0.8} />
      <div className="coefficient">
        <Reveal tex={f.inner1} visible={local > 2.4} />
        <Reveal tex={f.factor1} visible={local > 4.2} />
      </div>
      <Reveal tex={f.answer1} visible={local > 6} gold />
    </div>
  );
}
