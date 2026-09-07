# 三角比 Visual Lab

高校数学Ⅰ「三角比」のための、直角三角形を見て・押して・動かせる1ページ教材です。角度に連動する立体風SVGと光のアニメーションで、`sin`・`cos`・`tan` がどの辺の比かを可視化します。

## ファイル構成

- `src/App.tsx` — 画面全体と状態管理
- `src/components/TriangleScene.tsx` — 立体風の直角三角形と光の経路
- `src/components/Controls.tsx` — 角度スライダーと三角比ボタン
- `src/components/RatioDisplay.tsx` — 三角比のリアルタイム数値
- `src/components/InfoPanel.tsx` — 式、短い説明、辺の関係
- `src/math.ts` — 三角比の計算

## 起動

Node.js 20 以上を用意して、次を実行します。

```bash
npm install
npm run dev
```

## テストとビルド

```bash
npm test
npm run build
```

## GitHub Pages で公開

`vite.config.ts` は相対パスの `base: './'` に設定済みです。`npm run build` で生成される `dist/` を GitHub Pages にデプロイできます。

1. GitHub の **Settings → Pages** で公開元を GitHub Actions にする。
2. Actions で `npm ci` と `npm run build` を実行する。
3. `dist/` を `actions/upload-pages-artifact` でアップロードする。
4. `actions/deploy-pages` で公開する。

手元から公開する場合は `npx gh-pages -d dist` も利用できます。
