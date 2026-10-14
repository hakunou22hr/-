import { FormulaDebris } from "../FormulaDebris";
import { formulas as f } from "../../data/formulas";
import { Reveal, Label, type SceneProps } from "./shared";
export default function SceneProductToSum({ local }: SceneProps) {
  return (
    <div className="scene-body product-scene">
      <Label>PRODUCT TO SUM / 積和公式</Label>
      <Reveal
        tex={f.productGeneral}
        visible={local > 0.2}
        className="general-formula"
      />
      <div className="branches">
        <Reveal tex={f.sum} visible={local > 1.3} />
        <Reveal tex={f.difference} visible={local > 2.6} />
      </div>
      <div className="merge-lines" />
      <FormulaDebris local={local} product />
      <Reveal
        tex={f.product}
        visible={local > 4.5}
        gold
        className="product-result"
      />
      {local > 4.5 && <div className="gold-halo" />}
    </div>
  );
}
