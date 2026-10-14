// Original synthesized audio; no samples, recordings or external assets.
export class CinemaAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private drones: OscillatorNode[] = [];
  async enable() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
      for (const f of [55, 82.4069, 110.15, 164.8138]) {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = "sine";
        o.frequency.value = f;
        g.gain.value = 0.035;
        o.connect(g);
        g.connect(this.master);
        o.start();
        this.drones.push(o);
      }
    }
    await this.ctx.resume();
  }
  setActive(active: boolean) {
    if (!this.ctx || !this.master) return;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(
      active ? 0.8 : 0,
      this.ctx.currentTime,
      0.35,
    );
  }
  cue(kind: "split" | "merge" | "gold") {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const start = ctx.currentTime;
    if (kind === "split") {
      const b = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++)
        d[i] = (Math.random() * 2 - 1) * Math.exp((-i / d.length) * 8);
      const src = ctx.createBufferSource();
      src.buffer = b;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 1800;
      const g = ctx.createGain();
      g.gain.value = 0.025;
      src.connect(filter);
      filter.connect(g);
      g.connect(this.master);
      src.start();
      return;
    }
    [0, 4, 7, 12].forEach((n, i) => {
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(
        kind === "gold" ? 440 * Math.pow(2, n / 12) : 180 + i * 80,
        start,
      );
      if (kind === "merge")
        o.frequency.exponentialRampToValueAtTime(440 + i * 110, start + 1.1);
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.024, start + 0.08 + i * 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 1.8);
      o.connect(g);
      g.connect(this.master!);
      o.start(start);
      o.stop(start + 2);
    });
  }
  dispose() {
    this.drones.forEach((o) => o.stop());
    void this.ctx?.close();
  }
}
