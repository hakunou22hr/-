import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cinema } from "../../data/cinema";
/** Copies along z preserve the same mathematical waveform; z is visual depth, not a variable. */
function waveGeometry(fn: (x: number) => number) {
  const vertices: number[] = [];
  const point = (x: number, z: number) => [
    (x / Math.PI) * 6 - 6,
    fn(x) * 2.7 - 1.35,
    z,
  ];
  for (let row = 0; row < cinema.waveRows; row++) {
    const z = (row / (cinema.waveRows - 1) - 0.5) * 7;
    for (let i = 0; i < cinema.waveSamples; i++) {
      vertices.push(
        ...point((i / cinema.waveSamples) * Math.PI * 2, z),
        ...point(((i + 1) / cinema.waveSamples) * Math.PI * 2, z),
      );
    }
  }
  for (let i = 0; i <= 40; i++) {
    const x = (i / 40) * Math.PI * 2;
    vertices.push(...point(x, -3.5), ...point(x, 3.5));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  return g;
}
export function WaveSculpture({
  time,
  scene,
}: {
  time: number;
  scene: number;
}) {
  const root = useRef<THREE.Group>(null),
    red = useRef<THREE.Group>(null),
    blue = useRef<THREE.Group>(null);
  const identity = scene === 5;
  const { camera, size } = useThree();
  const box = useMemo(() => new THREE.Box3(), []);
  const corner = useMemo(() => new THREE.Vector3(), []);
  const local = time - (identity ? 42 : 64);
  const geometries = useMemo(
    () => [
      waveGeometry(identity ? (x) => Math.sin(x) ** 2 : (x) => Math.sin(3 * x)),
      waveGeometry(
        identity ? (x) => (1 - Math.cos(2 * x)) / 2 : (x) => Math.cos(x),
      ),
    ],
    [identity],
  );
  useEffect(
    () => () => {
      geometries.forEach((geometry) => geometry.dispose());
      delete window.cinemaWaveBounds;
    },
    [geometries],
  );
  useFrame(() => {
    const t = identity ? Math.min(1, Math.max(0, local / 7)) : 0;
    if (root.current) {
      root.current.rotation.set(
        -0.32,
        Math.sin(time * 0.17) * 0.12 - 0.23,
        0.14,
      );
      root.current.position.set(0, identity ? 1.6 : -1.2, -1);
    }
    if (red.current) {
      red.current.rotation.z = (1 - t) * -0.25;
      red.current.position.x = (1 - t) * -1.2;
    }
    if (blue.current) {
      blue.current.rotation.z = (1 - t) * 0.25;
      blue.current.position.x = (1 - t) * 1.2;
    }
    if (root.current) {
      root.current.updateWorldMatrix(true, true);
      box.makeEmpty();
      if (red.current) box.expandByObject(red.current);
      if (blue.current) box.expandByObject(blue.current);
      let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
      for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
        corner.set(x, y, z).project(camera);
        const px = (corner.x + 1) * size.width / 2, py = (1 - corner.y) * size.height / 2;
        left = Math.min(left, px); right = Math.max(right, px); top = Math.min(top, py); bottom = Math.max(bottom, py);
      }
      window.cinemaWaveBounds = { left, right, top, bottom };
    }
  });
  return (
    <group ref={root}>
      <group ref={red}>
        <lineSegments geometry={geometries[0]}>
          <lineBasicMaterial
            color={new THREE.Color(2.5, 0.12, 0.22)}
            transparent
            opacity={0.5}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      </group>
      <group ref={blue}>
        <lineSegments geometry={geometries[1]}>
          <lineBasicMaterial
            color={new THREE.Color(0.06, 1.65, 2.7)}
            transparent
            opacity={0.58}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      </group>
      <gridHelper
        args={[16, 16, "#40738a", "#172e40"]}
        position={[0, -1.4, 0]}
      />
    </group>
  );
}
