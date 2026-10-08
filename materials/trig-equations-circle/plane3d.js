import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// SVGは2Dの数学図の基準。線と点の座標を読み、3Dの線・球・面として直接構築する。
// SVG画像の貼付けは使わないので、非同期の画像読込やSVGの可視性に依存しない。
export function buildDiagram(items) {
  const group = new THREE.Group();
  for (const item of items) {
    if (item.type === 'point') {
      const material = new THREE.MeshBasicMaterial({ color: item.color });
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(item.radius, 18, 12), material);
      sphere.position.set(...item.position);
      group.add(sphere);
    } else if (item.type === 'halo') {
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(item.radius * .6, item.radius, 48),
        new THREE.MeshBasicMaterial({ color: item.color, transparent: true, opacity: .28, side: THREE.DoubleSide, depthWrite: false }),
      );
      halo.position.set(...item.position);
      halo.userData.pulse = true;
      halo.userData.impact = Boolean(item.impact);
      group.add(halo);
    } else if (item.type === 'line') {
      const points = item.points.map(p => new THREE.Vector3(...p));
      if (points.length < 2) continue;
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = item.dashed
        ? new THREE.LineDashedMaterial({ color: item.color, dashSize: .06, gapSize: .045, transparent: true, opacity: item.opacity ?? 1 })
        : new THREE.LineBasicMaterial({ color: item.color, transparent: true, opacity: item.opacity ?? 1 });
      const line = new THREE.Line(geometry, material);
      if (item.dashed) line.computeLineDistances();
      group.add(line);
      // 発光する重要な線は、線幅に依存しない細い立体の管で表す。
      if (item.thick && !item.dashed) {
        const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
        const tube = new THREE.Mesh(
          new THREE.TubeGeometry(curve, Math.min(240, Math.max(1, points.length - 1)), .012, 6, false),
          new THREE.MeshBasicMaterial({ color: item.color }),
        );
        group.add(tube);
      }
    } else if (item.type === 'sector' && item.points.length > 2) {
      const shape = new THREE.Shape(item.points.map(p => new THREE.Vector2(p[0], p[1])));
      const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape),
        new THREE.MeshBasicMaterial({ color: item.color, transparent: true, opacity: .12, side: THREE.DoubleSide, depthWrite: false }));
      mesh.position.z = -.015;
      group.add(mesh);
    }
  }
  return group;
}

function readDiagram(svg) {
  const height = svg.viewBox.baseVal.height;
  const toWorld = (x, y, z = 0) => [(x - 320) / 100, (height / 2 - y) / 100, z];
  const items = [], labels = [];
  for (const node of svg.querySelectorAll('line,circle,path,text')) {
    const style = getComputedStyle(node);
    const cls = node.getAttribute('class') || '';
    const stroke = style.stroke, fill = style.fill;
    if (node.tagName.toLowerCase() === 'text') {
      labels.push({ text: node.textContent, position: toWorld(Number(node.getAttribute('x')), Number(node.getAttribute('y')), .08), color: fill === 'none' ? '#dceaf7' : fill });
      continue;
    }
    if (node.tagName.toLowerCase() === 'circle' && fill !== 'none' && !cls.includes('circle')) {
      const position = toWorld(Number(node.getAttribute('cx')), Number(node.getAttribute('cy')), cls.includes('halo') ? .015 : .06);
      items.push({ type: cls.includes('halo') ? 'halo' : 'point', position, radius: Number(node.getAttribute('r')) / 100, color: cls.includes('impact-halo') ? '#ff303f' : cls.includes('halo') ? '#ffcf76' : fill, impact: cls.includes('impact-halo') });
      continue;
    }
    // SVGGeometryElementの標準APIで、半円・円・扇形を同じ座標系にサンプルする。
    const length = node.getTotalLength();
    if (!Number.isFinite(length) || length < .001) continue;
    const segments = Math.max(1, Math.ceil(length / 4));
    const points = Array.from({ length: segments + 1 }, (_, i) => {
      const p = node.getPointAtLength(length * i / segments);
      return toWorld(p.x, p.y, cls.includes('grid') ? -.035 : .02);
    });
    if (cls.includes('sector')) items.push({ type: 'sector', points, color: '#65e3e6' });
    if (stroke !== 'none') items.push({ type: 'line', points, color: stroke,
      dashed: style.strokeDasharray !== 'none' && style.strokeDasharray !== '0px',
      thick: /condition|radiusline|travel|lap2|xedge|yedge|upper/.test(cls),
      opacity: cls.includes('grid') ? .7 : 1 });
  }
  return { items, labels };
}

function createLabel(label) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = '28px sans-serif';
  const width = Math.ceil(context.measureText(label.text).width) + 20;
  canvas.width = width; canvas.height = 48;
  context.font = '28px sans-serif';
  context.textBaseline = 'middle';
  context.lineWidth = 5; context.strokeStyle = '#0b1422';
  context.strokeText(label.text, 10, 24);
  context.fillStyle = label.color; context.fillText(label.text, 10, 24);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(width / 200, .24, 1);
  // SVGの左寄せ・ベースラインに合わせる。ラベルは常に視点を向く。
  sprite.center.set(0, .35);
  sprite.position.set(...label.position);
  return sprite;
}

function disposeDiagram(group) {
  group.traverse(object => {
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      material?.map?.dispose(); material?.dispose();
    }
  });
}

export function createPlaneView(stage, svg) {
  let active = false, renderer, scene, camera, controls, diagram, raf = 0, dirty = true;
  const help = document.createElement('p');
  help.className = 'orbit-help';
  help.textContent = 'ドラッグ：回転 ／ ホイール・ピンチ：拡大 ／ 右ドラッグ・2本指：移動。円・点・補助線は同じxy平面にあります。';
  help.hidden = true; stage.after(help);
  const reset = document.createElement('button');
  reset.textContent = '視点を初期位置に戻す'; reset.hidden = true; help.after(reset);
  function home() {
    camera.position.set(1.4, -2.2, 8.8);
    camera.up.set(0, 1, 0); controls.target.set(0, 0, 0); controls.update();
  }
  reset.onclick = home;
  function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x0b1422, 1); stage.append(renderer.domElement);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(43, 1, .1, 100);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.minDistance = 3; controls.maxDistance = 18;
    // 周囲の空間も見え、xy平面の向きが分かる控えめなz軸。
    const zAxis = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, (svg.viewBox.baseVal.height / 2 - 295) / 100, -1.1),
      new THREE.Vector3(0, (svg.viewBox.baseVal.height / 2 - 295) / 100, 1.1),
    ]), new THREE.LineDashedMaterial({ color: 0x53677c, dashSize: .07, gapSize: .06, transparent: true, opacity: .5 }));
    zAxis.computeLineDistances(); scene.add(zAxis);
    scene.add(createLabel({ text: 'z（視点用）', position: [0, (svg.viewBox.baseVal.height / 2 - 295) / 100, 1.2], color: '#7c94aa' }));
    home();
  }
  function refresh() {
    const data = readDiagram(svg), next = buildDiagram(data.items);
    for (const label of data.labels) next.add(createLabel(label));
    if (diagram) { scene.remove(diagram); disposeDiagram(diagram); }
    diagram = next; scene.add(diagram); dirty = false;
  }
  function render(time = 0) {
    if (!active) return;
    try {
      const width = stage.clientWidth, height = width * svg.viewBox.baseVal.height / 640;
      renderer.setSize(width, height, false);
      camera.aspect = width / height; camera.updateProjectionMatrix();
      if (dirty) refresh();
      diagram?.children.forEach(object => {
        if (object.userData.pulse) { object.scale.setScalar(1 + (object.userData.impact ? .3 : .22) * Math.sin(time / 240)); object.material.opacity = (object.userData.impact ? .55 : .25) + .12 * Math.sin(time / 240); }
      });
      controls.update(); renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    } catch (error) { fallback(); }
  }
  function showSvg() {
    svg.style.position = ''; svg.style.visibility = ''; svg.style.pointerEvents = ''; svg.style.transform = 'none';
    if (renderer) renderer.domElement.hidden = true;
  }
  function fallback() {
    active = false; cancelAnimationFrame(raf); showSvg();
    help.hidden = false; help.textContent = '3D表示を開始できませんでした。2D図は引き続き操作できます。'; reset.hidden = true;
  }
  new MutationObserver(() => { dirty = true; }).observe(svg, { childList: true, subtree: true });
  return {
    set(value) {
      active = value; help.hidden = !value; reset.hidden = !value;
      if (!value) { cancelAnimationFrame(raf); showSvg(); return true; }
      try {
        if (!renderer) init();
        svg.style.transform = 'none'; svg.style.position = 'absolute';
        svg.style.visibility = 'hidden'; svg.style.pointerEvents = 'none';
        renderer.domElement.hidden = false; dirty = true;
        // 初回構築を同期に検証し、枠だけの空白を成功扱いにしない。
        refresh(); cancelAnimationFrame(raf); render(); return active;
      } catch (error) { fallback(); return false; }
    },
  };
}
