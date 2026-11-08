/* Original review prototype. No external scripts, analytics, storage or network writes. */
export const STATIONS = [
  {name:'The Threshold',object:'The light sculpture',point:[.5,.40],halo:[835,365],zoom:1.08,title:'What might be possible?',question:'The first light waits for a little curiosity. How would you like to begin?',choices:[['Ask a new question','Curiosity can be enough to begin. You do not need the whole answer.','Make space for a question.'],['Take one small step','A small beginning is still a beginning. Your next step can be your own.','Begin with one small step.']]},
  {name:'The Unknowing',object:'The compass',point:[.255,.43],halo:[436,384],zoom:1.28,title:'Turn the question around.',question:'Some directions come from habit. What would you like to look at with fresh eyes?',choices:[['An old assumption','You can make room for another possibility without needing certainty today.','Revisit one assumption.'],['My own direction','Notice what matters to you, then let it help you choose your direction.','Choose a direction that feels true.']]},
  {name:'The Labyrinth',object:'The path table',point:[.155,.73],halo:[250,685],zoom:1.22,title:'Pause at the path table.',question:'The Labyrinth is a short reflection. Think of a situation in your life. Would trying a different approach or taking a pause help? Choose below to light the table and add a star to your constellation.',choices:[['Try a different turn','A new route does not erase what you learned along the way.','Allow a different route.'],['Pause and notice','A pause can be part of the path. Notice what is here before moving on.','Leave room for a pause.']]},
  {name:'The Ember',object:'The amber light',point:[.81,.395],halo:[1361,357],zoom:1.26,title:'What keeps your light alive?',question:'Bring to mind something that helps you keep going, however small.',choices:[['Someone who supports me','You do not have to carry everything alone. Support can be part of your strength.','Let support be part of your strength.'],['Something within me','Notice the effort you have already made. You can choose one gentle next step.','Notice your own persistence.']]},
  {name:'The Table',object:'The open seat',point:[.84,.68],halo:[1404,601],zoom:1.13,title:'Make room for belonging.',question:'There is an open seat. How would you like to carry this feeling beyond the room?',choices:[['Take my place','You can show up as you are, without having everything figured out.','Let yourself take up space.'],['Make room for someone','A small invitation can make the world feel more welcoming.','Offer someone a little room.']]}
];

const room=document.querySelector('.voidwalk'),view=document.querySelector('.chamber-view'),plane=document.querySelector('.chamber-plane');
const question=document.querySelector('#step-question'),title=document.querySelector('#step-title'),label=document.querySelector('#step-label'),response=document.querySelector('#step-response'),actions=document.querySelector('#console-actions');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let active=-1,answers=Array(5).fill(null),wide=view.clientWidth>700,focusPoint=[.5,.5],zoom=1,paused=reduce.matches,soundOn=false,audio=null,panGesture=null,suppressClick=false,note='';
room.classList.toggle('paused',paused);document.querySelector('#motion').setAttribute('aria-pressed',String(paused));document.querySelector('#motion').textContent=paused?'Resume motion':'Pause motion';

function fit(){
 // Arrive and resize directly; only deliberate object focus animates.
 const w=view.clientWidth,h=view.clientHeight,bw=Math.max(w,h*1672/941),bh=bw*941/1672;
 const resized=plane.style.width!==bw+'px'||plane.style.height!==bh+'px';
 plane.style.transition=wide||resized?'none':'';
 plane.style.width=bw+'px';plane.style.height=bh+'px';
 const z=wide?Math.min(w/bw,h/bh):zoom,px=wide?.5:focusPoint[0],py=wide?.5:focusPoint[1];
 const x=wide?(w-bw*z)/2:Math.max(w-bw*z,Math.min(0,w/2-bw*z*px)),y=wide?(h-bh*z)/2:Math.max(h-bh*z,Math.min(0,h/2-bh*z*py));
 plane.style.transform=`translate(${x}px,${y}px) scale(${z})`;
}
new ResizeObserver(fit).observe(view);window.addEventListener('resize',fit);fit();

function go(i,focus=true){
 question.hidden=false;active=i;wide=i===2&&view.clientWidth>700;focusPoint=[...STATIONS[i].point];zoom=STATIONS[i].zoom;
 document.querySelector('#wide').textContent='Whole room';
 const station=STATIONS[i];
 label.textContent=`${i+1} of 5 · ${station.object}`;title.textContent=station.title;question.textContent=station.question;response.hidden=true;response.classList.toggle('labyrinth-response',i===2);
 actions.replaceChildren();
 document.querySelectorAll('[data-select]').forEach(b=>b.setAttribute('aria-current',Number(b.dataset.select)===i?'step':'false'));
 if(answers[i]!==null)showAnswer(i,answers[i],false);else station.choices.forEach((choice,index)=>{const b=document.createElement('button');b.type='button';b.textContent=choice[0];b.addEventListener('click',()=>choose(i,index));actions.append(b)});
 fit();if(focus)title.focus({preventScroll:true});
}

// A persistent acknowledgement, not a maze animation or a new route to solve.
function setLabyrinthLight(on){
 let light=document.querySelector('#labyrinth-choice-light');
 if(!light&&on){
  light=document.createElementNS('http://www.w3.org/2000/svg','ellipse');light.id='labyrinth-choice-light';
  for(const [key,value]of Object.entries({cx:250,cy:685,rx:200,ry:44,fill:'none',stroke:'#ffe1ae','stroke-width':3,opacity:.85,'aria-hidden':'true'}))light.setAttribute(key,String(value));
  document.querySelector('.chamber-light').append(light);
 }
 if(light)light.style.display=on?'':'none';
}

function choose(i,choice){
 answers[i]=choice;document.querySelector(`[data-select="${i}"]`).classList.add('visited');
 document.querySelector(`[data-path="${i}"]`).classList.add('lit');document.querySelector(`[data-star="${i}"]`).classList.add('lit');document.querySelector(`[data-sky-line="${i}"]`).classList.add('lit');
 const halo=document.querySelector('#station-halo');halo.setAttribute('cx',STATIONS[i].halo[0]);halo.setAttribute('cy',STATIONS[i].halo[1]);
 const group=document.querySelector('.station-response');group.classList.remove('responding');void group.getBoundingClientRect();group.classList.add('responding');
 if(i===2)setLabyrinthLight(true);
 chime([220,261.63,293.66,329.63,392][i]);showAnswer(i,choice,true);
 document.querySelector('#room-announcement').textContent=`${STATIONS[i].name}: ${STATIONS[i].choices[choice][1]} ${answers.filter(v=>v!==null).length} of 5 lights are now part of your constellation.`;
}

function showAnswer(i,choice,focus){
 question.hidden=true;response.hidden=false;response.textContent=STATIONS[i].choices[choice][1];actions.replaceChildren();
 if(i===2){
  response.classList.add('labyrinth-response');response.tabIndex=-1;response.setAttribute('role','status');response.setAttribute('aria-live','polite');
  const chosen=document.createElement('strong');chosen.textContent='You chose: '+STATIONS[i].choices[choice][0];
  const thought=document.createElement('span');thought.textContent=STATIONS[i].choices[choice][1];
  const feedback=document.createElement('span');feedback.className='labyrinth-feedback';feedback.textContent='The table outline is lit, and a star has been added above. Take a moment, then choose Continue when you are ready.';
  response.replaceChildren(chosen,thought,feedback);
 }else{response.classList.remove('labyrinth-response');response.removeAttribute('role');response.removeAttribute('aria-live');}

 const next=document.createElement('button');next.type='button';next.className='primary-action';const done=answers.every(v=>v!==null);next.textContent=done?'See your constellation':i===2?'Continue':'Walk on';next.addEventListener('click',()=>{question.hidden=false;if(done)finish();else{let ni=(i+1)%5;while(answers[ni]!==null)ni=(ni+1)%5;go(ni)}});actions.append(next);
 const revise=document.createElement('button');revise.type='button';revise.className='secondary-action';revise.textContent='Choose differently';revise.onclick=()=>{if(i===2)setLabyrinthLight(false);answers[i]=null;question.hidden=false;document.querySelector(`[data-select="${i}"]`).classList.remove('visited');for(const attr of ['path','star','sky-line'])document.querySelector(`[data-${attr}="${i}"]`).classList.remove('lit');go(i)};actions.append(revise);
 document.querySelector('#restart').hidden=false;if(focus){if(i===2){response.focus({preventScroll:true});response.scrollIntoView?.({block:'nearest'});}else next.focus({preventScroll:true});}
}

function finish(){
 active=-2;wide=view.clientWidth>700;focusPoint=[.5,.35];zoom=1;fit();label.textContent='Five choices. Your own path.';title.textContent='A constellation, made by you.';question.hidden=false;question.textContent='Every small choice added a light. What is one thing you would like to carry into your day?';response.hidden=true;
 actions.innerHTML='<label class="note-label" for="carry-note">One small thing to carry with you (optional)</label><textarea id="carry-note" rows="2" maxlength="400" placeholder="Today, I could…"></textarea><p class="note-privacy">Private to this page. Nothing is sent or saved.</p>';
 const input=document.querySelector('#carry-note');input.value=note;input.addEventListener('input',()=>{note=input.value});
 document.querySelectorAll('[data-select]').forEach(b=>b.setAttribute('aria-current','false'));
 document.querySelector('#room-announcement').textContent='All five lights are connected in the ceiling. Your walk is complete.';title.focus({preventScroll:true});chime(523.25);
}

function reset(){
 setLabyrinthLight(false);
 active=-1;answers=Array(5).fill(null);note='';wide=view.clientWidth>700;focusPoint=[.5,.5];zoom=1;fit();
 document.querySelectorAll('.lit,.visited').forEach(e=>e.classList.remove('lit','visited'));document.querySelectorAll('[data-select]').forEach(b=>b.setAttribute('aria-current','false'));
 label.textContent='A room of possibility';title.textContent='A little wonder. A path of your own.';question.hidden=false;question.textContent='Explore five objects. Make a small choice at each one. Watch your path become a constellation.';response.hidden=true;
 actions.innerHTML='<button class="primary-action" id="begin" type="button">Begin the walk <span aria-hidden="true">↗</span></button><p class="console-aside">About two minutes. No right answers.</p>';document.querySelector('#begin').onclick=()=>go(0);document.querySelector('#restart').hidden=true;document.querySelector('#room-announcement').textContent='A new walk is ready. Your previous choices and note have been cleared.';title.focus({preventScroll:true});
}

document.querySelector('#begin').onclick=()=>go(0);
document.querySelectorAll('[data-station],[data-select]').forEach(b=>b.addEventListener('click',()=>{if(suppressClick)return;question.hidden=false;go(Number(b.dataset.station??b.dataset.select));}));
document.querySelector('#wide').onclick=()=>{wide=true;fit();document.querySelector('#room-announcement').textContent='Looking at the whole room. Your place in the walk is unchanged.'};

document.querySelector('#restart').onclick=reset;
document.querySelector('#pan-left').onclick=()=>panBy(-.19);document.querySelector('#pan-right').onclick=()=>panBy(.19);
function panBy(amount){if(wide){wide=false;zoom=1;focusPoint=[.5,.5]}focusPoint[0]=Math.max(0,Math.min(1,focusPoint[0]+amount));fit()}
view.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||e.target.closest('.scene-edge-control'))return;panGesture={id:e.pointerId,x:e.clientX,start:[...focusPoint],moved:false};});
view.addEventListener('pointermove',e=>{if(!panGesture||panGesture.id!==e.pointerId||wide)return;const delta=e.clientX-panGesture.x;if(Math.abs(delta)<7&&!panGesture.moved)return;if(wide){wide=false;zoom=1;panGesture.start=[.5,.5]}panGesture.moved=true;view.classList.add('dragging');view.setPointerCapture(e.pointerId);focusPoint[0]=Math.max(0,Math.min(1,panGesture.start[0]-delta/(plane.clientWidth*zoom)));fit();});
function endPan(){if(panGesture?.moved){suppressClick=true;setTimeout(()=>suppressClick=false,100)}panGesture=null;view.classList.remove('dragging')}
view.addEventListener('pointerup',endPan);view.addEventListener('pointercancel',endPan);
document.querySelector('#motion').onclick=()=>{paused=!paused;room.classList.toggle('paused',paused);document.querySelector('#motion').setAttribute('aria-pressed',String(paused));document.querySelector('#motion').textContent=paused?'Resume motion':'Pause motion'};
reduce.addEventListener('change',()=>{if(reduce.matches&&!paused)document.querySelector('#motion').click()});

function ensureAudio(){if(audio)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;const context=new AC(),gain=context.createGain();gain.gain.value=0;gain.connect(context.destination);const voices=[110,164.81,220].map((frequency,i)=>{const oscillator=context.createOscillator(),g=context.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;g.gain.value=.012/(i+1);oscillator.connect(g).connect(gain);oscillator.start();return oscillator});audio={context,gain,voices};return true}
document.querySelector('#sound').onclick=async()=>{if(!ensureAudio()){document.querySelector('#room-announcement').textContent='Sound is not available in this browser.';return;}try{await audio.context.resume();soundOn=!soundOn;audio.gain.gain.setTargetAtTime(soundOn?.5:0,audio.context.currentTime,.2);document.querySelector('#sound').textContent=soundOn?'Sound on':'Sound off';document.querySelector('#sound').setAttribute('aria-pressed',String(soundOn));}catch{document.querySelector('#room-announcement').textContent='Sound could not start. You can continue without it.'}};
function chime(frequency){if(!soundOn||!audio)return;const o=audio.context.createOscillator(),g=audio.context.createGain(),t=audio.context.currentTime;o.frequency.value=frequency;o.type='sine';g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.06,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+1.8);o.connect(g).connect(audio.gain);o.start(t);o.stop(t+2)}
document.addEventListener('visibilitychange',()=>{if(!audio)return;if(document.hidden)audio.context.suspend();else if(soundOn)audio.context.resume().catch(()=>{})});
window.addEventListener('pagehide',()=>audio?.context.close());
