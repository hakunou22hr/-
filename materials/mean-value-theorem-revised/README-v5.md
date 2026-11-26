# 傾きが出会う瞬間 ― 平均値の定理【改訂版】 v5

## 修正内容

- 現行90秒映画の72〜84秒にあった絶対値の説明を削除。全編をf(x)=x²で統一し、平均2と瞬間2の一致、別々の平行線、成立条件を振り返る12秒に置換。操作教材の関数メニューからも絶対値を外した。
- 解説中（12〜84秒）だけ右下にオリジナルの近未来AI風粒子ガイドを表示。620粒子の球体が3D回転し、短い走査弧とメーターが動く。字幕や式の区切りに反応し、一致の場面では金色のアクセントが入る。
- ガイドは図と式の主領域から離し、字幕の上に収まる。69〜72秒の補足文を2行にして余白を確保。動きを抑える設定ではガイドも静止する。
- 音声・音声解析・会話AIは追加していない。反応は同じ数学タイムラインから決定する字幕連動アニメーション。
- 承認済みの教室（女子生徒2人追加、金髪は左手前の1人だけ）、黒板の座標位置、背景の大型回転軌道の削除は維持。

## 閲覧

教材: https://hakunou22hr.github.io/-/materials/mean-value-theorem-revised/?v=5

本編: https://hakunou22hr.github.io/-/media/mean-value-theorem-revised/mean-value-theorem-revised-90s-v5.mp4

同フォルダに教室12秒・測定15秒・一致8秒・説明15秒・まとめ12秒の `-v5.mp4` を追加。v1〜v4の既存動画・プレビューは削除せず、アーカイブから閲覧できる（旧版には削除前の絶対値説明が含まれる）。

## 描画と再制作

`model.mjs`の現行タイムラインは全時刻でx²。`guide.mjs`が画面位置・回転・反応・動きを抑える状態を決定し、`scene.mjs`が同じ関数でブラウザ教材とMP4用の粒子を描く。

承認済みv4の0〜72秒・84〜90秒を再利用し、72〜84秒のみ数学場面を描き直す。ガイドは同じ描画コードによる透過レイヤーとして12〜84秒へ合成する。69〜72秒は旧v4の長い補足文を2行に修正する透過パスを含む。ffmpegは合成とエンコードに使用し、新たな背景画像を貼る方式ではない。

```sh
BASE_PASS=1 RANGES='[[72,84,"part-summary-12s"]]' OUTPUT=/workspace/work/mvt-v5/delivery node materials/mean-value-theorem-revised/render/movie.mjs
OVERLAY_ONLY=1 RANGES='[[12,84,"narrator-layer-72s"]]' OUTPUT=/workspace/work/mvt-v5/delivery node materials/mean-value-theorem-revised/render/movie.mjs
OUTPUT=/workspace/work/mvt-v5/delivery node materials/mean-value-theorem-revised/render/upgrade-v5.mjs
node materials/mean-value-theorem-revised/tests/math.mjs
node materials/mean-value-theorem-revised/tests/guide.mjs
npx vitest run materials/mean-value-theorem-revised/tests/catalog.test.ts
node materials/mean-value-theorem-revised/tests/video.mjs
npm run build
```

1920×1080、24fps、H.264/yuv420p、90秒、字幕付き・音声なし。`verification-v5.json` は全編デコード・時間・寸法・フレーム数と旧動画のSHA256照合。`visual-review-v5.json` は配置と数学説明の確認記録。

GitHub Actionsで公開後の数学・操作・同一時刻再現性・粒子の回転と静止・右下の字幕余白・絶対値メニュー削除・78秒の新しい数学状態・MP4再生・4画面サイズ・タッチ模擬を確認する。実機iPhone/iPad/Safariは未確認。教室は2.5Dの生成素材で、人物個別の動作はない。
