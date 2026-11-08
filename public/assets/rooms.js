/* Two linked 2.5D rooms. An explicit edge doorway owns its swipe; normal pan remains independent. */
(()=>{const boutique=/\/boutique(?:\.html)?\/?$/.test(location.pathname),dest=boutique?'./index.html':'./boutique.html',name=boutique?'Headquarters':'Boutique';
const nav=document.createElement('nav');nav.className='room-map';nav.setAttribute('aria-label','Rooms');nav.innerHTML=`<a href="./index.html" ${!boutique?'aria-current="page"':''}>Headquarters</a><span aria-hidden="true">—</span><a href="./boutique.html" ${boutique?'aria-current="page"':''}>Boutique</a><a href="./library.html">Library</a>`;const menu=document.createElement('details');menu.className='compact-room-menu';menu.innerHTML='<summary>Room menu</summary><div class="room-menu-content"></div>';document.body.append(menu);const menuContent=menu.querySelector('.room-menu-content');menuContent.append(nav);
for(const element of document.querySelectorAll('.sanctuary-nav,.scene-controls,footer nav[aria-label="Boutique collections"]'))menuContent.append(element);
const tools=document.querySelector('.room-tools');if(tools)for(const button of [...tools.querySelectorAll('button')])menuContent.append(button);
const portalArt=['./assets/sanctuary-polished-v5.png','./assets/boutique-polished-hq-v2.png','./assets/beyond-the-script-public-cover.png'];
const portalNotes=['Return to the sanctuary','Explore the collection','Books & new perspectives'];
[...nav.querySelectorAll('a')].forEach((a,index)=>{const name=a.textContent;a.classList.add('room-portal');a.innerHTML=`<img src="${portalArt[index]}" alt=""><span><strong>${name}</strong><small>${portalNotes[index]}</small></span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>`;});
for(const button of menuContent.querySelectorAll('[data-open-station]')){if(button.dataset.openStation==='reflect')button.textContent='Start Here · Reflection desk';else if(button.dataset.openStation!=='resources')button.textContent+=' · Coming soon';}
const objectOptions=document.createElement('details');objectOptions.className='room-object-options';objectOptions.innerHTML='<summary>Room objects</summary>';
for(const group of menuContent.querySelectorAll('.sanctuary-nav,nav[aria-label="Boutique collections"]'))objectOptions.append(group);
const rail=document.createElement('div');rail.className='room-control-rail';rail.setAttribute('aria-label','Scene controls');
for(const control of menuContent.querySelectorAll('#reset-view,#motion-toggle,#lights-toggle,#boutique-motion,#center-view,#wide-view'))rail.append(control);
for(const empty of menuContent.querySelectorAll('.scene-controls'))if(!empty.children.length)empty.remove();
menuContent.append(rail,objectOptions);
const closeMenu=document.createElement('button');closeMenu.type='button';closeMenu.className='close-room-menu';closeMenu.setAttribute('aria-label','Close Room menu');closeMenu.textContent='Close ×';menuContent.prepend(closeMenu);closeMenu.onclick=()=>{menu.open=false;menu.querySelector('summary').focus()};document.addEventListener('pointerdown',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false;});const startLink=document.createElement('a');startLink.href='./start.html';startLink.className='start-practice-link';startLink.textContent='Start Here · a quiet practice';nav.after(startLink);
// Separate room navigation, visitor resources, and optional display controls.
const resourceLinks=document.createElement('section');resourceLinks.className='room-resource-links';resourceLinks.setAttribute('aria-label','Resources');
const libraryLink=nav.querySelector('a[href="./library.html"]');if(libraryLink){libraryLink.className='';libraryLink.textContent='Library · books and guides';resourceLinks.append(libraryLink)}
resourceLinks.append(startLink);nav.after(resourceLinks);
const chamberLink=document.createElement('a');chamberLink.href='./voidwalk.html';chamberLink.className='room-portal';chamberLink.innerHTML='<img src="./assets/voidwalk-chamber-v3.png" alt=""><span><strong>Voidwalk Chamber</strong><small>A journey through five discoveries</small></span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';nav.append(chamberLink);
const displayOptions=document.createElement('details');displayOptions.className='room-display-options';displayOptions.innerHTML='<summary>Display & room controls</summary>';displayOptions.append(rail,objectOptions);menuContent.append(displayOptions);
const polish=document.createElement('link');polish.rel='stylesheet';polish.href='./assets/room-menu-polish.css';document.head.append(polish);
// Restart deliberately clears only this experience's per-tab progress.
const restart=document.createElement('button');restart.type='button';restart.id='restart-experience';restart.textContent='Restart experience';restart.setAttribute('aria-label','Restart the experience from the galaxy entrance');rail.append(restart);
restart.addEventListener('click',()=>{
 if(restart.disabled)return;restart.disabled=true;menu.open=false;
 window.dispatchEvent(new Event('academy-restart'));
 window.academyWelcome?.stop('Restarting the experience…');
 const keys=['academy-arrived','voidwalker-cat-arrived-v2','voidwalker-welcome-once-v1','academy-hq-pan','academy-boutique-pan','academy-journey','academy-boutique-tour'];
 const clearProgress=()=>{try{for(const key of keys)sessionStorage.removeItem(key);}catch{}};
 clearProgress();
 // Existing journey/pagehide handlers save progress. Clear after them too.
 window.addEventListener('pagehide',clearProgress,{once:true});
 if(window.academyNavigate)window.academyNavigate('./index.html');else location.assign('./index.html');
});

menu.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;if(!e.target.closest('button[data-open-station]'))menu.querySelector('summary').focus()}});
menuContent.addEventListener('click',e=>{if(e.target.closest('button[data-category],button[data-open-station],a')){menu.open=false;if(!e.target.closest('button[data-open-station]'))menu.querySelector('summary').focus()}});

const door=document.createElement('a');door.href=dest;door.draggable=false;door.addEventListener('dragstart',e=>e.preventDefault());door.className='swipe-door '+(boutique?'door-left':'door-right');door.setAttribute('aria-label',`Go to ${name}. Swipe ${boutique?'right':'left'} from this doorway, or tap.`);door.innerHTML=`<span aria-hidden="true">${boutique?'‹':'›'}</span><small>${name}</small>`;document.body.append(door);
let d=null,suppress=0;function reset(){d=null;door.classList.remove('ready');door.style.removeProperty('--pull')}
door.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;d={id:e.pointerId,x:e.clientX,y:e.clientY};door.setPointerCapture(e.pointerId)});
door.addEventListener('pointermove',e=>{if(!d||e.pointerId!==d.id)return;const dx=(e.clientX-d.x)*(boutique?1:-1),dy=Math.abs(e.clientY-d.y);door.classList.toggle('ready',dx>90&&dy<65);door.style.setProperty('--pull',Math.min(24,Math.max(0,dx)/5)+'px')});
door.addEventListener('pointerup',e=>{if(!d)return;const dx=(e.clientX-d.x)*(boutique?1:-1),dy=Math.abs(e.clientY-d.y);if(Math.abs(e.clientX-d.x)>8||dy>8)suppress=performance.now()+400;const go=dx>90&&dy<65;reset();if(go)window.academyNavigate(dest)});door.addEventListener('pointercancel',reset);door.addEventListener('click',e=>{if(performance.now()<suppress)e.preventDefault()});
for(const point of document.querySelectorAll('.point'))for(const node of [...point.childNodes])if(node.nodeType===3&&node.textContent.trim()){const label=document.createElement('span');label.className='object-label';label.textContent=node.textContent;node.replaceWith(label)}
if(!boutique){const plaque=document.createElement('a');plaque.className='library-shelf-plaque';plaque.href='./library.html';plaque.textContent='LIBRARY';plaque.setAttribute('aria-label','Library — open the book collection');document.querySelector('#stage')?.append(plaque);}
if(!boutique){const chart=document.createElement('img');chart.src='./assets/celestial-wall-chart.svg';chart.alt='';chart.className='celestial-wall-chart';document.querySelector('#stage')?.append(chart);const telescope=document.createElement('button');telescope.className='sanctuary-telescope';telescope.type='button';telescope.setAttribute('aria-label','Telescope — look closer at the galaxy');telescope.innerHTML='<img src="./assets/observatory-slender-refractor-v4.png" alt="" draggable="false">';document.querySelector('#stage')?.append(telescope);telescope.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('academy-telescope-view'));});}
const note=document.querySelector('#room-status')||document.querySelector('#scene-status');
const dock=document.createElement('section');dock.className='room-info-dock';dock.setAttribute('aria-label','Room information and controls');
const info=document.createElement('div');info.className='room-info-copy';
if(note){note.textContent='Explore the room · touch an object, or drag to look around.';info.append(note)}
dock.append(info,menu);document.body.append(dock);
document.addEventListener('click',event=>{if(event.target.closest?.('.object-point,.point,.journal-display,[data-open-station],[data-category],.sanctuary-telescope'))window.academyInfoLockUntil=performance.now()+5000;},true);
const tips={reflect:'Start Here · a quiet reflection practice',watch:'Viewing screen · Coming soon',resources:'The Library · Explore the book collection',apparel:'Apparel · Coming soon',crystals:'Crystals & objects · Coming soon',art:'Art & atmosphere · Coming soon',journals:'The Library · Explore the book collection'};
for(const object of document.querySelectorAll('.object-point,.point,.journal-display')){
 const show=()=>{if(performance.now()<(window.academyInfoLockUntil||0))return;if(note)note.textContent=tips[object.dataset.station||object.dataset.category]||'Explore this room object';};
 object.addEventListener('focus',show);
 object.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')show()});
}
door.addEventListener('focus',()=>{if(note)note.textContent='Visit '+name+' · tap the doorway or swipe from the edge.'});
// Additive desk preview: approved HTML, room artwork and station behavior stay unchanged.
if(!boutique){
 const cardsStyle=document.createElement('link');cardsStyle.rel='stylesheet';cardsStyle.href='./assets/abundance-cards.css?v=preview-20261103-1';document.head.append(cardsStyle);
 import('./abundance-cards.js?v=preview-20261103-1').then(({mountAbundanceDeck})=>mountAbundanceDeck()).catch(error=>console.error('Abundance Cards preview could not load',error));
}
})();

// Focused additions keep approved source HTML and room artwork unchanged.
if(document.querySelector('#stage'))import('./telescope-journey.js').then(({mountGalaxyJourney})=>mountGalaxyJourney());
if(document.querySelector('#boutique-stage'))import('./apparel-coming-soon.js').then(({mountApparelComingSoon})=>mountApparelComingSoon());
{const style=document.createElement('link');style.rel='stylesheet';style.href='./assets/interaction-polish.css';document.head.append(style);}
