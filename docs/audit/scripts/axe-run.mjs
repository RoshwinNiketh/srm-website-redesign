// Usage: node axe-run.mjs <label> <base url> [cdp port]
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const [label, base, port = "9340"] = process.argv.slice(2);
const out = join(import.meta.dirname, "results", label); mkdirSync(out, { recursive: true });
const axeSource = readFileSync(join(process.env.TEMP, "srm-audit-tools/node_modules/axe-core/axe.min.js"), "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", ["--headless=new", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", `--remote-debugging-port=${port}`, `--user-data-dir=${process.env.TEMP}/edge-axe-${label}`, "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
let list; for (let i = 0; i < 40; i++) { try { list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (list.length) break; } catch {} await sleep(300); }
const ws = new WebSocket(list.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const wait = new Map(); const logs = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id) { wait.get(d.id)?.(d); wait.delete(d.id); } else if (d.method === "Runtime.exceptionThrown") logs.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text); else if (d.method === "Runtime.consoleAPICalled" && d.params.type === "error") logs.push(d.params.args.map((a) => a.value || a.description).join(" ")); else if (d.method === "Log.entryAdded" && d.params.entry.level === "error") logs.push(d.params.entry.text + " " + (d.params.entry.url || "")); };
const cmd = (method, params = {}) => new Promise((r) => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => { const r = await cmd("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); return r.result?.result?.value; };
for (const d of ["Page", "Runtime", "Log"]) await cmd(d + ".enable");
await cmd("Page.addScriptToEvaluateOnNewDocument", { source: axeSource });
const scan = `axe.run(document,{resultTypes:['violations','incomplete']}).then(r=>JSON.stringify({v:r.violations.map(x=>({id:x.id,impact:x.impact,help:x.help,count:x.nodes.length,targets:x.nodes.slice(0,6).map(n=>({t:n.target.join(' '),s:(n.any[0]&&n.any[0].message)||''}))})),i:r.incomplete.filter(x=>x.id==='color-contrast').map(x=>({id:x.id,count:x.nodes.length}))}))`;
const all = [];
const states = [
  ["home", "/#home", null],
  ["home+chat", "/#home", "document.querySelector('.srm-launcher').click()"],
  ["home+a11y panel", "/#home", "document.querySelector('.srm-launcher').click();document.querySelector('[aria-label=\"Accessibility options\"]').click()"],
  ["campus", "/#campus", null],
  ["admissions", "/admissions", null],
  ["academics", "/academics", null],
  ["campus-life", "/campus-life", null],
  ["research", "/research", null],
  ["about", "/about", null],
  ["contact", "/contact", null],
  ["more", "/more", null],
];
for (const [mode, width, height, mobile] of [["desktop", 1440, 900, false], ["mobile", 390, 844, true]]) {
  await cmd("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  for (const [name, path, action] of states) {
    await cmd("Page.navigate", { url: "about:blank" }); await sleep(100);
    await cmd("Page.navigate", { url: base + path }); await sleep(name === "campus" ? 7000 : 1800);
    await ev("try{sessionStorage.removeItem('srm-assistant')}catch{}");
    if (name !== "campus" && !name.includes("+")) { await ev("(async()=>{const h=document.documentElement.scrollHeight;for(let y=0;y<h;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,120))}scrollTo(0,0)})()"); await sleep(1000); }
    if (action) { await ev(action); await sleep(400); }
    const res = JSON.parse(await ev(scan) || '{"v":[],"i":[]}');
    all.push({ mode, name, violations: res.v, needsReview: res.i });
    console.log(mode, name, res.v.map((x) => `${x.id}(${x.impact},${x.count})`).join(" ") || "none", res.i.length ? `| review contrast ${res.i[0].count}` : "");
  }
}
writeFileSync(join(out, "axe.json"), JSON.stringify(all, null, 1));
console.log("CONSOLE", JSON.stringify([...new Set(logs)].slice(0, 20)));
ws.close(); edge.kill(); process.exit(0);
