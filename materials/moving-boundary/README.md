# 数学Ⅲ｜動く境界 — 微分が積分を解き放つ

90秒横型（1920×1080）と30秒縦型（1080×1920）を同時制作。各30fps、人物・ナレーションなし、オリジナル合成BGM・SFX付き。教材ライブラリはこのフォルダの material.json から登録する。

## 数学と映像

F(x)=∫₀ˣ(x−t)cos t dt。tに対してxは定数として分解し、I(x)=∫₀ˣcos t dt、J(x)=∫₀ˣt cos t dtを定義する。積の微分でF′=I+xI′−J′、基本定理でI′=cos x、J′=x cos x。2項は同じ大きさで逆の符号として相殺され、残る積分を原始関数sin tで評価する。結論F′(x)=sin xはすべての実数xで成立する。グラフ実演はx≥0。

グラフの頂点は解析式から毎フレーム計算し、t/y平面・床グリッド・カメラを透視投影する。金は正、青は負の面積。カメラの向きが変わっても関数の値と積分範囲は一致する。分解場面ではx cos tとt cos tを別の平面に表示する。相殺では文字が重ならない距離を保ち、式を光粒子へ変えてから衝突させる。

背景は保存済みの「積分の中に眠る円」から動的背景生成をコピーして再利用。元教材は変更しない。ノイズから生成した星雲を変形させ、発光する壁と床、前進するゲート、光流・浮遊数式・稲妻を絶対時刻から描画する。固定背景写真は使わない。数式は既存教材と同じKaTeXで高解像度の透過素材を生成し、同じ素材とfilm.jsをブラウザとMP4で使う。

90秒版：[0,12,28,45,65,80,90]。縦型30秒版：[0,5,12,15,22,26,30]。中央切り抜きや一律3倍速ではなく、字幕・式・グラフを専用配置する。相殺効果音は各版のu=.74（59.8秒／20.18秒）に同期する。

## ファイルと再生成

- 再生ページ：materials/moving-boundary/index.html
- マスター：public/media/moving-boundary/moving-boundary-90s.mp4、moving-boundary-30s.mp4
- 通常再生：同フォルダの *-play.mp4（1280×720／720×1280、Baseline H.264、映像最大2Mbps、faststart）
- ダウンロードはフルHDマスター。軽量再生版も同一の映像・音声・尺を保ち、音声はコピーする。
- レンダー／音響：render/render.mjs、render/audio.py。旧Pythonレンダラーと旧画像素材は前版の記録として保持し、新版の生成には使用しない。前版はprevious-edition.jsonのコミットとGit履歴から取得できる。

Node.js、FFmpeg、Python+NumPy、Noto CJK、@napi-rs/canvas が必要。再生に有料APIや外部サービスは使わない。数式の再生成のみKaTeX（ルート依存関係）、Playwright、Chromiumとポート4173の開発サーバーを使用する。

```sh
mkdir -p work/moving-boundary-v2
node materials/moving-boundary/render/generate-math.mjs
python materials/moving-boundary/render/audio.py work/moving-boundary-v2
node materials/moving-boundary/render/check.mjs
node materials/moving-boundary/render/render.mjs 90
node materials/moving-boundary/render/render.mjs 30
node materials/moving-boundary/render/playback.mjs
```

出力はまずwork/moving-boundary-v2/mediaへ生成し、検証したファイルをpublic/media/moving-boundaryへ配置する。raw RGBAフレームをFFmpegへ送り、正確な2700／900フレームをエンコードする。全デコード、尺・寸法・形式、数式境界・重なり、背景の動き、決定的シーク、解析式との積分・微分の一致を検証する。検証記録はverification.json。

JavaScriptや数式素材の読み込みが失敗しても、通常のMP4は再生できる構成。Canvasの準備は「プログラム描画で見る」を選択した場合だけ行う。音量・ミュート・再生／一時停止・シーク・リセット・全画面と直接動画を開くリンクを備える。

環境にNode用レンダラーがない場合は `npm install --prefix materials/moving-boundary/render` で固定版のCanvasとPlaywrightを導入する。全編再生と操作の回帰検査は、開発サーバー起動後に `node materials/moving-boundary/render/browser.check.cjs`（公開用ビルドでは `MB_TEST_ORIGIN` を指定）で実行できる。
