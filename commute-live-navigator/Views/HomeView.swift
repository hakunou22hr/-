import SwiftUI

struct HomeView: View {
    @EnvironmentObject var places: PlaceStore; @EnvironmentObject var settings: SettingsStore; @ObservedObject var model: CommuteViewModel
    @State private var showingPlaces = false; @State private var showingSettings = false
    private let clock = DateFormatter.localizedString(from: Date(), dateStyle: .none, timeStyle: .short)
    var body: some View { NavigationStack { ZStack(alignment: .top) { ScrollView { VStack(spacing: 16) {
        if model.snapshot?.isDemo == true { Text("DEMO — 本番交通情報ではありません").font(.caption.bold()).frame(maxWidth: .infinity).padding(7).background(.orange).foregroundStyle(.black) }
        routeHeader
        if let issue = model.issue { Label(issue.localizedDescription, systemImage: "exclamationmark.circle.fill").frame(maxWidth: .infinity, alignment: .leading).padding().background(.red.opacity(0.12), in: RoundedRectangle(cornerRadius: 14)) }
        RouteMapView(routes: model.snapshot?.routes ?? [], selectedID: model.selectedRouteID, currentLocation: model.location.location).frame(height: 270).clipShape(RoundedRectangle(cornerRadius: 22))
        if let route = model.selectedRoute { summary(route); notices(route) }
        ForEach(model.snapshot?.routes ?? []) { route in Button { model.selectedRouteID = route.id } label: { RouteCard(route: route, selected: model.selectedRouteID == route.id) }.buttonStyle(.plain) }
        controls
    }.padding() }.refreshable { await model.refresh() }
        if let proposal = model.rerouteProposal { RerouteBanner(proposal: proposal, accept: model.acceptReroute, decline: { model.rerouteProposal = nil }) }
    }.navigationTitle("通勤ルート LIVE").toolbar { ToolbarItemGroup(placement: .topBarTrailing) { Button { showingPlaces = true } label: { Image(systemName: "mappin.and.ellipse") }; Button { showingSettings = true } label: { Image(systemName: "gearshape") } } }.sheet(isPresented: $showingPlaces) { PlacesView() }.sheet(isPresented: $showingSettings) { SettingsView() }.task { model.configure(places: places.places); if model.snapshot == nil { model.useDemo() } } }
    }
    private var routeHeader: some View { HStack { VStack(alignment: .leading) { Text(model.origin?.name ?? "自宅を登録").font(.title2.bold()); Image(systemName: "arrow.down").foregroundStyle(.secondary); Text(model.destination?.name ?? "勤務地を登録").font(.title2.bold()) }; Spacer(); Button { model.swap() } label: { Label("入替", systemImage: "arrow.up.arrow.down").padding(10) }.buttonStyle(.bordered) } }
    private func summary(_ route: RouteOption) -> some View { VStack(spacing: 12) { HStack { Text("⭐ 今日の推奨ルート").font(.headline); Spacer(); Text("現在 \(clock)").font(.caption) }; HStack { MetricView(value: "\(Int(route.duration/60))分", label: "所要時間"); MetricView(value: route.delay.map { String(format: "%+.0f分", $0/60) } ?? "未取得", label: "通常との差"); MetricView(value: DateFormatter.localizedString(from: route.arrival, dateStyle: .none, timeStyle: .short), label: "到着予定") }; HStack { Text("距離 \(route.distanceMeters/1000, specifier: "%.1f")km"); Spacer(); Text("最終更新 \(model.snapshot.map { DateFormatter.localizedString(from: $0.fetchedAt, dateStyle: .none, timeStyle: .short) } ?? "—")") }.font(.caption).foregroundStyle(.secondary) }.padding().background(.blue.opacity(0.08), in: RoundedRectangle(cornerRadius: 18)) }
    private func notices(_ route: RouteOption) -> some View { VStack(alignment: .leading, spacing: 8) { Text("交通状況").font(.headline); if route.notices.isEmpty { Text("事故・工事・通行止め・雪：この情報源では確認不可").foregroundStyle(.secondary) } else { ForEach(route.notices) { Label($0.title, systemImage: "exclamationmark.triangle") } } }.frame(maxWidth: .infinity, alignment: .leading).padding().background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16)) }
    private var controls: some View { VStack(spacing: 10) { Button { model.startNavigation(settings: settings.value) } label: { Label("ナビ開始", systemImage: "location.fill").font(.title3.bold()).frame(maxWidth: .infinity).padding(8) }.buttonStyle(.borderedProminent); HStack { Button { model.readSummary(settings: settings.value) } label: { Label("音声で聞く", systemImage: "speaker.wave.2") }; Button("渋滞を発生（Demo）") { Task { await model.simulateCongestion(settings: settings.value) } } }.buttonStyle(.bordered); if let from = model.origin, let to = model.destination, let url = ExternalLinks.googleMaps(from: from, to: to) { Link("Google Mapsで開く", destination: url) } }.fullScreenCover(isPresented: $model.isNavigating) { NavigationViewScreen(model: model) } }
}
