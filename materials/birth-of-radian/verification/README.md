# 検証記録：ラジアンの誕生

Chromium + SwiftShader で実際にWebGLを描画した画面です。背景画像を動画に使用しているものではありません。

| 時刻 | 確認対象 | 実画面 |
|---|---|---|
| 6秒 | 半径・立体背景 | ![6秒](../previews/6.jpg) |
| 20秒 | 長さを保つ連続した巻き付け | ![20秒](../previews/20.jpg) |
| 42秒 | 青・緑・黄金の帯 | ![42秒](../previews/42.jpg) |
| 62秒 | 立体πと分数式・粒子 | ![62秒](../previews/62.jpg) |
| 82秒 | 180° = π rad | ![82秒](../previews/82.jpg) |

`browser.json` は0〜90秒を1秒刻みの91点で描画した結果です。全5シーン、カメラ位置・背景円環の変化、再生・一時停止・最初から、390px幅での式の収まり、WebGL非対応表示を確認。JavaScript例外は0件でした。

`mathematics.json` は24条件で帯の長さを各2万分割して測った結果。最大誤差は約2.45×10⁻¹⁰です。

## 全体テストの結果

`npm run build` は成功。`npm test` は308件中305件成功、3件失敗。失敗対象のファイルはいずれも本PRで変更していません。単独での再実行でも同じ3件が失敗しました。

- `src/materials.test.ts`: 既存 `triangle-789-cinematic` のサムネイル未登録。
- `materials/region-circle-radius/src/math.test.ts`: 既存の領域判定の期待値不一致。
- `materials/math3-lineage/render.test.js`: 既存の全30シーン検査が5秒制限を超過。

iPhoneは390px幅のChromiumでレイアウトを確認したもので、実機Safari試験ではありません。実機の60fps維持は未検証です。
