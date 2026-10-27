# 教室から、黒板の向こうへ。

新しい既定の背景は `classroom`。夕光の授業風景から黒板へ寄り、黒板を描いた新しいチョークの光の空間へつなぎます。従来の赤・青の波面画像はこの版では使用しません。

PC：0–4秒は教室、4–14秒は黒板への接近、14秒以降は新しい黒板背景で説明します。50–72秒の連鎖分裂、72–89秒の極限、89–105秒のΣ→∫、105秒以降の符号付き積分と [0,1] の公式は元の数学タイムラインに対応します。縦画面：0–0.8秒は教室、0.8–3.2秒で黒板へ接近、以降は元の30秒用の数学タイムラインに対応します。

教室画像は生成した一枚の背景を、黒板の実際の位置に合わせてカメラで寄る構成です。人物の演技を撮影・生成した動画ではありません。教室の背景に正しい文字と曲線を別途重ね、チョークの軌跡、光の粒子、カメラ、説明用の図形は時刻から描画します。黒板の周囲は新しく生成したチョークの背景に局所的な変形を加え、追加の3D格子・光の流れ・粒子を描画します。中央の計算用グラフと背景の装飾図形は区別しています。

## 色と演出

- 教室：夕日の琥珀色、木の机、空気中のチョークの粒。
- 説明：深い緑の黒板、金と朱の発光、青緑の曲線、白い光の芯。
- 極限：黒板の奥へ続くチョークの枠と座標格子。
- 数式の形成：長方形から光が集まり、Σと∫へ変形。

生成した背景素材：`assets/classroom-sunset.png` と `assets/chalk-cinema.png`。それぞれの生成元は `assets/CLASSROOM-ASSETS.md` に記録します。

## 再生成

```
RIEMANN_BACKGROUND=classroom RIEMANN_OUTPUT=work/riemann-classroom RIEMANN_NAME=riemann-integral-120s-classroom node materials/riemann-integral-cinema/render/render.mjs
RIEMANN_BACKGROUND=classroom RIEMANN_OUTPUT=work/riemann-classroom RIEMANN_NAME=riemann-integral-30s-classroom node materials/riemann-integral-cinema/render/render.mjs --portrait
```

フルHD・30fps、H.264/yuv420p、音声なし。縦画面は1080×1920。ライブ操作と書き出しは `world.js`、`timeline.js`、`classroom-universe.js` を共通で使います。数値計算は `math.js` の右端和をそのまま利用します。旧版は既存ファイルと背景メニューに残しています。
