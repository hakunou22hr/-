import Foundation

struct GoogleRoutesProvider: TrafficDataProvider {
    let apiKey: String
    private struct Response: Decodable { let routes: [Route] }
    private struct Route: Decodable { let duration: String; let staticDuration: String?; let distanceMeters: Int; let polyline: Polyline?; let routeLabels: [String]?; let travelAdvisory: Advisory? }
    private struct Polyline: Decodable { let encodedPolyline: String }
    private struct Advisory: Decodable { let tollInfo: Toll? }
    private struct Toll: Decodable {}

    func routes(from: SavedPlace, to: SavedPlace, settings: AppSettings) async throws -> RouteSnapshot {
        guard !apiKey.isEmpty else { throw AppIssue.missingAPIKey }
        var request = URLRequest(url: URL(string: "https://routes.googleapis.com/directions/v2:computeRoutes")!)
        request.httpMethod = "POST"; request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "X-Goog-Api-Key")
        request.setValue("routes.duration,routes.staticDuration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.routeLabels,routes.travelAdvisory.tollInfo", forHTTPHeaderField: "X-Goog-FieldMask")
        let avoid = [settings.allowTolls ? nil : "TOLLS", settings.allowHighways ? nil : "HIGHWAYS"].compactMap { $0 }
        let body: [String: Any] = [
            "origin": ["location": ["latLng": ["latitude": from.latitude, "longitude": from.longitude]]],
            "destination": ["location": ["latLng": ["latitude": to.latitude, "longitude": to.longitude]]],
            "travelMode": "DRIVE", "routingPreference": "TRAFFIC_AWARE_OPTIMAL", "computeAlternativeRoutes": true,
            "routeModifiers": ["avoidTolls": avoid.contains("TOLLS"), "avoidHighways": avoid.contains("HIGHWAYS")],
            "languageCode": "ja", "units": "METRIC"
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse, 200..<300 ~= http.statusCode else { throw AppIssue.service("Routes API") }
            let decoded = try JSONDecoder().decode(Response.self, from: data)
            let options = decoded.routes.enumerated().map { index, route in
                RouteOption(id: "google-\(index)", title: index == 0 ? "総合推奨" : "代替ルート \(index)", duration: Self.seconds(route.duration), normalDuration: route.staticDuration.map(Self.seconds), distanceMeters: Double(route.distanceMeters), hasTolls: route.travelAdvisory?.tollInfo != nil, encodedPolyline: route.polyline?.encodedPolyline, notices: [])
            }
            return .init(routes: options, fetchedAt: Date(), isDemo: false)
        } catch let issue as AppIssue { throw issue } catch let error as URLError where error.code == .notConnectedToInternet { throw AppIssue.network } catch { throw AppIssue.service("Routes API") }
    }
    private static func seconds(_ value: String) -> TimeInterval { Double(value.dropLast()) ?? 0 }
}
