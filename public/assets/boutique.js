/* Editable concept content only. No checkout, analytics, uploads or external services. */
(()=>{
const catalog={journals:{title:'Journals & books',body:'<p class="coming-soon">Coming soon</p>'},apparel:{title:'Apparel',body:'<p class="coming-soon">Coming soon</p>'},crystals:{title:'Crystals & objects',body:'<p class="coming-soon">Coming soon</p>'},art:{title:'Art & atmosphere',body:'<p class="coming-soon">Coming soon</p>'}};
const scene=document.querySelector('#boutique-scene'),stage=document.querySelector('#boutique-stage'),dialog=document.querySelector('#collection-dialog'),title=document.querySelector('#collection-title'),content=document.querySelector('#collection-content'),close=document.querySelector('#close-collection'),status=document.querySelector('#room-status'),wide=document.querySelector('#wide-view');
let pan=Number(sessionStorage.getItem('academy-boutique-pan')??.5),full=false,sw=0,drag=null,ignoreClick=0,lastFocus=null;
function layout(){try{sessionStorage.setItem('academy-boutique-pan',String(pan))}catch{}const w=innerWidth,h=innerHeight,small=w<=700,top=small?80:64,bottom=140,avail=Math.max(180,h-top-bottom),ratio=1672/941;sw=full?Math.min(w,avail*ratio):Math.max(w,avail*ratio);const sh=sw/ratio;stage.style.width=sw+'px';stage.style.height=sh+'px';stage.style.left=((w-sw)*pan)+'px';stage.style.top=(top+(avail-sh)/2)+'px';}
function openCategory(key){if(key==='journals'){window.academyNavigate('./books.html#preview');return;}const item=catalog[key];if(!item)return;const target=stage.querySelector('.point.'+key);if(target){full=false;wide.textContent='Wider view';wide.setAttribute('aria-pressed','false');layout();const center=target.offsetLeft+target.offsetWidth/2;pan=sw>innerWidth?Math.max(0,Math.min(1,(center-innerWidth/2)/(sw-innerWidth))):.5;layout();target.classList.add('object-selected');setTimeout(()=>target.classList.remove('object-selected'),1800);}status.textContent=item.title+' · Coming soon';}
const tabs=dialog.querySelector('.dialog-nav');for(const [key,item] of Object.entries(catalog)){const b=document.createElement('button');b.type='button';b.dataset.category=key;b.textContent=item.title;tabs.append(b)}
document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>openCategory(b.dataset.category)));
close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>lastFocus?.isConnected&&lastFocus.focus({preventScroll:true}));dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const a=[...dialog.querySelectorAll('button,a[href]')],first=a[0],last=a.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
wide.addEventListener('click',()=>{full=!full;pan=.5;wide.textContent=full?'Explore room':'Wider view';wide.setAttribute('aria-pressed',String(full));layout()});document.querySelector('#center-view').addEventListener('click',()=>{pan=.5;layout();status.textContent='Room centered. Choose a collection to explore.'});
// One gentle look-around on a narrow viewport; every intentional interaction stops it.
let tourFrame=0,tourRunning=false,tourCancelled=false;
const tourReduced=matchMedia('(prefers-reduced-motion:reduce)');
function stopTour(){tourCancelled=true;tourRunning=false;cancelAnimationFrame(tourFrame);if(tourButton)tourButton.textContent='Look around';}
let tourButton=null;
function startTour(){if(tourReduced.matches||sw<=innerWidth+2||document.hidden)return;stopTour();tourCancelled=false;tourRunning=true;if(tourButton)tourButton.textContent='Stop look-around';const startPan=pan,startTime=performance.now();const journal=stage.querySelector('.journal-display');const endPan=Math.max(0,Math.min(1,((journal.offsetLeft+journal.offsetWidth/2)-innerWidth/2)/(sw-innerWidth)));function frame(now){if(tourCancelled||document.hidden){stopTour();return;}const elapsed=now-startTime;let from,to,t;if(elapsed<8500){from=startPan;to=0;t=elapsed/8500;}else if(elapsed<10500){from=0;to=0;t=1;}else{from=0;to=endPan;t=Math.min(1,(elapsed-10500)/11000);}const ease=t*t*(3-2*t);pan=from+(to-from)*ease;layout();if(elapsed<21500)tourFrame=requestAnimationFrame(frame);else{tourRunning=false;tourButton.textContent='Look around';}}tourFrame=requestAnimationFrame(frame);}
document.addEventListener('pointerdown',e=>{if(e.target!==tourButton)stopTour()},{capture:true});document.addEventListener('keydown',stopTour,{capture:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)stopTour()});window.addEventListener('pagehide',stopTour);tourReduced.addEventListener('change',stopTour);
setTimeout(()=>{tourButton=document.createElement('button');tourButton.type='button';tourButton.textContent='Look around';tourButton.setAttribute('aria-label','Start or stop a slow look around the boutique');document.querySelector('.room-control-rail')?.append(tourButton);tourButton.addEventListener('click',()=>{document.querySelector('.compact-room-menu').open=false;if(tourRunning)stopTour();else startTour()});if(!tourReduced.matches&&!tourCancelled){try{if(!sessionStorage.getItem('academy-boutique-tour')){sessionStorage.setItem('academy-boutique-tour','seen');startTour()}}catch{startTour()}}},1400);
scene.addEventListener('pointerdown',e=>{if(dialog.open||e.button!==0||!e.isPrimary)return;drag={id:e.pointerId,x:e.clientX,pan,moved:false,gain:(e.pointerType==='touch'||innerWidth<701)?1.65:1}});scene.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x;if(!drag.moved&&Math.abs(dx)<5)return;if(!drag.moved){drag.moved=true;scene.setPointerCapture(e.pointerId);stage.classList.add('dragging')}if(sw>innerWidth)pan=Math.max(0,Math.min(1,drag.pan-dx*drag.gain/(sw-innerWidth)));layout()});function end(e){if(!drag||e.pointerId!==drag.id)return;if(drag.moved)ignoreClick=performance.now()+350;drag=null;stage.classList.remove('dragging');if(scene.hasPointerCapture(e.pointerId))scene.releasePointerCapture(e.pointerId)}scene.addEventListener('pointerup',end);scene.addEventListener('pointercancel',end);scene.addEventListener('lostpointercapture',e=>{if(e.target!==scene||!drag||e.pointerId!==drag.id)return;drag=null;stage.classList.remove('dragging')});scene.addEventListener('click',e=>{if(performance.now()<ignoreClick){e.preventDefault();e.stopImmediatePropagation()}},true);scene.addEventListener('keydown',e=>{if(dialog.open||!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();pan=e.key==='Home'?.5:Math.max(0,Math.min(1,pan+(e.key==='ArrowRight'?.12:-.12)));layout()});window.addEventListener('resize',layout);layout();
})();
/* The same exterior journey seen through the adjoining headquarters window. */
(() => {
 const video=document.querySelector('#boutique-exterior'),button=document.querySelector('#boutique-motion'),status=document.querySelector('#room-status');
 if(!video||!button)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=reduced.matches||window.academyJourney?.paused===true,attempt=0;
 const restoring=()=>video.dataset.mediaState==='loading'||video.dataset.journeyRestore==='loading-same-video';
 function label(){button.textContent=paused?'Resume motion':'Pause motion';button.setAttribute('aria-pressed',String(paused));}
 function blocked(){paused=true;label();status.textContent='Tap Resume motion in the Room menu to start the window view.';}
 function sync(){
  const token=++attempt;label();
  if(paused||document.hidden){video.pause();return;}
  if(restoring()){status.textContent='Preparing the window view…';return;}
  video.muted=true;video.defaultMuted=true;video.playsInline=true;
  const result=video.play();
  if(result)result.catch(error=>{
   if(token!==attempt||paused||document.hidden)return;
   // A source reload aborts the old request, not the visitor’s play intent.
   if(error.name==='AbortError'&&restoring())return;
   blocked();
  });
 }
 video.muted=true;video.defaultMuted=true;video.playsInline=true;
 button.addEventListener('click',()=>{paused=!paused;sync()});
 reduced.addEventListener('change',e=>{if(e.matches){paused=true;sync()}});
 document.addEventListener('visibilitychange',sync);
 video.addEventListener('academy-journey-ready',sync);
 video.addEventListener('loadeddata',sync);
 video.addEventListener('academy-journey-play-blocked',()=>{if(!video.paused||paused||document.hidden||restoring())return;blocked();});
 video.addEventListener('pause',()=>{if(!paused&&!document.hidden&&!restoring()&&video.readyState>=2)blocked();});
 video.addEventListener('playing',()=>{if(paused||document.hidden){video.pause();return;}label();status.textContent='The window view is moving. Choose a collection to explore.';});
 video.addEventListener('error',()=>{paused=true;sync();status.textContent='The still window view is available. Video could not load.'});
 sync();
})();
