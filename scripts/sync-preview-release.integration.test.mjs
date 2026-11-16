import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {mkdtemp,mkdir,writeFile,readFile,unlink,rmdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const script=pathToFileURL(resolve('scripts/sync-preview-release.mjs')).href;
for(const corrupt of [false,true])test(`isolated download ${corrupt?'rejects changed APK without modifying website manifest':'writes matching app/web metadata after verifying APK bytes'}`,async()=>{
 const apk=process.env.SMOKELESS_TEST_APK?await readFile(process.env.SMOKELESS_TEST_APK):Buffer.alloc(1500,7);
 const sha=createHash('sha256').update(apk).digest('hex'),base='https://github.com/Wolfyslayer/Smoke-less-app/releases/download/preview-build-3/';
 const manifest={schemaVersion:2,platform:'android',channel:'preview',applicationId:'com.smokeless.app.preview',projectId:'d5fcc1ea-eec7-440e-b3b9-ac3f37febd9f',version:'6.0.0',build:3,runtime:'test-runtime',apkUrl:base+'SmokeLess-Preview-3.apk',sha256:sha,certificateSha256:'b'.repeat(64),publishedAt:'2026-11-16T00:00:00.000Z',releaseNotes:'Synthetic release fixture; not published'};
 const web={available:true,version:manifest.version,versionCode:3,runtimeVersion:manifest.runtime,packageName:manifest.applicationId,downloadUrl:manifest.apkUrl,sha256:sha,certificateSha256:manifest.certificateSha256,publishedAt:manifest.publishedAt,releaseNotes:manifest.releaseNotes};
 const release={draft:false,prerelease:true,tag_name:'preview-build-3',assets:[{name:'preview.json',state:'uploaded',browser_download_url:base+'preview.json'},{name:'website-preview.json',state:'uploaded',browser_download_url:base+'website-preview.json'},{name:'SmokeLess-Preview-3.apk',state:'uploaded',browser_download_url:manifest.apkUrl,digest:`sha256:${sha}`} ]};
 const dir=await mkdtemp(join(tmpdir(),'smokeless-web-integration-')),originalCwd=process.cwd(),originalArgs=process.argv,originalFetch=globalThis.fetch;
 const target=join(dir,'public','updates','preview.json'),previous=JSON.stringify({available:false,downloadUrl:null});
 await mkdir(join(dir,'public','updates'),{recursive:true});await writeFile(target,previous);
 try{
  process.chdir(dir);process.argv=[process.execPath,'sync-preview-release.mjs','preview-build-3',sha,'3'];
  globalThis.fetch=async url=>{
   let content;if(url==='https://api.github.com/repos/Wolfyslayer/Smoke-less-app/releases/tags/preview-build-3')content=JSON.stringify(release);else if(url===base+'preview.json')content=JSON.stringify(manifest);else if(url===base+'website-preview.json')content=JSON.stringify(web);else if(url===manifest.apkUrl)content=corrupt?Buffer.concat([apk,Buffer.from('tampered')]):apk;else assert.fail('Unexpected network request in isolated test');
   const response=new Response(content,{status:200,headers:{'content-length':String(Buffer.byteLength(content))}});Object.defineProperty(response,'url',{value:url});return response;
  };
  const run=()=>import(`${script}?fixture=${randomUUID()}`);
  if(corrupt){await assert.rejects(run,/checksum mismatch/);assert.equal(await readFile(target,'utf8'),previous);}else{await run();assert.deepEqual(JSON.parse(await readFile(target,'utf8')),web);}
 }finally{
  globalThis.fetch=originalFetch;process.argv=originalArgs;process.chdir(originalCwd);await unlink(target);await rmdir(join(dir,'public','updates'));await rmdir(join(dir,'public'));await rmdir(dir);
 }
});
