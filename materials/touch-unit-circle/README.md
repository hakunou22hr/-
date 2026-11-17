# 触れる、単位円。
数学Ⅰの三角比から単位円、三角方程式へつなぐ導入教材。既存の trig-cos-equation-3 の前に位置付け、既存教材は変更しません。

## 実行
ライブラリのViteビルド、または静的HTTPサーバーで index.html を開きます。外部ライブラリ・API・フォントの通信は不要です。

## 共通モデルと映画
model.mjs: 範囲、交点、厳密値、180秒の時間軸と字幕。
renderer.mjs: 座標図形、分割格子の頂点変位、3D投影リング、粒子、波紋、動画の描画。
lesson.js: 直接操作、解答表示、自動解説、一時停止と再開。

`node tests/check.mjs` で数値検証。`APP_URL=... PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node tests/check.mjs` で操作と画面幅の検証。

`PLAYWRIGHT_MODULE=... node render/movie.mjs` は共通描画の1920×1080フレームを24fpsのH.264にエンコードします。既定の出力先は public/media/touch-unit-circle-180s-v2.mp4。書き出しはffmpeg、ブラウザ検証はChromiumを使用。

GitHub Actions touch-unit-circle.yml が動画を生成・全編デコードし、新規Release touch-unit-circle-v2 に登録します。既存のPages公開ワークフローは、この動画の生成を待って配信します。Pagesでは同一オリジンのmedia/touch-unit-circle-180s-v2.mp4から配信します。

解答は初期非表示。円全体の交点数と有効範囲内の解の数は別々に表示。角度360°の点は0°と同じですが、解集合では重複せず、全周の範囲は360°を含みません。

実機テストとは別に、1440×1100、1024×768、390×844、844×390のブラウザ表示サイズを検証します。

## 第2版
斜辺2・高さ1・底辺√3の30°の三角形から始め、拡大縮小でsin θ = 高さ/斜辺 = 1/2が一定であることを示します。斜辺を1にすると高さ1/2・底辺√3/2となり、それを半径として単位円を描きます。45°の場合の1/√2とは区別します。図中ラベル・字幕・弧度・解答も縦型分数で統一します。第1版ReleaseとMP4は保持します。
