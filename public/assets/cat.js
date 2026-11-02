/* Silent five-second walk, only after the entrance has fully revealed the room. */
(()=>{
 const stage=document.querySelector('#stage');if(!stage)return;
 const cat=document.createElement('img');cat.className='sanctuary-cat';cat.alt='An orange-and-white cat resting beside the sofa';cat.draggable=false;cat.setAttribute('aria-hidden','true');stage.append(cat);
 const seated='./assets/ringo-seated-v2.png',key='voidwalker-cat-arrived-v2';
 let timer,played=false,restarting=false;
 try{played=sessionStorage.getItem(key)==='yes'}catch{}
 const remember=()=>{if(restarting)return;played=true;try{sessionStorage.setItem(key,'yes')}catch{}};
 const still=()=>{clearTimeout(timer);cat.onload=null;cat.hidden=false;cat.src=seated;remember();};
 const begin=()=>{
  if(restarting)return;
  if(played||matchMedia('(prefers-reduced-motion: reduce)').matches){still();return;}
  cat.onload=()=>{cat.onload=null;cat.hidden=false;timer=setTimeout(still,5000)};
  cat.onerror=still;cat.src='./assets/ringo-walk-sit-v2-once.webp';
 };
 cat.src=seated;
 if(document.documentElement.classList.contains('arrival-pending')){
  cat.hidden=true;
  window.addEventListener('academy-room-revealed',begin,{once:true});
 }else begin();
 window.addEventListener('academy-restart',()=>{restarting=true;clearTimeout(timer);cat.onload=null;});
 window.addEventListener('pagehide',()=>{clearTimeout(timer);remember();});
 window.addEventListener('pageshow',e=>{if(e.persisted&&!restarting)still();});
})();
