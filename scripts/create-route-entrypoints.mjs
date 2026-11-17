import { copyFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

// GitHub Pages has no SPA rewrite. Generate real HTML entry points for deep links.
for (const route of ['download', 'support', 'privacy', 'changelog', 'beta', 'admin', 'confirmemail', 'recoverpassword', 'resetpassword']) {
  mkdirSync(join('dist', route), { recursive: true })
  copyFileSync(join('dist', 'index.html'), join('dist', route, 'index.html'))
}
