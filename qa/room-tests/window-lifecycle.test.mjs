import {JSDOM} from 'jsdom';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const source=await readFile(new URL('../rendered/assets/voidwalk-exterior-motion.js',import.meta.url),'utf8');
async function fixture({reduced=false,reject=false,blockFirstPlay=false}={}){
 const dom=new JSDOM('<main class="voidwalk"><div class="chamber-plane"><img class="chamber-art"></div><button id="sound" aria-pressed="false">Sound off</button></main>',{url:'http://localhost/voidwalk.html',pretendToBeVisual:true});
 const {window}=dom;let video,loads=0,draws=0;const callbacks={};
 const ctx=new Proxy({}, {get:(o,k)=>o[k]??(k==='drawImage'?()=>draws++:()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 window.HTMLCanvasElement.prototype.getContext=()=>ctx;window.HTMLCanvasElement.prototype.toDataURL=()=> 'data:image/png;base64,TEST';ctx.getImageData=(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)});const art=window.document.querySelector('.chamber-art');Object.defineProperties(art,{complete:{value:true},naturalWidth:{value:1672}});
 const create=window.document.createElement.bind(window.document);window.document.createElement=(name,...a)=>{const el=create(name,...a);if(name==='video'){
  video=el;Object.defineProperties(el,{readyState:{value:2},videoWidth:{value:1672},videoHeight:{value:941},paused:{get:()=>el._paused!==false}});
  el.pause=()=>{el._paused=true};el.load=()=>{throw Error('Unexpected decoder reset')};el.play=async()=>{el._playCalls=(el._playCalls||0)+1;if(blockFirstPlay&&el._playCalls===1)throw Error('NotAllowedError');el._paused=false};
 }return el;};
 const reduce={matches:reduced,addEventListener:(k,fn)=>callbacks.reduce=fn,removeEventListener:()=>{}};
 window.academyMedia={load:async key=>{assert.equal(key,'journey');loads++;if(reject)throw Error('missing');return 'blob:journey'}};
 Object.assign(globalThis,{window,document:window.document,matchMedia:()=>reduce,MutationObserver:window.MutationObserver,ResizeObserver:class{observe(){}disconnect(){}},IntersectionObserver:class{observe(){}disconnect(){}}});
 const module=await import('data:text/javascript;base64,'+Buffer.from(source+'\n// '+Math.random()).toString('base64'));
 await new Promise(r=>setTimeout(r,30));
 return {window,video,reduce,callbacks,module,loads:()=>loads,draws:()=>draws,canvas:window.document.querySelector('video'),close(){window.dispatchEvent(new window.PageTransitionEvent('pagehide',{persisted:false}));window.close();}};
}
let f=await fixture();assert.equal(f.loads(),1);assert.equal(f.canvas.dataset.motionState,'playing');assert.equal(f.draws(),1);assert(f.video.loop&&f.video.muted&&f.video.playsInline);assert.equal(f.module.mountVoidwalkExteriorMotion(),false);assert.equal(f.window.document.querySelector('#sound').textContent,'Sound off');
const calls=f.video._playCalls;for(let i=0;i<20;i++)f.window.dispatchEvent(new f.window.PageTransitionEvent('pageshow',{persisted:true}));await new Promise(r=>setTimeout(r,10));assert.equal(f.video._playCalls,calls);f.window.document.querySelector('.chamber-art').dispatchEvent(new f.window.Event('load'));assert.equal(f.draws(),1);assert.equal(f.window.document.querySelectorAll('canvas').length,0);assert(f.video.style.maskImage.includes('data:image/png'));
f.window.document.querySelector('.voidwalk').classList.add('paused');await new Promise(r=>setTimeout(r,10));assert(f.video.paused);assert.equal(f.canvas.dataset.motionState,'paused');
f.window.document.querySelector('.voidwalk').classList.remove('paused');await new Promise(r=>setTimeout(r,10));assert(!f.video.paused);
f.window.dispatchEvent(new f.window.PageTransitionEvent('pagehide',{persisted:true}));assert(f.video.paused);f.window.dispatchEvent(new f.window.PageTransitionEvent('pageshow',{persisted:true}));await new Promise(r=>setTimeout(r,10));assert(!f.video.paused);
f.reduce.matches=true;f.callbacks.reduce();assert(f.video.paused);assert.equal(f.canvas.dataset.motionState,'reduced');f.close();
f=await fixture({reduced:true});assert.equal(f.loads(),0);assert(f.video.paused);f.close();
f=await fixture({reject:true});assert.equal(f.canvas.dataset.motionState,'error');assert(f.video.paused);f.close();
console.log('PASS: decoder setup, existing media reuse, idempotent mounting, sound untouched, pause/resume, bfcache, reduced motion, load failure. One detached mask canvas built once from art, no video frame draws, decoder resets, repeated play calls or frame timer. Mocked lifecycle only; no browser/visual QA.');

f=await fixture({blockFirstPlay:true});assert.equal(f.video.dataset.motionState,'blocked');assert(f.video.paused);f.window.document.dispatchEvent(new f.window.Event('pointerup'));await new Promise(r=>setTimeout(r,10));assert.equal(f.video.dataset.motionState,'playing');assert.equal(f.video._playCalls,2);f.close();
f=await fixture({blockFirstPlay:true});f.window.document.querySelector('.voidwalk').classList.add('paused');await new Promise(r=>setTimeout(r,10));f.window.document.dispatchEvent(new f.window.Event('pointerup'));await new Promise(r=>setTimeout(r,10));assert.equal(f.video._playCalls,1);assert(f.video.paused);f.close();
f=await fixture({blockFirstPlay:true});const beforeClose=f.video._playCalls;f.window.dispatchEvent(new f.window.PageTransitionEvent('pagehide',{persisted:false}));f.window.document.dispatchEvent(new f.window.Event('pointerup'));f.window.document.dispatchEvent(new f.window.Event('keydown'));await new Promise(r=>setTimeout(r,10));assert.equal(f.video._playCalls,beforeClose);f.close();
console.log('PASS: real-gesture recovery after blocked muted autoplay, explicit pause preserved, gesture listeners removed on final page exit.');
