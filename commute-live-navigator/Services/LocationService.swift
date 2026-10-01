import CoreLocation
import Foundation

@MainActor final class LocationService: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published private(set) var location: CLLocation?; @Published private(set) var issue: AppIssue?
    private let manager = CLLocationManager(); private(set) var isNavigating = false
    override init() { super.init(); manager.delegate = self; manager.desiredAccuracy = kCLLocationAccuracyBest }
    func requestForeground() { manager.requestWhenInUseAuthorization(); manager.startUpdatingLocation() }
    func startNavigation() {
        isNavigating = true; manager.requestAlwaysAuthorization(); manager.allowsBackgroundLocationUpdates = true
        manager.pausesLocationUpdatesAutomatically = true; manager.activityType = .automotiveNavigation; manager.startUpdatingLocation()
    }
    func stopNavigation() { isNavigating = false; manager.stopUpdatingLocation(); manager.allowsBackgroundLocationUpdates = false }
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) { location = locations.last }
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) { if manager.authorizationStatus == .denied || manager.authorizationStatus == .restricted { issue = .locationDenied } }
}
