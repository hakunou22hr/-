/** Performance and lighting settings for the real-time cinematic layer. */
export const cinema = {
  wallSections: 10,
  wallBrightness: 1.8,
  particleCount: 4200,
  waveRows: 25,
  waveSamples: 150,
  bloom: { strength: 1.15, radius: 0.65, threshold: 0.72 },
  maxDpr: 1.25,
  morph: { split: 1.2, scatter: 3.2, assemble: 6.8, hold: 8.0 },
} as const;
