// Usage: node lh-run.mjs <label> <base url> <path,path> <mobile,desktop>
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const [label, base, pathList, modeList] = process.argv.slice(2);
const tools = join(process.env.TEMP, "srm-audit-tools");
const out = join(import.meta.dirname, "results", label); mkdirSync(out, { recursive: true });
const cli = join(tools, "node_modules/lighthouse/cli/index.js");
const summary = [];
for (const path of pathList.split(",")) for (const mode of modeList.split(",")) {
  const name = `${mode}${path.replace(/[\/#]/g, "_")}`;
  const file = join(out, name + ".json");
  const args = [cli, base + path, "--quiet", "--output=json", `--output-path=${file}`, "--only-categories=performance,accessibility,best-practices,seo", "--chrome-flags=--headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-certificate-errors=false", "--max-wait-for-load=60000"];
  if (mode === "desktop") args.push("--preset=desktop");
  try { execFileSync(process.execPath, args, { stdio: "ignore", timeout: 180000, env: { ...process.env, CHROME_PATH: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" } }); } catch {}
  if (!existsSync(file)) { console.log("NO RESULT", name); continue; }
  const r = JSON.parse(readFileSync(file, "utf8"));
  const a = r.audits; const s = (k) => Math.round((r.categories[k]?.score ?? 0) * 100);
  const row = { path, mode, perf: s("performance"), a11y: s("accessibility"), best: s("best-practices"), seo: s("seo"), fcp: a["first-contentful-paint"]?.numericValue, lcp: a["largest-contentful-paint"]?.numericValue, tbt: a["total-blocking-time"]?.numericValue, cls: a["cumulative-layout-shift"]?.numericValue, si: a["speed-index"]?.numericValue, kb: Math.round((a["total-byte-weight"]?.numericValue ?? 0) / 1024), requests: a["network-requests"]?.details?.items?.length,
    failed: Object.values(r.categories).flatMap((c) => c.auditRefs).map((x) => a[x.id]).filter((x) => x && x.score !== null && x.score < 0.9 && x.scoreDisplayMode !== "informative" && x.scoreDisplayMode !== "notApplicable" && x.scoreDisplayMode !== "manual").map((x) => x.id),
    runtimeError: r.runtimeError?.code };
  summary.push(row);
  console.log(`${name} perf ${row.perf} a11y ${row.a11y} best ${row.best} seo ${row.seo} LCP ${(row.lcp / 1000).toFixed(1)}s TBT ${Math.round(row.tbt)}ms CLS ${row.cls?.toFixed(3)} ${row.kb}KB ${row.requests}req`);
  writeFileSync(join(out, "summary.json"), JSON.stringify(summary, null, 1));
}
console.log("done");
