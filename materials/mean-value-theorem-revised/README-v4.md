# 傾きが出会う瞬間 ― 平均値の定理【改訂版】 v4

## 今回の修正

- 背後の大きな傾斜軌道3層と、その上を周回する光点を削除。平均と瞬間を対比するv3の説明、測定に応じた波紋、光の帯・床の流れは維持。
- 自然光の教室に女子生徒2人を追加。最新指定に従い、左手前の女子生徒1人だけ金髪、他の生徒は黒髪。`assets/v4/classroom.png` は既存生成素材の画像編集によるもので、実在生徒の撮影映像ではない。
- 黒板内のグラフ中心をy=2.25から1.95へ下げ、幅を4.2から3.8へ調整。カメラと黒板通過の開口位置も連動。上枠からの余白を公開ブラウザテストで確認。
- 動画は新規 `-v4` 名で追加し、v1〜v3の動画・プレビュー・代表フレームは保持。

## 閲覧

- 教材: https://hakunou22hr.github.io/-/materials/mean-value-theorem-revised/?v=4
- 本編: https://hakunou22hr.github.io/-/media/mean-value-theorem-revised/mean-value-theorem-revised-90s-v4.mp4
- 教室12秒: https://hakunou22hr.github.io/-/media/mean-value-theorem-revised/preview-classroom-12s-v4.mp4
- 測定15秒と説明15秒も `-v4.mp4`。一致8秒は変化のないv2を継続使用。

## 数学と描画

割線 y=2x、接線 y=2x−1 は別々の平行線。区間全体の平均変化率4/2=2と、途中の瞬間の変化率f′(c)=2cを対比する。c=1と接点P=(1,1)を同時に強調。連続・微分可能の条件、少なくとも1つのcの存在、|x|での反例、具体例と一般の証明の区別を維持。

教室は奥行きメッシュへ画像投影する2.5D方式。人物個別の動作アニメーションはない。動画と操作教材は同じ数値モデルと描画コードを使用し、絶対時刻による再現性を持つ。音声なし、字幕付き、1920×1080、24fps、H.264/yuv420p、90秒。

## 再制作と検証

```sh
RANGES='[[0,12,"preview-classroom-12s"],[12,27,"preview-measurement-15s"],[57,72,"preview-explanation-15s"],[84,90,"part-return-6s"]]' OUTPUT=/workspace/work/mvt-v4/final-delivery node materials/mean-value-theorem-revised/render/movie.mjs
OUTPUT=/workspace/work/mvt-v4/final-delivery node materials/mean-value-theorem-revised/render/upgrade-v4.mjs
node materials/mean-value-theorem-revised/tests/math.mjs
npx vitest run materials/mean-value-theorem-revised/tests/catalog.test.ts
node materials/mean-value-theorem-revised/tests/video.mjs
npm run build
```

27〜57秒と72〜84秒は変更のないv3ショットを切り出して結合する。画像素材・教室・数学説明の実際の確認は `visual-review-v4.json`、MP4の全編デコード・寸法・時間・フレーム数と過去動画のSHA256照合は `verification-v4.json` に記録。

GitHub Actionsで同じコミットのPages配信後に、数学・操作・時刻引継ぎ・MP4再生・4画面サイズ・タッチ模擬・黒板上枠の余白を検証する。iPhone/iPad/Safari実機は未確認。過去版の説明はREADME-v1/v2/v3.mdへ保持。
