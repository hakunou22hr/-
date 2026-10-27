import { readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const root = process.cwd()
const materialPages = Object.fromEntries(
  readdirSync(resolve(root, 'materials'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => [`material-${entry.name}`, resolve(root, 'materials', entry.name, 'index.html')]),
)

const appPages = {
  'app-courtside-scorebook': resolve(root, 'apps', 'courtside-scorebook', 'index.html'),
}

export default defineConfig({
  plugins: [react(), {
    name: 'archive-old-riemann-films',
    apply: 'build',
    closeBundle() {
      // Keep the original files in Git; the lesson links to their immutable
      // GitHub copies so all current lessons fit within Pages' size limit.
      for (const file of ['riemann-integral-120s-pc.mp4', 'riemann-integral-120s-reference.mp4', 'riemann-integral-30s-instagram.mp4', 'riemann-integral-30s-reference.mp4']) {
        rmSync(resolve(root, 'dist/media', file), { force: true })
      }
    },
  }],
  base: './',
  build: {
    rollupOptions: {
      input: { portal: resolve(root, 'index.html'), ...materialPages, ...appPages,
        'trig-cinema-video': resolve(root, 'materials/trig-integral-cinema/video.html'),
        'moving-line-render': resolve(root, 'materials/moving-line-cinema/render.html'),
        'two-paths-render': resolve(root, 'materials/two-paths/render.html'),
      },
    },
  },
})
