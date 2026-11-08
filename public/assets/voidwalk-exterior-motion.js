/* Original 2.5D exterior motion. No downloads, storage, network or WebGL.
 * Right-to-left travel follows the existing planet-journey-v4 video.
 * Only the open rear sky and ceiling aperture are painted. */
export const EXTERIOR_SIZE={width:1672,height:941};
export const EXTERIOR_FRAME_INTERVAL=50; // At most 20 rendered frames per second.
export const EXTERIOR_MAX_WIDTH=1400;

export function exteriorDrift(seconds){
 // Very distant galaxy moves less than the nearer light field. A long, smooth
 // cycle avoids a visible reset and never shifts the room photograph itself.
 return {x:-5.5*Math.sin(seconds/90),y:.75*Math.sin(seconds/125)};
}

export function starPosition(star,seconds){
 const span=star.right-star.left;
 const x=star.left+(((star.x-star.left-seconds*star.speed)%span)+span)%span;
 return {x,y:star.y+Math.sin(seconds*.12+star.phase)*.45};
}

export function mountVoidwalkExteriorMotion(root=document){
 const room=root.querySelector('.voidwalk'),plane=root.querySelector('.chamber-plane'),art=root.querySelector('.chamber-art');
 if(!room||!plane||!art||plane.querySelector('.chamber-exterior-motion'))return false;
 const canvas=document.createElement('canvas');canvas.className='chamber-exterior-motion';canvas.setAttribute('aria-hidden','true');
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return false;
 const mask=document.createElement('canvas'),mctx=mask.getContext('2d',{alpha:true});if(!mctx)return false;
 art.after(canvas);
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const {width:W,height:H}=EXTERIOR_SIZE;
 let timer=null,last=0,elapsed=0,scale=1,ready=false,destroyed=false,visible=true,renderCount=0;
 // Deterministic points make screenshots/test runs reproducible. Sparse layers,
 // no warp streaks, no flash and no points over the solid room surfaces.
 let seed=6083;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 const stars=[];
 for(const [count,left,right,top,bottom] of [[88,505,1190,155,494],[34,500,1165,1,141]]){
  for(let i=0;i<count;i++){const near=i%5===0;stars.push({left,right,x:left+random()*(right-left),y:top+random()*(bottom-top),speed:near?10+random()*4:2.5+random()*2,radius:near?.85+random()*.45:.35+random()*.45,alpha:near?.52+random()*.22:.2+random()*.3,phase:random()*Math.PI*2});}
 }
 function makeMask(){
  mask.width=canvas.width;mask.height=canvas.height;mctx.clearRect(0,0,mask.width,mask.height);mctx.save();mctx.scale(scale,scale);mctx.fillStyle='#fff';mctx.filter='blur(2px)';
  // Rear arch, safely inset from its bronze/stone frame.
  mctx.beginPath();mctx.moveTo(511,488);mctx.lineTo(512,410);mctx.bezierCurveTo(520,279,666,169,834,167);mctx.bezierCurveTo(996,169,1154,283,1178,450);mctx.lineTo(1178,488);mctx.closePath();
  // Preserve the central bronze sculpture and its pedestal, including ring.
  mctx.moveTo(1001,376);mctx.ellipse(837,376,164,145,0,0,Math.PI*2);mctx.fill('evenodd');
  // Ceiling opening. Projected stars on the solid ceiling remain stationary.
  mctx.beginPath();mctx.ellipse(834,70,322,67,0,0,Math.PI*2);mctx.fill();mctx.restore();
 }
 function resize(){
  if(destroyed)return;const cssWidth=plane.clientWidth||W;const width=Math.max(480,Math.min(EXTERIOR_MAX_WIDTH,Math.round(cssWidth)));scale=width/W;canvas.width=width;canvas.height=Math.round(H*scale);makeMask();if(ready)paint();
 }
 function allowed(){return ready&&!destroyed&&visible&&!document.hidden&&!room.classList.contains('paused')&&!reduce.matches;}
 function paint(){
  if(!ready||destroyed)return;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.scale(scale,scale);
  const d=exteriorDrift(elapsed);ctx.drawImage(art,d.x,d.y,W,H);
  // Two speeds give depth while matching the other room's measured leftward
  // drift. The original galaxy and existing planet limb remain recognizable.
  for(const star of stars){const p=starPosition(star,elapsed);ctx.globalAlpha=star.alpha*(.92+.08*Math.sin(elapsed*.3+star.phase));ctx.fillStyle='#e4e9ed';ctx.beginPath();ctx.arc(p.x,p.y,star.radius,0,Math.PI*2);ctx.fill();}
  ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='destination-in';ctx.drawImage(mask,0,0);ctx.globalCompositeOperation='source-over';renderCount++;canvas.dataset.motionFrames=String(renderCount);canvas.dataset.motionTime=elapsed.toFixed(2);
 }
 function stop(){if(timer!==null){clearTimeout(timer);timer=null;}last=0;canvas.dataset.motionState=reduce.matches?'reduced':'paused';}
 function tick(){timer=null;if(!allowed()){stop();return;}const now=performance.now();if(last)elapsed+=Math.min(.15,(now-last)/1000);last=now;paint();canvas.dataset.motionState='playing';timer=setTimeout(tick,EXTERIOR_FRAME_INTERVAL);}
 function sync(){if(allowed()){if(timer===null){last=0;tick();}}else stop();}
 const observer=new MutationObserver(sync);observer.observe(room,{attributes:true,attributeFilter:['class']});
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(plane);
 const intersection=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting!==false;sync();}):null;intersection?.observe(plane);
 const onLoaded=()=>{ready=art.naturalWidth>0;if(ready){resize();sync();}};
 art.addEventListener('load',onLoaded);document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);
 const onPageHide=e=>{stop();if(!e.persisted){destroyed=true;observer.disconnect();resizeObserver.disconnect();intersection?.disconnect();document.removeEventListener('visibilitychange',sync);reduce.removeEventListener('change',sync);art.removeEventListener('load',onLoaded);}};
 window.addEventListener('pagehide',onPageHide);window.addEventListener('pageshow',sync);
 resize();if(art.complete)onLoaded();
 return true;
}

if(typeof document!=='undefined')mountVoidwalkExteriorMotion();
