import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var store: SettingsStore; @Environment(\.dismiss) var dismiss
    var body: some View { NavigationStack { Form { Section("案内") { Toggle("音声案内", isOn: $store.value.speechEnabled); Toggle("通知", isOn: $store.value.notificationEnabled); Toggle("通知音", isOn: $store.value.notificationSound) }; Section("経路") { Toggle("❄ 雪道モード", isOn: $store.value.snowMode); Toggle("有料道路を使用", isOn: $store.value.allowTolls); Toggle("高速道路を使用", isOn: $store.value.allowHighways); Toggle("再ルートを提案", isOn: $store.value.rerouteSuggestions); Toggle("大幅短縮時に自動変更", isOn: $store.value.automaticReroute); Picker("提案する短縮時間", selection: $store.value.savingsThresholdMinutes) { Text("3分以上").tag(3); Text("5分以上").tag(5); Text("10分以上").tag(10) } }; Section("公式情報") { Link("青森県道路情報を開く", destination: ExternalLinks.aomoriRoad); Link("JARTICを確認", destination: ExternalLinks.jartic); Text("公式API未接続のため、積雪・凍結・除雪状況を推測表示しません。") .font(.caption).foregroundStyle(.secondary) } }.navigationTitle("設定").toolbar { Button("完了") { dismiss() } } } }
}
