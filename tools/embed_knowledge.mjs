// Adds meaning-based search to the index, so "where do students stay?" finds the
// hostel pages. Needs GEMINI_API_KEY in .env. Run: npm run index:embed
// Saves as it goes. If the free daily limit is reached, run it again later to
// carry on. Passages not done yet are still found by keyword search.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { EMBED_MODEL } from "../assistant-server.mjs";

const root = join(import.meta.dirname, "..");
if (existsSync(join(root, ".env"))) process.loadEnvFile(join(root, ".env"));
if (!process.env.GEMINI_API_KEY) {
  console.error("Add GEMINI_API_KEY to .env first.");
  process.exit(1);
}

const DIM = 256;
const BATCH = 20;
const WAIT_MS = 15000;
const binPath = join(root, "knowledge/embeddings.bin");
const metaPath = join(root, "knowledge/embeddings.json");
const raw = readFileSync(join(root, "knowledge/chunks.json"), "utf8");
const chunks = JSON.parse(raw);
const hash = createHash("sha1").update(raw).digest("hex");
const base = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

const output = new Float32Array(chunks.length * DIM);
let start = 0;
if (existsSync(metaPath)) {
  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  if (meta.hash === hash && meta.dim === DIM) {
    const bytes = readFileSync(binPath);
    output.set(new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)));
    start = meta.done;
    console.log(`Carrying on from ${start}`);
  }
}

function save(done) {
  writeFileSync(binPath, Buffer.from(output.buffer));
  writeFileSync(metaPath, JSON.stringify({ model: EMBED_MODEL, dim: DIM, count: chunks.length, done, hash }));
}

for (; start < chunks.length; start += BATCH) {
  const batch = chunks.slice(start, start + BATCH);
  const body = {
    requests: batch.map((chunk) => ({
      model: `models/${EMBED_MODEL}`,
      content: { parts: [{ text: `${chunk.section}. ${chunk.text}` }] },
      taskType: "RETRIEVAL_DOCUMENT",
      title: chunk.title,
      outputDimensionality: DIM,
    })),
  };
  let response;
  for (let attempt = 0; attempt < 4; attempt++) {
    response = await fetch(`${base}/models/${EMBED_MODEL}:batchEmbedContents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify(body),
    });
    if (response.status !== 429 && response.status < 500) break;
    console.log(`Waiting for the rate limit (${response.status})`);
    await sleep(65000);
  }
  if (!response.ok) {
    const detail = await response.text();
    console.error(`Stopped at ${start} of ${chunks.length}: ${response.status}`);
    console.error(detail.match(/Quota exceeded[^\\"]*/)?.[0] || detail.slice(0, 300));
    process.exit(1);
  }
  const { embeddings } = await response.json();
  embeddings.forEach(({ values: full }, i) => {
    // Shortened vectors must be rescaled, and a longer reply must not overrun the file.
    const values = full.slice(0, DIM);
    const length = Math.hypot(...values) || 1;
    values.forEach((value, d) => { output[(start + i) * DIM + d] = value / length; });
  });
  save(Math.min(start + BATCH, chunks.length));
  console.log(`${Math.min(start + BATCH, chunks.length)} of ${chunks.length}`);
  await sleep(WAIT_MS);
}
console.log("Finished");
