import XCTest
@testable import CommuteLiveNavigator

final class CommuteLiveNavigatorTests: XCTestCase {
    @MainActor func testSavedPlaceAddAndDelete() {
        let suite = "test-\(UUID())"; let defaults = UserDefaults(suiteName: suite)!; defaults.removePersistentDomain(forName: suite)
        let store = PlaceStore(defaults: defaults); let place = SavedPlace(name: "自宅", address: "非公開", latitude: 40.82, longitude: 140.74)
        store.add(place); XCTAssertEqual(store.places, [place]); store.remove(id: place.id); XCTAssertTrue(store.places.isEmpty)
    }
    @MainActor func testSwapOriginAndDestination() {
        let demo = DemoDataProvider(); let model = CommuteViewModel(provider: demo, demo: demo); let home = SavedPlace(name: "自宅", address: "", latitude: 1, longitude: 2); let work = SavedPlace(name: "勤務地", address: "", latitude: 3, longitude: 4)
        model.origin = home; model.destination = work; model.swap(); XCTAssertEqual(model.origin, work); XCTAssertEqual(model.destination, home)
    }
    func testDemoProvidesDistinctRoutesAndExplicitDemoFlag() async throws {
        let demo = DemoDataProvider(); let point = SavedPlace(name: "地点", address: "", latitude: 1, longitude: 2); let result = try await demo.routes(from: point, to: point, settings: .init())
        XCTAssertGreaterThanOrEqual(result.routes.count, 2); XCTAssertTrue(result.isDemo); XCTAssertEqual(Set(result.routes.map(\.id)).count, result.routes.count)
    }
    @MainActor func testNavigationStopDisablesTracking() {
        let demo = DemoDataProvider(); let model = CommuteViewModel(provider: demo, demo: demo); model.startNavigation(settings: .init()); XCTAssertTrue(model.location.isNavigating); model.stopNavigation(); XCTAssertFalse(model.location.isNavigating)
    }
    func testUnavailableSnowProviderDoesNotInventConditions() async {
        let notices = await UnavailableSnowProvider().snowNotices(near: .init(name: "青森", address: "", latitude: 40.82, longitude: 140.74)); XCTAssertEqual(notices.first?.availability, .unavailable)
    }
}
