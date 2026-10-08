import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { samples, type Problem } from "./math";
type Props = {
  p: Problem;
  range: [number, number];
  x: number;
  c: number;
  low: boolean;
};
export default function Family({ p, range, x, c, low }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const renderRef = useRef<(() => void) | null>(null);
  const [error, setError] = useState("");
  const dynamic = useRef<THREE.Group | null>(null);
  useEffect(() => {
    if (!host.current) return;
    const el = host.current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !low, alpha: true });
    } catch {
      setError(
        "この端末では3D描画を開始できません。2Dモードで同じ数学的関係を探究できます。",
      );
      return;
    }
    setError("");
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, low ? 1 : 1.5));
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    camera.up.set(0, 0, 1);
    camera.position.set(12, -17, 13);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = false;
    controls.minDistance = 5;
    controls.maxDistance = 65;
    const draw = () => renderer.render(scene, camera);
    renderRef.current = draw;
    controls.addEventListener("change", draw);
    const axes = new THREE.Group();
    const line = (pts: number[][], color: number) => {
      const g = new THREE.BufferGeometry().setFromPoints(
        pts.map((v) => new THREE.Vector3(...(v as [number, number, number]))),
      );
      return new THREE.Line(g, new THREE.LineBasicMaterial({ color }));
    };
    axes.add(
      line(
        [
          [-6, 0, 0],
          [6, 0, 0],
        ],
        0x65ceff,
      ),
      line(
        [
          [0, -5, 0],
          [0, 5, 0],
        ],
        0xbb9dff,
      ),
      line(
        [
          [0, 0, -10],
          [0, 0, 10],
        ],
        0x61e6a7,
      ),
    );
    const label = (txt: string, pos: number[], color: string) => {
      const cv = document.createElement("canvas");
      cv.width = 256;
      cv.height = 64;
      const ctx = cv.getContext("2d")!;
      ctx.font = "28px sans-serif";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.fillText(txt, 128, 42);
      const map = new THREE.CanvasTexture(cv);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map, depthTest: false }),
      );
      sprite.position.set(...(pos as [number, number, number]));
      sprite.scale.set(3.3, 0.83, 1);
      axes.add(sprite);
    };
    label("x", [7, 0, 0], "#65ceff");
    label("y = C", [0, 6, 0], "#bb9dff");
    label("z = F(x)+C", [0, 0, 11], "#61e6a7");
    for (let t = -6; t <= 6; t += 2) {
      axes.add(
        line(
          [
            [t, -0.13, 0],
            [t, 0.13, 0],
          ],
          0x71839b,
        ),
      );
      if (t) label(String(t), [t, -0.6, 0], "#b2c5dd");
    }
    for (let t = -4; t <= 4; t += 2) {
      axes.add(
        line(
          [
            [-0.13, t, 0],
            [0.13, t, 0],
          ],
          0x71839b,
        ),
      );
      if (t) label(String(t), [-0.7, t, 0], "#b2c5dd");
    }
    for (let t = -8; t <= 8; t += 4) {
      if (t) label(String(t), [-0.8, 0, t], "#b2c5dd");
    }
    for (let t = -6; t <= 6; t++) {
      axes.add(
        line(
          [
            [t, -4, 0],
            [t, 4, 0],
          ],
          0x203048,
        ),
      );
    }
    for (let t = -4; t <= 4; t++) {
      axes.add(
        line(
          [
            [-6, t, 0],
            [6, t, 0],
          ],
          0x203048,
        ),
      );
    }
    scene.add(axes);
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    return () => {
      observer.disconnect();
      controls.dispose();
      scene.traverse((obj) => {
        const o = obj as THREE.Mesh;
        if (o.geometry) o.geometry.dispose();
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        ms.forEach((m) => {
          if (m) {
            if ("map" in m) (m.map as THREE.Texture | null)?.dispose();
            m.dispose();
          }
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
      sceneRef.current = null;
      renderRef.current = null;
    };
  }, [low]);
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const old = dynamic.current;
    if (old) {
      scene.remove(old);
      old.traverse((obj) => {
        const o = obj as THREE.Mesh;
        o.geometry?.dispose();
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        ms.forEach((m) => m?.dispose());
      });
    }
    const group = new THREE.Group();
    dynamic.current = group;
    const [lo, hi] = range;
    const N = low ? 60 : 150;
    const Z = 10;
    const curve = (C: number, color: number, opacity: number) => {
      let segment: THREE.Vector3[] = [];
      const flush = () => {
        if (segment.length > 1)
          group.add(
            new THREE.Line(
              new THREE.BufferGeometry().setFromPoints(segment),
              new THREE.LineBasicMaterial({
                color,
                transparent: true,
                opacity,
              }),
            ),
          );
        segment = [];
      };
      samples(p.F, lo, hi, N).forEach(([t, v]) => {
        if (Math.abs(v + C) <= Z) segment.push(new THREE.Vector3(t, C, v + C));
        else flush();
      });
      flush();
    };
    for (let C = -4; C <= 4; C++) curve(C, 0x65ceff, 0.32);
    curve(c, 0xffcf75, 1);
    const verts: number[] = [];
    for (let i = 0; i < N; i++) {
      const t = lo + ((hi - lo) * i) / N,
        t2 = lo + ((hi - lo) * (i + 1)) / N;
      for (let C = -4; C < 4; C += 1) {
        const v = p.F(t),
          v2 = p.F(t2);
        if (
          [v + C, v2 + C, v + C + 1, v2 + C + 1].every((z) => Math.abs(z) <= Z)
        ) {
          verts.push(
            t,
            C,
            v + C,
            t2,
            C,
            v2 + C,
            t,
            C + 1,
            v + C + 1,
            t2,
            C,
            v2 + C,
            t2,
            C + 1,
            v2 + C + 1,
            t,
            C + 1,
            v + C + 1,
          );
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    group.add(
      new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({
          color: 0x448dba,
          transparent: true,
          opacity: 0.13,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      ),
    );
    const z = p.F(x) + c;
    if (Math.abs(z) <= Z) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, low ? 8 : 16, 8),
        new THREE.MeshBasicMaterial({ color: 0xffe1a0 }),
      );
      dot.position.set(x, c, z);
      group.add(dot);
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 12, 8),
        new THREE.MeshBasicMaterial({
          color: 0xffcf75,
          transparent: true,
          opacity: 0.18,
        }),
      );
      halo.position.copy(dot.position);
      group.add(halo);
      let points: THREE.Vector3[] = [];
      samples(
        (t) => z + p.f(x) * (t - x),
        Math.max(lo, x - 0.75),
        Math.min(hi, x + 0.75),
        40,
      ).forEach(([t, v]) => {
        if (Math.abs(v) <= Z) points.push(new THREE.Vector3(t, c, v));
      });
      group.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({ color: 0xffe3a5 }),
        ),
      );
    }
    scene.add(group);
    renderRef.current?.();
  }, [p, range[0], range[1], x, c, low]);
  return (
    <section className="family">
      <div className="plot-heading">
        <b>03 原始関数ファミリー</b>
        <span>金色：選択した C = {c.toFixed(2)}</span>
      </div>
      <div
        className="three-host"
        ref={host}
        aria-label="回転・拡大できる原始関数曲面"
      />
      {error && <p role="alert">{error}</p>}
      <div className="plot-foot">
        <span>ドラッグ／指1本：回転 · ホイール／指2本：拡大・移動</span>
        <span>表示範囲 |z| ≤ 10 · 曲面 −4 ≤ C ≤ 4</span>
      </div>
    </section>
  );
}
