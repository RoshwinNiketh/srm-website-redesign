# srm-website-redesign
A modern, immersive redesign of the SRM Institute of Science and Technology website, featuring cinematic animations, interactive experiences, and responsive UI.

Run `npm run dev` and open `http://localhost:3000/`. Use the site navigation
to open Admissions. The prototype serves HTML, CSS, and JavaScript
directly through `server.mjs`; there is no separate production build.

The landing intro plays once per tab session. Use **Skip intro** or Escape to
continue immediately. The page bypasses the intro for visitors who prefer reduced
motion or follow a link directly to a section. To preview the intro again, open a
fresh tab or remove `srm-landing-intro-v1` from the tab's session storage.

- `landing-art.js` contains the editable SVG artwork and seeded crowd.
- `landing-intro.js` contains the 6.9 second timeline and responsive header handoff.
- `theme.css` defines the shared ivory palette and readable colors for text over photography.
- The shared navigation lives in `index.html`. It uses the supplied
  `assets/brand/srm-logo.png`, which the intro also uses for its handoff.

## SRM assistant

A chatbot, 3D campus guide and accessibility tools, powered by Gemini.

**Setup**

1. Copy `.env.example` to `.env` and paste your key after `GEMINI_API_KEY=`. `.env` is ignored by git.
2. Optional: run `npm run index:embed`, so questions match by meaning as well as by keyword. The free tier allows 1,000 embedding requests a day, so a full run takes two days. Run it again to carry on. Keyword search works until then. Re-run it whenever `npm run index` changes the content.
3. Run `npm run dev`. On Vercel, add `GEMINI_API_KEY` under Project Settings → Environment Variables.

**How it stays accurate**

- `knowledge/chunks.json` holds this site's pages plus the official pages listed in `docs/srmist-inner-pages.md`. The 3D panel's sample fees and degree lists are left out.
- Gemini only sees the passages retrieved for each question and must cite them.
- `assistant-server.mjs` rejects an answer that cites nothing, or that has a number, email or link missing from what it cites. The visitor then gets a fixed "I couldn't find that" reply.
- Destinations come from a fixed list in `assistant-intents.mjs`, so the assistant can't invent a link. Direct commands such as "take me to admissions" don't use the AI at all, and work without a key.

To refresh the content, run `npm run index:crawl`, `npm run index`, then `npm run index:embed`. Run `npm test` to check the rules above.

- `assistant.js` is the chat window, voice and display settings.
- `campus-guide.js` is the guide in the Pick a building section.
- Voice input needs a browser with speech recognition, such as Chrome or Edge. The browser's speech service handles the audio.

## Contributors

- OpenAI Codex assisted with the landing animation, shared theme, and campus explorer integration.
