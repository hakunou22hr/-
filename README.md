# COURTSIDE SCOREBOOK

iPad 横向きでのタッチ入力を中心に設計した、バスケットボールのスコア・個人スタッツ・スコアシート・プレイバイプレイ統合 Web アプリです。得点、シュート試投、ファウル、タイムアウト等は単一のイベントログに保存し、全表示をそのログから再計算します。音声認識は補助機能で、利用できない環境でもすべて手入力できます。

## 起動方法

Node.js 20 以降で `npm install`、`npm run dev` を実行し、表示された URL を開きます。製品ビルドは `npm run build`、プレビューは `npm run preview` です。

## GitHub Pages

`npm run build` で生成した `dist/` を Pages に配置します。Vite の `base: './'` 設定により、リポジトリ配下の URL でも利用できます。GitHub Actions では Node をセットアップし、`npm ci && npm run build` 後に `dist` を Pages artifact としてアップロードしてください。

## iPad Safari / PWA

1. iPad を横向きにし、Safari で HTTPS の公開 URL を開きます。
2. 共有ボタンから「ホーム画面に追加」を選択します。
3. ホーム画面の **SCOREBOOK** を起動します。Service Worker により基本画面をキャッシュします。

## 音声入力

画面下の「音声入力」をタップした時だけ聞き取りを開始します。初回は Safari のマイク許可で「許可」を選択してください。「白 7番 2点」「黒 8番 ファウル」「白 10番 オフェンスリバウンド」など、一度に一指示を話します。認識結果の確認後に登録されます。設定アプリでマイクを拒否した場合は、Safari の Web サイト設定からマイクを許可してください。非対応時や体育館内が騒がしい場合は、選手タイルを選んで大型ボタンから手入力します。

## 保存・バックアップ

イベントは操作ごとに IndexedDB と localStorage へ自動保存され、上部に「保存済み」と表示されます。Safari のサイトデータを消去すると端末内データも消えるため、長期保存時は開発者ツール等から `courtside-events` の JSON をバックアップしてください。JSON はイベント配列として復元できます。

## PDF / 印刷

「スコアシート」または「スタッツ」を開いて「A4 PDF出力」か「印刷」を選択します。iPad の印刷プレビューをピンチアウトして共有すると PDF として保存できます。印刷 CSS は A4 縦向けです。

> 本アプリは JBA の競技規則・TO/スタッツ記録の考え方を参考にした独自 UI であり、JBA 公式帳票そのものではありません。大会要項を確認して運用してください。

## 提供された公式スコアシートPDF

提供された `kyoto_highschool_score_sheets_2020(1).pdf` は、ファイル名を `official_scoresheet.pdf` に変更して `public/templates/` へ配置してください。リポジトリへテンプレートが提供されていない状態では、アプリは明確なエラーを表示し、別帳票を生成しません。座標は `src/scoresheet-field-map.json` に集約されています。プレビューではPDF.jsで元ページを描画し、同じFieldMapによるHTMLオーバーレイを重ねます。PDF出力ではpdf-libで元ページを保持したままデータをポイント座標へ描画します。

日本語PDF出力には、再配布と埋め込みが許可された日本語フォントを `public/fonts/NotoSansJP-Regular.ttf` として配置してください。フォントがない場合は文字化けしたPDFを作らずエラーを表示します。

URLへ `?debugScoresheet=true` を付けると、フィールド境界、フィールド名、x/y座標をオーバーレイ表示できます。調整値は `scoresheet-field-map.json` だけを変更してください。
