import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { spawn, execFileSync } from "node:child_process";
import { once } from "node:events";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const edition = process.env.CINEMA_EDITION || "short";
const profiles = {
  short: { width: 1920, height: 1080, duration: 30, query: "30", filename: "trig-integral-cinema-30s.mp4" },
  instagram: { width: 1080, height: 1920, duration: 30, query: "instagram", filename: "trig-integral-cinema-instagram-30s.mp4" },
  lesson: { width: 1920, height: 1080, duration: 90, query: "90", filename: "trig-integral-cinema-90s.mp4" },
};
const profile = profiles[edition];
if (!profile) throw new Error(`Unknown edition: ${edition}`);
const output = resolve(process.env.CINEMA_OUTPUT || `work/trig-cinema-${edition}`);
const url = process.env.CINEMA_URL || "http://127.0.0.1:4173/";
const frameCount = Number(process.env.CINEMA_RENDER_FRAMES || profile.duration * 30);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--disable-background-timer-throttling"],
});
let encoder;
try {
  const page = await browser.newPage({ viewport: { width: profile.width, height: profile.height }, deviceScaleFactor: 1 });
  const cdp = await page.context().newCDPSession(page);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  await page.clock.install({ time: new Date("2026-10-15T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-15T00:00:00Z"));
  const location = new URL(url);
  location.searchParams.set("edition", profile.query);
  location.searchParams.set("render", "1");
  await page.goto(location.href, { waitUntil: "networkidle" });
  await page.waitForFunction(() => Boolean(window.cinemaRender), null, { polling: 100 });
  await page.evaluate(() => document.fonts.ready);
  await page.clock.runFor(1000);
  if (await page.locator(".fallback-stars").count()) throw new Error("WebGL fallback: the original cinematic layer did not render");
  if (!await page.locator("canvas").count()) throw new Error("Missing original WebGL canvas");
  const wav = await page.evaluate(() => window.cinemaRender.audio());
  await writeFile(resolve(output, "soundtrack.wav"), Buffer.from(wav, "base64"));
  const videoPath = resolve(output, profile.filename);
  const encoderArgs = ["-hide_banner", "-loglevel", "warning", "-y", "-f", "image2pipe", "-vcodec", "mjpeg", "-framerate", "30", "-i", "pipe:0", "-i", resolve(output, "soundtrack.wav"), "-map", "0:v:0", "-map", "1:a:0", "-vf", "scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-profile:v", "high", "-level:v", "4.1", "-threads", "4", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", String(frameCount / 30), "-movflags", "+faststart", videoPath];
  encoder = spawn("ffmpeg", encoderArgs, { stdio: ["pipe", "ignore", "pipe"] });
  let encoderLog = "";
  encoder.stderr.on("data", (chunk) => { encoderLog = (encoderLog + chunk).slice(-6000); });
  const encoderExit = once(encoder, "close");
  const started = Date.now();
  const layoutChecks = [];
  const sampleFrames = new Set(edition === "lesson" ? [0, 240, 540, 990, 1200, 1500, 1800, 2100, 2280, 2520, 2670] : [0, 90, 180, 210, 270, 330, 450, 510, 570, 600, 660, 780, 870]);
  for (let frame = 0; frame < frameCount; frame++) {
    const filmTime = frame / 30;
    await page.evaluate((time) => window.cinemaRender.frame(time), filmTime);
    await page.clock.runFor(1000 / 30);
    for (let attempt = 0; attempt < 8; attempt++) {
      const ready = await page.evaluate(() => window.cinemaFrameRendered === Number(document.querySelector("main").dataset.sourceTime));
      if (ready) break;
      await page.clock.runFor(1000 / 60);
      if (attempt === 7) throw new Error(`WebGL did not finish frame ${frame}: ${JSON.stringify(await page.evaluate(() => ({ rendered: window.cinemaFrameRendered, requested: document.querySelector("main").dataset.sourceTime })))}`);
    }
    await page.evaluate((time) => {
      for (const animation of document.getAnimations()) {
        if (animation instanceof CSSAnimation) {
          animation.pause();
          animation.currentTime = time * 1000;
        }
      }
    }, filmTime);
    if (edition === "instagram") {
      const layout = await page.evaluate(() => {
        const safe = { left: innerWidth * .06, right: innerWidth * .82, top: innerHeight * .14, bottom: innerHeight * .75 };
        function visible(el) {
          for (let e = el; e; e = e.parentElement) {
            const s = getComputedStyle(e);
            if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) < .05) return false;
          }
          return el.getBoundingClientRect().width > 0;
        }
        const rects = [...document.querySelectorAll(".scene-body .katex-html,.subtitle-overlay p,.scene-label,.ending-title h1,.ending-title > span")].filter(visible).map((e) => {
          const r = e.getBoundingClientRect();
          return { text: e.textContent, left: r.left, right: r.right, top: r.top, bottom: r.bottom };
        });
        const outside = rects.filter((r) => r.left < safe.left - 2 || r.right > safe.right + 2 || r.top < safe.top - 2 || r.bottom > safe.bottom + 2);
        const graphs = [...document.querySelectorAll(".graph svg")].filter(visible).map((e) => e.getBoundingClientRect());
        const intersects = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        const graphOverlap = graphs.flatMap((g) => rects.filter((r) => intersects(g, r)).map((r) => r.text));
        const wave = window.cinemaWaveBounds;
        const outsideWave = Boolean(wave && (wave.left < safe.left - 2 || wave.right > safe.right + 2 || wave.top < safe.top - 2 || wave.bottom > safe.bottom + 2));
        const waveOverlap = wave ? rects.filter((r) => intersects(wave, r)).map((r) => r.text) : [];
        const waveGraphOverlap = Boolean(wave && graphs.some((g) => intersects(wave, g)));
        return { outside, graphOverlap, waveOverlap, waveGraphOverlap, outsideWave };
      });
      layoutChecks.push({ frame, ...layout });
      if (layout.outside.length || layout.graphOverlap.length || layout.waveOverlap.length || layout.waveGraphOverlap || layout.outsideWave) {
        await writeFile(resolve(output, "layout-validation.json"), JSON.stringify(layoutChecks, null, 2));
        throw new Error(`Instagram safe-area/graph overlap at frame ${frame}: ${JSON.stringify(layout)}`);
      }
    }
    const shot = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 95, fromSurface: true, captureBeyondViewport: false });
    const jpeg = Buffer.from(shot.data, "base64");
    if (sampleFrames.has(frame)) await writeFile(resolve(output, `sample-${String(frame).padStart(4, "0")}.jpg`), jpeg);
    if (!encoder.stdin.write(jpeg)) await once(encoder.stdin, "drain");
    if (frame % 30 === 0) console.log(`Frame ${frame}/${frameCount}, film ${filmTime.toFixed(1)}s, elapsed ${((Date.now() - started) / 1000).toFixed(1)}s`);
    if (errors.length) throw new Error(errors.join("\n"));
  }
  encoder.stdin.end();
  const [code] = await encoderExit;
  if (code !== 0) throw new Error(`ffmpeg exit ${code}: ${encoderLog}`);
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", videoPath], { encoding: "utf8" }));
  const video = probe.streams.find((s) => s.codec_type === "video");
  const audio = probe.streams.find((s) => s.codec_type === "audio");
  if (video.width !== profile.width || video.height !== profile.height || video.avg_frame_rate !== "30/1" || Number(video.nb_read_frames) !== frameCount) throw new Error("Unexpected video size/rate/frame count");
  if (video.codec_name !== "h264" || video.pix_fmt !== "yuv420p" || audio?.codec_name !== "aac") throw new Error("Unexpected compatibility codecs");
  if (Math.abs(Number(probe.format.duration) - frameCount / 30) > 0.05) throw new Error("Unexpected MP4 duration");
  execFileSync("ffmpeg", ["-v", "error", "-i", videoPath, "-f", "null", "-"]);
  await writeFile(resolve(output, "ffprobe.json"), JSON.stringify(probe, null, 2) + "\n");
  if (layoutChecks.length) await writeFile(resolve(output, "layout-validation.json"), JSON.stringify({ checkedFrames: layoutChecks.length, passed: true }, null, 2) + "\n");
  console.log(`Verified ${videoPath}: ${probe.format.duration}s, ${video.nb_read_frames} frames, H.264/AAC`);
} finally {
  if (encoder && encoder.exitCode === null) encoder.kill();
  await browser.close();
}
