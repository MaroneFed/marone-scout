var CACHE="nexus-scout-v5";
var FILES=["./","./index.html","./manifest.webmanifest","./icon.svg"];

self.addEventListener("install",function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES);}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.map(function(n){return n===CACHE?null:caches.delete(n);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener("message",function(e){
  if(e.data==="skipWaiting") self.skipWaiting();
});
self.addEventListener("fetch",function(e){
  if(e.request.method!=="GET") return;
  var u;
  try{ u=new URL(e.request.url); }catch(err){ return; }
  if(u.origin!==self.location.origin) return;

  // Le document et le script : reseau d'abord, pour ne jamais rester bloque
  // sur une ancienne version. Le cache ne sert que si le reseau echoue.
  var isDoc = e.request.mode==="navigate" || u.pathname.indexOf(".html")>=0 || u.pathname.slice(-1)==="/";
  if(isDoc){
    e.respondWith(
      fetch(e.request,{cache:"no-store"}).then(function(r){
        var c=r.clone();
        caches.open(CACHE).then(function(x){x.put(e.request,c);});
        return r;
      }).catch(function(){
        return caches.match(e.request).then(function(hit){return hit||caches.match("./index.html");});
      })
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(function(hit){
    return hit||fetch(e.request).then(function(r){
      var c=r.clone();
      caches.open(CACHE).then(function(x){x.put(e.request,c);});
      return r;
    }).catch(function(){return caches.match("./index.html");});
  }));
});
