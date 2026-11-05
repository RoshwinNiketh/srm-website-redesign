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
