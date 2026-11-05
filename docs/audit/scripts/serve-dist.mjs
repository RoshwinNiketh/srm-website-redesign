// Serves a built dist folder the way a CDN does: gzip, clean URLs, optional vercel.json headers.
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { gzipSync } from "node:zlib";
const [rawDir, port, vercelJson] = process.argv.slice(2);
const dir = resolve(rawDir);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".json": "application/json", ".avif": "image/avif" };
const rules = vercelJson && existsSync(vercelJson) ? JSON.parse(readFileSync(vercelJson, "utf8")).headers || [] : [];
const toRegex = (source) => new RegExp("^" + source.replace(/[.+^$|]/g, "\\$&").replace(/\(([^)]*)\)/g, (m) => m).replace(/\/:path\*/g, "(?:/.*)?") + "$");
createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = join(dir, normalize(path));
  if (path === "/") file = join(dir, "index.html");
  else if (!extname(file)) file += ".html";
  if (!file.startsWith(dir) || !existsSync(file) || !statSync(file).isFile()) { res.writeHead(404); res.end("nf"); return; }
  const ext = extname(file);
  const headers = { "Content-Type": types[ext] || "application/octet-stream", "Cache-Control": "public, max-age=0, must-revalidate" };
  for (const rule of rules) if (new RegExp(`^${rule.source}$`).test(path)) for (const h of rule.headers) headers[h.key] = h.value;
  let body = readFileSync(file);
  if (/\.(html|css|js|mjs|json|svg)$/.test(file)) { body = gzipSync(body); headers["Content-Encoding"] = "gzip"; }
  res.writeHead(200, headers); res.end(body);
}).listen(Number(port), "127.0.0.1", () => console.log("serving", dir, port));
