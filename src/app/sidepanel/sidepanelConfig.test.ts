import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('side panel extension wiring', () => {
  it('declares Chrome side panel permission and default path', () => {
    const manifestPath = path.resolve(process.cwd(), 'public', 'manifest.json')
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

    expect(manifest.permissions).toContain('sidePanel')
    expect(manifest.side_panel).toEqual({ default_path: 'sidepanel.html' })
  })

  it('has a sidepanel HTML entry that loads the sidepanel React app', () => {
    const htmlPath = path.resolve(process.cwd(), 'sidepanel.html')
    const html = fs.readFileSync(htmlPath, 'utf8')

    expect(html).toContain('<div id="root"></div>')
    expect(html).toContain('/src/app/sidepanel/main.tsx')
  })

  it('includes sidepanel.html in the Vite multi-entry build', () => {
    const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts')
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8')

    expect(viteConfig).toContain("sidepanel: path.resolve(__dirname, 'sidepanel.html')")
  })
})
