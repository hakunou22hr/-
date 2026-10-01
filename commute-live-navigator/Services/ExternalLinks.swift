import Foundation

enum ExternalLinks {
    static func googleMaps(from: SavedPlace, to: SavedPlace) -> URL? {
        var c = URLComponents(string: "https://www.google.com/maps/dir/")!; c.queryItems = [.init(name: "api", value: "1"), .init(name: "origin", value: "\(from.latitude),\(from.longitude)"), .init(name: "destination", value: "\(to.latitude),\(to.longitude)"), .init(name: "travelmode", value: "driving")]; return c.url
    }
    static let jartic = URL(string: "https://www.jartic.or.jp/")!
    static let aomoriRoad = URL(string: "https://www.koutsu-aomori.com/")!
}
