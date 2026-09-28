import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8')
const script = readFileSync(new URL('./script.js', import.meta.url), 'utf8')

describe('cos-sin extrema production entry', () => {
  it('loads the lesson script as a Vite module entry', () => {
    expect(html).toContain('<script type="module" src="./script.js"></script>')
    expect(html).not.toMatch(/<script\s+src=["']script\.js["']/)
  })

  it('keeps the required interactive controls wired to the lesson script', () => {
    for (const id of ['intro', 'graph', 'derive', 'sign', 'table', 'space', 'summary']) {
      expect(html).toContain(`data-tab="${id}"`)
    }

    expect(script).toContain("addEventListener('click',()=>switchTab")
    expect(script).toContain("addEventListener('input'")
    expect(script).toContain("dataset.lessonReady='true'")
  })
})
