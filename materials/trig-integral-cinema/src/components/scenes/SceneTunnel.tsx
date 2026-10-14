import SceneIntro from "./SceneIntro";
import { formulas as f } from "../../data/formulas";
import { Reveal, Label } from "./shared";
export default function SceneTunnel() {
  return (
    <div className="scene-body">
      <div className="tunnel-wall">
        <SceneIntro />
      </div>
      <Label>01 / THE FIRST INTEGRAL</Label>
      <Reveal tex={f.problem1} />
      <div className="orbit-line" />
    </div>
  );
}
