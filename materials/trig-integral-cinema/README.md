# 三角関数の不定積分 — 映画型90秒版

## 授業用90秒MP4・Instagram用縦型30秒MP4

[再生・ダウンロードページ](./video.html)から、授業用90秒完全版（1920×1080）とInstagram用30秒版（1080×1920・9:16）を選べます。どちらも30fps、合成音付きMP4です。元の90秒ブラウザ教材と保管用ブランチ、以前の横型30秒MP4も保持しています。

縦型版は `?edition=instagram` で開きます。数式とグラフを上下に分け、上下・右端にInstagram向けの余白を確保しています。[構成・保管・再書き出し](./docs/INSTAGRAM_AND_LESSON.md)を参照してください。

## 以前の横型30秒短縮版とMP4

元の90秒版の10シーンと2問を残した30秒版を追加しました。90秒版の再生は従来のURL、30秒版は `?edition=30` で開きます。[横型30秒MP4](https://github.com/hakunou22hr/-/releases/download/trig-integral-cinema-30s-v1/trig-integral-cinema-30s.mp4) は引き続きGitHub Releasesから取得できます。現在の `video.html` は授業用90秒版とInstagram用縦型30秒版の再生・ダウンロードページです。

- [30秒MP4の保存先](https://github.com/hakunou22hr/-/releases/tag/trig-integral-cinema-30s-v1)
- [元の90秒版の保管記録](./docs/PRESERVATION.md)
- [30秒版の編集構成と書き出し方法](./docs/SHORT_EDITION.md)

MP4は1920×1080・30fps・30秒、H.264（yuv420p）映像とAACの合成音です。ナレーションはありません。MP4の再生・保存とブラウザ教材の再生を選べます。

数式が空間になる。変形できた瞬間、積分への道が開く。
高校数学Ⅲの授業導入向けに、人物やナレーションを使わず、字幕・数式・波形・光・自作の合成音で構成する90秒のブラウザ映像教材です。動画ファイルではなく、Webアプリがシーンを自動再生します。

## 起動・ビルド

Node.js 22以上を使用してください。

```sh
npm ci
npm run dev
```

表示されたURLをブラウザで開き、「再生」を押します。

```sh
npm test
npm run build
npm run preview
```

`dist/` が公開用ファイルです。ローカルファイルをダブルクリックする方式ではなく、HTTPサーバー上で開いてください。依存ライブラリ・数式フォントはビルドに同梱され、公開後に外部CDNへ依存しません。

## 操作

- 再生、一時停止、最初から再生、再生位置変更、字幕ON/OFF、BGM ON/OFF、全画面表示。
- Spaceで再生／一時停止、Rで最初から再生。ボタンやスライダーにフォーカスしている時は、通常のキーボード操作を優先します。
- BGMは初期OFF。ON操作でWeb Audioを開始します。合成したアンビエントと分解・合体・金色の輝きの効果音を用い、録音や第三者の楽曲は使用していません。
- 別のタブに切り替えると一時停止し、授業中にシーンが飛ぶことを防ぎます。
- 終了後は2問の答えを表示したまま保持。生徒の理解に合わせて何度でも一時停止・再生できます。
- 初期画面・字幕・操作UIは日本語。装飾として小さな英語見出しを併記しています。

## GitHub Pages への公開

1. このディレクトリのファイルをGitHubリポジトリのルートに配置します。`node_modules/` は追加しません。`package-lock.json` を必ず含め、GitHub ActionsのPagesビルド・公開ワークフローを設定します。
2. GitHubの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にします。
3. `main` ブランチへpush、またはActionsのPages公開ワークフローを手動実行します。
4. 数学テスト・型検査・ビルドの成功後にPagesへ公開されます。

Viteの`base: './'`により `https://user.github.io/repository/` のサブパスでも動作します。アプリはルーティングを使わない静的構成です。既存教材ライブラリに組み込む場合は `dist/` を例として `materials/trig-integral-cinema/` に配置し、ライブラリから `index.html` にリンクしてください。ライブラリ全体にこのワークフローを上書きする必要はありません。

教材ライブラリに組み込み済みです。リポジトリのルートで `npm ci && npm run build` を実行すると、他の教材とともに `dist/materials/trig-integral-cinema/` に出力されます。`main` へのpushにより、既存の `.github/workflows/deploy.yml` がGitHub Pagesへ公開します。教材一覧には `material.json` から自動登録されます。公開前に `npm run test:trig-cinema` で型検査と数学テストを実行し、同じ検証をPagesワークフローでも行います。

このフォルダだけで起動する場合は、このフォルダで `npm ci && npm run dev` を実行してください。単独公開にする場合は、リポジトリルートのGitHub Actions公開設定を参考に `dist/` を配置してください。

## シーン構成

| 時間    | コンポーネント    | 内容                                                                             |
| ------- | ----------------- | -------------------------------------------------------------------------------- |
| 0–8秒   | SceneIntro        | 暗い数式空間、漂う数式、グリッド、緩やかなカメラ前進。大きなタイトルは表示しない |
| 8–18秒  | SceneTunnel       | 奥行きのある数式トンネルと第1問                                                  |
| 18–30秒 | SceneQuestion     | 指数2の鼓動、止まる光、半角公式の予兆                                            |
| 30–42秒 | SceneHalfAngle    | 数式断片の分裂と粒子、半角公式への再構成                                         |
| 42–54秒 | SceneGraphSync    | 同一座標で2本の波形が重なり一致                                                  |
| 54–64秒 | SceneIntegral1    | 第1問、内側の2と1/2係数、積分結果                                                |
| 64–72秒 | SceneProduct      | 第2問、sin 3x と cos x の交差波形                                                |
| 72–84秒 | SceneProductToSum | 一般の積和公式、和を金・差を青で表示、再構成                                     |
| 84–88秒 | SceneIntegral2    | 第2問の計算・係数・+C                                                            |
| 88–90秒 | SceneEnding       | 2問の答え、金色の光柱、タイトル。90秒後も保持                                    |

主要な演出の設計意図は `docs/SCENES.md` に記載しています。

## 数式一覧

```math
\sin^2x=\frac{1-\cos2x}{2}
```

```math
\int\sin^2x\,dx=\frac12\int(1-\cos2x)\,dx=\frac12x-\frac14\sin2x+C
```

```math
\sin\alpha\cos\beta=\frac12\{\sin(\alpha+\beta)+\sin(\alpha-\beta)\}
```

```math
\sin3x\cos x=\frac12(\sin4x+\sin2x)
```

```math
\int\sin3x\cos x\,dx=\frac12\int(\sin4x+\sin2x)\,dx=-\frac18\cos4x-\frac14\cos2x+C
```

三角関数の角度はラジアンです。グラフの横軸は0〜4π。不定積分の定数は各問に独立して存在し、いずれも慣例に従いCと表記します。

## ディレクトリ・編集方法

- `src/components/scenes/`：10シーンの独立コンポーネント。`local`はそのシーンの経過秒です。
- `src/data/formulas.ts`：KaTeX用LaTeX。`String.raw`を用いてバックスラッシュを維持します。
- `src/data/captions.ts`：必須の日本語テロップ。
- `src/data/timeline.ts`：開始・終了秒とシーン名。最終終了時刻とDURATIONを揃えてください。
- `src/data/theme.ts`：背景・白・金・シアン・グラフの色。`style.css`には低不透明度の装飾色も定義しています。
- `src/components/Space.tsx`：3Dシーンの統合。数式の壁・鏡面床・発光波形・粒子変形・金色の解放光をシーンに応じて表示します。DPRは最大1.25です。
- `src/components/cinema/FormulaFlow.tsx`：実際の文字の輪郭から4200点の粒子を生成。分解→螺旋の光流→変形後の文字への集合を再生時刻で制御します。
- `src/components/Graph.tsx`：SVGグラフ。数式から401点を直接計算します。
- `src/hooks/usePlayback.ts`：requestAnimationFrameと単調時計に基づく再生、シーク、一時停止。
- `src/utils/audio.ts`：Web Audioによるオリジナル合成音。
- `src/style.css`：大画面を主対象とするレスポンシブ表示。小画面ではエンディングを縦配置。

## 検証と注意

`npm test`は全LaTeXのKaTeX描画、90秒タイムラインの連続性、401点での2つの恒等式・原始関数の数値微分、必須係数と+Cを検証します。`npm run build`はTypeScript型検査と本番ビルドを実行します。

WebGLが使えない場合は星空のCSS背景へ切り替え、数式・字幕・グラフの教材内容を継続します。減らした動きを希望する設定では鼓動と装飾の浮遊を抑えます。上映用の変形演出は保持します。

参考画像4枚に合わせた演出強化版です。壁の数式・反射床・3D発光波形・粒子による式の再構成・金色の光柱を、静止画像ではなくブラウザ内の3D描画で実装しています。大型モニタでの実機上映と音量調整は、教室のブラウザ・GPU・音響機器で確認してください。

## 演出強化版（1.1）

- `src/data/cinema.ts`：光の強さ、粒子数、波形の密度、変形のタイミングをまとめた設定。
- `cinema/FormulaTunnel.tsx`：左右の数式壁、金色のゲート、Three.js Reflectorによる鏡面床、奥への移動。
- `cinema/FormulaFlow.tsx`：実際の式の文字輪郭から別の式の文字輪郭への粒子変形。30〜42秒と72〜84秒。
- `cinema/WaveSculpture.tsx`：赤・シアンの3D波形を重ね、共通の波形へ一致。奥行きzは表示上の複製で、関数の変数ではありません。下部のSVGは共通のx・y座標を表示します。
- `cinema/GoldenRelease.tsx`：金色の光柱、粒子、立方体、床の同心光輪。解答は暗いパネルに表示して可読性を確保します。
- `cinema/Bloom.tsx`：UnrealBloomPassによる光のにじみ。数式はこの処理の外でKaTeX表示するため、文字はぼけません。

再生・一時停止・シークは共通の秒数に同期し、式の変形と3Dの動きがずれない設計です。新しい外部画像・音源・CDNは追加していません。
