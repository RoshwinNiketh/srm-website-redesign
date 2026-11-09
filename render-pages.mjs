import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { photos, pagePhoto, photoStories } from "./campus-photos.mjs";
import { pages } from "./site-pages.mjs";
import { universityDirectory } from "./university-directory.mjs";
import { homeHighlights, pageHighlights } from "./institutional-highlights.mjs";

import { footerLinks, pageAdditions, servicePages, utilityLinks } from "./site-services.mjs";

const root = import.meta.dirname;
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);
const directories = Object.fromEntries(universityDirectory.map(([path, title, topics]) => [
  path, [title, [...(pageAdditions[path] || []), ...topics]],
]));
for (const [path, [title, , topics]] of Object.entries(servicePages)) {
  directories[path] = [title, topics];
}
const primary = ["/academics", "/admissions", "/research", "/campus-life", "/international", "/about"];
const searchEntries = [
  ...Object.entries(directories).flatMap(([path, [title, topics]]) => [
    [title, path, ""],
    ...topics.map(([id, label, description]) => [label, `${path}#${id}`, `${title} ${description}`]),
  ]),
  ...footerLinks.map(([title, path]) => [title, path, ""]),
];
const uniqueEntries = [...new Map(searchEntries.map((entry) => [entry[1], entry])).values()]
  .sort(([a], [b]) => a.localeCompare(b));
const link = (label, href) => `<a href="${escape(href)}">${escape(label)}</a>`;
const linkList = (items) => `<ul>${items.map(([label, href]) => `<li>${link(label, href)}</li>`).join("")}</ul>`;

function photo(key, { eager = false } = {}) {
  const [file, alt, width, height, caption, source] = photos[key];
  return `<figure class="campus-photo">
    <img src="/assets/images/${file}.webp" alt="${escape(alt)}" width="${width}" height="${height}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />
    <figcaption><span>${escape(caption)}</span><a href="${escape(source)}" aria-label="SRMIST photo source for ${escape(caption)}">Photo source</a></figcaption>
  </figure>`;
}

function editorialLead(route, title, lead, destination, label) {
  return `<section class="editorial-lead${Object.hasOwn(servicePages, route) || route === "/directory" ? " editorial-lead-service" : ""}">
    <div class="editorial-lead-copy">
      <p class="editorial-kicker">SRM Institute of Science and Technology</p>
      <h1>${escape(title)}</h1>
      <p class="editorial-intro">${escape(lead)}</p>
      <a class="editorial-jump" href="${destination}">${label} <span aria-hidden="true">↓</span></a>
    </div>
    ${photo(pagePhoto[route], { eager: true })}
  </section>`;
}

function photoStory(route) {
  const story = photoStories[route];
  if (!story) return "";
  const [title, ...images] = story;
  return `<section class="photo-story" aria-labelledby="photo-story-title">
    <h2 id="photo-story-title">${title}</h2>
    <div class="photo-story-grid">${images.map((key) => photo(key)).join("")}</div>
  </section>`;
}

const footer = `<footer class="site-footer"><div><a class="footer-home" href="/">SRM Institute of Science and Technology</a><p>Campus website prototype</p></div><nav aria-label="Footer">${linkList(footerLinks)}</nav></footer>`;

function layout(html) {
  return html.replace(/<main(?: id="admissions-content")?([^>]*)>/, '<main id="main-content" tabindex="-1"$1>')
    .replace(/<footer(?:\s[^>]*)?>[\s\S]*?<\/footer>/, () => footer)
    .replace("</head>", '    <meta name="robots" content="noindex" />\n  </head>');
}
export const pageRoutes = ["/", "/admissions", ...Object.keys(pages), "/more", ...Object.keys(servicePages), "/directory"];

function read(name) {
  return readFileSync(resolve(root, name), "utf8");
}

function sharedNavigation(home, activePath) {
  const nav = home.split("<!-- Shared navigation start -->")[1]
    .split("<!-- Shared navigation end -->")[0];
  const current = (path) => path === activePath ? ' aria-current="page"' : "";
  const links = primary.map((path) => {
    const [title, topics] = directories[path];
    return `<details class="nav-group"><summary${current(path)}>${escape(title)}</summary>
      <div class="nav-panel">
        <a href="${path}"${current(path)}>Explore ${escape(title)}</a>
        ${topics.slice(0, 7).map(([id, label]) => link(label, `${path}#${id}`)).join("")}
      </div>
    </details>`;
  }).join("");
  const utility = `<ul>${utilityLinks.map(([label, path]) =>
    `<li><a href="${path}"${current(path)}>${escape(label)}</a></li>`).join("")}</ul>`;
  const quick = `<nav class="utility-nav" aria-label="University services">${utility}</nav>`;
  const index = `<template id="site-search-index">${uniqueEntries.map(([title, href, terms]) =>
    `<a href="${escape(href)}" data-terms="${escape(terms)}">${escape(title)}</a>`).join("")}</template>`;
  return '<a class="skip-link" href="#main-content">Skip to main content</a>' +
    nav.replace("<!-- Desktop page links -->", () => links)
      .replace("<!-- Mobile page links -->", () => link("Home", "/") + links + utility) + quick + index;
}

function renderDirectory(route) {
  const [title, topics] = directories[route];
  return `<section id="page-details" class="inner-topics directory" aria-labelledby="directory-title">
    <header class="directory-heading"><p class="directory-kicker">SRMIST / ${escape(title)}</p>
    <h2 id="directory-title">Explore ${escape(title)}</h2></header>
    <ol class="directory-list">${topics.map(([id, label, description, ...sources]) => `<li id="${escape(id)}">
      <h3>${escape(label)}</h3><p>${escape(description)}</p>
      <div class="directory-sources">${sources.map((source, index) => {
        if (Array.isArray(source)) return link(...source);
        const topic = label.toLowerCase();
        return link(source === "/contact" ? "Contact directory" : index === 0 ? `SRMIST guide to ${topic}` : `Additional information on ${topic}`, source);
      }).join("")}</div>
    </li>`).join("")}</ol>
  </section>`;
}

function renderService(route) {
  const [title, lead] = servicePages[route] || ["A–Z Directory", "Browse university information by topic. Use site search to narrow the list."];
  return `${editorialLead(route, title, lead, "#page-details", route === "/directory" ? "Browse destinations" : "Explore services")}
    ${photoStory(route)}
    ${route === "/directory" ? `<nav id="page-details" class="inner-topics az-directory" aria-label="A–Z destinations">${linkList(uniqueEntries)}</nav>` : renderDirectory(route)}`;
}

function renderHighlights({ label, title, intro, metrics = [], links }, home = false) {
  return `<section id="highlights" class="highlights${home ? " highlights-home" : ""}" aria-labelledby="highlights-title">
    <div class="highlights-heading">
      <p class="directory-kicker">${label}</p>
      <div><h2 id="highlights-title">${title}</h2><p>${intro}</p></div>
    </div>
    ${metrics.length ? `<div class="highlights-evidence">
      ${home ? photo("tech") : ""}
      <dl class="highlights-metrics">${metrics.map(([value, description, period, [source, href]]) => `<div class="highlights-metric">
        <dt>${description}</dt><dd><strong>${value}</strong><span>${period}</span><a href="${href}">${source} <span aria-hidden="true">↗</span></a></dd>
      </div>`).join("")}</dl>
    </div>` : ""}
    <div class="highlights-links">${links.map(([label, href]) => `<a class="text-link" href="${href}">${label} <span aria-hidden="true">↗</span></a>`).join("")}</div>
  </section>`;
}

function renderInnerPage(page, route) {
  return `${editorialLead(route, page.title, page.lead, "#page-details", "Explore this page")}
  ${photoStory(route)}
  ${renderHighlights(pageHighlights[route])}
${route === "/contact" ? `  <section id="page-details" class="inner-topics" aria-labelledby="inner-topics-title">
    <h2 id="inner-topics-title">${page.topicHeading}</h2>
    <dl>${page.topics.map(([title, description, href, label]) => `<div>
      <dt>${title}</dt><dd>${description}${href ? `<a class="inner-topic-link" href="${href}">${label} <span aria-hidden="true">↗</span></a>` : ""}</dd>
    </div>`).join("")}</dl>
  </section>` : renderDirectory(route)}
  ${route === "/academics" ? `<section class="inner-topics" aria-labelledby="faculty-title">
    <h2 id="faculty-title">Explore the faculties</h2>
    <dl class="faculty-list">${page.topics.map(([title, description, href, label, id]) => `<div id="${id}">
      <dt>${title}</dt><dd>${description}<a class="inner-topic-link" href="${href}">${label} <span aria-hidden="true">↗</span></a></dd>
    </div>`).join("")}</dl>
  </section>` : ""}
  <section class="inner-next" aria-labelledby="inner-next-title">
    <h2 id="inner-next-title">${page.nextHeading}</h2>
    <div>
      <p>${page.nextText}</p>
      <div class="inner-actions">${page.links.map(([label, href]) => `<a href="${href}">${label} <span aria-hidden="true">↗</span></a>`).join("")}</div>
    </div>
  </section>`;
}

export function renderPage(pathname) {
  const route = pathname === "/admissions.html" ? "/admissions" : pathname.replace(/\/$/, "") || "/";
  const isHome = route === "/" || route === "/index.html";
  const isAdmissions = route === "/admissions";
  const innerPage = route === "/more" ? {
    title: "More from SRMIST",
    lead: "Find career support, global opportunities, alumni connections and university updates.",
    nextHeading: "Find the right office",
    nextText: "Use the contact directory to get in touch with SRMIST.",
    links: [["Contact SRMIST", "/contact"]],
  } : Object.hasOwn(pages, route) ? pages[route] : null;
  const isService = Object.hasOwn(servicePages, route) || route === "/directory";
  if (!isHome && !isAdmissions && !innerPage && !isService) return null;

  const home = read("index.html");
  const nav = sharedNavigation(home, isHome ? "/" : route);
  if (isHome) {
    return layout(home.replace(/<!-- Shared navigation start -->[\s\S]*?<!-- Shared navigation end -->/, () => nav)
      .replace("<!-- Homepage services -->", () =>
        `<nav class="home-services" aria-label="Popular university services">${linkList([
          ["Find a programme", "/programmes"], ["Student services", "/students"],
          ["Exams & Results", "/exams"], ["Plan a visit", "/visit"],
        ])}</nav>`)
      .replace("<!-- Homepage highlights -->", () => renderHighlights(homeHighlights, true) + photoStory("/")));
  }
  const template = isAdmissions ? read("admissions.html")
    .replace("<!-- Admissions directory -->", () => renderHighlights(pageHighlights[route]) + renderDirectory(route)) : read("inner-page.html")
    .replace("<!-- Page title -->", () => isService ? servicePages[route]?.[0] || "A–Z Directory" : innerPage.title)
    .replace("<!-- Page content -->", () => isService ? renderService(route) : renderInnerPage(innerPage, route));
  return layout(template.replace("<!-- Shared navigation -->", () => nav));
}
