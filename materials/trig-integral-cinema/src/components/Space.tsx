import { Component, Suspense, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FormulaTunnel } from "./cinema/FormulaTunnel";
import { FormulaFlow } from "./cinema/FormulaFlow";
import { WaveSculpture } from "./cinema/WaveSculpture";
import { GoldenRelease } from "./cinema/GoldenRelease";
import { Bloom } from "./cinema/Bloom";
import { glowTexture, seeded } from "./cinema/textures";
import { cinema } from "../data/cinema";
function World({ time, scene }: { time: number; scene: number }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(1400 * 3);
    for (let i = 0; i < 1400; i++) {
      a[i * 3] = (seeded(i + 1) - 0.5) * 42;
      a[i * 3 + 1] = (seeded(i + 4) - 0.5) * 28;
      a[i * 3 + 2] = -seeded(i + 7) * 65;
    }
    return a;
  }, []);
  const map = useMemo(() => glowTexture(), []);
  useFrame(({ camera }) => {
    camera.position.set(
      Math.sin(time * 0.09) * 0.3,
      Math.cos(time * 0.07) * 0.12,
      14,
    );
    camera.lookAt(0, 0, -15);
    if (points.current) {
      points.current.position.z = (time * 0.35) % 10;
      points.current.rotation.z = time * 0.003;
    }
  });
  return (
    <>
      <fog attach="fog" args={["#030917", 38, 95]} />
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={map}
          size={0.09}
          color="#80d8ff"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <FormulaTunnel time={time} scene={scene} />
      {(scene === 4 || scene === 8) && (
        <FormulaFlow key={scene} time={time} scene={scene} />
      )}
      {(scene === 5 || scene === 7) && (
        <WaveSculpture key={scene} time={time} scene={scene} />
      )}
      {scene === 10 && <GoldenRelease time={time} />}
      {scene === 6 || scene === 9 ? (
        <gridHelper
          args={[60, 30, "#376d81", "#122334"]}
          position={[0, -4.5, -14]}
        />
      ) : null}
      <Bloom time={time} scene={scene} />
    </>
  );
}
class SpaceBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="fallback-stars" />
    ) : (
      this.props.children
    );
  }
}
export function Space({ time, scene }: { time: number; scene: number }) {
  return (
    <div className="space" aria-hidden="true">
      <SpaceBoundary>
        <Suspense fallback={null}>
          <Canvas
            dpr={[1, cinema.maxDpr]}
            camera={{ position: [0, 0, 14], fov: 58, near: 0.1, far: 120 }}
            gl={{
              antialias: false,
              alpha: true,
              powerPreference: "high-performance",
            }}
          >
            <World time={time} scene={scene} />
          </Canvas>
        </Suspense>
      </SpaceBoundary>
      <div className="nebula" />
      <div className="vignette" />
    </div>
  );
}
