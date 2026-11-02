// @vitest-environment node
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import manifest from "../../.lovable/migrate-external-project/continuation-installed-files.json";
import corrections from "../../.lovable/migrate-external-project/arrival-installed-files.json";
import { approvedDocument } from "../lib/approved-website";

describe("Approved V23 static packaging", () => {
  it("retains every supplied file byte-identically below 10 MiB", () => {
    expect(manifest).toHaveLength(43);
    for (const file of manifest) {
      const replacement = corrections.find((entry) => entry.installed === file.installed);
      const bytes = readFileSync(replacement?.backup ?? file.installed);
      expect(bytes.byteLength).toBe(file.bytes);
      expect(bytes.byteLength).toBeLessThan(10 * 1024 * 1024);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(file.sha256);
    }
  });
  it("installs all 16 correction files exactly and preserves overwritten originals", () => {
    expect(corrections).toHaveLength(16);
    for (const file of corrections) {
      const bytes = readFileSync(file.installed);
      expect(bytes.byteLength).toBe(file.bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(file.sha256);
      if (file.backup) {
        expect(createHash("sha256").update(readFileSync(file.backup)).digest("hex")).toBe(file.previousSha256);
      }
    }
  });
  it.each([
    ["naomi-full-alpha.webm", 3, "37117549279f15157d5356fd244217d4490dd28283235b3c7ae7b3050ee1f364"],
    ["planet-journey-v4.mp4", 2, "59698ecdd53ae96ce656a2920b9bf2ef085d8916e29442adcf599d0c516d040f"],
  ] as const)("reconstructs original %s without storing its oversized file", (name, count, originalHash) => {
    const hash = createHash("sha256");
    for (let i = 0; i < count; i++) {
      const bytes = readFileSync(`public/assets/media-parts/${name}.part${i}`);
      expect(bytes.byteLength).toBeLessThanOrEqual(8 * 1024 * 1024);
      hash.update(bytes);
    }
    expect(hash.digest("hex")).toBe(originalHash);
    expect(existsSync(`public/assets/${name}`)).toBe(false);
  });
  it("keeps the original iPhone animation at its same-origin path", () => {
    expect(createHash("sha256").update(readFileSync("public/assets/naomi-full-phone.webp")).digest("hex"))
      .toBe("d124c1dc0fa070dfaa827a64f919518a1386ce66c3d9c9d9064cb012a32ea99d");
  });
  it.each(["index", "boutique"])("loads the media packager before journey restoration in %s", (name) => {
    const html = readFileSync(`src/approved/v23/${name}.html`, "utf8");
    const loader = html.indexOf('src="./assets/media-loader.js');
    expect(loader).toBeGreaterThan(0);
    expect(html.indexOf('src="./assets/journey-state.js')).toBeGreaterThan(loader);
  });
  it("returns the document unchanged as HTML", async () => {
    const html = readFileSync("src/approved/v23/index.html", "utf8");
    const response = approvedDocument(html);
    expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    expect(await response.text()).toBe(html);
  });
});