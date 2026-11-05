const schools = {
  engineering: {
    name: "Engineering & Technology",
    short: "Engineering & Technology",
    block: "SRM Tech Park",
    tagline: "Make what's next.",
    description: "From the first line of code to the next breakthrough. Explore a world of engineering, technology and hands-on discovery.",
    image: "assets/images/engineering.webp",
  },
  medical: {
    name: "Medical & Health Sciences",
    short: "Medical & Health Sciences",
    block: "Illustrative location",
    tagline: "A future in caring.",
    description: "Bring curiosity and compassion together. Discover pathways in medicine and the health sciences, from understanding the human body to caring for a community.",
    image: "assets/images/medical.webp",
  },
  arts: {
    name: "Science & Humanities",
    short: "Science & Humanities",
    block: "Illustrative location",
    tagline: "See things differently.",
    description: "Ask a bigger question. Find a new perspective. Explore the sciences, creative disciplines and humanities in a community of curious thinkers.",
    image: "assets/images/campus-life.webp",
  },
  management: {
    name: "Management",
    short: "Management",
    block: "SRM MBA Block",
    tagline: "Lead with possibility.",
    description: "Turn an idea into an opportunity. Explore business, entrepreneurship and the skills to bring people together around a shared ambition.",
    image: "assets/images/engineering.webp",
  },
  law: {
    name: "Law",
    short: "Law",
    block: "Illustrative location",
    tagline: "Stand for something.",
    description: "Understand the systems that shape society. Explore legal thinking, advocacy and the pursuit of justice through an interdisciplinary education.",
    image: "assets/images/archgate.webp",
  },
};
const FLOORS = ["Programmes", "Fees", "Labs", "Faculty", "Placements", "Apply"];

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.a11yMotion === "off";
const $ = (selector) => document.querySelector(selector);
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
    .then((scene) => (campus = scene))
    .catch(() => {
      document.documentElement.classList.add("no-webgl");
      return null;
    });
  return campusLoading;
}
new IntersectionObserver(
  ([entry], observer) => {
    if (entry.isIntersecting) {
      observer.disconnect();
      const introBusy = () =>
        document.documentElement.classList.contains("intro-pending") ||
        document.body.classList.contains("landing-intro-active");
      if (!introBusy()) {
        loadCampus();
        return;
      }
      // WebGL setup competes with the SVG intro for the main thread.
      const introObserver = new MutationObserver(() => {
        if (introBusy()) return;
        introObserver.disconnect();
        loadCampus();
      });
      introObserver.observe(document.documentElement, { attributeFilter: ["class"] });
      introObserver.observe(document.body, { attributeFilter: ["class"] });
    }
  },
  { rootMargin: "120%" },
).observe(stage);

function floorContent(index) {
  const school = schools[activeKey];
  const body = $("#floor-body");
  const resource = (label, href) => `<a class="floor-row" href="${href}"><span>${label}</span><span aria-hidden="true">→</span></a>`;
  const views = [
    `<p>${school.description}</p>${resource("Find programmes and campuses", "/programmes")}`,
    `<p>Fees vary by programme, campus and intake. Check the official schedule before applying.</p>${resource("Check fees and scholarships", "/admissions#fees")}`,
    `<p>Find research centres and shared facilities, including access instructions.</p>${resource("Browse research facilities", "/research#projects")}`,
    `<p>Find published staff profiles and academic contacts.</p>${resource("Browse departments and faculty", "/academics#people")}`,
    `<p>Use the Career Centre for campus-specific placement and career information.</p>${resource("Find the Career Centre", "/students#careers")}`,
    `<p>Choose your programme, intake and campus before opening the official application.</p>${resource("Check admissions and deadlines", "/admissions#intakes")}`,
  ];
  body.innerHTML = views[index];
  $("#floor-tabs")
    .querySelectorAll("button")
    .forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      if (i === index) body.setAttribute("aria-labelledby", tab.id);
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
      tab.id = `campus-tab-${i}`;
      tab.setAttribute("aria-controls", "floor-body");
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
  document.dispatchEvent(new CustomEvent("srm:campus-arrive", { detail: { school: activeKey } }));
}

async function visitSchool(key, trigger) {
  if (!schools[key]) return;
  lastTrigger = trigger;
  activeKey = key;
  // Measure the section: the stage is shifted by its entrance animation while scrolling.
  scrollTo({ top: $("#campus").getBoundingClientRect().top + scrollY, behavior: reduced ? "auto" : "smooth" });
  panel.hidden = true;
  stage.classList.add("visiting");
  await loadCampus();
  if (activeKey !== key) return;
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
  document.dispatchEvent(new CustomEvent("srm:campus-leave"));
}

document.addEventListener("srm:campus-visit", ({ detail }) => visitSchool(detail.school, null));

$("#campus").addEventListener("click", (event) => {
  const button = event.target.closest("[data-school]");
  if (button) visitSchool(button.dataset.school, button);
});
$("#panel-close").addEventListener("click", closeVisit);
$("#flight-skip").addEventListener("click", () => campus?.skip());
$("#zoom-in").addEventListener("click", () => campus?.zoom(0.82));
$("#zoom-out").addEventListener("click", () => campus?.zoom(1.2));
$("#view-reset").addEventListener("click", () => campus?.reset());


document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && activeKey) closeVisit();
});
