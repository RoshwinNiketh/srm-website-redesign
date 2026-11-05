import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pages } from "./site-pages.mjs";

const root = import.meta.dirname;
export const pageRoutes = ["/", "/admissions", ...Object.keys(pages)];

function read(name) {
  return readFileSync(resolve(root, name), "utf8");
}

function sharedNavigation(home, activePath) {
  const nav = home.split("<!-- Shared navigation start -->")[1]
    .split("<!-- Shared navigation end -->")[0];
  const desktopLinks = nav.match(/<nav class="desktop-nav"[^>]*>([\s\S]*?)<\/nav>/)[1];
  return nav.replace("<!-- Mobile page links -->", () => desktopLinks)
    .replaceAll(`href="${activePath}"`, `href="${activePath}" aria-current="page"`);
}

function renderInnerPage(page) {
  const image = page.image ? `<img class="inner-image" src="/assets/images/${page.image}" alt="${page.imageAlt}" />` : "";
  return `<section class="inner-lead${image ? " inner-lead-with-image" : ""}">
    <div><h1>${page.title}</h1><p>${page.lead}</p></div>${image}
  </section>
  <section class="inner-topics" aria-labelledby="inner-topics-title">
    <h2 id="inner-topics-title">${page.topicHeading}</h2>
    <dl>${page.topics.map(([title, description, href, label]) => `<div>
      <dt>${title}</dt><dd>${description}${href ? `<a class="inner-topic-link" href="${href}">${label} <span aria-hidden="true">↗</span></a>` : ""}</dd>
    </div>`).join("")}</dl>
    <div class="inner-actions">${page.links.map(([label, href]) => `<a href="${href}">${label} <span aria-hidden="true">↗</span></a>`).join("")}</div>
  </section>`;
}

export function renderPage(pathname) {
  const route = pathname === "/admissions.html" ? "/admissions" : pathname.replace(/\/$/, "") || "/";
  const isHome = route === "/" || route === "/index.html";
  const isAdmissions = route === "/admissions";
  const innerPage = Object.hasOwn(pages, route) ? pages[route] : null;
  if (!isHome && !isAdmissions && !innerPage) return null;

  const home = read("index.html");
  const nav = sharedNavigation(home, isHome ? "/" : route);
  if (isHome) {
    return home.replace(/<!-- Shared navigation start -->[\s\S]*?<!-- Shared navigation end -->/, () => nav);
  }
  const template = isAdmissions ? read("admissions.html") : read("inner-page.html")
    .replace("<!-- Page title -->", () => innerPage.title)
    .replace("<!-- Page content -->", () => renderInnerPage(innerPage));
  return template.replace("<!-- Shared navigation -->", () => nav);
}
