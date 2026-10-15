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

既存のReact/WebGLコンポーネントを直接変更せず、上記の粒子・透視投影・リング・文字サンプリング・音響の仕組みを新作のCanvas2Dレンダラーへ移植。ブラウザとサーバーのどちらでも同じ時刻から同じ画を作る。今回提示された参照画像の、青い星雲と金色の光流、数式回廊、発光する極座標グリッドを背景の制作基準として再構成した。

## 構成

- `film.js`：背景、図形、数式・効果の3レイヤー。固定seedと絶対時刻のみを用いる。前フレームへの依存なし。
- `player.js`：通常は完成MP4を再生。「プログラム描画で見る」ではMP4の音声と再生時刻を使ってCanvasを描画。再生、一時停止、シーク、リセット、消音、全画面。
- `cuts90`：0 / 10 / 23 / 38 / 54 / 69 / 81 / 90。
- `cuts30`：0 / 4 / 9 / 15 / 18 / 20 / 22 / 30。3倍速ではない独立編集。
- `public/media/sleeping-circle`：実体のある完成MP4。各リンクは同一オリジンのファイルを指す。
- `material.json`：既存ライブラリの自動検出により新作を追加。

数学上、θは正のy軸から時計回りに測り、P=(2sinθ,2cosθ)。0≤θ≤π/2のためcosθ≥0。半径2の円の第一象限と積分範囲0≤x≤2が一致する。

## 再生成（有料API不要）

Node.js、FFmpeg、Python+NumPy、Noto CJKフォントが必要。Linuxフォントパスは `render/render.mjs` / `render/check.mjs` に記載。`@napi-rs/canvas` が解決できる環境で次を実行する（必要なら `npm install --prefix materials/sleeping-circle/render`）。

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

`render/check.mjs` は全場面・各レイアウトの数式境界、背景の時刻間差分、シーク前後の画像一致、座標と三角置換、符号条件、積分値πを検査。`render/render.mjs` は正確なフレーム数、サイズ、尺、音声・映像形式を確認し、全ファイルを再デコードする。日本語はシステムのNoto CJK（SIL OFL）、数式は既存教材と同じKaTeXの組版を使用。音楽・効果音はこの作品用に数式合成した。

## 背景改訂 1.1（2026-10-15）

`background.js` を分離し、線と点が主体だった背景を作り直した。

- フラクタルノイズとドメインワープで青い星雲の密度・明るい縁・暗い襞を生成。複数の雲の層を個別に変形・回転・移動させる。
- 金色と青白色の光流は螺旋曲線に沿って進む。粒子と数式が光流を移動し、渦へ収束する。低解像度の独立した光レイヤーを合成して光のにじみを作る。
- 数式の壁と床をカメラで透視投影する。奥行き方向の進行、カメラの回り込み、発光する柱と浮遊する数式、床面の光が連動する。
- 円の場面では同心円・放射線・走査光・回転する外周の目盛を重ねたホログラムを表示。
- 前景数式はフルHDの独立レイヤーで描画し、背後の柔らかい遮光で可読性を確保。星雲などの柔らかい大気層は1280×720で描画してフルHDへ合成する。

画像を背景として固定表示する構成ではない。数式・図形・BGM・効果音・編集尺は保持し、90秒・30秒・縦型30秒を同じ新しい背景コードから再出力する。初版はGitのコミット `8c021176a8f88a92b70a07cd58a79f8a4c8b8090` に保存される。プレーヤーとダウンロードURLには改訂識別子を付けて旧映像のキャッシュを避ける。


## 数式・照明改訂 1.2（2026-10-16）

既存の `trig-integral-cinema/src/components/Formula.tsx` と同じKaTeXを使って数式を組版。`math-source.js` のTeXを `render/generate-math.mjs` で透過PNGへ生成する。根号は `\sqrt{4-x^2}` のように被開平式全体を包み、指数・分数・積分区間・評価式の上下端もTeXで組み立てる。πは小文字の数学記号を使う。`math.js` は同じ透過素材をブラウザとMP4へ描画し、背景の数式と粒子の形状にも再利用する。静的なのは個々の文字の素材であり、数式・壁面・光流の位置と形状は時刻から動的に計算する。

素材を再生成する場合は、Playwrightと `/usr/bin/chromium` が使える環境で、開発サーバーをポート4173に起動して次を実行する。KaTeXはルートの依存関係を使用。通常の再生・動画出力ではKaTeXの実行やネット接続は不要。

```sh
node materials/sleeping-circle/render/generate-math.mjs
```

`loadMath()` 完了後に `createFilm()` を呼ぶ。動的な数値ラベルにもKaTeX Mainを読み込む。ライセンスは `math/LICENSE-KaTeX.txt` に同梱。

背景は星雲・基調色を明るくし、中央の遮光と周辺の減光を調整。壁・天井・床の境界に光が奥行き方向へ走り、発光する四角いゲートが手前へ通過する。左右の壁には枝分かれする青白い稲妻と、周囲を照らす減衰光を加えた。式の変形に合わせた金色の光も重ねる。すべて絶対時刻から再現し、既存のBGM・効果音、数学的な座標対応、90秒・30秒の編集尺を保持する。旧教材62ファイルはハッシュ照合で保護する。


## 再生停止の修正 1.2.1（2026-10-16）

3Mbps・遅延100msの回線で旧プレーヤーを検証したところ、先頭0.32秒で読み込み待ちになり、16秒経過しても動画時刻は約5.38秒にとどまった。約100MB・平均8.65MbpsのフルHD MP4を通常再生に使用していたため、実回線で連続再生できなかった。

通常再生は `*-play.mp4`（横1280×720／縦720×1280、H.264 Constrained Baseline Level 3.1、30fps、映像最大2Mbps、キーフレーム間隔2秒、faststart）へ切り替える。音声はフルHD版からコピーする。ダウンロードは従来の1920×1080／1080×1920のマスターを維持する。マスターから再生用ファイルを生成するには次を実行する。

```sh
node materials/sleeping-circle/render/playback.mjs
```

通常再生時はCanvas・ノイズ生成・数式画像の事前読み込みを行わず、「プログラム描画で見る」が選択されたときだけ準備する。待機中は読み込み表示を出し、標準の動画単体ページへ開くリンクも用意する。JavaScriptが読み込めない場合もHTMLの標準動画コントロールで操作できる。

連続再生の回帰検査は、開発サーバーの起動後に `node materials/sleeping-circle/render/playback.check.cjs` を実行する。3Mbps・遅延100msで各版を10秒間再生し、再バッファリング、終端へのシーク、終了、リセット、描画モードの遅延初期化を確認する。`CIRCLE_TEST_ORIGIN` で検証サーバーのURLを指定できる。

公開用ビルドの90秒版は3Mbps・遅延100msの回線で、シークせず0秒から90秒まで連続再生して検証した。再生開始後の再バッファリングはなく、終端まで到達した。検査結果は `validation.json` の `playbackFix` に保存する。
