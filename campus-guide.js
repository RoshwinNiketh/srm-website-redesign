// The guide inside the home page's "Pick a building" 3D section. Describes each
// school using the Academics page text, so it has one source of truth.
import { findSchool, parseCommand, SCHOOLS } from "/assistant-intents.mjs";
import { pages } from "/site-pages.mjs";
import { askServer, canListen, listen, openChat, PENDING_SCHOOL, runCommand, speak, visitBuilding } from "/assistant.js";

const stage = document.querySelector(".campus-stage");
if (stage) {
  const decode = (html) => {
    const box = document.createElement("textarea");
    box.innerHTML = html;
    return box.value;
  };
  const TOPICS = { engineering: 0, medical: 1, arts: 2, management: 3, law: 4 };
  const describe = (key) => decode(pages["/academics"].topics[TOPICS[key]][1]);
  const HELLO = "Hi, I'm your campus guide. Tell me where to go and I'll fly you there.";

  const guide = document.createElement("aside");
  guide.className = "campus-guide";
  guide.setAttribute("aria-label", "Campus guide");
  guide.innerHTML = `
    <button type="button" class="guide-toggle" aria-expanded="true">
      <img src="/assets/brand/srm-emblem.png" alt="" width="32" height="32" loading="lazy" decoding="async" />
      <span>Campus guide</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>
    </button>
    <div class="guide-body">
      <p class="guide-text" role="status"></p>
      <div class="guide-links"></div>
      <form class="guide-form">
        <input type="text" maxlength="300" aria-label="Ask the campus guide" placeholder="“Take me to the law school”" />
        <button type="button" class="guide-mic" aria-label="Speak to the guide" aria-pressed="false" title="Speak to the guide">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>
        </button>
        <button type="submit" class="guide-send" aria-label="Send" title="Send">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
      </form>
    </div>`;
  stage.append(guide);

  const text = guide.querySelector(".guide-text");
  const links = guide.querySelector(".guide-links");
  const form = guide.querySelector(".guide-form");
  const input = form.querySelector("input");
  const mic = form.querySelector(".guide-mic");
  const toggle = guide.querySelector(".guide-toggle");
  let spokenInput = false;

  function say(message, options = {}) {
    text.textContent = message;
    links.replaceChildren(...(options.links || []));
    if (spokenInput) speak(message);
    spokenInput = false;
  }

  function linkButton(label, run) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", run);
    return button;
  }

  function sourceLink(source) {
    const link = document.createElement("a");
    link.href = source.url;
    link.textContent = source.title;
    if (!source.url.startsWith("/")) {
      link.target = "_blank";
      link.rel = "noopener";
    }
    return link;
  }

  function setOpen(open) {
    guide.classList.toggle("collapsed", !open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  function fly(key) {
    setOpen(true);
    say(`Flying to ${SCHOOLS[key].name}.`);
    visitBuilding(key);
  }

  async function handle(raw) {
    const message = raw.trim();
    if (!message) return;
    input.value = "";
    const school = findSchool(message);
    if (school) return fly(school);
    const command = parseCommand(message);
    if (command?.type === "campus") return fly(command.school);
    if (command?.type === "simplify" || command?.type === "summary") return openChat(message);
    if (command) return say(runCommand(command).text);
    say("Let me check SRM's website…");
    const result = await askServer(message);
    if (!result.ok) return say(result.error || "Something went wrong. Please try again.");
    if (result.action?.type === "campus") return fly(result.action.school);
    if (result.action) return say(runCommand(result.action).text);
    say(result.answer, { links: (result.sources || []).map(sourceLink) });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    handle(input.value);
  });
  toggle.addEventListener("click", () => setOpen(guide.classList.contains("collapsed")));
  guide.addEventListener("keydown", (event) => {
    // Escape belongs to the input here, not to leaving the building.
    if (event.key === "Escape" && input.value) {
      event.stopPropagation();
      input.value = "";
    }
  });

  if (canListen) {
    let recognition = null;
    mic.addEventListener("click", () => {
      if (recognition) return recognition.stop();
      mic.setAttribute("aria-pressed", "true");
      recognition = listen({
        onText: (heard) => { input.value = heard; },
        onDone: (heard) => { spokenInput = true; handle(heard); },
        onError: (message) => say(message),
        onEnd: () => {
          recognition = null;
          mic.setAttribute("aria-pressed", "false");
        },
      });
    });
  } else {
    mic.hidden = true;
  }

  document.addEventListener("srm:campus-arrive", ({ detail }) => {
    const key = detail.school;
    say(`${SCHOOLS[key].name}. ${describe(key)} Building locations in this concept still need confirming.`, {
      links: [
        linkButton(`Ask about ${SCHOOLS[key].name}`, () => openChat(`What can I study in ${SCHOOLS[key].name} at SRM?`)),
        sourceLink({ title: "Academics page", url: "/academics" }),
      ],
    });
    // On a phone the card would cover the building, and the panel below has the details.
    if (matchMedia("(max-width: 760px)").matches) setOpen(false);
  });
  document.addEventListener("srm:campus-leave", () => say("Where to next?"));

  say(HELLO);
  if (matchMedia("(max-width: 760px)").matches) setOpen(false);

  // Arriving from another page: land on the 3D section once the layout has settled.
  const landOnCampus = () => {
    // Measure the section: the stage is shifted by its entrance animation while scrolling.
    if (location.hash === "#campus") scrollTo({ top: document.querySelector("#campus").getBoundingClientRect().top + scrollY, behavior: "instant" });
  };
  if (document.readyState === "complete") landOnCampus();
  else addEventListener("load", landOnCampus, { once: true });

  try {
    const pending = sessionStorage.getItem(PENDING_SCHOOL);
    if (pending && SCHOOLS[pending]) {
      sessionStorage.removeItem(PENDING_SCHOOL);
      fly(pending);
    }
  } catch {}
}
