import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script} from "node:vm";
test("VapeCalc PWA is scoped and icon-backed",()=>{
 const manifest=JSON.parse(readFileSync("apps/vape-calculator/public/manifest.webmanifest","utf8"));
 const html=readFileSync("apps/vape-calculator/index.html","utf8");
 assert.equal(manifest.scope,"/vape-calculator/");assert.equal(manifest.start_url,"/vape-calculator/");
 assert.equal(manifest.icons.length,2);
 assert.ok(manifest.icons.some(i=>i.sizes==="192x192"));
 assert.ok(manifest.icons.some(i=>i.sizes==="512x512"));
 assert.ok(html.includes('rel="manifest"'));
 for(const icon of manifest.icons){const bytes=readFileSync("apps/vape-calculator/public"+icon.src.slice("/vape-calculator".length));assert.ok(bytes.byteLength>100);assert.equal(bytes.subarray(1,4).toString(),"PNG");}
});
test("offline worker never caches Supabase, users or other projects",()=>{
 const sw=readFileSync("apps/vape-calculator/public/sw.js","utf8");
 assert.doesNotThrow(()=>new Script(sw), "Offline JavaScript must parse before merge");
 assert.ok(sw.includes("url.origin!==self.location.origin"));
 assert.ok(sw.includes('url.pathname.startsWith(ROOT+"account/")'));
 assert.ok(sw.includes("offline-assets.json"));
 assert.ok(!sw.includes("supabase.co"));
 assert.ok(sw.includes('url.pathname.startsWith(ROOT+"account/")'));
 assert.ok(sw.includes('if(!shell&&!isPublicAsset(url.pathname))return;'));
 assert.ok(sw.includes('isBundle(path)'));
});
