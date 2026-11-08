import { repairSanctuaryPlayback } from "../lib/sanctuary-playback";
// @vitest-environment node
import { readFileSync as readOriginalFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import manifest from "../../.lovable/migrate-external-project/continuation-installed-files.json";
import corrections from "../../.lovable/migrate-external-project/arrival-installed-files.json";
import cacheFix from "../../.lovable/migrate-external-project/cache-sightline-installed-files.json";
import welcomeFix from "../../.lovable/migrate-external-project/welcome-replay-installed-files.json";
import boutiqueIntro from "../../.lovable/migrate-external-project/boutique-intro-installed-files.json";
import guidedArrival from "../../.lovable/migrate-external-project/guided-arrival-installed-files.json";
import experience from "../../.lovable/migrate-external-project/experience-content-installed-files.json";
import preserved from "../../.lovable/migrate-external-project/experience-content-preserved-files.json";
import polish from "../../.lovable/migrate-external-project/celestial-reading-installed-files.json";
import polishPreserved from "../../.lovable/migrate-external-project/celestial-reading-preserved-files.json";
import { approvedDocument } from "../lib/approved-website";
import { optimizeStandaloneAssetUrls } from "../lib/performance-assets";
// These historical manifests intentionally test the archived pre-optimization bytes.
function readFileSync(path: string): Buffer;
function readFileSync(path: string, encoding: "utf8"): string;
function readFileSync(path: string, encoding?: "utf8"): string | Buffer {
  const archived = `.lovable/performance-20261108/before/${path}`;
  return encoding
    ? readOriginalFileSync(existsSync(archived) ? archived : path, encoding)
    : readOriginalFileSync(existsSync(archived) ? archived : path);
}
const roomPreviewOriginal = ".lovable/abundance-cards/rooms.before.js";
const beforeDeskPreview = (path: string) =>
  path === "public/assets/rooms.js" ? roomPreviewOriginal : path;

describe("Approved V23 static packaging", () => {
  it("retains every supplied file byte-identically below 10 MiB", () => {
    expect(manifest).toHaveLength(43);
    for (const file of manifest) {
      const replacement = corrections.find((entry) => entry.installed === file.installed);
      const latest = guidedArrival.find((entry) => entry.installed === file.installed);
      const update = experience.find((entry) => entry.installed === file.installed);
      const bytes = readFileSync(
        replacement?.backup ?? latest?.backup ?? update?.backup ?? file.installed,
      );
      expect(bytes.byteLength).toBe(file.bytes);
      expect(bytes.byteLength).toBeLessThan(10 * 1024 * 1024);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(file.sha256);
    }
  });
  it("installs the 4 cache/sightline HTML files exactly with backups", () => {
    expect(cacheFix).toHaveLength(4);
    for (const file of cacheFix) {
      const newer = welcomeFix.find((entry) => entry.installed === file.installed);
      const bytes = readFileSync(beforeDeskPreview(newer?.backup ?? file.installed));
      expect(bytes.byteLength).toBe(file.bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(file.sha256);
      expect(createHash("sha256").update(readFileSync(file.backup)).digest("hex")).toBe(
        file.previousSha256,
      );
      expect(bytes.toString()).not.toMatch(
        /assets\/[\w-]+\.(js|css)(?!\?v=arrival-20261102-2)["?]/,
      );
    }
  });
  it("installs all 16 correction files exactly and preserves overwritten originals", () => {
    expect(corrections).toHaveLength(16);
    for (const file of corrections) {
      const later = cacheFix.find((entry) => entry.installed === file.installed);
      const newer = welcomeFix.find((entry) => entry.installed === file.installed);
      const latest = guidedArrival.find((entry) => entry.installed === file.installed);
      const update = experience.find((entry) => entry.installed === file.installed);
      const bytes = readFileSync(
        later?.backup ?? newer?.backup ?? latest?.backup ?? update?.backup ?? file.installed,
      );
      expect(bytes.byteLength).toBe(file.bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(file.sha256);
      if (file.backup) {
        expect(createHash("sha256").update(readFileSync(file.backup)).digest("hex")).toBe(
          file.previousSha256,
        );
      }
    }
  });
  it("installs the 6 welcome-replay files exactly with backups", () => {
    expect(welcomeFix).toHaveLength(6);
    for (const file of welcomeFix) {
      const newer = boutiqueIntro.find((entry) => entry.installed === file.installed);
      const latest = guidedArrival.find((entry) => entry.installed === file.installed);
      const update = experience.find((entry) => entry.installed === file.installed);
      const bytes = readFileSync(
        newer?.backup ?? latest?.backup ?? update?.backup ?? file.installed,
      );
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(file.sha256);
      expect(createHash("sha256").update(readFileSync(file.backup)).digest("hex")).toBe(
        file.previousSha256,
      );
      if (file.installed.endsWith(".html"))
        expect(bytes.toString()).not.toMatch(
          /assets\/[\w-]+\.(js|css)(?!\?v=welcome-20261102-3)["?]/,
        );
    }
  });
  it("installs the boutique intro copy update exactly with a backup", () => {
    expect(boutiqueIntro).toHaveLength(1);
    for (const file of boutiqueIntro) {
      const latest = guidedArrival.find((entry) => entry.installed === file.installed);
      const bytes = readFileSync(latest?.backup ?? file.installed);
      expect(bytes.byteLength).toBe(file.bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(file.sha256);
      expect(createHash("sha256").update(readFileSync(file.backup)).digest("hex")).toBe(
        file.previousSha256,
      );
      const html = bytes.toString();
      expect(html).toMatch(/class="boutique-intro-title"/);
      expect(html).toMatch(/class="boutique-intro-copy"/);
      expect(html).toMatch(/The Awakened Abundance Academy/);
      expect(html).toMatch(/nothing is for sale yet/);
      expect(html).not.toMatch(/assets\/[\w-]+\.(js|css)(?!\?v=welcome-20261102-3)["?]/);
    }
  });
  it("installs exactly ten guided-arrival files with exact backups", () => {
    expect(guidedArrival).toHaveLength(10);
    for (const file of guidedArrival) {
      const update = experience.find((entry) => entry.installed === file.installed);
      const bytes = readFileSync(update?.backup ?? file.installed);
      expect(bytes.byteLength).toBe(file.bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(file.sha256);
      expect(createHash("sha256").update(readFileSync(file.backup)).digest("hex")).toBe(
        file.previousSha256,
      );
    }
  });
  it("installs all twenty experience files exactly and keeps overwritten backups", () => {
    expect(experience).toHaveLength(20);
    for (const file of experience) {
      const newer = polish.find((entry) => entry.installed === file.installed);
      const bytes = readFileSync(beforeDeskPreview(newer?.backup ?? file.installed));
      expect(bytes.byteLength).toBe(file.bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(file.sha256);
      if (file.backup)
        expect(createHash("sha256").update(readFileSync(file.backup)).digest("hex")).toBe(
          file.previousSha256,
        );
    }
  });
  it("preserves every other production document, asset, route and SEO file", () => {
    expect(preserved.length).toBeGreaterThan(50);
    for (const file of preserved) {
      expect(createHash("sha256").update(readFileSync(file.installed)).digest("hex")).toBe(
        file.sha256,
      );
    }
  });
  it("installs exactly seven owner-hashed polish files and preserves all four overwritten documents", () => {
    expect(polish).toHaveLength(7);
    expect(polish.filter((file) => "backup" in file)).toHaveLength(4);
    for (const file of polish) {
      const bytes = readFileSync(
        file.installed === "public/assets/celestial-reading.css"
          ? ".lovable/finishing/celestial-reading.before.css"
          : file.installed,
      );
      expect(bytes.byteLength).toBe(file.bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(file.sha256);
      if ("backup" in file && file.backup)
        expect(createHash("sha256").update(readFileSync(file.backup)).digest("hex")).toBe(
          file.previousSha256,
        );
    }
  });
  it("keeps all 75 other production files byte-identical after the polish", () => {
    expect(polishPreserved).toHaveLength(75);
    for (const file of polishPreserved) {
      const bytes = readFileSync(beforeDeskPreview(file.installed));
      expect(bytes.byteLength).toBe(file.bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(file.sha256);
    }
  });
  it.each([
    [
      "naomi-full-alpha.webm",
      3,
      "37117549279f15157d5356fd244217d4490dd28283235b3c7ae7b3050ee1f364",
    ],
    [
      "planet-journey-v4.mp4",
      2,
      "59698ecdd53ae96ce656a2920b9bf2ef085d8916e29442adcf599d0c516d040f",
    ],
  ] as const)(
    "reconstructs original %s without storing its oversized file",
    (name, count, originalHash) => {
      const hash = createHash("sha256");
      for (let i = 0; i < count; i++) {
        const bytes = readFileSync(`public/assets/media-parts/${name}.part${i}`);
        expect(bytes.byteLength).toBeLessThanOrEqual(8 * 1024 * 1024);
        hash.update(bytes);
      }
      expect(hash.digest("hex")).toBe(originalHash);
      expect(existsSync(`public/assets/${name}`)).toBe(false);
    },
  );
  it("keeps the original iPhone animation at its same-origin path", () => {
    expect(
      createHash("sha256")
        .update(readFileSync("public/assets/naomi-full-phone.webp"))
        .digest("hex"),
    ).toBe("d124c1dc0fa070dfaa827a64f919518a1386ce66c3d9c9d9064cb012a32ea99d");
  });
  it.each(["index", "boutique"])(
    "loads the media packager before journey restoration in %s",
    (name) => {
      const html = readFileSync(`src/approved/v23/${name}.html`, "utf8");
      const loader = html.indexOf('src="./assets/media-loader.js');
      expect(loader).toBeGreaterThan(0);
      expect(html.indexOf('src="./assets/journey-state.js')).toBeGreaterThan(loader);
    },
  );
  it("returns the approved document with only delivery URL optimizations", async () => {
    const html = readFileSync("src/approved/v23/index.html", "utf8");
    const response = approvedDocument(html);
    expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    expect(await response.text()).toBe(repairSanctuaryPlayback(optimizeStandaloneAssetUrls(html)));
  });
});
