// VapeCalc's offline cache intentionally excludes all account routes and API traffic.
// Only public static files needed for the calculators are saved.
const PREFIX="vapecalc-static-";
const CACHE=PREFIX+"2.0.0";
const ROOT="/vape-calculator/";
const CORE=[ROOT,ROOT+"index.html",ROOT+"manifest.webmanifest",ROOT+"icons/vapecalc-192.png",ROOT+"icons/vapecalc-512.png"];
self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    const manifest=await fetch(ROOT+"offline-assets.json",{cache:"no-store"}).then(r=>r.ok?r.json():[]).catch(()=>[]);
    const assets=Array.isArray(manifest)?manifest.filter(path=>typeof path==="string"&&/^\\/vape-calculator\\/assets\\/[a-zA-Z0-9._-]+\\.(js|css)$/.test(path)):[];
    await Promise.allSettled([...CORE,...assets].map(url=>cache.add(url)));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch",event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=="GET"||url.origin!==self.location.origin||!url.pathname.startsWith(ROOT)||url.pathname.startsWith(ROOT+"account/"))return;
  const shell=url.pathname===ROOT||url.pathname===ROOT+"index.html";
  const staticAsset=/^\\/vape-calculator\\/(?:assets\\/[a-zA-Z0-9._-]+\\.(?:js|css)|icons\\/vapecalc-(?:192|512)\\.png|manifest\\.webmanifest)$/.test(url.pathname);
  if(!shell&&!staticAsset)return;
  if(shell){
    event.respondWith(fetch(request).then(async response=>{
      if(response.ok){const cache=await caches.open(CACHE);await cache.put(ROOT,response.clone());}
      return response;
    }).catch(async()=> (await caches.match(ROOT))||Response.error()));
  }else{
    event.respondWith(caches.match(request).then(async cached=>cached||fetch(request).then(async response=>{
      if(response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}
      return response;
    })));
  }
});
