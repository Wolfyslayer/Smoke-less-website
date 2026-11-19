import test from 'node:test'
import assert from 'node:assert/strict'
import {BUCKET,recipePath} from '../src/lib/cloudRecipePaths.js'
const u='00112233-4455-6677-8899-aabbccddeeff'
const r='aaaa1111-bbbb-2222-cccc-333344445555'
test('recipes use the private user-specific storage bucket',()=>{
  assert.equal(BUCKET,'vape-recipes')
  assert.equal(recipePath(u,r),u+'/'+r+'.json')
})
test('invalid user ids, recipe ids, and traversal are rejected',()=>{
  assert.throws(()=>recipePath('../someone',r))
  assert.throws(()=>recipePath(u,'../secret'))
  assert.throws(()=>recipePath('some-other-user',r))
  assert.throws(()=>recipePath(u,'x.json'))
})
