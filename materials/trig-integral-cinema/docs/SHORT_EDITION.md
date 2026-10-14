# 映画型30秒短縮版

元の90秒版（コミット `21197d3594a19ee8e84d2ff14b35efe6aa8db4f4`）のシーンと数式を再利用した編集版です。元の版は保管用ブランチに保持しています。

| 30秒版の時間 | 元の90秒版 | 内容 |
| --- | --- | --- |
| 0–1.5秒 | 0–8秒 | 数式空間 |
| 1.5–3.5秒 | 8–18秒 | 数式トンネル・第1問 |
| 3.5–5秒 | 18–30秒 | 変形への予兆 |
| 5–10秒 | 30–42秒 | 粒子分解から半角公式へ |
| 10–12秒 | 42–54秒 | 波形の一致 |
| 12–16秒 | 54–64秒 | 第1問の積分 |
| 16–18秒 | 64–72秒 | 第2問・交差波形 |
| 18–23秒 | 72–84秒 | 粒子変形・積和公式 |
| 23–27秒 | 84–88秒 | 第2問の積分 |
| 27–30秒 | 88–90秒 | 金色の解放光・2問の解答 |

`shortTimeline.ts` で30秒の再生時刻を元のシーン時刻へ写像します。Sceneコンポーネント・数式・3D演出は共有し、元の90秒タイムラインは維持しています。音声は元の `CinemaAudio` の周波数、合成音色、エンベロープを使い、分解・再集合・解放の効果音を短縮版の時刻に配置しました。開始と終了には短い音量フェードを付けています。

## 再書き出し

Node.js 22以上、FFmpeg、Chromium、Playwright、日本語フォントが必要です。

リポジトリルートで依存関係の導入、数学検算、ビルドを実行します。

```sh
npm ci
npm run test:trig-cinema
npm run build --prefix materials/trig-integral-cinema
npm install --prefix /tmp/cinema-render-tools playwright@1.62.1
node /tmp/cinema-render-tools/node_modules/playwright/cli.js install --with-deps chromium
npm run preview --prefix materials/trig-integral-cinema -- --host 127.0.0.1 --port 4173
```

別のターミナルで書き出します。

```sh
PLAYWRIGHT_MODULE_PATH=/tmp/cinema-render-tools/node_modules/playwright \
CINEMA_OUTPUT=work/trig-cinema-30s \
node materials/trig-integral-cinema/render/render-short.mjs
```

システムのChromiumがある場合はそれを使用し、`CHROMIUM_PATH` で実行ファイルを指定できます。フルHDの3Dシーンを900フレーム描画するため、書き出しには動画の尺以上の時間がかかります。

書き出しスクリプトは元のWebGL層を保持してフレームを描画し、OfflineAudioContextで合成音を生成します。FFmpegでH.264・AACのMP4を作成し、フレーム数・寸法・fps・尺・コーデックを確認した後、全フレームを再デコードします。確認用の画像と `ffprobe.json` も保存します。

`.github/workflows/trig-cinema-video.yml` は同じ処理をGitHub Actionsで実行し、成功したMP4をGitHub Releasesに保存します。`video.html` はそのMP4を再生・ダウンロードします。生成したMP4をGitの通常の履歴には追加しません。

## 検証の区別

数学テストは元の90秒版と短縮版の連続性、全LaTeX、恒等式と原始関数を確認します。書き出し時のメディア検査は `ffprobe.json` を参照してください。H.264/AACの互換形式での書き出しと、Windows・iPhoneの実機検証は別の確認です。
