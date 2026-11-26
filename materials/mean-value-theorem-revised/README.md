# 傾きが出会う瞬間 ― 平均値の定理【改訂版】 v8

## 修正内容

- 金色のフレア付きAIガイドが、右下から右上へ浮遊し、また戻る。移動時は少し縮み、文字の外側の右端レーンを通り、到着後に広がる。滞在中は微小な上下動・呼吸を続ける。
- 説明中の文字や式に下線・外側の角印を付け、ガイドから余白を通る光の粒を送る。文字の上を塗りつぶさない。
- 右上に滞在する場面では見出しを折り返す。時計・見出し・数式・字幕と重ならない経路を、全時刻の座標テストと代表フレームで確認。
- この動画に日本語の合成ナレーションを追加。声は `ja-JP-KeitaNeural`。数式は自然な日本語で読み、13区間を数学タイムラインに合わせる。MP4にAAC音声を収録し、ダウンロード後も再生できる。
- ナレーションの実音声から20Hzのエネルギー包絡を生成し、粒子の明滅に反映。ブラウザのマイク・音声認識・会話AIは使わない。
- 操作教材は無音。上部のMP4と本教材のプレビューだけが音声付き。他の教材や過去版の動画は変更しない。

## 閲覧

- 教材: https://hakunou22hr.github.io/-/materials/mean-value-theorem-revised/?v=8
- 本編: https://hakunou22hr.github.io/-/media/mean-value-theorem-revised/mean-value-theorem-revised-90s-v8.mp4
- 浮遊ガイド・音声10秒: https://hakunou22hr.github.io/-/media/mean-value-theorem-revised/preview-guide-10s-v8.mp4

原稿はページのプレビュー欄から保存できる。v1〜v7の動画は保持する。

## 再制作

`guide.mjs` が浮遊・安全な経路・反応対象の文・実音声エネルギーを決める。`scene.mjs` が同じ関数で教材とMP4を描く。`narration/script.json` が読み上げ原稿、`narration/timing-v8.json` が区間ごとの実際の発話時間と速度。最大速度調整は1.2倍で、語の途中を切らない。`narration/envelope.mjs` は波形由来のデータ。

```sh
python -m pip install -r materials/mean-value-theorem-revised/render/requirements-narration.txt
OUTPUT=/workspace/work/mvt-v8/narration python materials/mean-value-theorem-revised/render/narration.py
ffmpeg -y -i /workspace/work/mvt-v8/narration/narration-90s.wav -af loudnorm=I=-16:TP=-1.5:LRA=9 -ar 48000 -ac 1 -t 90 -c:a aac -b:a 160k public/media/mean-value-theorem-revised/narration-90s-v8.m4a
OVERLAY_ONLY=1 RANGES='[[12,84,"narrator-layer-72s"]]' OUTPUT=/workspace/work/mvt-v8/delivery node materials/mean-value-theorem-revised/render/movie.mjs
OUTPUT=/workspace/work/mvt-v8/delivery node materials/mean-value-theorem-revised/render/upgrade-v8.mjs
```

組立にはv4の承認済み背景・教室・数学映像と、ナレーターなしの72〜84秒まとめパスを使用する。まとめパスは `BASE_PASS=1 RANGES='[[72,84,"part-summary-12s"]]'` を指定した同じ描画から生成できる。収録済みM4Aは保存してあるので、映像再合成に音声サービスへの接続は不要。新しい音声を合成する場合はネットワークが必要で、設定済みのCA・プロキシとTLS検証を維持する。

## 検証

数学モデル、13音声区間の整合性、浮遊経路と反応文の非重複、実音声への反応、動きを抑える設定を検証。MP4は1920×1080、24fps、90秒、H.264/yuv420p＋AAC 48kHz。`verification-v8.json` には音声の存在・音量・非クリップ・動画全編デコードと旧版SHA256照合を記録する。

公開後はGitHub Actionsで実ページの再生・音声付きMP4のメタデータ・上／下の粒子画素位置・文字余白・操作・4画面サイズ・タッチ模擬を確認する。実機iPhone/iPad/Safariでの確認は未実施。教室は生成画像を使った2.5Dで、人物は個別に動かない。
