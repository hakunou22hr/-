# 動く直線、答えの境界 — 線形計画法へのひらめき

数学Ⅱ「領域と最大・最小」。映画型90秒と、同じ3D図形・数式を使う操作実験を教材ライブラリへ新規登録。

## 数学と映像

条件：x≧0、y≧0、2x+3y≦12、2x+y≦8。共通部分は(0,0),(4,0),(3,2),(0,4)を頂点とする四角形の周と内部。x+y=k、つまりy=−x+kを平行移動する。共有点をもつ範囲は0≦k≦5。最大は(3,2)で5、最小は原点で0。最大の接点(3,2)と切片(0,5)を別々に発光表示する。

- 0–12秒：数式回廊と問題。
- 12–30秒：四色の半平面が奥行きを持って現れ、同じ平面へ重なる。奥行きは表現上のものと明示。
- 30–40秒：共通部分と四頂点。
- 40–53秒：x+y=kのひらめき、y=−x+kへの変形。
- 53–72秒：開放的な座標ステージへ転換、切片と直線が連動。
- 72–78秒：最大5。接点と切片を結ぶ。
- 78–83秒：最小0。
- 83–90秒：結果と線形計画法への接続。

## 参照・再利用

制作前に既存の`trig-integral-cinema/src/components/cinema/FormulaTunnel.tsx`、GoldenRelease、Reflector、Bloomを調査。`two-paths/webgl.js`の実装とMP4書き出し・再生制御も確認した。数式の壁、HDRの金色・青色、鏡面反射、加算合成の粒子、時間ベースの光の曲線を再利用し、領域と直線は新規実装。既存教材のファイルは変更しない。

## 構造

- model.js：不等式による半平面クリッピング、共通部分、目的直線の交差、時間軸。
- world.js：Three.jsの実3D、色付き半平面、発光する直線・頂点・切片、移動する背景、ReflectorとBloom。ラベルの座標は同じ透視カメラから投影。
- film.js：背景から分離したフルHD数式・字幕・図形ラベル。KaTeXでローカルPNGを生成。
- player.js：標準H.264再生と、WebGL操作実験の切替。kのスライダー、吸着、条件切替、視点、連続移動。
- render/export.mjs：30fpsの実WebGL背景を1280×720で描画し、1920×1080のTeXと字幕へ合成。音楽・効果音は48kHzのプログラム生成をAACで収録。画像の単なる拡大や動画のループは使わない。

## 再生成

ルートの依存関係をインストール後、`npm install --prefix materials/moving-line-cinema/render`。

1. `npm run dev -- --host 127.0.0.1 --port 4173`
2. `node materials/moving-line-cinema/render/generate-math.mjs`
3. `python materials/moving-line-cinema/render/audio.py`（numpyが必要）
4. `npm run build`、`npm run preview -- --host 127.0.0.1 --port 4175`
5. `node materials/moving-line-cinema/render/export.mjs`（Chromium、FFmpeg、Noto CJKフォントが必要）
6. 原版をpublic/media/moving-lineへ配置し、encode-play.mjsで720pの軽量な視聴版を生成。再ビルドして公開。

書き出しはソースのハッシュごと・場面ごとにチェックポイント保存。並列処理は`export.mjs 0,1,2,3`と`export.mjs 4,5,6,7`。全パートがそろうと90秒のMP4を生成する。任意の再生位置は絶対時刻から再描画できる。

## 実験の範囲と制限

元の四条件での最大・最小は厳密に計算。条件を外した実験は、表示範囲−1≦x≦8、−1≦y≦7で切り取って表示し、元の答えと区別する。WebGL非対応端末では標準動画を利用。実験の滑らかさは端末性能に依存。Instagram用9:16・30秒版を追加。実機iPhoneは未検証。教師・ナレーションなし。音楽と効果音に外部素材・有料APIは使用しない。


## Instagram用30秒版

`reels.html`から視聴・MP4保存。専用タイムラインは0–3秒の問い、3–9秒の四条件、9–14秒の置換、14–21秒の直線移動、21–24.5秒の最大、24.5–27秒の最小、27–30秒の結び。単純な3倍速や横型の切り抜きにはしない。

- `reels-model.js`：90秒版の場面素材を選択する専用の編集時間軸。
- `world.js`：`{portrait:true}`で座標・カメラ・背景を縦型へ配置。通常の90秒版と実験の描画は同一。
- `reels-film.js`：1080×1920のTeXと字幕。主要文字をおおむねx=90〜980、y=200〜1565へ配置。Instagram側のUI位置は端末・表示モードで変わる。
- `render/reels-audio.py`：30秒のオリジナル音楽・効果音を再構成。
- `render/reels-export.mjs`：720×1280の実WebGL背景を30fpsで描画し、1080×1920の数式と合成。H.264/AACの30秒MP4。

音楽生成後に`npm run build`とポート4175のpreviewを起動し、`node materials/moving-line-cinema/render/reels-export.mjs`。途中データは`work/moving-line-reels/`。並列処理は場面指定`0,1,2`と`3,4,5,6`。`render/reels-encode-play.mjs`で視聴用720×1280版を生成。MP4を端末に保存してから、Instagramのリール投稿画面で選択する。Instagramへの自動投稿は行わない。


## 不等号の表記

条件式と最終結果は、日本の教科書で使う二重線の「≧・≦」に統一。数式素材ではTeXの`\geqq`・`\leqq`を使用し、前面・背景・操作実験・90秒と30秒の完成MP4へ反映。`render/inequality.check.mjs`で表記を検証する。
