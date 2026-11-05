import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { buildSync, transformSync } from "esbuild";
import { pageRoutes, renderPage } from "./render-pages.mjs";

const root = import.meta.dirname;
const output = join(root, "dist");
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

const pages = [];
for (const route of pageRoutes) {
  const filename = route === "/" ? "index.html" : `${route.slice(1)}.html`;
  const html = renderPage(route);
  pages.push(html);
  writeFileSync(join(output, filename), html, "utf8");
}

function place(file, contents) {
  const destination = join(output, file);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, contents);
}

const scripts = [
  "app.js", "navigation.js", "campus-explorer.js", "landing-intro.js", "landing-art.js",
  "assistant.js", "assistant-prefs.js", "assistant-intents.mjs", "campus-guide.js",
  "site-pages.mjs", "intro-guard.js",
];
const styles = [
  "styles.css", "theme.css", "admissions.css", "site-pages.css", "campus-explorer.css",
  "landing-intro.css", "assistant.css",
];

for (const file of scripts) {
  place(file, transformSync(readFileSync(join(root, file), "utf8"), { loader: "js", minify: true, target: "es2022" }).code);
}
for (const file of styles) {
  place(file, transformSync(readFileSync(join(root, file), "utf8"), { loader: "css", minify: true }).code);
}

// Bundling drops the parts of the 3D engine the campus doesn't use.
buildSync({
  entryPoints: [join(root, "campus3d.js")],
  outfile: join(output, "campus3d.js"),
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2022",
  legalComments: "none",
});

// Ship only the images something refers to, so unused files can't add weight.
const sources = [...pages, ...scripts, ...styles].map((item) =>
  item.includes("<") ? item : readFileSync(join(root, item), "utf8"),
).join("\n");
const assets = [
  "assets/fonts/manrope-latin.woff2", "assets/fonts/OFL.txt", "assets/data/campus.json",
  "assets/brand/srm-emblem.png", "assets/brand/srm-emblem.webp", "assets/brand/srm-logo.webp",
];
const images = readdirSync(join(root, "assets/images"))
  .filter((name) => name.endsWith(".webp"))
  .filter((name) => sources.includes(name) || /-(640|960|1280)\.webp$/.test(name) && sources.includes(name.replace(/-(640|960|1280)\.webp$/, ".webp")));

for (const file of [...assets, ...images.map((name) => `assets/images/${name}`)]) {
  const destination = join(output, file);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(join(root, file), destination);
}

console.log(`Exported ${pageRoutes.length} pages and ${images.length} images to dist/`);
