/* User-initiated recorded welcome. No microphone, live chat, or autoplay. */
(() => {
  if (document.getElementById('cosmic-guide-launch')) return;
  const asset = document.currentScript?.dataset.asset || './assets/cosmic-guide-organic-v5.png';
  const stage = document.getElementById('stage');
  if (!stage) return;
  const welcome = 'Welcome to Voidwalker Academy. Take a gentle breath. You are welcome here, just as you are. Explore the sanctuary at your own pace. Discover Beyond the Script at the book display, or step next door into The Voidwalker Boutique. Let curiosity guide you. There is no need to rush. When you are ready, choose a doorway and begin.';
  const figure = document.createElement('button');
  figure.id = 'cosmic-guide-launch'; figure.type = 'button';
  figure.setAttribute('aria-label', 'Hear the guide’s welcome');
  const image = document.createElement('img'); image.src = asset; image.alt = ''; image.draggable = false;
  const label = document.createElement('span'); label.textContent = 'Hear welcome';
  figure.append(image, label); stage.append(figure);
  const moving=document.createElement('span');moving.className='guide-animation-crop';moving.setAttribute('aria-hidden','true');
  const performanceVideo=document.createElement('video');performanceVideo.muted=true;performanceVideo.defaultMuted=true;performanceVideo.playsInline=true;performanceVideo.preload='metadata';performanceVideo.disablePictureInPicture=true;moving.append(performanceVideo);figure.append(moving);
  const phoneAnimation = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const phoneImage=document.createElement('img');phoneImage.className='guide-phone-performance';phoneImage.alt='';phoneImage.draggable=false;moving.append(phoneImage);
  let phoneBlob=null,phoneURL=null,phoneLoading=null;
  function preparePhone(){return phoneLoading||(phoneLoading=fetch('./assets/naomi-full-phone.webp').then(r=>{if(!r.ok)throw Error('Animation unavailable');return r.blob()}).then(b=>{phoneBlob=b;return b}).catch(()=>{phoneLoading=null;return null}));}
  if(phoneAnimation){performanceVideo.removeAttribute('src');performanceVideo.load();preparePhone();}
  function showPhone(){if(!phoneBlob)return false;if(phoneURL)URL.revokeObjectURL(phoneURL);phoneURL=URL.createObjectURL(phoneBlob);phoneImage.onload=()=>{if(!speaking)return;figure.classList.add('is-animated','is-phone-animated');audio.play().catch(()=>{allowRetry();halt('Tap the guide again to begin the welcome.');});};phoneImage.onerror=()=>{allowRetry();halt('The moving welcome could not display. Please try again.');};phoneImage.src=phoneURL;return true;}
  let nativeLoading=null,nativeReady=false;
  function prepareNative(){if(phoneAnimation)return Promise.resolve(false);return nativeLoading||(nativeLoading=window.academyMedia.load('guide').then(url=>new Promise((resolve,reject)=>{performanceVideo.addEventListener('loadeddata',()=>{nativeReady=true;resolve(true);},{once:true});performanceVideo.addEventListener('error',reject,{once:true});performanceVideo.src=url;performanceVideo.load();})).catch(()=>{nativeLoading=null;return false;}));}
  let alphaSupported=null;
  function confirmAlpha(){
    if(performanceVideo.readyState<2)return false;
    try{const probe=document.createElement('canvas');probe.width=2;probe.height=2;const context=probe.getContext('2d',{willReadFrequently:true});context.clearRect(0,0,2,2);context.drawImage(performanceVideo,0,0,4,4,0,0,2,2);alphaSupported=context.getImageData(0,0,1,1).data[3]<20;}catch{alphaSupported=false;}
    return alphaSupported;
  }
  async function animateWelcome(){
    if(phoneAnimation){audio.pause();audio.currentTime=0;showPhone();return;}
    if(alphaSupported===false||!performanceVideo.canPlayType('video/webm; codecs="vp9"'))return;
    try{performanceVideo.currentTime=audio.currentTime;await performanceVideo.play();if(!speaking){performanceVideo.pause();return;}if(confirmAlpha()){if(Math.abs(performanceVideo.currentTime-audio.currentTime)>.15)performanceVideo.currentTime=audio.currentTime;figure.classList.add('is-animated');}else performanceVideo.pause();}catch{figure.classList.remove('is-animated');}
  }
  performanceVideo.addEventListener('error',()=>{alphaSupported=false;figure.classList.remove('is-animated');});

  const stop = document.createElement('button'); stop.id = 'cosmic-guide-stop'; stop.type = 'button'; stop.textContent = 'Stop'; stop.setAttribute('aria-label', 'Stop guide voice'); (document.querySelector('.room-info-dock')||stage).append(stop);
  const text = document.createElement('details'); text.id = 'cosmic-guide-transcript';
  text.innerHTML = '<summary>Read welcome</summary><p class="guide-note">AI guide · recorded welcome. No microphone or live conversation.</p><p class="guide-welcome"></p>';
  text.querySelector('.guide-welcome').textContent = welcome;
  (document.querySelector('.room-menu-content')||document.body).append(text);
  const status = document.querySelector('#scene-status');
  figure.addEventListener('focus',()=>{if(!speaking&&performance.now()>(window.academyInfoLockUntil||0))status.textContent=consumed?'Welcome complete · explore the room at your own pace.':'Tap the guide to enter and hear the welcome once.'});
  figure.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!speaking&&performance.now()>(window.academyInfoLockUntil||0))status.textContent=consumed?'Welcome complete · explore the room at your own pace.':'Tap the guide to enter and hear the welcome once.'});
  const audio = document.createElement('audio');
  audio.id = 'cosmic-guide-audio'; audio.src = './assets/naomi-voidwalker-academy-welcome.mp3';
  audio.preload = 'auto'; stage.append(audio);
  const visitKey='voidwalker-welcome-once-v1';
  let consumed=false;try{consumed=sessionStorage.getItem(visitKey)==='played';}catch{}
  figure.setAttribute('aria-label','Enter the room and hear the welcome');
  function allowRetry(){consumed=false;try{sessionStorage.removeItem(visitKey);}catch{}}
  function rememberWelcome(){consumed=true;try{sessionStorage.setItem(visitKey,'played');}catch{}}
  let serial = 0, speaking = false;
  function state(active) {
    speaking = active; stop.disabled = !active;if(!active){performanceVideo.pause();figure.classList.remove('is-animated','is-phone-animated');phoneImage.removeAttribute('src');if(phoneURL){URL.revokeObjectURL(phoneURL);phoneURL=null;}try{performanceVideo.currentTime=0;}catch{}}
    figure.setAttribute('aria-disabled', String(active));
    label.textContent = active ? 'Speaking…' : 'Hear welcome';
  }
  function halt(message = 'Guide stopped.') {
    serial++; audio.pause();
    try { audio.currentTime = 0; } catch {}
    state(false); status.textContent = message;
  }
  function beginWelcome(){
    if (speaking) return;
    if(consumed){status.textContent='Welcome complete · explore the room at your own pace.';return;}
    if(!phoneAnimation&&!nativeReady){status.textContent='Loading the moving welcome…';prepareNative().then(ok=>{status.textContent=ok?'Welcome ready · tap the guide to begin.':'The moving welcome could not load. Please try again.'});return;}
    if(phoneAnimation&&!phoneBlob){status.textContent='Loading the moving welcome…';preparePhone().then(b=>{status.textContent=b?'Welcome ready · tap the guide to begin.':'The moving welcome could not load. Please try again.'});return;}
    const token = ++serial;
    state(true); status.textContent = 'Starting welcome…';
    try { audio.currentTime = 0; } catch {}
    audio.play().then(() => {
      if (token === serial) {rememberWelcome();status.textContent = 'Welcome playing · select Stop to end the welcome.';animateWelcome();}
    }).catch(() => {
      if (token === serial) { state(false); status.textContent = 'Audio could not play. Read welcome is in the Room menu.'; }
    });
  }
  figure.addEventListener('click',beginWelcome);
  audio.addEventListener('ended', () => { state(false); status.textContent = 'Welcome complete · explore the room at your own pace.'; });
  audio.addEventListener('error', () => { consumed=false;try{sessionStorage.removeItem(visitKey);}catch{}state(false); status.textContent = 'Audio is unavailable. Read welcome is in the Room menu.'; });
  stop.addEventListener('click', () => { halt(); figure.focus({preventScroll:true}); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && speaking) halt(); });
  document.addEventListener('click', e => { if (e.target.closest?.('a[href]') && speaking) halt(); }, true);
  window.addEventListener('pagehide', () => halt());
  window.academyWelcome={prepare:()=>Promise.all([phoneAnimation?preparePhone():prepareNative(),new Promise(resolve=>{if(audio.readyState>=2)return resolve(true);audio.addEventListener('loadeddata',()=>resolve(true),{once:true});audio.addEventListener('error',()=>resolve(false),{once:true});audio.load();})]).then(results=>results.every(Boolean)),play:beginWelcome,stop:halt};
  state(false);
})();
