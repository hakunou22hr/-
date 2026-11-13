# 単位円でつかむ、sin・cosの符号

半径1の円の点P=(cosθ,sinθ)を反時計回りに進め、四つの象限で座標の正負を判断する教材。

## 数学と学習の順序

- O=(0,0)、H=(cosθ,0)、P=(cosθ,sinθ)。OHはx軸上の底辺、HPは縦の成分。OP=1。
- cosθ=xは右で正・左で負。sinθ=yは上で正・下で負。
- 第1象限(+,+)、第2象限(−,+)、第3象限(−,−)、第4象限(+,−)。順は(cos,sin)。
- 軸上の点はどの象限にも属さず、一方の座標が0。0は正でも負でもない。
- 辺の長さは |cosθ| と |sinθ|。負になるのは長さではなく符号付き座標。
- tanθ=y/xは補足のみ。x=0で未定義。

## 成果物と演出

90秒1920×1080と30秒1080×1920のH.264 MP4。24fps、字幕付き・音声なし。生徒のいる夕暮れの教室から黒板へ入り、空間の四領域と符号付き矢印を見る。縦軸・横軸を越える瞬間に、その座標から光の粒子が飛散し、カメラが前後・左右に移動する。説明中は正面に落ち着く。背景の回転模様や波形で動きを代用しない。

教室は前教材で承認済みのAI生成静止画像を再利用。奥行きメッシュをカメラが進む2.5D表現で、生徒を独立に動かす実写動画ではありません。

操作教材では4象限・軸上の点を選び、横と縦の符号を先に予想。答えを確かめると座標と理由が開きます。符号表は任意で表示。角度スライダー、ゆっくり回転、2D/3D表示を装備。

## 再編集・再生成

このフォルダのReact・Three.js・KaTeXソース、assets/classroom.pngが素材。完成MP4、SRT、字幕台本、ポスターは `public/media/unit-circle-signs/`。既存の教材は保持して別教材として追加。

```
npx vite build --config materials/unit-circle-signs/vite.config.ts
python3 -m http.server 8827 --directory materials/unit-circle-signs/build
APP_URL=http://127.0.0.1:8827/ OUTPUT=/tmp/signs-main.mp4 node --experimental-strip-types materials/unit-circle-signs/render/render.mjs
EDITION=short APP_URL=http://127.0.0.1:8827/ OUTPUT=/tmp/signs-short.mp4 node --experimental-strip-types materials/unit-circle-signs/render/render.mjs
PREVIEW=1 APP_URL=http://127.0.0.1:8827/ OUTPUT=/tmp/signs-preview.mp4 node --experimental-strip-types materials/unit-circle-signs/render/render.mjs
CAPTION_OUTPUT=/tmp/signs-captions node --experimental-strip-types materials/unit-circle-signs/render/captions.mjs
```

Playwright・Chromium・ffmpegが必要。PLAYWRIGHT_MODULEとCHROMIUMでパス指定可能。文字と教室は描画倍率1.5、3D後処理はCSS画素倍率1。すべて実際の座標計算と独立の文字描画。

## 検証

math.test.tsは全角度の半径・長さ、4象限、軸の0、tanの未定義、映像の角度増加を確認。browser.mjsは各象限と軸上のクイズ、3D、回転、ベクトル、縦画面を確認。published.mjsは90秒・30秒の通し再生、シーク、再再生とRange 206を確認。スマートフォン・タブレットはChromiumで画面幅とタッチを模擬し、実機Safari確認と区別します。
