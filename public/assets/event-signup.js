(function () {
  'use strict';
  var form = document.querySelector('[data-event-signup]');
  if (!form) return;
  var status = document.getElementById('event-status');
  var submit = form.querySelector('[type="submit"]');
  var email = document.getElementById('event-email');
  var consent = document.getElementById('event-consent');
  var requestId = null;
  var attemptedEmail = '';
  var busy = false;
  var ready = false;
  function say(message, state) {
    status.textContent = message;
    status.dataset.state = state || '';
  }
  fetch('/api/event-signup', { cache: 'no-store', credentials: 'same-origin', signal: AbortSignal.timeout(10000) })
    .then(function (response) { if (!response.ok) throw new Error('unavailable'); return response.json(); })
    .then(function (data) {
      if (data.ready !== true || !window.crypto || !crypto.randomUUID) throw new Error('unavailable');
      ready = true;
      submit.disabled = false;
      say('Your email stays private. No payment or account is needed.');
    })
    .catch(function () { say('Signup is temporarily unavailable. Please try this page again shortly. Nothing has been submitted.', 'error'); });
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!ready || busy) return;
    email.value = email.value.trim();
    if (!form.reportValidity()) return;
    busy = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    say('Saving your signup…');
    if (!requestId || attemptedEmail !== email.value.toLowerCase()) requestId = crypto.randomUUID();
    attemptedEmail = email.value.toLowerCase();
    try {
      var response = await fetch('/api/event-signup', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value, consent: consent.checked, consentVersion: 'carla-event-updates-v1-20261108', source: form.dataset.source, requestId: requestId, website: form.elements.website.value }),
        signal: AbortSignal.timeout(15000)
      });
      var data = await response.json();
      if (!response.ok || data.ok !== true) {
        if (response.status === 429) throw new Error('busy');
        if (response.status === 400) throw new Error('invalid');
        throw new Error('unavailable');
      }
      email.readOnly = true;
      consent.disabled = true;
      submit.textContent = 'You’re on the list ✓';
      say('Thank you. Your interest is saved on Carla’s list. The guide is still being prepared; no email or download has been sent.', 'success');
      ready = false;
    } catch (error) {
      say(error.message === 'busy' ? 'Signup is busy right now. Please try again in a few minutes.' : error.message === 'invalid' ? 'Please check your email and agree to the email updates before trying again.' : 'We could not confirm your signup. Please try again. Retrying will not add you twice.', 'error');
      submit.disabled = false;
    } finally {
      busy = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
