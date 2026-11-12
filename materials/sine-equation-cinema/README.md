# 三角方程式（sinθ）― 高さから三つの解へ

問題：2sin²θ−3sinθ＋1＝0、0≦θ＜2π。音声なし、日本語字幕。

## 解法と図形

t＝sinθ、−1≦t≦1。(2t−1)(t−1)＝0 より t＝1/2 または1。両方とも範囲内。

単位円 x²＋y²＝1 に対し y＝1/2 の交点は (±√3/2,1/2)、対応する角度は π/6・5π/6。y＝1 は (0,1) で接し π/2。解を小さい順に並べると π/6・π/2・5π/6。

## 成果物

- `../../public/media/sine-equation-cinema/sine-equation-90s.mp4`：1920×1080、90秒、H.264。
- `sine-equation-instagram-30s.mp4`：1080×1920、30秒。縦画面専用のカメラと文字配置。
- 同じフォルダのSRT・台本・ポスター。
- このフォルダのReact/Three.js/KaTeXソースで再編集可能。
- 教材ライブラリに新規追加。既存のcosθ教材を保持。

## 演出

夕暮れの教室を後方通路から見る新しい構図。生徒の机の間から黒板へ前進し、奥へ続く光の柱が並ぶ実験室へ入る。因数分解では金と青のガラス状パネルが異なる高さへ分かれる。単位円を横切る透明な水平シートが昇降し、交点が移動して頂点で一つに重なる。数学図形を床面に対して鏡映した反射を合成。回転する背景リング・波形は使わない。最後は二本の水平線と三点を同時表示。数式は画像生成に任せずKaTeXで別描画。曲線・点・線は実座標。

教室素材は、この改訂で新しくAI生成した夕暮れの後方通路の静止画像。奥行き付きメッシュをカメラが進む2.5D表現で、生徒を独立に動かす実写動画ではありません。音声・BGMなし（従来のご指定を継承）。外部音源は使用しません。

## 再生成

リポジトリの依存関係をインストール後：

```
npx vite build --config materials/sine-equation-cinema/vite.config.ts
python3 -m http.server 8816 --directory materials/sine-equation-cinema/build
APP_URL=http://127.0.0.1:8816/ OUTPUT=/tmp/sine-main.mp4 node --experimental-strip-types materials/sine-equation-cinema/render/render.mjs
EDITION=short APP_URL=http://127.0.0.1:8816/ OUTPUT=/tmp/sine-short.mp4 node --experimental-strip-types materials/sine-equation-cinema/render/render.mjs
CAPTION_OUTPUT=/tmp/sine-captions node --experimental-strip-types materials/sine-equation-cinema/render/captions.mjs
```

PlaywrightとChromium、ffmpegが必要です。`PLAYWRIGHT_MODULE` と `CHROMIUM` でパス指定可能。24fpsの各フレームを決定的に描画。3D後処理はCSS画素密度1、文字と教室は出力密度1.5。

## 検証

`tests/math.test.ts` は因数分解、範囲、全交点の残差、接点の重複、三つの解、映像内の交点を検証。`tests/browser.mjs` は操作・360°除外・3D切替・段階解答・教室のカメラ・縦画面数式を確認。スマートフォンとタブレットはChromiumの画面幅とタッチの模擬で、実機Safariの検証ではありません。

## 光の実験室版 v2

12秒プレビューを先に書き出してから、同じ表現の90秒・縦型30秒を生成。光のシートのy座標は k と常に一致し、交点は従来の正確な計算を継続。床反射は y＝−2.75 に対する鏡映。右の説明欄は青緑の光柱と反射面の意匠に変更。
