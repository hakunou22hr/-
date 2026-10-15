# 数学Ⅲ｜積分の中に眠る円

映画型90秒・30秒（16:9）と30秒（9:16）。教師・ナレーションなし。オリジナル合成BGMと効果音付き。

## 既存教材の調査と再利用

最初に `materials/trig-integral-cinema` を調査した。既存ファイルは変更しない。

- `src/components/Space.tsx`：時刻に基づくカメラ位置、粒子空間。
- `src/components/cinema/FormulaTunnel.tsx`：奥行き方向へ移動する空間セクション、グリッド、光の曲線。
- `src/components/cinema/GoldenRelease.tsx`：回転リング、金色の粒子、多面体。
- `src/components/cinema/textures.ts`：`seeded` を再利用。Canvas上の文字ピクセルをサンプリングする `glyphPositions` の方法を新作の粒子変形に移植。
- `src/utils/shortAudio.ts`：低音の周波数構成と split / merge / gold の合成音設計を再利用し、新しい和声・アルペジオ・編集点に対応。
- `render/render-short.mjs`：固定30fps、音声同梱、H.264/AAC、フレーム数・尺のffprobe検証を引き継ぐ。

既存のReact/WebGLコンポーネントを直接変更せず、上記の粒子・透視投影・リング・文字サンプリング・音響の仕組みを新作のCanvas2Dレンダラーへ移植。ブラウザとサーバーのどちらでも同じ時刻から同じ画を作る。以前の四分円・宇宙的軌道の背景画像原本は作業環境で見つからなかったため、依頼文のデザインをプログラムで構成した。画像原本との一致確認は未実施。

## 構成

- `film.js`：背景、図形、数式・効果の3レイヤー。固定seedと絶対時刻のみを用いる。前フレームへの依存なし。
- `player.js`：通常は完成MP4を再生。「プログラム描画で見る」ではMP4の音声と再生時刻を使ってCanvasを描画。再生、一時停止、シーク、リセット、消音、全画面。
- `cuts90`：0 / 10 / 23 / 38 / 54 / 69 / 81 / 90。
- `cuts30`：0 / 4 / 9 / 15 / 18 / 20 / 22 / 30。3倍速ではない独立編集。
- `public/media/sleeping-circle`：実体のある完成MP4。各リンクは同一オリジンのファイルを指す。
- `material.json`：既存ライブラリの自動検出により新作を追加。

数学上、θは正のy軸から時計回りに測り、P=(2sinθ,2cosθ)。0≤θ≤π/2のためcosθ≥0。半径2の円の第一象限と積分範囲0≤x≤2が一致する。

## 再生成（有料API不要）

Node.js、FFmpeg、Python+NumPy、Noto CJK・DejaVuフォントが必要。Linuxフォントパスは `render/render.mjs` / `render/check.mjs` に記載。`@napi-rs/canvas` が解決できる環境で次を実行する（必要なら `npm install --prefix materials/sleeping-circle/render`）。

```sh
mkdir -p work/sleeping-circle
python materials/sleeping-circle/render/audio.py work/sleeping-circle
node materials/sleeping-circle/render/check.mjs
node materials/sleeping-circle/render/render.mjs 90
node materials/sleeping-circle/render/render.mjs 30
node materials/sleeping-circle/render/render.mjs 30 portrait
npm run test:trig-cinema
npm run build
```

MP4は全フレームを実時間に依存せず描画し、音声を同時にエンコード。録画のフレーム落ちを避ける。出力はH.264 / yuv420p、AACステレオ48kHz、30fps、faststart。

## 検証

`render/check.mjs` は全場面・各レイアウトの数式境界、背景の時刻間差分、シーク前後の画像一致、座標と三角置換、符号条件、積分値πを検査。`render/render.mjs` は正確なフレーム数、サイズ、尺、音声・映像形式を確認し、全ファイルを再デコードする。フォントはシステムのNoto CJK（SIL OFL）/ DejaVu（Bitstream系ライセンス）を使用。音楽・効果音はこの作品用に数式合成した。
