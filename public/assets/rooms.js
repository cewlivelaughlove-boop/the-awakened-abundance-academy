/* Two linked 2.5D rooms. An explicit edge doorway owns its swipe; normal pan remains independent. */
(()=>{const boutique=/\/boutique(?:\.html)?\/?$/.test(location.pathname),dest=boutique?'./index.html':'./boutique.html',name=boutique?'Headquarters':'Boutique';
const nav=document.createElement('nav');nav.className='room-map';nav.setAttribute('aria-label','Rooms');nav.innerHTML=`<a href="./index.html" ${!boutique?'aria-current="page"':''}>Headquarters</a><span aria-hidden="true">—</span><a href="./boutique.html" ${boutique?'aria-current="page"':''}>Boutique</a><a href="./library.html">Library</a>`;const menu=document.createElement('details');menu.className='compact-room-menu';menu.innerHTML='<summary>Room menu</summary><div class="room-menu-content"></div>';document.body.append(menu);const menuContent=menu.querySelector('.room-menu-content');menuContent.append(nav);
for(const element of document.querySelectorAll('.sanctuary-nav,.scene-controls,footer nav[aria-label="Boutique collections"]'))menuContent.append(element);
const tools=document.querySelector('.room-tools');if(tools)for(const button of [...tools.querySelectorAll('button')])menuContent.append(button);
const portalArt=['./assets/sanctuary-polished-v5.png','./assets/boutique-polished-hq-v2.png','./assets/beyond-the-script-public-cover.png'];
const portalNotes=['Return to the sanctuary','Explore the collection','Books & new perspectives'];
[...nav.querySelectorAll('a')].forEach((a,index)=>{const name=a.textContent;a.classList.add('room-portal');a.innerHTML=`<img src="${portalArt[index]}" alt=""><span><strong>${name}</strong><small>${portalNotes[index]}</small></span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>`;});
for(const button of menuContent.querySelectorAll('[data-open-station]'))if(button.dataset.openStation!=='resources')button.textContent+=' · Coming soon';
const objectOptions=document.createElement('details');objectOptions.className='room-object-options';objectOptions.innerHTML='<summary>Room objects</summary>';
for(const group of menuContent.querySelectorAll('.sanctuary-nav,nav[aria-label="Boutique collections"]'))objectOptions.append(group);
const rail=document.createElement('div');rail.className='room-control-rail';rail.setAttribute('aria-label','Scene controls');
for(const control of menuContent.querySelectorAll('#reset-view,#motion-toggle,#lights-toggle,#boutique-motion,#center-view,#wide-view'))rail.append(control);
for(const empty of menuContent.querySelectorAll('.scene-controls'))if(!empty.children.length)empty.remove();
menuContent.append(rail,objectOptions);
menu.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;if(!e.target.closest('button[data-open-station]'))menu.querySelector('summary').focus()}});
menuContent.addEventListener('click',e=>{if(e.target.closest('button[data-category],button[data-open-station],a')){menu.open=false;if(!e.target.closest('button[data-open-station]'))menu.querySelector('summary').focus()}});

const door=document.createElement('a');door.href=dest;door.draggable=false;door.addEventListener('dragstart',e=>e.preventDefault());door.className='swipe-door '+(boutique?'door-left':'door-right');door.setAttribute('aria-label',`Go to ${name}. Swipe ${boutique?'right':'left'} from this doorway, or tap.`);door.innerHTML=`<span aria-hidden="true">${boutique?'‹':'›'}</span><small>${name}</small>`;document.body.append(door);
let d=null,suppress=0;function reset(){d=null;door.classList.remove('ready');door.style.removeProperty('--pull')}
door.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;d={id:e.pointerId,x:e.clientX,y:e.clientY};door.setPointerCapture(e.pointerId)});
door.addEventListener('pointermove',e=>{if(!d||e.pointerId!==d.id)return;const dx=(e.clientX-d.x)*(boutique?1:-1),dy=Math.abs(e.clientY-d.y);door.classList.toggle('ready',dx>90&&dy<65);door.style.setProperty('--pull',Math.min(24,Math.max(0,dx)/5)+'px')});
door.addEventListener('pointerup',e=>{if(!d)return;const dx=(e.clientX-d.x)*(boutique?1:-1),dy=Math.abs(e.clientY-d.y);if(Math.abs(e.clientX-d.x)>8||dy>8)suppress=performance.now()+400;const go=dx>90&&dy<65;reset();if(go)location.href=dest});door.addEventListener('pointercancel',reset);door.addEventListener('click',e=>{if(performance.now()<suppress)e.preventDefault()});
for(const point of document.querySelectorAll('.point'))for(const node of [...point.childNodes])if(node.nodeType===3&&node.textContent.trim()){const label=document.createElement('span');label.className='object-label';label.textContent=node.textContent;node.replaceWith(label)}
if(!boutique){const plaque=document.createElement('a');plaque.className='library-shelf-plaque';plaque.href='./library.html';plaque.textContent='LIBRARY';plaque.setAttribute('aria-label','Library — open the book collection');document.querySelector('#stage')?.append(plaque);}
if(!boutique){const chart=document.createElement('img');chart.src='./assets/celestial-wall-chart.svg';chart.alt='';chart.className='celestial-wall-chart';document.querySelector('#stage')?.append(chart);const telescope=document.createElement('button');telescope.className='sanctuary-telescope';telescope.type='button';telescope.setAttribute('aria-label','Telescope — look closer at the galaxy');telescope.innerHTML='<img src="./assets/observatory-telescope-rear-facing-v3.png" alt="" draggable="false">';document.querySelector('#stage')?.append(telescope);telescope.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('academy-telescope-view'));});}
const note=document.querySelector('#room-status')||document.querySelector('#scene-status');
const dock=document.createElement('section');dock.className='room-info-dock';dock.setAttribute('aria-label','Room information and controls');
const info=document.createElement('div');info.className='room-info-copy';
if(note){note.textContent='Explore the room · touch an object, or drag to look around.';info.append(note)}
dock.append(info,menu);document.body.append(dock);
document.addEventListener('click',event=>{if(event.target.closest?.('.object-point,.point,.journal-display,[data-open-station],[data-category],.sanctuary-telescope'))window.academyInfoLockUntil=performance.now()+5000;},true);
const tips={reflect:'Reflection desk · Coming soon',watch:'Viewing screen · Coming soon',resources:'The Library · Explore the book collection',apparel:'Apparel · Coming soon',crystals:'Crystals & objects · Coming soon',art:'Art & atmosphere · Coming soon',journals:'The Library · Explore the book collection'};
for(const object of document.querySelectorAll('.object-point,.point,.journal-display')){
 const show=()=>{if(performance.now()<(window.academyInfoLockUntil||0))return;if(note)note.textContent=tips[object.dataset.station||object.dataset.category]||'Explore this room object';};
 object.addEventListener('focus',show);
 object.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')show()});
}
door.addEventListener('focus',()=>{if(note)note.textContent='Visit '+name+' · tap the doorway or swipe from the edge.'});
})();
