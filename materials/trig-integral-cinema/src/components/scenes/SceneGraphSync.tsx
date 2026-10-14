import { Graph } from "../Graph";
import { Label, type SceneProps } from "./shared";
export default function SceneGraphSync({ local }: SceneProps) {
  return (
    <div className="scene-body graph-scene">
      <Label>IDENTITY / 形を変えても、値は変わらない</Label>
      <div className="sculpture-note">同じ波形を、奥行き方向に重ねて表示</div>
      <Graph progress={Math.min(1, local / 7)} />
    </div>
  );
}
