# 傾きが出会う瞬間 ― 平均値の定理【改訂版】 v6

## 今回の修正

- 右下の小さな粒子球を、大きな発光核へ3色の螺旋流が巻き付くAIガイドに変更。
- 440個の核表面粒子、3本×180個の流れる螺旋粒子、36本のほどける火花。手前と奥を区別し、透視投影・前後描画・白熱点・ブルーム状の光で立体感を出す。
- シアン・青紫・金を発色。字幕・数学イベントで中心の光、粒子の大きさ、強い光点が反応する。
- 描画領域は330×330へ拡大。実際の透明度8/255超の画素範囲は48秒・70秒で316×320、右端1909px・下端946px（1920×1080）。字幕上端958pxにかからない。
- 数式欄下段を左寄せの短い行に折り返し、大きな渦のための余白を確保。数学の式・保証・具体例と証明の区別は維持。
- 絶対値の説明を削除した90秒構成、自然光の教室、金髪1人のみ、黒板上枠の余白、背景の大型回転リング削除は維持。

## 閲覧

教材: https://hakunou22hr.github.io/-/materials/mean-value-theorem-revised/?v=6

本編: https://hakunou22hr.github.io/-/media/mean-value-theorem-revised/mean-value-theorem-revised-90s-v6.mp4

渦巻くガイド10秒: https://hakunou22hr.github.io/-/media/mean-value-theorem-revised/preview-guide-10s-v6.mp4

同フォルダに教室12秒・測定15秒・一致8秒・説明15秒・まとめ12秒の `-v6.mp4`。旧版v1〜v5の動画・フレームは保持する。

## 再制作と検証

`guide.mjs` が解説中12〜84秒の状態を決め、`scene.mjs` が螺旋と発光を描く。`paintGuideTextReflow` は同じ数式パネルの下段を折り返す。操作教材とMP4は同じ関数を使う。動きを抑える設定では粒子も静止する。音声・音声認識は付けていない。

v4の承認済み背景・数学・教室映像を使い、72〜84秒のまとめを描き直す。透過パスで下段の改行と新しい大きなガイドを合成し、古い小さなガイドが重ならないようにする。

```sh
BASE_PASS=1 RANGES='[[72,84,"part-summary-12s"]]' OUTPUT=/workspace/work/mvt-v6/delivery node materials/mean-value-theorem-revised/render/movie.mjs
OVERLAY_ONLY=1 RANGES='[[12,84,"narrator-layer-72s"]]' OUTPUT=/workspace/work/mvt-v6/delivery node materials/mean-value-theorem-revised/render/movie.mjs
OUTPUT=/workspace/work/mvt-v6/delivery node materials/mean-value-theorem-revised/render/upgrade-v6.mjs
node materials/mean-value-theorem-revised/tests/math.mjs
node materials/mean-value-theorem-revised/tests/guide.mjs
npx vitest run materials/mean-value-theorem-revised/tests/catalog.test.ts
node materials/mean-value-theorem-revised/tests/video.mjs
npm run build
```

`OVERLAY_ONLY=1 PARTICLE_ONLY=1 CHECK_ONLY=1` は文章の再配置を含めない粒子のみのPNGを確認するためのモード。

H.264/yuv420p、1920×1080、24fps、90秒、字幕付き・音声なし。`verification-v6.json` は本編と6プレビューの全編デコード、時間・寸法・フレーム数、旧動画のSHA256照合。`visual-review-v6.json` は数学と演出の確認記録。

公開後のGitHub Actionsは操作・数学状態・MP4・4画面サイズ・タッチ模擬・粒子の回転と静止・実際のアルファ画素範囲・黒板余白を検証する。実機iPhone/iPad/Safariは未確認。教室は生成素材による2.5D描画で、人物は個別には動かない。
