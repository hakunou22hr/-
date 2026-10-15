import { formulas as f } from "../../data/formulas";
import { instagramFormulas } from "../../data/instagramFormulas";
import { Reveal, Label, type SceneProps } from "./shared";
export default function SceneIntegral2({ local, portrait }: SceneProps) {
  return (
    <div className="scene-body calculation">
      <Label>02 / INTEGRATE</Label>
      <Reveal tex={f.problem2} />
      <Reveal tex={f.integral2} visible={local > 0.35} />
      <Reveal tex={portrait ? instagramFormulas.factor2 : f.factor2} visible={local > 0.8} className="coefficient" />
      <Reveal tex={f.answer2} visible={local > 1.6} gold />
    </div>
  );
}
