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

const groups = [...document.querySelectorAll(".nav-group")];
const search = document.querySelector(".site-search");
const input = search.querySelector("input");
const results = search.querySelector(".search-results");
const resultList = results.querySelector("ul");
const status = results.querySelector("[role=status]");
const destinations = [...document.querySelectorAll(".desktop-nav a")].map((link) => ({
  label: link.textContent.trim().replace(/^Explore /, ""),
  href: link.getAttribute("href"),
  category: link.closest("details")?.querySelector("summary").textContent.trim() ?? "",
}));

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function showResults() {
  const query = normalize(input.value);
  resultList.replaceChildren();
  results.hidden = !query;
  if (!query) return;
  const terms = query.split(" ");
  const matches = destinations.filter(({ label, category }) =>
    terms.every((term) => normalize(label + " " + category).includes(term)),
  );
  status.textContent = matches.length ? `${matches.length} matching destinations` : "No matching destinations.";
  for (const { label, href } of matches) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.textContent = label;
    link.href = href;
    item.append(link);
    resultList.append(item);
  }
  for (const group of groups) group.open = false;
  setMenu(false);
}

input.addEventListener("input", showResults);
input.addEventListener("focus", showResults);
search.addEventListener("submit", (event) => {
  event.preventDefault();
  showResults();
  resultList.querySelector("a")?.focus();
});
search.addEventListener("focusout", (event) => {
  if (!search.contains(event.relatedTarget)) results.hidden = true;
});
resultList.addEventListener("click", () => { results.hidden = true; });

for (const group of groups) {
  if (group.closest(".desktop-nav")) {
    group.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") group.open = true;
    });
    group.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse" && !group.contains(document.activeElement)) {
        group.open = false;
      }
    });
    group.addEventListener("focusout", (event) => {
      if (!group.contains(event.relatedTarget) && !group.matches(":hover")) group.open = false;
    });
  }
  group.addEventListener("toggle", () => {
    if (group.open) {
      for (const other of groups) if (other !== group) other.open = false;
    }
  });
  group.addEventListener("click", (event) => {
    if (event.target.closest("a")) group.open = false;
  });
}

document.addEventListener("click", (event) => {
  for (const group of groups) if (!group.contains(event.target)) group.open = false;
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!results.hidden) {
    input.focus();
    results.hidden = true;
  }
  for (const group of groups) {
    if (!group.open) continue;
    group.open = false;
    if (group.contains(document.activeElement)) group.querySelector("summary").focus();
  }
});
