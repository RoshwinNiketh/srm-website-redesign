// Usage: node flows.mjs <base url> <screenshot dir>. Runs real visitor flows and reports errors, CSP blocks and broken images.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
const [base, out] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const edge = spawn("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", ["--headless=new", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--remote-debugging-port=9345", `--user-data-dir=${process.env.TEMP}/edge-flows-${Date.now()}`, "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
let list; for (let i = 0; i < 40; i++) { try { list = await (await fetch("http://127.0.0.1:9345/json")).json(); if (list.length) break; } catch {} await sleep(300); }
const ws = new WebSocket(list.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const wait = new Map(); const logs = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id) { wait.get(d.id)?.(d); wait.delete(d.id); } else if (d.method === "Runtime.exceptionThrown") logs.push("EXC " + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text)); else if (d.method === "Runtime.consoleAPICalled" && d.params.type === "error") logs.push("CON " + d.params.args.map((a) => a.value || a.description).join(" ")); else if (d.method === "Log.entryAdded" && d.params.entry.level === "error") logs.push("LOG " + d.params.entry.text + " " + (d.params.entry.url || "")); else if (d.method === "Network.responseReceived" && d.params.response.status >= 400) logs.push(d.params.response.status + " " + d.params.response.url); };
const cmd = (method, params = {}) => new Promise((r) => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => { const r = await cmd("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); return r.result?.result?.value; };
const shot = async (name) => { const r = await cmd("Page.captureScreenshot", { format: "jpeg", quality: 60 }); writeFileSync(`${out}/${name}.jpg`, Buffer.from(r.result.data, "base64")); };
for (const d of ["Page", "Runtime", "Log", "Network"]) await cmd(d + ".enable");
const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok: !!ok, detail }); console.log(ok ? "PASS" : "FAIL", name, String(detail).slice(0, 150)); };
const go = async (path, ms = 2000) => { await cmd("Page.navigate", { url: "about:blank" }); await sleep(80); await cmd("Page.navigate", { url: base + path }); await sleep(ms); };
const broken = () => ev("JSON.stringify([...document.images].filter(i=>i.complete&&i.getAttribute('src')&&i.naturalWidth===0).map(i=>i.getAttribute('src')))");
const say = async (text) => { await ev(`(()=>{const i=document.querySelector('.srm-form textarea');i.value=${JSON.stringify(text)};document.querySelector('.srm-form').requestSubmit();})()`); for (let n = 0; n < 50; n++) { await sleep(400); if (await ev("!document.querySelector('.srm-typing')&&!!document.querySelector('.srm-message:last-child.srm-assistant')")) break; } return ev("[...document.querySelectorAll('.srm-message')].at(-1).innerText"); };
const tab = async () => { await cmd("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 }); await cmd("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 }); await sleep(200); };
const sizes = [["desktop", 1440, 900, false], ["phone", 390, 844, true]].filter(([tag]) => !process.env.ONLY || process.env.ONLY === tag);
for (const [tag, width, height, mobile] of sizes) {
  console.log("==", tag);
  await cmd("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await go("/about", 400); await ev("sessionStorage.clear();localStorage.clear()");
  // landing intro
  await go("/", 1500);
  check(`${tag} intro plays`, await ev("!!document.querySelector('.landing-intro')"));
  await shot(`${tag}-intro`);
  await sleep(8000);
  check(`${tag} intro ends and page shows`, await ev("!document.querySelector('.landing-intro')&&!document.documentElement.classList.contains('intro-pending')"));
  await shot(`${tag}-home`);
  const heroSrc = await ev("document.querySelector('.hero-media img').currentSrc");
  check(`${tag} hero offers sized images`, heroSrc.includes("campus-aerial") && (await ev("document.querySelector('.hero-media img').hasAttribute('srcset')")), heroSrc);
  check(`${tag} 3D engine waits until needed`, !(await ev("performance.getEntriesByType('resource').some(r=>r.name.includes('campus3d'))")));
  if (!mobile && await ev("!!document.querySelector('.hero-marker')")) {
    await ev("document.querySelector('.hero-marker').click()"); await sleep(600);
    check(`${tag} journey image loads on demand`, await ev("document.querySelector('#journey-image').currentSrc.includes('archgate')"));
    await sleep(1500);
    check(`${tag} school dialog opens`, await ev("document.querySelector('#school-dialog').open"));
    await sleep(800);
    check(`${tag} dialog image shows`, await ev("document.querySelector('#destination-image').naturalWidth>0"));
    await shot(`${tag}-dialog`);
    await ev("document.querySelector('.close-dialog').click()"); await sleep(300);
  }
  await ev("const a=document.querySelector('.site-search input');a.value='hostels';a.dispatchEvent(new Event('input',{bubbles:true}))"); await sleep(200);
  check(`${tag} site search shows results`, await ev("document.querySelectorAll('.search-results li').length>0"));
  await ev("const a=document.querySelector('.site-search input');a.value='';a.dispatchEvent(new Event('input',{bubbles:true}))");
  // chat with live Gemini
  await ev("document.querySelector('.srm-launcher').click()"); await sleep(300);
  const answer = await say("Where can students stay on campus?");
  check(`${tag} live chat answers with source`, /hostel/i.test(answer) && /From:/.test(answer), answer.replace(/\s+/g, " "));
  await shot(`${tag}-chat`);
  const refusal = await say("Who won the 2023 cricket world cup?");
  check(`${tag} live chat refuses off-topic`, /won't guess/.test(refusal), refusal.replace(/\s+/g, " "));
  const summary = await say("Summarise this page");
  check(`${tag} page summary works`, /summary/i.test(summary), summary.replace(/\s+/g, " "));
  await say("make the text bigger"); check(`${tag} text size command`, await ev("document.documentElement.dataset.a11yText==='1'"));
  await say("high contrast"); check(`${tag} contrast command`, await ev("document.documentElement.dataset.a11yContrast==='on'")); await shot(`${tag}-contrast`);
  await say("reset display settings");
  await say("take me to contact page"); await sleep(2000);
  check(`${tag} navigation command`, (await ev("location.pathname")) === "/contact");
  check(`${tag} chat stays open after navigation`, await ev("!document.querySelector('.srm-chat').hidden"));
  await shot(`${tag}-contact`);
  await ev("document.querySelector('[aria-label=\"Close assistant\"]').click()");
  // 3D campus
  await go("/#campus", 1000);
  let sceneWait = 1000;
  while (sceneWait < 45000 && (await ev("document.querySelectorAll('.pin').length")) !== 5) { await sleep(500); sceneWait += 500; }
  console.log(tag, "3D scene ready after", sceneWait, "ms");
  check(`${tag} lands on the 3D section`, Math.abs(await ev("document.querySelector('.campus-stage').getBoundingClientRect().top")) < 3);
  check(`${tag} 3D scene built from the bundle`, (await ev("document.querySelectorAll('.pin').length")) === 5, await ev("document.documentElement.className"));
  await shot(`${tag}-campus`);
  await ev("document.querySelector('.pin[data-school=law]').click()");
  for (let n = 0; n < 40; n++) { await sleep(500); if (await ev("!document.querySelector('#building-panel').hidden")) break; }
  check(`${tag} flight reaches the building`, (await ev("document.querySelector('#panel-title').textContent")) === "Law");
  await sleep(2500); await shot(`${tag}-building`);
  check(`${tag} guide describes it`, /Law/.test(await ev("document.querySelector('.guide-text').textContent")));
  // every page
  for (const path of ["/admissions", "/academics", "/campus-life", "/research", "/about", "/contact", "/more"]) {
    await go(path, 1200);
    await ev("(async()=>{const h=document.documentElement.scrollHeight;for(let y=0;y<h;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,70))}scrollTo(0,0)})()"); await sleep(600);
    const bad = JSON.parse(await broken());
    check(`${tag} ${path} images ok, no sideways scroll`, !bad.length && (await ev("document.documentElement.scrollWidth-innerWidth")) <= 0, bad.join());
    if (path === "/admissions" || path === "/research") await shot(`${tag}-${path.slice(1)}`);
  }
  await go("/research", 1000);
  await tab();
  check(`${tag} skip link is first and visible`, await ev("document.activeElement.className==='skip-link'&&document.activeElement.getBoundingClientRect().top>=0"));
  await shot(`${tag}-skiplink`);
  await cmd("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r" }); await cmd("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 }); await sleep(300);
  check(`${tag} skip link moves focus to main`, (await ev("document.activeElement.tagName")) === "MAIN", await ev("document.activeElement.tagName"));
}
const unique = [...new Set(logs)];
check("no errors, CSP blocks or failed requests", !unique.length, unique.join(" || "));
writeFileSync(`${out}/flows.json`, JSON.stringify({ results, logs: unique }, null, 1));
console.log(`\n${results.filter((r) => r.ok).length} of ${results.length} passed`);
ws.close(); edge.kill(); process.exit(0);
