import { abundanceCards, shuffleDeck } from './abundance-card-data.js';

const ornament = '<svg class="abundance-ornament" viewBox="0 0 80 110" aria-hidden="true"><path d="M40 10 67 55 40 100 13 55Z M40 23 59 55 40 87 21 55Z"/><circle cx="40" cy="55" r="18"/><path d="M45 39a16 16 0 1 0 0 32 19 19 0 0 1 0-32Z M40 5v10m-5-5h10M40 95v10m-5-5h10M7 55h10m-5-5v10m51-5h10m-5-5v10"/></svg>';
const back = `<span class="abundance-back">${ornament}</span>`;
const shuffleIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m18 3 3 3-3 3M3 6h3c5 0 7 12 12 12h3m-3-3 3 3-3 3M3 18h3c2 0 4-3 6-6s4-6 6-6h3"/></svg>';

export function mountAbundanceDeck() {
  const stage = document.querySelector('#stage');
  const menu = document.querySelector('.room-menu-content');
  if (!stage || !menu || stage.querySelector('.abundance-launcher')) return;
  const lifetime = new AbortController();
  const on = (element, type, handler, options = {}) => element.addEventListener(type, handler, { ...options, signal: lifetime.signal });
  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'abundance-launcher';
  launcher.setAttribute('aria-label', 'Abundance cards');
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.innerHTML = `<span class="abundance-stack" aria-hidden="true">${back}</span>`;
  stage.append(launcher);
  const menuLauncher = document.createElement('button');
  menuLauncher.type = 'button';
  menuLauncher.className = 'abundance-menu-launcher';
  menuLauncher.textContent = 'Abundance cards';
  menuLauncher.setAttribute('aria-haspopup', 'dialog');
  (menu.querySelector('.room-resource-links') || menu).append(menuLauncher);
  if (!menuLauncher.isConnected) menu.append(menuLauncher);

  const dialog = document.createElement('dialog');
  dialog.className = 'abundance-dialog';
  dialog.setAttribute('aria-labelledby', 'abundance-title');
  dialog.setAttribute('aria-describedby', 'abundance-caption');
  dialog.innerHTML = `<div class="abundance-heading"><div><h2 id="abundance-title">Abundance Cards</h2><p class="abundance-caption" id="abundance-caption">Choose a card below to reveal its illustration and meaning. No tarot experience needed.</p></div><button class="abundance-close" type="button" aria-label="Close Abundance Cards"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="abundance-hand" role="group" aria-label="Five face-down cards"></div><section class="abundance-reflection" aria-labelledby="abundance-card-name" hidden><img class="abundance-hero-card" alt=""><div class="abundance-reading"><p class="abundance-action-label">YOUR CARD · UPRIGHT</p><h3 id="abundance-card-name" tabindex="-1"></h3><p class="abundance-keywords"></p><h4>What this card means</h4><p class="abundance-meaning"></p><h4>A moment to reflect</h4><p class="abundance-message"></p><p class="abundance-action-label">A small practice</p><p class="abundance-action"></p></div></section><div class="abundance-actions"><button type="button" class="abundance-shuffle">${shuffleIcon}Shuffle</button><button type="button" class="abundance-again" hidden>${shuffleIcon}Draw again</button></div><p class="abundance-preview-label">Illustrated tarot · for reflection, not prediction. Tarot illustrations by Pamela Colman Smith, Rider–Waite–Smith deck (1909–1910). Public domain. Scans via Wikimedia Commons.</p><p class="abundance-status" role="status" aria-live="polite"></p>`;
  document.body.append(dialog);
  const hand = dialog.querySelector('.abundance-hand');
  const reflection = dialog.querySelector('.abundance-reflection');
  const again = dialog.querySelector('.abundance-again');
  const status = dialog.querySelector('.abundance-status');
  let deck = [], selected = false, returnFocus = launcher, shuffleTimer;

  function fresh(animate = false) {
    clearTimeout(shuffleTimer);
    deck = shuffleDeck(abundanceCards);
    selected = false;
    dialog.classList.remove('has-reading');
    reflection.hidden = true;
    hand.hidden = false;
    dialog.querySelector('.abundance-shuffle').hidden = false;
    again.hidden = true;
    hand.replaceChildren();
    hand.classList.remove('is-shuffling');
    deck.slice(0, 5).forEach((card, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'abundance-choice';
      button.setAttribute('aria-label', `Choose card ${index + 1} of 5`);
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = `${back}<span class="abundance-card-front" aria-hidden="true">${ornament}<span></span></span>`;
      button.querySelector('.abundance-card-front>span').textContent = card.name;
      if(card.cardImage){const illustration=document.createElement('img');illustration.src=card.cardImage;illustration.alt='';illustration.loading='lazy';button.querySelector('.abundance-card-front').prepend(illustration);}

      // Hidden backs do not expose the draw to assistive technologies or the visible UI.
      button.addEventListener('click', () => {
        if (selected) return;
        clearTimeout(shuffleTimer);
        hand.classList.remove('is-shuffling');
        selected = true;
        dialog.classList.add('has-reading');
        for (const sibling of hand.children) sibling.disabled = true;
        button.setAttribute('aria-pressed', 'true');
        button.setAttribute('aria-label', card.name);
        dialog.querySelector('#abundance-card-name').textContent = card.name;
        dialog.querySelector('.abundance-message').textContent = card.message;
        dialog.querySelector('.abundance-action').textContent = card.action;
        const hero=dialog.querySelector('.abundance-hero-card');
        hero.src=card.cardImage; hero.alt=card.name+' tarot illustration';
        dialog.querySelector('.abundance-meaning').textContent=card.meaning || card.message;
        dialog.querySelector('.abundance-keywords').textContent=(card.keywords || []).join(' · ');
        hand.hidden=true;
        dialog.querySelector('.abundance-shuffle').hidden=true;
        reflection.hidden = false;
        again.hidden = false;
        status.textContent = `${card.name} revealed. Its meaning is below the illustration.`;
        dialog.scrollTop=0;
        dialog.querySelector('#abundance-card-name').focus({ preventScroll: true });
      }, { once: true });
      hand.append(button);
    });
    if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // A fresh layout restarts the gentle shuffle without resizing the hand.
      void hand.offsetWidth;
      hand.classList.add('is-shuffling');
      shuffleTimer = setTimeout(() => hand.classList.remove('is-shuffling'), 500);
    }
    status.textContent = 'Deck shuffled. Five cards ready to choose.';
  }
  function open(source) {
    if (dialog.open) return;
    returnFocus = source;
    const roomMenu = menu.closest('details');
    if (roomMenu) roomMenu.open = false;
    fresh();
    dialog.showModal();
    dialog.querySelector('.abundance-close').focus({ preventScroll: true });
  }
  // Target listeners stop the approved scene's bubble-phase drag/arrow handlers.
  for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'keydown']) on(launcher, type, event => event.stopPropagation());
  on(launcher, 'click', () => open(launcher));
  on(menuLauncher, 'click', event => { event.stopPropagation(); open(menuLauncher); });
  on(dialog.querySelector('.abundance-close'), 'click', () => dialog.close());
  on(dialog.querySelector('.abundance-shuffle'), 'click', () => { fresh(true); hand.firstElementChild?.focus(); });
  on(again, 'click', () => { fresh(); hand.firstElementChild?.focus(); });
  on(dialog, 'keydown', event => {
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); dialog.close(); return; }
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button')].filter(button => !button.disabled && !button.hidden && button.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement.tagName === 'H3')) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  on(dialog, 'close', () => {
    clearTimeout(shuffleTimer);
    if (returnFocus === menuLauncher) menu.closest('details').open = true;
    returnFocus.focus({ preventScroll: true });
    // Native dialog close can restore its own previous focus after the close event.
    queueMicrotask(() => { if (!dialog.open && returnFocus.isConnected) returnFocus.focus({ preventScroll: true }); });
  });
  // Keep BFCache restores usable; actual destruction removes all global listeners.
  on(window, 'pagehide', event => {
    clearTimeout(shuffleTimer);
    if (dialog.open) dialog.close();
    if (!event.persisted) lifetime.abort();
  });
  return () => { lifetime.abort(); clearTimeout(shuffleTimer); dialog.remove(); launcher.remove(); menuLauncher.remove(); };
}