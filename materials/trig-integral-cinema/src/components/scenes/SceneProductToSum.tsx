import { cinema } from "../../data/cinema";
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

      <Reveal
        tex={f.product}
        visible={local >= cinema.morph.assemble}
        gold
        className="product-result"
      />
      {local >= cinema.morph.assemble && <div className="gold-halo" />}
    </div>
  );
}
