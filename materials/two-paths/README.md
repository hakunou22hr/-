# 数学Ⅲ｜二つの道、ひとつの答え（二幕構成・WebGL第5版）

90秒・30秒の専用編集。フルHD原版と軽量視聴用MP4、BGM・効果音、ブラウザ再生・一時停止・シーク・リセット・実ダウンロード。

## 参考教材からの実装の移植

`trig-integral-cinema/src/components/cinema/FormulaTunnel.tsx` のThree.js立体パネル・Reflector、`textures.ts` の決定的なseedと発光スプライト、`FormulaFlow.tsx` の4200個の加算合成粒子と時間依存の光の流れ、`GoldenRelease.tsx` の光柱・インスタンス描画、`Bloom.tsx` のEffectComposer / UnrealBloomPass / OutputPassを調査し、同じ仕組みをwebgl.jsへ移植。

新作独自の配置として、湾曲した数式パネルの両翼、アーチ、二本の光流と粒子流、合流する光柱を設計。数式パネルは今作のKaTeX素材を使用する。床は実際の視点に応じて反射を再描画する。ネイビーの空間と青・金の光を保ち、発光は主役数式にかけず背景だけに適用する。第2版の歯車・金属帯を描くCanvas背景は使用しない。

背景はWebGL 1280×720、主役数式と図形効果は1920×1080。両方を毎秒30コマの絶対時刻から描画し、フルHDで合成する。背景の映像ループや静止した写真、AI生成画像、フレーム補間は使用しない。通常の視聴では軽量720p MP4を使用し、プログラム描画は選択した場合のみWebGLを読み込む。

旧版と他の教材は履歴に保存。previous-edition.jsonに不変コミットへのリンクを記録。

## 前半・後半の空間転換

90秒版43秒、30秒版15秒で後半へ転換。後半は物理照明のある立体フレーム、厚みのある金属ゲート、シェーダーで明暗が流れる4本の光帯、3200粒子、立体結晶片、鏡面に映る床の発光体を描く。細いリング・放射状グリッド中心だった第4版を置き換えた。カメラは進入・合流を回り込むショット・引く余韻の3ショット。相殺では結晶と粒子が外へ広がり、合流では光の軌道が寄る。発光しすぎて数式が読みにくくならないよう、背景だけにブルームをかける。前半は旧版と代表4時刻の描画一致を検証し、完成済み素材を保持する。

## 数学

A：tに関する部分積分ではxは定数。[(x−t)sin t−cos t]₀ˣ = 1−cos xを得てから微分する。
B：F(x)=xI(x)−J(x)を積の微分と基本定理で微分し、+x cos xと−x cos xを相殺。残る積分を評価する。
結論はF′(x)=sin x。すべての実数xで成立。最後の曲線はF′のグラフ。

## 書き出し

Node.js、Chromium、FFmpeg、Python NumPy、Noto Sans CJK、ルートpackage.jsonとrender/package.jsonの依存関係が必要。

1. `python materials/two-paths/render/audio.py work/two-paths-v5`
2. `npm run build` （render.htmlもビルドする）
3. 公開用ビルドを4175番などの固定HTTPサーバーで提供する。書き出し中はdistを上書きしない。
4. `TP_RENDER_ORIGIN=http://127.0.0.1:4175 node materials/two-paths/render/webgl-export.mjs 90`
5. 同じコマンドの末尾を30にして短縮版を書き出す。
6. `work/two-paths-v5/media` の原版を `public/media/two-paths/` へ複製する。
7. `node materials/two-paths/render/encode-play.mjs` で軽量版を生成する。

WebGL背景と前景合成を場面単位で保存し、同じコマンドで未完了分を再開できる。ソースとエンコード処理のハッシュが変わった場合は別の保存領域を使う。最後に映像を結合し、全編の音声を一度だけエンコードして継ぎ目の無音を防ぐ。最終的なフレーム数・動画と音声の尺・全編デコードを検査する。

## 検証

`render/check.mjs`：216場面の数式配置、正負のxの数値積分、端点・導関数の検証。
`render/webgl.check.cjs`：実WebGLコンテキスト、全6場面×2版の動作と決定的シーク。
`render/browser.check.cjs`：ライブラリから両版の実時間再生、制御、実MP4のダウンロード一致。
`render/production.check.cjs`：本番ビルドのネイティブ再生とWebGLモード。

配布MP4は横型。9:16の前景配置設計は保持するが、縦型MP4は今回の配布には含めない。WebGL再生の滑らかさは端末性能に依存する。
