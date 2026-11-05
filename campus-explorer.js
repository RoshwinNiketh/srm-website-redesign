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
