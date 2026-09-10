import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const root = process.cwd()
const materialPages = Object.fromEntries(
  readdirSync(resolve(root, 'materials'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => [`material-${entry.name}`, resolve(root, 'materials', entry.name, 'index.html')]),
)

export default defineConfig({
  plugins: [react()],
  base: './',
  build: { rollupOptions: { input: { portal: resolve(root, 'index.html'), ...materialPages } } },
})
