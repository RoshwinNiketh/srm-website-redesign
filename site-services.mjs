const official = "https://www.srmist.edu.in";
const resource = (label, path) => [label, path.startsWith("https:") ? path : official + path];

export const servicePages = {
  "/students": ["Student Services", "Find the official portal and services for your campus and batch.", [
    ["portals", "Student portals and registration", "Use the student gateway to choose the portal listed for your batch. It includes Academia, separate instructions for newer cohorts and portal manuals.", resource("Choose a portal by batch", "/students/")],
    ["exams", "Exams & Results", "Check schedules, hall tickets, results and official circulars with the Controller of Examinations.", ["Go to Exams & Results", "/exams"]],
    ["calendar", "Academic calendar and circulars", "Check the notices for your faculty, campus and term before planning registration or travel.", resource("Open student academic notices", "/students/")],
    ["library", "Library", "Find collections, electronic resources, opening hours and library support.", resource("Visit the Central Library", "/library/")],
    ["careers", "Career Centre and placements", "Find placement and career development services. Confirm which team serves your campus.", resource("Visit the Career Centre", "/career-centre/")],
    ["support", "Student support and welfare", "Find counselling, grievance routes, housing and welfare contacts.", ["Find safety and support", "/campus-life#safety"]],
    ["staff", "Faculty & Staff", "Find the staff gateway and public faculty directory.", resource("Faculty gateway", "/faculty-gateway/"), resource("Faculty and staff finder", "/staff-finder/")],
    ["parents", "Parents", "Find the institution’s dedicated parent information and contacts.", resource("Parent gateway", "/parents/")],
  ]],
  "/exams": ["Exams & Results", "Use the Controller of Examinations for official instructions and student services.", [
    ["schedule", "Exam schedules and results", "Select your programme, session and campus in the official examination listing.", resource("Open examination schedules and results", "/controller-of-examinations/")],
    ["hall-tickets", "Hall tickets and exam fees", "Follow the instructions published for your programme and use the payment or sign-in link from the examination office.", resource("Find hall ticket and fee instructions", "/controller-of-examinations/")],
    ["circulars", "Circulars and exam instructions", "Check the latest instructions before an exam, including any programme-specific platform or manual.", resource("Read examination circulars", "/controller-of-examinations/")],
    ["records", "Transcripts and verification", "Ask the examination office for the procedure that applies to your credential and batch.", resource("Contact the Controller of Examinations", "/controller-of-examinations/")],
  ]],
  "/programmes": ["Programme Finder", "Start with a degree or school, then confirm the campus, delivery mode and intake in the official catalogue.", [
    ["catalogue", "Search the official programme catalogue", "Filter the university catalogue by programme level, type and delivery mode. Verify campus availability on the programme and admissions pages.", resource("Open the official Programme Finder", "/program-finder/")],
    ["engineering", "Engineering, Architecture & Design", "Explore B.Tech, M.Tech, B.Arch and design routes. The application portal lists programme-specific entry routes.", resource("Explore Engineering & Technology", "/college/college-of-engineering-technology/"), ["Check application routes", "/admissions"]],
    ["health", "Medicine, Dentistry & Allied Health", "Find medicine and dentistry alongside pharmacy, nursing, physiotherapy, occupational therapy and public health.", resource("Explore Medicine & Health Sciences", "/college/medicine-and-health-sciences/")],
    ["other", "Management, Law, Agriculture and Science & Humanities", "Use the department directory for subject areas and the catalogue to compare awards and study modes.", resource("Browse departments A–Z", "/departments/")],
    ["flexible", "Online and distance education", "Compare the qualification and study mode before starting a separate application.", resource("Explore SRM Online", "https://www.srmonline.in/srmist"), resource("Explore distance education", "https://srmistdistanceeducation.in/")],
    ["doctoral", "Doctoral study", "Check current PhD calls, eligibility and reporting dates with the research directorate.", resource("Visit the Directorate of Research", "/research/")],
  ]],
  "/international": ["International", "Find admission, arrival support, exchange and international partnerships.", [
    ["admissions", "International admission", "Check the applicant category, academic requirements, fee schedule and application process for your chosen programme.", resource("International admissions", "/admission-international/")],
    ["arrival", "Arrival, immigration and accommodation", "Confirm current visa and FRRO guidance with International Relations before travelling. Check housing separately.", resource("International student services", "/ir/international-admission-details/"), resource("International hostel", "/srm-hostels/international-hostel/")],
    ["exchange", "Exchange, twinning and dual degrees", "Check the current partner, nomination process, eligibility and academic credit with the international office.", resource("Semester Abroad Program", "/ir/outward-mobility/semester-abroad-program/"), resource("Outward mobility options", "/ir/outward-mobility/")],
    ["partnerships", "Global partnerships", "Find partner institutions, mobility contacts and collaboration information.", resource("Global partnerships", "/ir/global-partnerships/"), resource("Directorate of International Relations", "/ir/")],
  ]],
  "/visit": ["Campuses & Visit", "Plan a visit and confirm the campus before travelling or applying.", [
    ["ktr", "Kattankulathur", "The main campus is in SRM Nagar, Kattankulathur. Confirm your destination with the office or school you are visiting.", resource("Official directions and visitor information", "/visitors/"), ["Explore the campus concept", "/#campus"], resource("Official 360° campus tour", "https://webstor.srmist.edu.in/web_assets/srmist-virtual-tour-vo/index.htm")],
    ["other-campuses", "Ramapuram, Vadapalani, Tiruchirappalli and Delhi NCR", "Check the official campus site for directions, programme availability and visitor contacts.", resource("Ramapuram campus", "https://srmrmp.edu.in/ramapuram-campus/"), resource("Vadapalani campus", "https://www.srmistvdp.edu.in/"), resource("Tiruchirappalli campus", "https://srmtrichy.edu.in/"), resource("Delhi NCR campus", "https://www.srmimt.net/")],
    ["travel", "Transport and access", "Check current transport information. Contact the relevant campus office in advance for accessible arrival and building access.", resource("Transport information", "/transport-facility/"), ["Find campus contacts", "/contact"]],
  ]],
  "/disclosures": ["Public Disclosures", "Find the university’s published governance, regulatory and quality records.", [
    ["ugc", "UGC public self-disclosure", "Find institutional, academic, admissions, research and student-life disclosures in the official index.", resource("Open the UGC disclosure index", "/ugc/")],
    ["quality", "Quality assurance and rankings", "Check the year and category of each result and approval. Use the official indexes for the underlying documents.", resource("IQAC and accreditation records", "/iqac/"), resource("NIRF submissions", "/nirf/")],
    ["policies", "Policies and approvals", "Find university policies and the published year-wise regulatory approvals and mandatory disclosures.", resource("University policies", "/policies/"), resource("Official disclosure links", "/ugc/")],
    ["grievances", "Grievances and escalation", "Use the official grievance route for case handling and the campus safety directory for related support.", resource("Grievance redressal", "/life-at-srm/complaints-redressal/"), ["Safety & Support", "/campus-life#safety"]],
  ]],
  "/updates": ["News & Events", "Find dated announcements, campus events and news from SRMIST.", [
    ["news", "University news", "Read current stories and institutional announcements from the university newsroom.", resource("SRMIST news", "/news/")],
    ["events", "Events and conferences", "Confirm dates, venue, accessibility and registration with the event organiser.", resource("SRMIST events calendar", "/events/")],
    ["careers", "Jobs at SRMIST", "Find university vacancies and use the official recruitment application route.", resource("SRMIST recruitment", "https://careers.srmist.edu.in/")],
    ["alumni", "Alumni", "Find chapters, university alumni events and ways to stay connected.", resource("Alumni network", "https://alumni.srmist.edu.in/")],
  ]],
  "/accessibility": ["Accessibility", "Use the site with a keyboard, assistive technology or reduced motion preferences.", [
    ["navigation", "Keyboard and motion", "Use the first keyboard link to skip to main content. Open navigation with Enter or Space and close it with Escape. On the homepage, use Skip intro or set reduced motion in your device preferences.", ["Browse the site directory", "/directory"]],
    ["alternatives", "Campus information without 3D", "Use the campus visitor directory for text directions and contact details.", ["Campuses & Visit", "/visit"]],
    ["contact", "Report an accessibility issue", "Tell the university which page or service you were using and what blocked you. Use the contact directory to find the responsible office.", ["Find an office", "/contact"]],
  ]],
  "/privacy": ["Privacy & Assistant", "Learn how this prototype handles assistant interactions and official portal handoffs.", [
    ["chat", "Chat and page summaries", "When AI is enabled, your question and recent turns are sent to Google Gemini. Page summary and simplification use text from the public page. Recent chat messages are kept in this tab’s session storage. Use Clear chat to remove them from this tab.", resource("SRMIST privacy policy", "/privacy-policy/")],
    ["voice", "Voice and sensitive information", "Voice input uses your browser’s speech recognition, which may use a remote service. Keep passwords, payment details, application numbers and personal records out of chat.", ["Find the right student service", "/students"]],
    ["portals", "Official sites and payments", "Sign-in, application, results and payments are handled by the official destinations linked on this site. Check the destination before entering personal information.", ["Find official application links", "/admissions"]],
  ]],
};

export const utilityLinks = [
  ["Students", "/students"], ["Exams & Results", "/exams"], ["Programme Finder", "/programmes"],
  ["Campuses & Visit", "/visit"], ["News & Events", "/updates"], ["Public Disclosures", "/disclosures"],
  ["Contact", "/contact"],
];

export const footerLinks = [
  ...utilityLinks, ["Library", "/students#library"], ["Career Centre", "/students#careers"],
  ["Safety & Support", "/campus-life#safety"], ["Accessibility", "/accessibility"],
  ["Privacy & Assistant", "/privacy"], ["A–Z Directory", "/directory"],
];

export const pageAdditions = {
  "/about": [
    ["campus-directory", "Campuses and directions", "Check each campus for local contacts, travel and programme availability.", ["Browse campuses", "/visit"]],
    ["disclosures", "Governance and public disclosures", "Find university approvals, rankings, policies and disclosures by issuing office and year.", ["View public disclosures", "/disclosures"]],
  ],
  "/academics": [
    ["finder", "Programme Finder", "Find B.Tech, postgraduate, doctoral and other programmes by level, campus and delivery mode.", ["Find a programme", "/programmes"]],
    ["people", "Departments and faculty", "Find academic units and published faculty contacts.", resource("Departments A–Z", "/departments/"), resource("Faculty and staff finder", "/staff-finder/")],
    ["student-services", "Academic calendar, exams and library", "Find your faculty’s current academic notices, the examination office and the library.", ["Student academic notices", "/students#calendar"], ["Exams & Results", "/exams"], ["Central Library", "/students#library"]],
  ],
  "/admissions": [
    ["intakes", "Intakes, deadlines and counselling", "Select your programme, campus and applicant category. Check the official cycle for dates, exam instructions, counselling, fees and refund terms before paying.", resource("India intake notices", "/admission-india/"), resource("International intake notices", "/admission-international/"), ["Compare programmes", "/programmes"]],
    ["application-status", "Application status and payment", "Use the official application portal and the credentials you registered with. Confirm the fee schedule for your exact intake and campus before paying.", resource("Open the official application portal", "https://applications.srmist.edu.in/"), ["Find admissions contacts", "/contact"]],
  ],
  "/research": [
    ["doctoral", "PhD admissions and research regulations", "Check the current doctoral call, eligibility, reporting dates, and forms with the Directorate of Research.", resource("Directorate of Research and regulations", "/research/")],
    ["projects", "Projects, publications and research facilities", "Find sponsored projects, institutional outputs and shared instrumentation. Confirm access and booking with the facility.", resource("Research projects", "/research/projects/"), resource("Institutional publications", "/publications/"), resource("Central Instrumentation Facility", "/research/scif/")],
    ["medical", "Medical research and incubation", "Find the medical research division and university innovation support.", resource("Division of Medical Research", "https://medicalresearch.srmist.edu.in/"), resource("Innovation and incubation", "/research/innovation-incubation/")],
  ],
  "/campus-life": [
    ["safety", "Safety & Support", "Find the official anti-ragging, grievance and counselling services. Use the contact directory for campus-specific escalation.", resource("Anti-ragging support", "/life-at-srm/anti-ragging/"), resource("Grievance redressal", "/life-at-srm/complaints-redressal/"), resource("Student counselling", "/life-at-srm/student-counselling-services/"), ["Find campus contacts", "/contact"]],
    ["accommodation", "Hostel applications and dining", "Check published hostel options, eligibility and booking instructions for your campus.", resource("Hostel application guidance", "/srm-hostels/#hostels-how-to-apply"), resource("Dining and eateries", "/srm-hostels/dining-eateries/")],
    ["getting-around", "Transport and directions", "Check transport with your campus and use visitor information for directions.", resource("Official transport information", "/transport-facility/"), ["Plan a campus visit", "/visit"]],
  ],
  "/more": [
    ["student-quicklinks", "Student services and exams", "Find campus services, portals, results and examination schedules.", ["Student Services", "/students"], ["Exams & Results", "/exams"]],
    ["university-updates", "News, events and recruitment", "Find separate news, calendar, vacancies and alumni destinations.", ["Browse news and events", "/updates"]],
  ],
};
