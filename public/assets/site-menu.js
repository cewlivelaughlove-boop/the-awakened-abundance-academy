/* One navigation component for every public page. No room or signup state changes. */
(()=>{
 const rooms=[
  {file:'index.html',name:'Headquarters',note:'The sanctuary',image:'sanctuary-black-floor-approved-v1.webp'},
  {file:'boutique.html',name:'Boutique',note:'Objects for your practice',image:'boutique-right-doorway-black-floor-v2.webp'},
  {file:'voidwalk.html',name:'Dark Room',note:'A quiet space for reflection',image:'voidwalk-chamber-v3-lossless-v1.webp'},
 ];
 const normalize=path=>{const stem=(path.replace(/\/+$/,'').split('/').pop()||'index').replace(/\.html$/,'');return(stem==='entrance-review'?'index':stem)+'.html';};
 window.academyMenuRooms=rooms;window.academyNormalizeRoom=normalize;
 if(document.getElementById('academy-site-menu')){window.academySiteMenu=document.getElementById('academy-site-menu');return;}
 const file=normalize(location.pathname),menu=document.createElement('details');menu.id='academy-site-menu';menu.className='proof-room-menu';
 menu.innerHTML='<summary aria-label="Website menu">Menu</summary><div class="proof-menu-inner"><button type="button" class="proof-close">Close ×</button><a class="proof-signup-link" href="./join.html"><strong>Email Signup</strong><span aria-hidden="true">→</span></a><nav aria-label="Rooms"></nav><div class="proof-resources"><a href="./library.html">Library</a><a href="./start.html">Start Here</a></div><details class="proof-settings"><summary>Display & room controls</summary><div></div></details><p class="proof-private-note"><a href="https://thefruitfulassets.com" target="_blank" rel="noopener noreferrer"><span>Created by</span><strong>Fruitful Assets</strong></a></p></div>';
 for(const room of rooms){const a=document.createElement('a');a.href='./'+room.file;a.className='proof-room-card';a.innerHTML='<strong>'+room.name+'</strong><span aria-hidden="true">→</span>';menu.querySelector('nav').append(a);}
 for(const a of menu.querySelectorAll('a[href]')){const u=new URL(a.href,location.href);if(u.origin===location.origin&&normalize(u.pathname)===file)a.setAttribute('aria-current','page');}
 const summary=menu.querySelector('summary');const close=()=>{menu.open=false;summary.focus()};
 menu.querySelector('.proof-close').onclick=close;
 menu.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}});
 document.addEventListener('pointerdown',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false;});
 document.body.append(menu);window.academySiteMenu=menu;
})();
