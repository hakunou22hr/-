# 数学Ⅲ｜動く境界 — 微分が積分を解き放つ

教材一覧は material.json から自動登録。既存のページとルーティングは変更しません。

- ページ：materials/moving-boundary/index.html
- 動画：public/media/moving-boundary/moving-boundary-90s.mp4 と moving-boundary-30s.mp4
- ビルド後：dist/materials/moving-boundary/ と dist/media/moving-boundary/

動画を唯一の再生ソースとして使うので、プレビューとダウンロードの内容は同一です。ブラウザ標準の動画コントロールで再生、一時停止、シーク、音量、全画面を操作できます。再生を開始するにはユーザー操作が必要です。

## 再生成

Python 3、NumPy、Pillow、Matplotlib、FFmpeg、システムの Noto Sans CJK フォントが必要です。

```
python materials/moving-boundary/render.py 90
python materials/moving-boundary/render.py 30
```

カメラの回転と透視投影を毎フレーム計算し、3D座標上の曲線と符号付き面積を描画します。数式はMatplotlib mathtextで先に高解像度生成し、日本語はNoto Sans CJKで描画します。WebGLや外部APIは不要です。縦型は独立したレイアウト・タイムラインです。

数学：F(x)=1−cos x、F′(x)=sin x（すべての実数x）。映像内の可動上端の実演はx≥0。金＝正の面積、青＝負の面積。tに関してxを定数として積分を分解し、積の微分法と基本定理で生じる+x cos x、−x cos xを相殺します。

音楽と効果音はrender.py内で合成したオリジナル。外部音源は使用していません。

MP4は各100MB未満なので通常のGitに保存できます。動画を含めた実ファイルは上記public/mediaのパスにあります。GitHub上への保存・Pages公開の完了は、リモート取得検証が通るまで保証しません。
