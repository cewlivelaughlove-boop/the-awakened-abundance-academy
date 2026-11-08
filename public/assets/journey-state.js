/* Per-tab playback continuity. No personal data or external requests. */
(() => {
  let saved={time:0,paused:false};
  try { const value=JSON.parse(sessionStorage.getItem('academy-journey')||'null'); if(value&&Number.isFinite(value.time)&&value.time>=0) saved={time:value.time,paused:value.paused===true}; } catch {}
  window.academyJourney=saved;
  const video=document.querySelector('#exterior,#boutique-exterior');
  if(!video)return;
  let restoring=saved.time>.1, objectURL=null;
  const motionPaused=()=>{
    const button=document.querySelector('#motion-toggle,#boutique-motion');
    return matchMedia('(prefers-reduced-motion: reduce)').matches || (button?button.getAttribute('aria-pressed')==='true':saved.paused);
  };
  function finish(){
    if(!restoring)return;
    restoring=false;
    video.dataset.journeyRestore='complete';
    if(motionPaused()||document.hidden)video.pause();
    else if(video.id!=='boutique-exterior')video.play().catch(error=>video.dispatchEvent(new CustomEvent('academy-journey-play-blocked',{detail:{name:error.name}})));
    video.dispatchEvent(new Event('academy-journey-ready'));
  }
  function seekAndFinish(target){
    let timer;
    const done=()=>{clearTimeout(timer);video.removeEventListener('seeked',done);video.removeEventListener('loadeddata',ready);finish();};
    const ready=()=>{if(!video.seeking&&video.readyState>=2)done();};
    video.addEventListener('seeked',done,{once:true});
    video.addEventListener('loadeddata',ready);
    // A no-op seek need not emit seeked. Never leave playback waiting forever.
    timer=setTimeout(done,3500);
    try {video.currentTime=target;ready();}catch {done();}
  }
  async function restore(){
    if(!restoring||!Number.isFinite(video.duration)||video.duration<=0)return;
    const target=saved.time%video.duration;
    const canSeek=Array.from({length:video.seekable.length},(_,i)=>[video.seekable.start(i),video.seekable.end(i)]).some(([a,b])=>target>=a&&target<=b);
    if(!canSeek){
      // Some static hosts ignore Range and expose a zero-length seekable range.
      // A local Blob of the same owned MP4 makes its full timeline seekable.
      // Only returning visitors need this fallback; first entry still streams.
      video.dataset.journeyRestore='loading-same-video';
      try {
        const source=video.currentSrc||video.querySelector('source')?.src;
        const response=await fetch(source,{credentials:'same-origin'});
        if(!response.ok)throw new Error('Video unavailable');
        const blob=await response.blob();
        objectURL=URL.createObjectURL(blob);
        video.pause();
        video.removeAttribute('autoplay');
        video.addEventListener('loadedmetadata',()=>{
          seekAndFinish(target);
        },{once:true});
        video.src=objectURL;
        video.load();
      } catch {
        video.dataset.journeyRestore='streaming-fallback';
        finish();
      }
    } else {
      seekAndFinish(target);
    }
  }
  if(video.readyState>=1)restore();else video.addEventListener('loadedmetadata',restore,{once:true});
  function save(){
    try {sessionStorage.setItem('academy-journey',JSON.stringify({time:restoring?saved.time:video.currentTime,paused:video.dataset.autoplayBlocked==='true'?false:motionPaused()}));}catch{}
  }
  window.addEventListener('pagehide',e=>{save();if(objectURL&&!e.persisted)URL.revokeObjectURL(objectURL);});
  document.addEventListener('click',e=>{if(e.target.closest?.('a[href]'))save();},true);
})();
