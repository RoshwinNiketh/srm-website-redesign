import { readdirSync } from "node:fs";
import { join } from "node:path";

const root = import.meta.dirname;
export const browserFiles = [
  "app.js", "navigation.js", "campus-explorer.js", "campus3d.js",
  "landing-intro.js", "landing-boot.js", "landing-art.js", "styles.css", "theme.css",
  "admissions.css", "site-pages.css", "campus-explorer.css", "landing-intro.css",
  "assistant.js", "assistant.css", "assistant-prefs.js", "assistant-intents.mjs",
  "campus-guide.js", "site-pages.mjs",
  "assets/brand/srm-logo.png", "assets/brand/srm-emblem.png", "assets/fonts/manrope-latin.woff2",
  "assets/fonts/OFL.txt", "assets/data/campus.json", "assets/lib/three.module.js",
  ...readdirSync(join(root, "assets/images"))
    .filter((name) => name.endsWith(".webp"))
    .map((name) => `assets/images/${name}`),
];
