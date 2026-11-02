import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("Approved reading motion rules", () => {
  afterEach(() => { vi.restoreAllMocks(); document.body.replaceChildren(); sessionStorage.clear(); });
  function mount(reduced = false) {
    document.body.innerHTML = '<header class="site-header"></header>';
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    const load = vi.fn().mockResolvedValue("blob:approved-journey");
    new Function("window", "document", "sessionStorage", "matchMedia", readFileSync("public/assets/celestial-reading.js", "utf8"))(
      { academyMedia: { load }, addEventListener: vi.fn() }, document, sessionStorage,
      () => ({ matches: reduced, addEventListener: vi.fn() }),
    );
    const button = document.querySelector<HTMLButtonElement>(".reading-motion button");
    if (!button) throw new Error("Reading motion control missing");
    return { play, pause, load, button };
  }
  it("creates one muted looping journey video per reading document", async () => {
    const { play, load } = mount();
    await Promise.resolve();
    const videos = document.querySelectorAll("video");
    expect(videos).toHaveLength(1);
    expect(videos[0]?.muted).toBe(true);
    expect(videos[0]?.loop).toBe(true);
    expect(load).toHaveBeenCalledWith("journey");
    expect(play).toHaveBeenCalledTimes(1);
  });
  it("persists Pause across reading documents and permits explicit resume", async () => {
    const first = mount();
    await Promise.resolve(); first.button.click();
    expect(sessionStorage.getItem("academy-reading-paused")).toBe("yes");
    const next = mount();
    expect(next.load).not.toHaveBeenCalled();
    next.button.click(); await Promise.resolve();
    expect(sessionStorage.getItem("academy-reading-paused")).toBe("no");
    expect(next.load).toHaveBeenCalledWith("journey");
  });
  it("uses a still without loading or playing video for reduced motion", () => {
    const { play, pause, load, button } = mount(true);
    expect(button.disabled).toBe(true);
    expect(load).not.toHaveBeenCalled();
    expect(play).not.toHaveBeenCalled();
    expect(pause).toHaveBeenCalled();
    expect(document.querySelector("video")?.getAttribute("src")).toBeNull();
  });
});