import { eventPage } from "../content/event-page";
import { optimizeStandaloneAssetUrls } from "../lib/performance-assets";
import { repairSanctuaryPlayback } from "../lib/sanctuary-playback";
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { approvedDocument } from "../lib/approved-website";
import { withRoomJourney } from "../lib/room-journey";
import { eventSignupMarkup } from "../lib/event-signup-markup";

const source = (name: string) => readFileSync(`src/approved/v23/${name}.html`, "utf8");

describe("Connected rooms preserve approved source and signup", () => {
  for (const name of ["index", "boutique", "library", "books", "start"]) {
    it(`${name} adds one consistent navigation module`, async () => {
      const before = source(name);
      const html = await approvedDocument(before).text();
      const doc = new JSDOM(html).window.document;
      expect(doc.querySelectorAll('script[src*="immersive-proof.js"]').length).toBe(1);
      expect(doc.querySelectorAll('link[href*="immersive-proof.css"]').length).toBe(1);
      expect(source(name)).toBe(before);
      expect(html).not.toContain("Private preview · public site unchanged");
    });
  }
  it("book form uses the unchanged approved signup markup", async () => {
    const html = await approvedDocument(source("books")).text();
    expect(html).toContain(eventSignupMarkup("book-page"));
  });
  it("does not partially remap an unexpected room source", () => {
    const unexpected =
      '<html><head></head><body><div id="boutique-stage">Different source</div></body></html>';
    expect(withRoomJourney(unexpected)).toBe(unexpected);
  });
  it("keeps the original spoken/manual entrance code untouched", () => {
    const arrival = readFileSync("public/assets/arrival.js", "utf8");
    expect(arrival).toContain("window.academyWelcome.play()");
    expect(arrival).not.toContain("Entering quietly");
  });
});

it("preserves the complete standalone signup response byte for byte", async () => {
  const expected = repairSanctuaryPlayback(optimizeStandaloneAssetUrls(eventPage));
  const actual = await approvedDocument(eventPage).text();
  expect(actual).toBe(expected);
  expect(actual).not.toContain("immersive-proof");
});
