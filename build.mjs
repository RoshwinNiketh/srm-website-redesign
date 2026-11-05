import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pageRoutes, renderPage } from "./render-pages.mjs";

const root = import.meta.dirname;
const output = join(root, "dist");
mkdirSync(output, { recursive: true });

for (const route of pageRoutes) {
  const filename = route === "/" ? "index.html" : `${route.slice(1)}.html`;
  writeFileSync(join(output, filename), renderPage(route), "utf8");
}

const browserFiles = [
  "app.js", "navigation.js", "campus-explorer.js", "campus3d.js",
  "landing-intro.js", "landing-art.js", "styles.css", "theme.css",
  "admissions.css", "site-pages.css", "campus-explorer.css", "landing-intro.css",
  "assets/brand/srm-logo.png", "assets/fonts/manrope-latin.woff2",
  "assets/fonts/OFL.txt", "assets/data/campus.json", "assets/lib/three.module.js",
  ...readdirSync(join(root, "assets/images"))
    .filter((name) => name.endsWith(".webp"))
    .map((name) => `assets/images/${name}`),
];

for (const file of browserFiles) {
  const destination = join(output, file);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(join(root, file), destination);
}

console.log(`Exported ${pageRoutes.length} pages to dist/`);
