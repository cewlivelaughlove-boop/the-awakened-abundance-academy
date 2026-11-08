import { eventSignupMarkup } from "../lib/event-signup-markup";

export const eventPage = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stay connected with Carla · Voidwalker Academy</title>
<meta name="description" content="Meet Carla and join her email list for updates and news about Beyond the Script, her upcoming free reflection guide.">
<meta name="theme-color" content="#09070d"><link rel="stylesheet" href="./assets/event-signup.css?v=event-20261108-1">
</head><body class="event-page"><a class="event-skip" href="#main">Skip to signup</a>
<header class="event-header"><a class="event-brand" href="./index.html">VOIDWALKER<span>ACADEMY</span></a><a class="event-back" href="./books.html">Explore the book <span aria-hidden="true">↗</span></a></header>
<main id="main" class="event-main"><div class="event-art"><div class="event-book"><img src="./assets/beyond-the-script-public-cover.png" alt="Beyond the Script book cover" width="1122" height="1402" fetchpriority="high"></div><p>A little reflection.<br>A new possibility.</p></div>${eventSignupMarkup("event-page")}</main>
<footer class="event-footer"><a href="./index.html">Explore the academy</a><span>Carla · Voidwalker Academy</span></footer><script src="./assets/event-signup.js?v=event-20261108-1" defer></script></body></html>`;
