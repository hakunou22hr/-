import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { once } from 'node:events'
let browser
const errors = []
const encoder = spawn('ffmpeg', [
  '-v',
  'error',
  '-y',
  '-f',
  'image2pipe',
  '-framerate',
  '30',
  '-vcodec',
  'mjpeg',
  '-i',
  'pipe:0',
  '-i',
  'public/media/birth-of-e-narration.m4a',
  '-map',
  '0:v',
  '-map',
  '1:a',
  '-c:v',
  'libx264',
  '-preset',
  'fast',
  '-crf',
  '20',
  '-vf',
  'scale=in_range=pc:out_range=tv:out_color_matrix=bt709',
  '-pix_fmt',
  'yuv420p',
  '-color_range',
  'tv',
  '-colorspace',
  'bt709',
  '-color_primaries',
  'bt709',
  '-color_trc',
  'bt709',
  '-c:a',
  'aac',
  '-b:a',
  '128k',
  '-t',
  '90',
  '-movflags',
  '+faststart',
  'public/media/birth-of-e-90s.mp4',
])
encoder.stderr.on('data', (d) => process.stderr.write(d))
process.on('SIGINT', async () => {
  encoder.kill()
  await browser?.close()
  process.exit(130)
})
try {
  for (let start = 0; start < 2700; start += 30) {
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
      headless: true,
      args: [
        '--no-sandbox',
        '--enable-unsafe-swiftshader',
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--disable-dev-shm-usage',
      ],
    })
    const page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
    })
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto(
      (process.env.BIRTH_E_URL || 'http://127.0.0.1:5173/materials/birth-of-e/') + '?render',
    )
    await page.waitForFunction(() => window.__birthReady)
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(300)
    const cdp = await page.context().newCDPSession(page)
    for (let f = start; f < Math.min(start + 30, 2700); f++) {
      await page.evaluate((time) => window.__renderAt(time), f / 30)

      const { data } = await cdp.send('Page.captureScreenshot', {
        format: 'jpeg',
        quality: 92,
        fromSurface: false,
        captureBeyondViewport: false,
      })
      const buffer = Buffer.from(data, 'base64')

      if (!encoder.stdin.write(buffer)) await once(encoder.stdin, 'drain')
    }
    await browser.close()
    console.log(JSON.stringify({ frame: start + 30, total: 2700, errors }))
  }
  encoder.stdin.end()
  const [code] = await once(encoder, 'close')
  if (code !== 0 || errors.length) throw new Error(JSON.stringify({ code, errors }))
  console.log('RENDER COMPLETE')
} catch (error) {
  encoder.kill()
  await browser?.close()
  throw error
}
