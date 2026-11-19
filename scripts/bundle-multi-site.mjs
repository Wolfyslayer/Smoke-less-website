import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const original = await readFile(resolve(dist, 'index.html'), 'utf8')

// GitHub Pages serves the dedicated path without server rewrites.
// Both entrypoints load the same root-bundled Smoke Less + hub React app.
const smoke = original
  .replace('<title>Wolfyslayer – Projekt &amp; verktyg</title>', '<title>Smoke Less – Små steg. Stor förändring.</title>')
  .replace('href="/hub-icon.svg"', 'href="/icon.svg"')
  .replace('Wolfyslayer samlar digitala projekt och appar. Utforska Smoke Less och Vape Calculator från en och samma startsida.', 'Smoke Less för Android: dagsmål, statistik och SOS-stöd. Preview under utveckling.')
  .replaceAll('https://wolfyslayer.online/', 'https://wolfyslayer.online/smoke-less/')
  .replace('Wolfyslayer – Projekt &amp; verktyg', 'Smoke Less – Små steg. Stor förändring.')
  .replace('{"@context":"https://schema.org","@type":"WebSite","name":"Wolfyslayer","url":"https://wolfyslayer.online/smoke-less/","inLanguage":["sv","en"]}', '{"@context":"https://schema.org","@type":"SoftwareApplication","name":"Smoke Less","url":"https://wolfyslayer.online/smoke-less/","applicationCategory":"HealthApplication","operatingSystem":"Android","inLanguage":["sv","en"]}')
await mkdir(resolve(dist, 'smoke-less'), {recursive:true})
await writeFile(resolve(dist, 'smoke-less', 'index.html'), smoke)

// Separate static entrypoints: GitHub Pages has no SPA rewrite. Auth links use
// clean /account/, /confirmemail/, and /recoverpassword/ routes.
for (const [route, title] of [
  ['account', 'Mitt konto – Wolfyslayer'],
  ['smoke-less/account', 'Mitt konto – Smoke Less'],
  ['vape-calculator/account', 'Mitt konto – Vape Calculator'],
  ['smoke-less/beta', 'Betaprogram – Smoke Less'],
  ['smoke-less/admin', 'Administration – Smoke Less'],
  ['admin', 'Flyttad till Smoke Less-administration'],
  ['beta', 'Flyttad till Smoke Less betaprogram'],
  ['resetpassword', 'Flyttad till lösenordsåterställning'],
  ['confirmemail', 'Bekräfta e-post – Wolfyslayer'],
  ['recoverpassword', 'Återställ lösenord – Wolfyslayer'],
]) {
  const html = original
    .replace('href="https://wolfyslayer.online/"', 'href="https://wolfyslayer.online/' + route + '/"')
    .replace('content="index,follow"', 'content="noindex,nofollow"')
    .replace('<title>Wolfyslayer – Projekt &amp; verktyg</title>', '<title>' + title + '</title>')
  await mkdir(resolve(dist, route), {recursive:true})
  await writeFile(resolve(dist, route, 'index.html'), html)
}

const mirror = resolve(root, 'apps/vape-calculator')
await access(resolve(mirror, 'index.html'))
execFileSync(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), 'build', '--config', resolve(mirror, 'vite.config.js')], {cwd:root,stdio:'inherit'})

// A single Pages deployment publishes the hub, Smoke Less and Vape Calculator.
for (const path of ['index.html', 'smoke-less/index.html', 'vape-calculator/index.html', 'updates/preview.json', 'account/index.html', 'smoke-less/account/index.html', 'vape-calculator/account/index.html', 'smoke-less/beta/index.html', 'smoke-less/admin/index.html', 'admin/index.html', 'beta/index.html', 'resetpassword/index.html', 'confirmemail/index.html', 'recoverpassword/index.html']) {
  await access(resolve(dist,path))
}
console.log('PASS: three static sites + unchanged preview manifest bundled into one Pages deployment')
