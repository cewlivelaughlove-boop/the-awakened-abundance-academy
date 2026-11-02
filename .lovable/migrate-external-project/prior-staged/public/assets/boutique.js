/* Editable concept content only. No checkout, analytics, uploads or external services. */
(()=>{
const catalog={journals:{title:'Journals & books',body:'<p class="coming-soon">Coming soon</p>'},apparel:{title:'Apparel',body:'<p class="coming-soon">Coming soon</p>'},crystals:{title:'Crystals & objects',body:'<p class="coming-soon">Coming soon</p>'},art:{title:'Art & atmosphere',body:'<p class="coming-soon">Coming soon</p>'}};
const scene=document.querySelector('#boutique-scene'),stage=document.querySelector('#boutique-stage'),dialog=document.querySelector('#collection-dialog'),title=document.querySelector('#collection-title'),content=document.querySelector('#collection-content'),close=document.querySelector('#close-collection'),status=document.querySelector('#room-status'),wide=document.querySelector('#wide-view');
let pan=.5,full=false,sw=0,drag=null,ignoreClick=0,lastFocus=null;
function layout(){const w=innerWidth,h=innerHeight,small=w<=700,top=small?80:64,bottom=140,avail=Math.max(180,h-top-bottom),ratio=1672/941;sw=full?Math.min(w,avail*ratio):Math.max(w,avail*ratio);const sh=sw/ratio;stage.style.width=sw+'px';stage.style.height=sh+'px';stage.style.left=((w-sw)*pan)+'px';stage.style.top=(top+(avail-sh)/2)+'px';}
function openCategory(key){if(key==='journals'){location.href='./library.html';return;}const item=catalog[key];if(!item)return;status.textContent=item.title+' · Coming soon';}
const tabs=dialog.querySelector('.dialog-nav');for(const [key,item] of Object.entries(catalog)){const b=document.createElement('button');b.type='button';b.dataset.category=key;b.textContent=item.title;tabs.append(b)}
document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>openCategory(b.dataset.category)));
close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>lastFocus?.isConnected&&lastFocus.focus({preventScroll:true}));dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const a=[...dialog.querySelectorAll('button,a[href]')],first=a[0],last=a.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
wide.addEventListener('click',()=>{full=!full;pan=.5;wide.textContent=full?'Explore room':'Wider view';wide.setAttribute('aria-pressed',String(full));layout()});document.querySelector('#center-view').addEventListener('click',()=>{pan=.5;layout();status.textContent='Room centered. Choose a collection to explore.'});
scene.addEventListener('pointerdown',e=>{if(dialog.open||e.button!==0||!e.isPrimary)return;drag={id:e.pointerId,x:e.clientX,pan,moved:false,gain:(e.pointerType==='touch'||innerWidth<701)?1.65:1}});scene.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x;if(!drag.moved&&Math.abs(dx)<5)return;if(!drag.moved){drag.moved=true;scene.setPointerCapture(e.pointerId);stage.classList.add('dragging')}if(sw>innerWidth)pan=Math.max(0,Math.min(1,drag.pan-dx*drag.gain/(sw-innerWidth)));layout()});function end(e){if(!drag||e.pointerId!==drag.id)return;if(drag.moved)ignoreClick=performance.now()+350;drag=null;stage.classList.remove('dragging');if(scene.hasPointerCapture(e.pointerId))scene.releasePointerCapture(e.pointerId)}scene.addEventListener('pointerup',end);scene.addEventListener('pointercancel',end);scene.addEventListener('lostpointercapture',()=>{drag=null;stage.classList.remove('dragging')});scene.addEventListener('click',e=>{if(performance.now()<ignoreClick){e.preventDefault();e.stopImmediatePropagation()}},true);scene.addEventListener('keydown',e=>{if(dialog.open||!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();pan=e.key==='Home'?.5:Math.max(0,Math.min(1,pan+(e.key==='ArrowRight'?.12:-.12)));layout()});window.addEventListener('resize',layout);layout();
})();
/* The same exterior journey seen through the adjoining headquarters window. */
(() => {
 const video=document.querySelector('#boutique-exterior'),button=document.querySelector('#boutique-motion'),status=document.querySelector('#room-status');
 if(!video||!button)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=reduced.matches||window.academyJourney?.paused===true,attempt=0;
 const restoring=()=>video.dataset.journeyRestore==='loading-same-video';
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
 video.addEventListener('academy-journey-play-blocked',()=>{if(!video.paused||paused||document.hidden||restoring())return;blocked();});
 video.addEventListener('pause',()=>{if(!paused&&!document.hidden&&!restoring()&&video.readyState>=2)blocked();});
 video.addEventListener('playing',()=>{if(paused||document.hidden){video.pause();return;}label();status.textContent='The window view is moving. Choose a collection to explore.';});
 video.addEventListener('error',()=>{paused=true;sync();status.textContent='The still window view is available. Video could not load.'});
 sync();
})();
