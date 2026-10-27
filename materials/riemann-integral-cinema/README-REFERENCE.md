> 現在の既定の背景は「教室から黒板へ」です。新しい構成は [README-CLASSROOM.md](README-CLASSROOM.md) を参照してください。この文書は従来の参照背景版の記録です。

# 参照サイトの背景を使う追加版

ユーザー指定の https://integral-universe-preview.hakunou22hr.chatgpt.site/ を確認し、同じ背景素材 `parts.png` と、ソース `Scene.tsx` の点群・波面・軌道の構成を参照した。参照元サイトへの書き込みや公開範囲の変更は行っていない。

## 追加したもの

- `reference-universe.js`：背景画像を32×18のメッシュに分け、1152枚の三角形を奥行きに応じて変形。画像の一括拡大・平行移動だけにはしていない。3D点群と軌道は別に時刻から計算する。
- 標準：画像の赤・青の構図を保った波面と軌道。
- 共鳴波：長方形の分裂から、画像の奥行きメッシュへ波が伝わる。
- 糸・点への分解：重ねた3Dの曲面の網が点群と糸へほどける。
- 断面スキャン：透明な平面が3D点群曲面を横切り、断面をなぞる。
- 軌道フライスルー：カメラの奥行き移動を追加。

数学的な関数、右端の高さ、計算結果は以前と共通。背景変更で定積分や右端和は変わらない。背景の赤・青の曲面は演出であり、中央の区分求積の曲線とは区別して表示する。

## 動画

`public/media/riemann-integral-120s-reference.mp4`：1920×1080、30fps、120秒。

`public/media/riemann-integral-30s-reference.mp4`：1080×1920、30fps、30秒。元画像の横長構図を単純に縦へ切り抜くと赤・青のピークが消えるため、両方が見える位置に再配置し、周囲へ3D点群と軌道を展開している。

`public/media/riemann-reference-{standard,ripple,threads,scan}.mp4`：各6秒の演出プレビュー。

前の赤・金の回廊版のMP4は保持。教材の背景選択で切り替えられる。本編MP4は自動演出。個別の演出選択は探究画面・時刻プレビューに反映される。

## 再現

```sh
RIEMANN_BACKGROUND=reference RIEMANN_OUTPUT=work/riemann-wave RIEMANN_NAME=riemann-integral-120s-reference node materials/riemann-integral-cinema/render/render.mjs
RIEMANN_BACKGROUND=reference RIEMANN_OUTPUT=work/riemann-wave RIEMANN_NAME=riemann-integral-30s-reference node materials/riemann-integral-cinema/render/render.mjs --portrait
node materials/riemann-integral-cinema/render/verify-reference.mjs
```

追加の演出を書き出す場合は `RIEMANN_EFFECT` に `standard` / `ripple` / `threads` / `scan` / `orbit` を指定。素材の出典は `assets/REFERENCE.md`。

## 空間カメラ（追加）

ライブ画面では、背景の深度メッシュと点群・軌道を同じ視点で投影します。映画的な自動運行、ドラッグ旋回、ホイール／スライダーの接近・後退、背景の左右反転、点群の中央への集積に対応。数式と計算用のグラフは反転しません。視点リセットで手動の正面視に戻ります。既存のMP4ファイルにはこの操作は反映されません。

ブラウザ検証：左右反転・拡縮・集積・ドラッグ・ホイール・自動運行、計算値不変、モバイル横幅、JavaScriptエラーなし。

## 生命の幾何：24秒の映画

`living-universe.js` は赤・青の波面を実際の3D座標から再生成します。局所的な二重の鼓動が面を伝わり、輪郭と格子の間隔を変化させます。2600粒子は波面から離れ、時間差を持ってリーダーの軌道に追従します。数式断片も同じ軌道をたどり、粒子はΣの字形へ集まり、その同じ粒子が∫へ移動します。物理的なBoidsシミュレーションではなく、連続で再現可能な群れの軌道です。カメラを固定しても形状と粒子の動きは続きます。

- 0–5秒：鼓動する網目と伝播する光。
- 5–10秒：群れと数式の断片。
- 10–15秒：Σの形成。
- 15–19秒：Σから∫への変形。
- 19–24秒：∫と極限の等式。

波面は装飾であり計算用関数とは異なります。有限和を積分と等しいとは表示せず、極限の式として示します。数式断片は背景に重ねた固定字幕ではなく、粒子の群れと共通の3D軌道に配置しています。初版の参照画像は冒頭だけ低い不透明度で使用し、5秒までに消えます。第2版の背景については後述。

追加MP4：`public/media/riemann-living-geometry-24s.mp4`、1920×1080、30fps、720フレーム、24秒、H.264/yuv420p、無音。既存の120秒・30秒のファイルは変更していません。追加演出「生命の幾何」で同じ描画処理による24秒のライブ再生を操作できます。探究画面では計算用のグラフを前面に保ちます。

再生成：`node materials/riemann-integral-cinema/render/living.mjs`（既定の出力：`work/riemann-living-v2/`、`RIEMANN_OUTPUT` で変更可能）。`--samples` で静止画サンプルを生成。`render/verify-living.mjs` でカメラに依存しない形状変化、連続軌道、再現性、同じ粒子による∫の形成を検証します。

## 参照画像の密度・発光に合わせた第2版

`living-universe.js` は参照画像を渡した場合、既定で `quality: 'dense'` を使用します。参照画像全体を1152三角形の変形メッシュに貼り、赤・青の峰に局所的な二重の鼓動を加えます。これは参照画像に推定した奥行きを与える表現です。前景には別に3D座標で計算した4本の編み込み軌道、移動する発光点、粒子の群れ、数式断片とΣ→∫の形成を描画します。`quality: 'classic'` を明示すると前の単純な波面の版を描画できます。

右下の観測窓は [0,1] 上の f(x)=x² を例として、n=4,8,16,32,64 の右端和と曲線を表示します。右端和は (n+1)(2n+1)/(6n²)、積分値は 1/3 です。大きい赤・青の波面をこの関数のグラフと同一視しません。

追加ファイル：`public/media/riemann-living-geometry-v2-24s.mp4`。前の24秒版は別ファイルとして残し、`public/previews/riemann-living/index.html` の切替で比較できます。ライブ演出「生命の幾何」も第2版を使用します。120秒・30秒の旧本編は変更していません。
