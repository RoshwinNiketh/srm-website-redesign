// Understands direct commands ("take me to admissions") without calling the AI.
// Shared by the browser and the server. Every destination the assistant can
// open is listed here, so it can never send someone to a made-up address.
const OFFICIAL = "https://www.srmist.edu.in";

export const ROUTES = [
  { id: "home", label: "Home", href: "/", aliases: ["home", "homepage", "main", "start", "landing"] },
  { id: "admissions", label: "Admissions", href: "/admissions", aliases: ["admission", "admissions", "admissions 2027"] },
  { id: "apply", label: "How to apply", href: "/admissions#apply", aliases: ["apply", "how to apply", "application", "application process", "application steps"] },
  { id: "academics", label: "Academics", href: "/academics", aliases: ["academics", "academic", "courses", "programmes", "programs", "faculties", "degrees"] },
  { id: "campus-life", label: "Campus Life", href: "/campus-life", aliases: ["campus life", "student life", "life at srm", "life"] },
  { id: "research", label: "Research", href: "/research", aliases: ["research"] },
  { id: "about", label: "About SRM", href: "/about", aliases: ["about", "about us", "about srm", "history"] },
  { id: "contact", label: "Contact", href: "/contact", aliases: ["contact", "contact us", "contacts", "phone number", "address"] },
  { id: "more", label: "More from SRMIST", href: "/more", aliases: ["more", "more resources", "alumni", "international relations"] },
  { id: "campus", label: "3D campus", href: "/#campus", aliases: ["campus", "3d campus", "campus explorer", "3d explorer", "campus map", "campus tour", "pick a building", "3d"] },
  { id: "schools", label: "Schools", href: "/#schools", aliases: ["schools", "school list", "paths"] },
  { id: "portal", label: "Application portal", href: "https://applications.srmist.edu.in/", external: true, aliases: ["application portal", "apply now", "application form", "admission portal"] },
  { id: "admission-india", label: "Admissions India", href: `${OFFICIAL}/admission-india/`, external: true, aliases: ["admissions india", "india admissions", "indian admissions"] },
  { id: "admission-international", label: "International admissions", href: `${OFFICIAL}/admission-international/`, external: true, aliases: ["international admissions", "international admission", "nri admissions"] },
  { id: "hostels", label: "Hostels", href: `${OFFICIAL}/srm-hostels/`, external: true, aliases: ["hostel", "hostels", "accommodation", "housing"] },
  { id: "dining", label: "Dining", href: `${OFFICIAL}/srm-hostels/dining-eateries/`, external: true, aliases: ["dining", "food", "mess", "canteen", "eateries"] },
  { id: "library", label: "Library", href: `${OFFICIAL}/library/`, external: true, aliases: ["library"] },
  { id: "sports", label: "Sports", href: `${OFFICIAL}/sports/`, external: true, aliases: ["sports", "sport"] },
  { id: "transport", label: "Transport", href: `${OFFICIAL}/transport-facility/`, external: true, aliases: ["transport", "bus", "buses"] },
  { id: "clubs", label: "Clubs", href: `${OFFICIAL}/life-at-srm/student-life/clubs/`, external: true, aliases: ["clubs", "club"] },
  { id: "careers", label: "Career Centre", href: `${OFFICIAL}/career-centre/`, external: true, aliases: ["placements", "placement", "career centre", "career center"] },
  { id: "news", label: "News", href: `${OFFICIAL}/news/`, external: true, aliases: ["news"] },
  { id: "events", label: "Events", href: `${OFFICIAL}/events/`, external: true, aliases: ["events"] },
  { id: "program-finder", label: "Program finder", href: `${OFFICIAL}/program-finder/`, external: true, aliases: ["program finder", "programme finder"] },
  { id: "virtual-tour", label: "Virtual tour", href: "https://webstor.srmist.edu.in/web_assets/srmist-virtual-tour-vo/index.htm", external: true, aliases: ["virtual tour", "360 tour"] },
];

export const SCHOOLS = {
  engineering: { name: "Engineering & Technology", aliases: ["engineering", "engineering and technology", "technology", "tech park", "cse", "computer science"] },
  medical: { name: "Medical & Health Sciences", aliases: ["medical", "medicine", "health sciences", "medicine and health sciences", "medical and health sciences"] },
  arts: { name: "Science & Humanities", aliases: ["science and humanities", "humanities", "arts", "arts and science", "science"] },
  management: { name: "Management", aliases: ["management", "mba", "business"] },
  law: { name: "Law", aliases: ["law", "legal"] },
};

export const DISPLAY_ACTIONS = ["text-larger", "text-smaller", "contrast-on", "contrast-off", "motion-off", "motion-on", "links-on", "links-off", "display-reset"];

const normalise = (text) =>
  text.toLowerCase().replace(/&/g, " and ").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

const COMMAND = /^(?:(?:please|hey|hi|hello|ok|okay|can you|could you|would you|will you|kindly|i want to|i would like to|i d like to|i need to|let me|let s|lets)\s+)*(take me|bring me|send me|direct me|redirect me|guide me|fly me|fly|go|navigate|open|show me|show|visit|see|jump|head|move|get me|where is|where s|find)\b/;
const FILLER = /\b(to|the|a|an|please|me|my|our|for|of|on|at|srm|srmist|website|site|web|page|pages|section|tab|link|now|this|that|back|over|there|us|in|into)\b/g;
const BUILDING = /\b(building|block|school|department|dept|college|faculty)\b/g;

function stripFiller(text) {
  return text.replace(FILLER, " ").replace(/\s+/g, " ").trim();
}

export function findRoute(name) {
  const wanted = stripFiller(normalise(name));
  return ROUTES.find((route) => route.aliases.some((alias) => stripFiller(alias) === wanted)) || null;
}

export function findSchool(name) {
  const wanted = stripFiller(normalise(name)).replace(BUILDING, " ").replace(/\s+/g, " ").trim();
  for (const [key, school] of Object.entries(SCHOOLS)) {
    if (school.aliases.includes(wanted)) return key;
  }
  return null;
}

function displayCommand(text) {
  if (/\b(reset|restore|normal)\b.*\b(display|settings|view|page|size|text)\b/.test(text)) return "display-reset";
  if (/\b(bigger|larger|increase|enlarge|zoom in|big)\b.*\b(text|font|letters?|words?|size|page)\b|\b(text|font|letters?|words?)\b.*\b(bigger|larger|big)\b|\bzoom in\b/.test(text)) return "text-larger";
  if (/\b(smaller|decrease|reduce|shrink)\b.*\b(text|font|letters?|words?|size)\b|\b(text|font|letters?|words?)\b.*\bsmaller\b|\bzoom out\b/.test(text)) return "text-smaller";
  if (/\b(turn off|disable|remove|no|stop)\b.*\bcontrast\b/.test(text)) return "contrast-off";
  if (/\b(high|more|higher|better|increase)\b.*\bcontrast\b|\bcontrast\b.*\b(on|high|mode)\b/.test(text)) return "contrast-on";
  if (/\b(stop|turn off|disable|remove|no|reduce|pause)\b.*\b(animation|animations|motion|moving|movement)\b/.test(text)) return "motion-off";
  if (/\b(turn on|enable|allow|restart|start)\b.*\b(animation|animations|motion)\b/.test(text)) return "motion-on";
  if (/\b(underline|highlight)\b.*\blinks?\b/.test(text)) return "links-on";
  return null;
}

// Returns a command object, or null when the message should go to the AI.
export function parseCommand(input) {
  const text = normalise(input);
  if (!text || text.length > 120) return null;
  const display = displayCommand(text);
  if (display) return { type: "display", action: display };
  if (/^(please )?(stop|quiet|be quiet|silence|stop reading|stop talking|stop speaking|pause reading)$/.test(text)) return { type: "stop" };
  if (/\bread\b.*\b(page|aloud|out loud|this|screen)\b/.test(text)) return { type: "read" };
  if (/\bsimplify\b|\bsimple (english|language|words|version)\b|\beasy (english|words|language)\b|\bplain (english|language)\b/.test(text)) return { type: "simplify" };
  if (/\bsummar(y|ise|ize)\b.*\b(page|this)\b|\b(page|this)\b.*\bsummar(y|ise|ize)\b|^summar(y|ise|ize)$|\bwhat is this page( about)?\b|\bwhat s on this page\b/.test(text)) return { type: "summary" };
  if (/^(please )?scroll( the page)? down$|^(go )?(page )?down$/.test(text)) return { type: "scroll", direction: 1 };
  if (/^(please )?scroll( the page)? up$|^(go )?(page )?up$/.test(text)) return { type: "scroll", direction: -1 };
  if (/^(go |scroll |back )?(back )?to (the )?top( of (the )?page)?$/.test(text)) return { type: "scroll", direction: 0 };
  if (/^(go back|back|previous page)$/.test(text)) return { type: "back" };

  const match = text.match(COMMAND);
  const target = match ? text.slice(match[0].length).trim() : text;
  if (match) {
    const school = findSchool(target);
    if (school) return { type: "campus", school };
  }
  const route = findRoute(target);
  // A bare word only counts as a command for pages on this site ("admissions").
  if (route && (match || !route.external)) return { type: "navigate", route: route.id };
  return null;
}
