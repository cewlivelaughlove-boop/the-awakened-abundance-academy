/* Native playback of the approved journey film. No frame-copy/render loop.
 * The existing room photograph, sculpture exclusion and controls are preserved. */
export const EXTERIOR_SIZE={width:1672,height:941};
// Inset trace of the visible exterior through the left doorway, in original
// art coordinates. The arch, vertical frame, bottom sill and foreground table
// are outside this polygon. Reuse one trace for both SVG and generated mask.
export const LEFT_WINDOW_POINTS=Object.freeze([[166,233],[237,237],[242,263],[246,304],[248,345],[248,438],[174,438],[170,370],[168,315],[166,270]].map(point=>Object.freeze(point)));
export const LEFT_WINDOW_PATH=LEFT_WINDOW_POINTS.map(([x,y],i)=>`${i?'L':'M'}${x} ${y}`).join(' ')+' Z';
export const EXTERIOR_MASK=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1672 941"><path fill="white" fill-rule="evenodd" d="M511 488 L512 410 C520 279 666 169 834 167 C996 169 1154 283 1178 450 L1178 488 Z"/><ellipse fill="white" fill-opacity=".53" cx="834" cy="70" rx="322" ry="67"/><path fill="white" d="${LEFT_WINDOW_PATH}"/></svg>`;

export const SCULPTURE_ROI={x:680,y:230,width:310,height:260};

// Pure, bounded, one-time segmentation of the existing warm sculpture pixels.
// Cool sky remains open between the wires. No image or video frame is altered.
export function sculptureProtection(rgba,width,height){
 const seed=new Uint8ClampedArray(width*height),result=new Uint8ClampedArray(width*height);
 for(let i=0;i<seed.length;i++){
  const r=rgba[i*4],g=rgba[i*4+1],b=rgba[i*4+2];
  if(r>28&&r-g>3&&g-b>3&&r-b>9)seed[i]=255;
 }
 // Protect antialiasing and pale highlights next to gold with a one-pixel
 // solid dilation and a second pixel at 35%, rather than a broad silhouette.
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  let alpha=0;
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
   const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=width||ny>=height)continue;
   if(seed[ny*width+nx])alpha=Math.max(alpha,Math.abs(dx)<=1&&Math.abs(dy)<=1?255:89);
  }
  result[y*width+x]=alpha;
 }
 return result;
}

export function createSculptureMask(art,doc=document){
 const canvas=doc.createElement('canvas');canvas.width=EXTERIOR_SIZE.width;canvas.height=EXTERIOR_SIZE.height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Mask unavailable');
 const {x,y,width,height}=SCULPTURE_ROI;
 // This is the only image draw/read. The canvas is detached and never reused.
 ctx.drawImage(art,0,0,canvas.width,canvas.height);
 const protection=sculptureProtection(ctx.getImageData(x,y,width,height).data,width,height);
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#fff';
 ctx.beginPath();ctx.moveTo(511,488);ctx.lineTo(512,410);ctx.bezierCurveTo(520,279,666,169,834,167);ctx.bezierCurveTo(996,169,1154,283,1178,450);ctx.lineTo(1178,488);ctx.closePath();ctx.fill();
 ctx.globalAlpha=.53;ctx.beginPath();ctx.ellipse(834,70,322,67,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 // The adjacent room shares this same film and time; no second decoder.
 ctx.beginPath();LEFT_WINDOW_POINTS.forEach(([px,py],i)=>{if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);});ctx.closePath();ctx.fill();
 const aperture=ctx.getImageData(x,y,width,height);
 for(let i=0;i<protection.length;i++)aperture.data[i*4+3]=Math.round(aperture.data[i*4+3]*(1-protection[i]/255));
 ctx.putImageData(aperture,x,y);return canvas.toDataURL('image/png');
}

export function mountVoidwalkExteriorMotion(root=document){
 const room=root.querySelector('.voidwalk'),plane=root.querySelector('.chamber-plane'),art=root.querySelector('.chamber-art');
 if(!room||!plane||!art||plane.querySelector('.chamber-exterior-motion'))return false;
 const video=document.createElement('video');video.className='chamber-exterior-motion';
 video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='auto';
 video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('aria-hidden','true');video.tabIndex=-1;
 const mask=`url("data:image/svg+xml,${encodeURIComponent(EXTERIOR_MASK)}")`;
 Object.assign(video.style,{position:'absolute',inset:'0',width:'100%',height:'100%',objectFit:'fill',pointerEvents:'none',opacity:'.72',visibility:'hidden',maskImage:mask,maskSize:'100% 100%',maskRepeat:'no-repeat',webkitMaskImage:mask,webkitMaskSize:'100% 100%',webkitMaskRepeat:'no-repeat'});
 // Fail closed in a browser without masks, rather than cover the room in film.
 if(typeof CSS!=='undefined'&&!CSS.supports('mask-image',mask)&&!CSS.supports('-webkit-mask-image',mask))return false;
 art.after(video);
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let destroyed=false,visible=true,loading=false,playPending=false,pageHidden=false,failed=false,maskReady=false,maskBuilt=false;
 function state(value){if(video.dataset.motionState!==value)video.dataset.motionState=value;}
 function allowed(){return maskReady&&!destroyed&&!failed&&!pageHidden&&visible&&!document.hidden&&!room.classList.contains('paused')&&!reduce.matches;}
 function stop(){if(!video.paused)video.pause();state(reduce.matches?'reduced':'paused');}
 async function play(){
  if(playPending||!allowed()||!video.src)return;
  if(!video.paused){state('playing');return;}
  playPending=true;
  try{await video.play();if(allowed())state('playing');else stop();}
  catch{if(allowed())state('blocked');}
  finally{playPending=false;}
 }
 async function load(){
  if(loading||video.src||!allowed())return;loading=true;state('loading');
  try{
   if(!window.academyMedia)await import('./media-loader.js');
   const url=await window.academyMedia.load('journey');
   if(destroyed)return;video.src=url;sync();
  }catch{failed=true;state('error');}
  finally{loading=false;}
 }
 function sync(){if(failed||destroyed||!maskReady)return;if(!allowed()){stop();return;}if(video.src)void play();else void load();}
 function prepareMask(){
  if(maskBuilt||destroyed||!art.complete||!art.naturalWidth)return;maskBuilt=true;
  try{
   const precise=`url("${createSculptureMask(art)}")`;
   video.style.maskImage=precise;video.style.webkitMaskImage=precise;
   maskReady=true;video.style.visibility='visible';sync();
  }catch{failed=true;state('mask-error');} // Keep the original photograph on failure.
 }
 art.addEventListener('load',prepareMask);
 // No loadeddata->play cycle and no load() calls: assigning src is sufficient.
 const onError=()=>{failed=true;if(!video.paused)video.pause();video.style.visibility='hidden';state('error');};
 video.addEventListener('error',onError);
 const observer=new MutationObserver(sync);observer.observe(room,{attributes:true,attributeFilter:['class']});
 const intersection=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{const next=entries[0]?.isIntersecting!==false;if(next!==visible){visible=next;sync();}}):null;intersection?.observe(plane);
 document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);
 // On phones that reject muted autoplay, the next real room gesture can
 // start the existing film. Respect explicit pause and reduced-motion.
 const retryFromGesture=()=>{if(video.dataset.motionState==='blocked'&&allowed())void play();};
 document.addEventListener('pointerup',retryFromGesture,{passive:true});
 document.addEventListener('keydown',retryFromGesture);
 const onPageShow=()=>{pageHidden=false;sync();};
 const onPageHide=e=>{pageHidden=true;stop();if(!e.persisted){destroyed=true;art.removeEventListener('load',prepareMask);observer.disconnect();intersection?.disconnect();document.removeEventListener('visibilitychange',sync);reduce.removeEventListener('change',sync);document.removeEventListener('pointerup',retryFromGesture);document.removeEventListener('keydown',retryFromGesture);window.removeEventListener('pageshow',onPageShow);window.removeEventListener('pagehide',onPageHide);video.removeEventListener('error',onError);video.removeAttribute('src');}};
 window.addEventListener('pagehide',onPageHide);window.addEventListener('pageshow',onPageShow);
 prepareMask();return true;
}
if(typeof document!=='undefined')mountVoidwalkExteriorMotion();
