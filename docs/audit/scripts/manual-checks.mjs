// Usage: node manual-checks.mjs <label> <base url> [port]. Checks automated scanners miss.
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const [label, base, port = "9341"] = process.argv.slice(2);
const out = join(import.meta.dirname, "results", label); mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", ["--headless=new", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", `--remote-debugging-port=${port}`, `--user-data-dir=${process.env.TEMP}/edge-manual-${label}`, "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
let list; for (let i = 0; i < 40; i++) { try { list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (list.length) break; } catch {} await sleep(300); }
const ws = new WebSocket(list.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const wait = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id) { wait.get(d.id)?.(d); wait.delete(d.id); } };
const cmd = (method, params = {}) => new Promise((r) => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => { const r = await cmd("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); return r.result?.result?.value; };
await cmd("Page.enable"); await cmd("Runtime.enable");
const results = { small: {}, headings: {}, targets: {}, keyboard: {}, reflow: {}, photoContrast: [], meta: {} };

const pages = ["/#home", "/admissions", "/academics", "/campus-life", "/research", "/about", "/contact", "/more"];
const open = async (path, ms = 1500) => { await cmd("Page.navigate", { url: "about:blank" }); await sleep(80); await cmd("Page.navigate", { url: base + path }); await sleep(ms); };

await cmd("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
for (const path of pages) {
  await open(path);
  await ev("(async()=>{const h=document.documentElement.scrollHeight;for(let y=0;y<h;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,80))}scrollTo(0,0)})()"); await sleep(500);
  results.small[path] = JSON.parse(await ev(`JSON.stringify((()=>{const m=new Map();const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(w.nextNode()){const t=w.currentNode.textContent.trim();if(t.length<3)continue;const e=w.currentNode.parentElement;if(!e||e.closest('script,style,[hidden],[aria-hidden="true"]'))continue;const c=getComputedStyle(e);if(c.display==='none'||c.visibility==='hidden')continue;const r=e.getBoundingClientRect();if(!r.width)continue;const s=parseFloat(c.fontSize);const w8=parseInt(c.fontWeight);if(s<14||(w8<400&&s<24)){const k=s+'px/'+w8;m.set(k,(m.get(k)||[]).concat(t.slice(0,32)))}}return [...m].map(([k,v])=>[k,v.length,v.slice(0,3)])})())`));
  results.headings[path] = JSON.parse(await ev(`JSON.stringify([...document.querySelectorAll('main h1,main h2,main h3,main h4')].filter(h=>h.getClientRects().length).map(h=>h.tagName+':'+h.textContent.trim().slice(0,28)))`));
  results.meta[path] = await ev(`JSON.stringify({title:document.title,desc:(document.querySelector('meta[name=description]')||{}).content||null,lang:document.documentElement.lang,skip:!!document.querySelector('a[href^="#"].skip-link'),imgNoAlt:[...document.images].filter(i=>!i.hasAttribute('alt')).length,imgNoSize:[...document.images].filter(i=>!i.getAttribute('width')).map(i=>i.getAttribute('src')).slice(0,6)})`);
  // keyboard: tab through, record focus visibility
  await ev("document.activeElement.blur();scrollTo(0,0)");
  const seq = [];
  for (let i = 0; i < 26; i++) {
    await cmd("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 }); await cmd("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
    seq.push(JSON.parse(await ev(`JSON.stringify((()=>{const e=document.activeElement;if(!e||e===document.body)return{n:'body'};const c=getComputedStyle(e);const ring=(c.outlineStyle!=='none'&&parseFloat(c.outlineWidth)>0)||c.boxShadow!=='none'||!!e.closest(':focus-within form');return{n:(e.tagName+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:'')+':'+(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,22)),ring}})())`)));
  }
  results.keyboard[path] = { noRing: [...new Set(seq.filter((s) => s.n !== "body" && !s.ring).map((s) => s.n))], first: seq.slice(0, 3).map((s) => s.n) };
}

await cmd("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
for (const path of pages) {
  await open(path);
  results.targets[path] = JSON.parse(await ev(`JSON.stringify([...document.querySelectorAll('a,button,input,summary,select,textarea,[role=tab]')].filter(e=>{if(e.closest('[hidden],[aria-hidden="true"]'))return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.height<24||r.width<24)}).map(e=>{const r=e.getBoundingClientRect();return (e.getAttribute('aria-label')||e.textContent||e.tagName).trim().slice(0,24)+' '+Math.round(r.width)+'x'+Math.round(r.height)}).slice(0,10))`));
}
await cmd("Emulation.setDeviceMetricsOverride", { width: 320, height: 640, deviceScaleFactor: 1, mobile: true });
for (const path of pages) { await open(path, 900); results.reflow[path] = await ev("document.documentElement.scrollWidth-innerWidth"); }

// contrast of text over photographs: hide the text, read the pixels behind it
const scratch = join(out, "contrast"); mkdirSync(scratch, { recursive: true });
const checks = [
  ["/#home", 1440, 900, [".hero-content h1", ".hero-motto", ".hero-content p:last-of-type", ".hero-caption", ".scroll-cue", ".sound-button", ".hero-bottom"]],
  ["/#home", 390, 844, [".hero-content h1", ".hero-motto", ".hero-content p:last-of-type", ".hero-caption", ".scroll-cue", ".sound-button", ".hero-bottom"]],
  ["/#campus", 1440, 900, [".campus-intro h2", ".campus-hint", ".campus-intro .eyebrow"]],
  ["/#campus", 390, 844, [".campus-intro h2", ".campus-hint", ".campus-intro .eyebrow"]],
];
const lum = (r, g, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
for (const [path, width, height, selectors] of checks) {
  await cmd("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 500 });
  await open(path, path.includes("campus") ? 8000 : 2000);
  for (const selector of selectors) {
    await ev("document.querySelector('.srm-launcher')?.style.setProperty('visibility','hidden');document.querySelector('.campus-guide')?.style.setProperty('visibility','hidden')");
    const info = JSON.parse(await ev(`JSON.stringify((()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;const r=e.getBoundingClientRect();if(!r.width)return null;const c=getComputedStyle(e);return{sy:scrollY,x:r.x,y:r.y,w:r.width,h:r.height,color:c.color,size:parseFloat(c.fontSize),weight:parseInt(c.fontWeight),shadow:c.textShadow!=='none'}})())`) || "null");
    if (!info || info.y + info.h > height || info.y < 0) continue;
    await ev(`(()=>{const s=document.createElement('style');s.id='__hide';s.textContent=${JSON.stringify(selector)}+',' + ${JSON.stringify(selector)}+' *{color:transparent!important;text-shadow:none!important;border-color:transparent!important;fill:transparent!important;stroke:transparent!important}';document.head.append(s)})()`);
    await sleep(60);
    const shot = await cmd("Page.captureScreenshot", { format: "png", clip: { x: info.x, y: info.y + info.sy, width: info.w, height: info.h, scale: 1 } });
    await ev("document.getElementById('__hide').remove()");
    const file = join(scratch, `${width}-${selector.replace(/[^a-z0-9]/gi, "_")}.png`); writeFileSync(file, Buffer.from(shot.result.data, "base64"));
    const stats = execFileSync("python", ["-c", `from PIL import Image;import sys
im=Image.open(sys.argv[1]).convert('RGB');px=list(im.getdata());f=lambda v:(v/255/12.92 if v/255<=0.03928 else ((v/255+0.055)/1.055)**2.4)
L=sorted(0.2126*f(r)+0.7152*f(g)+0.0722*f(b) for r,g,b in px);print(L[len(L)//2],L[int(len(L)*0.95)],L[int(len(L)*0.05)])`, file], { encoding: "utf8" }).trim().split(" ").map(Number);
    const [r, g, b] = info.color.match(/\d+/g).map(Number);
    const fg = lum(r, g, b);
    const ratio = (a, c) => (Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05);
    const worst = Math.min(ratio(fg, stats[1]), ratio(fg, stats[2]));
    results.photoContrast.push({ width, selector, size: info.size, weight: info.weight, typical: +ratio(fg, stats[0]).toFixed(2), worst: +worst.toFixed(2), large: info.size >= 24 || (info.size >= 18.66 && info.weight >= 700) });
  }
}
writeFileSync(join(out, "manual.json"), JSON.stringify(results, null, 1));
console.log("photo contrast"); results.photoContrast.forEach((c) => console.log(` ${c.width} ${c.selector} ${c.size}px typical ${c.typical} worst ${c.worst} ${c.worst < (c.large ? 3 : 4.5) ? "FAIL" : "ok"}`));
console.log("small text"); for (const [p, v] of Object.entries(results.small)) console.log(" ", p, JSON.stringify(v).slice(0, 300));
console.log("headings"); for (const [p, v] of Object.entries(results.headings)) console.log(" ", p, v.map((x) => x.split(":")[0]).join(" "));
console.log("keyboard"); for (const [p, v] of Object.entries(results.keyboard)) console.log(" ", p, "first:", v.first.join(" > ").slice(0, 80), "| no ring:", v.noRing.join(", ").slice(0, 200));
console.log("targets<24"); for (const [p, v] of Object.entries(results.targets)) console.log(" ", p, v.join(", ").slice(0, 200));
console.log("reflow 320", JSON.stringify(results.reflow));
console.log("meta"); for (const [p, v] of Object.entries(results.meta)) console.log(" ", p, v.slice(0, 260));
ws.close(); edge.kill(); process.exit(0);
