const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector("#mobile-menu");

function setMenu(open) {
  mobileMenu.hidden = !open;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
}

menuButton.addEventListener("click", () => setMenu(mobileMenu.hidden));
mobileMenu.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => setMenu(false)),
);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileMenu.hidden) {
    setMenu(false);
    menuButton.focus();
  }
});

const pageAliases = {
  "/admissions": ["admission", "apply", "how to apply"],
  "/academics": ["schools", "programmes", "programs"],
  "/campus-life": ["life at srm", "student life"],
  "/about": ["about", "about us"],
  "/contact": ["contact us"],
};

function normalizePageName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const destinations = new Map([["home", "/"], ["homepage", "/"]]);
for (const link of document.querySelectorAll(".desktop-nav a")) {
  const names = [link.textContent, ...(pageAliases[link.pathname] ?? [])];
  for (const name of names) destinations.set(normalizePageName(name), link.pathname);
}

const guide = document.createElement("div");
guide.className = "page-guide";
guide.innerHTML = `
  <section id="page-guide-panel" aria-labelledby="page-guide-title" hidden>
    <div class="page-guide-heading">
      <h2 id="page-guide-title">Page finder</h2>
      <button type="button" class="page-guide-close" aria-label="Close page finder">×</button>
    </div>
    <p>Type a page name and I’ll take you there.</p>
    <form>
      <label for="page-guide-input">Page name</label>
      <div class="page-guide-fields">
        <input id="page-guide-input" type="text" placeholder="e.g. Campus Life" autocomplete="off" required />
        <button type="submit">Go</button>
      </div>
    </form>
    <p class="page-guide-status" role="status"></p>
  </section>
  <button type="button" class="page-guide-toggle" aria-controls="page-guide-panel" aria-expanded="false">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5h14v10H9l-4 4V5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 9h8m-8 3h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
    Page finder
  </button>`;
document.querySelector("footer").append(guide);

const toggle = guide.querySelector(".page-guide-toggle");
const guidePanel = guide.querySelector("section");
const guideInput = guide.querySelector("input");
const guideStatus = guide.querySelector("[role=status]");

function setGuide(open) {
  guidePanel.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  (open ? guideInput : toggle).focus();
}

toggle.addEventListener("click", () => setGuide(guidePanel.hidden));
guide.querySelector(".page-guide-close").addEventListener("click", () => setGuide(false));
guide.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !guidePanel.hidden) {
    event.stopPropagation();
    setGuide(false);
  }
});
guide.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const destination = destinations.get(normalizePageName(guideInput.value));
  if (!destination) {
    guideStatus.textContent = "Try Admissions, Academics, Campus Life, Research, About SRM, or Contact.";
    return;
  }
  if (location.pathname.replace(/\/$/, "") === destination.replace(/\/$/, "") && !location.hash) {
    guideStatus.textContent = "You’re already on that page.";
    return;
  }
  location.assign(destination);
});
