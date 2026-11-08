import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import worker from '../.output/server/index.mjs';
const root=path.resolve('.output/public');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp'};
const env={ASSETS:{async fetch(req){const f=path.resolve(root,'.'+new URL(req.url).pathname);if(!f.startsWith(root+'/')||!fs.existsSync(f))return new Response('Not found',{status:404});return new Response(fs.readFileSync(f),{headers:{'Content-Type':types[path.extname(f)]||'application/octet-stream'}});}}};
const results=[];
for(const uri of ['/','/index.html','/boutique.html','/library.html','/books.html','/start.html','/join.html','/voidwalk.html','/shop.html','/assets/immersive-proof.js','/assets/optimized/boutique-phone-portrait-black-floor-v1.webp']){
 const response=await worker.fetch(new Request('http://localhost'+uri),env,{waitUntil(){}});assert.equal(response.status,200,uri);const b=Buffer.from(await response.arrayBuffer());let nav;
 if(uri.endsWith('.html')||uri==='/'){const s=b.toString();if(uri==='/join.html'){assert(!s.includes('immersive-proof.js'));assert(s.includes('event-invitation-motion'));}else{assert(s.includes('immersive-proof.js'));assert(!s.includes('Private preview · public site unchanged'));nav=true;}if(uri==='/boutique.html')assert(s.includes('boutique-phone-portrait-black-floor-v1'));if(uri==='/books.html')assert(s.includes('data-source="book-page"'));}
 results.push({uri,status:response.status,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex'),connectedRoomModule:nav??false});
}
fs.writeFileSync('qa/compiled-smoke.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
