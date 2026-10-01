import SwiftUI

struct NavigationViewScreen: View {
    @ObservedObject var model: CommuteViewModel
    var body: some View { ZStack(alignment: .top) { VStack(spacing: 0) { HStack { Image(systemName: "arrow.turn.up.right").font(.largeTitle); VStack(alignment: .leading) { Text("次の案内").font(.caption); Text("Navigation SDK の案内に従ってください").font(.title3.bold()) }; Spacer() }.padding().background(.blue).foregroundStyle(.white)
        RouteMapView(routes: model.snapshot?.routes ?? [], selectedID: model.selectedRouteID, currentLocation: model.location.location).ignoresSafeArea(edges: .horizontal)
        if let route = model.selectedRoute { HStack { MetricView(value: DateFormatter.localizedString(from: route.arrival, dateStyle: .none, timeStyle: .short), label: "到着予定"); MetricView(value: "\(Int(route.duration/60))分", label: "残り"); MetricView(value: String(format: "%.1fkm", route.distanceMeters/1000), label: "残り距離") }.padding().background(.ultraThinMaterial) }
        Button(role: .destructive) { model.stopNavigation() } label: { Text("ナビを終了").font(.headline).frame(maxWidth: .infinity).padding(10) }.buttonStyle(.borderedProminent).tint(.red).padding()
    }; if let p = model.rerouteProposal { RerouteBanner(proposal: p, accept: model.acceptReroute, decline: { model.rerouteProposal = nil }) } }.interactiveDismissDisabled() }
}
