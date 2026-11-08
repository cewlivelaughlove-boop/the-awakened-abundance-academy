// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { repairSanctuaryPlayback } from "../lib/sanctuary-playback";

function controller() {
  const dom = new JSDOM('<main id="scene"></main><button id="motion-toggle"></button>', {
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const calls: { resolve: () => void; reject: (error: DOMException) => void }[] = [];
  const video = dom.window.document.createElement("video");
  video.dataset["mediaState"] = "ready";
  video.pause = () => {};
  video.play = () => new Promise<void>((resolve, reject) => calls.push({ resolve, reject }));
  let reduced = false,
    label = false;
  const m = {
    get matches() {
      return reduced;
    },
  };
  const ui = {
    setMotion: (value: boolean) => {
      label = value;
    },
    setStatus: () => {},
  };
  const source = readFileSync("src/approved/v23/index.html", "utf8");
  const served = repairSanctuaryPlayback(source);
  const fragment = served.slice(
    served.indexOf("let motionAttempt=0"),
    served.indexOf('p.muted=!0;p.addEventListener("loadeddata",f,{once:!0});'),
  );
  const api = dom.window.Function(
    "p",
    "i",
    "M",
    `let c=false,D=true;${fragment};return { sync:f, pause(){c=true;f()}, resume(){c=false;f()}, get paused(){return c} };`,
  )(video, ui, m);
  return {
    dom,
    video,
    api,
    calls,
    get label() {
      return label;
    },
    reduce() {
      reduced = true;
    },
  };
}
const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

describe("Planet video playback recovery", () => {
  it("does not persist interrupted play as a pause; canplay retries", async () => {
    const c = controller();
    c.api.sync();
    c.calls[0]!.reject(new DOMException("interrupted", "AbortError"));
    await settle();
    expect(c.api.paused).toBe(false);
    expect(c.label).toBe(false);
    c.video.dispatchEvent(new c.dom.window.Event("canplay"));
    expect(c.calls).toHaveLength(2);
    c.dom.window.close();
  });
  it("ignores stale rejected play when a newer play attempt already exists", async () => {
    const c = controller();
    c.api.sync();
    c.api.sync();
    c.calls[1]!.resolve();
    c.calls[0]!.reject(new DOMException("stale", "NotAllowedError"));
    await settle();
    expect(c.api.paused).toBe(false);
    expect(c.video.dataset["autoplayBlocked"]).toBeUndefined();
    c.dom.window.close();
  });
  it("retries Safari refusal from the entrance gesture, with muted inline playback", async () => {
    const c = controller();
    c.api.sync();
    c.calls[0]!.reject(new DOMException("gesture required", "NotAllowedError"));
    await settle();
    expect(c.api.paused).toBe(true);
    expect(c.video.dataset["autoplayBlocked"]).toBe("true");
    c.dom.window.dispatchEvent(new c.dom.window.Event("academy-entered"));
    expect(c.calls).toHaveLength(2);
    expect(c.api.paused).toBe(false);
    expect(c.video.muted).toBe(true);
    expect(c.video.defaultMuted).toBe(true);
    expect(c.video.playsInline).toBe(true);
    c.dom.window.close();
  });
  it("room taps recover a browser refusal, but never override visitor pause or reduced motion", async () => {
    const c = controller();
    c.api.sync();
    c.calls[0]!.reject(new DOMException("gesture required", "NotAllowedError"));
    await settle();
    c.reduce();
    c.dom.window.document.querySelector("main")!.click();
    expect(c.calls).toHaveLength(1);
    c.dom.window.close();
    const second = controller();
    second.api.pause();
    second.dom.window.document.querySelector("main")!.click();
    expect(second.calls).toHaveLength(0);
    second.dom.window.close();
  });
});

describe("Boutique planet recovery", () => {
  it("ignores interrupted source requests and recovers blocked playback on a room tap", async () => {
    const dom = new JSDOM(
      '<video id="boutique-exterior"></video><button id="boutique-motion"></button><p id="room-status"></p><main></main>',
      { runScripts: "outside-only", pretendToBeVisual: true },
    );
    const video = dom.window.document.querySelector("video")!;
    const calls: { resolve: () => void; reject: (error: DOMException) => void }[] = [];
    video.play = () => new Promise<void>((resolve, reject) => calls.push({ resolve, reject }));
    video.pause = () => {};
    Object.assign(dom.window, {
      matchMedia: () => ({ matches: false, addEventListener: () => {} }),
    });
    const source = readFileSync("public/assets/boutique.js", "utf8").split(
      "/* The same exterior journey",
    )[1];
    dom.window.eval("/* The same exterior journey" + source);
    calls[0]!.reject(new DOMException("interrupted", "AbortError"));
    await settle();
    expect(dom.window.document.querySelector("button")!.textContent).toBe("Pause motion");
    video.dispatchEvent(new dom.window.Event("canplay"));
    expect(calls).toHaveLength(2);
    calls[1]!.reject(new DOMException("gesture", "NotAllowedError"));
    await settle();
    expect(video.dataset["autoplayBlocked"]).toBe("true");
    dom.window.document.querySelector("main")!.click();
    expect(calls).toHaveLength(3);
    expect(dom.window.document.querySelector("button")!.textContent).toBe("Pause motion");
    dom.window.document.querySelector("button")!.click();
    dom.window.document.querySelector("main")!.click();
    expect(calls).toHaveLength(3);
    dom.window.close();
  });
});
