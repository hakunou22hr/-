import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { glowTexture, seeded } from "./textures";
export function GoldenRelease({ time }: { time: number }) {
  const cubes = useRef<THREE.InstancedMesh>(null),
    group = useRef<THREE.Group>(null),
    dust = useRef<THREE.Points>(null);
  const temp = useMemo(() => new THREE.Object3D(), []);
  const map = useMemo(() => glowTexture(), []);
  const cloud = useMemo(() => {
    const a = new Float32Array(2600 * 3);
    for (let i = 0; i < 2600; i++) {
      a[i * 3] = (seeded(i + 2) - 0.5) * 24;
      a[i * 3 + 1] = (seeded(i + 12) - 0.5) * 16;
      a[i * 3 + 2] = -seeded(i + 22) * 25;
    }
    return a;
  }, []);
  useEffect(
    () => () => {
      map.dispose();
    },
    [map],
  );
  useFrame(() => {
    const local = time - 88;
    if (group.current) {
      group.current.rotation.y = local * 0.1;
      group.current.scale.setScalar(0.7 + Math.min(1, local) * 0.3);
    }
    if (dust.current) dust.current.position.y = local * 0.7;
    if (cubes.current) {
      for (let i = 0; i < 80; i++) {
        const side = i % 2 ? 1 : -1;
        temp.position.set(
          side * (4 + seeded(i + 3) * 6),
          (seeded(i + 14) - 0.5) * 12,
          -seeded(i + 19) * 25,
        );
        temp.rotation.set(time * 0.05 + i, time * 0.04 + i * 0.7, i * 0.4);
        const s = 0.16 + seeded(i + 27) * 0.65;
        temp.scale.set(s, s, s);
        temp.updateMatrix();
        cubes.current.setMatrixAt(i, temp.matrix);
      }
      cubes.current.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group>
      <group ref={group}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 2, -5]}>
            <cylinderGeometry
              args={[0.13 + i * 0.24, 0.5 + i * 0.7, 32, 32, 1, true]}
            />
            <meshBasicMaterial
              color={new THREE.Color(2.1, 1.35, 0.3)}
              transparent
              opacity={0.14 - i * 0.026}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={"ring" + i}
            rotation={[-Math.PI / 2, 0, i * 0.3]}
            position={[0, -4.1, -4]}
          >
            <torusGeometry args={[2.4 + i * 1.1, 0.013 + i * 0.002, 4, 80]} />
            <meshBasicMaterial
              color={new THREE.Color(3.4, 2.1, 0.5)}
              toneMapped={false}
              transparent
              opacity={0.65 - i * 0.08}
            />
          </mesh>
        ))}
      </group>
      <instancedMesh
        ref={cubes}
        args={[undefined, undefined, 80]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          wireframe
          color={new THREE.Color(2.8, 1.8, 0.55)}
          toneMapped={false}
          transparent
          opacity={0.48}
        />
      </instancedMesh>
      <points ref={dust} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[cloud, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={map}
          size={0.075}
          color={new THREE.Color(2.2, 1.5, 0.65)}
          transparent
          blending={THREE.AdditiveBlending}
          opacity={0.8}
          depthWrite={false}
          toneMapped={false}
        />
      </points>
    </group>
  );
}
