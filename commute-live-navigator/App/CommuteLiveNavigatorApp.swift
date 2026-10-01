import SwiftUI
#if canImport(GoogleMaps)
import GoogleMaps
#endif

@main struct CommuteLiveNavigatorApp: App {
    @StateObject private var places = PlaceStore(); @StateObject private var settings = SettingsStore(); @StateObject private var model: CommuteViewModel
    init() {
        let demo = DemoDataProvider(); let key = Bundle.main.object(forInfoDictionaryKey: "GOOGLE_ROUTES_API_KEY") as? String ?? ""
        _model = StateObject(wrappedValue: CommuteViewModel(provider: key.isEmpty || key.contains("$(") ? demo : GoogleRoutesProvider(apiKey: key), demo: demo))
        #if canImport(GoogleMaps)
        let mapKey = Bundle.main.object(forInfoDictionaryKey: "GOOGLE_MAPS_API_KEY") as? String ?? ""; if !mapKey.isEmpty && !mapKey.contains("$(") { GMSServices.provideAPIKey(mapKey) }
        #endif
    }
    var body: some Scene { WindowGroup { HomeView(model: model).environmentObject(places).environmentObject(settings) } }
}
