# ネイピア数eの誕生 — 90秒の3D数学動画

日本語ナレーション付きMP4。1920×1080、30fps、90秒、H.264/yuv420p、AAC。

視聴ページは動画の再生・一時停止・シーク・ダウンロードを提供します。`public/media/birth-of-e-ready.json` が確認できたらプレイヤーを表示します。既存ライブラリはmaterial.jsonを自動検出するため、他教材の一覧・ナビゲーションのソースは変更しません。

原作 `Decoding_e.pdf` は制作環境に提供されていません。原作8ページとの照合は未実施で、提供された制作仕様に基づいて構成しています。

## 映像構成

|時刻|内容|
|---|---|
|0–18秒|年利100%の仮想複利モデル・都市模型|
|18–36秒|hの正負両側から0へ、未定義点と極限の区別|
|36–48秒|指数と対数の逆関数・光の座標軸と曲線|
|48–64秒|割線から接線へ|
|64–76秒|極限の定義、黄金色の立体e、底と傾き|
|76–90秒|自然対数の微分、接点と傾きの変化|

台本・計算・時刻の原本は `src/model.ts`。`?render` は動画を書き出す内部描画モードです。通常の視聴ページでは数値スライダーや解答公開の操作は不要です。

複利・極限付近の計算にMath.log1pを用います。h=0を代入せず、割線と接線を別に計算します。一般の曲線はz=0。収束シーンの奥行きは正負の比較で、座標変換は横軸−log₁₀|h|−1、縦軸10(f(h)−2.5)です。

## 検証と再生成

```
npm ci
npx tsc -p materials/birth-of-e/tsconfig.json
npx vitest run materials/birth-of-e/src/model.test.ts
npm run build
```

`render/README.md` はMP4と日本語音声を再生成する手順です。無料のOpen JTalk、Chromium、FFmpegを用い、有料APIは不要です。Webのビルド・配信とは別に動画を書き出します。

MP4：`public/media/birth-of-e-90s.mp4`

収録音声：`public/media/birth-of-e-narration.m4a`

再生準備完了情報：`public/media/birth-of-e-ready.json`

音声・字形のクレジットは `THIRD-PARTY.md` を参照。動画の検証記録は `VIDEO-CHECK.md`。
