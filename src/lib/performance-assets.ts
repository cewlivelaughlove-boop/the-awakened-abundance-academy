/** Original PNGs remain archived in place. Every variant has identical RGBA pixels. */
const losslessArtwork: Record<string, string> = {
  "sanctuary-polished-v5.png": "sanctuary-polished-v5-lossless-v1.webp",
  "boutique-polished-hq-v2.png": "boutique-polished-hq-v2-lossless-v1.webp",
  "voidwalk-chamber-v3.png": "voidwalk-chamber-v3-lossless-v1.webp",
  "planet-journey-poster-v4.png": "planet-journey-poster-v4-lossless-v1.webp",
  "cosmic-guide-organic-v5.png": "cosmic-guide-organic-v5-lossless-v1.webp",
  "observatory-slender-refractor-v4.png": "observatory-slender-refractor-v4-lossless-v1.webp",
  "boutique-journals-tree-v3.png": "boutique-journals-tree-v3-lossless-v1.webp",
  "voidwalker-wall-plaque.png": "voidwalker-wall-plaque-lossless-v1.webp",
  "beyond-the-script-public-cover.png": "beyond-the-script-public-cover-lossless-v1.webp",
};
export function optimizeStandaloneAssetUrls(html: string): string {
  let result = html.replace(/(\.\/assets\/)([a-z0-9-]+\.png)/g, (original, prefix, file) =>
    losslessArtwork[file] ? `${prefix}optimized/${losslessArtwork[file]}` : original,
  );
  // Fresh code/style URLs prevent old immutable cached files from hiding this fix.
  result = result.replace(
    /(assets\/(?:media-loader|journey-state|boutique|rooms|guide|arrival|celestial-reading)\.(?:js|css))(?:\?[^"'<>\s]*)?/g,
    "$1?v=performance-20261108-1",
  );
  return result;
}
