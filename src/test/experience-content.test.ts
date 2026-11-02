import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("Approved experience rules", () => {
  beforeEach(() => { vi.useFakeTimers(); sessionStorage.clear(); });
  afterEach(() => { vi.useRealTimers(); document.body.replaceChildren(); sessionStorage.clear(); });

  function catMount(reduced = false) {
    document.body.innerHTML = '<div id="stage"></div>';
    document.documentElement.classList.add("arrival-pending");
    new Function("window", "document", "sessionStorage", "matchMedia", readFileSync("public/assets/cat.js", "utf8"))(
      window, document, sessionStorage, () => ({ matches: reduced }),
    );
    const cat = document.querySelector<HTMLImageElement>(".sanctuary-cat");
    if (!cat) throw new Error("Cat missing");
    return cat;
  }
  it("waits for room reveal and keeps the full five-second walk", () => {
    const cat = catMount();
    window.dispatchEvent(new Event("academy-entered"));
    expect(cat.hidden).toBe(true);
    window.dispatchEvent(new Event("academy-room-revealed"));
    cat.dispatchEvent(new Event("load"));
    expect(cat.hidden).toBe(false);
    vi.advanceTimersByTime(4999);
    expect(cat.src).toContain("ringo-walk-sit-v2-once.webp");
    vi.advanceTimersByTime(1);
    expect(cat.src).toContain("ringo-seated-v2.png");
    expect(sessionStorage.getItem("voidwalker-cat-arrived-v2")).toBe("yes");
  });
  it("uses the seated cat without animation for reduced motion", () => {
    const cat = catMount(true);
    window.dispatchEvent(new Event("academy-room-revealed"));
    expect(cat.src).toContain("ringo-seated-v2.png");
    expect(cat.hidden).toBe(false);
  });
  it("restart prevents the old cat timer from restoring visit state", () => {
    const cat = catMount();
    window.dispatchEvent(new Event("academy-room-revealed"));
    cat.dispatchEvent(new Event("load"));
    window.dispatchEvent(new Event("academy-restart"));
    vi.advanceTimersByTime(5000);
    expect(sessionStorage.getItem("voidwalker-cat-arrived-v2")).toBeNull();
  });
  it("practice completion remains inline and stores no answers", () => {
    document.body.innerHTML = '<button id="complete-practice" aria-expanded="false" hidden></button><div id="practice-completion" hidden></div>';
    const localSpy = vi.spyOn(Storage.prototype, "setItem");
    new Function("document", readFileSync("public/assets/start-here.js", "utf8"))(document);
    const button = document.querySelector<HTMLButtonElement>("button");
    if (!button) throw new Error("Completion control missing");
    button.click(); button.click();
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(document.querySelector<HTMLDivElement>("#practice-completion")?.hidden).toBe(false);
    expect(localSpy).not.toHaveBeenCalled();
    localSpy.mockRestore();
  });
  it("exposes exactly interior pages 3–5 with bounded previous and next navigation", () => {
    document.body.innerHTML = '<a href="#preview">Open</a><dialog id="book-preview"><img id="preview-page-image"><div id="preview-transcript"></div><div id="preview-viewport"></div><span id="preview-count"></span><span id="preview-caption"></span><button id="preview-previous"></button><button id="preview-next"></button><button id="preview-text"></button><button id="preview-zoom"></button><button id="preview-close"></button></dialog>';
    const dialog = document.querySelector<HTMLDialogElement>("dialog");
    if (!dialog) throw new Error("Reader missing");
    dialog.showModal = () => { dialog.open = true; };
    dialog.close = () => { dialog.open = false; };
    new Function("document", "window", "history", "location", readFileSync("public/assets/book-preview.js", "utf8"))(
      document, window, history, location,
    );
    document.querySelector<HTMLAnchorElement>("a")?.click();
    const next = document.querySelector<HTMLButtonElement>("#preview-next");
    const previous = document.querySelector<HTMLButtonElement>("#preview-previous");
    if (!next || !previous) throw new Error("Reader navigation missing");
    expect(previous.disabled).toBe(true);
    expect(document.querySelector("#preview-count")?.textContent).toBe("1 of 3 · Book page 3");
    next.click();
    expect(document.querySelector("#preview-count")?.textContent).toBe("2 of 3 · Book page 4");
    next.click(); next.click();
    expect(next.disabled).toBe(true);
    expect(document.querySelector("#preview-count")?.textContent).toBe("3 of 3 · Book page 5");
    previous.click();
    expect(document.querySelector("#preview-count")?.textContent).toBe("2 of 3 · Book page 4");
    history.replaceState(null, "", "/");
  });
});