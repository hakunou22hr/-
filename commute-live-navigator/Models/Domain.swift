import Foundation
import CoreLocation

enum DataAvailability: String, Codable { case available, unavailable, notFetched, stale }
enum IncidentKind: String, Codable { case congestion = "渋滞", accident = "事故", construction = "工事", closure = "通行止め", restriction = "規制", snow = "雪" }

struct SavedPlace: Identifiable, Codable, Equatable {
    var id = UUID(); var name: String; var address: String; var latitude: Double; var longitude: Double
    var coordinate: CLLocationCoordinate2D { .init(latitude: latitude, longitude: longitude) }
}

struct RoadNotice: Identifiable, Codable, Equatable {
    var id = UUID(); let kind: IncidentKind; let title: String; let availability: DataAvailability
}

struct RouteOption: Identifiable, Codable, Equatable {
    let id: String; let title: String; let duration: TimeInterval; let normalDuration: TimeInterval?
    let distanceMeters: Double; let hasTolls: Bool; let encodedPolyline: String?; let notices: [RoadNotice]
    var delay: TimeInterval? { normalDuration.map { duration - $0 } }
    var arrival: Date { Date().addingTimeInterval(duration) }
}

struct RouteSnapshot: Codable, Equatable {
    let routes: [RouteOption]; let fetchedAt: Date; let isDemo: Bool
}

struct AppSettings: Codable, Equatable {
    var speechEnabled = true; var notificationEnabled = true; var notificationSound = false
    var snowMode = false; var allowTolls = true; var allowHighways = true
    var rerouteSuggestions = true; var automaticReroute = false; var savingsThresholdMinutes = 5
}

enum AppIssue: LocalizedError, Equatable {
    case missingAPIKey, network, locationDenied, service(String)
    var errorDescription: String? {
        switch self { case .missingAPIKey: "APIキーが未設定です。Demoモードで確認できます。"; case .network: "現在オフラインです。最新交通情報を取得できません。"; case .locationDenied: "位置情報が許可されていません。設定から許可してください。"; case .service(let message): "交通情報を取得できません（\(message)）" }
    }
}
