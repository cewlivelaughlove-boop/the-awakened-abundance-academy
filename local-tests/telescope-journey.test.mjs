import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mountGalaxyJourney } from '../public/assets/telescope-journey.js';

test('galaxy journey renders, travels, pauses, steers, honors reduced motion and cleans up', () => {
  const dom = new JSDOM('<button id="launch">Launch</button>', { pretendToBeVisual: true });
  global.window = dom.window; global.document = dom.window.document;
  let reduced = false, time = 100, next = 1, paintCount = 0;
  const callbacks = new Map();
  global.requestAnimationFrame = cb => { const id = next++; callbacks.set(id, cb); return id; };
  global.cancelAnimationFrame = id => callbacks.delete(id);
  const media = new dom.window.EventTarget();
  Object.defineProperty(media, 'matches', { get: () => reduced });
  window.matchMedia = query => query.includes('reduced') ? media : { matches: false };
  const proto = window.HTMLDialogElement.prototype;
  proto.showModal = function () { this.open = true; };
  proto.close = function () { this.open = false; this.dispatchEvent(new window.Event('close')); };
  window.HTMLMediaElement.prototype.pause = function () {};
  window.HTMLMediaElement.prototype.load = function () {};
  const gradient = { addColorStop() {} };
  window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
    get(target, property) {
      if (property === 'createRadialGradient') return () => gradient;
      if (property === 'drawImage') return () => { paintCount++; };
      return target[property] ?? (() => {});
    }, set(target, property, value) { target[property] = value; return true; }
  });
  const advance = (count = 30) => {
    for (let i = 0; i < count; i++) { time += 16; const queue = [...callbacks.values()]; callbacks.clear(); queue.forEach(cb => cb(time)); }
  };
  document.querySelector('#launch').focus();
  const api = mountGalaxyJourney();
  assert.equal(mountGalaxyJourney(), api, 'mount is idempotent');
  assert.equal(document.querySelectorAll('.galaxy-journey').length, 1);
  window.dispatchEvent(new window.Event('academy-telescope-view'));
  assert.equal(api.getState().open, true);
  advance(90);
  assert.ok(api.getState().distance > 80, 'camera translates in 3D, not only animation time');
  assert.ok(paintCount > 10, 'scene paints cloud and star layers');
  document.querySelector('[data-action=toggle]').click(); advance();
  const pausedDistance = api.getState().distance; advance();
  assert.equal(api.getState().distance, pausedDistance);
  assert.equal(callbacks.size, 0, 'idle paused view does not burn animation frames');
  document.querySelector('[data-steer=right]').click(); advance();
  assert.ok(api.getState().yaw > .1);
  document.querySelector('[data-action=in]').click(); advance();
  assert.ok(api.getState().fieldOfView < 72);
  document.querySelector('[data-action=home]').click(); advance();
  assert.equal(api.getState().distance, 0);
  assert.equal(api.getState().yaw, 0);
  api.close();
  assert.equal(callbacks.size, 0);
  assert.equal(document.activeElement.id, 'launch');
  reduced = true; api.open(); advance();
  assert.equal(api.getState().playing, false);
  assert.equal(api.getState().distance, 0);
  document.querySelector('[data-action=toggle]').click(); advance();
  assert.ok(api.getState().distance > 0, 'motion can be explicitly started');
  media.dispatchEvent(new window.Event('change')); advance();
  assert.equal(api.getState().playing, false);
  api.destroy(); assert.equal(callbacks.size, 0);
  window.dispatchEvent(new window.Event('academy-telescope-view'));
  assert.equal(document.querySelector('.galaxy-journey'), null);
  assert.equal(window.__academyGalaxyJourney, undefined);
  dom.window.close();
});

function planetHarness(reduced = false) {
  const dom = new JSDOM('<video id="exterior"></video><button id="launch">Launch</button>', { pretendToBeVisual: true });
  global.window = dom.window; global.document = dom.window.document;
  const callbacks = new Map(); let next = 0, plays = 0, pauses = 0;
  global.requestAnimationFrame = callback => { callbacks.set(++next, callback); return next; };
  global.cancelAnimationFrame = id => callbacks.delete(id);
  const media = new window.EventTarget(); media.matches = reduced;
  window.matchMedia = query => query.includes('reduced') ? media : { matches: true };
  window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  window.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new window.Event('close')); };
  window.HTMLMediaElement.prototype.pause = function () { pauses++; this.__paused = true; };
  window.HTMLMediaElement.prototype.play = function () { plays++; this.__paused = false; return Promise.resolve(); };
  window.HTMLMediaElement.prototype.load = function () {};
  Object.defineProperty(window.HTMLMediaElement.prototype, 'readyState', { get: () => 1 });
  Object.defineProperty(window.HTMLMediaElement.prototype, 'duration', { get: () => 90 });
  const gradient = { addColorStop() {} };
  window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
    get: (target, property) => property === 'createRadialGradient' ? () => gradient : target[property] ?? (() => {}),
    set: (target, property, value) => { target[property] = value; return true; }
  });
  document.querySelector('#exterior').currentTime = 24;
  return { dom, media, callbacks, counts: () => ({ plays, pauses }) };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('Planet window reuses owned local video, shows explicit zoom, preserves travel and respects reduced motion', async () => {
  const h = planetHarness(true); let loads = 0;
  window.academyMedia = { load: key => { assert.equal(key, 'journey'); loads++; return Promise.resolve('blob:https://example.test/existing-planet'); } };
  const api = mountGalaxyJourney(); api.open(); api.setView('planet'); await flush();
  const video = document.querySelector('.gj-planet-video');
  assert.equal(api.getState().mode, 'planet'); assert.equal(api.getState().playing, false);
  assert.equal(video.currentTime, 24, 'aligns to current room video without changing its playback');
  assert.equal(h.counts().plays, 0, 'reduced motion does not autoplay planet video');
  assert.equal(video.hidden, false); assert.equal(document.querySelector('canvas').hidden, true);
  assert.match(document.querySelector('.gj-disclosure').textContent, /prerecorded cinematic/);
  assert.match(document.querySelector('[data-action=in]').textContent, /Zoom in/);
  assert.match(document.querySelector('[data-action=out]').textContent, /Zoom out/);
  for (let i = 0; i < 20; i++) document.querySelector('[data-action=in]').click();
  assert.equal(api.getState().planetZoom, 3);
  assert.equal(api.getState().fieldOfView, 72, 'video zoom does not alter 3D field of view');
  for (let i = 0; i < 20; i++) document.querySelector('[data-action=out]').click();
  assert.equal(api.getState().planetZoom, 1);
  document.querySelector('[data-action=toggle]').click(); await flush();
  assert.equal(api.getState().playing, true); assert.equal(h.counts().plays, 1);
  document.querySelector('[data-action=toggle]').click();
  assert.equal(api.getState().playing, false);
  api.setView('travel'); assert.equal(api.getState().mode, 'travel'); assert.equal(video.hidden, true);
  assert.equal(api.getState().artisticSimulation, true);
  api.setView('planet'); await flush(); assert.equal(loads, 1, 'same shared cached media URL reused');
  api.destroy(); assert.equal(h.callbacks.size, 0); h.dom.window.close();
});

test('late planet loading cannot play after closing and local failures remain honest', async () => {
  const h = planetHarness(); let resolve;
  window.academyMedia = { load: () => new Promise(done => { resolve = done; }) };
  const api = mountGalaxyJourney(); api.open(); api.setView('planet'); api.close();
  resolve('blob:https://example.test/existing-planet'); await flush();
  assert.equal(h.counts().plays, 0); assert.equal(document.querySelector('.gj-planet-video').getAttribute('src'), null);
  api.destroy(); h.dom.window.close();
  const failure = planetHarness();
  window.academyMedia = { load: () => Promise.reject(new Error('Local part unavailable')) };
  const failed = mountGalaxyJourney(); failed.open(); failed.setView('planet'); await flush();
  assert.match(document.querySelector('.gj-status').textContent, /local planet video could not load/i);
  assert.equal(failed.getState().playing, false);
  failed.setView('travel'); assert.equal(failed.getState().renderer, 'canvas2d');
  failed.destroy(); failure.dom.window.close();
});

test('Planet fallback loads only the existing two local parts and releases its own Blob URL', async () => {
  const h = planetHarness(true); const requests = [], revoked = [];
  const originalFetch = global.fetch, create = URL.createObjectURL, revoke = URL.revokeObjectURL;
  global.fetch = async (url, options) => { requests.push({ url: String(url), options }); return { ok: true, blob: async () => new Blob(['local-part']) }; };
  URL.createObjectURL = blob => { assert.equal(blob.type, 'video/mp4'); return 'blob:owned-local-planets'; };
  URL.revokeObjectURL = url => revoked.push(url);
  try {
    const api = mountGalaxyJourney(); api.open(); api.setView('planet'); await flush();
    assert.equal(requests.length, 2);
    assert.ok(requests[0].url.endsWith('/media-parts/planet-journey-v4.mp4.part0'));
    assert.ok(requests[1].url.endsWith('/media-parts/planet-journey-v4.mp4.part1'));
    assert.ok(requests.every(request => request.options.credentials === 'same-origin'));
    assert.equal(document.querySelector('.gj-planet-video').getAttribute('src'), 'blob:owned-local-planets');
    api.destroy(); assert.deepEqual(revoked, ['blob:owned-local-planets']);
  } finally { global.fetch = originalFetch; URL.createObjectURL = create; URL.revokeObjectURL = revoke; h.dom.window.close(); }
});
