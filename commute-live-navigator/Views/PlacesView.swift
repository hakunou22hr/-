import SwiftUI

struct PlacesView: View {
    @EnvironmentObject var store: PlaceStore; @Environment(\.dismiss) var dismiss
    @State private var name = ""; @State private var address = ""; @State private var latitude = ""; @State private var longitude = ""
    var body: some View { NavigationStack { Form { Section("保存地点") { ForEach(store.places) { place in VStack(alignment: .leading) { Text(place.name); Text(place.address).font(.caption).foregroundStyle(.secondary) } }.onDelete { offsets in offsets.map { store.places[$0].id }.forEach(store.remove) } }; Section("地点を追加") { TextField("名称（自宅・勤務地など）", text: $name); TextField("住所（端末内の表示用）", text: $address); TextField("緯度", text: $latitude).keyboardType(.decimalPad); TextField("経度", text: $longitude).keyboardType(.decimalPad); Button("追加") { guard let lat = Double(latitude), let lng = Double(longitude), !name.isEmpty else { return }; store.add(.init(name: name, address: address, latitude: lat, longitude: lng)); name = ""; address = ""; latitude = ""; longitude = "" } } } .navigationTitle("保存地点").toolbar { Button("完了") { dismiss() } } } }
}
