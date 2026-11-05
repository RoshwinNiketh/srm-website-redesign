// Downloads the official SRMIST pages listed in docs/srmist-inner-pages.md, slowly,
// into tools/.crawl-cache. Stops at once if the site shows a human check.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const cache = join(import.meta.dirname, ".crawl-cache");
const DELAY_MS = 3000;
mkdirSync(cache, { recursive: true });

const docs = readFileSync(join(root, "docs/srmist-inner-pages.md"), "utf8");
const manifestPath = join(cache, "manifest.json");
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
const urls = new Set();
for (const [, url] of docs.matchAll(/\]\((https:\/\/www\.srmist\.edu\.in\/[^)#\s]*)\)/g)) urls.add(url);
const seeds = ["https://www.srmist.edu.in/"];
const list = [...seeds, ...urls];
console.log(`${list.length} pages to check`);

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
for (const url of list) {
  const name = createHash("sha1").update(url).digest("hex").slice(0, 16) + ".html";
  if (manifest[url]?.status === 200 && existsSync(join(cache, name))) continue;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "SRM-website-redesign-prototype/1.0 (knowledge index for design challenge)" },
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
    });
    const html = await response.text();
    if (response.status === 403 || response.status === 429 || /verify you are human|cf-challenge|just a moment/i.test(html.slice(0, 5000))) {
      console.log(`Stopped: human check or rate limit at ${url} (${response.status})`);
      break;
    }
    manifest[url] = { status: response.status, file: name, finalUrl: response.url, fetchedAt: new Date().toISOString() };
    if (response.status === 200) writeFileSync(join(cache, name), html);
    console.log(response.status, url);
  } catch (error) {
    manifest[url] = { status: 0, error: String(error.message) };
    console.log("ERR", url, error.message);
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
  await sleep(DELAY_MS);
}
const done = Object.values(manifest).filter((entry) => entry.status === 200).length;
console.log(`Done: ${done} of ${list.length} saved`);
