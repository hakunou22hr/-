# 数学Ⅲ 回転体の体積（例題166）

## 開く

教材ライブラリから1タップで3D探究を開きます。「映画型90秒動画」タブで、同一の数式・メッシュによる90秒の演出に切り替えられます。再生・一時停止・時刻スライダー・6場面への移動があります。画面内のリンクからH.264 MP4も開けます。ナレーション・音楽・効果音は付けていません。

開発: リポジトリのルートで `npm ci`、`npm run dev`。`/materials/rotation-volume-166/` を開きます。製品コードはReact/TypeScript、Three.js、OrbitControls、EffectComposer/UnrealBloomPass、KaTeX、Vite。既存依存を使い、R3Fの追加を必要としない直接Three.js描画です。外部API・背景画像・有料素材への依存はありません。

## 数学モデル

`src/model.ts` が探究と映画の共通モデルです。R(x)=−x²+4x、r(x)=x、0≦x≦3。交点は(0,0),(3,3)。外側と内側は (x,R cosθ,R sinθ)、(x,r cosθ,r sinθ) を別メッシュで生成します。解析的な単位法線を設定し、内側は空洞へ向けています。部分回転の両曲面と回転中の領域面を毎回更新します。

断面は r(x)≦√(y²+z²)≦R(x)。端点で幅と面積が0になる円環です。外半径の説明線は赤、内半径は青。曲線・外側曲面はシアン、直線・内側は金（空洞強調時は赤）。

S(x)=π(x⁴−8x³+15x²)。原始関数はπ(x⁵/5−2x⁴+5x³)。外側の体積153π/5、内側円すいの体積9π、差108π/5。

輪切りの積み重ねには中点Riemann和を使い、区別しやすいよう厚さの17%に表示上の隙間を設けます。数値の近似計算は隙間を除かず、正しい区間幅3/Nを使います。最終解答は定積分による厳密値です。

## 映画の6場面

0–12秒: 軸と2曲線、交点、領域。12–30秒: 0°から360°の連続的な面の掃引。30–45秒: 外側の透明化と空洞へのカメラ進入。45–60秒: x=0から3まで円環を動かす。60–76秒: 6枚から80枚へ増える円環。76–90秒: 円すいを分離、粒子に分解し、残る立体を金で強調。

`filmPose(time)` をシークも再生も書き出しも使用します。MP4は1280×720、24fps、90秒、H.264/yuv420p・BT.709（TV range）、faststart、音声なしです。画面外のページタイトルは動画に含めず、数学の説明と字幕のみを表示します。

## 再書き出し

既存ルートで開発サーバーを8770番で起動します。PlaywrightとChromium、ffmpegが必要です。

```
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
OUTPUT=/absolute/output/rotation-volume-166-90s.mp4 \
node materials/rotation-volume-166/render/render.mjs
```

出力先は開発サーバーの監視対象外にしてください。静的ビルドを別ポートで配信し、`APP_URL=http://127.0.0.1:8771/` を指定すると再読み込みを防げます。書き出しはブラウザで同一の3DとKaTeXを時刻ごとに描画し、全2160フレームをMP4へ変換します。

## 検証

```
npx tsc -p materials/rotation-volume-166/tsconfig.json
npx vitest run materials/rotation-volume-166/tests/model.test.ts
npm run build
```

`browser-verification.json`、`media-verification.json` に実際に行った検証を保存します。Windows/iPad/iPhone実機は未検証。Chromiumのデスクトップ・モバイル幅とタッチ入力エミュレーションで確認します。スマートフォンの操作欄は折りたためます。WebGL2が必要で、描画性能は端末に依存します。実機未確認を実機対応の検証済みとは扱いません。

## 利用条件

React、Three.js、KaTeX、ViteはMITライセンス。幾何メッシュ、背景粒子、格子、動き、説明パネルは本教材のコードで生成します。AI生成画像・写真・市販音源は使っていません。既存の教材ファイルは変更しません。

公開後は GitHub Pages の専用ジョブ `verify-rotation-volume-166` が実URLで3D、6場面、MP4の再生・シーク・終了までを確認します。操作やタッチは `tests/browser.mjs`、`tests/touch.mjs` に再検証手順を含めています（PlaywrightとChromiumが必要）。
