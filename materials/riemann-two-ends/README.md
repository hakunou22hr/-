# 区分求積法の右端と左端、２種類

既存ライブラリの `material.json` 自動登録方式に沿った独立教材。
作品名はライブラリとファイル管理用。映像内は数学的表示のみ、音声なし。

## 再生

`npm run dev -- --host 127.0.0.1 --port 4173` 後、`/materials/riemann-two-ends/`。
主教材は90秒の実MP4。30秒版切替、別の縦型プレビュー、両MP4保存リンクを用意。
ブラウザ標準の再生・一時停止・シークに加えて、3Dライブには再生・停止・最初から・シーク操作。
MP4へ戻るには「MP4で見る」。

## 実装

- `model.js`: 90秒・30秒タイムライン、平方和、KaTeXの原式。
- `film.js`: Three.jsで実3Dカメラ、リング、星粒子、床グリッド、長方形と曲線を毎フレーム生成。
- `math/*.png`: KaTeX出力を透明画像化。動画とライブが同じ数式素材を使用。
- `render/math.cjs`: 数式再生成。ルートで実行。
- `render/offline.mjs`: Three.jsのPerspectiveCameraで3D点・リング・グリッド・長方形を射影し、Canvasで全フレームを直接描画してffmpegでH.264 MP4へ出力。ブラウザのWebGL実装と共通の数学モデル・タイムライン・数式素材・カメラ式を使用。
- `render/export.cjs`: ブラウザWebGLの低速な読み戻し経由で出力する代替手段。
- `tests/check.cjs`: 独立した直接和との比較、上下界と差、両タイムライン、WebGLシーンの検証。

0–12 / 12–32 / 32–52 / 52–73 / 73–90秒。縦型は0–5 / 5–12 / 12–19 / 19–25 / 25–30秒。
`state(t,d)` が単一の時計。シーク後も形状・背景・カメラ・数式が同じ時刻へ移動する。
右端長方形の高さは(k/n)²、左端は((k−1)/n)²。分割時には親長方形の高さから子へ連続補間する。
左端の不足分は青い面、右端は金、左端は紫。
縦型では比較グラフを上下へ再配置し、数式は下部の専用領域へ配置。

## 再出力

Chromium、ffmpegが必要。再レンダリング用の依存は `npm install --prefix materials/riemann-two-ends/render`。ブラウザ検証では `PLAYWRIGHT_MODULE_PATH` にその node_modules/playwright の絶対パスを指定できる。既存Viteを4173で起動してから:

```
node materials/riemann-two-ends/render/math.cjs
node materials/riemann-two-ends/render/offline.mjs 30
node materials/riemann-two-ends/render/offline.mjs 90
node materials/riemann-two-ends/tests/check.cjs
npm run build
```

MP4は1920×1080 / 1080×1920・60fpsで全フレームを個別描画。補間なし。ライブのWebGLは出力の各辺1/2、オフラインMP4は図形・数式・文字とも出力解像度で描画する。

生成先: `public/media/riemann-two-ends/instagram-30s.mp4` と `lesson-90s.mp4`。
中間フレームは `work/riemann-two-ends/`。

今回参照できた添付は制作命令書のみ。元の「区分求積法.pdf」は同梱されていないため、命令書の関数・区間・式を数学的基準にした。

## 背景の改訂（nebula-v2）

青い星雲を3次元ノイズの密度場から生成し、時間とカメラ位置で変形させる。密度場は8Hzで計算し、隣接する2時刻を毎フレーム補間して60fpsで表示する。静止画像の拡大・移動による背景ではない。太い多層発光の軌道、3Dの火花と光跡、金・紫の面のグラデーション、床に映る長方形を追加した。

`cinema-effects.js` はブラウザとMP4で共通。`cameraPose` による連続したカメラ軌道も共通。シーン境界でカメラ位置が飛ばない。数式・区間・分割数と両動画の長さは保持。

作品ページの「背景の変更前・変更後を見る」で4場面を比較できる。サムネイルも新しい実描画へ更新した。動画URLの `v=nebula-v2` で旧MP4のキャッシュを回避する。

`node materials/riemann-two-ends/tests/atmosphere.mjs` で、カメラを固定しても背景が変形すること、明るい雲と軌道が存在すること、シークの再現性、シーン境界のカメラ連続性を確認できる。
