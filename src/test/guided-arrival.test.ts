import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const source = readFileSync("public/assets/arrival.js", "utf8");

describe("Supplied guided arrival rules", () => {
  let sandbox: HTMLIFrameElement;
  let doc: Document;
  let win: Window;
  let play: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;

  async function mount(roomReady: Promise<void> = Promise.resolve()) {
    sandbox = document.createElement("iframe");
    document.body.append(sandbox);
    const frameWindow = sandbox.contentWindow;
    const frameDocument = sandbox.contentDocument;
    if (!frameWindow || !frameDocument) throw new Error("Missing test frame");
    win = frameWindow;
    doc = frameDocument;
    doc.documentElement.classList.add("arrival-pending");
    doc.body.innerHTML = '<main id="scene" tabindex="0"><div id="stage"><img src="room.png"></div></main><div id="interface"></div><audio id="cosmic-guide-audio"></audio><p id="scene-status"></p>';
    const image = doc.querySelector("img");
    if (!image) throw new Error("Missing room image");
    image.decode = () => roomReady;
    play = vi.fn();
    navigate = vi.fn();
    Object.assign(win, {
      matchMedia: () => ({ matches: false }),
      academyMedia: { load: () => new Promise(() => {}) },
      academyWelcome: { prepare: () => Promise.resolve(true), play },
      academyNavigate: navigate,
    });
    // Execute the supplied browser script against an isolated DOM.
    new Function("window", "document", "matchMedia", "sessionStorage", source)(
      win, doc, () => ({ matches: false }), window.sessionStorage,
    );
    await vi.advanceTimersByTimeAsync(0);
  }
  function enter() {
    const button = doc.querySelector<HTMLButtonElement>(".arrival-enter");
    if (!button) throw new Error("Missing Enter");
    button.click();
  }
  function endWelcome() {
    doc.querySelector("audio")?.dispatchEvent(new Event("ended"));
  }
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    sandbox?.remove();
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it("waits for room image decoding before enabling Enter", async () => {
    let finish: (() => void) | undefined;
    await mount(new Promise<void>((resolve) => { finish = resolve; }));
    expect(doc.querySelector<HTMLButtonElement>(".arrival-enter")?.disabled).toBe(true);
    finish?.();
    await vi.advanceTimersByTimeAsync(0);
    expect(doc.querySelector<HTMLButtonElement>(".arrival-enter")?.disabled).toBe(false);
  });
  it("enables graceful fallback after exactly 25 seconds", async () => {
    await mount(new Promise(() => {}));
    await vi.advanceTimersByTimeAsync(24999);
    expect(doc.querySelector<HTMLButtonElement>(".arrival-enter")?.disabled).toBe(true);
    await vi.advanceTimersByTimeAsync(1);
    expect(doc.querySelector<HTMLButtonElement>(".arrival-enter")?.disabled).toBe(false);
    enter();
    expect(play).toHaveBeenCalledTimes(1);
  });
  it("calls welcome play synchronously from the Enter gesture", async () => {
    await mount();
    enter();
    expect(play).toHaveBeenCalledTimes(1);
  });
  it("retains the arrival overlay through the 2.2-second dissolve", async () => {
    await mount(); enter();
    await vi.advanceTimersByTimeAsync(2200);
    expect(doc.querySelector(".cosmic-arrival")).not.toBeNull();
    await vi.advanceTimersByTimeAsync(100);
    expect(doc.querySelector(".cosmic-arrival")).toBeNull();
  });
  it("waits exactly 2.5 seconds after natural end before the gentle boutique visit", async () => {
    await mount(); enter(); endWelcome();
    await vi.advanceTimersByTimeAsync(2499);
    expect(navigate).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(navigate).toHaveBeenCalledWith("./boutique.html", { gentle: true });
  });
  it.each(["pointerdown", "keydown", "pagehide"])("%s cancels the initial automatic tour and subsequent replay tour", async (event) => {
    await mount(); enter();
    win.dispatchEvent(new Event(event));
    endWelcome();
    await vi.advanceTimersByTimeAsync(4000);
    endWelcome();
    await vi.advanceTimersByTimeAsync(4000);
    expect(navigate).not.toHaveBeenCalled();
  });
  it("hiding the tab cancels the automatic tour", async () => {
    await mount(); enter();
    Object.defineProperty(doc, "hidden", { configurable: true, value: true });
    doc.dispatchEvent(new Event("visibilitychange"));
    endWelcome();
    await vi.advanceTimersByTimeAsync(4000);
    expect(navigate).not.toHaveBeenCalled();
  });
});