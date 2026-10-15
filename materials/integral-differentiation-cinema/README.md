# 定積分と微分法 — Cinema 02

PC授業用90秒（1920×1080）とInstagram用30秒（1080×1920）。ともに30fps、MP4、H.264 High / yuv420p、AACステレオ48kHz、faststart。前作「三角関数の不定積分」は変更しない。

## 教材内容

連続な関数 f と定数 a に対する微積分の基本定理から、sin、t exp(t) の例、F(x)=∫₀ˣ(x−t)cos(t)dt の計算へ。積分変数 t とパラメータ x を区別し、積の微分から現れる +x cos x と −x cos x の消去を動きで示す。答えは F′(x)=sin x。画像の内容を独自のグラフ・数式・字幕として構成し、教科書画像を映像素材として転載しない。

3D座標上の粒子・リングを回転・遠近投影し、数式の発光、鼓動、移動、抹消、面積・細い帯の変化を同期。重要情報は縦型の x6–82%、y14–75% に収める。InstagramのUI配置は端末・投稿形式によって変わるため、アプリ上の最終プレビューも確認する。

## 再生とダウンロード

- [再生ページ](https://hakunou22hr.github.io/-/materials/integral-differentiation-cinema/)
- [PC 90秒MP4](https://github.com/hakunou22hr/-/releases/download/integral-differentiation-cinema-v1/integral-differentiation-cinema-90s.mp4)
- [Instagram 30秒MP4](https://github.com/hakunou22hr/-/releases/download/integral-differentiation-cinema-v1/integral-differentiation-cinema-instagram-30s.mp4)

## 再現

リポジトリのルートで `npm ci`。このディレクトリで `npm test`、`npm run build`、`npm run preview -- --port 4175`。

Playwright、Chromium、FFmpeg、Noto CJKフォントを用意し、ルートで `CINEMA_EDITION=lesson node materials/integral-differentiation-cinema/render/render.mjs`。縦型は `CINEMA_EDITION=instagram`。必要に応じ `PLAYWRIGHT_MODULE_PATH`、`CHROMIUM_PATH`、`CINEMA_URL`、`CINEMA_OUTPUT` を指定する。

音楽・効果音は本教材のためのプログラム合成。ナレーションなし。ライブラリKaTeXはMITライセンス（配布パッケージのLICENSE参照）。日本語フォントはシステムのNoto Sans CJK JPを使用。

## 検証

`tests/math.mjs` は定理の適用例、例題、打消し、時間軸を検証する。レンダラーは全3600フレームで画面内の数式・字幕・グラフ領域を検査し、ffprobeで寸法・fps・フレーム数・時間・映像音声コーデックを確認、FFmpegで全デコードを行う。各MP4、SHA256SUMS、ffprobe、画像サンプル、配置検証結果をGitHub Actions Artifactにも保管し、MP4をReleaseに保存する。
