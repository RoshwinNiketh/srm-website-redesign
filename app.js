import { initDepthStage } from "./depth.js";

const schools = {
  engineering: {
    name: "Engineering & Technology",
    short: "Engineering & Technology",
    block: "SRM Tech Park",
    tagline: "Make what's next.",
    description: "From the first line of code to the next breakthrough. Explore a world of engineering, technology and hands-on discovery.",
    image: "assets/images/engineering.webp",
    fee: "₹4,50,000",
    degrees: [
      ["Computer Science & Engineering", "B.Tech · Undergraduate"],
      ["Mechanical Engineering", "B.Tech · Undergraduate"],
      ["Electronics & Communication", "B.Tech · Undergraduate"],
      ["Advanced Engineering", "M.Tech · Postgraduate"],
    ],
  },
  medical: {
    name: "Medical & Health Sciences",
    short: "Medical & Health Sciences",
    block: "Illustrative location",
    tagline: "A future in caring.",
    description: "Bring curiosity and compassion together. Discover pathways in medicine and the health sciences, from understanding the human body to caring for a community.",
    image: "assets/images/medical.webp",
    fee: "₹3,00,000",
    degrees: [
      ["Medicine & Surgery", "MBBS · Undergraduate"],
      ["Dental Surgery", "BDS · Undergraduate"],
      ["Nursing", "B.Sc · Undergraduate"],
      ["Physiotherapy", "BPT · Undergraduate"],
    ],
  },
  arts: {
    name: "Science & Humanities",
    short: "Science & Humanities",
    block: "Illustrative location",
    tagline: "See things differently.",
    description: "Ask a bigger question. Find a new perspective. Explore the sciences, creative disciplines and humanities in a community of curious thinkers.",
    image: "assets/images/campus-life.webp",
    fee: "₹1,50,000",
    degrees: [
      ["Visual Communication", "B.Sc · Undergraduate"],
      ["Psychology", "B.Sc · Undergraduate"],
      ["English", "B.A · Undergraduate"],
      ["Biotechnology", "B.Sc · Undergraduate"],
    ],
  },
  management: {
    name: "Management",
    short: "Management",
    block: "SRM MBA Block",
    tagline: "Lead with possibility.",
    description: "Turn an idea into an opportunity. Explore business, entrepreneurship and the skills to bring people together around a shared ambition.",
    image: "assets/images/engineering.webp",
    fee: "₹2,50,000",
    degrees: [
      ["Business Administration", "BBA · Undergraduate"],
      ["Business Administration", "MBA · Postgraduate"],
      ["Commerce", "B.Com · Undergraduate"],
      ["Management Research", "Ph.D · Research"],
    ],
  },
  law: {
    name: "Law",
    short: "Law",
    block: "Illustrative location",
    tagline: "Stand for something.",
    description: "Understand the systems that shape society. Explore legal thinking, advocacy and the pursuit of justice through an interdisciplinary education.",
    image: "assets/images/archgate.webp",
    fee: "₹2,00,000",
    degrees: [
      ["Arts & Law", "B.A. LL.B. (Hons.) · Integrated"],
      ["Business & Law", "B.Com. LL.B. (Hons.) · Integrated"],
      ["Law", "LL.B. · Undergraduate"],
      ["Advanced Legal Studies", "LL.M. · Postgraduate"],
    ],
  },
};
const FLOORS = ["Programmes", "Fees", "Labs", "Faculty", "Placements", "Apply"];

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (selector) => document.querySelector(selector);
const pointer = { x: 0, y: 0 };
addEventListener("pointermove", (e) => {
  pointer.x = (e.clientX / innerWidth) * 2 - 1;
  pointer.y = (e.clientY / innerHeight) * 2 - 1;
});

let toastTimer;
function notify(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 4000);
}

/* ---------- depth photos ---------- */
if (!reduced)
  document.querySelectorAll(".depth-stage").forEach((stage) => {
    const start = () => initDepthStage(stage, pointer).catch(() => {});
    new IntersectionObserver(
      ([entry], observer) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          start();
        }
      },
      { rootMargin: "60%" },
    ).observe(stage);
  });

/* ---------- walk through the gate on scroll ---------- */
const gateway = $("#gateway");
const front = $(".gate-front");
const back = $(".gate-back");
const gateCopy = $(".gate-copy");
const gateFade = $(".gate-fade");
function updateGate() {
  const box = gateway.getBoundingClientRect();
  const span = box.height - innerHeight;
  if (span <= 0) return;
  const p = Math.max(0, Math.min(1, -box.top / span));
  const k = p * p;
  front.style.transform = `scale(${1 + k * 7.5})`;
  back.style.transform = `scale(${1 + k * 2.9})`;
  front.style.opacity = String(p > 0.86 ? Math.max(0, 1 - (p - 0.86) / 0.1) : 1);
  gateCopy.style.opacity = String(Math.max(0, 1 - p * 3));
  gateCopy.style.transform = `translateY(${-p * 80}px)`;
  gateFade.style.opacity = String(p > 0.78 ? (p - 0.78) / 0.22 : 0);
}
let scrollQueued = false;
if (!reduced) {
  addEventListener(
    "scroll",
    () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        updateGate();
        scrollQueued = false;
      });
    },
    { passive: true },
  );
  updateGate();
}

/* ---------- 3D campus ---------- */
const panel = $("#building-panel");
const stage = $(".campus-stage");
const flightBar = $("#flight-bar");
let campus = null;
let campusLoading = null;
let activeKey = null;
let lastTrigger = null;

function loadCampus() {
  if (campusLoading) return campusLoading;
  const test = document.createElement("canvas");
  if (!test.getContext("webgl2") && !test.getContext("webgl")) {
    document.documentElement.classList.add("no-webgl");
    return (campusLoading = Promise.resolve(null));
  }
  campusLoading = import("./campus3d.js")
    .then(({ createCampus }) =>
      createCampus({
        canvas: $("#campus-canvas"),
        labels: $("#campus-labels"),
        schools,
        floors: FLOORS,
        reduced,
        onArrive: () => openPanel(),
      }),
    )
    .catch(() => {
      document.documentElement.classList.add("no-webgl");
      return null;
    });
  return campusLoading.then((c) => (campus = c));
}
new IntersectionObserver(
  ([entry], observer) => {
    if (entry.isIntersecting) {
      observer.disconnect();
      loadCampus();
    }
  },
  { rootMargin: "120%" },
).observe(stage);

function floorContent(index) {
  const school = schools[activeKey];
  const body = $("#floor-body");
  const rows = (items) => items.map(([a, b]) => `<div class="floor-row"><span>${a}<small>${b}</small></span><span aria-hidden="true">→</span></div>`).join("");
  const sample = '<span class="sample">Sample data</span>';
  const views = [
    `<p>${school.description}</p>${rows(school.degrees)}`,
    `<p>Estimated first-year tuition</p><p class="big-figure">${school.fee}</p>${sample}${rows([["Hostel and dining", "Add to your estimate"], ["Scholarships", "Check what you may qualify for"]])}`,
    `<p>Labs and facilities for ${school.name} will be listed here with photos.</p>${rows([["Central research facilities", "To be confirmed"], ["Teaching labs", "To be confirmed"]])}`,
    `<p>Find the people behind the programmes.</p>${rows([["Faculty directory", "To be connected"], ["Research areas", "To be connected"]])}`,
    `<p>Students placed</p><p class="big-figure">To verify</p>${sample}${rows([["Recruiters", "To be confirmed"], ["Median package", "To be confirmed"]])}`,
    `<p class="big-figure">Your place on campus.</p><p>Apply only through official SRM channels. This concept takes no applications.</p>${rows([["SRMJEEE 2027", "Dates to be confirmed"], ["Talk to admissions", "+91 70 2645 2645"]])}`,
  ];
  body.innerHTML = views[index];
  $("#floor-tabs")
    .querySelectorAll("button")
    .forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
  campus?.setFloor(index);
}

function openPanel() {
  const school = schools[activeKey];
  flightBar.hidden = true;
  $("#panel-block").textContent = school.block;
  $("#panel-title").textContent = school.name;
  $("#panel-tagline").textContent = school.tagline;
  $("#floor-tabs").replaceChildren(
    ...FLOORS.map((name, i) => {
      const tab = document.createElement("button");
      tab.role = "tab";
      tab.textContent = name;
      tab.addEventListener("click", () => floorContent(i));
      tab.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const next = (i + (e.key === "ArrowRight" ? 1 : FLOORS.length - 1)) % FLOORS.length;
        floorContent(next);
        $("#floor-tabs").children[next].focus();
      });
      return tab;
    }),
  );
  floorContent(0);
  panel.hidden = false;
  panel.focus({ preventScroll: true });
}

async function visitSchool(key, trigger) {
  if (!schools[key]) return;
  lastTrigger = trigger;
  activeKey = key;
  stage.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  panel.hidden = true;
  stage.classList.add("visiting");
  await loadCampus();
  if (!campus) {
    openPanel();
    return;
  }
  $("#flight-text").textContent = `Flying to ${schools[key].name}`;
  flightBar.hidden = reduced;
  campus.visit(key);
}

function closeVisit() {
  panel.hidden = true;
  flightBar.hidden = true;
  stage.classList.remove("visiting");
  activeKey = null;
  campus?.leave();
  lastTrigger?.focus({ preventScroll: true });
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-school]");
  if (button) visitSchool(button.dataset.school, button);
});
$("#panel-close").addEventListener("click", closeVisit);
$("#flight-skip").addEventListener("click", () => campus?.skip());
$("#zoom-in").addEventListener("click", () => campus?.zoom(0.82));
$("#zoom-out").addEventListener("click", () => campus?.zoom(1.2));
$("#view-reset").addEventListener("click", () => campus?.reset());

/* ---------- school previews and 3D tilt ---------- */
document.querySelectorAll("[data-preview]").forEach((button) => {
  button.setAttribute("aria-pressed", String(button.classList.contains("selected")));
  button.addEventListener("click", () => {
    const key = button.dataset.preview;
    const school = schools[key];
    document.querySelectorAll("[data-preview]").forEach((row) => {
      row.classList.toggle("selected", row === button);
      row.setAttribute("aria-pressed", String(row === button));
    });
    $("#school-image").src = school.image;
    $("#school-image").alt = `Architectural concept for ${school.name}`;
    $("#school-preview-title").textContent = school.tagline;
    $("#school-preview-description").textContent = school.description;
    $("#preview-explore").dataset.school = key;
  });
});
if (!reduced && matchMedia("(hover:hover)").matches) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const box = card.getBoundingClientRect();
      card.style.setProperty("--ry", `${((e.clientX - box.left) / box.width - 0.5) * 12}deg`);
      card.style.setProperty("--rx", `${-((e.clientY - box.top) / box.height - 0.5) * 10}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
    });
  });
  addEventListener("pointermove", () => {
    document.querySelectorAll(".lift-title").forEach((title) => {
      title.style.setProperty("--ty", `${pointer.x * 7}deg`);
      title.style.setProperty("--tx", `${-pointer.y * 5}deg`);
    });
  });
}

/* ---------- menu, keyboard, sound, reveals ---------- */
const menuButton = $(".menu-button");
const mobileMenu = $("#mobile-menu");
function setMenu(open) {
  mobileMenu.hidden = !open;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
}
menuButton.addEventListener("click", () => setMenu(mobileMenu.hidden));
mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!mobileMenu.hidden) {
    setMenu(false);
    menuButton.focus();
  } else if (activeKey) closeVisit();
});

// Synthesized breeze keeps ambience optional and avoids an audio download.
let audioContext;
let breezeGain;
const soundButton = $(".sound-button");
soundButton.addEventListener("click", async () => {
  const isPlaying = soundButton.getAttribute("aria-pressed") === "true";
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 5, audioContext.sampleRate);
      const samples = buffer.getChannelData(0);
      let previous = 0;
      for (let i = 0; i < samples.length; i++) {
        previous = (previous + (Math.random() * 2 - 1) * 0.02) / 1.02;
        samples[i] = previous * 3.5;
      }
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      breezeGain = audioContext.createGain();
      breezeGain.gain.value = 0;
      source.connect(breezeGain).connect(audioContext.destination);
      source.start();
    }
    await audioContext.resume();
    breezeGain.gain.setTargetAtTime(isPlaying ? 0 : 0.28, audioContext.currentTime, 0.4);
    soundButton.setAttribute("aria-pressed", String(!isPlaying));
    soundButton.setAttribute("aria-label", `Turn campus ambience ${isPlaying ? "on" : "off"}`);
    soundButton.querySelector("span").textContent = isPlaying ? "Sound off" : "Sound on";
  } catch {
    notify("Campus ambience is unavailable in this browser.");
  }
});

if ("IntersectionObserver" in window && !reduced) {
  const reveal = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("shown");
          reveal.unobserve(entry.target);
        }
      }),
    { threshold: 0.12 },
  );
  document.querySelectorAll(".section-heading h2,.section-heading p,.school-row,.tilt-card,.life-copy,.closing h2").forEach((element, i) => {
    element.classList.add("reveal");
    element.style.transitionDelay = `${(i % 4) * 60}ms`;
    reveal.observe(element);
  });
}
