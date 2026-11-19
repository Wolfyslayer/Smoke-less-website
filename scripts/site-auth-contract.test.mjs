import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const read = p => readFileSync(p,'utf8')
test('account routes exist and Supabase browser auth uses only publishable credentials',()=>{
  const main=read('src/main.tsx')
  const client=read('src/auth/client.ts')
  const bundle=read('scripts/bundle-multi-site.mjs')
  for(const route of ['account','confirmemail','recoverpassword']){
    assert.ok(main.includes("'"+'/'+route+"'"),'Missing browser route '+route)
    assert.ok(bundle.includes("'"+route+"'"),'Missing static route '+route)
  }
  assert.ok(client.includes('sb_publishable_'))
  assert.ok(!client.includes('service'+'_'+ 'role'))
})
test('password and email callback use one-time token exchange and remove token from URL',()=>{
  const callback=read('src/auth/AuthCallbackPage.tsx')
  assert.ok(callback.includes('verifyOtp'))
  assert.ok(callback.includes('history.replaceState'))
  assert.ok(callback.includes('verification.current'))
})
test('private recipe bucket uses per-user path checks on every operation',()=>{
  const sql=read('supabase/migrations/202611190001_private_vape_recipe_bucket.sql')
  const cloud=read('apps/vape-calculator/src/lib/cloudRecipes.js')
  assert.ok(sql.includes("'vape-recipes',false"))
  for(const action of ['select','insert','update','delete'])assert.ok(sql.includes('for '+action+' to authenticated'))
  assert.ok((sql.match(/storage\.foldername\(name\)/g)||[]).length>=5)
  assert.ok(sql.includes('(select auth.uid())'))
  assert.ok(cloud.includes('requireAuthenticatedUser'))
  assert.ok(cloud.includes('recipePath'))
})
