# SRMIST website redesign

A responsive prototype for SRM Institute of Science and Technology. The homepage opens with an illustrated student journey and leads into an interactive 3D campus explorer. The site includes programme, student, examinations, international, campus, news, disclosures and support directories. Admissions and student transactions link to official SRMIST services.

## Run locally

Use Node.js 22.19 or newer.

```sh
npm run dev
```

Open [localhost:3000](http://localhost:3000). The local server renders the shared navigation and serves only allowlisted browser assets and assistant endpoints. The site and direct navigation commands work without an API key.

```sh
npm test
npm run build
```

The build exports 18 HTML pages and their browser assets to `dist/`. Vercel uses `npm run build`, serves clean page URLs from `dist/`, and runs the assistant endpoints from `api/`.

## Homepage and inner pages

The landing intro plays once per tab session. Visitors can skip it with the **Skip intro** button or Escape. It also bypasses playback when reduced motion is enabled or when visitors open a direct section link. Open a fresh tab to replay it.

- `landing-art.js` contains the editable SVG artwork and seeded crowd. `landing-intro.js` controls playback and the handoff to the header logo.
- `campus-explorer.js` runs the interactive 3D campus viewer, and `campus-guide.js` connects it to the assistant.
- `render-pages.mjs` renders the shared header and inner pages. `university-directory.mjs` and `site-services.mjs` define navigation, public services and their source links. Search and the A–Z directory use those records.
- `theme.css` defines the shared ivory palette. `assets/brand/` contains the header logo and emblem favicon.

## Gemini assistant

1. Copy `.env.example` to `.env` and set `GEMINI_API_KEY`. Git ignores `.env`.
2. Start the local server with `npm run dev`.

Hosted AI is disabled by default. Before setting `SRM_ENABLE_PUBLIC_AI=true` in a hosted environment, configure a shared edge request limit for both assistant endpoints, set a provider spend cap and verify the final response headers. The app's in-process limits do not cover multiple instances. Keep the Gemini key server-side. Preview pages are marked noindex.

The assistant retrieves passages from `knowledge/chunks.json` and checks generated answers against their cited material. Direct commands such as “take me to admissions” use the fixed destinations in `assistant-intents.mjs`. Voice input depends on the browser’s speech recognition support.

To refresh the knowledge index, run `npm run index:crawl` and then `npm run index`. Optionally run `npm run index:embed` to add semantic search. Keyword retrieval works without embeddings. The source inventory is in [docs/srmist-inner-pages.md](docs/srmist-inner-pages.md).

## Contributors

OpenAI Codex assisted with the landing animation, shared theme, and campus explorer integration.
