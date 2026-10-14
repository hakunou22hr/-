import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector2 } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { cinema } from "../../data/cinema";
export function Bloom({
  time,
  scene: sceneId,
}: {
  time: number;
  scene: number;
}) {
  const { gl, scene, camera, size } = useThree();
  const effect = useRef<{
    composer: EffectComposer;
    bloom: UnrealBloomPass;
  } | null>(null);
  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.setPixelRatio(Math.min(gl.getPixelRatio(), cinema.maxDpr));
    composer.setSize(size.width, size.height);
    const bloom = new UnrealBloomPass(
      new Vector2(size.width, size.height),
      cinema.bloom.strength,
      cinema.bloom.radius,
      cinema.bloom.threshold,
    );
    const output = new OutputPass();
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(bloom);
    composer.addPass(output);
    effect.current = { composer, bloom };
    return () => {
      effect.current = null;
      bloom.dispose();
      output.dispose();
      composer.dispose();
    };
  }, [gl, scene, camera]);
  useEffect(() => {
    effect.current?.composer.setSize(size.width, size.height);
  }, [size.width, size.height]);
  useFrame(() => {
    const fx = effect.current;
    if (!fx) {
      gl.render(scene, camera);
      return;
    }
    const local = time - 88;
    fx.bloom.strength =
      sceneId === 10
        ? 0.95 + Math.exp(-Math.pow((local - 0.35) * 2, 2)) * 0.85
        : sceneId === 5
          ? 0.8
          : cinema.bloom.strength;
    fx.composer.render();
  }, 1);
  return null;
}
