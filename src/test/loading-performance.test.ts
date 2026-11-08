// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { JSDOM } from "jsdom";
import { optimizeStandaloneAssetUrls } from "../lib/performance-assets";
import manifest from "../../.lovable/performance-20261108/lossless-artwork.json";

describe("Appearance-preserving loading", () => {
  it("retains every original artwork byte and verifies smaller variant hashes", () => {
    let original = 0,
      optimized = 0;
    for (const item of manifest) {
      const before = readFileSync(item.original),
        after = readFileSync(item.optimized);
      expect(createHash("sha256").update(before).digest("hex")).toBe(item.originalSha256);
      expect(createHash("sha256").update(after).digest("hex")).toBe(item.optimizedSha256);
      expect(after.length).toBeLessThan(before.length);
      original += before.length;
      optimized += after.length;
    }
    expect(optimized / original).toBeLessThan(0.67);
  });
  it("changes only approved asset URLs, without changing layout or copy", () => {
    for (const name of ["index", "boutique", "books", "library", "start"]) {
      const source = readFileSync(`src/approved/v23/${name}.html`, "utf8");
      const served = optimizeStandaloneAssetUrls(source);
      let reversed = served;
      for (const file of manifest)
        reversed = reversed.replaceAll(
          file.optimized.replace("public/", "./"),
          file.original.replace("public/", "./"),
        );
      // Version changes are URL-only and preserve original script ordering.
      const oldUrls = [
        ...source.matchAll(
          /assets\/(?:media-loader|journey-state|boutique|rooms|guide|arrival|celestial-reading)\.(?:js|css)(?:\?[^"'<>\s]*)?/g,
        ),
      ].map((match) => match[0]);
      let i = 0;
      reversed = reversed.replace(
        /assets\/(?:media-loader|journey-state|boutique|rooms|guide|arrival|celestial-reading)\.(?:js|css)\?v=performance-20261108-1/g,
        () => oldUrls[i++]!,
      );
      expect(reversed).toBe(source);
    }
  });
  it("does not fetch closed-menu artwork, then loads exact artwork on open", () => {
    const dom = new JSDOM(
      '<main id="boutique-scene"><div id="boutique-stage"></div></main><p id="room-status"></p>',
      { url: "https://example.test/boutique.html", runScripts: "outside-only" },
    );
    const source = readFileSync("public/assets/rooms.js", "utf8").split("// Focused additions")[0];
    dom.window.eval(source!);
    const menu = dom.window.document.querySelector<HTMLDetailsElement>(".compact-room-menu")!;
    const images = [...menu.querySelectorAll<HTMLImageElement>("img")];
    expect(images).toHaveLength(3);
    expect(images.every((image) => !image.hasAttribute("src"))).toBe(true);
    expect(images.every((image) => image.dataset["src"]?.includes("-lossless-v1.webp"))).toBe(true);
    menu.open = true;
    menu.dispatchEvent(new dom.window.Event("toggle"));
    expect(images.every((image) => image.src.includes("-lossless-v1.webp"))).toBe(true);
    expect(images.every((image) => !image.hasAttribute("data-src"))).toBe(true);
    dom.window.close();
  });
  it("fetches original media parts together, preserves order, deduplicates and retries failures", async () => {
    const dom = new JSDOM("", { url: "https://example.test", runScripts: "outside-only" });
    const pending: { resolve: (value: unknown) => void; reject: (error: Error) => void }[] = [];
    const requests: { url: string; options: RequestInit }[] = [];
    const urls: Blob[] = [];
    const revoked: string[] = [];
    Object.assign(dom.window, {
      Blob,
      fetch: (url: string, options: RequestInit) => {
        requests.push({ url, options });
        return new Promise((resolve, reject) => pending.push({ resolve, reject }));
      },
    });
    dom.window.URL.createObjectURL = (blob: Blob | MediaSource) => {
      if (!(blob instanceof Blob)) throw new Error("Expected media Blob");
      urls.push(blob);
      return `blob:${urls.length}`;
    };
    dom.window.URL.revokeObjectURL = (url: string) => {
      revoked.push(url);
    };
    dom.window.eval(readFileSync("public/assets/media-loader.js", "utf8"));
    const media = (
      dom.window as unknown as { academyMedia: { load: (key: string) => Promise<string> } }
    ).academyMedia;
    const first = media.load("journey");
    expect(media.load("journey")).toBe(first);
    expect(requests).toHaveLength(2); // both started before either response finishes
    expect(requests.every((item) => item.options.cache === "force-cache")).toBe(true);
    pending[1]!.resolve({ ok: true, blob: async () => new Blob(["B"]) });
    pending[0]!.resolve({ ok: true, blob: async () => new Blob(["A"]) });
    expect(await first).toBe("blob:1");
    expect(await urls[0]!.text()).toBe("AB");
    expect(urls[0]!.type).toBe("video/mp4");
    const failed = media.load("guide");
    expect(requests).toHaveLength(5);
    pending[2]!.reject(new Error("temporary network error"));
    pending[3]!.resolve({ ok: true, blob: async () => new Blob(["B"]) });
    pending[4]!.resolve({ ok: true, blob: async () => new Blob(["C"]) });
    await expect(failed).rejects.toThrow("temporary network error");
    const retry = media.load("guide");
    expect(requests).toHaveLength(8);
    for (const index of [5, 6, 7])
      pending[index]!.resolve({ ok: true, blob: async () => new Blob([String(index)]) });
    await retry;
    dom.window.dispatchEvent(new dom.window.PageTransitionEvent("pagehide", { persisted: true }));
    expect(revoked).toEqual([]);
    dom.window.dispatchEvent(new dom.window.PageTransitionEvent("pagehide", { persisted: false }));
    expect(revoked).toEqual(["blob:1", "blob:2"]);
    dom.window.close();
  });
});
