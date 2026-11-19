import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
const root = resolve(import.meta.dirname, '..')
const calculator = resolve(root, 'apps/vape')
const exe = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const processResult = spawnSync(exe, ['run', 'build'], { cwd: calculator, env: { ...process.env, GITHUB_PAGES: 'true' }, stdio: 'inherit', shell: process.platform === 'win32' })
if (processResult.error) throw processResult.error
if (processResult.status !== 0) process.exit(processResult.status || 1)
const src = resolve(calculator, 'dist')
if (!existsSync(resolve(src, 'index.html'))) throw new Error('Calculator build missing index.html')
const dst = resolve(root, 'dist/vape-calculator')
rmSync(dst, { recursive: true, force: true })
mkdirSync(dst, { recursive: true })
cpSync(src, dst, { recursive: true })
console.log('Vape Calculator staged in dist/vape-calculator')
