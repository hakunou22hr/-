import UserNotifications
import Foundation

actor NotificationService {
    private var sent: [String: Date] = [:]; private let cooldown: TimeInterval = 300
    func requestAuthorization() async { _ = try? await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) }
    func send(id: String, title: String, body: String, sound: Bool) async {
        guard sent[id].map({ Date().timeIntervalSince($0) < cooldown }) != true else { return }; sent[id] = Date()
        let content = UNMutableNotificationContent(); content.title = title; content.body = body; content.badge = 1; if sound { content.sound = .default }
        try? await UNUserNotificationCenter.current().add(.init(identifier: id, content: content, trigger: nil))
    }
}
