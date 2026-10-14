import { SHORT_DURATION } from "../data/shortTimeline";
import { cinema } from "../data/cinema";

/** Offline version of the original CinemaAudio synth, timed to the short edit. */
export async function renderShortSoundtrack(): Promise<number[]> {
  const rate = 48000;
  const ctx = new OfflineAudioContext(2, SHORT_DURATION * rate, rate);
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, 0);
  master.gain.setTargetAtTime(0.8, 0, 0.35);
  master.gain.setValueAtTime(0.8, SHORT_DURATION - 0.25);
  master.gain.linearRampToValueAtTime(0, SHORT_DURATION);
  master.connect(ctx.destination);
  for (const frequency of [55, 82.4069, 110.15, 164.8138]) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.035;
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(0);
  }
  let randomState = 21197;
  function random() {
    randomState = (1664525 * randomState + 1013904223) >>> 0;
    return randomState / 4294967296;
  }
  function cue(kind: "split" | "merge" | "gold", start: number) {
    if (kind === "split") {
      const buffer = ctx.createBuffer(1, rate * 0.6, rate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (random() * 2 - 1) * Math.exp(-i / data.length * 8);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 1800;
      const gain = ctx.createGain();
      gain.gain.value = 0.025;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      source.start(start);
      return;
    }
    [0, 4, 7, 12].forEach((n, i) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(kind === "gold" ? 440 * 2 ** (n / 12) : 180 + i * 80, start);
      if (kind === "merge") oscillator.frequency.exponentialRampToValueAtTime(440 + i * 110, start + 1.1);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.024, start + 0.08 + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.8);
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(start);
      oscillator.stop(start + 2);
    });
  }
  for (const start of [5, 18]) {
    cue("split", start);
    cue("merge", start + cinema.morph.split / 2.4);
    cue("gold", start + cinema.morph.assemble / 2.4);
  }
  cue("gold", 27);
  const audio = await ctx.startRendering();
  const bytes = new Uint8Array(44 + audio.length * 4);
  const view = new DataView(bytes.buffer);
  function ascii(offset: number, value: string) {
    for (let i = 0; i < value.length; i++) bytes[offset + i] = value.charCodeAt(i);
  }
  ascii(0, "RIFF"); view.setUint32(4, bytes.length - 8, true);
  ascii(8, "WAVE"); ascii(12, "fmt "); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, 2, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 4, true);
  view.setUint16(32, 4, true); view.setUint16(34, 16, true);
  ascii(36, "data"); view.setUint32(40, bytes.length - 44, true);
  const left = audio.getChannelData(0), right = audio.getChannelData(1);
  for (let i = 0; i < audio.length; i++) {
    view.setInt16(44 + i * 4, Math.round(Math.max(-1, Math.min(1, left[i])) * 32767), true);
    view.setInt16(46 + i * 4, Math.round(Math.max(-1, Math.min(1, right[i])) * 32767), true);
  }
  return Array.from(bytes);
}
