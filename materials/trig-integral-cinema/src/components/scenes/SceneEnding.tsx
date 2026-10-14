import { formulas as f } from "../../data/formulas";
import { Formula } from "../Formula";
export default function SceneEnding() {
  return (
    <div className="scene-body ending">
      <div className="light-pillar" />
      <div className="constellation">
        <Formula tex={f.half} />
        <Formula tex={f.productGeneral} />
      </div>
      <div className="ending-title">
        <span>変形が、答えをひらく。</span>
        <h1>三角関数の不定積分</h1>
      </div>
      <div className="answers">
        <div>
          <Formula tex={f.problem1} />
          <Formula tex={f.answer1} className="gold" />
        </div>
        <div>
          <Formula tex={f.problem2} />
          <Formula tex={f.answer2} className="gold" />
        </div>
      </div>
    </div>
  );
}
