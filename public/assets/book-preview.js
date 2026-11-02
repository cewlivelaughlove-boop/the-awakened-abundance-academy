'use strict';
(() => {
  // Text and images are taken only from PDF pages 3, 4 and 5.
  const pages = [
  {
    "number": 3,
    "title": "Notice what you were taught",
    "chapter": "01 THE INHERITED SCRIPT",
    "src": "./assets/book-preview-03.jpg",
    "paragraphs": [
      "Before we could choose our own words, other people's words were already around us. They told us what was sensible, what was possible, what kind of person we should become and what kind of dream we should keep to ourselves. Some of these lessons offered love and guidance. Some reflected fear, limitation or a world that left little room for imagination.",
      "An old script may sound like: Be realistic. Do not ask too many questions. Creativity is not for people like us. Wait until you have permission. When a sentence is repeated often enough, it can begin to feel like the edge of reality rather than one way of seeing it.",
      "Questioning a script does not require turning against everyone who helped raise you. People pass on what they know, including the ways they learned to survive. You can recognize that history with compassion and still ask whether a belief belongs in the life you are creating now.",
      "The film The Matrix offers an image of waking up to a life you have accepted without questioning. Here, that image points toward the web of expectations we may follow: constant comparison, borrowed definitions of success and the assumption that the familiar is the only possible way. A step toward freedom can be quiet. You notice a thought and ask, Is this something I choose, or something I have learned to repeat?",
      "Do not rush to replace one rigid story with another. Give yourself room to investigate. A belief becomes less absolute when you can name where it came from, what it protected and what it has kept you from exploring.",
      "Listen for the sentence beneath the hesitation\n- What do I tell myself just before I stop creating?\n- Whose approval does that sentence seem to require?\n- What part of the lesson still serves me, and what part can I reconsider?",
      "Write a new opening I learned ____. I can understand why that belief existed. Today, I am willing to explore ____. Let the new sentence open a possibility rather than promise a perfect outcome."
    ]
  },
  {
    "number": 4,
    "title": "You are part of creation",
    "chapter": "02 REMEMBERING YOUR NATURE",
    "src": "./assets/book-preview-04.jpg",
    "paragraphs": [
      "To speak of the Creator is to turn toward the source of life and the mystery of coming into being. We came from creation. Within this spiritual understanding, our capacity to imagine and make is not separate from that belonging. It is one way we participate in it.",
      "You do not have to become someone extraordinary before you can create. You are already shaping things through attention, words, choices and care. A meal becomes a welcome. A question becomes a conversation. A drawing becomes a design. A room becomes a place where another person feels invited to be present.",
      "When we speak of ourselves as higher beings, let higher point toward a wider awareness, not a higher rank. It is the invitation to live beyond the smallest story we have been told about ourselves. It does not place us above other people or make our needs more important than theirs.",
      "You may believe that we came here by choice, with a purpose to explore through human life. Let that perspective invite curiosity, never blame for what someone suffers. What can you learn, enjoy or contribute here? Play and wonder can belong to your purpose as much as effort. You do not need to discover one perfect mission or earn every moment of delight.",
      "There is humility in this understanding. We make from what life has already given: language learned from others, materials from the world, skills practiced over time and help we did not create alone. Your contribution can be genuinely yours without being separate from everything that made it possible.",
      "A moment of remembrance Set aside the need to impress anyone. Notice one ordinary thing you have helped bring into being. It may have been useful for an hour, a day or a person. What did you contribute that was not there before?",
      "Consider in your journal\n- When do I feel most connected to the act of creating?\n- What changes when I see creativity as participation rather than performance?\n- What could I offer today without needing it to prove who I am?"
    ]
  },
  {
    "number": 5,
    "title": "Give your imagination room",
    "chapter": "03 THE INNER BEGINNING",
    "src": "./assets/book-preview-05.jpg",
    "paragraphs": [
      "Before something has a form, it needs a place to be considered. Imagination offers that place. It lets you see a possibility that is not yet present: words arranged differently, a design with a feeling inside it, a space that could welcome people in a new way.",
      "Not every imagined thing will become real, and not every idea is yours to pursue. Still, an idea cannot be explored if it is dismissed the instant it appears. Sometimes we call ourselves practical when we are refusing the first fragile moment of possibility.",
      "Give imagination a little room before asking it to defend itself. You can picture, sketch, speak aloud or write a list. There is no single correct way to receive an idea. Some people see images; others think in words, sensations or questions. Your way of imagining does not need to resemble anyone else's.",
      "Notice the difference between imagining and escaping. An idea becomes more connected to life when it leads you back into attention: What might this require? Who could it help? What do I need to learn? You do not have to abandon ordinary responsibilities to honor an inner possibility. You can begin beside them, with the space that is genuinely available.",
      "Protect this early stage from comparison. Someone else's finished creation contains steps you cannot see. Your beginning does not need to compete with their result. Give the idea enough kindness to become clear before deciding what should happen next.",
      "Try ten unedited minutes Choose something you wish existed. Write or sketch without correcting the first attempt. When you notice a sentence such as That is silly or Someone has already done it, set that judgment aside long enough to finish. Then circle one part that feels alive to you.",
      "Look a little closer\n- What am I imagining, in plain words?\n- What feeling, question or need gave rise to it?\n- Which small part would I like to understand better?"
    ]
  }
];
  const dialog = document.getElementById('book-preview');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const byId = id => document.getElementById(id);
  const image = byId('preview-page-image'), transcript = byId('preview-transcript');
  const viewport = byId('preview-viewport'), count = byId('preview-count');
  const previous = byId('preview-previous'), next = byId('preview-next');
  const textButton = byId('preview-text'), zoomButton = byId('preview-zoom');
  let index = 0, textMode = false, enlarged = false, returnFocus = null;
  function render() {
    const page = pages[index];
    image.src = page.src;
    image.alt = `Page ${page.number}: ${page.title}. Use Read as text for an accessible transcript.`;
    const heading = document.createElement('h3'); heading.textContent = page.title;
    transcript.replaceChildren(heading, ...page.paragraphs.map(content => {
      const paragraph = document.createElement('p'); paragraph.textContent = content; return paragraph;
    }));
    count.textContent = `${index + 1} of ${pages.length} · Book page ${page.number}`;
    byId('preview-caption').textContent = page.title;
    previous.disabled = index === 0; next.disabled = index === pages.length - 1;
    image.hidden = textMode; transcript.hidden = !textMode;
    textButton.setAttribute('aria-pressed', String(textMode));
    textButton.textContent = textMode ? 'Show page image' : 'Read as text';
    zoomButton.hidden = textMode;
    zoomButton.setAttribute('aria-pressed', String(enlarged));
    zoomButton.textContent = enlarged ? 'Fit page width' : 'Enlarge page';
    viewport.classList.toggle('is-enlarged', enlarged && !textMode);
    viewport.scrollTop = 0; viewport.scrollLeft = 0;
  }
  function openReader(trigger) {
    if (dialog.open) return;
    returnFocus = trigger || document.activeElement;
    index = 0; render();
    document.documentElement.classList.add('preview-open');
    dialog.showModal(); byId('preview-close').focus();
  }
  function changePage(delta) {
    const destination = Math.max(0, Math.min(pages.length - 1, index + delta));
    if (destination === index) return;
    index = destination; render();
  }
  document.addEventListener('click', event => {
    const trigger = event.target.closest?.('a[href="#preview"]');
    if (!trigger || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.replaceState(history.state, '', location.pathname + location.search + '#preview');
    openReader(trigger);
  });
  byId('preview-close').addEventListener('click', () => dialog.close());
  previous.addEventListener('click', () => changePage(-1));
  next.addEventListener('click', () => changePage(1));
  textButton.addEventListener('click', () => { textMode = !textMode; render(); });
  zoomButton.addEventListener('click', () => { enlarged = !enlarged; render(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); changePage(event.key === 'ArrowRight' ? 1 : -1);
    }
    // Escape closes the native dialog and restores focus via the close handler.
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('preview-open');
    if (location.hash === '#preview') history.replaceState(history.state, '', location.pathname + location.search);
    if (returnFocus?.isConnected && typeof returnFocus.focus === 'function') returnFocus.focus();
  });
  window.addEventListener('hashchange', () => {
    if (location.hash === '#preview') openReader();
    else if (dialog.open) dialog.close();
  });
  if (location.hash === '#preview') openReader();
})();
