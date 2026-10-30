# 定積分と微分

数学Ⅲ。F(x) = ∫₀ˣ (x−t) cos t dt を、分解・部分積分・ライプニッツの公式の3つの道で微分する90秒映画。作品タイトルは動画に挿入せず、ページと教材一覧で表示します。

## 映像と操作

- `../../public/media/teisekibun-to-bibun/teisekibun_to_bibun_90s.mp4`：1920×1080、30fps、90秒。
- `../../public/media/teisekibun-to-bibun/teisekibun_to_bibun_instagram_30s.mp4`：1080×1920、30fps、30秒。ページでプレビュー・実ファイルのダウンロードが可能。
- 両方ともH.264 / yuv420p / AAC stereo。ナレーションなし。独自生成のBGM・効果音付き。
- HTML videoによる再生・停止・シーク・全画面表示。解法ごとのジャンプボタンを設置。

## オリジナルの動的背景

背景は静止画像ではなく、Canvasへ透視投影する3D座標、カメラの旋回・前進、18本の光フィラメント、流れる粒子、数式、渦、波面格子から毎フレーム生成します。`model.js` の単一時間から、数式の位相・項の移動・衝突・波紋・パラメータ依存グラフ・背景を決定。シーク履歴に依存しません。参考画像は素材として複製していません。

KaTeXで生成した透過PNGを最終解像度で合成。分数・添字・上付き・積分範囲をラスタライズ後も保持します。ページの解説も同梱KaTeXで組版します。

## 数学

1. F = x∫cos t dt − ∫t cos t dt。積の微分で生じる +x cos x と −x cos x を相殺。
2. tで部分積分。原始関数 (x−t) sin t − cos t を0とxで評価し、F = 1−cos x。その後xで微分。
3. 上端の寄与 f(x,x) は0。∂f/∂x = cos t を既存区間にわたって積分する寄与が残る。

いずれも F′ = sin x。第3幕の図は正のxでの例です。一般の実数xでも向き付き積分により同じ等式が成立します。青は既存区間での関数の変化、金は新しい小区間。後者の面積は O(Δx²) で、微分の極限では0となります。表示用の小区間幅は Δx = 0.12。

## 制作・検証

- `math-source.js` → `render/generate-math.mjs`：36点の数式素材。
- `film.js`：ブラウザとNodeに共通の決定的描画。
- `render/audio.py`：音源を外部利用しない独自スコア生成。
- `render/export.mjs 90` / `30`：同じ描画から実MP4を書き出し、FFprobeと全デコードで検証。
- `render/check.mjs`：負のxを含む独立数値積分、微分、端点ゼロ、シーク復元、動的フレーム、31場面の見切れと140時刻の数式間の重なり確認。
- `render/playback.check.mjs`：教材カード、PCとスマートフォン相当画面の動画再生・シーク、実MP4保存、ページ組版を確認。

依存関係は既存リポジトリのKaTeX、`render/package.json`のPlaywrightと@napi-rs/canvas。Noto Sans CJK JPを使用。既存の参考教材は `../trig-integral-cinema/`。既存教材は変更・置換しません。
