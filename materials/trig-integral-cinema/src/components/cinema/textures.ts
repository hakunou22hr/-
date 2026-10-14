import * as THREE from "three";
export function seeded(index: number) {
  const v = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
}
export function formulaTexture(floor = false) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const g = c.getContext("2d")!;
  g.fillStyle = "#04101b";
  g.fillRect(0, 0, 1024, 1024);
  const fragments = [
    "sin² x = (1 − cos 2x)/2",
    "∫ cos 2x dx = ½ sin 2x + C",
    "sin 3x cos x = ½(sin 4x + sin 2x)",
    "∫ sin ax dx = −cos ax / a + C  (a ≠ 0)",
    "3x + x = 4x      3x − x = 2x",
    "∫ sin² x dx = x/2 − sin 2x/4 + C",
  ];
  g.font = `${floor ? 33 : 31}px Georgia, serif`;
  g.textBaseline = "middle";
  for (let row = 0; row < 19; row++) {
    g.fillStyle =
      row % 5 === 0
        ? "#ffe5ac"
        : `rgba(140,224,255,${0.38 + seeded(row) * 0.54})`;
    g.fillText(
      fragments[row % fragments.length],
      35 + (row % 3) * 22,
      35 + row * 53,
    );
  }
  g.strokeStyle = "#24546a";
  g.lineWidth = 1;
  for (let x = 0; x <= 1024; x += 128) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 1024);
    g.stroke();
  }
  for (let y = 0; y <= 1024; y += 128) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(1024, y);
    g.stroke();
  }
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
export function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const gradient = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.18, "rgba(255,255,255,.85)");
  gradient.addColorStop(0.5, "rgba(255,255,255,.2)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gradient;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
/** Actual glyph silhouettes, used as the source and destination of the particle morph. */
export function glyphPositions(text: string) {
  const c = document.createElement("canvas");
  c.width = 960;
  c.height = 200;
  const g = c.getContext("2d")!;
  g.fillStyle = "white";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "bold 86px Georgia, serif";
  g.fillText(text, 480, 100, 920);
  const pixels = g.getImageData(0, 0, 960, 200).data;
  const pts: number[][] = [];
  for (let y = 0; y < 200; y += 3)
    for (let x = 0; x < 960; x += 3)
      if (pixels[(y * 960 + x) * 4 + 3] > 150)
        pts.push([(x - 480) / 65, (100 - y) / 65, 0]);
  return pts;
}
