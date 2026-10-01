import Foundation

protocol TrafficDataProvider { func routes(from: SavedPlace, to: SavedPlace, settings: AppSettings) async throws -> RouteSnapshot }
protocol WeatherDataProvider { func weatherNotices(near place: SavedPlace) async -> [RoadNotice] }
protocol SnowRoadDataProvider { func snowNotices(near place: SavedPlace) async -> [RoadNotice] }
protocol RoadRestrictionProvider { func restrictions(near route: RouteOption) async -> [RoadNotice] }

struct UnavailableSnowProvider: SnowRoadDataProvider {
    func snowNotices(near place: SavedPlace) async -> [RoadNotice] {
        [.init(kind: .snow, title: "この情報源では積雪・除雪状況を確認できません", availability: .unavailable)]
    }
}

actor DemoDataProvider: TrafficDataProvider {
    private var disrupted = false
    func simulateCongestion() { disrupted = true }
    func routes(from: SavedPlace, to: SavedPlace, settings: AppSettings) async throws -> RouteSnapshot {
        let current = disrupted ? 55.0 : 42.0
        let notice = disrupted ? [RoadNotice(kind: .congestion, title: "前方に新しい渋滞（デモ）", availability: .available)] : []
        return RouteSnapshot(routes: [
            .init(id: "recommended", title: disrupted ? "現在ルート" : "総合推奨", duration: current * 60, normalDuration: 38 * 60, distanceMeters: 31_400, hasTolls: false, encodedPolyline: nil, notices: notice),
            .init(id: "alternative", title: "代替ルート", duration: 46 * 60, normalDuration: 44 * 60, distanceMeters: 34_800, hasTolls: false, encodedPolyline: nil, notices: []),
            .init(id: "toll", title: "有料道路", duration: 40 * 60, normalDuration: 39 * 60, distanceMeters: 36_200, hasTolls: true, encodedPolyline: nil, notices: [])
        ], fetchedAt: Date(), isDemo: true)
    }
}
