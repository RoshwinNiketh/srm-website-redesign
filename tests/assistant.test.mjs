import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { parseCommand, ROUTES } from "../assistant-intents.mjs";
import { answerQuestion, clientIp, handle, NOT_FOUND, retrieve, transformPage, ungroundedFacts } from "../assistant-server.mjs";
import { readFileSync } from "node:fs";

/* ---------- security ---------- */
const JSON_TYPE = "application/json";
test("rejects requests that aren't JSON", async () => {
  assert.equal((await handle("chat", { message: "hi" }, { contentType: "text/plain" })).status, 415);
});
test("rejects other websites", async () => {
  assert.equal((await handle("chat", { message: "hi" }, { contentType: JSON_TYPE, origin: "https://evil.example", host: "srm.example" })).status, 403);
});
test("rejects bodies that aren't objects", async () => {
  assert.equal((await handle("chat", ["x"], { contentType: JSON_TYPE })).status, 400);
});
test("rate limits one visitor", async () => {
  let last;
  const saved = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  for (let i = 0; i < 21; i++) last = await handle("chat", { message: "hi" }, { contentType: JSON_TYPE, ip: "9.9.9.9" });
  if (saved) process.env.GEMINI_API_KEY = saved;
  assert.equal(last.status, 429);
});
test("ignores a forged forwarding header", () => {
  assert.equal(clientIp({ "x-forwarded-for": "1.1.1.1", "x-real-ip": "2.2.2.2" }), "2.2.2.2");
});
test("production sends the security headers", () => {
  const rule = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8")).headers[0];
  const keys = rule.headers.map((header) => header.key);
  for (const key of ["Content-Security-Policy", "Strict-Transport-Security", "X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy"]) assert.ok(keys.includes(key), key);
});

/* ---------- commands ---------- */
const commands = [
  ["take me to admissions page", { type: "navigate", route: "admissions" }],
  ["Take me to admission", { type: "navigate", route: "admissions" }],
  ["please open the contact page", { type: "navigate", route: "contact" }],
  ["go to research", { type: "navigate", route: "research" }],
  ["open the alumni page", { type: "navigate", route: "more" }],
  ["admissions", { type: "navigate", route: "admissions" }],
  ["open the hostels page", { type: "navigate", route: "hostels" }],
  ["show me the law school", { type: "campus", school: "law" }],
  ["fly me to the engineering building", { type: "campus", school: "engineering" }],
  ["where is the medical college", { type: "campus", school: "medical" }],
  ["make the text bigger", { type: "display", action: "text-larger" }],
  ["high contrast please", { type: "display", action: "contrast-on" }],
  ["stop the animations", { type: "display", action: "motion-off" }],
  ["read this page", { type: "read" }],
  ["stop", { type: "stop" }],
  ["simplify this page", { type: "simplify" }],
  ["Summarise this page", { type: "summary" }],
  ["scroll down", { type: "scroll", direction: 1 }],
];
for (const [text, expected] of commands) {
  test(`command: ${text}`, () => assert.deepEqual(parseCommand(text), expected));
}

for (const text of [
  "What are the fees for law?",
  "show me the fees for law",
  "how do I apply for an MBA",
  "where can students stay?",
  "hostels",
  "who won the world cup",
]) {
  test(`goes to the AI, not a command: ${text}`, () => assert.equal(parseCommand(text), null));
}

test("every destination is on this site or an official SRM address", () => {
  for (const route of ROUTES) assert.match(route.href, /^\/|^https:\/\/([\w-]+\.)*srmist\.edu\.in\//, route.id);
});

/* ---------- retrieval ---------- */
test("retrieval finds the right page", async () => {
  const hits = await retrieve("how do I contact admissions by email");
  assert.ok(hits.some((chunk) => chunk.text.includes("admissions.india@srmist.edu.in")));
});

test("sample fees are not in the knowledge base", async () => {
  const { readFileSync } = await import("node:fs");
  const raw = readFileSync(new URL("../knowledge/chunks.json", import.meta.url), "utf8");
  for (const fee of ["₹4,50,000", "₹3,00,000", "₹1,50,000", "₹2,50,000", "₹2,00,000"]) {
    assert.equal(raw.includes(`"route":"/`) && JSON.parse(raw).filter((c) => c.route).some((c) => c.text.includes(fee)), false, fee);
  }
});

/* ---------- grounding ---------- */
test("facts missing from the source are caught", () => {
  const source = "The university lists +91 44 27417000 and admissions.india@srmist.edu.in. Status in 2002.";
  assert.deepEqual(ungroundedFacts("Call +91 44 27417000 or email admissions.india@srmist.edu.in.", source), []);
  assert.deepEqual(ungroundedFacts("It became a university in 2002.", source), []);
  assert.equal(ungroundedFacts("Tuition is ₹4,50,000 a year.", source).length, 1);
  assert.equal(ungroundedFacts("Email help@srmist.edu.in.", source).length, 1);
  assert.equal(ungroundedFacts("It opened in 1985.", source).length, 1);
});

/* ---------- full flow against a stand-in for Gemini ---------- */
let mock;
let nextReply;
let lastRequest;
before(async () => {
  mock = createServer((request, response) => {
    let body = "";
    request.on("data", (part) => (body += part));
    request.on("end", () => {
      const parsed = JSON.parse(body);
      // Search requests fall back to keyword matching, which these tests rely on.
      if (!parsed.contents) {
        response.writeHead(404);
        response.end("{}");
        return;
      }
      lastRequest = { url: request.url, key: request.headers["x-goog-api-key"], body: parsed };
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(nextReply(lastRequest)) }] } }] }));
    });
  });
  await new Promise((done) => mock.listen(0, "127.0.0.1", done));
  process.env.GEMINI_BASE_URL = `http://127.0.0.1:${mock.address().port}/v1beta`;
  process.env.GEMINI_API_KEY = "test-key";
  process.env.GEMINI_MODEL = "test-model";
});
after(() => mock.close());

const idFor = (request, needle) => {
  const text = request.body.contents[0].parts[0].text;
  const blocks = [...text.matchAll(/<source id="([^"]+)"[^>]*>\n([\s\S]*?)\n<\/source>/g)];
  return blocks.find(([, , body]) => body.includes(needle))?.[1];
};

test("a grounded answer comes back with its source link", async () => {
  nextReply = (request) => ({ found: true, answer: "Email admissions.india@srmist.edu.in.", source_ids: [idFor(request, "admissions.india@srmist.edu.in")], action: "none", action_value: "" });
  const result = await answerQuestion({ message: "how do I email admissions?", page: "/contact" });
  assert.equal(result.grounded, true);
  assert.ok(result.sources.some((source) => source.url === "/contact"));
  assert.equal(lastRequest.key, "test-key");
  assert.match(lastRequest.url, /test-model:generateContent/);
});

test("the model saying not found gives the fixed reply", async () => {
  nextReply = () => ({ found: false, answer: "", source_ids: [], action: "none", action_value: "" });
  assert.equal((await answerQuestion({ message: "who won the cricket world cup" })).answer, NOT_FOUND);
});

test("an invented fee is blocked even when the model cites a source", async () => {
  nextReply = (request) => ({ found: true, answer: "Tuition is ₹9,99,999 a year.", source_ids: [idFor(request, "admissions.india@srmist.edu.in")], action: "none", action_value: "" });
  const result = await answerQuestion({ message: "email admissions about tuition fees" });
  assert.equal(result.answer, NOT_FOUND);
  assert.equal(result.grounded, false);
});

test("an answer citing no real source is blocked", async () => {
  nextReply = () => ({ found: true, answer: "SRM is the best.", source_ids: ["made-up-id"], action: "none", action_value: "" });
  assert.equal((await answerQuestion({ message: "is the library good" })).answer, NOT_FOUND);
});

test("a made-up navigation target is ignored", async () => {
  nextReply = () => ({ found: false, answer: "", source_ids: [], action: "navigate", action_value: "https://evil.example" });
  const result = await answerQuestion({ message: "I would love to look at that one thing" });
  assert.equal(result.action, undefined);
  assert.equal(result.answer, NOT_FOUND);
});

test("a listed navigation target from the model works", async () => {
  nextReply = () => ({ found: true, answer: "Okay.", source_ids: [], action: "navigate", action_value: "contact" });
  assert.deepEqual((await answerQuestion({ message: "I need to speak to somebody there" })).action, { type: "navigate", route: "contact" });
});

test("simplify is blocked if it adds a number", async () => {
  nextReply = () => ({ sections: [{ heading: "Fees", text: "It costs 12345 rupees." }] });
  const result = await transformPage({ page: "/contact", mode: "simplify" });
  assert.equal(result.ok, false);
});

test("simplify works when it stays with the page", async () => {
  nextReply = () => ({ sections: [{ heading: "Call", text: "Call +91 44 27417000." }] });
  const result = await transformPage({ page: "/contact", mode: "simplify" });
  assert.equal(result.ok, true);
});

test("without a key it says so instead of inventing an answer", async () => {
  const key = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  const result = await answerQuestion({ message: "what is SCIF" });
  process.env.GEMINI_API_KEY = key;
  assert.equal(result.ok, false);
  assert.equal(result.code, "no_key");
});
