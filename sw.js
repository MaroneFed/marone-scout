var CACHE="nexus-scout-v4";
var FILES=["./","./index.html","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",function(e){self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES);}));});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(k){return Promise.all(k.map(function(n){
    return n===CACHE?null:caches.delete(n);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener("fetch",function(e){
  if(e.request.method!=="GET") return;
  var u;
  try{ u=new URL(e.request.url); }catch(err){ return; }
  if(u.origin!==self.location.origin) return;
  e.respondWith(caches.match(e.request).then(function(hit){
    return hit||fetch(e.request).then(function(r){
      var c=r.clone();
      caches.open(CACHE).then(function(x){x.put(e.request,c);});
      return r;
    }).catch(function(){ return caches.match("./index.html"); });
  }));
});
