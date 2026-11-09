# 速度と道のり — 点Pの軌跡

この教材は既存一覧の material.json 自動登録を使用します。既存教材の変更はありません。

## 再生と配布

- 90秒版：このフォルダの index.html。Three.jsによるWebGLアニメーション、1920×1080を基準とする16:9レスポンシブ表示、requestAnimationFrameによる再生。
- 縦型30秒版：同一のシーン時間を3倍速で使用し、9:16用の文字・図形配置を適用。タブからブラウザ再生。
- 縦型MP4：public/media/velocity-distance-30s.mp4。1080×1920、30fps、H.264、yuv420p、faststart、無音。
- 6シーンの実レンダリング：public/media/velocity-distance/scene-01.jpg ～ scene-06.jpg。
- プレビューと検証記録：public/media/velocity-distance/previews.html。

開発環境はリポジトリ直下で `npm run dev`。配布は既存の `npm run build` とGitHub Pagesフローを使用します。Three.jsとKaTeXはローカルにバンドルされ、CDN依存はありません。

## 数学モデル

- 一次元運動：t∈[1,3]、x(t)=t³/3+2t−7/3−6、v=t²+2。数直線のOはx=0。
- 速度グラフ：v=t²+2、1≤t≤3。細分された160本の帯を蓄積し、積分値は解析的な原始関数で計算。面積の蓄積完了後に38/3を表示。
- 平面曲線：x=5 sin t、y=(14/5) sin 2t。接線速度=(5 cos t,(28/5)cos 2t)。すべて同一のxy平面内。
- 三角形：Δx,Δyの斜辺はΔr。弧長Δsとは有限区間で区別。時間幅を0.65から0.018へ縮小し、図を拡大して可視性を維持。
- 道のり：速さの数値積分による累積表示。負の速度をもつ一次元運動では変位と道のりは異なることを、最終式で区別。

背景のリング速度・粒子輝度・波・三角形の密度は時刻、速さ、微小時間、積分の進行に連動します。同じLineSegmentsの頂点をシーン間で補間し、座標格子・リング・海・幾何学空間の形状を変形します。

## 検証範囲

数学の数値チェック、6シーンの数式レンダリング、一覧登録、390×844、1024×768、1366×768のChromium表示、MP4のffprobeおよび全フレームデコードを検証対象とします。結果は公開メディアフォルダのJSONに記録。

実機のiOS Safari、iPadOS Safari、Windowsブラウザでの動作は未確認です。60fpsはブラウザ再生の目標であり、端末性能に依存します。90秒のMP4は制作対象のブラウザ版とは別で、この教材には含みません。

## ライセンス

Three.js・KaTeXのライセンスはvendor内に保持しています。画像背景、音源、ナレーションは使用していません。

動画の再書き出しにはPlaywright、Chromium、FFmpegが必要です。リポジトリ直下で開発サーバーを4173番ポートに起動し、`node materials/velocity-distance-cinema/render/export.mjs` を実行します。Playwrightを別の場所にインストールした場合は `PLAYWRIGHT_MODULE_PATH` でモジュールの絶対パスを指定できます。
