/* Byte-identical static media packaging. No backend or external media host. */
(()=>{
 const definitions={journey:{mime:'video/mp4',parts:['planet-journey-v4.mp4.part0','planet-journey-v4.mp4.part1']},guide:{mime:'video/webm',parts:['naomi-full-alpha.webm.part0','naomi-full-alpha.webm.part1','naomi-full-alpha.webm.part2']}};
 const cache=new Map(),urls=new Set();
 window.academyMedia={load(key){if(cache.has(key))return cache.get(key);const d=definitions[key];const job=(async()=>{const parts=await Promise.all(d.parts.map(async file=>{const response=await fetch('./assets/media-parts/'+file,{credentials:'same-origin',cache:'force-cache'});if(!response.ok)throw Error('Media part unavailable');return response.blob();}));const url=URL.createObjectURL(new Blob(parts,{type:d.mime}));urls.add(url);return url;})().catch(error=>{cache.delete(key);throw error;});cache.set(key,job);return job;}};
 window.addEventListener('pagehide',event=>{if(!event.persisted){urls.forEach(url=>URL.revokeObjectURL(url));urls.clear();cache.clear();}});
 const video=document.querySelector('#exterior,#boutique-exterior');
 if(video){video.dataset.mediaState='loading';window.academyMedia.load('journey').then(url=>{video.dataset.mediaState='ready';video.src=url;video.load();}).catch(()=>{video.dataset.mediaState='error';video.dispatchEvent(new Event('error'));});}
})();
