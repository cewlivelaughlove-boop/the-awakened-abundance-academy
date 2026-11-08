/* Editable concept content only. No checkout, analytics, uploads or external services. */
(()=>{
const catalog={journals:{title:'Journals & books',body:'<p class="coming-soon">Coming soon</p>'},apparel:{title:'Apparel',body:'<p class="coming-soon">Coming soon</p>'},crystals:{title:'Crystals & objects',body:'<p class="coming-soon">Coming soon</p>'},art:{title:'Art & atmosphere',body:'<p class="coming-soon">Coming soon</p>'}};
const scene=document.querySelector('#boutique-scene'),stage=document.querySelector('#boutique-stage'),dialog=document.querySelector('#collection-dialog'),title=document.querySelector('#collection-title'),content=document.querySelector('#collection-content'),close=document.querySelector('#close-collection'),status=document.querySelector('#room-status'),wide=document.querySelector('#wide-view');
let pan=Number(sessionStorage.getItem('academy-boutique-pan')??.5),full=innerWidth>=1024,sw=0,drag=null,ignoreClick=0,lastFocus=null;
// A small phone-camera pullback, not the narrow whole-image overview.
let camera=.9;try{const saved=Number(sessionStorage.getItem('academy-boutique-camera'));if(saved>=.82&&saved<=1)camera=saved;}catch{}
const cameraButtons=[];
const cameraBackdrop=document.createElement('div');cameraBackdrop.className='boutique-camera-backdrop';cameraBackdrop.setAttribute('aria-hidden','true');cameraBackdrop.hidden=true;scene.prepend(cameraBackdrop);
function layout(){
 try{sessionStorage.setItem('academy-boutique-pan',String(pan));sessionStorage.setItem('academy-boutique-camera',String(camera));}catch{}
 const w=innerWidth,h=innerHeight,ratio=1976/796,phone=w<1024,scale=phone?camera:1;
 stage.dataset.roomWidth='1976';stage.dataset.roomHeight='796';stage.dataset.portrait='false';stage.dataset.camera=String(scale);
 sw=full?Math.min(w,h*ratio):Math.max(w,h*ratio*scale);const sh=sw/ratio,gap=Math.max(0,(h-sh)/2);
 stage.style.width=sw+'px';stage.style.height=sh+'px';stage.style.left=((w-sw)*(full?.5:pan))+'px';stage.style.top=((h-sh)/2)+'px';
 // A softly defocused copy of the same room fills only the small outer margin.
 // Main artwork and hotspots retain the original aspect ratio, with no edge stretching.
 const pulledBack=!full&&phone&&gap>=.01;cameraBackdrop.hidden=!pulledBack;stage.dataset.cameraPullback=String(pulledBack);
 const bw=Math.max(w+32,(h+32)*ratio),bh=bw/ratio;
 Object.assign(cameraBackdrop.style,{width:(w+32)+'px',height:(h+32)+'px',backgroundSize:bw+'px '+bh+'px',backgroundPosition:((w+32-bw)*pan)+'px '+((h+32-bh)/2)+'px'});
 cameraButtons.forEach((button,i)=>{button.disabled=!phone||(i===0?camera<=.82001:camera>=.99999);});
}
function adjustCamera(delta){
 stopTour();const focus=sw?(innerWidth/2-parseFloat(stage.style.left))/sw:.5;
 full=false;camera=Math.max(.82,Math.min(1,Math.round((camera+delta)*100)/100));wide.textContent='Whole room';wide.setAttribute('aria-pressed','false');layout();
 pan=sw>innerWidth?Math.max(0,Math.min(1,(focus*sw-innerWidth/2)/(sw-innerWidth))):.5;layout();
 for(const menu of document.querySelectorAll('.compact-room-menu,.proof-room-menu'))menu.open=false;
 scene.focus({preventScroll:true});status.textContent='Boutique camera adjusted. Drag left or right to look around.';
}
function openCategory(key){if(key==='journals'){window.academyNavigate('./books.html#preview');return;}const item=catalog[key];if(!item)return;const target=stage.querySelector('.point.'+key);if(target){full=false;wide.textContent='Wider view';wide.setAttribute('aria-pressed','false');layout();const center=target.offsetLeft+target.offsetWidth/2;pan=sw>innerWidth?Math.max(0,Math.min(1,(center-innerWidth/2)/(sw-innerWidth))):.5;layout();target.classList.add('object-selected');setTimeout(()=>target.classList.remove('object-selected'),1800);}status.textContent=item.title+' · Coming soon';}
const tabs=dialog.querySelector('.dialog-nav');for(const [key,item] of Object.entries(catalog)){const b=document.createElement('button');b.type='button';b.dataset.category=key;b.textContent=item.title;tabs.append(b)}
document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>openCategory(b.dataset.category)));
close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>lastFocus?.isConnected&&lastFocus.focus({preventScroll:true}));dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const a=[...dialog.querySelectorAll('button,a[href]')],first=a[0],last=a.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
wide.textContent=full?'Explore room':'Whole room';wide.setAttribute('aria-pressed',String(full));
wide.addEventListener('click',()=>{stopTour();full=!full;pan=.5;wide.textContent=full?'Explore room':'Wider view';wide.setAttribute('aria-pressed',String(full));layout()});document.querySelector('#center-view').addEventListener('click',()=>{stopTour();pan=.5;layout();status.textContent='Room centered. Choose a collection to explore.'});
// Optional gentle look-around. The camera remains still until requested.
let tourFrame=0,tourRunning=false,tourCancelled=false;
const tourReduced=matchMedia('(prefers-reduced-motion:reduce)');
function stopTour(){tourCancelled=true;tourRunning=false;cancelAnimationFrame(tourFrame);if(tourButton)tourButton.textContent='Look around';}
let tourButton=null;
function startTour(){if(tourReduced.matches||document.hidden)return;stopTour();full=false;pan=0;wide.textContent='Wider view';wide.setAttribute('aria-pressed','false');layout();if(sw<=innerWidth+2){full=true;wide.textContent='Explore room';wide.setAttribute('aria-pressed','true');layout();status.textContent='The whole room is already visible.';return;}tourCancelled=false;tourRunning=true;if(tourButton)tourButton.textContent='Stop look-around';const startTime=performance.now();function frame(now){if(tourCancelled||document.hidden){stopTour();return;}const t=Math.max(0,Math.min(1,(now-startTime)/21000));pan=t*t*(3-2*t);layout();if(t<1)tourFrame=requestAnimationFrame(frame);else{tourRunning=false;tourButton.textContent='Look around';status.textContent='Continue to the Dark Room with the doorway on the right, or choose Wider view.';}}tourFrame=requestAnimationFrame(frame);}
document.addEventListener('pointerdown',e=>{if(e.target!==tourButton)stopTour()},{capture:true});document.addEventListener('keydown',stopTour,{capture:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)stopTour()});window.addEventListener('pagehide',stopTour);tourReduced.addEventListener('change',stopTour);
setTimeout(()=>{const rail=document.querySelector('.room-control-rail');if(innerWidth<1024&&rail){const controls=document.createElement('div');controls.className='boutique-camera-controls';for(const [i,label] of ['Move back','Move closer'].entries()){const button=document.createElement('button');button.type='button';button.id=i?'boutique-camera-closer':'boutique-camera-back';button.textContent=label;button.setAttribute('aria-label',i?'Move the Boutique camera closer':'Move the Boutique camera back a little');button.addEventListener('click',()=>adjustCamera(i?.04:-.04));controls.append(button);cameraButtons.push(button);}rail.prepend(controls);layout();}tourButton=document.createElement('button');tourButton.type='button';tourButton.textContent='Look around';tourButton.setAttribute('aria-label','Start or stop a slow look around the boutique');document.querySelector('.room-control-rail')?.append(tourButton);tourButton.addEventListener('click',()=>{for(const menu of document.querySelectorAll('.compact-room-menu,.proof-room-menu'))menu.open=false;if(tourRunning)stopTour();else startTour()});if(tourReduced.matches){tourButton.disabled=true;tourButton.textContent='Motion reduced on this device';}},1400);
scene.addEventListener('pointerdown',e=>{if(dialog.open||e.button!==0||!e.isPrimary)return;drag={id:e.pointerId,x:e.clientX,pan,moved:false,gain:(e.pointerType==='touch'||innerWidth<701)?1.65:1}});scene.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id||full)return;const dx=e.clientX-drag.x;if(!drag.moved&&Math.abs(dx)<5)return;if(!drag.moved){drag.moved=true;scene.setPointerCapture(e.pointerId);stage.classList.add('dragging')}if(sw>innerWidth)pan=Math.max(0,Math.min(1,drag.pan-dx*drag.gain/(sw-innerWidth)));layout()});function end(e){if(!drag||e.pointerId!==drag.id)return;if(drag.moved)ignoreClick=performance.now()+350;drag=null;stage.classList.remove('dragging');if(scene.hasPointerCapture(e.pointerId))scene.releasePointerCapture(e.pointerId)}scene.addEventListener('pointerup',end);scene.addEventListener('pointercancel',end);scene.addEventListener('lostpointercapture',e=>{if(e.target!==scene||!drag||e.pointerId!==drag.id)return;drag=null;stage.classList.remove('dragging')});scene.addEventListener('click',e=>{if(performance.now()<ignoreClick){e.preventDefault();e.stopImmediatePropagation()}},true);scene.addEventListener('keydown',e=>{if(dialog.open||!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();pan=e.key==='Home'?.5:Math.max(0,Math.min(1,pan+(e.key==='ArrowRight'?.12:-.12)));layout()});window.addEventListener('resize',()=>{stopTour();layout();});layout();
})();
/* The same exterior journey seen through the adjoining headquarters window. */
(() => {
 const video=document.querySelector('#boutique-exterior'),button=document.querySelector('#boutique-motion'),status=document.querySelector('#room-status');
 if(!video||!button)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=reduced.matches||window.academyJourney?.paused===true,attempt=0,autoplayBlocked=false;
 const restoring=()=>video.dataset.mediaState==='loading'||video.dataset.journeyRestore==='loading-same-video';
 function label(){button.textContent=paused?'Resume motion':'Pause motion';button.setAttribute('aria-pressed',String(paused));}
 function blocked(){paused=true;autoplayBlocked=true;video.dataset.autoplayBlocked='true';label();status.textContent='Tap Resume motion in the Room menu to start the window view.';}
 function sync(){
  const token=++attempt;label();
  if(paused||document.hidden){video.pause();return;}
  if(restoring()){status.textContent='Preparing the window view…';return;}
  video.muted=true;video.defaultMuted=true;video.playsInline=true;
  const result=video.play();
  if(result)result.catch(error=>{
   if(token!==attempt||paused||document.hidden)return;
   // A source reload aborts the old request, not the visitor’s play intent.
   if(error.name==='AbortError')return;
   blocked();
  });
 }
 video.muted=true;video.defaultMuted=true;video.playsInline=true;
 button.addEventListener('click',()=>{autoplayBlocked=false;delete video.dataset.autoplayBlocked;paused=!paused;sync()});
 document.addEventListener('click',event=>{
  if(event.target.closest?.('#boutique-motion')||!autoplayBlocked||reduced.matches||document.hidden)return;
  autoplayBlocked=false;delete video.dataset.autoplayBlocked;paused=false;sync();
 });
 video.addEventListener('canplay',sync);
 reduced.addEventListener('change',e=>{if(e.matches){paused=true;sync()}});
 document.addEventListener('visibilitychange',sync);
 video.addEventListener('academy-journey-ready',sync);
 video.addEventListener('loadeddata',sync);
 video.addEventListener('academy-journey-play-blocked',()=>{if(!video.paused||paused||document.hidden||restoring())return;blocked();});
 video.addEventListener('pause',()=>{if(!paused&&!document.hidden&&!restoring()&&video.readyState>=2)blocked();});
 video.addEventListener('playing',()=>{if(paused||document.hidden){video.pause();return;}autoplayBlocked=false;delete video.dataset.autoplayBlocked;label();status.textContent='The window view is moving. Choose a collection to explore.';});
 video.addEventListener('error',()=>{autoplayBlocked=false;delete video.dataset.autoplayBlocked;paused=true;sync();status.textContent='The still window view is available. Video could not load.'});
 sync();
})();
