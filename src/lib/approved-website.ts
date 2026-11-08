import { withRoomJourney } from "./room-journey";
import { repairSanctuaryPlayback } from "./sanctuary-playback";
import { optimizeStandaloneAssetUrls } from "./performance-assets";
import { withEventSignup } from "./event-signup-markup";

/** Serve the approved standalone documents without React/CSS interference. */
export function approvedDocument(html: string) {
  const presented = withRoomJourney(repairSanctuaryPlayback(optimizeStandaloneAssetUrls(html)));
  const enriched =
    presented.includes('id="release-title"') && presented.includes('class="book-page"')
      ? withEventSignup(presented)
      : presented;
  return new Response(enriched, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export function approvedHead(title: string, description: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
