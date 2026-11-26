# 傾きが出会う瞬間 ― 平均値の定理【改訂版】 v9

## 今回の修正

- 金色の粒子ガイドは、右下・右上への移動中も常に同じ大きさ（330pxの描画領域）を保つ。以前の0.29倍への縮小を廃止。
- 周期の異なる浮遊を重ね、滞在時も小さく上下・左右に漂う。渦、発光、フレアとナレーションの実音声への反応を維持。
- 測定・接線比較・平行発見の説明パネルを折り返し、右側に大きなガイドが通れる連続した空間を確保。元の式の上に粒子を重ねない。
- 声を授業者のアシスタントへ変更。16の短い相づち・確認・注目の促しを数学の変化へ同期。図より先に答えを言わず、先生が解説するための無音の間を残す。日本語の新しい音源と実音声の包絡を作り直した。数学モデル、90秒構成、教室、他の教材は維持。

## 閲覧

- 教材: https://hakunou22hr.github.io/-/materials/mean-value-theorem-revised/?v=9
- 90秒: https://hakunou22hr.github.io/-/media/mean-value-theorem-revised/mean-value-theorem-revised-90s-v9.mp4
- 10秒ガイド: https://hakunou22hr.github.io/-/media/mean-value-theorem-revised/preview-guide-10s-v9.mp4

v1〜v8のMP4を保持。現在の教室は生成静止画の奥行き投影であり、人物の談笑は未実装。

## 教室の人物アニメーション（未実装・生成待ち）

`classroom-motion-brief-v9.md` に、元画像を保つ条件、金髪1人・他は黒髪、隣人との短い対話から授業に移る6秒の演技仕様、品質判定条件を記録。現在利用できる画像参照型の動画生成は最大720pで、元画像と同等の細部を保証できない。生成ツール指定の新規明示確認が必要なため、まだ生成・合成していない。今回のv9を人物アニメーション完成版として扱わない。

## 再制作

```sh
OVERLAY_ONLY=1 RANGES='[[12,84,"narrator-layer-72s"]]' OUTPUT=/workspace/work/mvt-v9/delivery node materials/mean-value-theorem-revised/render/movie.mjs
OUTPUT=/workspace/work/mvt-v9/delivery node materials/mean-value-theorem-revised/render/upgrade-v9.mjs
```

組立にはv4の背景・教室・数学映像、同じコードから描くナレーターなし72〜84秒まとめパス、v9のアシスタントM4Aを使用する。`guide.mjs` が絶対時刻から大きさ・浮遊経路・反応対象・音声エネルギーを決定する。

## 検証

全浮遊区間を0.05秒刻みで走査して大きさが一定、画面内に収まる、反応対象の文字と重ならないことを検証。数学、教材登録、ビルド、MP4全編デコード・音声・旧版SHA256照合を実施する。公開後のブラウザ検証はGitHub Actionsで実行。物理iPhone・iPad・Safariは未確認。
