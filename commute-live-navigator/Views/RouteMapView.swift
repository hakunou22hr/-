import SwiftUI
import CoreLocation
#if canImport(GoogleMaps)
import GoogleMaps

struct RouteMapView: UIViewRepresentable {
    let routes: [RouteOption]; let selectedID: String?; let currentLocation: CLLocation?
    func makeUIView(context: Context) -> GMSMapView { let view = GMSMapView(frame: .zero); view.settings.compassButton = true; view.settings.myLocationButton = true; view.isMyLocationEnabled = true; return view }
    func updateUIView(_ map: GMSMapView, context: Context) {
        map.clear(); let colors: [UIColor] = [.systemBlue, .systemGreen, .systemPurple, .systemGray]
        for (index, route) in routes.enumerated() { guard let encoded = route.encodedPolyline, let path = GMSPath(fromEncodedPath: encoded) else { continue }; let line = GMSPolyline(path: path); line.strokeColor = colors[min(index, 3)].withAlphaComponent(route.id == selectedID ? 1 : 0.42); line.strokeWidth = route.id == selectedID ? 8 : 4; line.zIndex = route.id == selectedID ? 2 : 1; line.map = map }
    }
}
#else
struct RouteMapView: View {
    let routes: [RouteOption]; let selectedID: String?; let currentLocation: CLLocation?
    var body: some View { ZStack { LinearGradient(colors: [.blue.opacity(0.13), .green.opacity(0.1)], startPoint: .topLeading, endPoint: .bottomTrailing); VStack(spacing: 10) { Image(systemName: "map.fill").font(.system(size: 44)).foregroundStyle(.blue); Text("Google Maps SDK を追加すると地図を表示します").font(.footnote).multilineTextAlignment(.center) }.padding() }.accessibilityLabel("地図プレビュー") }
}
#endif
