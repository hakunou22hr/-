import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { glyphPositions, glowTexture, seeded } from "./textures";
import { cinema } from "../../data/cinema";
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => v * v * (3 - 2 * v);
export function FormulaFlow({ time, scene }: { time: number; scene: number }) {
  const product = scene === 8,
    local = time - (product ? 72 : 30);
  const points = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const source = glyphPositions(product ? "sin 3x cos x" : "sin² x");
    const target = glyphPositions(
      product ? "½ (sin 4x + sin 2x)" : "(1 − cos 2x) / 2",
    );
    const positions = new Float32Array(cinema.particleCount * 3);
    const colors = new Float32Array(cinema.particleCount * 3);
    for (let i = 0; i < cinema.particleCount; i++) {
      const gold = i % 3 !== 0;
      colors.set(gold ? [2.2, 1.45, 0.48] : [0.4, 1.6, 2.6], i * 3);
    }
    return { source, target, positions, colors };
  }, [product]);
  const map = useMemo(() => glowTexture(), []);
  const trails = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(151 * 3), 3),
        );
        const m = new THREE.LineBasicMaterial({
          color:
            i % 2
              ? new THREE.Color(0.3, 1.5, 2.6)
              : new THREE.Color(2.6, 1.7, 0.55),
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        });
        return new THREE.Line(g, m);
      }),
    [],
  );
  useEffect(
    () => () => {
      map.dispose();
      trails.forEach((line) => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
    },
    [map, trails],
  );
  useFrame(() => {
    const split = ease(
      clamp(
        (local - cinema.morph.split) /
          (cinema.morph.scatter - cinema.morph.split),
      ),
    );
    const assemble = ease(
      clamp(
        (local - cinema.morph.scatter) /
          (cinema.morph.assemble - cinema.morph.scatter),
      ),
    );
    const opacity =
      local > cinema.morph.assemble
        ? Math.max(0, 1 - (local - cinema.morph.assemble) / 1.4)
        : 1;
    for (let i = 0; i < cinema.particleCount; i++) {
      const s = data.source[i % data.source.length],
        t = data.target[(i * 37) % data.target.length];
      const u = seeded(i + 1),
        a = u * Math.PI * 8 - local * 0.9;
      const envelope = Math.sin(u * Math.PI);
      const swirl = [
        (u - 0.5) * 17,
        Math.sin(a) * envelope * 2.9,
        Math.cos(a) * envelope * 3.5 - 1,
      ];
      const jitter = (seeded(i + 99) - 0.5) * 0.045;
      for (let axis = 0; axis < 3; axis++)
        data.positions[i * 3 + axis] = mix(
          mix(s[axis] + jitter, swirl[axis], split),
          t[axis] + jitter,
          assemble,
        );
    }
    if (points.current) {
      points.current.geometry.attributes.position.needsUpdate = true;
      (points.current.material as THREE.PointsMaterial).opacity = opacity;
    }
    trails.forEach((line, j) => {
      const a = line.geometry.attributes.position;
      for (let i = 0; i <= 150; i++) {
        const u = i / 150;
        const env = Math.sin(Math.PI * u);
        const angle = u * Math.PI * 8 - local * 0.9 + j * 0.1;
        const spread = Math.sin(split * Math.PI * 0.5) * (1 - assemble);
        a.setXYZ(
          i,
          (u - 0.5) * 17,
          Math.sin(angle) * env * (2.9 + j * 0.03) * spread,
          Math.cos(angle) * env * 3.5 * spread - 1,
        );
      }
      a.needsUpdate = true;
      (line.material as THREE.LineBasicMaterial).opacity =
        Math.sin(split * Math.PI * 0.5) * (1 - assemble) * 0.5;
    });
  });
  return (
    <group position={[0, scene === 8 ? -0.4 : 0, 1]}>
      <points ref={points} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[data.positions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={map}
          size={0.1}
          vertexColors
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </points>
      {trails.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}
