#!/usr/bin/env node
import {createHash} from 'node:crypto';
import {writeFile,readFile} from 'node:fs/promises';
import {verifiedWebsiteManifest} from './preview-release-contract.mjs';
const [tag,hash,build]=process.argv.slice(2),versionCode=Number(build),expectedHash=String(hash||'').toLowerCase();
if(!Number.isSafeInteger(versionCode)||versionCode<1||tag!==`preview-build-${versionCode}`||!/^[a-f0-9]{64}$/.test(expectedHash))throw Error('An approved Preview build tag, versionCode and SHA-256 are required');
async function download(url,limit){
 const response=await fetch(url,{headers:{Accept:'application/vnd.github+json','User-Agent':'smoke-less-website-preview-sync'},signal:AbortSignal.timeout(120000)});
 if(!response.ok)throw Error('Published release download unavailable');
 const final=new URL(response.url);if(final.protocol!=='https:'||!['api.github.com','github.com','release-assets.githubusercontent.com','objects.githubusercontent.com'].includes(final.hostname))throw Error('Unexpected release download destination');
 if(Number(response.headers.get('content-length'))>limit)throw Error('Release asset too large');
 let size=0;const chunks=[];for await(const chunk of response.body){size+=chunk.length;if(size>limit)throw Error('Release asset too large');chunks.push(chunk)}return Buffer.concat(chunks);
}
const release=JSON.parse(await download(`https://api.github.com/repos/Wolfyslayer/Smoke-less-app/releases/tags/${tag}`,1048576));
const base=`https://github.com/Wolfyslayer/Smoke-less-app/releases/download/${tag}/`;
const asset=(release.assets||[]).find(a=>a.name==='preview.json'&&a.state==='uploaded'&&a.browser_download_url===`${base}preview.json`);
if(!asset)throw Error('Verified app release manifest missing');
const candidate=JSON.parse(await download(asset.browser_download_url,16384));
const manifest=verifiedWebsiteManifest(candidate,release,expectedHash,versionCode);
const apk=await download(manifest.downloadUrl,250*1024*1024);
if(apk.length<1000||createHash('sha256').update(apk).digest('hex')!==expectedHash)throw Error('APK checksum mismatch');
const webAsset=(release.assets||[]).find(a=>a.name==='website-preview.json'&&a.state==='uploaded'&&a.browser_download_url===`${base}website-preview.json`);
if(!webAsset)throw Error('Verified website release manifest missing');
const exported=JSON.parse(await download(webAsset.browser_download_url,16384));
for(const [key,value] of Object.entries(manifest))if(exported[key]!==value)throw Error('Website/app release metadata disagreement');
const previous=JSON.parse(await readFile('public/updates/preview.json','utf8'));
if(previous.available===true&&(!Number.isSafeInteger(previous.versionCode)||previous.versionCode>=versionCode))throw Error('Do not replace an equal/newer website release');
await writeFile('public/updates/preview.json',JSON.stringify(manifest,null,2)+'\n');
console.log('Verified published Preview APK and app/website manifest agreement');
