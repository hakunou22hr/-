# 傾きが出会う瞬間 ― 平均値の定理【改訂版】／空間演出版 v2

数学Ⅱの90秒映画＋操作教材。URLは維持し、動画とプレビューは `-v2` の別ファイルとして追加する。初版 `materials/mean-value-theorem/`、前の90秒版、プレビュー、代表フレームを削除・上書きしない。

## 閲覧・保存

- 教材: https://hakunou22hr.github.io/-/materials/mean-value-theorem-revised/?v=2
- 本編: https://hakunou22hr.github.io/-/media/mean-value-theorem-revised/mean-value-theorem-revised-90s-v2.mp4
- 導入: https://hakunou22hr.github.io/-/media/mean-value-theorem-revised/preview-classroom-12s-v2.mp4
- 残りのプレビューは同じフォルダの `preview-measurement-15s-v2.mp4` と `preview-discovery-8s-v2.mp4`。

## 今回の美術基準

ユーザーが指定した次の教材を確認し、線の発光、奥行きのある粒子、光の軌跡、説明の読みやすさを基準にした。

- https://hakunou22hr.github.io/-/materials/sekibun-wo-bibun-suru/
- https://hakunou22hr.github.io/-/materials/arc-length-cinema/

教室はユーザーの回答「生徒がいる自然光の教室」に従い、後者の生成素材をそのまま再利用している。実在する生徒の撮影動画ではない。`assets/v2/classroom.png` は参照教材の素材の無変更コピー。

## v1からの具体的な変更

- 簡素な手続き的3D家具から、実写調の自然光・生徒のいる教室へ変更した。画像を3,726頂点の奥行きメッシュへ投影する2.5D方式で、前景と黒板に異なる視差が生じる。人物の手・身体・頭を独立に動かす方式ではない。
- 黒板の上寄りに数式から生成した図を置き、人物の頭部との重なりを避けた。グラフは画像へ焼き込まず、独立した同一メッシュを使用する。
- 6秒までは教室を保ち、9〜12秒で黒板が光の縁を持つ開口になる。カメラが接近する間に同じグラフが観測空間の正面図へ移る。最後は逆の経路で教室へ戻る。
- 実験空間は2,400個の立体粒子、130本の直線的な光の軌跡、18個の遠い光の雲、7層の観測フレーム、32点の星座状格子を使う。背景画像のズームではない。
- 場面転換で粒子の前進を加速する。47秒で接線と割線が平行になると観測フレームも整列し、金色・点の鼓動・粒子収束・床の衝撃波が同期する。
- 数式欄の不透明な四角を撤去し、透ける星の空間と細い発光の区切りへ変更した。計算・測定中は背景の輝度を下げる。
- 放物線の負のx側も薄く残し、対象区間 [0,2] の明るい曲線と区別する。

背景の星・光の軌跡・観測フレームは装飾であり、関数の追加のグラフや観測データを示さない。測定図と数式は読める正面位置を保つ。

## 数学・操作

`model.mjs` はv1の検証済みモデルを維持する。割線の傾きは2、接線は `y=2c(x−c)+c²`。c=1では接線 `y=2x−1` と割線 `y=2x` が別々の平行線になる。29・35・41秒で傾き1・2・3、47秒で一致、57〜72秒で計算、78秒の |x| の原点では接線を描かない。

近接の発光（傾きの差≤.04）と厳密な解は区別する。答えは最初は隠す。ドラッグ、スライダー、キーボード、関数切替、表示切替、動きを抑える設定、動画の時刻引継ぎ、再開を実装する。

## 描画・再現

`scene.mjs` がv2。`scene-v1.mjs` は前の描画を保持する共通基底で、数学の作図と縦型分数を再利用する。教室はThree.jsの奥行きメッシュと発光する開口シェーダー、正面の実験は同じ3D頂点を透視変換でCanvasへ描く方式。星の配置は固定シードで、全ての動作を絶対時刻から計算する。

```
node materials/mean-value-theorem-revised/tests/math.mjs
npx vitest run materials/mean-value-theorem-revised/tests/catalog.test.ts
CHECK_ONLY=1 OUTPUT=/tmp/mvt-v2-check node materials/mean-value-theorem-revised/render/movie.mjs
PREVIEWS=1 OUTPUT=/tmp/mvt-v2 node materials/mean-value-theorem-revised/render/movie.mjs
OUTPUT=/tmp/mvt-v2 node materials/mean-value-theorem-revised/render/assemble.mjs
OUTPUT=/tmp/mvt-v2 node materials/mean-value-theorem-revised/render/publish-assets.mjs
node materials/mean-value-theorem-revised/tests/video.mjs
npm run build
```

3本のプレビューと本編は同じ描画コードを使用する。確認したプレビューをそのまま本編の0〜12・12〜27・45〜53秒に組み込む。1080p、24fps、H.264/yuv420p、BT.709、字幕付き、音声なし。

GitHub Actionsは同じコミットのPages公開成功後に、公開ページの操作・図と数値・頭部より上の黒板位置・動画シーク・再開・再生終了・時刻再現性を検証する。1440×1100、1024×768、390×844、844×390とタッチを模擬する。iPhone/iPad/Safari実機は未確認。

前の90秒動画と図の制作記録は `README-v1.md`、`verification.json`、`visual-review.json` に保持している。v1の木目素材の出典も `README-v1.md` に記載している。
