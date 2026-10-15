import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
const root = resolve(process.env.CINEMA_PARTS || "work/integral-review-v3-parts");
const output = resolve(process.env.CINEMA_OUTPUT || "work/integral-review-v3-lesson");
await mkdir(output, { recursive: true });
const parts = [];
for (let i = 0; i < 4; i++) {
  const path = resolve(root, `part-${i}`, `part-${i}.mp4`);
  const p = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", path], { encoding: "utf8" }));
  const v = p.streams.find((s) => s.codec_type === "video");
  if (Number(v.nb_frames) !== 675 || v.width !== 1920 || v.height !== 1080 || v.avg_frame_rate !== "30/1") throw new Error(`Invalid lesson segment ${i}`);
  parts.push(path);
}
const list = resolve(output, "parts.txt");
await writeFile(list, parts.map((path) => `file '${path.replaceAll("'", "'\\''")}'`).join("\n") + "\n");
const audio = resolve(root, "part-0", "soundtrack.wav");
const video = resolve(output, "integral-differentiation-cinema-90s.mp4");
// The picture is concatenated without another H.264 encode. The original full
// 90-second synth is encoded once, keeping sound continuous across part joins.
// Keep video PTS at zero instead of inheriting the unused segment AAC priming offset.
execFileSync("ffmpeg", ["-v", "warning", "-y", "-copyts", "-f", "concat", "-safe", "0", "-i", list, "-i", audio, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", "90", "-movflags", "+faststart", video], { stdio: "inherit" });
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", video], { encoding: "utf8" }));
const v = probe.streams.find((s) => s.codec_type === "video"), a = probe.streams.find((s) => s.codec_type === "audio");
await writeFile(resolve(output, "ffprobe.json"), JSON.stringify(probe, null, 2) + "\n");
if (Number(v.nb_read_frames) !== 2700 || v.width !== 1920 || v.height !== 1080 || v.avg_frame_rate !== "30/1" || v.pix_fmt !== "yuv420p" || v.codec_name !== "h264" || a.codec_name !== "aac" || Math.abs(Number(probe.format.duration) - 90) > .01) throw new Error(`Invalid assembled lesson MP4: ${JSON.stringify({ frames: v.nb_read_frames, fps: v.avg_frame_rate, videoDuration: v.duration, duration: probe.format.duration, pix_fmt: v.pix_fmt, codec: v.codec_name, audio: a.codec_name })}`);
execFileSync("ffmpeg", ["-v", "error", "-i", video, "-f", "null", "-"]);
await writeFile(resolve(output, "SHA256SUMS-lesson.txt"), `${createHash("sha256").update(await readFile(video)).digest("hex")}  integral-differentiation-cinema-90s.mp4\n`);
console.log(`Verified 90 seconds, 2700 frames: ${video}`);
