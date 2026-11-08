import { repairSanctuaryPlayback } from "./sanctuary-playback";
import { optimizeStandaloneAssetUrls } from "./performance-assets";
import { withEventSignup } from "./event-signup-markup";

/** Serve the approved standalone documents without React/CSS interference. */
export function approvedDocument(html: string) {
  const enriched = html.includes('id="release-title"') && html.includes('class="book-page"')
    ? withEventSignup(html)
    : html;
  return new Response(repairSanctuaryPlayback(optimizeStandaloneAssetUrls(enriched)), {
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
