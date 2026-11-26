# 傾きが出会う瞬間 ― 平均値の定理【改訂版】 v10

## 今回の変更

利用者がMUSEで制作・提供した10秒の教室映像を導入と帰還へ組み込んだ。生徒が隣人へ顔を向けて談笑する実際の動画フレームを使用し、画像全体を揺らす方法では代用していない。金髪は左手前の女子生徒1人で、ほかは黒髪。

黒板の放物線・A(0,0)・B(2,4)は数学コードで合成する。図はカメラ接近に合わせて手前へ浮かび、9〜12秒で発光する開口から座標空間へ移る。同じグラフオブジェクトを使い、別の図へ切り替えない。帰還は同じショットを逆方向にたどる。

12〜84秒はv9の数学説明・縮まない粒子アシスタント・発話を維持。音声は16の短い反応で、発話57.34秒、全体で約33秒の間。元のMUSE素材の音は混ぜず、この教材のアシスタント音声を使用する。v1〜v9のMP4は保持。

## 閲覧

- 教材: https://hakunou22hr.github.io/-/materials/mean-value-theorem-revised/?v=10
- 90秒: https://hakunou22hr.github.io/-/media/mean-value-theorem-revised/mean-value-theorem-revised-90s-v10.mp4
- 導入12秒: https://hakunou22hr.github.io/-/media/mean-value-theorem-revised/preview-classroom-12s-v10.mp4

教材ライブラリの数学Ⅱ「傾きが出会う瞬間 ― 平均値の定理【改訂版】」から開ける。

## 素材と限界

提供素材は1280×720・24fps・10秒。教材とMP4は1920×1080で数式を再描画するが、映像の拡大によって元の細部が増えるわけではない。提供素材では全員が黒板へ向き直る場面は確認できず、談笑からカメラが黒板へ進む動きを採用している。元の参照静止画と比較すると人物数・座席・黒板の比率にも差があるため、忠実に同一の教室・人物を再現したとは評価しない。

冒頭の約0.25秒にある黒い縁付きの表現を省く。最初の6秒で素材0.25〜4.5秒、その後は素材終端までカメラの接近を使い、開口中は終端フレームを保持する。人物の顔を加工・再生成していない。教室は提供動画、数学空間とグラフ・粒子・発光は動的な描画。

## 同じ操作教材での再生

`classroom.mjs` が絶対時刻から素材フレームと黒板上のグラフ配置を決める。`ClassroomFrames` は提供動画を24fpsで抽出したJPEGを最大10枚だけ保持し、スマホで全240枚を同時に展開しない。シーク時は必要なフレームを非同期で待ち、後から完了した古い要求が新しい時刻の表示を上書きしない。MP4も同じコードで正確なフレームを待ってから描画する。

## 再制作

```sh
RANGES='[[0,12,"part-classroom-12s"],[84,90,"part-return-6s"]]' OUTPUT=/workspace/work/mvt-v10/delivery node materials/mean-value-theorem-revised/render/movie.mjs
OUTPUT=/workspace/work/mvt-v10/delivery node materials/mean-value-theorem-revised/render/upgrade-v10.mjs
```

`tests/classroom.mjs` は240枚のフレーム、時刻・帰還・上縁の余白・小さいキャッシュを検証する。既存の数学・音声・ガイド検証を継続。MP4全編のデコード・音声・旧版照合を行い、公開後はGitHub Actionsで実際の素材フレームの進行、後方シーク、再生から操作への切替と4画面サイズを確認する。物理iPhone/iPad/Safariは未確認。

## Instagram用30秒版

- 縦型9:16、1080×1920、30fps、30秒。横長映像を切り抜かず、同じモデルから図と文字を縦画面用に再描画する。
- 0〜5秒：提供MUSE映像と黒板からの移行。5〜11秒：横2・縦4から平均2。11〜17秒：接線の傾き1→2→3。17〜22秒：途中で一致して平行。22〜26秒：2c=2、c=1。26〜30秒：正式な条件と定理。
- 同じアシスタントの6つの短い音声を30秒用に収録。粒子の明滅はこの音源の波形へ同期。図の状態に合わせて式を表示し、一致前にP(1,1)や接線y=2x−1を表示しない。
- v11では一定サイズのガイドを右上へ固定し、微小な浮遊を残す。変化量の測定は2倍、平行の発見は1.75倍、c=1の確認は2.1倍へ連続ズーム。x/yを同率で拡大し、傾きを保つ。数式は画面下部に拡大表示。主要字幕を右端・最下部から離し、Instagramの表示との干渉を抑える。アプリ側の表示には端末差があるため、投稿前の最終確認は必要。
- 教材ページの「Instagram用・30秒縦型版」から再生・保存できる。Instagramへの投稿自体は行わない。

```sh
REELS=1 RANGES='[[0,30,"instagram-30s-v11-silent"]]' OUTPUT=/workspace/work/mvt-reels-v11/delivery node materials/mean-value-theorem-revised/render/movie.mjs
OUTPUT=/workspace/work/mvt-reels-v11/delivery node materials/mean-value-theorem-revised/render/package-reels-v11.mjs
```

旧30秒版v10と90秒版v10は保存し、上書きしない。v11では音声を再利用する。書き出し専用Chromeでは2D CanvasのCPU描画を使用し、動画本体のWebGL背景は継続する。

## Instagram v12：右側の説明と全高の座標空間

- 下部カードを廃し、説明・計算・条件を右側x700〜1050、y475〜1635に配置。グラフはy360〜1760まで拡張。文字領域へ線が侵入しないマスクを置く。
- 平均4/2の測定は1.8倍、平行の一致は2.15倍、c=1は2.7倍。x/yの倍率は等しく、Pと単位三角形を左の広い空間に保つ。
- 30秒版だけAI GUIDEのラベルを非表示。外向きの不規則なプラズマの噴出・ループ・火花を追加。90秒側はこの追加オプションを使わない。
- v10/v11と90秒映画は保存。音声は既存の6つの応答を継続使用。

```sh
REELS=1 RANGES='[[0,30,"instagram-30s-v12-silent"]]' OUTPUT=/workspace/work/mvt-reels-v12/delivery node materials/mean-value-theorem-revised/render/movie.mjs
OUTPUT=/workspace/work/mvt-reels-v12/delivery node materials/mean-value-theorem-revised/render/package-reels-v12.mjs
```

## Instagram v13：静かな導入と数学に反応する背景

- 0〜4秒は授業映像だけ。説明・数式パネル・ガイド・ナレーションを出さない。2.5〜4秒に黒板へクローズアップ、4〜5秒に黒板の図を座標空間へ渡し、5秒から説明する。
- v10の30秒音源から冒頭5秒の説明音声だけをミュートし、後半のアシスタント応答を継続。音声の冒頭無音をMP4から測定する。
- 30秒ガイドは全ての外部フレア、コロナ、噴出を無効にし、内部の粒子と光の流れを保持。
- reactive-space.mjsが奥行きの光流・光の幕・透視格子のレーン・接点への収束・金色の衝撃波を描画。測定量、実際の接点、傾きの一致に反応する。文字は前景の保護パネルへ表示。
- 同じ背景を操作教材の3D表示へ適用。点Pを動かすと光の位置が追従し、傾きが近づくと金色へ反応する。2D表示と動きを抑える設定を尊重する。
- 旧30秒v10〜v12、90秒MP4・プレビューを保持。

```sh
REELS=1 RANGES='[[0,30,"instagram-30s-v13-silent"]]' OUTPUT=/workspace/work/mvt-reels-v13/delivery node materials/mean-value-theorem-revised/render/movie.mjs
OUTPUT=/workspace/work/mvt-reels-v13/delivery node materials/mean-value-theorem-revised/render/package-reels-v13.mjs
```

## v14：現行全動画の直線発光と、左側男子の前向き合成

- 対象はこの教材の現行90秒映画、30秒縦型、6本の短いプレビュー、操作教材。旧版のMP4は保持。
- line2に共通の多層ブルーム、濃い色の帯、明るい細い芯、線上を移動する光を実装。割線・接線は平行関係と色の役割を保ち、測定・単位三角形・投影線にも適用。動きを抑える設定では移動光を停止。
- 教室映像の左側男子の頭部を、元のMUSE映像frame000の黒板向きの実写で置換。窓・黒板の計測済みカメラ拡大に合わせたアフィン変換とフェザーマスクを使用。元の54コマを別ディレクトリへ保存し、男子が画面外へ出た後は元の素材を使う。ほかの生徒の談笑、カメラ前進は保持。
- 顔を生成した動画ではない。元の前向きの頭部を登録しているため、頭部自体の新しい演技や振り向きは追加していない。元映像は720p。
- 30秒版の冒頭説明なし・フレアなし、右側説明、反応する背景を継続。90秒版は従来の説明・音声タイミングを継続。

```sh
python -m pip install --target /workspace/work/mvt-v14-python -r materials/mean-value-theorem-revised/render/requirements-classroom-front.txt
PYTHONPATH=/workspace/work/mvt-v14-python python materials/mean-value-theorem-revised/render/classroom-front-v14.py
CPU_CANVAS=1 RANGES='[[0,90,"main-90s-v14-silent"]]' OUTPUT=/workspace/work/mvt-v14/delivery node materials/mean-value-theorem-revised/render/movie.mjs
REELS=1 RANGES='[[0,30,"instagram-30s-v14-silent"]]' OUTPUT=/workspace/work/mvt-v14/delivery node materials/mean-value-theorem-revised/render/movie.mjs
node materials/mean-value-theorem-revised/render/package-v14.mjs
node materials/mean-value-theorem-revised/tests/video-v14.mjs
node materials/mean-value-theorem-revised/tests/reels-video.mjs
```
