# 30秒MP4の検証記録

検証日：2026-10-15（日本時間）。

## 成果物

- [30秒MP4](https://github.com/hakunou22hr/-/releases/download/trig-integral-cinema-30s-v1/trig-integral-cinema-30s.mp4)
- [再生・ダウンロードページ](https://hakunou22hr.github.io/-/materials/trig-integral-cinema/video.html)
- ソースのコミット：`6f3583db140de949518455c3cee1e7f5b93c6e5c`
- ファイルサイズ：30,225,272 bytes（約30.2 MB）
- SHA-256：`c9e9827876341dbc226f7634033c1301d327b5cb623d713771babd963c1d4300`

## 確認結果

- 数学・タイムライン検査5件：成功。元の90秒版と30秒版の10シーン、全LaTeX、半角公式・積和公式、2問の原始関数、係数と+Cを確認。
- 教材単独と教材ライブラリ全体の本番ビルド：成功。
- GitHub Pages公開とGitHub ActionsのMP4生成・Release保存：成功。
- 公開MP4を再ダウンロードし、ReleaseのSHA256SUMSと照合：一致。
- ダウンロードしたMP4の全フレームの再デコード：エラーなし。
- FFprobe：30.000000秒、1920×1080、30/1 fps、900フレーム、H.264・yuv420p、AAC・48kHz・2ch。
- 音声信号：平均−28.1 dB、最大−16.9 dB。無音ではなく、ピークのクリッピングなし。
- 主要14時点の数式・字幕・3D演出を画像確認。数式の画面外へのはみ出しなし。公開MP4から取り出したエンディングも確認。
- ブラウザ教材：30秒で停止し、元の90秒版のタイトル表示も保持。
- Chromiumで、公開MP4をダウンロードしたファイルを再生ページへ読み込み、再生ボタンによる開始、映像と音声のデコード、15.4秒へのシーク、MP4ダウンロードを確認。
- ブラウザの取得ファイル名：`trig-integral-cinema-30s.mp4`。
- 幅390pxのページ表示：横方向のはみ出しなし。JavaScript例外なし。
- 公開MP4のHTTP Range要求：206応答、指定した1024 bytesを取得。

## 検証の範囲

ブラウザ動作確認はLinux上のChromiumです。WindowsおよびiPhone/Safariの実機では確認していません。MP4は両者で広く利用されるH.264/AACの形式で、ページはplaysinlineと標準video操作を使用します。ブラウザUIのテストと、公開URLのHTTP取得・Range取得はそれぞれ別に実施しました。

元の90秒版の完全MP4書き出しと、過去のCodex環境にある未コミット変更の調査は、この30秒版の制作では実施していません。
