/**
 * Original, self-hosted artistic galaxy simulation. Not a live telescope feed,
 * scientific star map, or recording. Canvas2D projects a navigable 3D particle
 * and nebula field. Optional Planet window reuses the existing local cinematic
 * MP4. No WebGL, third-party service, or new permissions required.
 */
export function mountGalaxyJourney() {
  if (window.__academyGalaxyJourney) return window.__academyGalaxyJourney;
  if (!document.querySelector('link[data-galaxy-journey]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = new URL('./telescope-journey.css', import.meta.url).href;
    style.dataset.galaxyJourney = '';
    document.head.append(style);
  }
  const dialog = document.createElement('dialog');
  dialog.className = 'galaxy-journey';
  dialog.setAttribute('aria-labelledby', 'galaxy-journey-title');
  dialog.innerHTML = `
    <button class="gj-close" type="button" aria-label="Close galaxy journey">Close <span aria-hidden="true">×</span></button>
    <header class="gj-heading"><p>THE OBSERVATORY · A JOURNEY BEYOND</p><h2 id="galaxy-journey-title">Drift among the stars</h2><p class="gj-intro">A luminous universe to move through. Take the controls and find your own way.</p></header>
    <div class="gj-view-switch" role="group" aria-label="Telescope view">
      <button type="button" data-view="travel" aria-pressed="true">Galaxy travel</button>
      <button type="button" data-view="planet" aria-pressed="false">Planet window</button>
    </div>
    <div class="gj-instrument">
      <div class="gj-rim"><div class="gj-glass">
        <canvas tabindex="0" aria-label="Interactive artistic galaxy. Drag or use arrow keys to steer. Space pauses travel. Plus and minus change the field of view."></canvas>
        <video class="gj-planet-video" muted loop playsinline preload="none" tabindex="0" hidden aria-label="Existing cinematic planet-window video. Use the visible Zoom in and Zoom out buttons for a closer or wider view."></video>
        <div class="gj-optical-reflection" aria-hidden="true"></div><div class="gj-reticle" aria-hidden="true"><i></i><i></i></div>
        <span class="gj-view-label">ARTISTIC SIMULATION</span><span class="gj-flight-label" aria-hidden="true">CRUISING</span>
      </div></div><span class="gj-index gj-index-top" aria-hidden="true"></span><span class="gj-index gj-index-bottom" aria-hidden="true"></span>
    </div>
    <p class="gj-hint" id="gj-hint">Drag the glass to steer · Scroll or pinch to look closer</p>
    <div class="gj-controls">
      <div class="gj-steering" role="group" aria-label="Steer the journey">
        <button type="button" data-steer="up" aria-label="Steer upward">↑</button>
        <button type="button" data-steer="left" aria-label="Steer left">←</button>
        <button type="button" data-action="home" aria-label="Return to the starting view">Home</button>
        <button type="button" data-steer="right" aria-label="Steer right">→</button>
        <button type="button" data-steer="down" aria-label="Steer downward">↓</button>
      </div>
      <div class="gj-flight-controls">
        <button class="gj-toggle" type="button" data-action="toggle" aria-pressed="false">Pause journey</button>
        <label class="gj-speed">Travel speed <input type="range" min="30" max="190" step="10" value="80" aria-label="Travel speed"><span>Gentle</span></label>
        <div class="gj-zoom" role="group" aria-label="Zoom controls"><button type="button" data-action="out"><b aria-hidden="true">−</b> Zoom out</button><span class="gj-zoom-readout">1.0× view</span><button type="button" data-action="in"><b aria-hidden="true">+</b> Zoom in</button></div>
      </div>
    </div>
    <p class="gj-status" role="status" aria-live="polite"></p>
    <p class="gj-disclosure">An original artistic 3D simulation, not a live telescope or a scientifically mapped sky.</p>`;
  document.body.append(dialog);
  const canvas = dialog.querySelector('canvas');
  const planetVideo = dialog.querySelector('.gj-planet-video');
  planetVideo.muted = planetVideo.defaultMuted = true;
  planetVideo.playsInline = true;
  planetVideo.poster = new URL('./planet-journey-poster-v4.png', import.meta.url).href;
  const ctx = canvas.getContext('2d', { alpha: false });
  const status = dialog.querySelector('.gj-status');
  const toggle = dialog.querySelector('.gj-toggle');
  const flightLabel = dialog.querySelector('.gj-flight-label');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const removers = [];
  const listen = (target, name, handler, options) => {
    target.addEventListener(name, handler, options);
    removers.push(() => target.removeEventListener(name, handler, options));
  };
  let previousFocus, frame = 0, lastTime = 0, lastPaint = 0, alive = true;
  let playing = !reduced.matches, dirty = true, worldTime = 0, distance = 0;
  let width = 640, ratio = 1, focal = 520, fieldOfView = 72;
  let yaw = 0, pitch = 0, targetYaw = 0, targetPitch = 0;
  const camera = { x: 0, y: 0, z: 0 };
  const pointers = new Map();
  let pinchDistance = 0, steering = null;
  const keys = new Set();
  let mode = 'travel', planetZoom = 1, planetRequested = false, planetLoading = false;
  let planetToken = 0, planetJob = null, ownedPlanetURL = null, planetController = null;
  const span = 6800, half = span / 2;
  const mobile = window.matchMedia('(max-width: 640px)').matches;
  const maxStars = mobile ? 650 : 1200;
  let targetFrame = mobile ? 1000 / 24 : 1000 / 30;
  let quality = 1, renderCost = 0;
  let seed = 123719;
  function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
  function normal() { return Math.sqrt(-2 * Math.log(Math.max(random(), .00001))) * Math.cos(random() * Math.PI * 2); }
  function wrap(n) { return ((n + half) % span + span) % span - half; }
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  const palettes = ['193,210,255', '226,211,255', '255,226,189', '175,231,240', '246,242,255'];
  const stars = [];
  for (let i = 0; i < maxStars; i++) {
    const z = random() * span - half;
    const clustered = i % 4 !== 0;
    const x = clustered ? normal() * 980 + Math.sin(z / 780) * 700 : random() * span - half;
    const y = clustered ? normal() * 380 + Math.sin(z / 1100) * 230 + x * .18 : random() * span - half;
    stars.push({ x: wrap(x), y: wrap(y), z, radius: .8 + random() * 2.9, bright: .45 + random() * .55, color: palettes[Math.floor(random() * palettes.length)], phase: random() * 6.28 });
  }
  // Distant points retain their directions while near objects show translation parallax.
  const distant = [];
  for (let i = 0; i < (mobile ? 180 : 350); i++) {
    const a = random() * Math.PI * 2, b = Math.asin(random() * 2 - 1);
    distant.push({ x: Math.sin(a) * Math.cos(b), y: Math.sin(b), z: Math.cos(a) * Math.cos(b), bright: .16 + random() * .42 });
  }
  function nebulaSprite(color, variation) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d');
    if (!g) return c;
    g.scale(.5, .5);
    g.globalCompositeOperation = 'screen';
    for (let i = 0; i < 22; i++) {
      const a = i * .61 + variation, r = 20 + random() * 55;
      const x = 128 + Math.cos(a) * (i / 22) * 88, y = 128 + Math.sin(a * 1.3) * (i / 22) * 53;
      const glow = g.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, `rgba(${color},${.13 + random() * .14})`);
      glow.addColorStop(.35, `rgba(${color},.12)`); glow.addColorStop(1, `rgba(${color},0)`);
      g.fillStyle = glow; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    // Cut filaments into the luminous gas, avoiding flat gradient-ball clouds.
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 4; i++) {
      g.beginPath(); g.moveTo(18, 80 + i * 20);
      g.bezierCurveTo(100, 36 + i * 34, 146, 190 - i * 20, 235, 90 + i * 18);
      g.lineWidth = 8 + i * 3; g.strokeStyle = 'rgba(0,0,0,.17)'; g.stroke();
    }
    return c;
  }
  const cloudSprites = ctx ? [nebulaSprite('102,99,216', .6), nebulaSprite('60,158,173', 2), nebulaSprite('176,91,155', 4), nebulaSprite('210,156,100', 1.5)] : [];
  const clouds = [];
  for (let i = 0; i < (mobile ? 18 : 32); i++) {
    const z = random() * span - half;
    clouds.push({ x: Math.sin(z / 780) * 700 + normal() * 600, y: Math.sin(z / 1100) * 260 + normal() * 230, z, radius: 230 + random() * 540, sprite: i % 4, alpha: .36 + random() * .42, rotation: random() * 6.28 });
  }
  // A luminous, offset nursery is visible immediately, rather than an empty black opening.
  clouds.push({ x: 330, y: 150, z: 1500, radius: 780, sprite: 0, alpha: .9, rotation: .3 }, { x: -400, y: -110, z: 2100, radius: 1000, sprite: 1, alpha: .9, rotation: -.6 }, { x: 560, y: 240, z: 2300, radius: 600, sprite: 3, alpha: .7, rotation: .6 });
  let glowSprite;
  if (ctx) {
    glowSprite = document.createElement('canvas'); glowSprite.width = glowSprite.height = 64;
    const g = glowSprite.getContext('2d');
    const glow = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, 'rgba(220,230,255,.75)'); glow.addColorStop(.12, 'rgba(190,207,255,.36)'); glow.addColorStop(.4, 'rgba(126,158,255,.10)'); glow.addColorStop(1, 'rgba(90,130,255,0)');
    g.fillStyle = glow; g.fillRect(0, 0, 64, 64);
  }
  function resize() {
    if (!ctx || mode !== 'travel' || !dialog.open) return;
    width = Math.max(240, Math.min(760, canvas.clientWidth || 640));
    ratio = Math.min(window.devicePixelRatio || 1, 1);
    if (width * ratio > 560) ratio = 560 / width;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(width * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    focal = width / (2 * Math.tan(fieldOfView * Math.PI / 360)); dirty = true;
  }
  function updateZoom() {
    const magnification = mode === 'planet' ? planetZoom : Math.tan(72 * Math.PI / 360) / Math.tan(fieldOfView * Math.PI / 360);
    dialog.querySelector('.gj-zoom-readout').textContent = `${magnification.toFixed(1)}× ${mode === 'planet' ? 'video' : 'view'}`;
    planetVideo.style.transform = `scale(${planetZoom})`;
    dialog.querySelector('[data-action="out"]').disabled = mode === 'planet' ? planetZoom <= 1 : fieldOfView >= 95;
    dialog.querySelector('[data-action="in"]').disabled = mode === 'planet' ? planetZoom >= 3 : fieldOfView <= 43;
  }
  function syncControls(message) {
    const planet = mode === 'planet';
    const running = planet ? planetRequested : playing;
    toggle.textContent = planet ? (planetLoading ? (planetRequested ? 'Cancel playback' : 'Play planet window') : running ? 'Pause planet window' : 'Play planet window') : playing ? 'Pause journey' : 'Begin journey';
    toggle.setAttribute('aria-pressed', String(!running));
    flightLabel.textContent = planet ? (planetLoading ? 'LOADING LOCAL VIDEO' : running ? 'PLANET WINDOW · PLAYING' : 'PLANET WINDOW · PAUSED') : playing ? 'CRUISING' : 'PAUSED · EXPLORE FREELY';
    updateZoom();
    if (message) status.textContent = message;
  }
  function pausePlanet() {
    planetToken++; planetRequested = false; planetLoading = false;
    planetVideo.pause();
  }
  function localPlanetURL() {
    if (planetJob) return planetJob;
    planetJob = (async () => {
      if (typeof window.academyMedia?.load === 'function') return window.academyMedia.load('journey');
      // The third room may not install media-loader.js. Reconstruct the same
      // two local parts, never substituting a remotely hosted planet clip.
      planetController = new AbortController();
      const parts = [];
      for (const part of [0, 1]) {
        const url = new URL(`./media-parts/planet-journey-v4.mp4.part${part}`, import.meta.url);
        const response = await fetch(url, { credentials: 'same-origin', signal: planetController.signal });
        if (!response.ok) throw new Error(`Local planet video part ${part} is unavailable`);
        parts.push(await response.blob());
      }
      if (!alive) throw new Error('Planet window was removed');
      ownedPlanetURL = URL.createObjectURL(new Blob(parts, { type: 'video/mp4' }));
      return ownedPlanetURL;
    })().catch(error => { planetJob = null; throw error; });
    return planetJob;
  }
  function alignPlanetWindow() {
    const room = document.querySelector('#exterior,#boutique-exterior');
    const time = room && Number.isFinite(room.currentTime) ? room.currentTime : window.academyJourney?.time;
    if (Number.isFinite(time) && Number.isFinite(planetVideo.duration) && planetVideo.duration > 0) {
      try { planetVideo.currentTime = time % planetVideo.duration; } catch { /* First decoded frame is still usable. */ }
    }
  }
  async function preparePlanet(autoplay) {
    const token = ++planetToken;
    planetRequested = autoplay; planetLoading = true;
    syncControls('Loading the same local planet video used by the room window…');
    try {
      const url = await localPlanetURL();
      if (!alive || !dialog.open || mode !== 'planet' || token !== planetToken) return;
      if (planetVideo.src !== url) { planetVideo.src = url; planetVideo.load(); }
      if (planetVideo.readyState >= 1) alignPlanetWindow();
      planetLoading = false;
      if (autoplay) {
        await planetVideo.play();
        if (!alive || !dialog.open || mode !== 'planet' || token !== planetToken) { planetVideo.pause(); return; }
        syncControls('The room’s planet video is playing. Zoom changes the video view, not a real telescope.');
      } else {
        planetVideo.pause();
        syncControls('Planet window paused. Use Zoom in or Zoom out, or choose Play planet window.');
      }
    } catch {
      if (!alive || token !== planetToken || mode !== 'planet' || !dialog.open) return;
      planetRequested = false; planetLoading = false;
      syncControls(planetVideo.src ? 'Planet playback did not start. Choose Play planet window to try again.' : 'The local planet video could not load. Try Play planet window again, or return to Galaxy travel.');
    }
  }
  function setView(next) {
    if (!alive || !['travel', 'planet'].includes(next) || mode === next) return;
    stopFrame(); pausePlanet(); keys.clear(); pointers.clear(); steering = null; pinchDistance = 0;
    mode = next; playing = false;
    const planet = mode === 'planet';
    toggle.disabled = !planet && !ctx;
    dialog.classList.toggle('gj-planet-mode', planet);
    canvas.hidden = planet; planetVideo.hidden = !planet;
    dialog.querySelector('.gj-steering').hidden = planet;
    dialog.querySelector('.gj-speed').hidden = planet;
    for (const button of dialog.querySelectorAll('[data-view]')) button.setAttribute('aria-pressed', String(button.dataset.view === mode));
    dialog.querySelector('#galaxy-journey-title').textContent = planet ? 'A closer planet window' : 'Drift among the stars';
    dialog.querySelector('.gj-intro').textContent = planet ? 'The same moving planets seen outside the room, now through the telescope glass.' : 'A luminous universe to move through. Take the controls and find your own way.';
    dialog.querySelector('.gj-view-label').textContent = planet ? 'EXISTING CINEMATIC VIDEO' : 'ARTISTIC SIMULATION';
    dialog.querySelector('.gj-hint').textContent = planet ? 'Use Zoom in and Zoom out · Pinch or scroll for a closer look' : 'Drag the glass to steer · Scroll or pinch to look closer';
    dialog.querySelector('.gj-disclosure').textContent = planet ? 'The existing prerecorded cinematic planet-window video, not live imagery. Zoom magnifies the video; it does not control a real telescope.' : 'An original artistic 3D simulation, not a live telescope or a scientifically mapped sky.';
    syncControls();
    if (!dialog.open) return;
    if (planet) { preparePlanet(!reduced.matches); planetVideo.focus({ preventScroll: true }); }
    else { playing = !reduced.matches; syncControls(reduced.matches ? 'Reduced motion is on. Explore while paused, or choose Begin journey.' : 'Back to the steerable artistic galaxy journey.'); resize(); dirty = true; draw(); schedule(); canvas.focus({ preventScroll: true }); }
  }
  function draw() {
    if (!ctx || mode !== 'travel') return;
    const renderStart = performance.now();
    const center = width / 2;
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#02030c'; ctx.fillRect(0, 0, width, width);
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    function project(x, y, z) {
      const rx = cy * x - sy * z, rz = sy * x + cy * z;
      return { x: rx, y: cp * y - sp * rz, z: sp * y + cp * rz };
    }
    for (const star of distant) {
      const p = project(star.x, star.y, star.z);
      if (p.z < .1) continue;
      const sx = center + p.x * focal / p.z, syy = center - p.y * focal / p.z;
      if (sx < 0 || sx > width || syy < 0 || syy > width) continue;
      ctx.fillStyle = `rgba(181,197,232,${star.bright})`; ctx.fillRect(sx, syy, .75, .75);
    }
    const visible = [];
    for (const cloud of clouds) {
      const p = project(wrap(cloud.x - camera.x), wrap(cloud.y - camera.y), wrap(cloud.z - camera.z));
      if (p.z < 70) continue;
      const size = Math.min(width * 1.45, cloud.radius * focal / p.z * 2);
      const sx = center + p.x * focal / p.z, syy = center - p.y * focal / p.z;
      if (sx + size < 0 || sx - size > width || syy + size < 0 || syy - size > width) continue;
      visible.push({ type: 1, source: cloud, z: p.z, sx, sy: syy, size });
    }
    for (let starIndex = 0; starIndex < Math.floor(stars.length * quality); starIndex++) {
      const star = stars[starIndex];
      const p = project(wrap(star.x - camera.x), wrap(star.y - camera.y), wrap(star.z - camera.z));
      if (p.z < 35) continue;
      const sx = center + p.x * focal / p.z, syy = center - p.y * focal / p.z;
      if (sx < -20 || sx > width + 20 || syy < -20 || syy > width + 20) continue;
      visible.push({ type: 0, source: star, z: p.z, sx, sy: syy, size: clamp(star.radius * focal / p.z, .35, 4.8) });
    }
    visible.sort((a, b) => b.z - a.z);
    const cloudBudget = Math.max(3, Math.floor((mobile ? 8 : 14) * quality));
    const cloudScore = item => item.size * item.source.alpha / (1 + Math.hypot(item.sx - center, item.sy - center) / width);
    const selectedClouds = new Set(visible.filter(item => item.type).sort((a, b) => cloudScore(b) - cloudScore(a)).slice(0, cloudBudget));
    for (const item of visible) {
      const s = item.source;
      if (item.type) {
        if (!selectedClouds.has(item)) continue;
        ctx.save(); ctx.translate(item.sx, item.sy); ctx.rotate(s.rotation);
        ctx.globalAlpha = s.alpha * Math.min(1, (item.z - 70) / 250) * clamp((half - item.z) / 350, 0, 1);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(cloudSprites[s.sprite], -item.size / 2, -item.size / 2, item.size, item.size * .8);
        ctx.restore();
      } else {
        const fade = Math.min(1, (item.z - 35) / 100) * clamp((half - item.z) / 240, 0, 1);
        const alpha = s.bright * fade * (.94 + .06 * Math.sin(worldTime * .6 + s.phase));
        if (item.size > 1.3) {
          const glow = item.size * 11;
          ctx.globalAlpha = alpha * .65; ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(glowSprite, item.sx - glow / 2, item.sy - glow / 2, glow, glow);
          ctx.globalCompositeOperation = 'source-over';
        }
        ctx.globalAlpha = alpha; ctx.fillStyle = `rgb(${s.color})`; ctx.beginPath();
        ctx.arc(item.sx, item.sy, item.size, 0, Math.PI * 2); ctx.fill();
        if (item.size > 2.5) {
          ctx.globalAlpha = alpha * .3; ctx.strokeStyle = `rgb(${s.color})`; ctx.lineWidth = .6;
          const r = item.size * 2.7; ctx.beginPath(); ctx.moveTo(item.sx - r, item.sy); ctx.lineTo(item.sx + r, item.sy); ctx.moveTo(item.sx, item.sy - r); ctx.lineTo(item.sx, item.sy + r); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    // Lens edge only; the center remains clear and bright.
    const vignette = ctx.createRadialGradient(center, center, width * .34, center, center, width * .53);
    vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, 'rgba(0,0,0,.72)');
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, width, width);
    canvas.dataset.distance = distance.toFixed(2);
    canvas.dataset.heading = `${yaw.toFixed(3)},${pitch.toFixed(3)}`;
    dirty = false;
    renderCost = renderCost * .8 + (performance.now() - renderStart) * .2;
    if (renderCost > 24 && quality > .42) { quality = Math.max(.42, quality - .12); targetFrame = Math.max(targetFrame, 1000 / 20); }
    canvas.dataset.renderBudget = `${quality.toFixed(2)} / ${Math.round(renderCost)}ms`;
  }
  function schedule() {
    if (alive && mode === 'travel' && dialog.open && !document.hidden && !frame && ctx) frame = requestAnimationFrame(tick);
  }
  function tick(time) {
    frame = 0;
    if (!alive || mode !== 'travel' || !dialog.open || document.hidden) return;
    const dt = lastTime ? Math.min(.05, (time - lastTime) / 1000) : 0; lastTime = time;
    const directions = { left: [-1, 0], right: [1, 0], up: [0, 1], down: [0, -1] };
    const delta = steering ? directions[steering] : null;
    if (delta) { targetYaw += delta[0] * dt * .6; targetPitch = clamp(targetPitch + delta[1] * dt * .6, -1.35, 1.35); dirty = true; }
    if (keys.has('ArrowLeft') || keys.has('a')) { targetYaw -= dt * .6; dirty = true; }
    if (keys.has('ArrowRight') || keys.has('d')) { targetYaw += dt * .6; dirty = true; }
    if (keys.has('ArrowUp') || keys.has('w')) { targetPitch = clamp(targetPitch + dt * .6, -1.35, 1.35); dirty = true; }
    if (keys.has('ArrowDown') || keys.has('s')) { targetPitch = clamp(targetPitch - dt * .6, -1.35, 1.35); dirty = true; }
    const blend = reduced.matches ? 1 : Math.min(1, dt * 9);
    if (Math.abs(yaw - targetYaw) + Math.abs(pitch - targetPitch) > .0001) {
      yaw += (targetYaw - yaw) * blend; pitch += (targetPitch - pitch) * blend; dirty = true;
    }
    if (playing) {
      const step = Number(dialog.querySelector('input').value) * dt;
      camera.x = wrap(camera.x + Math.sin(yaw) * Math.cos(pitch) * step);
      camera.y = wrap(camera.y + Math.sin(pitch) * step);
      camera.z = wrap(camera.z + Math.cos(yaw) * Math.cos(pitch) * step);
      distance += step; worldTime += dt; dirty = true;
    }
    if (dirty && time - lastPaint >= targetFrame) { draw(); lastPaint = time; }
    const turning = Math.abs(yaw - targetYaw) + Math.abs(pitch - targetPitch) > .0001;
    if (playing || dirty || steering || keys.size || turning) schedule();
  }
  function stopFrame() { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
  function pause(message) { playing = false; pausePlanet(); syncControls(message); dirty = true; schedule(); }
  function zoom(delta) {
    if (mode === 'planet') { planetZoom = clamp(planetZoom - delta / 35, 1, 3); updateZoom(); return; }
    fieldOfView = clamp(fieldOfView + delta, 43, 95); focal = width / (2 * Math.tan(fieldOfView * Math.PI / 360)); updateZoom(); dirty = true; schedule();
  }
  function home() {
    camera.x = camera.y = camera.z = 0; targetYaw = targetPitch = yaw = pitch = 0; distance = 0; fieldOfView = 72;
    focal = width / (2 * Math.tan(fieldOfView * Math.PI / 360)); dirty = true;
    updateZoom(); status.textContent = 'Back at the beginning. Choose your direction.'; schedule();
  }
  function open() {
    if (!alive || dialog.open) return;
    previousFocus = document.activeElement; dialog.showModal();
    if (mode === 'planet') { preparePlanet(!reduced.matches); planetVideo.focus({ preventScroll: true }); return; }
    playing = !reduced.matches; syncControls(reduced.matches ? 'Reduced motion is on. Explore while paused, or choose Begin journey.' : 'Your journey is moving. Steer anywhere, or pause to take it in.');
    if (!ctx) {
      status.textContent = 'This browser cannot display the interactive journey. Please use a browser with Canvas support.';
      for (const control of dialog.querySelectorAll('.gj-controls button,.gj-controls input')) control.disabled = true;
      return;
    }
    resize(); draw(); schedule(); canvas.focus({ preventScroll: true });
  }
  function closed() {
    stopFrame(); playing = false; pausePlanet(); keys.clear(); pointers.clear(); steering = null; pinchDistance = 0;
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  }
  function close() { if (dialog.open) dialog.close(); }
  listen(window, 'academy-telescope-view', open);
  listen(dialog, 'close', closed);
  listen(dialog.querySelector('.gj-close'), 'click', close);
  listen(dialog.querySelector('[data-action="toggle"]'), 'click', () => {
    if (mode === 'planet') { if (planetRequested) { pausePlanet(); syncControls('Planet window paused. Zoom in or out to change the view.'); } else preparePlanet(true); return; }
    playing = !playing; syncControls(playing ? 'Travelling through the simulated galaxy.' : 'Paused. You can still look around.'); lastTime = 0; dirty = true; schedule();
  });
  for (const button of dialog.querySelectorAll('[data-view]')) listen(button, 'click', () => setView(button.dataset.view));
  listen(planetVideo, 'loadedmetadata', () => { if (mode === 'planet' && dialog.open) alignPlanetWindow(); });
  listen(planetVideo, 'error', () => { if (mode === 'planet' && dialog.open) { pausePlanet(); syncControls('The local planet video could not be decoded. Galaxy travel is still available.'); } });
  listen(dialog.querySelector('[data-action="home"]'), 'click', home);
  listen(dialog.querySelector('[data-action="in"]'), 'click', () => zoom(-7));
  listen(dialog.querySelector('[data-action="out"]'), 'click', () => zoom(7));
  listen(dialog.querySelector('input'), 'input', e => { dialog.querySelector('.gj-speed span').textContent = Number(e.target.value) < 90 ? 'Gentle' : Number(e.target.value) < 150 ? 'Flowing' : 'Exploring'; });
  for (const button of dialog.querySelectorAll('[data-steer]')) {
    listen(button, 'pointerdown', e => { steering = button.dataset.steer; const d = {left:[-.10,0],right:[.10,0],up:[0,.10],down:[0,-.10]}[steering]; targetYaw += d[0]; targetPitch = clamp(targetPitch + d[1], -1.35, 1.35); dirty = true; button.setPointerCapture?.(e.pointerId); schedule(); });
    listen(button, 'pointerup', () => { steering = null; });
    listen(button, 'pointercancel', () => { steering = null; });
    listen(button, 'lostpointercapture', () => { steering = null; });
    listen(button, 'click', e => {
      if (e.detail > 0) return;
      const map = { left: [-.18, 0], right: [.18, 0], up: [0, .18], down: [0, -.18] };
      const [dx, dy] = map[button.dataset.steer]; targetYaw += dx; targetPitch = clamp(targetPitch + dy, -1.35, 1.35); dirty = true; schedule();
    });
  }
  for (const surface of [canvas, planetVideo]) {
  listen(surface, 'pointerdown', e => { surface.focus({ preventScroll: true }); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); surface.setPointerCapture?.(e.pointerId); pinchDistance = 0; });
  listen(surface, 'pointermove', e => {
    const previous = pointers.get(e.pointerId); if (!previous) return;
    const dx = e.clientX - previous.x, dy = e.clientY - previous.y;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size > 1) {
      const [a, b] = [...pointers.values()]; const gap = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDistance) zoom((pinchDistance - gap) * .12); pinchDistance = gap;
    } else if (mode === 'travel') { targetYaw -= dx * .004; targetPitch = clamp(targetPitch + dy * .004, -1.35, 1.35); dirty = true; schedule(); }
  });
  const release = e => { pointers.delete(e.pointerId); pinchDistance = 0; };
  listen(surface, 'pointerup', release); listen(surface, 'pointercancel', release); listen(surface, 'lostpointercapture', release);
  listen(surface, 'wheel', e => { e.preventDefault(); zoom(Math.sign(e.deltaY) * 3); }, { passive: false });
  }
  listen(dialog, 'keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (mode === 'travel' && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'].includes(key)) { e.preventDefault(); keys.add(key); schedule(); }
    else if (key === ' ' && (e.target === canvas || e.target === planetVideo)) { e.preventDefault(); toggle.click(); }
    else if (key === '+' || key === '=') { e.preventDefault(); zoom(-7); }
    else if (key === '-') { e.preventDefault(); zoom(7); }
  });
  listen(window, 'keyup', e => keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key));
  listen(window, 'blur', () => { keys.clear(); pointers.clear(); steering = null; if (dialog.open) pause('Journey paused while you were away. Choose Begin journey to continue.'); });
  listen(document, 'visibilitychange', () => { if (document.hidden) { playing = false; pausePlanet(); keys.clear(); steering = null; stopFrame(); syncControls('Journey paused while you were away.'); } else if (dialog.open) { dirty = true; schedule(); } });
  listen(reduced, 'change', () => { if (reduced.matches && dialog.open) pause('Reduced motion enabled. Journey paused; explore at your own pace.'); });
  listen(window, 'resize', () => { resize(); schedule(); });
  let resizeObserver;
  if (window.ResizeObserver) { resizeObserver = new ResizeObserver(() => { resize(); schedule(); }); resizeObserver.observe(canvas); }
  const api = {
    open, close, setView,
    destroy() {
      if (!alive) return; close(); alive = false; stopFrame(); removers.forEach(remove => remove()); resizeObserver?.disconnect();
      cloudSprites.forEach(sprite => { sprite.width = sprite.height = 1; }); if (glowSprite) glowSprite.width = glowSprite.height = 1;
      planetController?.abort(); planetVideo.pause(); planetVideo.removeAttribute('src'); planetVideo.load();
      if (ownedPlanetURL) URL.revokeObjectURL(ownedPlanetURL);
      canvas.width = canvas.height = 1; dialog.remove(); delete window.__academyGalaxyJourney;
    },
    getState() { return { open: dialog.open, mode, playing: mode === 'planet' ? planetRequested : playing, planetLoading, planetZoom, planetTime: planetVideo.currentTime, yaw, pitch, distance, fieldOfView, renderer: mode === 'planet' ? 'local-video' : 'canvas2d', artisticSimulation: mode === 'travel' }; }
  };
  window.__academyGalaxyJourney = api;
  return api;
}
