import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { resolve, extname } from "node:path";
import { renderPage } from "./render-pages.mjs";
import { handle } from "./assistant-server.mjs";
import { browserFiles } from "./browser-files.mjs";
import { apiError, apiHeaders, MAX_BODY_BYTES, validateBody, validateRequest } from "./api-request.mjs";

const root = resolve(import.meta.dirname);
if (existsSync(resolve(root, ".env"))) process.loadEnvFile(resolve(root, ".env"));
const port = Number(process.env.PORT || 3000);
const publicPaths = new Set(browserFiles.map((file) => `/${file}`));
const { headers } = JSON.parse(readFileSync(resolve(root, "vercel.json"), "utf8"));
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

function readBody(request) {
  return new Promise((resolveBody, reject) => {
    let bytes = 0;
    const parts = [];
    request.on("data", (part) => {
      bytes += part.length;
      if (bytes <= MAX_BODY_BYTES) parts.push(part);
      else resolveBody(apiError(413, "Request is too large."));
    });
    request.on("end", () => resolveBody({ raw: Buffer.concat(parts).toString("utf8") }));
    request.on("error", reject);
    request.on("aborted", reject);
  });
}

const apiRoutes = new Map([["/api/chat", "chat"], ["/api/page", "page"]]);

async function serveApi(kind, request, response) {
  let result = validateRequest(request.method, request.headers);
  if (result?.status === 405) response.setHeader("Allow", "POST");
  if (!result) {
    try {
      const input = await readBody(request);
      const parsed = input.status ? input : validateBody(kind, input.raw);
      result = parsed.status ? parsed : await handle(kind, parsed.body, {
        ip: request.socket.remoteAddress,
        origin: request.headers.origin,
        host: request.headers.host,
      });
    } catch {
      result = apiError(400, "Invalid request.");
    }
  }
  if (response.destroyed) return;
  response.writeHead(result.status, apiHeaders);
  response.end(JSON.stringify(result.json));
}

createServer((request, response) => {
  for (const { key, value } of headers[0].headers) response.setHeader(key, value);
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (apiRoutes.has(pathname)) {
      void serveApi(apiRoutes.get(pathname), request, response);
      return;
    }
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }
    const page = renderPage(pathname);
    if (page !== null) {
      response.writeHead(200, { "Content-Type": types[".html"] });
      response.end(request.method === "HEAD" ? undefined : page);
      return;
    }
    if (!publicPaths.has(pathname)) {
      response.writeHead(404, { "Content-Type": types[".html"] });
      response.end(request.method === "HEAD" ? undefined : '<!doctype html><html lang="en"><meta charset="utf-8"><title>Page not found</title><main><h1>Page not found</h1><p><a href="/directory">Browse the SRMIST directory</a></p></main></html>');
      return;
    }
    const file = resolve(root, `.${pathname}`);
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(file).pipe(response);
  } catch {
    response.writeHead(400);
    response.end("Invalid request");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`SRM campus preview at http://localhost:${port}`),
);
