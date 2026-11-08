import { eventSignupMarkup } from "../lib/event-signup-markup";

// Only the standalone event page is simplified. The shared book-area markup,
// consent contract, client script and backend remain exactly as published.
const signup = eventSignupMarkup("event-page")
  .replace('<p class="event-kicker">Stay connected with Carla</p>', "")
  .replace(
    '<h2 id="event-signup-title">Your next chapter<br>starts here.</h2>',
    '<h1 id="event-signup-title" tabindex="-1">Stay connected<br><em>with Carla.</em></h1>',
  )
  .replace(
    '<p class="event-intro">Leave your email for updates from Carla and news about <em>Beyond the Script</em>, her upcoming free reflection guide.</p>',
    '<p class="event-intro">Leave your email to stay connected with Carla.</p>',
  )
  .replace(
    'Keep me connected <span aria-hidden="true">↗</span>',
    'Keep me connected <span class="event-arrow" aria-hidden="true"></span>',
  )
  .replace(
    '<p class="event-availability">The complete guide is not available for download yet. Joining saves your interest; it does not send an instant email or PDF.</p>',
    "",
  )
  .replace(
    "<summary>How your email is used</summary>",
    "<summary>Privacy &amp; signup details</summary><p>The complete guide is not available for download yet. Joining saves your interest; it does not send an instant email or PDF.</p>",
  );

export const eventPage = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stay connected with Carla · Voidwalker Academy</title>
<meta name="description" content="Stay connected with Carla. Join her email list for updates from the Voidwalker Academy.">
<meta name="theme-color" content="#09080d"><link rel="preload" as="image" href="./assets/optimized/sanctuary-polished-v5-lossless-v1.webp"><link rel="stylesheet" href="./assets/event-invitation.css?v=event-20261108-3">
</head><body class="event-page"><a class="event-skip" href="#event-signup-title">Skip to signup</a>
<header class="event-header"><a class="event-brand" href="./index.html" aria-label="Voidwalker Academy home">VOIDWALKER<span>ACADEMY</span></a></header>
<main id="main" class="event-main"><aside class="event-art" aria-label="A glimpse inside the academy"><img class="event-scene" src="./assets/optimized/sanctuary-polished-v5-lossless-v1.webp" alt="A dark, elegant sanctuary overlooking a luminous purple galaxy" width="1672" height="941" fetchpriority="high"></aside>${signup}</main>
<footer class="event-footer"><span>Carla · Voidwalker Academy</span><a href="https://thefruitfulassets.com">Created by <strong>Fruitful Assets</strong></a></footer><script src="./assets/event-signup.js?v=event-20261108-1" defer></script></body></html>`;
