# 無限が、面積になる瞬間

問題：lim(n→∞) Σ(k=1…n) (2+3k/n)² · 3/n = ∫₂⁵ x² dx = 39。

- 120秒版：授業用。区間、幅・高さ、細分化、積分、計算の7章。
- 30秒版：同じ7章を短編として再編集。横長1280×720 / 24fps。
- 日本語字幕、オリジナル合成BGM・効果音入り。ナレーションなし。
- 計算用の長方形は右端和。有限の和は `39 + 31.5/n + 4.5/n²`。

## 保管と閲覧

制作ソースはこのディレクトリ。両MP4と検証・SHA-256マニフェストは
[archive](./archive/) に保管。
30秒MP4はデプロイ時に同一オリジンへ配置し、教材ページのvideo controlsとdownloadリンクから利用する。
120秒MP4はarchiveに保管し、教材ページから取得できる。既存教材の動画は変更しない。

## 再生成

必要：Node.js、Python 3 + NumPy、FFmpeg、Noto Sans CJK JP。

```sh
npm install --prefix materials/infinite-area-cinema/render
python3 materials/infinite-area-cinema/render/audio.py work/infinite-area
DURATION=120 node materials/infinite-area-cinema/render/render.cjs
DURATION=30 node materials/infinite-area-cinema/render/render.cjs
python3 materials/infinite-area-cinema/render/verify.py work/infinite-area
```

数式はMatplotlibで正確に組版した透過PNGをBase64テキストで保持する。`assets/*.png.b64` をレンダラーが直接読み込む。
各版は章ごとの時間配分を変えて描画し、音はピッチを保って尺へ合わせる。
検証済み30秒MP4は `public/media/infinite-area/` に保持し、通常のPagesデプロイで公開する。120秒MP4はサイト容量を増やさないようarchiveに保管する。
