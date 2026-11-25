# 傾きが出会う瞬間 ― 平均値の定理【改訂版】

初版 `materials/mean-value-theorem` とその動画を保持して追加する教室映画版。分類は数学Ⅱ。

## 公開先

- 教材: https://hakunou22hr.github.io/-/materials/mean-value-theorem-revised/
- 本編: https://hakunou22hr.github.io/-/media/mean-value-theorem-revised/mean-value-theorem-revised-90s.mp4
- プレビュー: 同じmediaディレクトリの `preview-classroom-12s.mp4`、`preview-measurement-15s.mp4`、`preview-discovery-8s.mp4`

## 初版からの変更

- Canvasによる簡略投影から、Three.jsの実際の3D教室へ変更。天板・脚・座面・背もたれ、窓枠、カーテン、棚、時計、照明器具を分離して配置する。
- 木目・法線・粗さを持つマテリアル、夕日のDirectionalLightと家具・窓枠の影、光の筋と粉を実装する。背景画像のズームではない。
- 0〜6秒は教室の全景を保ち、6〜9秒に接近、9〜12秒に通過する。黒板の2枚のパネルが左右へ退き、壁に設けた開口部へカメラが進入する。同じグラフメッシュが奥へ進み、帰還時には黒板前へ戻る。全区間で同じ数式モデルを使う。
- 横2、縦4、割線、数式への数値移動を12〜27秒で段階生成する。
- 29秒: c=.5、傾き1。35秒: c=1、傾き2。41秒: c=1.5、傾き3。
- 47秒にc=1へ停止し金色へ変化。粒子の収束、床の波とリングを同期。48〜50秒に横1・縦2の三角形、51〜54秒に(1,1)の平行移動を示す。
- 57〜69秒に計算を段階表示し、69〜72秒に一般の定理へつなぐ。
- 72〜84秒に |x|。78秒では微分係数をnullにし、接線を描かない。
- 84〜90秒に定理と成立条件を示して教室へ帰還する。

## 数学と再現性

`model.mjs`を操作・動画・自動解説で共有する。割線の傾きは2、接線は `y=2c(x−c)+c²`、c=1では `y=2x−1`。割線 `y=2x` と傾きが等しく、切片は異なる。近接の発光判定（傾き差≤.04）と厳密な解を区別する。原点の |x| の微分係数は未定義で、仮の値や接線を生成しない。

Three.jsのカメラ・図・粒子・床の頂点変位・字幕を同じ絶対時刻で制御する。粒子は固定シード。教室と通過はWebGLで描画し、正面の説明では同じ3D頂点をカメラの透視変換でCanvasへ直接投影するハイブリッド方式。背景の静止画像は使用しない。床格子は実際のLineSegmentsの頂点を波で変位させる。Pのワールド座標を粒子と床の波の中心に使う。

## プレビューと再生成

```
node materials/mean-value-theorem-revised/tests/math.mjs
npx vitest run materials/mean-value-theorem-revised/tests/catalog.test.ts
CHECK_ONLY=1 OUTPUT=/tmp/mvt-check node materials/mean-value-theorem-revised/render/movie.mjs
PREVIEWS=1 OUTPUT=/tmp/mvt-movies node materials/mean-value-theorem-revised/render/movie.mjs
OUTPUT=/tmp/mvt-movies node materials/mean-value-theorem-revised/render/assemble.mjs
# またはプレビューを再利用せず全編を描画: OUTPUT=/tmp/mvt-movies node materials/mean-value-theorem-revised/render/movie.mjs
node materials/mean-value-theorem-revised/tests/video.mjs
npm run build
```

レンダラーはChromium/WebGL2 (SwiftShaderでも可) とFFmpegを使用する。Playwrightモジュールの場所は `PLAYWRIGHT_MODULE` で指定できる。`CHECK_ONLY`は17時刻のJPEG、`FRAMES`は時刻配列JSONを指定する。3本のプレビューは本編と同じコードから0〜12、12〜27、45〜53秒を出力する。MP4は1920×1080、24fps、H.264/yuv420p、BT.709、音声なし、字幕焼き込み。

`.github/workflows/mvt-revised-check.yml`は同じコミットのPages deploy成功後に公開先の操作・シーク・再開・再生終了・時間再現性を検証する。1440×1100、1024×768、390×844、844×390のキャプチャとJSONをActions artifactへ保存する。タッチの模擬操作も別コンテキストで確認する。

## 視覚品質と確認範囲

参考画像に合わせた点: 夕日の教室、左の窓、木製家具、深緑の黒板、濃紺の内部空間、シアンの曲線、金色の割線、紫から金へ変化する接線、床の波紋。

残る差: 参考画像は生成された写実的コンセプトアートであり、本実装の家具・建築は手続き的な3Dモデル。間接照明・素材の微細な傷・映画的なレンズ効果は参考画像と同等ではない。黒板通過は光と左右のパネルの開口による表現で、参考画像の粒子状に崩壊する縁を完全には再現していない。「参考画像と同等の写実性を達成」とは評価しない。

iPad/iPhone/Safari実機は未確認。Chromiumの画面サイズ・タッチ模擬と区別する。ナレーションとBGMは付けていない。

## 外部素材

木目のColor / NormalGL / Roughnessは ambientCG のCC0素材:

- Wood051: https://ambientcg.com/view?id=Wood051
- WoodFloor051: https://ambientcg.com/view?id=WoodFloor051
- CC0案内: https://docs.ambientcg.com/license/

写真を背景に貼る用途ではなく、3D家具と床の表面マテリアルとして同梱する。教室の形状・影・カメラ・床の格子は動的に描画する。
