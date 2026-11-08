import {JSDOM} from 'jsdom';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import test from 'node:test';
const base=new URL('../rendered/assets/',import.meta.url).pathname;
const arrival=await readFile(base+'arrival.js','utf8'),proof=await readFile(base+'immersive-proof.js','utf8');
console.log('Tested SHA256',Object.fromEntries([['arrival.js',arrival],['immersive-proof.js',proof]].map(([name,s])=>[name,createHash('sha256').update(s).digest('hex')])));
const flush=async()=>{for(let i=0;i<10;i++)await Promise.resolve();};
function fixture({ready=false,reduced=false,delayedDecode=false,path='/index.html'}={}){
 const dom=new JSDOM('<!doctype html><html class="arrival-pending"><body><main id="scene" tabindex="0"><div id="stage"><img class="room"><img id="unrelated"></div></main><div id="interface"></div><audio id="cosmic-guide-audio"></audio><p id="scene-status"></p></body></html>',{url:'https://private.example'+path,pretendToBeVisual:true});
 const {window:w}=dom;let hidden=false,now=0,seq=0;const jobs=new Map(),navigation=[],decoders=[];let spoken=0,played=0;
 Object.defineProperty(w.document,'hidden',{get:()=>hidden});const main=w.document.querySelector('img.room');Object.defineProperties(main,{complete:{get:()=>ready},naturalWidth:{get:()=>ready?1672:0}});
 Object.defineProperties(w.document.querySelector('#unrelated'),{complete:{get:()=>false},naturalWidth:{get:()=>0}});
 w.HTMLMediaElement.prototype.play=async()=>{played++};w.HTMLMediaElement.prototype.pause=()=>{};
 const schedule=(fn,ms,repeat=false)=>{const id=++seq;jobs.set(id,{fn,at:now+ms,ms,repeat});return id;};
 const timers={setTimeout:(f,m=0)=>schedule(f,m),clearTimeout:id=>jobs.delete(id),setInterval:(f,m)=>schedule(f,m,true),clearInterval:id=>jobs.delete(id)};
 Object.assign(w,timers);w.academyMedia={load:async()=> 'blob:approved-journey'};w.academyWelcome={play:()=>spoken++};w.academyNavigate=url=>navigation.push(url);
 const location={pathname:path,href:'https://private.example'+path,origin:'https://private.example',assign:url=>navigation.push(url)};
 const context=vm.createContext({window:w,document:w.document,location,sessionStorage:w.sessionStorage,matchMedia:()=>({matches:reduced}),MutationObserver:w.MutationObserver,Event:w.Event,URL,URLSearchParams,Image:class{decode(){return delayedDecode?new Promise(resolve=>decoders.push(resolve)):Promise.resolve();}},...timers,console});
 const api={w,document:w.document,main,navigation,decoders,spoken:()=>spoken,played:()=>played,run:s=>vm.runInContext(s,context),async settle(){await flush();},async tick(ms){const until=now+ms;for(;;){const next=[...jobs].filter(([,v])=>v.at<=until).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;const [id,job]=next;now=job.at;if(job.repeat)job.at+=job.ms;else jobs.delete(id);job.fn();await flush();}now=until;await flush();},async visibility(value){hidden=value;w.document.dispatchEvent(new w.Event('visibilitychange'));await flush();},async loadMain(){ready=true;main.dispatchEvent(new w.Event('load'));await flush();},close(){w.close();jobs.clear();}};
 return api;
}
async function withFixture(options,fn){const f=fixture(options);try{await fn(f)}finally{f.close();}}

test('Reduced-motion travel bypasses portal and goes directly once',()=>withFixture({reduced:true},async f=>{
 f.run(proof);f.w.academyNavigate('./boutique.html');await f.settle();assert.deepEqual(f.navigation,['./boutique.html']);assert(!f.document.querySelector('.proof-passage'));await f.tick(10000);assert.equal(f.navigation.length,1);
}));
test('Portal waits 500ms, opens for 4300ms, then navigates exactly once',()=>withFixture({},async f=>{
 f.run(proof);f.w.academyNavigate('./boutique.html');await f.settle();f.w.academyNavigate('./voidwalk.html');assert.equal(f.document.querySelectorAll('.proof-passage').length,1);const overlay=f.document.querySelector('.proof-passage');await f.tick(499);assert(!overlay.classList.contains('opening'));await f.tick(1);assert(overlay.classList.contains('opening'));await f.tick(4299);assert.equal(f.navigation.length,0);await f.tick(1);assert.deepEqual(f.navigation,['https://private.example/boutique.html']);overlay.querySelector('[data-enter]').click();await f.tick(10000);assert.equal(f.navigation.length,1);
}));
test('Portal Stay cancels both initial wait and opening timer',async()=>{
 for(const elapsed of [100,1000])await withFixture({},async f=>{f.run(proof);f.w.academyNavigate('./boutique.html');await f.settle();await f.tick(elapsed);f.document.querySelector('[data-cancel]').click();await f.tick(10000);assert.deepEqual(f.navigation,[]);assert(!f.document.querySelector('.proof-passage'));assert(!f.document.body.classList.contains('proof-crossing'));});
});
test('Portal Enter now clears scheduled navigation and is idempotent',()=>withFixture({},async f=>{
 f.run(proof);f.w.academyNavigate('./boutique.html');await f.settle();const enter=f.document.querySelector('[data-enter]');enter.click();enter.click();await f.tick(10000);assert.equal(f.navigation.length,1);
}));
test('Portal backgrounding cancels transition; foreground does not auto-navigate',()=>withFixture({},async f=>{
 f.run(proof);f.w.academyNavigate('./boutique.html');await f.settle();await f.tick(1000);await f.visibility(true);await f.tick(10000);await f.visibility(false);await f.tick(10000);assert.deepEqual(f.navigation,[]);assert(!f.document.querySelector('.proof-passage'));
}));
test('Slow image decode is bounded at 1500ms, followed by 4800ms portal',()=>withFixture({delayedDecode:true},async f=>{
 f.run(proof);f.w.academyNavigate('./boutique.html');await f.settle();await f.tick(1999);assert(!f.document.querySelector('.proof-passage').classList.contains('opening'));await f.tick(1);assert(f.document.querySelector('.proof-passage').classList.contains('opening'));await f.tick(4299);assert.equal(f.navigation.length,0);await f.tick(1);assert.equal(f.navigation.length,1);
}));
test('Cancelled image decode cannot schedule stale passage after newer navigation',()=>withFixture({delayedDecode:true},async f=>{
 f.run(proof);f.w.academyNavigate('./boutique.html');f.document.querySelector('[data-cancel]').click();f.w.academyNavigate('./voidwalk.html');f.decoders[0]();await f.settle();await f.tick(1000);assert(!f.document.querySelector('.proof-passage').classList.contains('opening'));f.decoders[1]();f.decoders[2]();await f.settle();await f.tick(8599);assert.deepEqual(f.navigation,[]);await f.tick(1);assert.deepEqual(f.navigation,['https://private.example/voidwalk.html']);
}));
test('Same-room travel is a no-op',()=>withFixture({},async f=>{f.run(proof);f.w.academyNavigate('./index.html');await f.tick(10000);assert.deepEqual(f.navigation,[]);assert(!f.document.querySelector('.proof-passage'));}));

test('Boutique purple doorway is visible for 1800ms then glides 6800ms to Dark Room',()=>withFixture({path:'/boutique'},async f=>{f.run(proof);f.document.querySelector('.proof-door-right').click();await f.settle();const overlay=f.document.querySelector('.proof-passage');assert(overlay.classList.contains('proof-passage-portal'));assert(overlay.querySelector('.proof-portal-doorway'));assert(!overlay.querySelector('.proof-door-leaf'));assert.match(overlay.querySelector('.proof-portal-destination').style.backgroundImage,/voidwalk-chamber/);await f.tick(1799);assert(!overlay.classList.contains('opening'));await f.tick(1);assert(overlay.classList.contains('opening'));await f.tick(6799);assert.equal(f.navigation.length,0);await f.tick(1);assert.deepEqual(f.navigation,['https://private.example/voidwalk.html']);}));
test('Dark Room returns through portal only to Boutique, never Headquarters',()=>withFixture({path:'/voidwalk'},async f=>{f.run(proof);assert(!f.document.querySelector('.proof-door-right'));f.document.querySelector('.proof-door-left').click();await f.settle();assert(f.document.querySelector('.proof-passage-portal'));await f.tick(8600);assert.deepEqual(f.navigation,['https://private.example/boutique.html']);}));
test('Headquarters doorway keeps sliding reveal, not purple portal',()=>withFixture({},async f=>{f.run(proof);f.document.querySelector('.proof-door-right').click();await f.settle();assert(!f.document.querySelector('.proof-passage-portal'));assert.equal(f.document.querySelectorAll('.proof-door-leaf').length,2);assert(!f.document.querySelector('.proof-portal-doorway'));await f.tick(4800);assert.deepEqual(f.navigation,['https://private.example/boutique.html']);}));
test('Purple doorway is cancelable during hold and glide',async()=>{for(const elapsed of [1000,5000])await withFixture({path:'/boutique'},async f=>{f.run(proof);f.w.academyNavigate('./voidwalk.html');await f.settle();await f.tick(elapsed);f.document.querySelector('[data-cancel]').click();await f.tick(20000);assert.deepEqual(f.navigation,[]);assert(!f.document.querySelector('.proof-passage'));});});

test('Architectural doorway starts in place and uses the actual Boutique art',()=>withFixture({path:'/boutique'},async f=>{const stage=f.document.querySelector('#stage');stage.id='boutique-stage';stage.getBoundingClientRect=()=>({left:0,top:340,width:390,height:390*796/1976});f.run(proof);f.document.querySelector('.proof-boutique-threshold').click();await f.settle();const overlay=f.document.querySelector('.proof-passage-from-boutique');assert(overlay);assert.match(overlay.querySelector('.proof-portal-doorway').src,/boutique-right-doorway-black-floor-v2/);const frame=overlay.querySelector('.proof-portal-frame');assert(Math.abs(parseFloat(frame.style.width)-390*440/1976)<.01);assert(parseFloat(frame.style.left)>300);assert(overlay.querySelector('.proof-passage-context'));assert.match(overlay.querySelector('.proof-portal-destination').style.backgroundImage,/voidwalk-chamber/);await f.tick(8600);assert.deepEqual(f.navigation,['https://private.example/voidwalk.html']);}));
test('Dragging across an architectural doorway does not trigger travel',()=>withFixture({path:'/boutique'},async f=>{f.document.querySelector('#stage').id='boutique-stage';f.run(proof);const a=f.document.querySelector('.proof-boutique-threshold');a.dispatchEvent(new f.w.MouseEvent('pointerdown',{bubbles:true,clientX:300,clientY:400}));a.dispatchEvent(new f.w.MouseEvent('click',{bubbles:true,cancelable:true,detail:1,clientX:250,clientY:402}));await f.tick(10000);assert(!f.document.querySelector('.proof-passage'));assert.deepEqual(f.navigation,[]);}));

test('Phone portal uses accepted portrait door geometry and art',()=>withFixture({path:'/boutique'},async f=>{Object.defineProperty(f.w,'innerWidth',{value:390});Object.defineProperty(f.w,'innerHeight',{value:844});const stage=f.document.querySelector('#stage');stage.id='boutique-stage';stage.dataset.portrait='true';stage.getBoundingClientRect=()=>({left:0,top:162,width:390,height:520});f.run(proof);f.document.querySelector('.proof-boutique-threshold').click();await f.settle();const overlay=f.document.querySelector('.proof-passage-portrait-door');assert(overlay);assert.match(overlay.querySelector('.proof-portal-doorway').src,/boutique-phone-portrait-black-floor-v1/);const frame=overlay.querySelector('.proof-portal-frame');assert(Math.abs(parseFloat(frame.style.width)-390*247/1086)<.01);assert(Math.abs(parseFloat(frame.style.height)-520*480/1448)<.01);assert.equal(frame.style.getPropertyValue('--portal-image-width'),1086/247*100+'%');await f.tick(8600);assert.deepEqual(f.navigation,['https://private.example/voidwalk.html']);}));

test('Restart from Headquarters reloads only after deliberate restart event',()=>withFixture({},async f=>{f.run(proof);f.w.academyNavigate('./index.html');assert.equal(f.navigation.length,0);f.w.dispatchEvent(new f.w.Event('academy-restart'));f.w.academyNavigate('./index.html');assert.deepEqual(f.navigation,['./index.html']);}));
