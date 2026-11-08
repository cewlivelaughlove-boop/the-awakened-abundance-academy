/* Only /join.html uses this controller. Existing room playback is untouched. */
(() => {
  const video = document.getElementById("event-universe");
  const control = document.getElementById("event-motion");
  if (!video || !control) return;
  const label = control.querySelector("[data-motion-label]");
  const icon = control.querySelector("[aria-hidden]");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let pausedByChoice = reduced.matches;
  let loading = null;
  let ready = false;
  video.muted = true;
  video.defaultMuted = true;
  function update(playing) {
    control.hidden = false;
    control.disabled = false;
    control.setAttribute(
      "aria-label",
      playing ? "Pause background motion" : "Play background motion",
    );
    label.textContent = playing ? "Pause motion" : "Play background";
    icon.textContent = playing ? "Ⅱ" : "▷";
    video.dataset.motion = playing ? "playing" : "paused";
  }
  async function prepare() {
    if (ready) return;
    if (!loading) {
      video.dataset.motion = "loading";
      loading = window.academyMedia
        .load("journey")
        .then((url) => {
          video.src = url;
          video.load();
          ready = true;
        })
        .catch((error) => {
          loading = null;
          throw error;
        });
    }
    await loading;
  }
  async function play() {
    try {
      await prepare();
      if (pausedByChoice || document.hidden) return;
      video.muted = true;
      await video.play();
      update(true);
    } catch {
      // Some phones require a tap to begin motion. Signup never depends on it.
      update(false);
    }
  }
  control.addEventListener("click", () => {
    if (!video.paused) {
      pausedByChoice = true;
      video.pause();
      update(false);
    } else {
      pausedByChoice = false;
      // When already loaded this calls play synchronously within the gesture.
      if (ready)
        video
          .play()
          .then(() => update(true))
          .catch(() => update(false));
      else play();
    }
  });
  video.addEventListener("playing", () => update(true));
  video.addEventListener("error", () => update(false));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) video.pause();
    else if (!pausedByChoice) play();
  });
  reduced.addEventListener("change", (event) => {
    if (event.matches) {
      pausedByChoice = true;
      video.pause();
      update(false);
    }
  });
  if (pausedByChoice) {
    video.autoplay = false;
    update(false);
  } else play();
})();
