import { introArtwork } from "./landing-art.js";

const sessionKey = "srm-landing-intro-v1";
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const duration = 6900;

function hasPlayed() {
  try {
    return sessionStorage.getItem(sessionKey) === "played";
  } catch {
    return true; // If the preference can't be saved, avoid replaying each visit.
  }
}

function playIntro() {
  if (motion.matches || hasPlayed() || location.hash || !Element.prototype.animate) return;
  const logo = document.querySelector(".site-header .brand");
  const title = document.querySelector("#landing-title");
  if (!logo || !title) return;

  const root = document.createElement("div");
  root.className = "landing-intro";
  root.innerHTML = `<div class="intro-paper" aria-hidden="true">
    ${introArtwork(matchMedia("(max-width: 760px)").matches)}
    <div class="intro-caption"><span class="intro-credit">The SRM journey</span>
      <span>Through the arch</span><span>Ideas take shape</span>
      <span>Ready for what’s next</span><span>Into the world</span>
    </div>
  </div>
  <button type="button" class="intro-skip">Skip intro <span aria-hidden="true">↗</span></button>`;
  const get = (selector) => root.querySelector(selector);
  const skip = get(".intro-skip");
  const paper = get(".intro-paper");
  const svg = get(".intro-art");
  const flyingLogo = document.createElement("div");
  flyingLogo.className = "brand intro-brand";
  flyingLogo.setAttribute("aria-hidden", "true");
  flyingLogo.append(...Array.from(logo.children, (child) => child.cloneNode(true)));
  root.append(flyingLogo);

  const animations = [];
  const timeline = document.timeline;
  let epoch;
  let frame;
  let handoff;
  let watchdog;
  let target;
  let start;
  let stop = false;
  const listeners = new AbortController();
  const covered = [...document.body.children].filter((element) =>
    element.matches("header, nav, main, footer") && !element.inert);
  const resizeObserver = new ResizeObserver(measure);

  function finish(moveFocus = true) {
    if (stop) return;
    stop = true;
    const hadFocus = document.activeElement === skip;
    listeners.abort();
    resizeObserver.disconnect();
    cancelAnimationFrame(frame);
    clearTimeout(handoff);
    clearTimeout(watchdog);
    for (const animation of animations) animation.cancel();
    root.remove();
    document.body.classList.remove("landing-intro-active");
    for (const element of covered) element.inert = false;
    if (moveFocus && hadFocus) title.focus({ preventScroll: true });
  }

  function measure() {
    const portrait = innerWidth <= 760 && innerWidth < innerHeight;
    svg.setAttribute("viewBox", portrait ? "322 0 556 720" : "0 0 1200 720");
    target = logo.getBoundingClientRect();
    const matrix = svg.getScreenCTM();
    const center = matrix ? new DOMPoint(600, 322).matrixTransform(matrix) :
      { x: innerWidth / 2, y: innerHeight / 2 };
    start = {
      x: center.x,
      y: center.y,
      scale: Math.min(1.65, innerWidth * .73 / target.width),
    };
    positionLogo(Math.max(0, timeline.currentTime - epoch));
  }

  // Every track shares the same document-timeline origin. Transforms and
  // opacity run as keyframes; only the live logo handoff needs script per frame.
  function track(element, frames, delay, length, easing = "linear") {
    const animation = element.animate(frames, { delay, duration: length, fill: "both", easing });
    animation.startTime = epoch;
    animations.push(animation);
    return animation;
  }
  const transform = (value, opacity) => ({ transform: value, ...(opacity == null ? {} : { opacity }) });
  const easeOut = "cubic-bezier(.16,.78,.23,1)";

  function reveal(element, enter, exit, { fade = 200, peak = 1, shift = 0 } = {}) {
    const length = exit + fade - enter;
    track(element, [
      { ...transform(`translateY(${shift}px)`, 0), offset: 0, easing: easeOut },
      { ...transform("translateY(0)", peak), offset: fade / length },
      { ...transform("translateY(0)", peak), offset: (exit - enter) / length },
      { ...transform(`translateY(${-shift * .35}px)`, 0), offset: 1 },
    ], enter, length);
  }

  function positionLogo(t) {
    const p = Math.min(1, Math.max(0, (t - 6300) / (duration - 6300)));
    const ease = p * p * (3 - 2 * p);
    const finalX = target.left + target.width / 2;
    const finalY = target.top + target.height / 2;
    const x = start.x + (finalX - start.x) * ease;
    const y = start.y + (finalY - start.y) * ease - Math.sin(p * Math.PI) * 24;
    const scale = start.scale + (1 - start.scale) * ease;
    flyingLogo.style.transform =
      `translate3d(${x - target.width * scale / 2}px, ${y - target.height * scale / 2}px, 0) scale(${scale})`;
  }

  function fly(now) {
    if (stop) return;
    const t = now - epoch;
    positionLogo(t);
    if (t >= duration) finish();
    else frame = requestAnimationFrame(fly);
  }

  try {
    document.body.prepend(root);
    document.body.classList.add("landing-intro-active");
    for (const element of covered) element.inert = true;
    sessionStorage.setItem(sessionKey, "played");
    epoch = timeline.currentTime;
    measure();

    track(get(".camera"), [
      { transform: "translateY(9px) scale(1.24)", offset: 0 },
      { transform: "translateY(0) scale(1.18)", offset: .16, easing: "ease-in-out" },
      { transform: "translateY(7px) scale(1.13)", offset: .38 },
      { transform: "translateY(-4px) scale(1.18)", offset: .55, easing: easeOut },
      { transform: "translateY(12px) scale(.96)", offset: .77 },
      { transform: "translateY(12px) scale(.955)", offset: .85, easing: "ease-in" },
      { transform: "translateY(24px) scale(1.09)", offset: 1 },
    ], 0, 6100);

    track(get("#intro-student"), [
      { ...transform("translate(0, 19px) rotate(-1.4deg)", 0), offset: 0, easing: easeOut },
      { ...transform("translate(0, 0)", 1), offset: .10 },
      { transform: "translate(0, 0)", offset: .14, easing: "ease-in-out" },
      { transform: "translate(-16px, 33px) rotate(1.8deg)", offset: .23 },
      { transform: "translate(-17px, 31px) rotate(1.2deg)", offset: .37, easing: "ease-in-out" },
      { transform: "translate(5px, -4px) rotate(-.8deg)", offset: .47 },
      { transform: "translate(4px, -4px)", offset: .54, easing: easeOut },
      { transform: "translate(0, 4px)", offset: .66 },
      { transform: "translate(0, 4px)", offset: .74, easing: "ease-out" },
      { transform: "translate(0, -10px) rotate(-2deg)", offset: .8 },
      { ...transform("translate(0, 1px)", 1), offset: .943 },
      { ...transform("translate(0, 14px)", 0), offset: 1 },
    ], 0, 5830);
    get("#intro-student").classList.add("moving-part");
    track(get(".draw-line"), [
      { strokeDashoffset: 1, opacity: 1 },
      { strokeDashoffset: 0, opacity: .9, offset: .64 },
      { strokeDashoffset: 0, opacity: 0 },
    ], 0, 1020, easeOut);

    const chapters = [
      ["arrival", 0, 930], ["learning", 890, 2300],
      ["career", 2280, 3320], ["graduate", 3300, 5290],
    ];
    chapters.forEach(([chapter, enter, exit], i) => {
      reveal(get(`[data-setting="${chapter}"]`), enter, exit, { fade: 250, peak: i > 1 ? .67 : 1, shift: 9 });
      reveal(get(`[data-pose="${chapter}"]`), enter, i === 3 ? 5800 : exit, { fade: 180 });
      reveal(get(`.intro-caption span:nth-child(${i + 2})`), enter + 140, i === 3 ? 4880 : exit - 75, { fade: 155, shift: 8 });
    });
    reveal(get(".intro-credit"), 180, 4880, { fade: 190 });
    reveal(get("[data-desk]"), 1000, 2260, { fade: 230, shift: 20 });
    track(get("[data-throw-arm]"), [
      { transform: "translate(29px, 50px) rotate(-29deg)", opacity: 0 },
      { transform: "translate(0, 0) rotate(-1deg)", opacity: 1, offset: .67 },
      { transform: "translate(-4px, -2px) rotate(2deg)", opacity: 1 },
    ], 4380, 480, easeOut);
    get("[data-throw-arm]").classList.add("moving-part");
    // Keep the SVG placement transform on the worn cap; animate its opacity only.
    track(get("[data-worn-cap]"), [
      { opacity: 0 }, { opacity: 1, offset: .17 }, { opacity: 1, offset: .984 }, { opacity: 0 },
    ], 3350, 1370);

    root.querySelectorAll("[data-crowd]").forEach((band, i) => {
      reveal(band, 3370 + i * 93, 5440 + i * 22, {
        fade: 280, peak: Number(band.getAttribute("opacity")), shift: 17 + i * 3,
      });
    });

    root.querySelectorAll("[data-cheer]").forEach((arm) => {
      const direction = Number(arm.dataset.armSide);
      track(arm, [
        transform(`translateY(6px) rotate(${direction * -38}deg)`),
        { ...transform(`translateY(-2px) rotate(${direction * 5}deg)`), offset: .62 },
        transform("translateY(0) rotate(0deg)"),
      ], Number(arm.dataset.cheer), 470, easeOut);
    });
    root.querySelectorAll("[data-crowd-toss]").forEach((cap, i) => {
      const direction = i % 2 ? 1 : -1;
      const rise = 104 + i % 6 * 13;
      track(cap, [
        transform("translate(0, 0) rotate(0deg)", 1),
        { ...transform(`translate(${26 * direction}px, ${-rise}px) rotate(${105 * direction}deg)`, 1), offset: .64 },
        transform(`translate(${43 * direction}px, ${-rise + 18}px) rotate(${168 * direction}deg)`, 0),
      ], Number(cap.dataset.crowdToss), 980, easeOut);
    });
    root.querySelectorAll("[data-air-cap]").forEach((cap) => {
      const [x, y, spin, delay] = cap.dataset.airCap.split(",").map(Number);
      track(cap, [
        { ...transform("translate(0, 0) rotate(-20deg)", 0), offset: 0, easing: easeOut },
        { ...transform(`translate(${x * .20}px, ${-y * .41}px) rotate(${spin * .14}deg)`, .92), offset: .19 },
        { ...transform(`translate(${x * .66}px, ${-y}px) rotate(${spin * .75}deg)`, .96), offset: .66 },
        { ...transform(`translate(${x}px, ${-y * .90}px) rotate(${spin}deg)`, 0), offset: 1 },
      ], delay, 5990 - delay);
    });

    track(get("[data-hero-cap]"), [
      { ...transform("translate(1px, 13px) scale(.63) rotate(-10deg)", 0), offset: 0, easing: "ease-out" },
      { ...transform("translate(-22px, -52px) scale(.96) rotate(35deg)", 1), offset: .19, easing: easeOut },
      { transform: "translate(-10px, -89px) scale(1.46) rotate(54deg)", offset: .37 },
      { transform: "translate(-8px, -86px) scale(1.51) rotate(60deg)", offset: .59, easing: "cubic-bezier(.71,.02,.86,.75)" },
      { ...transform("translate(-6px, 100px) scale(2.65) rotate(565deg)", 1), offset: .88 },
      { ...transform("translate(-6px, 100px) scale(2.86) rotate(680deg)", 0), offset: 1 },
    ], 4690, 1300);
    track(get("[data-cap-swish]"), [
      { opacity: 0 }, { opacity: .62, offset: .46 }, { opacity: 0 },
    ], 5510, 600);
    track(get("[data-cap-glow]"), [
      transform("scale(.15)", 0),
      { ...transform("scale(.65)", .88), offset: .35 },
      transform("scale(1.13)", 0),
    ], 5690, 580, "ease-out");
    track(flyingLogo, [{ opacity: 0 }, { opacity: 1 }], 5820, 480, easeOut);
    track(paper, [{ opacity: 1 }, { opacity: 0 }], 6280, 590, "ease-in-out");
    track(skip, [{ opacity: 1 }, { opacity: 0 }], 6330, 240);

    const options = { signal: listeners.signal };
    skip.addEventListener("click", () => finish(), options);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") finish();
    }, options);
    window.addEventListener("pagehide", () => finish(false), options);
    window.addEventListener("resize", measure, options);
    motion.addEventListener("change", (event) => { if (event.matches) finish(); }, options);
    resizeObserver.observe(logo);
    handoff = setTimeout(() => {
      frame = requestAnimationFrame(fly);
    }, Math.max(0, 6250 - (timeline.currentTime - epoch)));
    // Fail open even if the tab is hidden or the animation clock is interrupted.
    watchdog = setTimeout(finish, duration + 400);
  } catch (error) {
    finish(false);
    console.warn("Landing intro was skipped:", error);
  }
}

playIntro();
