import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const errors = []
const assert = (condition, message) => { if (!condition) errors.push(message) }
const html = read('dist/index.html')
const robots = read('dist/robots.txt')
const sitemap = read('dist/sitemap.xml')
const manifest = JSON.parse(read('dist/updates/preview.json'))

assert(html.includes('lang="sv"'), 'Missing Swedish document language')
assert(html.includes('rel="canonical" href="https://wolfyslayer.online/"'), 'Missing canonical URL')
assert(html.includes('application/ld+json'), 'Missing software structured data')
assert(html.includes('name="description"'), 'Missing SEO description')
assert(robots.includes('Sitemap: https://wolfyslayer.online/sitemap.xml'), 'Missing sitemap discovery')
assert(sitemap.includes('<loc>https://wolfyslayer.online/</loc>'), 'Missing homepage in sitemap')
assert(existsSync(join(root, 'dist/icon.svg')), 'Missing favicon')
assert(existsSync(join(root, 'dist/nordic-landscape.svg')), 'Missing Nordic landscape asset')
assert(html.includes('name="viewport"'), 'Missing mobile viewport')
assert(html.includes('property="og:title"'), 'Missing social sharing title')
assert(html.includes('name="twitter:card"'), 'Missing Twitter card metadata')
assert(html.includes('name="theme-color"'), 'Missing Android browser theme color')
const appSource = read('src/App.tsx')
assert(appSource.includes('pageTitles[location.pathname]'), 'Missing route-specific document titles')
assert(appSource.includes('main.focus({preventScroll:true})'), 'Missing keyboard focus on route navigation')
const navSource = read('src/components/ResponsiveHeader.tsx')
assert(navSource.includes('aria-label={labels.nav}') && navSource.includes("nav: 'Huvudmeny'"), 'Missing accessible navigation landmark and Swedish label')
assert(appSource.includes("t('Välj appskärm','Choose app screen')"), 'Missing translated preview control label')
assert(appSource.includes('Denna sida är ännu inte en fullständig integritetspolicy.'), 'Missing explicit privacy launch caveat')
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
  console.log('PASS: SEO, accessibility smoke checks, mobile assets and Preview release gates')
}
