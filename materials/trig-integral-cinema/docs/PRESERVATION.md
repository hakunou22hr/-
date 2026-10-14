# 三角関数の不定積分 — 元の90秒版の保管記録

保管確認日：2026-10-15（日本時間）。

## 保管対象

元の教材は、React・Three.js・KaTeX・Web Audioによる90秒のブラウザ再生教材です。MP4ではありません。10シーン、数式の粒子変形、発光波形、数式トンネル、鏡面床、金色の光柱、オリジナル合成音のソースを保管しています。

- 教材ディレクトリ：`materials/trig-integral-cinema/`
- 元の版のコミット：`21197d3594a19ee8e84d2ff14b35efe6aa8db4f4`
- 保管用ブランチ：`archive/trig-integral-cinema-90s-21197d3`
- [元の版のソース](https://github.com/hakunou22hr/-/tree/21197d3594a19ee8e84d2ff14b35efe6aa8db4f4/materials/trig-integral-cinema)
- [保管用ブランチ](https://github.com/hakunou22hr/-/tree/archive/trig-integral-cinema-90s-21197d3/materials/trig-integral-cinema)
- [既存のブラウザ教材](https://hakunou22hr.github.io/-/materials/trig-integral-cinema/?v=21197d3)

ブラウザURLの `v=21197d3` は対象コミットの短縮表記と一致します。ただし、URLのクエリ文字列は過去版の固定配信を保証しません。厳密な復元には上記の完全なコミットSHAを使用してください。

## 元のソースからの再開

```sh
git clone https://github.com/hakunou22hr/-.git math-material-library
cd math-material-library
git switch --detach 21197d3594a19ee8e84d2ff14b35efe6aa8db4f4
cd materials/trig-integral-cinema
npm ci
npm test
npm run dev
```

Node.js 22以上を使用します。表示されたHTTPのURLを開いて再生してください。音声は初期OFFで、BGMのON操作で開始します。詳細は同じ版のREADMEとdocs/VALIDATION.mdを参照してください。

## 確認済みの範囲と未完了の作業

- 保管用ブランチが対象コミットを指すことをGitHub APIで確認しました。
- ソースのタイムラインは0〜90秒、10シーンです。
- 半角公式・積和公式および2問の原始関数を0〜4πの401点で数値検算しました。恒等式の最大誤差は約3.5×10⁻¹⁵、中心差分による微分の最大誤差は約1.9×10⁻¹⁰でした。
- 今回の調査時点では対象のMP4はリポジトリ内に見つからず、Releasesも空でした。
- 過去のCodex環境や未コミット変更の調査は未完了です。
- 1920×1080・30fpsのMP4書き出し、元の90秒版を基にした30秒短縮版、ReleasesへのMP4保存、動画再生・ダウンロードボタンの追加は未完了です。
- 今回の調査ではブラウザ再生、実際の音声、書き出した動画の尺、Windows・iPhoneの実機確認は実施していません。既存の検証記録と今回の検証を区別してください。

元の映像を新作に置き換えていません。書き出しや短縮版は、この保管済みの版を基に進めるものとします。
