import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { pages } from "./site-pages.mjs";

const root = resolve(import.meta.dirname);
const port = Number(process.env.PORT || 3000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".glb": "model/gltf-binary",
  ".json": "application/json; charset=utf-8",
};

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
    <h2 id="inner-topics-title">Explore this page</h2>
    <dl>${page.topics.map(([title, description]) => `<div><dt>${title}</dt><dd>${description}</dd></div>`).join("")}</dl>
    <div class="inner-actions">${page.links.map(([label, href]) => `<a href="${href}">${label} <span aria-hidden="true">↗</span></a>`).join("")}</div>
  </section>`;
}

createServer((request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    const route = pathname === "/admissions.html" ? "/admissions" : pathname.replace(/\/$/, "") || "/";
    const isHome = ["/", "/index.html"].includes(route);
    const isAdmissions = route === "/admissions";
    const innerPage = Object.hasOwn(pages, route) ? pages[route] : null;
    if (isHome || isAdmissions || innerPage) {
      const home = read("index.html");
      const nav = sharedNavigation(home, isHome ? "/" : route);
      const page = isHome
        ? home.replace(/<!-- Shared navigation start -->[\s\S]*?<!-- Shared navigation end -->/, () => nav)
        : (isAdmissions ? read("admissions.html") : read("inner-page.html")
          .replace("<!-- Page title -->", () => innerPage.title)
          .replace("<!-- Page content -->", () => renderInnerPage(innerPage)))
          .replace("<!-- Shared navigation -->", () => nav);
      response.writeHead(200, { "Content-Type": types[".html"] });
      response.end(request.method === "HEAD" ? undefined : page);
      return;
    }
    if (pathname === "/inner-page.html") {
      response.writeHead(404);
      response.end("Page not found");
      return;
    }
    const file = resolve(
      root,
      `.${pathname === "/" ? "/index.html" : pathname}`,
    );
    if (
      !file.startsWith(root + sep) ||
      /(^|[\\/])\./.test(pathname) ||
      !existsSync(file) ||
      !statSync(file).isFile()
    ) {
      response.writeHead(404);
      response.end("Page not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(400);
    response.end("Invalid request");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`SRM campus preview at http://localhost:${port}`),
);
