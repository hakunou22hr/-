# 数学Ⅲ｜二つの道、ひとつの答え

90秒・30秒の独立編集。両版とも1920×1080、30fps、H.264/AAC。教師・ナレーションなし。背景を含む全画面を時刻から生成し、MP4へ音楽・効果音とともに収録する。

## 調査・再利用

制作前に `trig-integral-cinema/src/components/Formula.tsx`、`cinema/FormulaTunnel.tsx`、数式テクスチャ・音声生成を確認。KaTeXのTeX組版、立体回廊、光の移動と計算を連動させる設計を継承。
`moving-boundary/background.js` の手続き型雲・数式壁・透視投影・粒子・電光処理、同教材のmath.js、プレーヤー、Node Canvas→FFmpegレンダリングを新規フォルダへ複製し使用。sleeping-circleの元になった背景系統を継承。既存ソースと既存MP4は変更しない。

新作film.jsは、金色の部分積分／端点ゲート、青色の分解／項相殺、二経路の合流を新規実装。背景・図形効果・前景数式は3枚のCanvas。背景は低解像度で光学的に合成し、前景のTeX数式はフルHDで描画する。数式は生成時のKaTeX PNGを同梱し、視聴中に外部CDNや有料APIを要求しない。

## 数学

A: tに関する部分積分ではxは定数。原始関数 (x−t)sin t−cos t を上端x・下端0で評価し、1−cos xを得てから微分。
B: x∫cos t dt−∫t cos t dtに分け、積の微分と基本定理で +x cos x と −x cos x を生成・相殺。残る積分の端点評価で sin x。
すべての実数xで成立。終盤の曲線はF′(x)=sin x。

## 再生成

リポジトリルートで実行。Node.js、Chromium、FFmpeg、Python NumPy、Noto Sans CJK、package.json内の依存関係とrender/package.jsonの依存関係が必要。

1. ルートをHTTPサーバーで4173番に提供
2. `node materials/two-paths/render/generate-math.mjs`
3. `python materials/two-paths/render/audio.py work/two-paths`
4. `node materials/two-paths/render/render.mjs 90`
5. `node materials/two-paths/render/render.mjs 30`
6. 完成原版を `public/media/two-paths/` へ複製し、`node materials/two-paths/render/encode-play.mjs` で軽量視聴版を生成。原版と視聴版の両方で正確な尺を検査。

`--portrait` で30秒の9:16構図を描画できる設計。配布MP4は横型2版。縦型は再レンダリングが必要。
音楽は独自の数値合成。音声のカット位置は専用タイムラインに対応。画像板書の誤記は転記せず、正しい相殺符号を採用。

## ブラウザ

標準は軽量720p Baseline H.264 MP4で即時に再生する。フルHD原版はダウンロード。プログラム描画はチェック時のみ数式を読み込み、音声・時間軸は動画と同期する。シークに対し過去フレームの状態を必要としない。

`render/check.mjs` は横型2版と縦型設計の配置・背景動作・時刻再現性、正負のxの数値積分、端点、導関数を確認。
`render/browser.check.cjs` はライブラリ検索から実時間再生、制御、MP4の実バイト取得を検証。
