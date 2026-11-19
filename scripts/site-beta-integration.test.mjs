import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read=path=>readFileSync(path,'utf8')

test('Smoke Less owns the beta/admin route, with real static Pages entrypoints',()=>{
  const main=read('src/main.tsx')
  const bundle=read('scripts/bundle-multi-site.mjs')
  for(const path of ['/smoke-less/admin','/smoke-less/beta','/smoke-less/account']){
    assert.ok(main.includes(path), 'No route for '+path)
    assert.ok(bundle.includes(path.slice(1)), 'No HTML entrypoint for '+path)
  }
  assert.ok(main.includes("path === '/admin' ? '/smoke-less/admin/'"),'Legacy admin bookmark not redirected')
  assert.ok(main.includes('adminPage ? <BetaPortal adminOnly/>'),'Admin page must have admin-only mode')
  const nav=read('src/SiteNavigation.tsx')
  assert.ok(nav.includes("href:'/smoke-less/account/'"),'Smoke account must retain Smoke context')
  assert.ok(!read('src/Hub.tsx').includes('/smoke-less/admin/'),'Hub must never advertise administration')
})

test('same Supabase client protects Smoke admin and Vape recipes; users cannot self-assign admin',()=>{
  const beta=read('src/beta/client.ts')
  const auth=read('src/auth/client.ts')
  const vape=read('apps/vape-calculator/src/lib/supabaseClient.js')
  assert.ok(beta.includes("export { supabase } from '../auth/client'"))
  assert.ok(auth.includes('twbwxvtazortlxzxdvtt.supabase.co'))
  assert.ok(vape.includes('twbwxvtazortlxzxdvtt.supabase.co'))
  const admin=read('src/beta/BetaPortal.tsx')
  assert.ok(admin.includes("supabase.from('beta_admins')") || read('src/beta/useBetaAccess.ts').includes("supabase.from('beta_admins')"))
  assert.ok(admin.includes('!access.admin'),'Admin UI cannot appear without verified role')
  const schema=read('supabase/migrations/202611170001_beta_portal.sql')
  const lock=read('supabase/migrations/202611170002_release_lock.sql')
  assert.ok(schema.includes('enable row level security'))
  assert.ok(schema.includes('auth.uid()'))
  assert.ok(lock.includes('beta_release_lock'))
  assert.ok(!admin.includes('createSignedUrl('),'Beta preview must not expose unauthorised APKs')
})

test('account login retains only allowlisted on-site return destination',()=>{
  const page=read('src/auth/AccountPage.tsx')
  const validator=read('src/auth/returnTo.ts')
  const recipe=read('apps/vape-calculator/src/pages/Recipes.jsx')
  assert.ok(page.includes('safeReturnTo('))
  assert.ok(page.includes('data.user&&returnTo'))
  assert.ok(page.includes('window.location.assign(returnTo)'))
  assert.ok(validator.includes("value.startsWith('//')"))
  assert.ok(validator.includes("'/vape-calculator/'"))
  assert.ok(recipe.includes('encodeURIComponent("/vape-calculator/#/recipes")'))
  assert.ok(page.includes('isSmoke&&<BetaAccountStatus/>'))
})

test('central account verification supersedes duplicated beta login and reset screens',()=>{
  const main=read('src/main.tsx')
  const callback=read('src/auth/AuthCallbackPage.tsx')
  assert.ok(main.includes('<AuthCallbackPage purpose="recovery"/>'))
  assert.ok(main.includes("path === '/resetpassword' ? '/recoverpassword/'"))
  assert.ok(callback.includes('verifyOtp'))
  assert.ok(callback.includes('safeReturnTo('))
})

test('project drawers keep navigation local, remove numbering and put All projects in the footer',()=>{
  const nav=read('src/SiteNavigation.tsx')
  const smoke=nav.split('const smokeItems: NavItem[] = [')[1].split('const hubItems:')[0]
  const vape=nav.split('const vapeItems:NavItem[] = [')[1].split('export function SiteNavigation')[0]
  assert.ok(!smoke.includes("href:'/vape-calculator/'"))
  assert.ok(!smoke.includes("labelSv:'Alla projekt'"))
  assert.ok(smoke.includes("href:'/smoke-less/beta/'"))
  assert.ok(vape.includes("href:'/vape-calculator/account/'"))
  assert.ok(!vape.includes("href:'/smoke-less/'"))
  assert.ok(!nav.includes('wolf-link-number'))
  assert.ok(nav.includes('className="wolf-drawer-projects"'))
  const vapeNav=read('apps/vape-calculator/src/components/Navigation.jsx')
  assert.ok(vapeNav.includes('drawer-projects-link'))
  assert.ok(!vapeNav.includes('<a className="drawer-back" href={accountHref}>'))
})
test('Vape Calculator account uses its own route while sharing Supabase auth',()=>{
  const main=read('src/main.tsx')
  const account=read('src/auth/AccountPage.tsx')
  const bundle=read('scripts/bundle-multi-site.mjs')
  assert.ok(main.includes("path === '/vape-calculator/account'"))
  assert.ok(main.includes('<AccountPage section="vape" />'))
  assert.ok(account.includes("const isVape=section==='vape'"))
  assert.ok(account.includes("import { supabase } from './client'"))
  assert.ok(bundle.includes("'vape-calculator/account/index.html'"))
  for(const path of ['apps/vape-calculator/src/components/Navigation.jsx','apps/vape-calculator/src/App.jsx','apps/vape-calculator/src/pages/Recipes.jsx']){
    assert.ok(read(path).includes('/vape-calculator/account/?returnTo='),'Old account route in '+path)
  }
  assert.ok(read('src/auth/AuthCallbackPage.tsx').includes('accountHome'))
})
