import { formulas as f } from "../../data/formulas";
import { Reveal, Label, type SceneProps } from "./shared";
import { Graph } from "../Graph";
export default function SceneProduct({ local }: SceneProps) {
  return (
    <div className="scene-body">
      <div
        className="receding-answer"
        style={{ opacity: Math.max(0, 1 - local / 2) }}
      >
        <Reveal tex={f.answer1} />
      </div>
      <Label>02 / THE SECOND INTEGRAL</Label>
      <Reveal tex={f.problem2} visible={local > 0.5} />
      <Graph product />
    </div>
  );
}
