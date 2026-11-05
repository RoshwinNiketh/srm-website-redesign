import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { renderPage } from "./render-pages.mjs";
import { handle } from "./assistant-server.mjs";

const root = resolve(import.meta.dirname);
if (existsSync(resolve(root, ".env"))) process.loadEnvFile(resolve(root, ".env"));
const port = Number(process.env.PORT || 3000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".glb": "model/gltf-binary",
  ".json": "application/json; charset=utf-8",
};

function readJson(request) {
  return new Promise((done, fail) => {
    let body = "";
    request.on("data", (part) => {
      body += part;
      if (body.length > 20000) {
        fail(new Error("Too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        done(JSON.parse(body || "{}"));
      } catch (error) {
        fail(error);
      }
    });
    request.on("error", fail);
  });
}

const apiRoutes = { "/api/chat": "chat", "/api/page": "page" };

async function serveApi(kind, request, response) {
  let result;
  if (request.method !== "POST") {
    result = { status: 405, json: { ok: false } };
  } else {
    try {
      const body = await readJson(request);
      result = await handle(kind, body, {
        ip: request.socket.remoteAddress,
        origin: request.headers.origin,
        host: request.headers.host,
      });
    } catch {
      result = { status: 400, json: { ok: false, error: "Invalid request." } };
    }
  }
  if (response.destroyed) return;
  response.writeHead(result.status, { "Content-Type": types[".json"] });
  response.end(JSON.stringify(result.json));
}

createServer((request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (apiRoutes[pathname]) {
      serveApi(apiRoutes[pathname], request, response);
      return;
    }
    const page = renderPage(pathname);
    if (page !== null) {
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
