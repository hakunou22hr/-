# 円周をほどく旅 ― πからラジアンへ

数学Ⅰ／円周率・弧度法・単位円の前提となる導入。既存教材を変更せず新規追加。

## 閲覧・動画

- 教材: https://hakunou22hr.github.io/-/materials/pi-to-radian-journey/?v=1
- 90秒MP4: https://hakunou22hr.github.io/-/media/pi-to-radian-journey-90s.mp4?v=1
- ライブラリの「数学Ⅰ」。円周率・π・弧度法・ラジアン・単位円で検索可能。

字幕焼き込み、音声なし、1920×1080、24 fps、H.264/yuv420p、BT.709。HTML videoの再生・シーク・保存に加え、同じ時刻を操作キャンバスへ引き継ぐ。自動解説も同じ90秒の状態を使う。

## 数学モデル

`model.mjs`をMP4・自動解説・操作教材で共有する。円の右向き移動はx=rφ、回転は−φ。ほどいた長さrφと円に残る長さr(2π−φ)の和は2πr。両者は下端で接線を共有する。直径3本の残りは(π−3)2r、半径6本の残りは(2π−6)r。

ひもの曲率をb/r (0≤b≤1)とし、0≤u≤1について、b>0では

`P(u)=(r−2r/b sin²(bu/2), r/b sin(bu))`。

b=0ではP(u)=(r,ru)。速度のノルムは常にrで、ひもの長さはr。b=1で円周上の1radの弧になる。曲げる途中はまだ中心角を定義せず、完成後に2本目の半径を表示する。弦長2r sin(1/2)と弧長rを混同しない。

θ=s/rは角度の数値（rad）。π=C/dは定数。角度固定時には半径と弧長が同じ比率で変わる。1周を測るため終端2πを含める。

## 描画と操作

`renderer.mjs`はCanvasで3D座標から遠近投影した格子・独立回転リング・粒子を毎フレーム計算する。格子は細分化頂点を測定端点からの波で変位させ、ものさし配置や弧の完成時に発光・収束・波紋が反応する。場面導入では視点が旋回・前進して正面に戻り、ひもの導入では図形も近づく。前景の測定図形は長さ・角度が読み取れる正面図。2D設定では空間背景を止め、動きを抑える設定では粒子・背景・波を固定する。

半径、転がり量、中心角、ひもの曲げ具合を操作できる。円の横ドラッグ／円周端点のドラッグ、矢印・Home・End、度／rad、直径／半径のものさし、角度プリセット、1radと60°の重ね合わせを実装。

## 再現・検証

```
node materials/pi-to-radian-journey/tests/math.mjs
npx vitest run materials/pi-to-radian-journey/tests/catalog.test.ts
npm run build
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node materials/pi-to-radian-journey/render/movie.mjs
node materials/pi-to-radian-journey/tests/video.mjs
```

`CHECK_ONLY=1 OUTPUT=/tmp/radian-check`を指定すると代表17時刻のフレームとモデル値を生成する。MP4生成時はChromiumをレンダラーとして使い、FFmpegに2160枚を送る。

`.github/workflows/pi-rad-check.yml`は同じコミットのPages deploy成功後に公開ページと実MP4をChromiumで確認する。数学モデル、操作、動画シークと終了、同一キャンバスでの引継ぎ、ライブラリ保持を検証し、1440×1100・1024×768・390×844・844×390の記録をActions artifactに保存する。

iPhone/iPad/Safariの実機操作は未確認。ブラウザの画面サイズ模擬と区別する。ナレーション・BGMは付けていない（字幕で完結）。
