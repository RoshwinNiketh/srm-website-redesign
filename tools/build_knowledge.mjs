// Builds knowledge/chunks.json from this site's pages and the crawled official
// pages. The 3D panel's fees and degree lists are sample content, so they are
// not included: they live in JavaScript and in sections this script skips.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pages } from "../site-pages.mjs";

const root = join(import.meta.dirname, "..");
const cache = join(import.meta.dirname, ".crawl-cache");
const CHUNK = 1000;
const OVERLAP = 120;
const MAX_CHUNKS_PER_PAGE = 30;

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…", rarr: "→", copy: "©" };
const decode = (text) => text
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
  .replace(/&([a-z]+);/gi, (all, name) => ENTITIES[name.toLowerCase()] ?? all);

const tidy = (text) => decode(text).replace(/[ \t\r\f\v ]+/g, " ").trim();

function removeBlocks(html, tags) {
  let output = html;
  for (const tag of tags) output = output.replace(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, "gi"), " ");
  return output;
}

// Turns HTML into lines, with headings marked so sections can be split later.
function htmlToLines(html) {
  const body = removeBlocks(html.replace(/<!--[\s\S]*?-->/g, " "), ["script", "style", "noscript", "svg", "iframe", "template", "select", "form"])
    .replace(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/gi, (_, inner) => `\n## ${inner.replace(/<[^>]+>/g, " ")}\n`)
    .replace(/<\/?(p|div|li|ul|ol|tr|table|section|article|br|dt|dd|dl|figure|aside|main|blockquote)\b[^>]*>/gi, "\n")
    .replace(/<\/t[dh]>/gi, " · ")
    .replace(/<[^>]+>/g, " ");
  return body.split("\n").map(tidy).filter((line) => line && line !== "##");
}

function sections(lines, fallback) {
  const output = [];
  let current = { section: fallback, lines: [] };
  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current.lines.length) output.push(current);
      current = { section: line.slice(3).trim() || fallback, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.length) output.push(current);
  return output;
}

function split(text) {
  if (text.length <= CHUNK) return [text];
  const parts = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + CHUNK, text.length);
    if (end < text.length) {
      const stop = text.lastIndexOf(". ", end);
      if (stop > start + CHUNK / 2) end = stop + 1;
    }
    parts.push(text.slice(start, end).trim());
    if (end >= text.length) break;
    start = end - OVERLAP;
  }
  return parts;
}

const chunks = [];
function addPage({ prefix, title, url, route, parts }) {
  let count = 0;
  for (const part of parts) {
    const body = part.lines.join(" ");
    if (body.length < 40) continue;
    for (const text of split(body)) {
      if (count >= MAX_CHUNKS_PER_PAGE) return;
      chunks.push({ id: `${prefix}-${count++}`, title, section: part.section, url, ...(route ? { route } : {}), text });
    }
  }
}

/* ---------- this site ---------- */
const plain = (html) => tidy(html.replace(/<[^>]+>/g, " "));

for (const [route, page] of Object.entries(pages)) {
  addPage({
    prefix: `site${route.replace(/\//g, "-")}`,
    title: plain(page.title),
    url: route,
    route,
    parts: [
      { section: plain(page.title), lines: [plain(page.lead)] },
      ...page.topics.map(([name, description]) => ({ section: plain(name), lines: [`${plain(name)}: ${plain(description)}`] })),
      { section: plain(page.nextHeading), lines: [plain(page.nextText)] },
    ],
  });
}

const admissions = readFileSync(join(root, "admissions.html"), "utf8").match(/<main[^>]*>([\s\S]*)<\/main>/)[1];
addPage({ prefix: "site-admissions", title: "Admissions", url: "/admissions", route: "/admissions", parts: sections(htmlToLines(admissions), "Admissions") });

const home = readFileSync(join(root, "index.html"), "utf8");
const homeParts = [];
for (const id of ["schools", "life"]) {
  const match = home.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`));
  if (match) homeParts.push(...sections(htmlToLines(match[0].replace(/<button[\s\S]*?<\/button>/g, " ")), "Home"));
}
homeParts.unshift({ section: "Home", lines: ["SRM Institute of Science and Technology, Kattankulathur, Tamil Nadu, India. Learn. Leap. Lead. The home page includes a 3D campus explorer where visitors can pick a building, a list of schools, and a section on life beyond the classroom. The 3D campus building locations and sample details are a design concept and need confirming."] });
addPage({ prefix: "site-home", title: "Home", url: "/", route: "/", parts: homeParts });
const localCount = chunks.length;

/* ---------- official pages ---------- */
const manifestPath = join(cache, "manifest.json");
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const seen = new Set();
  const loaded = [];
  for (const [url, entry] of Object.entries(manifest)) {
    if (entry.status !== 200 || !entry.file) continue;
    const finalUrl = entry.finalUrl || url;
    if (seen.has(finalUrl)) continue;
    seen.add(finalUrl);
    const html = readFileSync(join(cache, entry.file), "utf8");
    const title = tidy((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || finalUrl)).replace(/\s*[|\-–]\s*(-\s*)?SRMIST\s*$/i, "").replace(/\s*\|\s*-?\s*$/, "").trim();
    const noChrome = removeBlocks(html.slice(html.search(/<body/i)), ["header", "footer", "nav"]);
    loaded.push({ url: finalUrl, title, lines: htmlToLines(noChrome) });
  }
  // Text repeated across many pages is menu or footer text, not page content.
  const lineCounts = new Map();
  loaded.forEach((page) => new Set(page.lines).forEach((line) => lineCounts.set(line, (lineCounts.get(line) || 0) + 1)));
  const limit = Math.max(4, loaded.length * 0.12);
  loaded.forEach((page, i) => {
    const lines = page.lines.filter((line) => lineCounts.get(line) < limit);
    addPage({ prefix: `srm${i}`, title: page.title, url: page.url, parts: sections(lines, page.title) });
  });
  console.log(`Official pages indexed: ${loaded.length}`);
}

// Never let the sample figures through, even if one is copied into a page later.
const SAMPLE = /₹\s?(4,50,000|3,00,000|1,50,000|2,50,000|2,00,000)/;
const clean = chunks.filter((chunk, i) => i >= localCount || !SAMPLE.test(chunk.text));
mkdirSync(join(root, "knowledge"), { recursive: true });
writeFileSync(join(root, "knowledge/chunks.json"), JSON.stringify(clean));
console.log(`Chunks: ${clean.length} (${localCount} from this site)`);
