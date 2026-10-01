import Foundation

@MainActor final class CommuteViewModel: ObservableObject {
    @Published var origin: SavedPlace?; @Published var destination: SavedPlace?; @Published var snapshot: RouteSnapshot?
    @Published var selectedRouteID: String?; @Published var issue: AppIssue?; @Published var rerouteProposal: (current: RouteOption, alternative: RouteOption)?
    @Published var isLoading = false; @Published var isNavigating = false
    let demo: DemoDataProvider; private var provider: any TrafficDataProvider; let speech = SpeechService(); let location = LocationService(); let notifications = NotificationService()
    init(provider: any TrafficDataProvider, demo: DemoDataProvider) { self.provider = provider; self.demo = demo }
    var selectedRoute: RouteOption? { snapshot?.routes.first(where: { $0.id == selectedRouteID }) ?? snapshot?.routes.first }
    func configure(places: [SavedPlace]) { guard origin == nil, places.count >= 2 else { return }; let morning = Calendar.current.component(.hour, from: Date()) < 15; origin = morning ? places[0] : places[1]; destination = morning ? places[1] : places[0] }
    func swap() { (origin, destination) = (destination, origin); Task { await refresh() } }
    func useDemo() { provider = demo; Task { await refresh() } }
    func refresh() async {
        guard let origin, let destination else { return }; isLoading = true; defer { isLoading = false }
        do { let result = try await provider.routes(from: origin, to: destination, settings: .init()); snapshot = result; selectedRouteID = result.routes.first?.id; issue = nil } catch let value as AppIssue { issue = value } catch { issue = .service("不明なエラー") }
    }
    func readSummary(settings: AppSettings) { guard let route = selectedRoute else { return }; speech.speak("推奨ルートの所要時間は約\(Int(route.duration / 60))分です。", enabled: settings.speechEnabled) }
    func startNavigation(settings: AppSettings) { isNavigating = true; location.startNavigation(); readSummary(settings: settings) }
    func stopNavigation() { isNavigating = false; location.stopNavigation(); speech.stop() }
    func simulateCongestion(settings: AppSettings) async {
        await demo.simulateCongestion(); provider = demo; let old = selectedRoute; await refresh()
        guard let current = snapshot?.routes.first, let alt = snapshot?.routes.dropFirst().min(by: { $0.duration < $1.duration }), current.duration - alt.duration >= Double(settings.savingsThresholdMinutes * 60) else { return }
        rerouteProposal = (current, alt); speech.speak("前方で交通状況が悪化しています。別ルートでは約\(Int((current.duration-alt.duration)/60))分短縮できます。", enabled: settings.speechEnabled)
        if settings.notificationEnabled { await notifications.send(id: "reroute-\(alt.id)", title: "新しい交通情報", body: "より速い経路があります", sound: settings.notificationSound) }
        if settings.automaticReroute { acceptReroute() }; _ = old
    }
    func acceptReroute() { selectedRouteID = rerouteProposal?.alternative.id; rerouteProposal = nil }
}
