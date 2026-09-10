var CACHE="marone-scout-v2";
var FILES=["./","./index.html","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",function(e){self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES);}));});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(k){return Promise.all(k.map(function(n){
    return n===CACHE?null:caches.delete(n);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener("fetch",function(e){
  if(e.request.method!=="GET") return;
  e.respondWith(caches.match(e.request).then(function(h){
    return h||fetch(e.request).then(function(r){var c=r.clone();
      caches.open(CACHE).then(function(x){x.put(e.request,c);});return r;
    }).catch(function(){return caches.match("./index.html");});}));});
