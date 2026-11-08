import { repairSanctuaryPlayback } from "./sanctuary-playback";
import { optimizeStandaloneAssetUrls } from "./performance-assets";

/** Serve the approved standalone documents without React/CSS interference. */
export function approvedDocument(html: string) {
  return new Response(repairSanctuaryPlayback(optimizeStandaloneAssetUrls(html)), {
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
