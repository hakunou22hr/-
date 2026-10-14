import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { formulaTexture } from "./textures";
import { cinema } from "../../data/cinema";
export function FormulaTunnel({
  time,
  scene,
}: {
  time: number;
  scene: number;
}) {
  const group = useRef<THREE.Group>(null);
  const texture = useMemo(() => formulaTexture(), []);
  const floor = useMemo(() => formulaTexture(true), []);
  useFrame(() => {
    if (!group.current) return;
    group.current.position.z = (time * (scene === 2 ? 1.9 : 0.7)) % 10;
    group.current.rotation.y = Math.sin(time * 0.14) * 0.025;
  });
  const mirror = useMemo(() => {
    const m = new Reflector(new THREE.PlaneGeometry(12.8, 100), {
      textureWidth: 512,
      textureHeight: 512,
      color: "#89a0b6",
      clipBias: 0.003,
      multisample: 0,
    });
    m.rotation.x = -Math.PI / 2;
    m.position.set(0, -4.6, -44.9);
    return m;
  }, []);
  useEffect(
    () => () => {
      mirror.dispose();
      mirror.geometry.dispose();
      texture.dispose();
      floor.dispose();
    },
    [mirror, texture, floor],
  );
  const color = useMemo(
    () => new THREE.Color("#8fe1ff").multiplyScalar(cinema.wallBrightness),
    [],
  );
  return (
    <group ref={group} visible={scene <= 3}>
      {Array.from({ length: cinema.wallSections }, (_, i) => (
        <group key={i} position={[0, 0, -i * 10]}>
          {[-1, 1].map((side) => (
            <group key={side}>
              <mesh
                position={[side * 6.4, 0, 0]}
                rotation={[0, (-side * Math.PI) / 2, 0]}
              >
                <planeGeometry args={[10, 9]} />
                <meshBasicMaterial
                  map={texture}
                  color={color}
                  side={THREE.DoubleSide}
                  toneMapped={false}
                />
              </mesh>
              <mesh position={[side * 6.15, 0, 4.85]}>
                <boxGeometry args={[0.06, 8.8, 0.08]} />
                <meshBasicMaterial color={[3.8, 2.2, 0.6]} toneMapped={false} />
              </mesh>
              {[0, 0.2, 0.4].map((d, j) => (
                <mesh key={j} position={[side * (5.85 - d), 0, 4.82]}>
                  <boxGeometry args={[0.025, 8.8, 0.025]} />
                  <meshBasicMaterial
                    color={[2.5, 1.2, 0.35]}
                    transparent
                    opacity={0.75 - j * 0.15}
                    toneMapped={false}
                  />
                </mesh>
              ))}
            </group>
          ))}
          <mesh position={[0, -4.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[12.8, 10]} />
            <meshBasicMaterial
              map={floor}
              color="#7197ac"
              transparent
              opacity={0.22}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, -4.48, 4.8]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[12.2, 0.028]} />
            <meshBasicMaterial color={[1.4, 2.4, 3.0]} toneMapped={false} />
          </mesh>
          <mesh position={[0, 4.5, 4.8]}>
            <boxGeometry args={[12.8, 0.035, 0.035]} />
            <meshBasicMaterial color={[0.4, 1.2, 1.8]} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <primitive object={mirror} />
      <TransportWave time={time} />
    </group>
  );
}
function TransportWave({ time }: { time: number }) {
  const lines = useMemo(
    () =>
      [0, 1, 2, 3].map((i) => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(181 * 3), 3),
        );
        return new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({
            color:
              i % 2
                ? new THREE.Color(1, 2.5, 3.5)
                : new THREE.Color(3, 1.4, 0.4),
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
          }),
        );
      }),
    [],
  );
  useEffect(
    () => () => {
      lines.forEach((line) => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
    },
    [lines],
  );
  useFrame(() => {
    for (let j = 0; j < lines.length; j++) {
      const a = lines[j].geometry.attributes.position;
      for (let i = 0; i <= 180; i++) {
        const u = i / 180,
          env = Math.sin(u * Math.PI);
        a.setXYZ(
          i,
          (u - 0.5) * 11,
          Math.sin(u * Math.PI * 4 + time * 0.65 + j * Math.PI) * env * 0.65,
          -15 + Math.cos(u * Math.PI * 4 + time * 0.65 + j) * env * 0.6,
        );
      }
      a.needsUpdate = true;
    }
  });
  return (
    <>
      {lines.map((line, i) => (
        <primitive object={line} key={i} />
      ))}
    </>
  );
}
