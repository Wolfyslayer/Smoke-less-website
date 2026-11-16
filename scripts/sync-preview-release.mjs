#!/usr/bin/env node
// Preview publication gate: only an explicitly approved release tag + SHA-256 is published.
// Called by GitHub Actions workflow_dispatch with reviewer-supplied values.
import {createHash} from 'node:crypto';
import {writeFile} from 'node:fs/promises';

const [tag,expectedHash,versionCodeArg]=process.argv.slice(2);
const versionCode=Number(versionCodeArg);
if(!Number.isSafeInteger(versionCode)||versionCode<=0)throw Error('A verified positive Android versionCode is required');
if(!/^[-\w.]+$/.test(tag||'')||!/^[a-f0-9]{64}$/i.test(expectedHash||''))throw Error('A release tag and a 64-character SHA-256 are required');
const headers={'Accept':'application/vnd.github+json','User-Agent':'smoke-less-website-preview-sync','X-GitHub-Api-Version':'2022-11-28'};
const api=await fetch('https://api.github.com/repos/Wolfyslayer/Smoke-less-app/releases/tags/'+encodeURIComponent(tag),{headers});
if(!api.ok)throw Error('Release unavailable: HTTP '+api.status);
const release=await api.json();
if(release.draft||!release.prerelease||release.tag_name!==tag)throw Error('Release must be a published Preview prerelease');
const apks=(release.assets||[]).filter(a=>typeof a.name==='string'&&a.name.endsWith('.apk')&&a.state==='uploaded');
if(apks.length!==1)throw Error('Exactly one uploaded APK is required for safe selection');
const asset=apks[0];
if(!/^https:\/\/github\.com\/Wolfyslayer\/Smoke-less-app\/releases\/download\/[^/?#]+\/[^/?#]+\.apk$/i.test(asset.browser_download_url))throw Error('Unexpected download host/path');
const download=await fetch(asset.browser_download_url,{redirect:'follow'});
if(!download.ok)throw Error('APK download failed: '+download.status);
const contentType=download.headers.get('content-type')||'';
if(contentType.includes('text/html'))throw Error('Unexpected HTML download');
const buffer=Buffer.from(await download.arrayBuffer());
if(buffer.length<1000||buffer.length>250*1024*1024)throw Error('Unexpected APK size');
const actual=createHash('sha256').update(buffer).digest('hex');
if(actual.toLowerCase()!==expectedHash.toLowerCase())throw Error('SHA-256 mismatch');
const manifest={
 available:true,
 version:tag,
 versionCode,
 runtimeVersion:null,
 packageName:'com.smokeless.app.preview',
 downloadUrl:asset.browser_download_url,
 sha256:actual,
 publishedAt:release.published_at||null,
 releaseNotes:'Verifierad Preview-APK från GitHub Releases.'
};
await writeFile('public/updates/preview.json',JSON.stringify(manifest,null,2)+'\n');
console.log('Verified release',tag,'sha256',actual);
