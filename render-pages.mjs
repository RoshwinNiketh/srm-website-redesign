import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pages } from "./site-pages.mjs";
import { universityDirectory } from "./university-directory.mjs";

const root = import.meta.dirname;
export const pageRoutes = ["/", "/admissions", ...Object.keys(pages), "/more"];

function read(name) {
  return readFileSync(resolve(root, name), "utf8");
}

function sharedNavigation(home, activePath) {
  const nav = home.split("<!-- Shared navigation start -->")[1]
    .split("<!-- Shared navigation end -->")[0];
  const current = (path) => path === activePath ? ' aria-current="page"' : "";
  const links = `<a href="/"${current("/")}>Home</a>` + universityDirectory.map(([path, title, topics]) =>
    `<details class="nav-group"><summary${current(path)}>${title}</summary>
      <div class="nav-panel">
        <a href="${path}"${current(path)}>Explore ${title === "More" ? "More Resources" : title}</a>
        ${topics.map(([id, label]) => `<a href="${path}#${id}">${label}</a>`).join("")}
      </div>
    </details>`).join("");
  const signIn = '<a class="nav-sign-in" href="https://sp.srmist.edu.in/srmiststudentportal/students/loginManager/youLogin.jsp" aria-label="Sign in to the SRMIST Student Portal">Sign in</a>';
  return nav.replace("<!-- Desktop page links -->", () => links + signIn)
    .replace("<!-- Compact sign in -->", () => signIn)
    .replace("<!-- Mobile page links -->", () => links);
}

function renderDirectory(route) {
  const [, title, topics] = universityDirectory.find(([path]) => path === route);
  return `<section id="page-details" class="inner-topics directory" aria-labelledby="directory-title">
    <p class="directory-kicker">SRMIST / ${title}</p>
    <h2 id="directory-title">Explore ${title === "More" ? "more resources" : title}</h2>
    <ol class="directory-list">${topics.map(([id, label, description, ...sources]) => `<li id="${id}">
      <h3>${label}</h3><p>${description}</p>
      <div class="directory-sources">${sources.map((href, index) => `<a href="${href}">${href.startsWith("/") ? "Contact directory" : index === 0 ? "Official SRMIST resource" : "Related SRMIST resource"} <span aria-hidden="true">↗</span></a>`).join("")}</div>
    </li>`).join("")}</ol>
  </section>`;
}

function renderInnerPage(page, route) {
  const image = page.image ? `<img class="inner-image" src="/assets/images/${page.image}" alt="${page.imageAlt}" />` : "";
  return `<section class="inner-lead${image ? " inner-lead-with-image" : ""}">
    <div>
      <h1>${page.title}</h1>
      <p>${page.lead}</p>
      <a class="inner-jump" href="#page-details">Explore this page <span aria-hidden="true">↓</span></a>
    </div>${image}
  </section>
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
  if (!isHome && !isAdmissions && !innerPage) return null;

  const home = read("index.html");
  const nav = sharedNavigation(home, isHome ? "/" : route);
  if (isHome) {
    return home.replace(/<!-- Shared navigation start -->[\s\S]*?<!-- Shared navigation end -->/, () => nav);
  }
  const template = isAdmissions ? read("admissions.html").replace("<!-- Admissions directory -->", () => renderDirectory(route)) : read("inner-page.html")
    .replace("<!-- Page title -->", () => innerPage.title)
    .replace("<!-- Page content -->", () => renderInnerPage(innerPage, route));
  return template.replace("<!-- Shared navigation -->", () => nav);
}
