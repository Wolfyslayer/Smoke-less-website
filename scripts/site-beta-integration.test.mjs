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
