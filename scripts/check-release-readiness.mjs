import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const errors = []
const assert = (condition, message) => { if (!condition) errors.push(message) }
const hubHtml = read('dist/index.html')
const smokeHtml = read('dist/smoke-less/index.html')
const vapeHtml = read('dist/vape-calculator/index.html')
const accountHtml = read('dist/account/index.html')
const confirmHtml = read('dist/confirmemail/index.html')
const recoveryHtml = read('dist/recoverpassword/index.html')
const robots = read('dist/robots.txt')
const sitemap = read('dist/sitemap.xml')
const manifest = JSON.parse(read('dist/updates/preview.json'))

assert(hubHtml.includes('lang="en"'), 'Missing English default document language')
assert(hubHtml.includes('rel="canonical" href="https://wolfyslayer.online/"'), 'Missing hub canonical URL')
assert(smokeHtml.includes('rel="canonical" href="https://wolfyslayer.online/smoke-less/"'), 'Missing Smoke Less canonical URL')
assert(vapeHtml.includes('vape-calculator/assets/'), 'Calculator assets must use /vape-calculator/ base')
assert(accountHtml.includes('href="https://wolfyslayer.online/account/"'), 'Missing direct account route')
assert(confirmHtml.includes('href="https://wolfyslayer.online/confirmemail/"'), 'Missing email confirmation entrypoint')
assert(recoveryHtml.includes('href="https://wolfyslayer.online/recoverpassword/"'), 'Missing password recovery entrypoint')
assert(confirmHtml.includes('noindex,nofollow') && recoveryHtml.includes('noindex,nofollow'), 'Auth token entrypoints must not be indexed')
assert(hubHtml.includes('application/ld+json'), 'Missing hub structured data')
assert(smokeHtml.includes('"@type":"SoftwareApplication"'), 'Missing Smoke Less structured data')
assert(hubHtml.includes('name="description"'), 'Missing SEO description')
assert(robots.includes('Sitemap: https://wolfyslayer.online/sitemap.xml'), 'Missing sitemap discovery')
for (const route of ['/', '/smoke-less/', '/vape-calculator/']) {
  assert(sitemap.includes('<loc>https://wolfyslayer.online' + route + '</loc>'), 'Missing ' + route + ' in sitemap')
}
assert(existsSync(join(root, 'dist/icon.svg')), 'Missing favicon')
assert(existsSync(join(root, 'dist/nordic-landscape.svg')), 'Missing landscape asset')
assert(hubHtml.includes('name="viewport"'), 'Missing mobile viewport')
assert(hubHtml.includes('property="og:title"'), 'Missing sharing title')
assert(hubHtml.includes('name="twitter:card"'), 'Missing Twitter card')
assert(hubHtml.includes('name="theme-color"'), 'Missing mobile theme')
const appSource = read('src/App.tsx')
const navSource = read('src/SiteNavigation.tsx')
assert(appSource.includes('pageTitles[location.pathname]'), 'Missing route-specific document titles')
assert(appSource.includes('main.focus({preventScroll:true})'), 'Missing keyboard focus on Smoke Less route navigation')
assert(navSource.includes('Main menu') && navSource.includes('Huvudmeny'), 'Missing bilingual navigation landmark')
assert(navSource.includes('Escape') && navSource.includes('setOpen(false)'), 'Missing close-on-Escape / close-on-navigate')
assert(appSource.includes('Välj appskärm'), 'Missing app preview accessibility')
assert(appSource.includes('Denna sida är ännu inte en fullständig integritetspolicy.'), 'Missing privacy launch caveat')
assert(manifest.packageName === 'com.smokeless.app.preview', 'Unexpected Preview package name')
if (manifest.available === true) {
  assert(typeof manifest.version === 'string' && manifest.version.trim().length > 0, 'Missing version')
  assert(Number.isInteger(manifest.versionCode) && manifest.versionCode > 0, 'Invalid versionCode')
  assert(typeof manifest.sha256 === 'string' && /^[a-f0-9]{64}$/i.test(manifest.sha256), 'Invalid SHA-256')
  assert(typeof manifest.downloadUrl === 'string' && /^https:\/\/github\.com\/Wolfyslayer\/Smoke-less-app\/releases\/download\/[^/?#]+\/[^/?#]+\.apk$/i.test(manifest.downloadUrl), 'Invalid release URL')
} else {
  assert(manifest.available === false, 'Manifest availability must be explicitly false until verified')
  assert(manifest.downloadUrl == null, 'Unavailable release must not expose an APK link')
}
if (errors.length) {
  for (const error of errors) console.error('FAIL:', error)
  process.exitCode = 1
} else {
  console.log('PASS: hub, navigation, three routes, accessibility and Preview release gates')
}
