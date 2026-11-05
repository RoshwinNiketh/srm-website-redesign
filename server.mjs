import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";

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
};

createServer((request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (["/admissions", "/admissions/", "/admissions.html"].includes(pathname)) {
      const home = readFileSync(resolve(root, "index.html"), "utf8");
      const nav = home
        .split("<!-- Shared navigation start -->")[1]
        .split("<!-- Shared navigation end -->")[0]
        .replace('class="nav-active" ', "")
        .replaceAll('href="/admissions"', 'href="/admissions" class="nav-active" aria-current="page"')
        .replace('class="header-action" href="#schools"', 'class="header-action" href="#apply"')
        .replace("Find your future", "How to apply");
      const page = readFileSync(resolve(root, "admissions.html"), "utf8")
        .replace("<!-- Shared navigation -->", () => nav);
      response.writeHead(200, { "Content-Type": types[".html"] });
      response.end(request.method === "HEAD" ? undefined : page);
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
