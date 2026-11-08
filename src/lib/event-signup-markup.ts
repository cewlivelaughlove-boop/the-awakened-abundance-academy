export function eventSignupMarkup(source: "event-page" | "book-page") {
  return `<section class="event-signup" id="event-signup" aria-labelledby="event-signup-title">
    <p class="event-kicker">Stay connected with Carla</p>
    <h2 id="event-signup-title">Your next chapter<br>starts here.</h2>
    <p class="event-intro">Leave your email for updates from Carla and news about <em>Beyond the Script</em>, her upcoming free reflection guide.</p>
    <form data-event-signup data-source="${source}" aria-describedby="event-privacy event-status" novalidate>
      <label class="event-label" for="event-email">Email address</label>
      <input id="event-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="254" placeholder="you@example.com" required>
      <div class="event-trap" aria-hidden="true"><label for="event-website">Leave this field empty</label><input id="event-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
      <label class="event-consent" for="event-consent"><input id="event-consent" name="consent" type="checkbox" required><span>I agree to receive Carla’s updates and news about the free guide by email. I can ask to leave the list at any time.</span></label>
      <button class="event-submit" type="submit" disabled>Keep me connected <span aria-hidden="true">↗</span></button>
      <p id="event-status" class="event-status" role="status" aria-live="polite" aria-atomic="true">Checking signup availability…</p>
    </form>
    <p class="event-availability">The complete guide is not available for download yet. Joining saves your interest; it does not send an instant email or PDF.</p>
    <details id="event-privacy" class="event-privacy"><summary>How your email is used</summary><p>Your email, signup time and consent are saved in Carla’s project so she and authorized project editors can manage the list. They are not shown to visitors. A temporary, non-reversible network identifier helps reduce spam. This form does not ask for personal spiritual beliefs.</p><p>To leave the list or request removal, contact <a href="mailto:cewlivelaughlove@gmail.com">cewlivelaughlove@gmail.com</a>. Carla can contact you about the updates you agreed to receive. This page does not currently send automated email.</p></details>
    <noscript><p class="event-status">Please enable JavaScript to join the list. Your email will only be saved after you submit the form successfully.</p></noscript>
  </section>`;
}

/** Preserve immutable approved documents; enhance only the existing release area. */
export function withEventSignup(html: string) {
  const marker = '<div class="release-wrap">';
  const start = html.indexOf(marker);
  const end = html.indexOf('</section></div>', start);
  if (start < 0 || end < 0) throw new Error("Approved book release section was not found");
  const replacement = `<div class="release-wrap"><div class="shell event-book-release" id="release">${eventSignupMarkup("book-page")}</div></div>`;
  return (html.slice(0, start) + replacement + html.slice(end + '</section></div>'.length))
    .replace('</head>', '<link rel="stylesheet" href="./assets/event-signup.css?v=event-20261108-1"></head>')
    .replace('</body>', '<script src="./assets/event-signup.js?v=event-20261108-1" defer></script></body>')
    .replaceAll("Explore the book. Signup coming soon.", "Explore the book and join Carla’s email list for updates.");
}
