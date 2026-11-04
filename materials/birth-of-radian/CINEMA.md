# ラジアンの誕生：映画教材版

教材ライブラリの入口は `index.html`。承認済み24秒映画 `reference-film.js` の3D空間、立体的な黄金の帯、ホログラム床、πメダリオンを `cinema.js` に引き継ぎ、数学の5場面を90秒で展開する。静止背景のパン・ズームや24秒動画のループではない。

- `public/media/birth-of-radian-cinema-90s.mp4`：1920×1080、24fps、90秒、H.264。
- `public/media/birth-of-radian-cinema-30s.mp4`：1080×1920、24fps、30秒、H.264。
- MP4は音声なし。WebGLが使えないブラウザでも動画版と本文の数学説明を利用できる。
- `cinema.html`：90秒のリアルタイム3D。`?portrait` は30秒版。描画速度は端末による。
- `reference.html` と承認済み24秒MP4、`legacy.html` と以前の教材ソース・MP4も残している。

## 数学とタイムライン

90秒版は0–12秒が半径、12–30秒が1 rad、30–52秒が半円への巻き付け、52–72秒がπの導出、72–90秒が180°と360°の結論。30秒版は同じ場面を0–3、3–11、11–20、20–25、25–30秒に再編集する。

巻き付けは弧長をパラメータとして、円周上の接触部分と、その接線上の未接触部分を連結して計算する。中立軸の全長を保ち、接触部分の長さと中心角は s = rθ を満たす。半円の単位帯は1、1、1、π−3。最後の約0.14159本という表示と、正確なπ本分を区別する。

## 再現

リポジトリのルートで依存をインストールし、Viteをポート5173で起動する。

```sh
npm run dev -- --host 0.0.0.0
node materials/birth-of-radian/render/cinema.check.cjs
node materials/birth-of-radian/render/cinema-preview.cjs
node materials/birth-of-radian/render/cinema-export.cjs 30
node materials/birth-of-radian/render/cinema-export.cjs 90
node materials/birth-of-radian/render/cinema-media.check.cjs
node materials/birth-of-radian/render/cinema-library.check.cjs
npm run build
```

書き出しにはFFmpegとChromiumが必要。`PLAYWRIGHT_MODULE`、`CHROMIUM_PATH` で実行環境のパスを指定できる。全フレームをWebGLで再描画し、書き出し成功後にだけMP4を公開用のパスへ移す。

`verification/cinema/` は完成した90秒MP4から取り出した6、20、42、62、82秒の画面と、タイムライン・数学・動画UI検査結果。実機iPhoneでの確認は別途必要。


## 半円の説明の改訂

半径1本を単位として1本・2本・3本と巻き、42.4–47秒は3本分で止める。円弧の残りを赤い点線で示し、47–50.2秒に正確なπ−3本分の赤い帯を足す。同じ色のものさしは円弧と同じ割合で増え、3.14159…本分になった後で、この数をπと呼ぶ。`3+(π−3)` を先に提示する説明は使わない。背景、照明、カメラの演出は維持。

`half-lesson.js` が巻き付け・数値・ものさしの共通状態を計算する。`half-preview.check.cjs` が3本で残る隙間と正確な終点、横・縦の数式と配置を検査する。`half-patch-export.cjs 30` / `90` は該当範囲だけを再描画し、既存映画の前後とフレーム単位で接続する。範囲外の複数時刻の画面を比較して、演出と時刻の対応を確認する。
