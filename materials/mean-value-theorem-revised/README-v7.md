# 傾きが出会う瞬間 ― 平均値の定理【改訂版】 v7

## 今回の修正

ユーザー提供の参考画像を基準に、規則的な3色螺旋から、金色の粒子・細い光の断片が不規則に舞う球状ホログラムへ変更。

- 2,200個の粒子を内部と不均一な表面へ分布し、個別の速度・位相・明滅で流す。数学イベントでは少し収束し、再びほどける。
- 傾きと長さの違う112本の途切れた光の線。26個の小さなデータ片、周囲を漂う80本の短い火花を重ねる。
- 16本のフレア風ループと18本の不均一なコロナ状の光を追加。ループ上の発光粒子、周囲の火花、白黄の中心光を重ねる。
- アンバー・金・白熱点を主体に、背面を暗く前面を明るく描く。輪郭は完全な円や整ったコイルにしない。元映画の人物・文字・映像素材は使用していない。
- 粒子の表示域、字幕余白、数式の折り返し、教室、90秒構成、絶対値説明の削除は維持。

## 閲覧

- 教材: https://hakunou22hr.github.io/-/materials/mean-value-theorem-revised/?v=7
- 本編: https://hakunou22hr.github.io/-/media/mean-value-theorem-revised/mean-value-theorem-revised-90s-v7.mp4
- 金色ホログラム10秒: https://hakunou22hr.github.io/-/media/mean-value-theorem-revised/preview-guide-10s-v7.mp4

本編と6プレビューを `-v7` として追加し、v1〜v6は保持。

## 描画と検証

同一の `scene.mjs` の粒子描画を、自動解説とMP4の透過パスに使用する。固定シードと絶対時刻により、同じ時刻は同じ像になる。動きを抑える設定では静止する。音声・音声認識は追加していない。

v4の承認済み背景・数学・教室と、v6で確認済みの72〜84秒のナレーターなしまとめを使い、新しい金色粒子と同じ数式下段の改行を透過合成する。古い螺旋ガイドは重ならない。

```sh
mkdir -p /workspace/work/mvt-v7/solar-delivery
cp /workspace/work/mvt-v6/delivery/part-summary-12s.mp4 /workspace/work/mvt-v7/solar-delivery/part-summary-12s.mp4
OVERLAY_ONLY=1 RANGES='[[12,84,"narrator-layer-72s"]]' OUTPUT=/workspace/work/mvt-v7/solar-delivery node materials/mean-value-theorem-revised/render/movie.mjs
OUTPUT=/workspace/work/mvt-v7/solar-delivery node materials/mean-value-theorem-revised/render/upgrade-v7.mjs
node materials/mean-value-theorem-revised/tests/math.mjs
node materials/mean-value-theorem-revised/tests/guide.mjs
npx vitest run materials/mean-value-theorem-revised/tests/catalog.test.ts
node materials/mean-value-theorem-revised/tests/video.mjs
npm run build
```

元のまとめパスがない場合は `BASE_PASS=1 RANGES='[[72,84,"part-summary-12s"]]'` を指定して同じ `render/movie.mjs` から生成できる。

1920×1080、24fps、H.264/yuv420p、90秒、字幕付き・音声なし。`verification-v7.json` は全編デコード・時間・寸法・フレーム数と旧動画のSHA256。`visual-review-v7.json` は見た目・金色の色域・アルファ画素範囲の確認記録。

公開後のGitHub Actionsで、粒子の動きと静止、金色の色域、画面端・字幕との余白、操作、数学、MP4再生、4画面サイズ、タッチ模擬を確認。実機iPhone/iPad/Safariは未確認。教室は生成画像を使う2.5Dで、人物個別の動作はない。
