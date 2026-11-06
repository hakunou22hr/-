# 黒板の向こう側 — 二次曲線の世界

生徒が着席する教室から黒板に入り、円錐の切断と距離の関係を説明する動画。大聖堂は使用しない。

- 本編：90秒、1920×1080、30fps。
- Instagram版：30秒、1080×1920、30fps。独立したカメラ・文字レイアウト。画面内の説明・BGM・効果音のみで、声のナレーションは付けない。
- 演出プレビュー：12秒。本編の教室・切断・距離説明を4秒ずつ抜粋。
- 本編は日本語ナレーション付き。両版とも数式と図中の説明を含み、下部の黒帯付きナレーション字幕は表示しない。SRT/VTTは別ファイルで提供する。独自の手続き生成BGMと効果音を含む。
- 確認ページ：`public/previews/conic-cinema/index.html`。教材ライブラリにも登録。

## 数学

円錐面は x² + z² = y²。傾く平面 y = mx + d との交わりを計算し、m が1を通るときに楕円→放物線→双曲線へ変化する。発散点をまたいで線を結ばず、有限表示範囲の外で切る。上下の双曲線の説明には x = 1.15 の切断も使用。標準形は別の正面座標図で説明する。

放物線の焦点・準線の等距離、楕円の焦点距離の和2a、双曲線の差の絶対値2aを `math.check.mjs` で独立に検証。pの符号の反転はp=0を通る計算をせず、正負の図を短くフェードする。動く表示数値は小数第2位に丸める。

## 再生成

Node.js、Python、FFmpeg、Chromium、Noto Sans CJKを使用。Node依存は `@napi-rs/canvas`, `three`, `katex`, `playwright`。Python依存は `numpy`, `pyopenjtalk`。既存プロジェクトのpackage-lockは変更しない。再生成用の依存バージョンは `render-dependencies.json` を参照。

1. リポジトリルートでHTTPサーバーを起動：`python -m http.server 4208 --bind 127.0.0.1`。
2. `PLAYWRIGHT_MODULE_PATH` をPlaywrightのモジュールパスに設定して `node preview-src/conic-cinema/formulas.cjs`。
3. `node preview-src/conic-cinema/render.mjs --samples` で静止サンプルを確認。
4. `node preview-src/conic-cinema/render.mjs` と `node preview-src/conic-cinema/render.mjs --vertical`。
5. `python preview-src/conic-cinema/audio.py`。初回はOpen JTalk辞書を取得する。ナレーションは `story.json` から生成。
6. `python preview-src/conic-cinema/finalize.py`。映像と音声を合成し、MP4を書き出す。
7. `node preview-src/conic-cinema/math.check.mjs`、`python preview-src/conic-cinema/verify.py`。
8. `npm run build` 後、`npm run preview -- --host 127.0.0.1 --port 4209` でRange対応の配信サーバーを起動する。`PLAYWRIGHT_MODULE_PATH=… node preview-src/conic-cinema/playback.cjs` で実際の通し再生・保存・スマートフォン幅・チャプターを確認。

`work/conic-cinema` に中間ファイルとログを保存。`--samples` はレンダリングを行わず各場面の静止サンプルのみ出力。既存動画には変更を加えない。

## 素材・音声

教室画像はこの制作のために生成した静止背景。黒板の光、突入時の粒子、円錐・切断平面・曲線・距離表示はフレームごとに描画する。音声はOpen JTalk / HTS Voice Meiによる合成音声（人間の収録音声ではない）。音高を-1.5半音、発話速度を1.08に設定し、必要時のみ収録枠に合わせる。BGMと効果音はNumPyで合成した独自音源。

Mei：MMDAgent Project Team / 名古屋工業大学、2009–2013、CC BY 3.0。音声のクレジットをMP4メタデータ・確認ページ・`credits.txt`に記載。元のライセンス文も同梱。90秒本編の音声を転載する際は説明欄にもクレジットを添える。30秒版にはMei音声を使わず、音声クレジットの末尾表示も入れない。

検証結果は `video-verification.json` と `playback-verification.json`。

## conic-v2

30秒版の声のナレーションを除去。BGM・効果音は声のない音源から再合成し、ナレーション用の音量抑制も外した。字幕と映像は保持し、末尾の音声クレジットを除去。90秒本編は変更しない。30秒版だけの再生成は `audio.py --short-only` → `finalize.py --short-only`。

## conic-v3

冒頭の楕円を、かすれ・筆圧差・粉の粒を持つ白いチョーク描画へ変更。黒板へ入る直前に金色へ発光する。解説空間は青・紫の色光、金色の床反射と移動する光、光柱の発光を強化。中央の図・数式には暗い背景を残して読みやすさを保つ。教室画像を両画面比率で画面全体に配置し、端の余白を解消。数学・台本・音声構成は維持し、30秒版に声は付けない。

## conic-v4

教室の机に着席して学ぶ生徒を追加。教師は出さない。冒頭のチョーク線に手の揺れによる非対称な輪郭、筆圧差、乾いたかすれ、描き終わりの重ね線を加える。全動画の末尾に音声クレジットを焼き込まない。音声の出典は確認ページ・同梱クレジット・MP4メタデータに保持。解説背景の発色・発光、台本、90秒本編のナレーション、30秒版の声なし設定は維持。

## conic-v5

下部の黒帯付きナレーション字幕を両版から除去。数式・タイトル・図中の説明は維持し、必要な字幕はSRT/VTTとして別途保存可能。生徒の髪・制服・手元の質感、姿勢、光の当たり方を実写映画に近い表現へ再制作。教室背景は引き続きAI生成画像。90秒版の声、30秒版の声なし、末尾に音声クレジットを出さない設定は維持。

## conic-v6

動画・字幕・編集用ソースを教材リポジトリで保管。再生動画の選択状態に関係なく、90秒版・30秒版それぞれの固定MP4保存リンクを常時表示。30秒版は金色の「30秒版MP4をダウンロード」ボタンから直接保存できる。映像自体はconic-v5から変更しない。
