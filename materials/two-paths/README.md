# 数学Ⅲ｜二つの道、ひとつの答え（二幕構成・WebGL第7版）

90秒・30秒の専用編集。フルHD原版と軽量視聴用MP4、BGM・効果音、ブラウザ再生・一時停止・シーク・リセット・実ダウンロード。

## 参考教材からの実装の移植

`trig-integral-cinema/src/components/cinema/FormulaTunnel.tsx` のThree.js立体パネル・Reflector、`textures.ts` の決定的なseedと発光スプライト、`FormulaFlow.tsx` の4200個の加算合成粒子と時間依存の光の流れ、`GoldenRelease.tsx` の光柱・インスタンス描画、`Bloom.tsx` のEffectComposer / UnrealBloomPass / OutputPassを調査し、同じ仕組みをwebgl.jsへ移植。

前半の独自配置として、湾曲した数式パネルの両翼、アーチ、二本の光流と粒子流、合流する光柱を設計。数式パネルは今作のKaTeX素材を使用する。床は実際の視点に応じて反射を再描画する。ネイビーの空間と青・金の光を保ち、発光は主役数式にかけず背景だけに適用する。第2版の歯車・金属帯を描くCanvas背景は使用しない。

背景はWebGL 1280×720、主役数式と図形効果は1920×1080。両方を毎秒30コマの絶対時刻から描画し、フルHDで合成する。背景の映像ループや静止した写真、AI生成画像、フレーム補間は使用しない。通常の視聴では軽量720p MP4を使用し、プログラム描画は選択した場合のみWebGLを読み込む。

旧版と他の教材は履歴に保存。previous-edition.jsonに不変コミットへのリンクを記録。

## 前半・後半の空間転換

90秒版43秒、30秒版15秒から、提示された参考画像の金色の発光を基準にした回廊へ切り替わる。FormulaTunnelの3.8/2.2/0.6のHDR光柱、2.5/1.2/0.35の補助光、GoldenReleaseの光の広がり、Reflectorとブルームを組み合わせる。白く明るい芯・金色のにじみ・奥への光の重なりを分け、青白い天井・床の光と対比させる。壁は今作のTeX式で、床への反射はカメラ位置から実際に再描画する。相殺・合流を含む6か所で金色の発光が広がる。粒子・光波・カメラ・空間の移動は絶対時刻で制御する。BGM・効果音は第6版を保持。前半は描画一致を確認して完成素材を保持する。

## 数学

A：tに関する部分積分ではxは定数。[(x−t)sin t−cos t]₀ˣ = 1−cos xを得てから微分する。
B：F(x)=xI(x)−J(x)を積の微分と基本定理で微分し、+x cos xと−x cos xを相殺。残る積分を評価する。
結論はF′(x)=sin x。すべての実数xで成立。最後の曲線はF′のグラフ。

## 書き出し

Node.js、Chromium、FFmpeg、Python NumPy、Noto Sans CJK、ルートpackage.jsonとrender/package.jsonの依存関係が必要。

1. `python materials/two-paths/render/audio.py work/two-paths-v7` の後に `python materials/two-paths/render/thunder.py work/two-paths-v7` （初回の基本音源をaudio-baseとして保存し、雷鳴生成を再実行しても重複しない）
2. `npm run build` （render.htmlもビルドする）
3. 公開用ビルドを4175番などの固定HTTPサーバーで提供する。書き出し中はdistを上書きしない。
4. `TP_RENDER_ORIGIN=http://127.0.0.1:4175 node materials/two-paths/render/webgl-export.mjs 90`
5. 同じコマンドの末尾を30にして短縮版を書き出す。
6. `work/two-paths-v7/media` の原版を `public/media/two-paths/` へ複製する。
7. `node materials/two-paths/render/encode-play.mjs` で軽量版を生成する。

WebGL背景と前景合成を場面単位で保存し、同じコマンドで未完了分を再開できる。ソースとエンコード処理のハッシュが変わった場合は別の保存領域を使う。最後に映像を結合し、全編の音声を一度だけエンコードして継ぎ目の無音を防ぐ。最終的なフレーム数・動画と音声の尺・全編デコードを検査する。

## 検証

`render/check.mjs`：216場面の数式配置、正負のxの数値積分、端点・導関数の検証。
`render/webgl.check.cjs`：実WebGLコンテキスト、全6場面×2版の動作と決定的シーク。
`render/browser.check.cjs`：ライブラリから両版の実時間再生、制御、実MP4のダウンロード一致。
`render/production.check.cjs`：本番ビルドのネイティブ再生とWebGLモード。

配布MP4は横型。9:16の前景配置設計は保持するが、縦型MP4は今回の配布には含めない。WebGL再生の滑らかさは端末性能に依存する。
