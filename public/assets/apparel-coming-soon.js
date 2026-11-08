/* Shop label belongs to the existing wardrobe plinth; it never paints a new panel over the floor. */
export function mountApparelComingSoon() {
  const stage = document.querySelector('#boutique-stage');
  if (!stage || stage.querySelector('.boutique-shop-invitation')) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'boutique-shop-invitation';
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-controls', 'apparel-coming-soon');
  button.innerHTML = '<span>Shop Apparel</span>';
  stage.append(button);

  const dialog = document.createElement('dialog');
  dialog.id = 'apparel-coming-soon';
  dialog.className = 'apparel-coming-soon';
  dialog.setAttribute('aria-labelledby', 'apparel-coming-soon-title');
  dialog.setAttribute('aria-describedby', 'apparel-coming-soon-copy');
  dialog.innerHTML = '<div class="apparel-message-inner"><p class="apparel-message-kicker">THE VOIDWALKER BOUTIQUE</p><h2 id="apparel-coming-soon-title">Coming soon</h2><p id="apparel-coming-soon-copy">The apparel collection is taking shape.</p><button type="button" class="apparel-message-close">Return to the boutique</button></div>';
  document.body.append(dialog);

  const style = document.createElement('style');
  style.dataset.apparelEngraving = 'true';
  style.textContent = `
    /* 1672 x 941 source: the plinth runs from (70,795)-(438,678) to (70,887)-(438,740).
       All lettering and its hit area sit inside that physical front face. */
    #boutique-stage .boutique-shop-invitation {
      position: absolute; left: 6%; top: 79.5%; width: 18.4%; height: 5.4%; z-index: 8;
      min-width: 0; min-height: 0; padding: 0; margin: 0;
      display: flex; align-items: center; justify-content: center;
      border: 0; border-radius: 0; background: transparent !important; box-shadow: none;
      transform: skewY(-19.8deg); transform-origin: center;
      color: #b6a793; font: normal var(--shop-title, 24px)/1 Georgia, serif;
      letter-spacing: .045em; white-space: nowrap; cursor: pointer; touch-action: manipulation;
    }
    #boutique-stage .boutique-shop-invitation span {
      display: block; pointer-events: none;
      color: #9c8e7d;
      text-shadow: 0 -1px 1px #080706, 0 1px .6px #d4c5aaad;
      -webkit-font-smoothing: antialiased;
    }
    #boutique-stage .boutique-shop-invitation:hover span { color: #b8a991; }
    #boutique-stage .boutique-shop-invitation:focus-visible { outline: 2px solid #e3d2bc; outline-offset: 1px; }
    #boutique-stage .point.apparel { display: none; }
    dialog.apparel-coming-soon {
      width: min(470px, calc(100vw - 36px)); padding: 7px; overflow: visible;
      border: 1px solid #766777; border-radius: 6px; color: #f1e7de;
      background: linear-gradient(145deg, #a18b78, #463c40 5%, #1b171e 42%, #51434b 95%, #aa9584);
      box-shadow: 0 30px 90px #000c, inset 0 1px 0 #e3d3bb70;
    }
    dialog.apparel-coming-soon::backdrop { background: #07050bd9; backdrop-filter: blur(5px); }
    .apparel-message-inner {
      padding: clamp(28px, 6vw, 44px) clamp(20px, 5vw, 34px); text-align: center;
      border: 1px solid #a28e7c3b; border-radius: 2px;
      background: radial-gradient(ellipse at 50% 0%, #51415165, transparent 65%), linear-gradient(135deg, #231e27, #121016);
      box-shadow: inset 0 1px 4px #000c;
    }
    .apparel-coming-soon .apparel-message-kicker { margin: 0 0 24px; color: #c2ae9e; font: 10px/1.7 system-ui; letter-spacing: .2em; }
    .apparel-coming-soon h2 { margin: 0; color: #ecdbca; font: normal clamp(32px, 8vw, 44px)/1.15 Georgia, serif; }
    .apparel-coming-soon #apparel-coming-soon-copy { margin: 18px 0 28px; color: #c8bfcb; font: 15px/1.65 system-ui; }
    .apparel-coming-soon .apparel-message-close {
      min-height: 44px; padding: 11px 18px; border: 1px solid #9f87936b; border-radius: 4px;
      background: linear-gradient(#342935, #211a25); color: #e4d5ca; font: 13px/1.4 system-ui;
      box-shadow: inset 0 1px #c6ada72b; cursor: pointer;
    }
    .apparel-coming-soon .apparel-message-close:hover { background: #40313f; }
    .apparel-coming-soon .apparel-message-close:focus-visible { outline: 2px solid #ebd7c0; outline-offset: 4px; }
  `;
  document.head.append(style);

  const size = () => button.style.setProperty('--shop-title', Math.max(13, Math.min(27, stage.clientWidth * .016)) + 'px');
  new ResizeObserver(size).observe(stage);
  size();

  let lastFocus;
  const open = (trigger) => {
    if (dialog.open) return;
    const roomMenu = document.querySelector('.compact-room-menu');
    lastFocus = roomMenu?.contains(trigger) ? roomMenu.querySelector('summary') : trigger;
    roomMenu?.removeAttribute('open');
    dialog.showModal();
  };
  for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) {
    button.addEventListener(type, (event) => event.stopPropagation());
  }
  button.addEventListener('click', (event) => {
    event.preventDefault(); event.stopPropagation(); open(button);
  });
  dialog.querySelector('.apparel-message-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
  });
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest?.('[data-category="apparel"]');
    if (!trigger) return;
    event.preventDefault(); event.stopImmediatePropagation(); open(trigger);
  }, true);
}
