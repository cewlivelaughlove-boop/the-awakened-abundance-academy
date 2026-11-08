/* Continuous room journey. Existing artwork, controls and activities are retained. */
const rooms=window.academyMenuRooms,normalizedRoomFile=window.academyNormalizeRoom;
const file=normalizedRoomFile(location.pathname);
if(file==='voidwalk.html'){const back=document.querySelector('a.object-return');if(back){back.href='./boutique.html';back.setAttribute('aria-label','Return through the doorway to the Boutique');}}
const current=rooms.findIndex(r=>r.file===file),reduced=matchMedia('(prefers-reduced-motion:reduce)');
document.body.classList.add('proof-clean-room');
const art=r=>'./assets/optimized/'+r.image;
const oldMenu=document.querySelector('.compact-room-menu,.chamber-menu');
const menu=window.academySiteMenu;
const settings=menu.querySelector('.proof-settings>div');
for(const node of document.querySelectorAll('.room-display-options>.room-control-rail,.room-display-options>.room-object-options,.chamber-menu-panel .room-controls'))settings.append(node);
const cameraControls=document.querySelector('.scene-edge-control');if(cameraControls)settings.append(cameraControls);
const welcome=document.querySelector('#hear-guide-welcome');if(welcome)settings.append(welcome);
const moveReading=()=>{if(!document?.documentElement)return true;const controls=document.querySelector('.reading-motion');if(!controls)return false;for(const button of [...controls.children])settings.append(button);controls.remove();return true;};if(current<0&&!moveReading()){const observer=new MutationObserver(()=>{if(moveReading())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});}
if(oldMenu)oldMenu.hidden=true;
const badge=document.createElement('p');badge.className='proof-room-name';badge.textContent=current<0?({'library.html':'Library','books.html':'Beyond the Script','start.html':'Start Here','shop.html':'The Boutique'}[file]||'Voidwalker Academy'):rooms[current].name;document.body.append(badge);badge.hidden=true;
const help=document.createElement('button');help.type='button';help.className='proof-help';help.textContent='Room guide';document.body.append(help);help.className='proof-menu-guide';settings.append(help);if(current<0)help.hidden=true;
const consolePanel=document.querySelector('.room-console');
if(consolePanel){
 consolePanel.id='proof-room-guide';help.setAttribute('aria-controls',consolePanel.id);help.setAttribute('aria-expanded','false');
 const close=document.createElement('button');close.type='button';close.className='proof-guide-close';close.textContent='Return to the room ×';consolePanel.prepend(close);
 const setGuide=open=>{document.body.classList.toggle('proof-guide-open',open);help.setAttribute('aria-expanded',String(open));if(!open)menu.querySelector('summary').focus()};
 help.onclick=()=>{menu.open=false;setGuide(!document.body.classList.contains('proof-guide-open'))};close.onclick=()=>setGuide(false);
 document.querySelector('.chamber-view').addEventListener('click',e=>{if(e.target.closest('[data-station]'))setGuide(true)});
 consolePanel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();setGuide(false)}});
 const intro=document.querySelector('#step-question');if(intro)intro.textContent='Touch an object to begin a guided reflection. Choose a prompt and watch your path become a constellation. At the end, you can write a private reflection. Nothing is sent or saved.';
 // The old label implied a question input. This choice actually means curiosity.
 const revise=()=>{for(const b of consolePanel.querySelectorAll('button'))if(b.textContent==='Ask a new question')b.textContent='Let curiosity guide me';};
 new MutationObserver(revise).observe(consolePanel,{subtree:true,childList:true});revise();
}else{
 const guide=document.createElement('dialog');guide.className='proof-help-dialog';guide.innerHTML='<button type="button">Close ×</button>'+ (current===1 ? '<h2>Carry an idea with you</h2><p>Explore books and objects for a thoughtful practice. Touch an object to discover it. Items marked Coming soon are not available to buy yet.</p><p>Continue through the doorway to the Dark Room for a quieter reflection, or return to the Sanctuary.</p>' : '<h2>Your journey begins here</h2><p>Pause, look beyond the windows, and choose a direction. The library holds ideas to explore; the telescope opens a wider view. Continue through the Boutique and into the Dark Room for a quieter reflection.</p>')+(current===0?'<p>On phones, the room fills your screen. Drag gently to look around. Choose Whole room or Wider view in Display & room controls to see the full space at once. The edge arrow continues to the Boutique, and the Room menu can take you to any room.</p>':'<p>On phones, the room fills your screen. Drag gently left or right to look around the wide room. The doorway arrows take you onward. Choose Whole room or Wider view in Display & room controls to see the full space at once.</p>');document.body.append(guide);help.onclick=()=>{menu.open=false;guide.showModal()};guide.querySelector('button').onclick=()=>guide.close();guide.addEventListener('close',()=>menu.querySelector('summary').focus());
}
// A continuous, ordered journey: Headquarters → Boutique → Dark Room.
// Menu links remain direct shortcuts; physical doorways never wrap around.
for(const node of document.querySelectorAll('.swipe-door'))node.hidden=true;
if(current===1){
 const stage=document.querySelector('#boutique-stage');
 for(const [klass,url,label] of [['proof-boutique-return','./index.html','Return through the left doorway to Headquarters'],['proof-boutique-threshold','./voidwalk.html','Enter the Dark Room through the purple doorway']]){
  const doorway=document.createElement('a');doorway.className=klass;doorway.href=url;doorway.draggable=false;doorway.setAttribute('aria-label',label);doorway.innerHTML='<span>'+ (klass==='proof-boutique-threshold'?'Dark Room →':'← Headquarters') +'</span>';stage?.append(doorway);
 }
}
if(current>=0){
 for(const direction of [-1,1]){
 const target=rooms[current+direction];if(!target)continue;const a=document.createElement('a');a.href='./'+target.file;a.className='proof-door '+(direction<0?'proof-door-left':'proof-door-right');
 a.setAttribute('aria-label',`Open the doorway to ${target.name}`);a.innerHTML=`<span class="proof-door-view" aria-hidden="true" style="background-image:url('${art(target)}')"></span><span class="proof-door-arrow" aria-hidden="true">${direction<0?'‹':'›'}</span><small>${target.name}</small>`;document.body.append(a);
 }
}
let doorwayGesture=null;
document.addEventListener('pointerdown',e=>{const a=e.target.closest?.('.proof-boutique-threshold,.proof-boutique-return');doorwayGesture=a?{a,x:e.clientX,y:e.clientY}:null;},true);
let crossing=null,restartRequested=false;
window.addEventListener('academy-restart',()=>{restartRequested=true;});
function cancel(){if(!crossing)return;clearTimeout(crossing.timer);crossing.overlay.remove();crossing.source?.focus();crossing=null;document.body.classList.remove('proof-crossing');}
function enter(){if(!crossing)return;const url=crossing.url;clearTimeout(crossing.timer);crossing=null;location.assign(url);}
async function travel(url,source){
 if(crossing)return;const u=new URL(url,location.href),r=rooms.find(x=>normalizedRoomFile(u.pathname)===x.file);if(!r){location.assign(url);return;}
 if(normalizedRoomFile(u.pathname)===file){if(restartRequested){restartRequested=false;location.assign(url);}return;}
 if(reduced.matches){location.assign(url);return;}
 const portal=r.file==='voidwalk.html'||file==='voidwalk.html';
 if(!portal){
  // Keep the current room visible while the next artwork decodes. No blank panels.
  const marker=document.createElement('div');crossing={overlay:marker,url:u.href,source,timer:null};
  source?.setAttribute('aria-busy','true');const nextArt=new Image();nextArt.src=art(r);
  try{await Promise.race([nextArt.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,1800))]);}catch{}
  source?.removeAttribute('aria-busy');if(crossing?.overlay===marker)enter();return;
 }
 const sourceStage=file==='boutique.html'&&r.file==='voidwalk.html'?document.querySelector('#boutique-stage'):null;
 const sourceRect=sourceStage?.getBoundingClientRect();
 const fromBoutique=sourceRect&&sourceRect.width>0&&sourceRect.height>0;
 const overlay=document.createElement('div');overlay.className='proof-passage'+(portal?' proof-passage-portal':'');overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',`Doorway to ${r.name}`);if(fromBoutique)overlay.classList.add('proof-passage-from-boutique');
 overlay.innerHTML=`<div class="proof-passage-room" style="background-image:url('${art(r)}')"></div>${portal?`<div class="proof-portal-atmosphere" aria-hidden="true"></div><div class="proof-portal-frame" aria-hidden="true"><img class="proof-portal-doorway" src="./assets/optimized/dark-room-portal-v1.webp" alt=""><div class="proof-portal-destination" style="background-image:url('${art(r)}')"></div></div>`:'<div class="proof-door-leaf leaf-left"></div><div class="proof-door-leaf leaf-right"></div>'}<p>${portal?'Through the doorway to':'Entering'} ${r.name}</p><div class="proof-passage-actions"><button type="button" data-cancel>Stay here</button><button type="button" data-enter>Enter now →</button></div>`;
 if(fromBoutique){
  // Start at the same architectural doorway, not a disconnected portal image.
  const frame=overlay.querySelector('.proof-portal-frame'),door=frame.querySelector('img');
  const portrait=false;
  const shape=portrait?{w:1086,h:1448,x:833,y:377,cw:247,ch:480}:{w:1976,h:796,x:1515,y:16,cw:440,ch:684};
  door.src=art(rooms[1]);if(portrait)overlay.classList.add('proof-passage-portrait-door');
  const x=sourceRect.left+sourceRect.width*(shape.x+shape.cw/2)/shape.w,y=sourceRect.top+sourceRect.height*(shape.y+shape.ch/2)/shape.h;
  const width=sourceRect.width*shape.cw/shape.w,height=sourceRect.height*shape.ch/shape.h;
  const vw=document.documentElement.clientWidth||window.innerWidth,vh=window.innerHeight;
  const fit=Math.min(vw*.9,Math.max(200,vh-156)*shape.cw/shape.ch)/width;
  for(const [name,value] of Object.entries({'--portal-image-width':shape.w/shape.cw*100+'%','--portal-image-height':shape.h/shape.ch*100+'%','--portal-image-left':-shape.x/shape.cw*100+'%','--portal-image-top':-shape.y/shape.ch*100+'%'}))frame.style.setProperty(name,value);
  Object.assign(frame.style,{left:x+'px',top:y+'px',width:width+'px',height:height+'px'});
  for(const [name,value] of Object.entries({'--portal-center-x':(vw/2-x)+'px','--portal-center-y':(vh/2-y)+'px','--portal-scale-one':fit,'--portal-scale-two':fit*2.1,'--portal-scale-three':fit*3.25,'--portal-scale-four':fit*4.4}))frame.style.setProperty(name,String(value));
  const context=document.createElement('div');context.className='proof-passage-context';
  overlay.prepend(context);
 }
 document.body.append(overlay);crossing={overlay,url:u.href,source,timer:null};document.body.classList.add('proof-crossing');
 overlay.querySelector('[data-cancel]').onclick=cancel;overlay.querySelector('[data-enter]').onclick=enter;overlay.querySelector('[data-enter]').focus();
 overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();cancel();}if(e.key==='Tab'){e.preventDefault();const a=overlay.querySelector('[data-cancel]'),b=overlay.querySelector('[data-enter]');(document.activeElement===a?b:a).focus();}});
 const image=new Image();image.src=art(r);const images=[image];if(portal){const door=new Image();door.src='./assets/optimized/dark-room-portal-v1.webp';images.push(door);}try{await Promise.race([Promise.all(images.map(img=>img.decode().catch(()=>{}))),new Promise(resolve=>setTimeout(resolve,1500))]);}catch{}
 if(!crossing||crossing.overlay!==overlay)return;
 crossing.timer=setTimeout(()=>{if(!crossing||crossing.overlay!==overlay)return;overlay.classList.add('opening');crossing.timer=setTimeout(enter,portal?6800:4300);},portal?1800:500);
}
window.academyNavigate=(url)=>travel(url,document.activeElement);
document.addEventListener('click',e=>{
 const a=e.target.closest?.('a[href]');if(a&&doorwayGesture?.a===a&&e.detail!==0){const moved=Math.hypot(e.clientX-doorwayGesture.x,e.clientY-doorwayGesture.y)>12;doorwayGesture=null;if(moved){e.preventDefault();e.stopImmediatePropagation();return;}}if(!a||e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||a.target||a.hasAttribute('download'))return;
 const u=new URL(a.href,location.href);if(u.origin!==location.origin||!rooms.some(r=>normalizedRoomFile(u.pathname)===r.file))return;
 e.preventDefault();e.stopImmediatePropagation();menu.open=false;travel(a.href,a);
},true);
window.addEventListener('pagehide',cancel);window.addEventListener('pageshow',()=>{cancel();document.body.classList.remove('room-leaving')});
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel()});
window.dispatchEvent(new Event('resize'));
// The actual room film can fill the view without telescope graphics or a new service.
const windowStage=document.querySelector('#stage,#boutique-stage,.chamber-plane');
if(windowStage){
 const windowButton=document.createElement('button');windowButton.type='button';windowButton.className='proof-menu-window';windowButton.setAttribute('aria-label','Enter the galaxy window');windowButton.innerHTML='<span>Enter the galaxy</span>';
 settings.append(windowButton);
 const galaxy=document.createElement('dialog');galaxy.className='proof-galaxy-view';galaxy.setAttribute('aria-label','A view among the stars and planets');galaxy.innerHTML='<video muted loop playsinline preload="none" aria-label="The same cinematic galaxy video seen from this room"></video><button class="proof-galaxy-return">← Return to the room</button><button class="proof-galaxy-pause">Pause motion</button><p class="proof-galaxy-status" role="status"></p>';document.body.append(galaxy);
 const video=galaxy.querySelector('video'),status=galaxy.querySelector('.proof-galaxy-status'),pause=galaxy.querySelector('.proof-galaxy-pause');let token=0,gesture=null;
 const getFilm=async()=>{if(!window.academyMedia?.load)await import('./media-loader.js');return window.academyMedia.load('journey')};
 windowButton.addEventListener('pointerdown',e=>{gesture={x:e.clientX,y:e.clientY}});
 windowButton.addEventListener('click',async e=>{if(gesture&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>12)return;gesture=null;const mine=++token;menu.open=false;galaxy.showModal();status.textContent='Preparing your view among the planets…';video.muted=true;video.defaultMuted=true;video.playsInline=true;try{video.src=await getFilm();if(mine!==token||!galaxy.open)return;const roomVideo=document.querySelector('#exterior,#boutique-exterior');video.addEventListener('loadedmetadata',()=>{if(roomVideo&&Number.isFinite(roomVideo.currentTime))video.currentTime=roomVideo.currentTime%video.duration},{once:true});if(reduced.matches){pause.textContent='Play motion';status.textContent='Motion is paused to match your device preference.';}else{await video.play();if(mine!==token||!galaxy.open){video.pause();return;}pause.textContent='Pause motion';status.textContent='';}}catch{status.textContent='Tap Play motion to start the galaxy video.';pause.textContent='Play motion';}});
 pause.onclick=()=>{if(video.paused){video.play().then(()=>{pause.textContent='Pause motion';status.textContent='';}).catch(()=>{status.textContent='The video could not start. You can return to the room.'});}else{video.pause();pause.textContent='Play motion';}};
 galaxy.querySelector('.proof-galaxy-return').onclick=()=>galaxy.close();galaxy.addEventListener('close',()=>{++token;video.pause();menu.querySelector('summary').focus()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&galaxy.open){video.pause();pause.textContent='Play motion';}});
}


// Warm the next room during the Headquarters visit, without a visible overlay.
if(current===0)setTimeout(()=>{if(!window.navigator.connection?.saveData){const nextArt=new Image();nextArt.decoding='async';nextArt.fetchPriority='low';nextArt.src=art(rooms[1]);}},1200);
