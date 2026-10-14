import { Component, Suspense, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { theme } from "../data/theme";
function World({ time, scene }: { time: number; scene: number }) {
  const dust = useRef<THREE.Points>(null);
  const rings = useRef<THREE.Group>(null);
  const cloud = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(1200 * 3);
    let seed = 37;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < a.length; i += 3) {
      a[i] = (random() - 0.5) * 50;
      a[i + 1] = (random() - 0.5) * 32;
      a[i + 2] = -random() * 95;
    }
    return a;
  }, []);
  const bursts = useMemo(() => {
    const a = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) {
      const angle = i * 2.39996323;
      const radius = Math.sqrt(i / 800) * 6;
      a[i * 3] = Math.cos(angle) * radius;
      a[i * 3 + 1] = Math.sin(angle) * radius * 0.6;
      a[i * 3 + 2] = Math.sin(i * 0.37) * 3;
    }
    return a;
  }, []);
  useFrame(({ camera }) => {
    camera.position.set(
      Math.sin(time * 0.055) * 0.28,
      Math.cos(time * 0.08) * 0.15,
      6 - time * 0.035,
    );
    camera.lookAt(0, 0, -18);
    if (dust.current) {
      dust.current.position.z = (time * 0.45) % 16;
      dust.current.rotation.z = time * 0.003;
    }
    if (rings.current) {
      rings.current.position.z = scene === 2 ? (time - 8) * 1.5 : time * 0.15;
      rings.current.rotation.z = Math.sin(time * 0.07) * 0.04;
    }
    if (cloud.current) {
      const local = scene === 4 ? time - 30 : time - 72;
      const burst = scene === 4 || scene === 8;
      cloud.current.visible = burst && local < 6;
      const spread =
        local < 2 ? 1 + local * 2 : Math.max(0.05, 5 - (local - 2) * 1.5);
      cloud.current.scale.setScalar(spread);
      cloud.current.rotation.z = local * 0.3;
    }
  });
  return (
    <>
      <fog attach="fog" args={[theme.background, 20, 90]} />
      <points ref={dust}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          color={scene === 10 ? theme.gold : theme.cyan}
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <group ref={rings}>
        {Array.from({ length: 14 }, (_, i) => (
          <mesh key={i} position={[0, 0, -i * 6]}>
            <torusGeometry args={[5.6, 0.012, 4, 80]} />
            <meshBasicMaterial
              color={scene === 10 ? theme.gold : theme.cyan}
              transparent
              opacity={0.13 + (i % 3) * 0.03}
            />
          </mesh>
        ))}
      </group>
      <gridHelper
        args={[90, 36, theme.cyan, theme.navy]}
        position={[0, -4, -28]}
      />
      <points ref={cloud}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[bursts, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={theme.gold}
          size={0.055}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
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
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 6], fov: 62 }}
            gl={{
              antialias: true,
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
