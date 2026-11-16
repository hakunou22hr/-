# 三角方程式（cosθ）③

対象：数学Ⅰの三角比、および弧度法への発展。

`2cos²θ + cosθ − 1 = 0` を `t=cosθ`、`−1≤t≤1`、`2t²+t−1=(2t−1)(t+1)`、`t=1/2,−1`、単位円上の交点、角度の順に学びます。どちらの根も採用します。

- 数学Ⅰ `0°≤θ≤180°`：60°、180°。
- 発展 `0≤θ<2π`：π/3、π、5π/3（60°、180°、300°）。360°は含みません。

## 閲覧

公開URL：https://hakunou22hr.github.io/-/materials/trig-cos-equation-3/

ライブラリ：https://hakunou22hr.github.io/-/ の「数学Ⅰ」。検索欄で「三角方程式（cosθ）③」または「三角方程式」を検索。

教材カードはこのディレクトリの `material.json` から既存ライブラリが自動登録します。既存教材・映像ファイルには変更を加えません。

## 構成

- 90秒のThree.js映画：多層トーラス、独立回転、トンネル分岐、粒子吸引、遠方まで続く座標格子、背景波動シェーダー、金色の2交点、赤色の1接点、衝撃波、半径と三角形、退化、動的カメラ。
- 映画と探究は同じWorldインスタンス・canvasを使用。90秒終端で探究モードに移行。再生・停止・シーク・5章選択。
- 角度0〜360°、縦線−1.5〜1.5、正投影2D／自由視点3D、度数法／弧度法、数学Ⅰ／発展範囲、6段階の解答（初期非表示）。
- 90秒 1920×1080 と30秒 1080×1920 のH.264 MP4を同じ数学モデルとタイムラインから描画。縦型版のシーン境界は0,6,12,20,25,30秒。
- ナレーション・BGMはありません。すべての主要数式はKaTeXの縦型分数。
- タッチ対応の操作部、キーボード対応、MP4の代替再生、共有メニューによるiOS保存案内。

WebGL負荷を抑えるため、動画書き出し時は3D層を低い内部解像度から拡大し、数式・字幕は最終1920×1080／1080×1920のDOM合成解像度で描画します。背景は静止画像を使用せず、有限3Dモデルとシェーダーで連続描画します。

## 再編集・検証

リポジトリルートで `npm ci`。

- 数学検証：`npx vitest run materials/trig-cos-equation-3/tests`
- 型検証：`npx tsc --noEmit --jsx react-jsx --moduleResolution bundler --module esnext --target es2022 --skipLibCheck materials/trig-cos-equation-3/src/main.tsx`
- ライブラリ全体：`npm run build`
- MP4再生成：PlaywrightとChromium、FFmpeg、日本語フォントを用意し `node materials/trig-cos-equation-3/render/movie.mjs`。縦型版は `EDITION=short`。必要時 `PLAYWRIGHT_MODULE` と `CHROMIUM` で既存実行環境を指定。
- 出力先：`public/media/trig-cos-equation-3/`。再生成中はソースを変更しないでください。
- 公開後のブラウザ検証：`tests/published.mjs`。GitHub Actions `Verify cos equation 3 published lesson` でPC、iPad、iPhone相当の4画面サイズ、操作、数式、動画配信、終端移行を検証。物理端末のSafariでの実機検証とは区別します。

動画のFPS・時間・寸法と数学的イベントの実測値は `verification.json` に記録します。
