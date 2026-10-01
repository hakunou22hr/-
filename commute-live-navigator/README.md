# commute-live-navigator（通勤ルート LIVE）

登録した自宅・勤務地などの間を、交通状況を考慮した複数経路で比較し、ナビ開始中だけ継続的に位置を利用する iPhone 向け SwiftUI アプリです。本ディレクトリは既存リポジトリを壊さない独立プロジェクトです。API キーなしでも **DEMO** 表示付きで「通常 42 分 → 渋滞後 55 分、代替 46 分」の再ルート提案を確認できます。

> **安全:** 運転中は端末を操作しないでください。出発前に設定し、道路標識・警察・道路管理者の指示を優先してください。本実装は交通・積雪・除雪状況を推測しません。

## 実装範囲と依存関係

|区分|内容|
|---|---|
|このソースだけで実装済み|保存地点の端末内保存、朝夕候補と入替、MVVM、複数ルートカード、DEMO変化、再ルートバナー、短い日本語読み上げ、通知の5分重複抑制、設定、公式情報リンク、開始/終了に連動した位置追跡、エラー/鮮度表示|
|外部サービスが必要|Google 地図タイル、交通考慮ルート、実走行 Navigation SDK、公式の気象・雪道・規制情報|
|Google API キーが必要|Maps SDK for iOS、Routes API、Navigation SDK for iOS（契約・利用条件も必要）|
|iPhone 実機が必要|GPS精度、Always権限、ロック中のBackground Location、音声/マナーモード時の期待動作、通知、Navigation SDK、発熱・電池消費、CarPlay（本版対象外）|
|Codex/Linuxでは未検証|Xcode署名、Google SDKリンク、ターンバイターン、バックグラウンド遷移、実交通データ、App Store審査|

## 使用技術と構成

- Swift 5.10 / SwiftUI / MVVM、iOS 17+
- Core Location、UserNotifications、AVSpeechSynthesizer
- Google Maps SDK for iOS（`canImport(GoogleMaps)`。未導入時は明示的な地図プレースホルダー）
- Google Routes API v2（`TRAFFIC_AWARE_OPTIMAL`、代替経路、field mask）
- Navigation SDK は本番統合ポイント。現時点の画面/ライフサイクルは用意済みですが、SDK固有のターン案内・イベント購読は未接続です。
- `Models`、`Views`、`ViewModels`、`Services`、`Providers`、`Configuration`、`Tests` に分離。

保存地点は `UserDefaults` のアプリサンドボックス内に Codable として保存します。位置履歴は保存せず、自社サーバーもありません。Routes API へ送るのは選択した始点・終点です。正確な住所・座標をログ出力しません。さらに強い保存保護が必要な運用では Keychain/暗号化ストアへ差し替えてください。

## 必要な Google API と Cloud Console 設定

1. Google Cloud プロジェクトで課金を有効化します（Google の無料枠・料金・規約は変更され得るため、導入時に公式ページを確認）。
2. **Maps SDK for iOS**、**Routes API**、実走行を組み込む際は **Navigation SDK for iOS** を有効化します。
3. Maps/Navigation 用キーは iOS アプリ制限（Bundle ID `jp.example.commutelive`）を設定します。
4. Routes API をアプリから直接呼ぶキーは API 制限を必ず設定してください。モバイルアプリに秘密を完全に保持することはできません。本番では Google 推奨の制限を適用し、必要なら個人情報を保持しない認証プロキシ設計を別途セキュリティレビューしてください。
5. 予算アラートと割当上限を設定します。Routes、Maps、Navigation は利用量に応じて料金が発生する可能性があります。

### API キー（コミット禁止）

```bash
cd commute-live-navigator
cp Configuration/Secrets.xcconfig.example Configuration/Secrets.xcconfig
# 手元だけで値を編集
```

Xcode の Project > Info > Configurations で Debug/Release の Base Configuration に `Secrets.xcconfig` を指定します。このファイルは `.gitignore` 済みです。ビルド前スクリプトも典型的な Google キー文字列のコミットを拒否します。Production と Demo は `RouteSnapshot.isDemo` で分離し、Demo のとき画面最上部に必ず表示します。

## Xcode プロジェクト生成と SDK 導入

1. macOS に Xcode 16 以降と XcodeGen を用意します。
2. `cd commute-live-navigator && xcodegen generate` を実行します。
3. 生成された `CommuteLiveNavigator.xcodeproj` を開きます。
4. Google の現行公式 Navigation SDK セットアップ手順に従い、推奨される配布方式（Swift Package Manager または CocoaPods）で Maps/Navigation SDK を追加します。SDK版ごとにAPIが変わるため、バージョン固定とリリースノート確認を行ってください。
5. Maps SDK がリンクされると `RouteMapView` の `GoogleMaps` 実装が有効になり、現在地、パン、ピンチ、コンパス、現在地ボタン、複数Polylineが表示されます。
6. Signing & Capabilities で Team を選び、Background Modes > Location updates を確認します。`Info.plist` には日本語の When In Use / Always 説明と `location` background mode が設定済みです。

Navigation SDK 固有の `GMSNavigator`/ルート変更イベントは、採用するSDKバージョンの公式サンプルに合わせて `Services` に Adapter を追加してください。標準イベントを優先し、数秒ポーリングはしません。候補更新はイベントまたは意味のある移動/クールダウンを契機とし、到着・キャンセル時に必ず解除してください。

## 起動・実機テスト

1. Secrets を設定し、Xcodeで実機を選択して Signing Team を指定します。
2. 初回起動後「保存地点」で自宅、勤務地の順に追加します。住所は表示用で、現在は緯度経度を明示入力します（将来 Geocoding Provider を追加）。
3. 位置情報はまず「Appの使用中」、ナビ開始時に必要性を説明した上で「常に」を許可します。拒否時は日本語エラーを表示します。
4. 通知は設定をONにし、OS許可ダイアログを承認します。本版では通知要求呼び出しをアプリの明示的オン操作へ接続する追加作業が必要です。
5. ナビ開始後、ロック/他アプリ移行で位置更新と電池消費を確認します。「ナビを終了」後、`stopUpdatingLocation` と background flag が解除されることを Instruments/Console で確認します。
6. `Product > Test` で保存追加削除、入替、Demo複数経路、雪情報未取得、追跡停止のUnit Testを実行します。

## Demoモード

APIキー未設定時は `DemoDataProvider` を使います。地点を2件登録後、ホームの「渋滞を発生（Demo）」で、現在ルート55分・代替46分へ変化し、設定閾値を超えれば大きなバナー、音声、通知を発生させます。DEMOラベルを消して本番情報のように見せることは禁止です。

## 権限・バックグラウンド・電池

- 通常画面では When In Use。ナビ開始時だけ Always と Background Location を要求します。
- `activityType = .automotiveNavigation` と自動一時停止を利用します。
- ナビ終了時は位置更新、背景更新、読み上げを停止します。常時追跡はしません。
- iOSはマナーモードを確実に取得できないため、アプリ内「音声案内」を基準にし、重要事項は常に画面バナーでも表示します。
- 通知音は通知本体と別設定です。同一IDの通知は5分間抑止します。

## オフライン、鮮度、エラー

Routes の成功時刻だけを「最終更新」として表示します。通信断は「現在オフライン」、キー未設定、位置拒否、サービス失敗は日本語カードで表示し、古い取得値を新しい値として更新しません。実運用前にNetwork frameworkによる常時オフラインバッジと、一定時間経過時の `.stale` 表示を追加してください。

## 雪道・道路情報 Provider の追加

`SnowRoadDataProvider`、`WeatherDataProvider`、`RoadRestrictionProvider`、`TrafficDataProvider` をUIから分離しています。自治体・道路管理者が公式API/オープンデータを提供し、利用規約、更新時刻、位置精度、再配布条件を確認できた場合だけ実装します。

1. Provider を実装し、レスポンスの観測時刻・取得時刻・出典URLをモデルへ追加する。
2. 取得不能は `.unavailable`、未要求は `.notFetched`、期限超過は `.stale` とする。
3. ルート評価には「取得できた規制」だけを利用し、除雪済み・凍結なし等を補間しない。
4. Fixture/契約テスト、欠損値、時刻、通信断を検証する。
5. 公式APIがない場合はスクレイピングせず、既存の「青森県道路情報」「JARTIC」リンクを維持する。

## フェーズ状況 / 現在未実装

- **Phase 1:** 保存地点、現在位置ライフサイクル、Google Maps切替点、複数ルート/時間比較を実装。住所検索は未実装。
- **Phase 2:** 推奨表示、候補色、音声、取得済み/確認不可の明示を実装。区間別speed readingによる緑黄橙赤の交通描画は未実装（Routesレスポンスから得ていないため推測しない）。
- **Phase 3:** 走行画面と位置バックグラウンド管理を実装。Navigation SDKのターンバイターン、SDKイベント、自動ETA同期は未接続。
- **Phase 4:** バナー、通知クールダウン、Demo再ルートを実装。Google/公式ソースから事故・工事・閉鎖を取得するProviderは未実装。
- **Phase 5:** Provider抽象と公式リンクを実装。青森県等の公式API連携は、採用可能な公式APIが確定していないため未実装。
- **Phase 6:** 大型走行UI、エラーを実装。実機・電池・アクセシビリティ・悪天候の検証は未実施。

日常利用前には、未実装の Navigation SDK adapter、通知許可導線、Network監視、経路逸脱、SDKライセンス表示、プライバシーマニフェスト、実機走行試験、App Store要件への対応が必須です。本リポジトリの状態を「完成済み安全運転製品」として配布しないでください。
