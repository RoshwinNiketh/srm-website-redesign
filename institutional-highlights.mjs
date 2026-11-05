const annual = ["SRMIST annual report 2024–25", "https://webstor.srmist.edu.in/web_assets/downloads/2026/ugc-annual-report-2024-25.pdf"];
const prospectus = ["SRMIST prospectus 2025–26", "https://webstor.srmist.edu.in/web_assets/downloads/2025/srmist-university-prospectus-2025-26.pdf"];
const rankings = ["SRMIST institutional development plan", "https://webstor.srmist.edu.in/web_assets/downloads/2026/flipbook/srmist-institutional-development-plan/files/basic-html/page11.html"];
const placements = ["SRMIST placement overview", "https://www.srmistvdp.edu.in/placements-overview"];
const apply = ["Official application portal", "https://applications.srmist.edu.in/"];

const placementMetric = ["6,373", "Job offers across SRMIST campuses", "2025–26 placement season", placements];
const rankMetric = ["#11", "University category in India", "NIRF 2025", rankings];
const startupMetric = ["42", "Startups incubated", "SRMIST annual report, 2024–25", annual];
const publicationMetric = ["5,871", "Research publications", "SRMIST annual report, 2024–25", annual];

export const homeHighlights = {
  label: "SRMIST / In numbers",
  title: "Where ambition leads",
  intro: "See what students, researchers and founders at SRMIST have achieved. Each figure links to the report that puts it in context.",
  metrics: [placementMetric, rankMetric, startupMetric, publicationMetric],
  links: [["Explore careers and placements", "/more#placements"], ["Discover research and startups", "/research#innovation"]],
};

export const pageHighlights = {
  "/about": {
    label: "Institution profile",
    title: "One institute, six campuses",
    intro: "Kattankulathur is the flagship campus. When comparing locations, check where your programme is taught and which facilities and services are available there.",
    metrics: [rankMetric, ["A++", "Institutional accreditation grade", "NAAC, 2024", ["SRMIST handbook 2025–26", "https://webstor.srmist.edu.in/web_assets/downloads/2025/hand-book-2025-26.pdf"]], ["6", "Campuses reported by SRMIST", "2024–25 annual report", annual]],
    links: [["Find your campus", "#campuses"], ["Explore the flagship campus in 3D", "/#campus"]],
  },
  "/academics": {
    label: "Academic pathways",
    title: "Find the right programme",
    intro: "Compare degree level, curriculum and campus together. Start with a faculty, then check the programme listing for its subjects, entry requirements and selection process.",
    metrics: [["316", "Programmes offered", "Institution-wide, 2024–25", annual], ["6", "Faculties across SRMIST", "2024–25 annual report", annual]],
    links: [["Browse the faculties", "#faculty-title"], ["Check eligibility", "/admissions#eligibility"], apply],
  },
  "/admissions": {
    label: "Applicant checklist",
    title: "Before you apply",
    intro: "Shortlist your programme and campus first. Check the entry route and document requirements for your category, then confirm the current fee schedule and scholarship terms before you submit.",
    metrics: [["7,000+", "Students supported by scholarships", "Reported in SRMIST’s 2024–25 annual report", annual]],
    links: [["Fees and scholarships", "#fees"], ["International applications", "#international"], apply],
  },
  "/research": {
    label: "Research and enterprise",
    title: "From the lab to the market",
    intro: "The Directorate of Entrepreneurship and Innovation lists support for founders including mentorship, fabrication, market validation and investor introductions. SRM Medical College’s BioNEST incubator focuses on medical technology, digital health and biotechnology.",
    metrics: [publicationMetric, ["174", "Funded projects", "SRMIST annual report, 2024–25", annual], startupMetric],
    links: [prospectus, ["Explore the medical BioNEST hub", "https://medical.srmist.edu.in/centre-of-excellence/"]],
  },
  "/campus-life": {
    label: "Life at Kattankulathur",
    title: "Build a routine beyond lectures",
    intro: "Explore student clubs and cultural events, then look at practical details like accommodation, dining and transport. The medical campus describes options for sports, fitness and student wellness alongside its hostel facilities.",
    metrics: [["344", "National-level sports awards", "Institution-wide, 2024–25", annual]],
    links: [["Explore clubs and festivals", prospectus[1]], ["Medical campus hostel facilities", "https://medical.srmist.edu.in/hostels/"], ["Explore campus in 3D", "/#campus"]],
  },
  "/more": {
    label: "Careers and global opportunities",
    title: "Take the next step from SRMIST",
    intro: "The Career Centre supports students through employer talks, placement preparation and recruitment. The Semester Abroad Programme offers eligible students a period of study overseas before they return to SRMIST to continue their degree.",
    metrics: [placementMetric, ["450", "Semester Abroad Programme participants", "SRMIST annual report, 2024–25", annual], ["122", "Institutions in strategic international alliances", "SRMIST annual report, 2024–25", annual]],
    links: [["Visit the Career Centre", "https://www.srmistvdp.edu.in/career-centre"], ["Read about study abroad", "https://webstor.srmist.edu.in/web_assets/downloads/2025/annual-report-part-a-2023-24.pdf"], ["Connect with alumni", "https://alumni.srmist.edu.in/dir/"]],
  },
  "/contact": {
    label: "Contact and visit",
    title: "Get to the right team",
    intro: "For application help, use the admissions helpdesk and have your programme, campus and application reference ready. For clinical enquiries and visits to the teaching hospital, use the Medical College Hospital directory.",
    links: [apply, ["Medical College Hospital contacts", "https://medical.srmist.edu.in/contact-us/"], ["Campus transport", "https://www.srmist.edu.in/transport-facility/"]],
  },
};
