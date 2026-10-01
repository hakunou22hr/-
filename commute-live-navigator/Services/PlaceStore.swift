import Foundation

@MainActor final class PlaceStore: ObservableObject {
    @Published private(set) var places: [SavedPlace] = []
    private let defaults: UserDefaults; private let key = "saved-places-v1"
    init(defaults: UserDefaults = .standard) { self.defaults = defaults; load() }
    func add(_ place: SavedPlace) { places.append(place); persist() }
    func update(_ place: SavedPlace) { if let i = places.firstIndex(where: { $0.id == place.id }) { places[i] = place; persist() } }
    func remove(id: UUID) { places.removeAll { $0.id == id }; persist() }
    private func load() { places = (defaults.data(forKey: key).flatMap { try? JSONDecoder().decode([SavedPlace].self, from: $0) }) ?? [] }
    private func persist() { if let data = try? JSONEncoder().encode(places) { defaults.set(data, forKey: key) } }
}

@MainActor final class SettingsStore: ObservableObject {
    @Published var value: AppSettings { didSet { if let data = try? JSONEncoder().encode(value) { defaults.set(data, forKey: key) } } }
    private let defaults: UserDefaults; private let key = "settings-v1"
    init(defaults: UserDefaults = .standard) { self.defaults = defaults; value = defaults.data(forKey: key).flatMap { try? JSONDecoder().decode(AppSettings.self, from: $0) } ?? .init() }
}
