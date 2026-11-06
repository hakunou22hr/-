# 積分が生み出す立体

数学Ⅲ・例題22。既存教材と独立した新規教材です。`material.json` が既存ポータルの自動登録に使われます。

## 開く

リポジトリのルートで `npm run dev`。`/materials/integral-solid-cinema/` を開きます。

- 映画版：90秒の実時間WebGLアニメーション。再生・停止・シーク・速度切替・全画面。
- 操作版：位置、表示、断面数、2D投影、三平方、計算段階、答えの表示を操作。
- 縦型版：同じ `model.js` と `app.js` を用いた30秒編集。
- MP4：`public/media/integral-solid-cinema/integral-solid-30s.mp4`。

## 数学モデル

描画上の座標は `(x, height, breadth)`。底面を `height=0` とし、各断面は
`(x,0,−sqrt(a²−x²))`, `(x,0,+sqrt(a²−x²))`, `(x,h,0)`。
断面の位置が変わっても頂点の高さは h。円錐や半球への置き換えはありません。
`solidVertices()` が対応する三辺をつないだ閉じた三角形メッシュを逐次生成します。
`volumeTo()` は正確な原始関数を使い、現在までに生成された体積を返します。
表示モデルは a=2、h=2.5。全体積=5π。

## 検証

`node materials/integral-solid-cinema/tests/mathematics.check.mjs`

独立した積分式とメッシュの四面体分解による体積を、5つの生成位置で照合。
端点・中央・左右対称性・高さ・弦の範囲・短縮タイムラインも検証。

## MP4を再生成する

Node.js、Playwright（Chromium）、FFmpegが必要です。
ローカルサーバーを起動してから、`render/export.cjs` の引数にURLと保存先を指定。
MP4は1080×1920、60fps、H.264、yuv420p、無音、30秒。
別モデルによる疑似映像ではなく、教材のWebGLと数式を1/60秒ごとに描画したものです。

## 実装上の範囲

目標60fpsの実時間描画速度は端末によって変わります。MP4は固定60fps。
90秒版はブラウザアニメーションとして提供し、90秒MP4は今回生成していません。
2Dは底面を真上から見た投影です。任意半径・高さのUI変更は対象外です。
実機のiPad/iPhoneでの検証は未実施。Chromiumの390px、768px、1440px幅で確認。
3D光表現はリアルタイムの透過メッシュ・線・粒子・スプライトで実装しています。

## 依存ライセンス

Three.js および KaTeX（MIT）を `vendor/` に同梱しています。各 LICENSE を参照。
