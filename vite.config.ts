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
        'radian-cinema-preview': resolve(root, 'materials/birth-of-radian/verification/cinema/index.html'),
        'radian-cinema-render': resolve(root, 'materials/birth-of-radian/cinema.html'),
        'radian-legacy': resolve(root, 'materials/birth-of-radian/legacy.html'),
        'radian-reference-film': resolve(root, 'materials/birth-of-radian/reference.html'),
        'integral-solid-preserved-lesson': resolve(root, 'materials/integral-solid-cinema/lesson-original.html'),
        'integral-solid-classroom-film': resolve(root, 'materials/integral-solid-cinema/cinema.html'),
        'trig-cinema-video': resolve(root, 'materials/trig-integral-cinema/video.html'),
        'moving-line-reels': resolve(root, 'materials/moving-line-cinema/reels.html'),
        'moving-line-reels-render': resolve(root, 'materials/moving-line-cinema/reels-render.html'),
        'moving-line-render': resolve(root, 'materials/moving-line-cinema/render.html'),
        'two-paths-render': resolve(root, 'materials/two-paths/render.html'),
      },
    },
  },
})
