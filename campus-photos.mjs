const home = "https://www.srmist.edu.in/";
const engineering = home + "college/college-of-engineering-technology/";
export const photos = {
  tech: ["tech-park", "The orange and glass SRM Tech Park building at Kattankulathur", 768, 620, "SRM Tech Park, Kattankulathur", engineering],
  campus: ["campus-official", "The University Building rising above trees at Kattankulathur", 1024, 683, "University Building, Kattankulathur", home + "library/"],
  library: ["library-official", "A reader using a laptop alongside library computers", 1560, 1040, "Central Library", home + "library/"],
  admissions: ["admissions-official", "Students with lanyards gathered outside on campus", 768, 511, "Students at SRMIST", home],
  medicine: ["medicine-official", "Medical students in white coats examine teaching specimens", 1920, 1275, "Medicine and health sciences", home],
  culture: ["culture-official", "A dancer in a blue costume performs onstage", 480, 640, "Arts and culture", home],
  sports: ["sports-official", "An SRMIST sports team lined up on an outdoor court", 651, 434, "Sport at SRMIST", home],
  research: ["research-official", "Two researchers in protective clothing work with lab equipment", 900, 1157, "Research facilities", home],
  convocation: ["convocation-official", "Dignitaries in academic robes onstage at the 22nd SRMIST convocation", 1920, 1097, "22nd SRMIST Convocation", home],
  hostel: ["hostel-official", "A residence building beside a landscaped path at sunset", 480, 640, "Campus housing", home],
  architecture: ["architecture-official", "Architecture students discuss a scale building model", 1920, 1275, "Architecture studio", home],
  law: ["law-official", "Law students gathered outside a campus building", 1920, 1275, "Law at SRMIST", home],
  management: ["management-official", "Management students seated in a lecture room", 1920, 1275, "Management classroom", home],
  international: ["international-official", "Delegates meet around a table", 768, 512, "International Relations gallery", home + "ir/"],
};

export const pagePhoto = {
  "/about": "campus", "/academics": "tech", "/research": "research",
  "/campus-life": "culture", "/contact": "campus", "/more": "convocation",
  "/students": "library", "/exams": "management", "/programmes": "architecture",
  "/international": "international", "/visit": "tech", "/disclosures": "campus",
  "/updates": "convocation", "/accessibility": "hostel", "/privacy": "library",
  "/directory": "admissions",
};

export const photoStories = {
  "/": ["Beyond the classroom", "culture", "sports", "hostel"],
  "/academics": ["Inside the faculties", "architecture", "medicine", "law"],
  "/campus-life": ["A day on campus", "sports", "hostel", "library"],
  "/programmes": ["Explore fields of study", "medicine", "management", "law"],
};
