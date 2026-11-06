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
当初の90秒WebGL版はそのまま残しています。追加の映画版「黒板の、その先へ。」は90秒・30秒ともMP4で提供します。
2Dは底面を真上から見た投影です。任意半径・高さのUI変更は対象外です。
実機のiPad/iPhoneでの検証は未実施。Chromiumの390px、768px、1440px幅で確認。
3D光表現はリアルタイムの透過メッシュ・線・粒子・スプライトで実装しています。

## 依存ライセンス

Three.js および KaTeX（MIT）を `vendor/` に同梱しています。各 LICENSE を参照。

## 追加映画：黒板の、その先へ。

既存の操作教材・90秒WebGL版・元の30秒MP4を保持したまま、授業風景から黒板に入り込む映画を追加しています。
`lesson-original.html` は初回公開時の教材で、`app-original.js` と `style-original.css` は公開済みコードの完全な保存コピーです。
教材一覧での名称・登録先は従来の `integral-solid-cinema` を維持しています。

- 90秒映画：`public/media/integral-solid-cinema/classroom-90s.mp4`。教材ページ内のネイティブvideoで再生。
- Instagram30秒映画：`public/media/integral-solid-cinema/classroom-30s.mp4`。9:16の縦型編集。
- 映画描画：`cinema.html` / `cinema.js` / `cinema-timeline.js`。
- 教室セットの画像出典・音の説明：`cinema-assets/CREDITS.txt`。
- 映画検証：`node materials/integral-solid-cinema/tests/cinema.check.mjs`。

教室の導入はライブラリ既存のAI生成画像を使った奥行きのあるカメラ演出です。実写の授業動画ではありません。
黒板に描かれるチョーク、光のゲート、粒子と、内部の数学的な3Dメッシュを時刻に合わせて動かしています。
映画の数学モデルは教材本体と同じです。高さを変えず、三角形を移動して立体を生成します。

### 映画を再生成する

Playwright（Chromium）、FFmpeg、Python（NumPy）を用意し、リポジトリで `npm run dev` を起動します。
音源は `python materials/integral-solid-cinema/render/soundtrack.py work/classroom-audio` で生成します。
その後 `MOVIE_AUDIO_DIR=work/classroom-audio node materials/integral-solid-cinema/render/classroom-export.cjs 90 http://localhost:5173/materials/integral-solid-cinema/cinema.html work/classroom-90s.mp4` を実行します。
30秒版は第1引数を30に変更します。Playwrightの設置先が異なる場合は `PLAYWRIGHT_MODULE`、Chromiumの設置先は `CHROMIUM_BIN` で指定できます。
各フレームを1/60秒ずつ計算し、実際の3Dモデルと数式組版を合成します。教室セットの平面テクスチャは同じ3Dカメラの射影を2Dキャンバスで計算し、黒板内の数学はWebGLで描画します。

Instagram版は、アプリの下部表示に主な数式が隠れにくいよう、同じ縦型映像を均等に縮小して内枠と下部の余白を設けています。数学的な形の縦横比は変えていません。
