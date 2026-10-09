# MP4を再生成する

必要：Node.js 20以降、Chromium、FFmpeg。Linuxでは、日本語フォント（Noto Sans CJKなど）も導入してください。有料API・クラウドレンダリングは不要です。

1. リポジトリrootで `npm ci`。
2. `npm --prefix materials/birth-of-e/render install`。
3. rootで `npm run dev -- --host 127.0.0.1` を起動。
4. 別ターミナルのrootで `node materials/birth-of-e/render/export.mjs`。

Chromiumのパスは環境変数 `CHROMIUM_PATH`、教材URLは `BIRTH_E_URL` で変更できます。URLには `?render` を付けず、教材の末尾 `/` を含めます。WindowsではChrome/Chromiumの実行ファイルをCHROMIUM_PATHで指定してください。Linux向けの既定は `/usr/bin/chromium` です。

レンダラーは同じアプリの `window.__renderAt(t)` に0, 1/30, …, 2699/30秒を渡します。WebのSceneをそのまま撮影し、MP4にエンコードします。HTMLの数式・字幕は1920×1080で撮影し、3D内部の描画解像度は負荷軽減のため0.75倍。合成出力は1920×1080・30fpsです。

入力音声：`public/media/birth-of-e-narration.m4a`。出力：`public/media/birth-of-e-90s.mp4`。2700フレーム、H.264、yuv420p、AAC、90秒、faststart。音声は無圧縮の台本区間を固定長に揃えてからAACにしています。再生成にかかる時間はGPUやCPUに依存します。

## 台本を変更して日本語音声を作り直す

台本の原本は `src/model.ts` の `cues` です。音声の再生成とMP4の再生成は、Webのビルド・公開とは独立しています。

Linux向けOpen JTalk、MeCab NAIST辞書、HTS Engine、NITech HTS Voiceを `work/birth-of-e/tts/root` へ用意します（通常インストールを使う場合はsynthesize.pyのパスを変更）。使用したパッケージは次のとおりです。

- Debian: open-jtalk 1.11-3、open-jtalk-mecab-naist-jdic 1.11-3、libhtsengine1 1.10-6
- Ubuntu: hts-voice-nitech-jp-atr503-m001 1.05-8

Debian/Ubuntuの配布元から `.deb` をダウンロードし `dpkg-deb -x` でwork内へ展開できます。端末のシステムディレクトリへの書き込みは不要です。

rootで実行：

```
mkdir -p work/birth-of-e/model public/media
npx tsc materials/birth-of-e/src/model.ts --target es2020 --module esnext --moduleResolution bundler --skipLibCheck --outDir work/birth-of-e/model
node --input-type=module -e "import {cues} from './work/birth-of-e/model/model.js'; import fs from 'node:fs'; fs.writeFileSync('work/birth-of-e/cues.json',JSON.stringify(cues))"
python materials/birth-of-e/render/synthesize.py
ffmpeg -y -i work/birth-of-e/tts/narration.wav -c:a aac -b:a 128k public/media/birth-of-e-narration.m4a
```

同梱の台本は各区間に0.55秒以上の余白を確保し、超過する区間だけtempoを調整します。現在の最大調整は約1.04倍です。ライセンスとクレジットは `../THIRD-PARTY.md` を参照してください。
