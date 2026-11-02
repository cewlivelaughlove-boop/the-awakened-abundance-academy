(()=>{
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 document.body.classList.add('celestial-reading');
 const bg=document.createElement('div');bg.className='reading-universe';bg.setAttribute('aria-hidden','true');
 const video=document.createElement('video');video.muted=true;video.defaultMuted=true;video.playsInline=true;video.loop=true;video.preload='none';video.poster='./assets/planet-journey-poster-v4.png';bg.append(video);document.body.prepend(bg);
 const rail=document.createElement('div');rail.className='reading-motion';const button=document.createElement('button');button.type='button';button.textContent='Pause galaxy';rail.append(button);
 const header=document.querySelector('.site-header');if(header)header.after(rail);else document.body.append(rail);
 let paused=reduced.matches,loaded=false,loading=null,token=0;
 try{if(sessionStorage.getItem('academy-reading-paused')==='yes')paused=true;}catch{}
 function label(){button.disabled=reduced.matches;button.textContent=reduced.matches?'Still galaxy · reduced motion':paused?'Play galaxy':'Pause galaxy';button.setAttribute('aria-pressed',String(paused));}
 async function sync(){const attempt=++token;label();if(paused||document.hidden||reduced.matches){video.pause();return;}try{if(!loaded){loading??=window.academyMedia.load('journey');video.src=await loading;loaded=true;}if(attempt!==token||paused||document.hidden)return;video.muted=true;await video.play();}catch{if(attempt!==token)return;paused=true;label();button.textContent='Play galaxy';}}
 button.addEventListener('click',()=>{paused=!paused;try{sessionStorage.setItem('academy-reading-paused',paused?'yes':'no')}catch{}sync();});
 reduced.addEventListener('change',()=>{if(reduced.matches)paused=true;sync()});document.addEventListener('visibilitychange',sync);window.addEventListener('pagehide',()=>video.pause());sync();
})();
