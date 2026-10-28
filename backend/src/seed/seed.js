/**
 * Seed script — populates MongoDB with demo data.
 *   npm run seed          (adds data)
 *   npm run seed:reset    (drops collections first)
 *
 * Creates: 1,000+ REAL schemes (NSP / myScheme / state-portal aligned),
 *          65+ real exams, 25+ competitions, 140 study materials,
 *          150 offices, 10 document guides, demo + admin users.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');
const { connectDB, disconnectDB } = require('../config/db');

const {
  User, Scheme, Exam, Competition, StudyMaterial, Office, DocumentGuide, AiQuery, Notification,
} = require('../models');
const { buildRealSchemes } = require('./realSchemes');
const {
  buildMoreExams, buildMoreCompetitions, buildMaterials: buildRealMaterials, MORE_GUIDES,
} = require('./realContent');

const RESET = process.argv.includes('--reset');

/* ---------------------------------------------------------------- helpers */
const slug = (s) => slugify(s, { lower: true, strict: true });
const days = (n) => new Date(Date.now() + n * 86400000);

/* ------------------------------------------------------------- office gen */
const OFFICE_SEEDS = [
  ['Tehsildar', 'Tehsil Office'], ['CSC', 'Common Service Centre'], ['Setu',
  'Setu Suvidha Kendra'], ['e-Seva', 'e-Seva Centre'], ['Collectorate', 'District Collectorate'],
  ['Municipal', 'Municipal Corporation'],
];
const SERVICES = ['Income Certificate', 'Caste Certificate', 'Domicile Certificate', 'Birth Certificate', 'Aadhaar Update'];

/* Real helplines published by the government (used instead of fabricated numbers). */
const REAL_HELPLINES = {
  CSC: '1800-180-1551',      // Common Service Centre scheme helpline (GoI)
  'e-Seva': '1100',          // State citizen helpline (AP / Telangana)
  Setu: '1100',              // Gujarat citizen facilitation helpline
};
// Tehsildar / Collectorate / Municipal numbers are district-specific — omitted rather than faked.

/* Real city coordinates (approx city centre) so the map lands in the right city. */
const DISTRICT_COORDS = {
  'Pune': [18.5204, 73.8567], 'Mumbai': [19.076, 72.8777], 'Nashik': [19.9975, 73.7898],
  'Nagpur': [21.1458, 79.0882], 'Lucknow': [26.8467, 80.9462], 'Kanpur': [26.4499, 80.3319],
  'Agra': [27.1767, 78.0081], 'Varanasi': [25.3176, 82.9739], 'Bengaluru': [12.9716, 77.5946],
  'Mysuru': [12.2958, 76.6394], 'Hubballi': [15.3647, 75.124], 'Chennai': [13.0827, 80.2707],
  'Coimbatore': [11.0168, 76.9558], 'Madurai': [9.9252, 78.1198], 'Ahmedabad': [23.0225, 72.5714],
  'Surat': [21.1702, 72.8311], 'Vadodara': [22.3072, 73.1812], 'Kolkata': [22.5726, 88.3639],
  'Howrah': [22.5958, 88.2636], 'Durgapur': [23.5204, 87.3119], 'Jaipur': [26.9124, 75.7873],
  'Jodhpur': [26.2389, 73.0243], 'Udaipur': [24.5854, 73.7125], 'Hyderabad': [17.385, 78.4867],
  'Warangal': [17.9689, 79.5941], 'Bhopal': [23.2599, 77.4126], 'Indore': [22.7196, 75.8577],
  'Jabalpur': [23.1815, 79.9864], 'Patna': [25.5941, 85.1376], 'Gaya': [24.7955, 85.0002],
  'Muzaffarpur': [26.1209, 85.3647], 'New Delhi': [28.6139, 77.209], 'Dwarka': [28.5921, 77.046],
  'Rohini': [28.7495, 77.0565], 'Ludhiana': [30.901, 75.8573], 'Amritsar': [31.634, 74.8723],
  'Thiruvananthapuram': [8.5241, 76.9366], 'Kochi': [9.9312, 76.2673], 'Bhubaneswar': [20.2961, 85.8245],
  'Cuttack': [20.4625, 85.8828], 'Guwahati': [26.1445, 91.7362], 'Silchar': [24.8333, 92.7789],
  'Gurugram': [28.4595, 77.0266], 'Faridabad': [28.4089, 77.3178], 'Hisar': [29.1492, 75.7217],
  'Raipur': [21.2514, 81.6296], 'Bhilai': [21.1938, 81.3509], 'Ranchi': [23.3441, 85.3096],
  'Dhanbad': [23.7957, 86.4304], 'Dehradun': [30.3165, 78.0322], 'Haridwar': [29.9457, 78.1642],
  'Shimla': [31.1048, 77.1734], 'Solan': [30.9089, 77.0965], 'Panaji': [15.4909, 73.8278],
  'Margao': [15.2832, 73.9863], 'Puducherry': [11.9416, 79.8083], 'Karaikal': [10.9254, 79.838],
  'Chandigarh': [30.7333, 76.7794], 'Srinagar': [34.0837, 74.7973], 'Jammu': [32.7266, 74.857],
};

const STATES_DISTRICTS = [
  ['Maharashtra', ['Pune', 'Mumbai', 'Nashik', 'Nagpur']],
  ['Uttar Pradesh', ['Lucknow', 'Kanpur', 'Agra', 'Varanasi']],
  ['Karnataka', ['Bengaluru', 'Mysuru', 'Hubballi']],
  ['Tamil Nadu', ['Chennai', 'Coimbatore', 'Madurai']],
  ['Gujarat', ['Ahmedabad', 'Surat', 'Vadodara']],
  ['West Bengal', ['Kolkata', 'Howrah', 'Durgapur']],
  ['Rajasthan', ['Jaipur', 'Jodhpur', 'Udaipur']],
  ['Telangana', ['Hyderabad', 'Warangal']],
  ['Madhya Pradesh', ['Bhopal', 'Indore', 'Jabalpur']],
  ['Bihar', ['Patna', 'Gaya', 'Muzaffarpur']],
  ['Delhi', ['New Delhi', 'Dwarka', 'Rohini']],
  ['Punjab', ['Ludhiana', 'Amritsar']],
  ['Kerala', ['Thiruvananthapuram', 'Kochi']],
  ['Odisha', ['Bhubaneswar', 'Cuttack']],
  ['Assam', ['Guwahati', 'Silchar']],
  ['Haryana', ['Gurugram', 'Faridabad', 'Hisar']],
  ['Chhattisgarh', ['Raipur', 'Bhilai']],
  ['Jharkhand', ['Ranchi', 'Dhanbad']],
  ['Uttarakhand', ['Dehradun', 'Haridwar']],
  ['Himachal Pradesh', ['Shimla', 'Solan']],
  ['Goa', ['Panaji', 'Margao']],
  ['Puducherry', ['Puducherry', 'Karaikal']],
  ['Chandigarh', ['Chandigarh']],
  ['Jammu & Kashmir', ['Srinagar', 'Jammu']],
];

function buildOffices() {
  const offices = [];
  let i = 0;
  STATES_DISTRICTS.forEach(([state, districts]) => {
    districts.forEach((district) => {
      const [baseLat, baseLng] = DISTRICT_COORDS[district] || [20 + (i % 12), 78 + (i % 8)];
      // 3 offices per district → 180 candidates, capped at 150 below
      const count = 3;
      for (let k = 0; k < count; k++) {
        const [type, base] = OFFICE_SEEDS[i % OFFICE_SEEDS.length];
        // Small real-world-scale jitter around the city centre
        const lat = baseLat + ((i % 7) - 3) * 0.012;
        const lng = baseLng + ((i % 5) - 2) * 0.012;
        offices.push({
          name: `${base} — ${district}`,
          type,
          address: `${base}, ${district}, ${state}`,
          state, district,
          lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)),
          phone: REAL_HELPLINES[type], // real helpline or omitted — never a fabricated number
          timings: 'Mon–Fri 10:00–17:00',
          servicesOffered: SERVICES.slice(0, 2 + (i % 3)),
          isActive: true,
        });
        i++;
      }
    });
  });
  return offices.slice(0, 150);
}

/* ------------------------------------------------------------- scheme gen */
const BASE_SCHEMES = [
  {
    name: 'National Merit Scholarship', type: 'central', provider: 'Ministry of Education',
    state: 'ALL', description: 'Merit-cum-means scholarship for meritorious students from low-income families across India.',
    eligibility: { minAge: 15, maxAge: 25, categories: ['General','OBC','SC','ST','EWS'], classLevels: ['11th','12th','UG','PG'], maxIncome: 800000, gender: 'any', domicileState: 'ALL' },
    benefits: { amount: 20000, duration: 'per year', type: 'scholarship' },
    requiredDocuments: ['Income Certificate', 'Caste Certificate', 'Domicile Certificate', 'Aadhaar', 'Bank Passbook'],
    applicationUrl: 'https://scholarships.gov.in', officialPortal: 'National Scholarship Portal', deadline: days(25), tags: ['merit','income-based'],
  },
  {
    name: 'Post Matric Scholarship for SC/ST', type: 'central', provider: 'Ministry of Social Justice',
    state: 'ALL', description: 'Full fee reimbursement and maintenance allowance for SC/ST students studying at post-matriculation level.',
    eligibility: { minAge: 15, maxAge: 30, categories: ['SC','ST'], classLevels: ['11th','12th','UG','PG'], maxIncome: 250000, gender: 'any', domicileState: 'ALL' },
    benefits: { amount: 12000, duration: 'per year', type: 'scholarship' },
    requiredDocuments: ['Caste Certificate', 'Income Certificate', 'Aadhaar', 'Bonafide Certificate', 'Bank Passbook'],
    applicationUrl: 'https://scholarships.gov.in', officialPortal: 'National Scholarship Portal', deadline: days(12), tags: ['sc','st','post-matric'],
  },
  {
    name: 'Central Sector Scheme of Scholarships', type: 'central', provider: 'Ministry of Education',
    state: 'ALL', description: 'Top 1% students in board exams receive financial assistance for higher education.',
    eligibility: { minAge: 17, maxAge: 25, categories: ['General','OBC','SC','ST','EWS'], classLevels: ['UG','PG'], maxIncome: 800000, gender: 'any', domicileState: 'ALL' },
    benefits: { amount: 20000, duration: 'per year', type: 'scholarship' },
    requiredDocuments: ['Income Certificate', 'Mark Sheet', 'Aadhaar', 'Bank Passbook'],
    applicationUrl: 'https://scholarships.gov.in', officialPortal: 'NSP', deadline: days(40), tags: ['merit','topper'],
  },
  {
    name: 'Begum Hazrat Mahal Scholarship', type: 'central', provider: 'Ministry of Minority Affairs',
    state: 'ALL', description: 'Scholarship for meritorious girl students from minority communities.',
    eligibility: { minAge: 14, maxAge: 25, categories: ['General','OBC','SC','ST'], classLevels: ['11th','12th','UG'], maxIncome: 200000, gender: 'female', domicileState: 'ALL' },
    benefits: { amount: 12000, duration: 'per year', type: 'scholarship' },
    requiredDocuments: ['Income Certificate', 'Minority Certificate', 'Aadhaar', 'Mark Sheet'],
    applicationUrl: 'https://scholarships.gov.in', officialPortal: 'NSP', deadline: days(18), tags: ['girl','minority','female'],
  },
  {
    name: 'Prime Minister Special Scholarship Scheme (PMSSS)', type: 'central', provider: 'All India Council for Technical Education',
    state: 'ALL', description: 'Scholarship for students from J&K and Northeast to study in professional courses anywhere in India.',
    eligibility: { minAge: 17, maxAge: 25, categories: ['General','OBC','SC','ST'], classLevels: ['UG'], maxIncome: 800000, gender: 'any', domicileState: 'ALL' },
    benefits: { amount: 30000, duration: 'per year', type: 'scholarship' },
    requiredDocuments: ['Domicile Certificate', 'Income Certificate', 'Aadhaar', 'Mark Sheet'],
    applicationUrl: 'https://www.aicte-india.org', officialPortal: 'AICTE', deadline: days(30), tags: ['j&k','northeast'],
  },
  {
    name: 'Maharashtra State Scholarship for OBC', type: 'state', provider: 'Directorate of Technical Education',
    state: 'Maharashtra', description: 'Fee concession and maintenance allowance for OBC students in Maharashtra.',
    eligibility: { minAge: 16, maxAge: 30, categories: ['OBC'], classLevels: ['12th','UG','PG'], maxIncome: 300000, gender: 'any', domicileState: 'Maharashtra' },
    benefits: { amount: 15000, duration: 'per year', type: 'scholarship' },
    requiredDocuments: ['Caste Certificate', 'Income Certificate', 'Domicile Certificate', 'Aadhaar'],
    applicationUrl: 'https://mahadbt.maharashtra.gov.in', officialPortal: 'MahaDBT', deadline: days(8), tags: ['obc','maharashtra'],
  },
  {
    name: 'UP Scholarship (Post Matric)', type: 'state', provider: 'UP Scholarship Portal',
    state: 'Uttar Pradesh', description: 'Uttar Pradesh government post-matric scholarship for SC/ST/OBC/Minority students.',
    eligibility: { minAge: 15, maxAge: 30, categories: ['SC','ST','OBC'], classLevels: ['11th','12th','UG','PG'], maxIncome: 250000, gender: 'any', domicileState: 'Uttar Pradesh' },
    benefits: { amount: 10000, duration: 'per year', type: 'scholarship' },
    requiredDocuments: ['Caste Certificate', 'Income Certificate', 'Domicile Certificate', 'Aadhaar', 'Bank Passbook'],
    applicationUrl: 'https://scholarship.up.gov.in', officialPortal: 'UP Scholarship', deadline: days(20), tags: ['up','post-matric'],
  },
  {
    name: 'Karnataka Post Matric Scholarship', type: 'state', provider: 'Department of Social Welfare',
    state: 'Karnataka', description: 'Financial assistance for SC/ST students in Karnataka pursuing higher studies.',
    eligibility: { minAge: 15, maxAge: 30, categories: ['SC','ST'], classLevels: ['11th','12th','UG','PG'], maxIncome: 250000, gender: 'any', domicileState: 'Karnataka' },
    benefits: { amount: 11000, duration: 'per year', type: 'scholarship' },
    requiredDocuments: ['Caste Certificate', 'Income Certificate', 'Domicile Certificate'],
    applicationUrl: 'https://sevasindhu.karnataka.gov.in', officialPortal: 'Seva Sindhu', deadline: days(15), tags: ['karnataka'],
  },
  {
    name: 'Tamil Nadu Tribal Scholarship', type: 'state', provider: 'Tamil Nadu Adi Dravidar Welfare',
    state: 'Tamil Nadu', description: 'Scholarship and hostel support for tribal students in Tamil Nadu.',
    eligibility: { minAge: 15, maxAge: 30, categories: ['ST'], classLevels: ['11th','12th','UG'], maxIncome: 200000, gender: 'any', domicileState: 'Tamil Nadu' },
    benefits: { amount: 13000, duration: 'per year', type: 'scholarship' },
    requiredDocuments: ['Caste Certificate', 'Income Certificate', 'Domicile Certificate', 'Aadhaar'],
    applicationUrl: 'https://tnesevatn.gov.in', officialPortal: 'TN e-Seva', deadline: days(22), tags: ['tribal','tamilnadu'],
  },
  {
    name: 'Gujarat EWS Scholarship', type: 'state', provider: 'Department of Social Justice',
    state: 'Gujarat', description: 'Support for Economically Weaker Section students in Gujarat.',
    eligibility: { minAge: 15, maxAge: 30, categories: ['EWS','General'], classLevels: ['11th','12th','UG','PG'], maxIncome: 600000, gender: 'any', domicileState: 'Gujarat' },
    benefits: { amount: 9000, duration: 'per year', type: 'scholarship' },
    requiredDocuments: ['Income Certificate', 'Domicile Certificate', 'Aadhaar'],
    applicationUrl: 'https://digitalgujarat.gov.in', officialPortal: 'Digital Gujarat', deadline: days(28), tags: ['ews','gujarat'],
  },
  {
    name: 'Narotam Sekhsaria Foundation PG Scholarship (Interest-Free Loan)', type: 'private', provider: 'Narotam Sekhsaria Foundation',
    state: 'ALL', description: '100% merit-based, interest-free loan scholarship (up to ₹20 lakh) for Indian students below 30 pursuing postgraduate study in pure/applied sciences, social sciences, humanities, law, architecture and management at prestigious institutions in India or abroad.',
    eligibility: { minAge: 17, maxAge: 29, categories: ['General','OBC','SC','ST','EWS'], classLevels: ['PG'], maxIncome: 800000, gender: 'any', domicileState: 'ALL' },
    benefits: { amount: 2000000, duration: 'up to ₹20 lakh (interest-free loan)', type: 'loan' },
    requiredDocuments: ['Mark Sheet', 'Aadhaar', 'Entrance Test Score (CAT/GATE/GRE/GMAT if applicable)'],
    applicationUrl: 'https://pg.nsfoundation.co.in', officialPortal: 'Narotam Sekhsaria Foundation', deadline: days(35), tags: ['private','merit','loan','pg'],
  },
  {
    name: 'CBSE Merit Scholarship Scheme for Single Girl Child', type: 'central', provider: 'Central Board of Secondary Education (CBSE)',
    state: 'ALL', description: '₹500 per month (₹12,000 total over 2 years) for meritorious single girl children who passed CBSE Class 10 with 60%+ marks and are studying Class 11 & 12 in CBSE-affiliated schools.',
    eligibility: { minAge: 14, maxAge: 18, categories: ['General','OBC','SC','ST','EWS'], classLevels: ['11th','12th'], maxIncome: 800000, gender: 'female', domicileState: 'ALL' },
    benefits: { amount: 12000, duration: 'total (₹500/month × 2 years)', type: 'scholarship' },
    requiredDocuments: ['CBSE Class 10 Mark Sheet', 'Aadhaar', 'School Bonafide', 'Bank Passbook', 'Affidavit (single girl child)'],
    applicationUrl: 'https://www.myscheme.gov.in/schemes/msssgc', officialPortal: 'CBSE / myScheme', deadline: days(20), tags: ['girl','female','cbse','school','merit'],
  },
];

function buildSchemes() {
  // Hand-curated BASE_SCHEMES + the 1,000+ real dataset
  // (NSP central schemes, education loans, state flagships, per-state programs).
  const all = [
    ...BASE_SCHEMES.map((b) => ({ ...b, slug: slug(b.name), isActive: true })),
    ...buildRealSchemes(),
  ];
  const seen = new Set();
  const out = [];
  for (const sc of all) {
    const k = sc.slug || slug(sc.name);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ ...sc, slug: k, isActive: true });
  }
  return out;
}

/* ------------------------------------------------------------------ exams */
const EXAM_SEEDS = [
  ['JEE Main', 'JEE', 'National Testing Agency', 120, 'https://jeemain.nta.nic.in'],
  ['JEE Advanced', 'JEE', 'IIT', 150, 'https://jeeadv.ac.in'],
  ['NEET UG', 'NEET', 'National Testing Agency', 95, 'https://neet.nta.nic.in'],
  ['MHT-CET', 'MHT-CET', 'State CET Cell', 110, 'https://cetcell.mahacet.org'],
  ['GATE', 'GATE', 'IIT / IISc', 180, 'https://gate.iitm.ac.in'],
  ['CLAT', 'CLAT', 'NLUs Consortium', 100, 'https://consortiumofnlus.ac.in'],
  ['CA Foundation', 'CA', 'ICAI', 140, 'https://www.icai.org'],
  ['UPSC CSE Prelims', 'UPSC', 'Union Public Service Commission', 160, 'https://upsc.gov.in'],
  ['UPSC CSE Mains', 'UPSC', 'Union Public Service Commission', 220, 'https://upsc.gov.in'],
  ['NEET PG', 'NEET', 'NBE', 170, 'https://natboard.edu.in'],
  ['AIBE (All India Bar Examination)', 'Other', 'Bar Council of India', 130, 'https://www.allindiabarexamination.com'],
  ['NPTEL Exam', 'Other', 'IIT', 60, 'https://nptel.ac.in'],
];

function buildExams() {
  const exams = [];
  EXAM_SEEDS.forEach(([name, stream, body, daysOut, url]) => {
    exams.push({
      name, slug: slug(name), stream, conductingBody: body,
      examDate: days(daysOut), registrationDeadline: days(Math.max(2, daysOut - 25)),
      eligibility: 'See official website', syllabusUrl: url, officialUrl: url,
      freeResources: [
        { title: 'SATHEE Free Lectures', url: 'https://sathee.gov.in', provider: 'SATHEE' },
        { title: 'NPTEL Courses', url: 'https://nptel.ac.in', provider: 'NPTEL' },
        { title: 'NCERT Textbooks', url: 'https://ncert.nic.in', provider: 'NCERT' },
      ],
      recommendedBooks: [
        { title: 'Concepts of Physics Vol 1 & 2', author: 'H.C. Verma', link: '' },
        { title: 'Objective Physics', author: 'DC Pandey', link: '' },
      ],
      mockTests: [
        { title: 'Free Mock Tests — SATHEE (Govt of India)', url: 'https://sathee.gov.in' },
        { title: 'Free Practice Tests — SWAYAM', url: 'https://swayam.gov.in' },
      ],
      coachingLinks: [{ title: 'Free Govt Coaching (SC/ST/OBC)', url: 'https://coaching.gov.in', provider: 'Govt' }],
      roadmap: [
        { phase: '1', title: 'Foundation', months: 'Months 1–4', detail: 'NCERT + concept videos, build basics.' },
        { phase: '2', title: 'Practice', months: 'Months 5–8', detail: 'Solve PYQs, weekly mocks, weak-topic drills.' },
        { phase: '3', title: 'Revision', months: 'Months 9–12', detail: 'Short notes, full-length mocks, exam strategy.' },
      ],
      isActive: true,
    });
  });
  // Add real exams (NTA, UPSC, SSC, banking, defence, management, state CETs, olympiads)
  buildMoreExams().forEach((e) => exams.push(e));
  const seen = new Set();
  const unique = [];
  for (const e of exams) if (!seen.has(e.slug)) { seen.add(e.slug); unique.push(e); }
  exams.length = 0;
  unique.forEach((e) => exams.push(e));
  return exams;
}

/* ----------------------------------------------------------- competitions */
function buildCompetitions() {
  // Real competitions — each links to its official website
  const seed = [
    ['Smart India Hackathon (SIH)', 'SIH', 'hackathon', 'Ministry of Education', 'hybrid', 'https://sih.gov.in'],
    ['HBCSE Olympiad (Physics)', 'HBCSE', 'olympiad', 'HBCSE Mumbai', 'offline', 'https://hbcse.tifr.res.in'],
    ['HBCSE Olympiad (Chemistry)', 'HBCSE', 'olympiad', 'HBCSE Mumbai', 'offline', 'https://hbcse.tifr.res.in'],
    ['INSPIRE Awards (MANAK)', 'INSPIRE', 'hackathon', 'Dept of Science & Technology', 'offline', 'https://www.online-inspire.gov.in'],
    ['e-Yantra Robotics Competition', 'e-Yantra', 'hackathon', 'IIT Bombay', 'online', 'https://e-yantra.org'],
    ['International Mathematical Olympiad (IMO) Training Camp', 'Olympiad', 'olympiad', 'HBCSE Mumbai', 'offline', 'https://olympiads.hbcse.tifr.res.in'],
    ['National Science Olympiad (NSO)', 'Olympiad', 'olympiad', 'Science Olympiad Foundation', 'offline', 'https://www.sofworld.org'],
    ['NSTSE (National Standard Talent Search)', 'Other', 'olympiad', 'Unified Council', 'offline', 'https://www.unifiedcouncil.com'],
  ];
  const comps = [];
  seed.forEach(([name, type, category, organizer, mode, url]) => {
    comps.push({
      name, slug: slug(name), type, category, organizer, mode,
      startDate: days(-5), endDate: days(20), registrationDeadline: days(10),
      eligibility: 'Open to Indian students', prizeDetails: 'Certificates, medals & prizes',
      registrationUrl: url, tags: [type.toLowerCase()], isActive: true,
    });
  });
  // Add real competitions (TCS CodeVita, Flipkart GRiD, INOs, WRO, YUVIKA, Space Apps…)
  buildMoreCompetitions().forEach((c) => comps.push(c));
  const seenC = new Set();
  const uniqueC = [];
  for (const c of comps) if (!seenC.has(c.slug)) { seenC.add(c.slug); uniqueC.push(c); }
  comps.length = 0;
  uniqueC.forEach((c) => comps.push(c));
  return comps;
}

/* ------------------------------------------------------------ materials */
function buildMaterials() {
  // 140 materials across subjects/levels × notes/video/pyq/mock,
  // sourced from real free platforms (NCERT, DIKSHA, SWAYAM, NPTEL, SATHEE…).
  return buildRealMaterials(140);
}

/* ------------------------------------------------------- document guides */
const GUIDES = [
  {
    docType: 'Income Certificate',
    summary: 'Proof of annual family income, required for most need-based scholarships.',
    requiredProofs: ['Aadhaar', 'Ration Card / Salary Slip / Self Declaration'],
    steps: [
      { order: 1, title: 'Gather proof', description: 'Collect Aadhaar, ration card, salary slip or a self-declaration of income.', officeType: 'Online', fee: '—', timeline: '—' },
      { order: 2, title: 'Apply at Tehsildar / CSC', description: 'Submit the application online on your state portal or in person at the Tehsildar office or a CSC.', officeType: 'Tehsildar', fee: '₹20–₹60', timeline: '—' },
      { order: 3, title: 'Verification & collection', description: 'The officer verifies your records. Collect the signed certificate.', officeType: 'Tehsildar', fee: '—', timeline: '7–15 days' },
    ],
  },
  {
    docType: 'Caste Certificate',
    summary: 'Official proof of caste (SC/ST/OBC), needed for reserved-category scholarships.',
    requiredProofs: ['Parents\' / ancestor\'s caste proof', 'School records', 'Aadhaar'],
    steps: [
      { order: 1, title: 'Collect ancestry proof', description: 'Gather parents\' or grandfather\'s caste certificate, school records and Aadhaar.', officeType: 'Online', fee: '—', timeline: '—' },
      { order: 2, title: 'Apply at Tehsildar / SDM', description: 'Apply online or at the Tehsildar / SDM office in your district.', officeType: 'Tehsildar', fee: '₹30–₹100', timeline: '—' },
      { order: 3, title: 'Field verification', description: 'A local enquiry may be conducted. Collect the certificate once approved.', officeType: 'Tehsildar', fee: '—', timeline: '15–30 days' },
    ],
  },
  {
    docType: 'Domicile Certificate',
    summary: 'Proof that you are a resident of a state — required for state scholarships.',
    requiredProofs: ['Address proof (Aadhaar / electricity bill)', 'School record'],
    steps: [
      { order: 1, title: 'Gather address proof', description: 'Aadhaar, electricity bill or school leaving certificate showing your address.', officeType: 'Online', fee: '—', timeline: '—' },
      { order: 2, title: 'Apply online / at e-Seva', description: 'Apply on your state portal or visit the nearest e-Seva / Setu centre.', officeType: 'e-Seva', fee: '₹20–₹50', timeline: '—' },
      { order: 3, title: 'Collect certificate', description: 'Download or collect the domicile certificate.', officeType: 'e-Seva', fee: '—', timeline: '7–21 days' },
    ],
  },
  {
    docType: 'Aadhaar',
    summary: 'Unique identity number, mandatory for DBT-linked scholarships.',
    requiredProofs: ['Proof of identity', 'Proof of address'],
    steps: [
      { order: 1, title: 'Visit an Aadhaar centre / CSC', description: 'Carry identity and address proof.', officeType: 'CSC', fee: 'Free / ₹50', timeline: '—' },
      { order: 2, title: 'Biometric enrolment', description: 'Fingerprints and photo are captured.', officeType: 'CSC', fee: '—', timeline: '—' },
      { order: 3, title: 'Receive Aadhaar', description: 'e-Aadhaar is available within days; physical copy later.', officeType: 'CSC', fee: '—', timeline: '5–30 days' },
    ],
  },
  {
    docType: 'Bank Passbook',
    summary: 'Bank account proof for direct benefit transfer (DBT) of scholarships.',
    requiredProofs: ['Aadhaar', 'Admission letter (for student account)'],
    steps: [
      { order: 1, title: 'Open / update account', description: 'Open a student account or update KYC with Aadhaar seeding.', officeType: 'CSC', fee: 'Varies', timeline: '—' },
      { order: 2, title: 'Seed Aadhaar & apply for DBT', description: 'Link Aadhaar and enable DBT with the bank branch.', officeType: 'CSC', fee: '—', timeline: '1–7 days' },
    ],
  },
  {
    docType: 'Bonafide Certificate',
    summary: 'Certificate issued by your institution confirming current admission.',
    requiredProofs: ['Student ID / fee receipt'],
    steps: [
      { order: 1, title: 'Apply at your institution', description: 'Request a bonafide certificate from the college/school administration office.', officeType: 'Online', fee: '₹10–₹50', timeline: '—' },
      { order: 2, title: 'Collect signed copy', description: 'Collect the stamped and signed certificate.', officeType: 'Online', fee: '—', timeline: '1–5 days' },
    ],
  },
];

/* ------------------------------------------------------------------ users */
async function buildUsers() {
  const users = [];
  const demo = new User({
    name: 'Demo Student', email: 'demo@student.in', phone: '9876543210',
    dob: new Date('2005-06-15'), gender: 'female', state: 'Maharashtra', district: 'Pune',
    category: 'OBC', classLevel: 'UG', annualIncome: 150000, aadhaarLinked: true,
    preferredLanguage: 'hi', role: 'student', isDemo: true,
    documents: [
      { type: 'Aadhaar', verified: true, uploadedAt: new Date() },
      { type: 'Bank Passbook', verified: true, uploadedAt: new Date() },
    ],
  });
  await demo.setPassword('demo123');
  users.push(demo);

  const admin = new User({
    name: 'SSAP Admin', email: 'admin@ssap.in', role: 'admin',
    preferredLanguage: 'en', state: 'Delhi', category: 'General', classLevel: 'PG',
  });
  await admin.setPassword('admin123');
  users.push(admin);

  return users;
}

/* ------------------------------------------------------------------- main */
async function seed(opts = {}) {
  await connectDB();
  if (RESET) {
    console.log('[seed] resetting collections...');
    await Promise.all([
      User.deleteMany({}), Scheme.deleteMany({}), Exam.deleteMany({}),
      Competition.deleteMany({}), StudyMaterial.deleteMany({}), Office.deleteMany({}),
      DocumentGuide.deleteMany({}), AiQuery.deleteMany({}), Notification.deleteMany({}),
    ]);
  }

  console.log('[seed] inserting users...');
  const users = await buildUsers();
  await User.insertMany(users);
  const demoUser = users[0];

  console.log('[seed] inserting schemes...');
  const schemes = buildSchemes();
  console.log(`[seed] building ${schemes.length} schemes (real NSP/myScheme/state dataset)...`);
  await Scheme.insertMany(schemes);

  console.log('[seed] inserting exams...');
  await Exam.insertMany(buildExams());

  console.log('[seed] inserting competitions...');
  await Competition.insertMany(buildCompetitions());

  console.log('[seed] inserting materials...');
  await StudyMaterial.insertMany(buildMaterials());

  console.log('[seed] inserting offices...');
  await Office.insertMany(buildOffices());

  console.log('[seed] inserting document guides...');
  await DocumentGuide.insertMany([...GUIDES, ...MORE_GUIDES].map((g) => ({ ...g, docTypeLocalized: {} })));

  // Save a few schemes to the demo user
  demoUser.savedSchemes = schemes.slice(0, 3).map((s) => s._id);
  await demoUser.save();

  // Seed a couple of notifications
  await Notification.insertMany([
    { userId: demoUser._id, type: 'newScheme', title: 'New scholarship matches your profile', body: 'Check the Eligibility Engine for 5 new matches.', link: '/schemes', read: false },
    { userId: demoUser._id, type: 'deadline', title: 'Post Matric Scholarship closes soon', body: 'Complete your documents and apply.', link: '/documents', read: false },
  ]);

  console.log('[seed] ✅ done');
  console.log('   demo login   : demo@student.in / demo123');
  console.log('   admin login  : admin@ssap.in / admin123');
  if (opts.exit !== false) {
    await disconnectDB();
    process.exit(0);
  }
}

/** Populate an empty database (used by the server on first boot in production). */
async function seedIfEmpty() {
  const count = await Scheme.estimatedDocumentCount();
  if (count > 0) return false;
  console.log('[seed] empty database detected — seeding demo data...');
  await seed({ exit: false });
  return true;
}

module.exports = { seed, seedIfEmpty };

// Run standalone when invoked directly (npm run seed), but not when imported.
if (require.main === module) {
  seed().catch((err) => {
    console.error('[seed] error:', err);
    process.exit(1);
  });
}
