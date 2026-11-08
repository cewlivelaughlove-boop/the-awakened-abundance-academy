/** Preserve archived room HTML; repair only its isolated media lifecycle controller. */
export function repairSanctuaryPlayback(html: string): string {
  const start = html.indexOf('function f(){if(p.dataset.mediaState!=="ready")');
  const end = html.indexOf('p.muted=!0;p.addEventListener("loadeddata",f,{once:!0});', start);
  if (start < 0 || end < 0) return html;
  const controller = `let motionAttempt=0,autoplayBlocked=false;
function f(){
 const token=++motionAttempt;
 if(p.dataset.mediaState!=="ready"){i.setMotion(c);i.setStatus(p.dataset.mediaState==="error"?"The still galaxy is available. Video could not load.":"Preparing the galaxy view…");return;}
 i.setMotion(c);
 if(c||!D){p.pause();if(c)i.setStatus("Galaxy motion paused. You can still explore the room.");return;}
 p.muted=true;p.defaultMuted=true;p.playsInline=true;
 const result=p.play();
 if(result)result.then(()=>{
  if(token!==motionAttempt||c||!D)return;
  autoplayBlocked=false;delete p.dataset.autoplayBlocked;
  i.setStatus("Touch a room object to explore · drag to look around.");
 }).catch(error=>{
  if(token!==motionAttempt||c||!D)return;
  // Source changes and interrupted requests do not mean the visitor chose Pause.
  if(error.name==='AbortError')return;
  c=true;autoplayBlocked=error.name==='NotAllowedError';
  if(autoplayBlocked)p.dataset.autoplayBlocked='true';
  i.setMotion(true);i.setStatus("Tap the room or Resume motion to start the galaxy.");
 });
}
function retryBlockedMotion(){
 if(!autoplayBlocked||M.matches||document.hidden)return;
 autoplayBlocked=false;delete p.dataset.autoplayBlocked;c=false;D=true;f();
}
// A real entrance/tap gesture lets Safari resume a browser-blocked muted video.
window.addEventListener('academy-entered',retryBlockedMotion);
document.addEventListener('click',event=>{
 if(event.target.closest?.('#motion-toggle'))return;
 retryBlockedMotion();
});
p.addEventListener('canplay',()=>{if(!c&&D)f();});
window.addEventListener('pageshow',()=>{D=!document.hidden;f();});
`;
  return html.slice(0, start) + controller + html.slice(end);
}
