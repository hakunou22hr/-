# 数学Ⅲ｜区分求積法と定積分

既存教材は変更せず、新しいカードとして教材ライブラリに追加した探究教材。静止画像は使わず、幾何学・グラフ・右端長方形・カメラ・数式を共通時刻から計算する。

## 開く

リポジトリ直下で `npm ci`、`npm run dev`。`/materials/riemann-integral-cinema/index.html` を開く。公開ビルドは既存の `npm run build` に自動的に含まれる。

- 探究する：n=1〜1000、区間a<b、6関数、右端和・原始関数からの定積分・誤差、符号付き領域、2D/3D、自動細分化、数式ON/OFF。
- 映画で見る：2本のMP4の再生・ダウンロード、120秒マスタータイムラインのシークと再生。
- 数学を読む：一般公式、右端の定義、符号付き寄与、[0,1]の場合をKaTeXで解説。

## 発色・発光の強化

暗さが残っているとの指摘を受け、赤・オレンジ・金の面を増やし、発光レールに白い芯を追加した。1/3解像度のバッファで多段のブルームを生成し、背景描画と合成する。数式と数値はその後に描き、暗い下地と文字の輪郭で読める状態を保つ。

色の意味：正の長方形はオレンジ〜金の照明グラデーション、負の寄与はマゼンタ。背景の赤い構造材は符号とは無関係である。

`public/previews/riemann-emission-v3/` に、同じ時刻の旧版と強化版を並べた比較動画を保存。分裂4秒、回廊4秒、Σ→∫は11秒。各段の「同時に再生して比較」で確認できる。

## 背景演出の改訂

最初の版が指定された3場面の背景表現を満たしていないという指摘を受け、背景描画を作り直した。

- 50〜72秒：立体の壁面、発光レール、面を持つ構造材、座標ステージ。nの変化が長方形と壁・床の細分化へ同時に反映される。
- 72〜89秒：金色とシアンの多層回廊。z方向への移動、奥行きで変わる構造材、埋め込まれた光の回路、加速する前進。
- 89〜105秒：立体の数式レイヤーと光のリボン。長方形から出た光が大きなΣを形成し、保持した後に∫へ変形する。数式の等式は別の読みやすい位置に表示する。

`environment.js` は描画のたびに幾何学の座標を計算する。背景画像は使用していない。光のレールや構造材の描画は、同じ色・幅ごとにまとめて発光処理する。

「映画で見る」に、最終120秒MP4から切り出した22秒・17秒・16秒の場面別動画を追加。確認ページは `?view=cinema#scene-review` で直接開ける。2本の動画URLにはキャッシュ識別子を付け、以前の動画を表示し続けることを避ける。

## MP4

`public/media/riemann-integral-120s-pc.mp4`：1920×1080、120秒、30fps、H.264/yuv420p、音声なし。

`public/media/riemann-integral-30s-instagram.mp4`：1080×1920、30秒、30fps、H.264/yuv420p、音声なし。縦専用の時間割・投影・改行で制作。

どちらもfaststart。ファイルは100MiB未満のため、通常のGitで同一オリジン配信できる。外部有料API・外部CDNは必要ない。

## 再現

Node.js 22以上、FFmpeg、Noto CJK / DejaVuフォントが必要。Linuxでは `fonts-noto-cjk fonts-dejavu-core ffmpeg` を用意する。

```sh
npm ci --prefix materials/riemann-integral-cinema/render
node materials/riemann-integral-cinema/render/render.mjs
node materials/riemann-integral-cinema/render/render.mjs --portrait
```

出力は `work/riemann/`。`RIEMANN_OUTPUT` で変更可能。`--samples` で各シーンの確認フレームだけを生成できる。MP4更新時は検証後、2本を `public/media/` へコピーする。

短い場面動画も `public/media/riemann-scene-*-v3.mp4` として保存する。動画を更新するときは、120秒版の50〜72秒・72〜89秒・89〜105秒をそれぞれ切り出す。

## 実装

- `math.js`：連続関数と原始関数、右端値、幅、符号付き和、誤差を共通データとして計算。
- `timeline.js`：時刻からn・グリッド分割・回廊・形成・カメラ・場面を決定。有限分割数と極限を区別する。
- `world.js`：3D座標の透視投影による空間。全てのグリッド・リングは毎フレーム座標を再計算する。長方形は厚みのない平面領域。
- 長方形の数は4→8→16→32→64→128→256。各変化で背景線数も倍増し、同じnからΔxとSₙを表示する。
- 回廊は極限を象徴する独立した構造。元の関数や長方形を回廊形状に変形しない。
- 数式の発光粒子は、正しい右端から、最終数式をラスタライズした字形の座標へ移動する。
- 最終場面は境界線を粒子へ変え、滑らかな領域へ移行。関数・原始関数を共に滑らかに混合して負の寄与を示した後、区間[0,1]へ移る。
- 映像上の関数切替中も、曲線、長方形、計算結果は同じ混合関数を使用する。
- Webと動画で同じ描画処理・時刻データを使用。ブラウザとSkiaのフォント/アンチエイリアスには軽微な差がある。

## 検証

```sh
node materials/riemann-integral-cinema/tests/mathematics.mjs
node materials/riemann-integral-cinema/render/verify-motion.mjs
PLAYWRIGHT_MODULE_PATH=/path/to/playwright node materials/riemann-integral-cinema/tests/browser.cjs
```

`verification.json` と `verification/` に結果・確認画像を保存。既存の全教材テストで `triangle-trig-inquiry` のサムネイル不足が1件あり、この教材の追加とは独立している。

教科書162ページの原本は未提供。制作命令書に記載された一般式に基づくオリジナル教材であり、教科書の図を複製したものではない。
