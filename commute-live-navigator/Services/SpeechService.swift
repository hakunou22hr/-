import AVFoundation

@MainActor final class SpeechService {
    private let synthesizer = AVSpeechSynthesizer()
    var rate: Float = 0.48; var volume: Float = 1
    func speak(_ shortMessage: String, enabled: Bool) { guard enabled else { return }; synthesizer.stopSpeaking(at: .word); let utterance = AVSpeechUtterance(string: shortMessage); utterance.voice = .init(language: "ja-JP"); utterance.rate = rate; utterance.volume = volume; synthesizer.speak(utterance) }
    func stop() { synthesizer.stopSpeaking(at: .immediate) }
}
