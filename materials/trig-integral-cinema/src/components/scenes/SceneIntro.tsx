import { formulas } from "../../data/formulas";
import { Formula } from "../Formula";
export default function SceneIntro() {
  return (
    <div className="intro-space">
      {formulas.fragments.map((tex, i) => (
        <div
          key={i}
          className="floating-formula"
          style={{
            left: `${9 + ((i * 17) % 80)}%`,
            top: `${13 + ((i * 23) % 70)}%`,
            animationDelay: `-${i * 2}s`,
          }}
        >
          <Formula tex={tex} />
        </div>
      ))}
      <div className="vanishing-point" />
    </div>
  );
}
