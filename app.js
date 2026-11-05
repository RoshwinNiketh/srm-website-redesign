const schools = {
  engineering: {
    name: "Engineering & Technology",
    tagline: "Make what's next.",
    description:
      "From the first line of code to the next breakthrough. Explore a world of engineering, technology and hands-on discovery.",
    image: "assets/images/engineering.webp",
    degrees: [
      ["Computer Science & Engineering", "B.Tech · Undergraduate"],
      ["Mechanical Engineering", "B.Tech · Undergraduate"],
      ["Electronics & Communication", "B.Tech · Undergraduate"],
      ["Advanced Engineering", "M.Tech · Postgraduate"],
    ],
  },
  medical: {
    name: "Medical & Health Sciences",
    tagline: "A future in caring.",
    description:
      "Bring curiosity and compassion together. Discover pathways in medicine and the health sciences, from understanding the human body to caring for a community.",
    image: "assets/images/medical.webp",
    degrees: [
      ["Medicine & Surgery", "MBBS · Undergraduate"],
      ["Dental Surgery", "BDS · Undergraduate"],
      ["Nursing", "B.Sc · Undergraduate"],
      ["Physiotherapy", "BPT · Undergraduate"],
    ],
  },
  arts: {
    name: "Science & Humanities",
    tagline: "See things differently.",
    description:
      "Ask a bigger question. Find a new perspective. Explore the sciences, creative disciplines and humanities in a community of curious thinkers.",
    image: "assets/images/campus-life.webp",
    degrees: [
      ["Visual Communication", "B.Sc · Undergraduate"],
      ["Psychology", "B.Sc · Undergraduate"],
      ["English", "B.A · Undergraduate"],
      ["Biotechnology", "B.Sc · Undergraduate"],
    ],
  },
  management: {
    name: "Management",
    tagline: "Lead with possibility.",
    description:
      "Turn an idea into an opportunity. Explore business, entrepreneurship and the skills to bring people together around a shared ambition.",
    image: "assets/images/engineering.webp",
    degrees: [
      ["Business Administration", "BBA · Undergraduate"],
      ["Business Administration", "MBA · Postgraduate"],
      ["Commerce", "B.Com · Undergraduate"],
      ["Management Research", "Ph.D · Research"],
    ],
  },
  law: {
    name: "Law",
    tagline: "Stand for something.",
    description:
      "Understand the systems that shape society. Explore legal thinking, advocacy and the pursuit of justice through an interdisciplinary education.",
    image: "assets/images/archgate.webp",
    degrees: [
      ["Arts & Law", "B.A. LL.B. (Hons.) · Integrated"],
      ["Business & Law", "B.Com. LL.B. (Hons.) · Integrated"],
      ["Law", "LL.B. · Undergraduate"],
      ["Advanced Legal Studies", "LL.M. · Postgraduate"],
    ],
  },
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const dialog = document.querySelector("#school-dialog");
const transition = document.querySelector(".journey-transition");
let isTravelling = false;
let lastDestinationTrigger = null;
let toastTimer;

function notify(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 4500);
}

function populateDestination(key) {
  const school = schools[key];
  document.querySelector("#destination-title").textContent = school.name;
  document.querySelector("#destination-tagline").textContent = school.tagline;
  document.querySelector("#destination-description").textContent =
    school.description;
  const image = document.querySelector("#destination-image");
  image.src = school.image;
  image.alt = `Architectural concept for ${school.name}`;
  document.querySelector("#degree-list").replaceChildren(
    ...school.degrees.map(([name, type]) => {
      const item = document.createElement("div");
      item.className = "degree-item";
      const label = document.createElement("span");
      label.textContent = name;
      const detail = document.createElement("span");
      detail.textContent = type;
      label.append(detail);
      item.append(label);
      return item;
    }),
  );
}

async function visitSchool(key, trigger) {
  if (isTravelling || !schools[key]) return;
  isTravelling = true;
  lastDestinationTrigger = trigger;
  populateDestination(key);
  document.querySelector("#journey-destination").textContent =
    schools[key].name;
  if (!reducedMotion.matches) {
    transition.classList.add("active");
    await new Promise((resolve) => setTimeout(resolve, 850));
  }
  dialog.showModal();
  dialog.scrollTop = 0;
  if (!reducedMotion.matches)
    await new Promise((resolve) => setTimeout(resolve, 550));
  transition.classList.remove("active");
  isTravelling = false;
}

document.querySelectorAll("[data-school]").forEach((button) => {
  button.addEventListener("click", () =>
    visitSchool(button.dataset.school, button),
  );
});
document
  .querySelectorAll(".close-dialog,.return-campus")
  .forEach((button) => button.addEventListener("click", () => dialog.close()));
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const box = dialog.getBoundingClientRect();
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      dialog.close();
  }
});
dialog.addEventListener("close", () =>
  lastDestinationTrigger?.focus({ preventScroll: true }),
);

document.querySelectorAll("[data-preview]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.preview;
    const school = schools[key];
    document.querySelectorAll("[data-preview]").forEach((row) => {
      row.classList.toggle("selected", row === button);
      row.setAttribute("aria-pressed", String(row === button));
    });
    document.querySelector("#school-image").src = school.image;
    document.querySelector("#school-image").alt =
      `Architectural concept for ${school.name}`;
    document.querySelector("#school-preview-title").textContent =
      school.tagline;
    document.querySelector("#school-preview-description").textContent =
      school.description;
    document.querySelector("#preview-explore").dataset.school = key;
  });
  button.setAttribute(
    "aria-pressed",
    String(button.classList.contains("selected")),
  );
});

const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector("#mobile-menu");
menuButton.addEventListener("click", () => {
  mobileMenu.hidden = !mobileMenu.hidden;
  menuButton.setAttribute("aria-expanded", String(!mobileMenu.hidden));
  menuButton.setAttribute(
    "aria-label",
    mobileMenu.hidden ? "Open navigation" : "Close navigation",
  );
});
mobileMenu.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    mobileMenu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
  }),
);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileMenu.hidden) {
    mobileMenu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    menuButton.focus();
  }
});

let zoom = 1;
const mapImage = document.querySelector(".map-landscape");
function setZoom(value) {
  zoom = Math.min(1.6, Math.max(1, value));
  mapImage.style.transform = `scale(${zoom})`;
  document.querySelector("#map-zoom-in").disabled = zoom >= 1.6;
  document.querySelector("#map-zoom-out").disabled = zoom <= 1;
}
document
  .querySelector("#map-zoom-in")
  .addEventListener("click", () => setZoom(zoom + 0.2));
document
  .querySelector("#map-zoom-out")
  .addEventListener("click", () => setZoom(zoom - 0.2));
document
  .querySelector("#map-reset")
  .addEventListener("click", () => setZoom(1));
setZoom(1);

// Local synthesized breeze keeps ambience optional and avoids an external audio request.
let audioContext;
let breezeSource;
let breezeGain;
const soundButton = document.querySelector(".sound-button");
soundButton.addEventListener("click", async () => {
  const isPlaying = soundButton.getAttribute("aria-pressed") === "true";
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
      const buffer = audioContext.createBuffer(
        1,
        audioContext.sampleRate * 5,
        audioContext.sampleRate,
      );
      const samples = buffer.getChannelData(0);
      let previous = 0;
      for (let index = 0; index < samples.length; index++) {
        previous = (previous + (Math.random() * 2 - 1) * 0.02) / 1.02;
        samples[index] = previous * 3.5;
      }
      breezeSource = audioContext.createBufferSource();
      breezeSource.buffer = buffer;
      breezeSource.loop = true;
      breezeGain = audioContext.createGain();
      breezeGain.gain.value = 0;
      breezeSource.connect(breezeGain).connect(audioContext.destination);
      breezeSource.start();
    }
    await audioContext.resume();
    breezeGain.gain.setTargetAtTime(
      isPlaying ? 0 : 0.28,
      audioContext.currentTime,
      0.4,
    );
    soundButton.setAttribute("aria-pressed", String(!isPlaying));
    soundButton.setAttribute(
      "aria-label",
      `Turn campus ambience ${isPlaying ? "on" : "off"}`,
    );
    soundButton.querySelector("span").textContent = isPlaying
      ? "Sound off"
      : "Sound on";
  } catch {
    notify("Campus ambience is unavailable in this browser.");
  }
});
document.addEventListener("visibilitychange", () => {
  if (audioContext && breezeGain)
    breezeGain.gain.setTargetAtTime(
      document.hidden || soundButton.getAttribute("aria-pressed") !== "true"
        ? 0
        : 0.28,
      audioContext.currentTime,
      0.2,
    );
});

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("waiting");
          revealObserver.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 },
  );
  document
    .querySelectorAll(
      ".section-heading h2,.section-heading p,.section-heading .text-link,.gateway-image,.campus-top h2,.campus-top p,.school-row,.school-preview-image,.school-preview-copy h3,.school-preview-copy p,.life-copy h2,.life-copy p,.life-copy .primary-button,.closing h2,.closing p,.closing .primary-button",
    )
    .forEach((element, index) => {
      element.classList.add("reveal", "waiting");
      element.style.transitionDelay = `${(index % 3) * 70}ms`;
      revealObserver.observe(element);
    });
}
let scrollScheduled = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollScheduled || reducedMotion.matches) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      const scroll = Math.min(window.scrollY, window.innerHeight);
      document.querySelector(".hero-media").style.transform =
        `translateY(${scroll * 0.2}px) scale(${1 + scroll * 0.00004})`;
      scrollScheduled = false;
    });
  },
  { passive: true },
);
