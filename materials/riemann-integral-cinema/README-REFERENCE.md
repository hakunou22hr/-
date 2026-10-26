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
