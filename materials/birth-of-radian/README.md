# ラジアンの誕生

数学Ⅱ「三角関数・弧度法」の90秒WebGL映画。ライブラリでは material.json により自動登録されます。既存の radian-arc-explorer は変更しません。

- 入口: `/materials/birth-of-radian/`
- 縦型: `/materials/birth-of-radian/?portrait`
- 指定時刻: `?t=20`
- フレーム書き出し: `?portrait&export` と `window.seekFilm(seconds)`
- MP4: `/media/birth-of-radian-30s.mp4`
- 再生・一時停止・最初から・シーク・全画面。WebGL失敗時は定義と結論のテキストを表示。

## 数学モデル

半径の描画スケールR=2.35を教材内の r=1 と対応させます。u∈[0,1]、帯の長さℓ（通常1、最後だけπ−3）、巻き付け率k∈[0,1]とし、s=uℓ、w=kℓ、v=min(s,w)、d=max(0,s−w)、a=開始角+v。

位置は R(cos a − d sin a, sin a + d cos a, 0)。既巻き付け部分は円、残りはその接線です。接点で位置と接線が連続し、どちらの部分でも弧長パラメータに対する微分の大きさはR。したがって変形中も全長Rℓを保存します。放射線の角度は同じwから算出。半円は1+1+1+(π−3)=πで閉じ、3.14を正確な値として扱いません。

## シーン

0–12: 点、半径、円の形成。12–30: 半径の複製・移動・連続的な巻き付け、1 rad。30–52: 青・緑・金の3本と赤のπ−3本。52–72: 分数の変形、半径の粒子化、押し出した立体π、背景収束。72–90: 半円の立体回転、180°=π rad、全円と360°=2π rad、消灯。

背景は奥行き方向の24環、水平の15環と72本の放射線、7本の立体螺旋リボン、4200粒子、110本の光跡、衝撃波で構成。CinematicSpaceがPerspectiveCamera・主役と同じ時間で更新します。半径と帯は動的な三角形メッシュのチューブ。πはExtrudeGeometry。数式はKaTeX。背景画像は使用していません。帯の完成時刻25・34.6・40・45.4・50.8秒に波を発生し、πでは収束と放出を行います。中央の数学図形と数式の背後は画面座標で光量を抑え、外周の光を強調します。Bloomは文字の後段ではなくWebGL図形だけに適用します。

## 実行・検証

リポジトリルートで `npm run dev`、`npm run build`。Three.jsとKaTeXは既存の依存を使用します。

`node materials/birth-of-radian/tests/length.check.cjs` で24条件の長さ保存を数値検査。検証結果は verification/、指定時刻の画像は previews/。

render/ のスクリプトはリポジトリルートから実行します。Playwright Core、Chromium、FFmpegが必要です。PlaywrightはPLAYWRIGHT_MODULE、ローカルのplaywright / playwright-core、今回の環境の順に検索します。ChromiumのパスはCHROMIUM_PATHで指定できます（既定 /usr/bin/chromium）。`preview.cjs` は1920×1080の5時刻、`export.cjs` は1080×1920・30fps・900フレームを描画し、H.264/yuv420p MP4を保存します。最後にfinish.cjsでcaptions.assの読みやすい日本語字幕を付けます。video.check.cjsで実再生・保存したファイルの一致を確認できます。静止画のパン・ズームによる動画化は行いません。

## 検証上の限界

Chromiumでの確認であり、iPhone実機Safariの動作・60fpsの維持を保証するものではありません。書き出しは無音です。既存リポジトリの全体テストには今回変更していない教材の失敗があるため、全テスト成功とは報告しません。

## 背景演出の改訂

円環の微小な回転から、トンネル・水平円盤・螺旋光・粒子の前進による空間演出へ作り直しました。`cinematic-space.js` が演出本体です。`render/motion-preview.cjs` は16〜24秒の動きを960×540・30fpsの8秒動画として書き出します。`render/background.check.cjs` は各シーンの1秒差の画面と、帯の完成に同期したパルスを検証します。
