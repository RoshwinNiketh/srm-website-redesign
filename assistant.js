import { parseCommand, ROUTES, SCHOOLS } from "/assistant-intents.mjs";

const STORE = "srm-assistant";
const PREFS = "srm-a11y";
export const PENDING_SCHOOL = "srm-assistant-school";
const reducedSystem = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pagePath = () => location.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";

const SUGGESTIONS = {
  "/": ["Summarise this page", "Show me the law school", "Take me to admissions", "Where can students stay?"],
  "/admissions": ["How do I apply?", "Who do I contact about admissions?", "Simplify this page"],
  "/academics": ["Summarise this page", "Which faculties does SRM have?", "Show me the engineering building"],
  "/campus-life": ["Summarise this page", "What clubs can students join?", "What sports facilities are there?"],
  "/research": ["Summarise this page", "What is SCIF?", "How do I start doctoral study?"],
  "/about": ["Summarise this page", "When did SRM become a university?", "Take me to the 3D campus"],
  "/contact": ["What is the campus address?", "How do I contact admissions?", "Simplify this page"],
};

const ICONS = {
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  access: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.5" r="1.8"/><path d="M4 8.5c5 1.3 11 1.3 16 0M12 10.5v4.5M12 15l-3.5 6M12 15l3.5 6"/></svg>',
  stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1"/></svg>',
  speak: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4ZM17 9a4 4 0 0 1 0 6"/></svg>',
};

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function iconButton(className, icon, label) {
  const button = el("button", className);
  button.type = "button";
  button.innerHTML = icon;
  button.setAttribute("aria-label", label);
  button.title = label;
  return button;
}

/* ---------- saved state ---------- */
function loadState() {
  try {
    return JSON.parse(sessionStorage.getItem(STORE)) || {};
  } catch {
    return {};
  }
}
const state = { messages: [], open: false, ...loadState() };
function saveState() {
  try {
    sessionStorage.setItem(STORE, JSON.stringify({ messages: state.messages.slice(-30), open: state.open }));
  } catch {}
}

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS)) || {};
  } catch {
    return {};
  }
}
const prefs = loadPrefs();
function applyPrefs() {
  const root = document.documentElement;
  if (prefs.text) root.dataset.a11yText = prefs.text; else delete root.dataset.a11yText;
  if (prefs.contrast) root.dataset.a11yContrast = "on"; else delete root.dataset.a11yContrast;
  if (prefs.links) root.dataset.a11yLinks = "on"; else delete root.dataset.a11yLinks;
  if (prefs.motion) root.dataset.a11yMotion = "off"; else delete root.dataset.a11yMotion;
  try {
    localStorage.setItem(PREFS, JSON.stringify(prefs));
    if (prefs.motion) sessionStorage.setItem("srm-landing-intro-v1", "played");
  } catch {}
  syncSettings();
}

function setDisplay(action) {
  const before = Boolean(prefs.motion);
  let reply;
  switch (action) {
    case "text-larger":
      prefs.text = Math.min((prefs.text || 0) + 1, 3);
      reply = prefs.text === 3 ? "Text is at its largest size." : "I've made the text larger.";
      break;
    case "text-smaller":
      prefs.text = Math.max((prefs.text || 0) - 1, 0);
      reply = prefs.text === 0 ? "Text is at its normal size." : "I've made the text smaller.";
      break;
    case "contrast-on": prefs.contrast = true; reply = "High contrast is on."; break;
    case "contrast-off": prefs.contrast = false; reply = "High contrast is off."; break;
    case "motion-off": prefs.motion = true; reply = "Animations are off."; break;
    case "motion-on": prefs.motion = false; reply = "Animations are on."; break;
    case "links-on": prefs.links = true; reply = "Links are underlined."; break;
    case "links-off": prefs.links = false; reply = "Link underlines are off."; break;
    default:
      Object.assign(prefs, { text: 0, contrast: false, motion: false, links: false });
      reply = "Display settings are back to normal.";
  }
  applyPrefs();
  // The 3D campus sets its motion when it loads, so it needs a fresh start.
  if (before !== Boolean(prefs.motion) && document.querySelector("#campus-canvas")) {
    saveState();
    setTimeout(() => location.reload(), 900);
  }
  return reply;
}

/* ---------- speech out ---------- */
const canSpeak = "speechSynthesis" in window;
let speaking = false;

function sentences(text) {
  return (text.match(/[^.!?\n]+[.!?]*\s*/g) || [text]).map((part) => part.trim()).filter(Boolean);
}

export function speak(text) {
  if (!canSpeak || !text) return;
  speechSynthesis.cancel();
  const voices = speechSynthesis.getVoices();
  const voice = voices.find((item) => item.lang === "en-IN") || voices.find((item) => item.lang.startsWith("en"));
  const queue = sentences(text);
  speaking = true;
  syncStop();
  queue.forEach((part, i) => {
    const utterance = new SpeechSynthesisUtterance(part);
    utterance.lang = voice?.lang || "en-IN";
    if (voice) utterance.voice = voice;
    if (i === queue.length - 1) {
      utterance.onend = stopSpeaking;
      utterance.onerror = stopSpeaking;
    }
    speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  if (canSpeak) speechSynthesis.cancel();
  speaking = false;
  syncStop();
}

function pageText() {
  const main = document.querySelector("main");
  if (!main) return "";
  const parts = [];
  main.querySelectorAll("h1, h2, h3, p, li, dt, dd").forEach((node) => {
    if (node.closest('[aria-hidden="true"], .campus, [hidden]')) return;
    if (node.parentElement.closest("li, dd, p")) return;
    const text = node.innerText?.replace(/[↗↘↓↙]/g, "").trim();
    if (text) parts.push(/[.!?:]$/.test(text) ? text : `${text}.`);
  });
  return parts.join(" ");
}

/* ---------- speech in ---------- */
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
export const canListen = Boolean(Recognition);

// Calls onText with what it heard so far, and onDone with the final words.
export function listen({ onText, onDone, onError, onEnd }) {
  const recognition = new Recognition();
  recognition.lang = "en-IN";
  recognition.interimResults = true;
  let finalText = "";
  recognition.onresult = (event) => {
    const heard = [...event.results].map((result) => result[0].transcript).join(" ");
    onText?.(heard);
    if (event.results[event.results.length - 1].isFinal) finalText = heard;
  };
  recognition.onerror = (event) => onError?.(
    event.error === "not-allowed" || event.error === "service-not-allowed"
      ? "Microphone access is blocked. You can allow it in your browser, or type instead."
      : event.error === "no-speech" ? "I didn't hear anything. Please try again, or type instead."
      : "Voice input isn't working right now. Please type instead.",
  );
  recognition.onend = () => {
    onEnd?.();
    if (finalText) onDone?.(finalText);
  };
  stopSpeaking();
  recognition.start();
  return recognition;
}

/* ---------- server ---------- */
async function post(path, body) {
  let response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await response.json();
  } catch {
    return { ok: false, error: "I can't reach the assistant right now. Page navigation still works." };
  }
}

export function askServer(message) {
  const history = state.messages.filter((item) => item.text && !item.sections).slice(-6).map(({ role, text }) => ({ role, text }));
  return post("/api/chat", { message, history, page: pagePath() });
}

/* ---------- commands ---------- */
export function visitBuilding(school) {
  if (document.querySelector("#campus-canvas")) {
    // Clear the view: the campus guide takes over inside the 3D section.
    if (!chat.hidden) setTimeout(closeChat, 900);
    document.dispatchEvent(new CustomEvent("srm:campus-visit", { detail: { school } }));
  } else {
    state.open = false;
    try {
      sessionStorage.setItem(PENDING_SCHOOL, school);
    } catch {}
    saveState();
    setTimeout(() => location.assign("/#campus"), 500);
  }
}

function goTo(route) {
  if (route.external) return;
  const [path, hash] = route.href.split("#");
  if ((path.replace(/\/$/, "") || "/") === pagePath() && hash) {
    const target = document.getElementById(hash);
    target?.scrollIntoView({ behavior: prefs.motion || reducedSystem ? "auto" : "smooth" });
    history.replaceState(null, "", `#${hash}`);
    return;
  }
  saveState();
  setTimeout(() => location.assign(route.href), 500);
}

// Carries out a command and returns the reply to show.
export function runCommand(command) {
  switch (command.type) {
    case "navigate": {
      const route = ROUTES.find((item) => item.id === command.route);
      if (!route) return { text: "I can't find that page." };
      if (route.external) {
        return { text: `${route.label} is on the official SRM website. Use this link to open it.`, sources: [{ title: route.label, url: route.href }] };
      }
      const current = route.href.split("#")[0].replace(/\/$/, "") || "/";
      if (current === pagePath() && !route.href.includes("#")) return { text: `You're already on ${route.label}.` };
      goTo(route);
      return { text: `Taking you to ${route.label}.` };
    }
    case "campus":
      visitBuilding(command.school);
      return { text: `Flying to ${SCHOOLS[command.school].name} in the 3D campus. Building locations in this concept still need confirming.` };
    case "display":
      return { text: setDisplay(command.action) };
    case "read": {
      const text = pageText();
      if (!text) return { text: "There's no text to read on this part of the page." };
      if (!canSpeak) return { text: "Your browser can't read pages aloud." };
      speak(text);
      return { text: "Reading this page aloud. Say or type “stop” to end.", silent: true };
    }
    case "stop":
      stopSpeaking();
      return { text: "Stopped.", silent: true };
    case "scroll":
      if (command.direction === 0) scrollTo({ top: 0 });
      else scrollBy({ top: command.direction * innerHeight * 0.8 });
      return { text: command.direction === 0 ? "Back at the top." : command.direction > 0 ? "Scrolled down." : "Scrolled up.", silent: true };
    case "back":
      saveState();
      setTimeout(() => history.back(), 300);
      return { text: "Going back." };
    default:
      return null;
  }
}

/* ---------- chat window ---------- */
const launcher = el("button", "srm-launcher");
launcher.type = "button";
launcher.setAttribute("aria-label", "Ask the SRM assistant");
launcher.setAttribute("aria-expanded", "false");
launcher.setAttribute("aria-controls", "srm-chat");
launcher.title = "Ask SRM";
const launcherLogo = el("img");
launcherLogo.src = "/assets/brand/srm-emblem.webp";
launcherLogo.alt = "";
launcherLogo.width = 44;
launcherLogo.height = 44;
launcher.append(el("span", "srm-launcher-label", "Ask ?"), launcherLogo);

const stopPill = el("button", "srm-stop-pill");
stopPill.type = "button";
stopPill.innerHTML = ICONS.stop;
stopPill.append(el("span", "", "Stop reading"));
stopPill.hidden = true;
stopPill.addEventListener("click", stopSpeaking);

const chat = el("section", "srm-chat");
chat.id = "srm-chat";
chat.setAttribute("role", "dialog");
chat.setAttribute("aria-modal", "false");
chat.setAttribute("aria-labelledby", "srm-chat-title");
chat.hidden = true;

const header = el("div", "srm-chat-head");
const headLogo = el("img");
headLogo.src = "/assets/brand/srm-emblem.webp";
headLogo.width = 36;
headLogo.height = 36;
headLogo.alt = "";
const headText = el("div", "srm-chat-title");
const title = el("h2", "", "SRM Assistant");
title.id = "srm-chat-title";
headText.append(title, el("span", "", "Answers only from SRM's website"));
const settingsButton = iconButton("srm-icon-button", ICONS.access, "Accessibility options");
settingsButton.setAttribute("aria-expanded", "false");
const closeButton = iconButton("srm-icon-button", ICONS.close, "Close assistant");
header.append(headLogo, headText, settingsButton, closeButton);

const log = el("div", "srm-log");
log.setAttribute("role", "log");
log.setAttribute("aria-live", "polite");
log.setAttribute("aria-label", "Conversation");
log.tabIndex = 0;

const chips = el("div", "srm-chips");

const form = el("form", "srm-form");
const input = el("textarea");
input.rows = 1;
input.maxLength = 500;
input.placeholder = "Ask a question or say where to go";
input.setAttribute("aria-label", "Your message");
const micButton = iconButton("srm-icon-button srm-mic", ICONS.mic, "Speak your message");
micButton.setAttribute("aria-pressed", "false");
micButton.hidden = !canListen;
const sendButton = iconButton("srm-send", ICONS.send, "Send");
sendButton.type = "submit";
form.append(input, micButton, sendButton);

const note = el("p", "srm-note", "AI can make mistakes. Check the linked page before you decide.");

const settings = el("div", "srm-settings");
settings.hidden = true;
settings.setAttribute("aria-label", "Accessibility options");
settings.setAttribute("role", "group");

chat.append(header, log, settings, chips, form, note);

let busy = false;
let spokenReplies = false;

function safeSources(sources = []) {
  return sources.filter((source) => /^\/(?!\/)/.test(source.url) || /^https:\/\/([\w-]+\.)*srmist\.edu\.in(\/|$)/.test(source.url));
}

function renderMessage(message) {
  const node = el("div", `srm-message srm-${message.role}`);
  if (message.text) node.append(el("p", "", message.text));
  (message.sections || []).forEach((section) => {
    const block = el("div", "srm-section");
    block.append(el("h3", "", section.heading), el("p", "", section.text));
    node.append(block);
  });
  const sources = safeSources(message.sources);
  if (sources.length) {
    const links = el("div", "srm-sources");
    links.append(el("span", "", "From:"));
    sources.forEach((source) => {
      const link = el("a", "", source.title);
      link.href = source.url;
      if (!source.url.startsWith("/")) {
        link.target = "_blank";
        link.rel = "noopener";
        link.setAttribute("aria-label", `${source.title}, opens the official SRM site in a new tab`);
        link.append(el("span", "", " ↗"));
        link.lastChild.setAttribute("aria-hidden", "true");
      } else {
        link.addEventListener("click", saveState);
      }
      links.append(link);
    });
    node.append(links);
  }
  if (message.role === "assistant" && canSpeak && !message.greeting && (message.sections || (message.text || "").length > 60)) {
    const listenButton = el("button", "srm-listen");
    listenButton.type = "button";
    listenButton.innerHTML = ICONS.speak;
    listenButton.append(el("span", "", "Listen"));
    listenButton.addEventListener("click", () => speak(messageText(message)));
    node.append(listenButton);
  }
  return node;
}

function messageText(message) {
  return [message.text, ...(message.sections || []).map((section) => `${section.heading}. ${section.text}`)].filter(Boolean).join(" ");
}

function addMessage(message) {
  state.messages.push(message);
  saveState();
  log.append(renderMessage(message));
  log.scrollTop = log.scrollHeight;
  renderChips();
}

function renderAll() {
  log.replaceChildren();
  if (!state.messages.length) {
    log.append(renderMessage({ role: "assistant", greeting: true, text: "Hi. Ask me about SRM, or tell me where to go, like “take me to admissions”. You can type or use your voice." }));
  }
  state.messages.forEach((message) => log.append(renderMessage(message)));
  renderChips();
  log.scrollTop = log.scrollHeight;
}

function renderChips() {
  const list = SUGGESTIONS[pagePath()] || SUGGESTIONS["/"];
  // Keep the conversation roomy once it has started.
  chips.replaceChildren(...list.slice(0, state.messages.length ? 2 : 4).map((text) => {
    const chip = el("button", "srm-chip", text);
    chip.type = "button";
    chip.addEventListener("click", () => submit(text));
    return chip;
  }));
  chips.hidden = state.messages.length > 0 && state.messages.at(-1).role === "user";
}

function setBusy(value) {
  busy = value;
  sendButton.disabled = value;
  log.querySelector(".srm-typing")?.remove();
  if (value) {
    const typing = el("div", "srm-message srm-assistant srm-typing");
    typing.setAttribute("role", "status");
    typing.append(el("span", "srm-visually-hidden", "Looking through SRM's website"), ...[1, 2, 3].map(() => {
      const dot = el("i");
      dot.setAttribute("aria-hidden", "true");
      return dot;
    }));
    log.append(typing);
    log.scrollTop = log.scrollHeight;
  }
}

function reply(message) {
  addMessage({ role: "assistant", ...message });
  if ((spokenReplies || prefs.readReplies) && !message.silent) speak(messageText(message));
}

async function pageTool(mode) {
  setBusy(true);
  const result = await post("/api/page", { page: pagePath(), mode });
  setBusy(false);
  if (!result.ok) return reply({ text: result.error });
  reply({ text: mode === "simplify" ? "Here is this page in simple English." : "Here is a short summary of this page.", sections: result.sections, sources: [{ title: "This page", url: pagePath() }] });
}

async function submit(raw) {
  const text = raw.trim();
  if (!text || busy) return;
  input.value = "";
  sizeInput();
  addMessage({ role: "user", text });
  const command = parseCommand(text);
  if (command?.type === "simplify" || command?.type === "summary") {
    await pageTool(command.type);
  } else if (command) {
    reply(runCommand(command));
  } else {
    setBusy(true);
    const result = await askServer(text);
    setBusy(false);
    if (!result.ok) {
      reply({ text: result.error || "Something went wrong. Please try again." });
    } else if (result.action) {
      const outcome = runCommand(result.action);
      reply(outcome || { text: result.answer });
    } else {
      reply({ text: result.answer, sources: result.sources });
    }
  }
  spokenReplies = false;
  if (!chat.hidden) input.focus({ preventScroll: true });
}

function sizeInput() {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
}

export function openChat(prefill) {
  chat.hidden = false;
  launcher.hidden = true;
  launcher.setAttribute("aria-expanded", "true");
  state.open = true;
  saveState();
  renderAll();
  input.focus({ preventScroll: true });
  if (prefill) submit(prefill);
}

function closeChat() {
  chat.hidden = true;
  launcher.hidden = false;
  launcher.setAttribute("aria-expanded", "false");
  state.open = false;
  saveState();
  launcher.focus({ preventScroll: true });
}

/* ---------- accessibility panel ---------- */
const toggles = [];
function settingToggle(label, isOn, flip) {
  const button = el("button", "srm-toggle", label);
  button.type = "button";
  button.addEventListener("click", flip);
  toggles.push(() => button.setAttribute("aria-pressed", String(Boolean(isOn()))));
  return button;
}

function actionButton(label, run) {
  const button = el("button", "srm-toggle srm-action", label);
  button.type = "button";
  button.addEventListener("click", run);
  return button;
}

function buildSettings() {
  const size = el("div", "srm-size");
  const sizeLabel = el("span", "", "Text size");
  const smaller = el("button", "", "A−");
  smaller.type = "button";
  smaller.setAttribute("aria-label", "A− Make text smaller");
  smaller.addEventListener("click", () => setDisplay("text-smaller"));
  const larger = el("button", "", "A+");
  larger.type = "button";
  larger.setAttribute("aria-label", "A+ Make text larger");
  larger.addEventListener("click", () => setDisplay("text-larger"));
  size.append(sizeLabel, smaller, larger);

  const tools = el("div", "srm-setting-grid");
  tools.append(
    actionButton("Simplify this page", () => { settingsOpen(false); submit("Simplify this page"); }),
    actionButton("Read this page aloud", () => { settingsOpen(false); submit("Read this page"); }),
    settingToggle("High contrast", () => prefs.contrast, () => setDisplay(prefs.contrast ? "contrast-off" : "contrast-on")),
    settingToggle("Stop animations", () => prefs.motion, () => setDisplay(prefs.motion ? "motion-on" : "motion-off")),
    settingToggle("Underline links", () => prefs.links, () => setDisplay(prefs.links ? "links-off" : "links-on")),
    settingToggle("Read replies aloud", () => prefs.readReplies, () => { prefs.readReplies = !prefs.readReplies; applyPrefs(); }),
  );
  const reset = el("button", "srm-reset", "Reset display");
  reset.type = "button";
  reset.addEventListener("click", () => setDisplay("display-reset"));
  const heading = el("h3", "", "Accessibility");
  const hint = el("p", "", "You can also ask in the chat, like “make the text bigger”.");
  settings.append(heading, size, tools, reset, hint);
  if (!canSpeak) toggles.push(() => tools.querySelectorAll(".srm-action")[1].remove());
}

function syncSettings() {
  toggles.forEach((sync) => sync());
}

function syncStop() {
  stopPill.hidden = !speaking;
}

function settingsOpen(open) {
  settings.hidden = !open;
  log.hidden = open;
  chips.hidden = open;
  form.hidden = open;
  note.hidden = open;
  settingsButton.setAttribute("aria-expanded", String(open));
  settingsButton.setAttribute("aria-label", open ? "Back to chat" : "Accessibility options");
  if (open) settings.querySelector("button")?.focus();
  else { renderChips(); input.focus({ preventScroll: true }); }
}

/* ---------- wiring ---------- */
launcher.addEventListener("click", () => openChat());
closeButton.addEventListener("click", closeChat);
settingsButton.addEventListener("click", () => settingsOpen(settings.hidden));
chat.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  event.stopPropagation();
  if (!settings.hidden) settingsOpen(false);
  else closeChat();
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  submit(input.value);
});
input.addEventListener("input", sizeInput);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    submit(input.value);
  }
});

let recognition = null;
micButton.addEventListener("click", () => {
  if (recognition) {
    recognition.stop();
    return;
  }
  micButton.setAttribute("aria-pressed", "true");
  micButton.setAttribute("aria-label", "Stop listening");
  input.placeholder = "Listening…";
  recognition = listen({
    onText: (heard) => { input.value = heard; sizeInput(); },
    onDone: (heard) => { spokenReplies = true; submit(heard); },
    onError: (message) => reply({ text: message, silent: true }),
    onEnd: () => {
      recognition = null;
      micButton.setAttribute("aria-pressed", "false");
      micButton.setAttribute("aria-label", "Speak your message");
      input.placeholder = "Ask a question or say where to go";
    },
  });
});

window.addEventListener("pagehide", () => { if (canSpeak) speechSynthesis.cancel(); });

buildSettings();
syncSettings();
document.body.append(launcher, stopPill, chat);
if (state.open) openChat();
