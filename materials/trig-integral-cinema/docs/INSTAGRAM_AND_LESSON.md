# 授業用90秒完全版・Instagram用縦型30秒版

元の数学Ⅲ「三角関数の不定積分」90秒版を保持し、用途別にMP4を保存します。

| 用途 | 画面 | 尺 | フレーム |
| --- | --- | --- | --- |
| 授業用90秒完全版 | 1920×1080・16:9 | 90秒 | 30fps・2700フレーム |
| Instagram用30秒版 | 1080×1920・9:16 | 30秒 | 30fps・900フレーム |

どちらもH.264・yuv420p、AAC・48kHzステレオのMP4です。元の合成BGMと効果音を使用します。人物映像・ナレーション・外部楽曲は追加していません。

- [再生・MP4ダウンロードページ](https://hakunou22hr.github.io/-/materials/trig-integral-cinema/video.html)
- [Instagram用30秒MP4](https://github.com/hakunou22hr/-/releases/download/trig-integral-cinema-instagram-30s-v2/trig-integral-cinema-instagram-30s.mp4)
- [授業用90秒MP4](https://github.com/hakunou22hr/-/releases/download/trig-integral-cinema-90s-v2/trig-integral-cinema-90s.mp4)

## 元の教材の保持

元の90秒タイムライン・10シーン・数式を共有しています。90秒ブラウザ教材は従来のURLで再生でき、制作当時のソースは `archive/trig-integral-cinema-90s-21197d3` ブランチと完全なコミット `21197d3594a19ee8e84d2ff14b35efe6aa8db4f4` で保管しています。以前制作した横型30秒MP4も残しています。

## Instagram向けの再配置

縦型版は `?edition=instagram` で開きます。横型の中央を切り抜く方法ではなく、専用の `instagram.css` と3Dシーンの変換で縦型に再構成しています。

- 重要な数式・字幕：横6〜82％、縦14〜75％の範囲に配置。1080×1920では、左約65px、右約194px、上約269px、下480pxの余白です。
- 積和公式と係数の計算は改行して表示し、内容・符号・係数・+Cを維持。
- 3D波形、SVGグラフ、数式を上下の別領域に配置。グラフの凡例も縦配置。
- 3D空間、数式の発光、指数2の鼓動、波形の一致、粒子による再構成、金色の解放光を保持。
- Instagramの画面表示は端末や投稿の状態で変わるため、余白は配置上の基準です。

## 再書き出し

依存関係・Chromium・Playwright・FFmpeg・日本語フォントの導入方法は `SHORT_EDITION.md` を参照してください。同じ描画スクリプトを用途別のプロファイルで実行します。

```sh
CINEMA_EDITION=instagram CINEMA_OUTPUT=work/trig-cinema-instagram \
PLAYWRIGHT_MODULE_PATH=/tmp/cinema-render-tools/node_modules/playwright \
node materials/trig-integral-cinema/render/render-short.mjs

CINEMA_EDITION=lesson CINEMA_OUTPUT=work/trig-cinema-lesson \
PLAYWRIGHT_MODULE_PATH=/tmp/cinema-render-tools/node_modules/playwright \
node materials/trig-integral-cinema/render/render-short.mjs
```

授業用90秒版は `.github/workflows/trig-cinema-lesson.yml`、縦型版は `.github/workflows/trig-cinema-instagram.yml` で描画・検証してGitHub Releasesへ保存します。90秒版は最初に下書きの保存先を確保し、3秒の事前再生を付けた4区間を並列描画します。完成フレームは重複・欠落なしで2700枚を連結し、映像を再圧縮せずに90秒の合成音を通して付けます。区間ごとの動画と完成MP4をActions Artifactsへ先に保管し、その後にReleasesへ公開します。大きな動画を通常のGit履歴に含めません。以前の横型30秒用ワークフローは手動実行として保持しています。
