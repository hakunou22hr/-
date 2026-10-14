/** Edit of the preserved 90-second edition; source scene timings stay intact. */
export const SHORT_DURATION = 30;
export const shortTimeline = [
  { id: 1, start: 0, end: 1.5, sourceStart: 0, sourceEnd: 8 },
  { id: 2, start: 1.5, end: 3.5, sourceStart: 8, sourceEnd: 18 },
  { id: 3, start: 3.5, end: 5, sourceStart: 18, sourceEnd: 30 },
  { id: 4, start: 5, end: 10, sourceStart: 30, sourceEnd: 42 },
  { id: 5, start: 10, end: 12, sourceStart: 42, sourceEnd: 54 },
  { id: 6, start: 12, end: 16, sourceStart: 54, sourceEnd: 64 },
  { id: 7, start: 16, end: 18, sourceStart: 64, sourceEnd: 72 },
  { id: 8, start: 18, end: 23, sourceStart: 72, sourceEnd: 84 },
  { id: 9, start: 23, end: 27, sourceStart: 84, sourceEnd: 88 },
  { id: 10, start: 27, end: 30, sourceStart: 88, sourceEnd: 90 },
] as const;
export function sourceTimeAt(time: number) {
  const t = Math.max(0, Math.min(SHORT_DURATION, time));
  const segment = shortTimeline.find((s) => t >= s.start && t < s.end) ?? shortTimeline[9];
  return segment.sourceStart + (t - segment.start) / (segment.end - segment.start) * (segment.sourceEnd - segment.sourceStart);
}
