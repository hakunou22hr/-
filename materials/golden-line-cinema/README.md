# 円の領域　x+y=K　点と直線の距離

教材ライブラリでの登録名：円の領域　x+y=K　点と直線の距離。
映像内の作品名：黄金の直線が暴く 最大値・最小値。

90秒16:9、30秒9:16。ナレーションなし。数学Ⅱの領域と最大・最小。
領域 x²+y²≦10, y≧−2x+5。最小値2 at (3,−1)、最大値2√5 at (√5,√5)。

## 映像
参考：同じライブラリの moving-line-cinema。回廊、鏡面床、HDR bloom、加算粒子の構造を再利用。円・円弧と弦による正確な領域、常に黄金色の目的直線、接触粒子、波紋、接線と半径、専用カメラワークは本作品用に実装。
描画は実3D。背景を横型1280×720・縦型720×1280で30fpsにて描画し、フルHDのTeX・日本語字幕へ合成。動画のループや静止画像のズームによる代用は行わない。
最小点は円との接点ではないため「最初に触れる点」と表記。最大点では半径と接線の直交も表示。
90秒版の42秒では小さいkから探索し直すことを明記。48秒で最小、74秒で最大。
30秒版は12秒で最小、22秒で最大、25秒からまとめ。

## 音楽
render/audio.pyによる48kHzステレオのオリジナル合成音楽。弦の倍音、金管、低音、打楽器、逆再生風ノイズスウェル、接触音を時間軸に同期。外部サンプル・音声・有料APIなし。

## 再生成
リポジトリの依存（three、katex、@napi-rs/canvas）とPlaywright、Chromium、FFmpeg、Python NumPy/SciPy、Noto CJKを使用。
`npm install --prefix materials/golden-line-cinema/render` で書き出し用の依存を準備し、ローカルViteサーバーを4173で起動。
`node materials/golden-line-cinema/render/generate-math.mjs`
`python materials/golden-line-cinema/render/audio.py`
`node materials/golden-line-cinema/render/export.mjs 30`
`node materials/golden-line-cinema/render/export.mjs 90`
中間データは /workspace/work/golden-cinema、完成MP4は /workspace/output/cinema-v2。
書き出しはシーンごとにソースハッシュ付きチェックポイントで再開可。

検証：`node materials/golden-line-cinema/render/mathematics.check.mjs`。
数学の境界・接点・独立した全周探索・各フレームの交点を検証。書き出し時にフレーム数・音声・尺・デコードを確認。

追加確認：`node materials/golden-line-cinema/render/layout.check.mjs` は数式画像の透明余白を除いた実際の描画領域で、240時点の前景の重なりと縦型安全域を確認。`render/library.check.cjs` は90秒版の公開ページで、教材カード・390px幅のスマートフォン画面・尺・寸法・シーク・再生・原版リンクを確認。原点に不要な共有点の光が残らないよう、Three.jsのvisibleを明示的な真偽値にし、毎フレーム検査する。


## 教材ライブラリへの保管

公開ページは90秒版。再生用は public/media/golden-line/golden-line-cinema-90s-play.mp4。フルHD原版は archive/golden-line-cinema-90s.mp4 に同一バイト列で保管し、ページからダウンロードできる。30秒版の制作ソースも含むが、この登録では30秒MP4は公開しない。


## y切片が切れない構図への修正（v2.2.0）

90秒版の58秒から、座標範囲を上側y=5.6・右側x=5.4まで滑らかに広げる。カメラも引いて下側へ構図を調整し、黄金の直線のy切片(0,k)を追跡表示。最大時は(0,2√5)と円との接点(√5,√5)を別々に示す。青い境界線も拡張した座標範囲まで延長。`render/intercept.check.cjs`で移行・最大・まとめの各時点の切片位置、直線との一致、上側余白、軸名と目盛りの非重複を確認する。
