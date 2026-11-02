'use strict';
(() => {
  const button = document.getElementById('complete-practice');
  const closing = document.getElementById('practice-completion');
  if (!button || !closing) return;
  button.hidden = false;
  button.addEventListener('click', () => {
    if (button.getAttribute('aria-expanded') === 'true') return;
    closing.hidden = false;
    button.setAttribute('aria-expanded', 'true');
  });
})();
