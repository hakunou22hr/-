import SwiftUI

struct MetricView: View { let value: String; let label: String; var body: some View { VStack(spacing: 3) { Text(value).font(.title3.bold()).monospacedDigit(); Text(label).font(.caption).foregroundStyle(.secondary) }.frame(maxWidth: .infinity) } }

struct RouteCard: View {
    let route: RouteOption; let selected: Bool
    var body: some View { HStack { Circle().fill(route.hasTolls ? .purple : selected ? .blue : .green).frame(width: 12, height: 12); VStack(alignment: .leading) { Text(route.title).font(.headline); Text("\(Int(route.duration / 60))分 ・ \(route.distanceMeters / 1000, specifier: "%.1f")km\(route.hasTolls ? " ・ 有料" : "")").font(.subheadline).foregroundStyle(.secondary) }; Spacer(); if selected { Image(systemName: "checkmark.circle.fill").foregroundStyle(.blue) } }.padding().background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16)).overlay(RoundedRectangle(cornerRadius: 16).stroke(selected ? .blue : .clear, lineWidth: 2)) }
}

struct RerouteBanner: View {
    let proposal: (current: RouteOption, alternative: RouteOption); let accept: () -> Void; let decline: () -> Void
    var body: some View { VStack(alignment: .leading, spacing: 10) { Label("新しい交通情報", systemImage: "exclamationmark.triangle.fill").font(.title3.bold()).foregroundStyle(.orange); Text("この先に渋滞があります").font(.headline); HStack { MetricView(value: "\(Int(proposal.current.duration/60))分", label: "現在ルート"); MetricView(value: "\(Int(proposal.alternative.duration/60))分", label: "新ルート"); MetricView(value: "約\(Int((proposal.current.duration-proposal.alternative.duration)/60))分", label: "短縮") }; HStack { Button("現在ルートを継続", action: decline).buttonStyle(.bordered); Button("新ルートへ変更", action: accept).buttonStyle(.borderedProminent) } }.padding().background(.regularMaterial, in: RoundedRectangle(cornerRadius: 20)).shadow(radius: 12).padding() }
}
