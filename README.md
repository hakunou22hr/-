# 数学教材ライブラリ

複数のインタラクティブ数学教材を、互いに上書きせず保存・公開するための GitHub Pages ポータルです。トップページから各教材を独立して起動できます。

## 収録教材

| 教材 | 保存場所 | 公開パス |
| --- | --- | --- |
| 三角比を図で学べるインタラクティブ教材（PR #1） | `materials/trig-unit-circle/` | `materials/trig-unit-circle/` |
| 立体風SVGで学ぶ三角比のインタラクティブ教材（PR #3） | `materials/trig-visual-lab/` | `materials/trig-visual-lab/` |
| cos アニメーションと筆記体マークで学ぶ三角比（PR #4） | `materials/trig-cos-animation/` | `materials/trig-cos-animation/` |
| 数学A 4領域の塗り分けインタラクティブ教材（PR #6） | `materials/coloring-4areas/` | `materials/coloring-4areas/` |
| 数学Ⅰ｜三角比の不等式（半円で可視化） | `materials/trig-inequality-semicircle/` | `materials/trig-inequality-semicircle/` |
| 数学Ⅰ｜三角比で電柱の高さを求める | `materials/pole-height-trigonometry/` | `materials/pole-height-trigonometry/` |
| 数学Ⅰ 集合ビジュアライザー | `materials/set-visualizer/` | `materials/set-visualizer/` |

公開パスは GitHub Pages のリポジトリ URL を基準にした相対 URL です。

## 教材の追加

既存教材を変更せず、次の2点を新しい `materials/<教材ID>/` に追加します。

1. 教材のエントリーポイント `index.html` と、その教材専用のソース・アセット
2. 一覧カード用の `material.json`（`id`、`name`、`subject`、`unit`、`description`）

トップページは `materials/*/material.json` を自動検出し、Vite は各ディレクトリの `index.html` を独立したページとしてビルドします。したがって、一覧コードやビルド設定へ教材ごとの追記は不要です。

## 開発

```bash
npm install
npm run dev
```

## テストとビルド

```bash
npm test
npm run build
```

`vite.config.ts` の相対ベース設定を利用しているため、生成された `dist/` はリポジトリ名を含む GitHub Pages URL でも動作します。既存の `.github/workflows/deploy.yml` が `main` 更新時に `dist/` を GitHub Pages へ公開します。
