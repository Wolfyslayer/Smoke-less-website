// VapeCalc offline functionality is limited to the public calculator shell and assets.
// Auth pages, private recipes and other projects are never cached by this worker.
const PREFIX="vapecalc-static-";
const CACHE=PREFIX+"2.0.1";
const ROOT="/vape-calculator/";
const CORE=[ROOT,ROOT+"index.html",ROOT+"manifest.webmanifest",ROOT+"icons/vapecalc-192.png",ROOT+"icons/vapecalc-512.png"];
const isBundle=path=>path.startsWith(ROOT+"assets/")&&/\/assets\/[a-zA-Z0-9._-]+\.(js|css)$/.test(path);
const isPublicAsset=path=>isBundle(path)||[ROOT+"manifest.webmanifest",ROOT+"icons/vapecalc-192.png",ROOT+"icons/vapecalc-512.png"].includes(path);
self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    const files=await fetch(ROOT+"offline-assets.json",{cache:"no-store"}).then(r=>r.ok?r.json():[]).catch(()=>[]);
    const assets=Array.isArray(files)?files.filter(path=>typeof path==="string"&&isBundle(path)):[];
    // A single optional asset failure must never prevent installing the shell.
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
  if(!shell&&!isPublicAsset(url.pathname))return;
  if(shell){
    event.respondWith(fetch(request).then(async response=>{
      if(response.ok){const cache=await caches.open(CACHE);await cache.put(ROOT,response.clone());}
      return response;
    }).catch(async()=>(await caches.match(ROOT))||Response.error()));
  }else{
    event.respondWith(caches.match(request).then(async cached=>cached||fetch(request).then(async response=>{
      if(response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}
      return response;
    })));
  }
});
