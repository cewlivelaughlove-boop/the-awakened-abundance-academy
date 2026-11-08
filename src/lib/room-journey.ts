import { roomJourneyPatches } from "./room-journey-patches";

/** Apply the approved connected-room presentation without rewriting archived HTML. */
export function withRoomJourney(html: string): string {
  const room = html.includes('id="boutique-stage"')
    ? "boutique"
    : html.includes('id="stage"')
      ? "index"
      : html.includes('class="upcoming-volume"') || html.includes("upcoming-volume")
        ? "library"
        : null;
  // The separate event signup shares the renderer, but not the room presentation.
  // Restrict enhancements to the approved room and reading-page classes.
  if (!room && !/class="[^"]*\b(?:book-page|start-page)\b/.test(html)) return html;
  let result = html;
  if (room) {
    const patches = roomJourneyPatches[room] ?? [];
    // An unexpected source change must not leave half of a room remapped.
    if (patches.some(([before]) => result.split(before).length !== 2)) {
      console.error(
        `Room journey could not match the ${room} source; keeping its original presentation.`,
      );
      return html;
    }
    for (const [before, after] of patches) result = result.replace(before, after);
  }
  if (!result.includes("immersive-proof.js")) {
    const assetVersion = "phone-20261108-10";
    const styles =
      `<link rel="stylesheet" href="./assets/immersive-proof.css?v=${assetVersion}">` +
      (room === "boutique"
        ? '<link rel="stylesheet" href="./assets/boutique-doorway-proof.css?v=phone-20261108-10">'
        : "");
    result = result.replace("</head>", styles + "</head>");
    result = result.replace(
      "</body>",
      `<script type="module" src="./assets/immersive-proof.js?v=${assetVersion}"></script></body>`,
    );
  }
  return result.replace(
    /(assets\/(?:boutique|celestial-reading)\.(?:js|css))(?:\?[^"'<>\s]*)?/g,
    "$1?v=phone-20261108-10",
  );
}
