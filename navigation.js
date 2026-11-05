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
const destinations = [...document.querySelector("#site-search-index").content.querySelectorAll("a")]
  .map((link) => ({
    label: link.textContent,
    href: link.getAttribute("href"),
    terms: normalize(link.textContent + " " + link.dataset.terms),
  }));

function normalize(value) {
  return value.toLowerCase().normalize("NFKD").replace(/\p{M}/gu, "")
    .replace(/\bb[.\s-]*tech\b/g, "btech")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function showResults() {
  const query = normalize(input.value);
  resultList.replaceChildren();
  results.hidden = !query;
  if (!query) return;
  const terms = query.split(" ");
  function rank({ label }) {
    const title = normalize(label);
    if (title === query) return 3;
    if (title.startsWith(query)) return 2;
    return Number(title.includes(query));
  }
  const matches = destinations.filter((entry) => terms.every((term) => entry.terms.includes(term)))
    .sort((a, b) => rank(b) - rank(a));
  const visibleMatches = matches.slice(0, 12);
  status.textContent = matches.length ? `${matches.length} matching destinations${matches.length > visibleMatches.length ? ", showing the first 12" : ""}` : "No matching destinations.";
  for (const { label, href } of visibleMatches) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.textContent = label;
    link.href = href;
    item.append(link);
    resultList.append(item);
  }
  if (!matches.length || matches.length > visibleMatches.length) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.textContent = "Browse the A–Z Directory";
    link.href = "/directory";
    item.append(link);
    resultList.append(item);
  }
  for (const group of groups) group.open = false;
  setMenu(false);
}

input.addEventListener("input", showResults);
input.addEventListener("focus", showResults);
search.addEventListener("submit", (event) => {
  if (!normalize(input.value)) return;
  event.preventDefault();
  showResults();
  resultList.querySelector("a")?.focus();
});
search.addEventListener("focusout", (event) => {
  if (!search.contains(event.relatedTarget)) results.hidden = true;
});
resultList.addEventListener("click", () => { results.hidden = true; });

for (const group of groups) {
  group.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !group.contains(event.relatedTarget)) group.open = false;
  });
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
