// Requires a verified, self-hosted Milky Way video. No planet-video substitution.
export function mountTelescopeEyepiece({ videoUrl, credit, sourceUrl, posterUrl } = {}) {
 if (!videoUrl || !credit || !sourceUrl) return false;
 const dialog=document.createElement('dialog');dialog.className='telescope-eyepiece';dialog.setAttribute('aria-label','Milky Way telescope');
 dialog.innerHTML='<button type="button" class="eyepiece-close" aria-label="Close telescope">Close</button><header class="eyepiece-heading"><p>THE OBSERVATORY</p><h2>Into the Milky Way</h2><span>Follow the luminous band of our galaxy toward its star-filled center.</span></header><div class="eyepiece-optics"><video muted playsinline loop preload="none"></video></div><p class="eyepiece-status" role="status"></p><button type="button" class="eyepiece-play">Play Milky Way</button><p class="eyepiece-credit"></p>';
 const video=dialog.querySelector('video'),status=dialog.querySelector('.eyepiece-status'),play=dialog.querySelector('.eyepiece-play');video.muted=true;video.playsInline=true;video.src=videoUrl;if(posterUrl)video.poster=posterUrl;
 const link=document.createElement('a');link.href=sourceUrl;link.textContent=credit;link.target='_blank';link.rel='noopener noreferrer';dialog.querySelector('.eyepiece-credit').append(link);const license=document.createElement('a');license.href='https://creativecommons.org/licenses/by/4.0/';license.textContent=' CC BY 4.0';license.target='_blank';license.rel='noopener noreferrer';dialog.querySelector('.eyepiece-credit').append(license);document.body.append(dialog);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let previous,attempt=0;
 async function start(){const token=++attempt;try{await video.play();if(token!==attempt||!dialog.open){video.pause();return;}play.textContent='Pause Milky Way';status.textContent='';}catch{if(token!==attempt)return;play.textContent='Play Milky Way';status.textContent='Tap Play to start the telescope video.';}}
 play.onclick=()=>{if(video.paused)start();else{video.pause();play.textContent='Play Milky Way';}};
 video.addEventListener('error',()=>{status.textContent='The telescope video could not load. Please try again later.';play.disabled=true;});
 window.addEventListener('academy-telescope-view',()=>{previous=document.activeElement;if(!dialog.open)dialog.showModal();if(!reduced.matches)start();else status.textContent='Reduced motion is on. Play when you are ready.';});
 dialog.querySelector('.eyepiece-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{attempt++;video.pause();previous?.focus();});document.addEventListener('visibilitychange',()=>{if(document.hidden){attempt++;video.pause();play.textContent='Play Milky Way';}});return true;
}
