import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pageRoutes, renderPage } from "./render-pages.mjs";

import { browserFiles } from "./browser-files.mjs";

const root = import.meta.dirname;
const output = join(root, "dist");
mkdirSync(output, { recursive: true });

for (const route of pageRoutes) {
  const filename = route === "/" ? "index.html" : `${route.slice(1)}.html`;
  writeFileSync(join(output, filename), renderPage(route), "utf8");
}


for (const file of browserFiles) {
  const destination = join(output, file);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(join(root, file), destination);
}

console.log(`Exported ${pageRoutes.length} pages to dist/`);
