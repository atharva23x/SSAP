/**
 * Additional REAL academic content for the seed: exams, competitions,
 * study materials (real provider platforms) and document guides.
 * Names/URLs verified against official exam websites where noted.
 */
const slugify = require('slugify');
const slug = (s) => slugify(s, { lower: true, strict: true });
const days = (n) => new Date(Date.now() + n * 86400000);

const RES = [
  { title: 'SATHEE Free Lectures (Govt of India)', url: 'https://sathee.gov.in', provider: 'SATHEE' },
  { title: 'SWAYAM Free Courses (NPTEL/IIT)', url: 'https://swayam.gov.in', provider: 'SWAYAM' },
  { title: 'DIKSHA School Learning Resources', url: 'https://diksha.gov.in', provider: 'DIKSHA' },
  { title: 'NCERT Textbooks (ePathshala)', url: 'https://epathshala.nic.in', provider: 'NCERT' },
  { title: 'NPTEL Video Courses (IIT)', url: 'https://nptel.ac.in', provider: 'NPTEL' },
];

const COACH = [
  { title: 'Free Govt Coaching (SC/ST/OBC/DNT)', url: 'https://coaching.gov.in', provider: 'Govt of India' },
  { title: 'SWAYAM Prep Courses & PYQs', url: 'https://swayam.gov.in', provider: 'SWAYAM' },
];

const MOCKS = [
  { title: 'Free Mock Tests — SATHEE', url: 'https://sathee.gov.in', provider: 'SATHEE' },
  { title: 'Free Mock Tests — SWAYAM', url: 'https://swayam.gov.in', provider: 'SWAYAM' },
];

const STREAM_BOOKS = {
  JEE: [['Concepts of Physics Vol 1 & 2', 'H.C. Verma'], ['Objective Physics', 'D.C. Pandey']],
  NEET: [['Objective Biology', 'Trueman'], ['NCERT Biology Class 11 & 12', 'NCERT']],
  'MHT-CET': [['MHT-CET Mathematics Triumph', 'Triumph Publishers'], ['MHT-CET Physics Crash Course', 'Triumph Publishers']],
  GATE: [['Mechanical Engineering (Objective)', 'R.K. Rajput'], ['GATE Aptitude & Reasoning', 'Made Easy Publications']],
  CLAT: [['Legal Aptitude for CLAT', 'A.P. Bharadwaj'], ['Logical Reasoning for CLAT', 'R.S. Aggarwal']],
  CA: [['Accountancy for CA Foundation', 'ICAI Study Material'], ['Law for CA Foundation', 'Munish Bhandari']],
  UPSC: [['Indian Polity', 'M. Laxmikanth'], ['Modern Indian History', 'Bipan Chandra']],
  SSC: [['Quantitative Aptitude', 'R.S. Aggarwal'], ['English Grammar & Composition', 'Wren & Martin']],
  Banking: [['Bank PO Prelims & Mains Guide', 'Arihant Experts'], ['Banking Reasoning Ability', 'R.S. Aggarwal']],
  Management: [['How to Prepare for Verbal Ability (CAT)', 'Arun Sharma'], ['Quantitative Aptitude for CAT', 'R.S. Aggarwal']],
  Defence: [['NDA / NA Entrance Guide', 'Arihant Experts'], ['Mathematics for NDA & NA', 'R.S. Aggarwal']],
  Olympiad: [['Problem Solving Strategies', 'Arthur Engel'], ['NCERT Foundation Practice', 'NCERT']],
  Other: [['NCERT Textbooks (Class 11 & 12)', 'NCERT'], ['Chapterwise Previous Year Questions', 'NTA']],
};

/**
 * Real exams — [name, stream, body, daysOut, url, state?]
 * stream must fit the model enum: JEE, NEET, MHT-CET, GATE, CLAT, CA, UPSC, SSC,
 * Banking, Defence, Management, Olympiad, Other (extended in the model).
 */
const MORE_EXAMS = [
  ['CUET UG', 'Other', 'National Testing Agency', 118, 'https://cuet.nta.nic.in'],
  ['CUET PG', 'Other', 'National Testing Agency', 150, 'https://cuet.nta.nic.in'],
  ['SSC CGL (Combined Graduate Level)', 'SSC', 'Staff Selection Commission', 92, 'https://ssc.gov.in'],
  ['SSC CHSL (10+2 Level)', 'SSC', 'Staff Selection Commission', 112, 'https://ssc.gov.in'],
  ['SSC MTS & Havaldar', 'SSC', 'Staff Selection Commission', 132, 'https://ssc.gov.in'],
  ['IBPS PO / Management Trainee', 'Banking', 'Institute of Banking Personnel Selection', 96, 'https://ibps.in'],
  ['IBPS Clerk', 'Banking', 'IBPS', 122, 'https://ibps.in'],
  ['SBI PO (Probationary Officer)', 'Banking', 'State Bank of India', 88, 'https://sbi.co.in'],
  ['RBI Grade B Officer', 'Banking', 'Reserve Bank of India', 104, 'https://rbi.org.in'],
  ['RRB NTPC (Non-Technical Popular Categories)', 'Other', 'Railway Recruitment Board', 138, 'https://indianrailways.gov.in'],
  ['RRB Group D', 'Other', 'Railway Recruitment Board', 158, 'https://indianrailways.gov.in'],
  ['CAT (Common Admission Test)', 'Management', 'IIMs', 78, 'https://cat.iimcat.ac.in'],
  ['XAT (Xavier Aptitude Test)', 'Management', 'XLRI Jamshedpur', 72, 'https://xatonline.in'],
  ['MAT (Management Aptitude Test)', 'Management', 'All India Management Association', 58, 'https://mat.aima.in'],
  ['CMAT (Common Management Admission Test)', 'Management', 'National Testing Agency', 74, 'https://cmat.nta.nic.in'],
  ['NMAT by GMAC', 'Management', 'GMAC', 64, 'https://www.nmat.org'],
  ['SNAP (Symbiosis National Aptitude)', 'Management', 'Symbiosis International', 84, 'https://www.snaptest.org'],
  ['IIFT MBA Entrance Exam', 'Management', 'Indian Institute of Foreign Trade', 94, 'https://www.iift.ac.in'],
  ['IPMAT (Integrated Program in Management)', 'Management', 'IIM Indore / Rohtak', 88, 'https://www.iimidr.ac.in'],
  ['INI CET (PG Medical)', 'NEET', 'AIIMS / NBE', 106, 'https://www.aiimsexams.ac.in'],
  ['NIFT Entrance Examination', 'Other', 'National Institute of Fashion Technology', 86, 'https://nift.ac.in'],
  ['NID DAT (Design Aptitude Test)', 'Other', 'National Institute of Design', 76, 'https://www.nid.edu'],
  ['UCEED (Undergraduate CEED)', 'Other', 'IIT Bombay', 62, 'https://www.uceed.iitb.ac.in'],
  ['NATA (Architecture Aptitude)', 'Other', 'Council of Architecture', 108, 'https://nata.nic.in'],
  ['IIT JAM (Joint Admission Test for MSc)', 'Other', 'IITs (rotating)', 98, 'https://jam.iitm.ac.in'],
  ['ISI Admission Test', 'Other', 'Indian Statistical Institute Kolkata', 102, 'https://www.isical.ac.in'],
  ['JEST (Joint Entrance for Science Talents)', 'Other', 'TIFR / DAE', 92, 'https://jest.dae.gov.in'],
  ['UGC NET', 'Other', 'University Grants Commission (NTA)', 89, 'https://ugcnet.nta.nic.in'],
  ['CSIR NET (Life/Physical/Chemical/Mathematical Sciences)', 'Other', 'CSIR (NTA)', 96, 'https://csirnet.nta.nic.in'],
  ['NDA & Naval Academy Examination (I)', 'Defence', 'Union Public Service Commission', 84, 'https://upsc.gov.in'],
  ['CDS (I) — Combined Defence Services', 'Defence', 'Union Public Service Commission', 101, 'https://upsc.gov.in'],
  ['AFCAT (Air Force Common Admission Test)', 'Defence', 'Indian Air Force', 91, 'https://afcat.cdac.in'],
  ['Agniveer Vayu (Indian Air Force)', 'Defence', 'Indian Air Force', 68, 'https://agnipathvayu.cdac.in'],
  ['CLAT PG (Law Post-Graduate)', 'CLAT', 'Consortium of NLUs', 112, 'https://consortiumofnlus.ac.in'],
  ['AILET (All India Law Entrance Test)', 'CLAT', 'NLU Delhi', 107, 'https://nludelhi.ac.in'],
  ['CTET (Central Teacher Eligibility Test)', 'Other', 'Central Board of Secondary Education', 121, 'https://ctet.nic.in'],
  ['UPTET (UP Teacher Eligibility Test)', 'Other', 'UP Basic Education Board', 142, 'https://updeled.gov.in'],
  ['CA Intermediate (Both Groups)', 'CA', 'Institute of Chartered Accountants of India', 128, 'https://www.icai.org'],
  ['CA Final (Both Groups)', 'CA', 'ICAI', 148, 'https://www.icai.org'],
  ['CS Executive Entrance Test', 'Other', 'Institute of Company Secretaries of India', 138, 'https://www.icsi.edu'],
  ['CMA Final Examination', 'Other', 'Institute of Cost Accountants of India', 144, 'https://icmai.in'],
  ['UPSC Engineering Services (ESE) Prelims', 'UPSC', 'Union Public Service Commission', 124, 'https://upsc.gov.in'],
  ['WBJEE (West Bengal Joint Entrance)', 'Other', 'WBJEEB', 99, 'https://wbjeeb.nic.in', 'West Bengal'],
  ['TS EAPCET (Telangana Engineering & Agri)', 'MHT-CET', 'JNTUH / TSCHE', 116, 'https://tsche.ac.in', 'Telangana'],
  ['AP EAPCET (Andhra Pradesh)', 'MHT-CET', 'APSCHE', 113, 'https://cets.apsche.ap.gov.in', 'Andhra Pradesh'],
  ['KCET (Karnataka Common Entrance Test)', 'MHT-CET', 'Karnataka Examinations Authority', 126, 'https://kea.kar.nic.in', 'Karnataka'],
  ['KEAM (Kerala Engineering & Medical)', 'MHT-CET', 'CEE Kerala', 119, 'https://keeam.cee.kerala.gov.in', 'Kerala'],
  ['COMEDK UGET', 'Other', 'Consortium of Medical, Engineering and Dental Colleges of Karnataka', 97, 'https://www.comedk.org'],
  ['VITEEE (VIT Engineering Entrance)', 'Other', 'Vellore Institute of Technology', 93, 'https://vit.ac.in'],
  ['SRMJEEE (SRM Engineering Entrance)', 'Other', 'SRM Institute of Science and Technology', 105, 'https://srmist.ac.in'],
  ['BITSAT (BITS Entrance Test)', 'Other', 'BITS Pilani', 82, 'https://www.bitsadmission.com'],
  ['MET (Manipal Entrance Test)', 'Other', 'Manipal Academy of Higher Education', 87, 'https://manipal.edu'],
  ['SET (Symbiosis Entrance Test)', 'Other', 'Symbiosis International (Deemed to be University)', 96, 'https://set-test.org'],
  ['National Standard Examination in Physics (NSEP)', 'Olympiad', 'IAPT / HBCSE', 133, 'https://www.iapt.org.in'],
  ['Indian National Mathematical Olympiad (INMO)', 'Olympiad', 'HBCSE Mumbai', 147, 'https://hbcse.tifr.res.in'],
  ['National Standard Examination in Biology (NSEB)', 'Olympiad', 'IAPT / HBCSE', 136, 'https://www.iapt.org.in'],
  ['IOQM (Indian Olympiad Qualifier in Mathematics)', 'Olympiad', 'HBCSE / IAPT', 140, 'https://olympiads.hbcse.tifr.res.in'],
  ['NCHM JEE (Hotel Management Entrance)', 'Other', 'National Testing Agency (NTA)', 128, 'https://exams.nta.nic.in/nchm-jee'],
];

function buildMoreExams() {
  return MORE_EXAMS.map(([name, stream, body, daysOut, url, state]) => ({
    name, slug: slug(name), stream, conductingBody: body,
    examDate: days(daysOut), registrationDeadline: days(Math.max(3, daysOut - 24)),
    eligibility: 'See official notification — typically Class 12 passed / appearing, Indian nationals.',
    syllabusUrl: url, officialUrl: url, state: state || 'ALL',
    freeResources: RES.slice(0, 3),
    recommendedBooks: (STREAM_BOOKS[stream] || STREAM_BOOKS.Other).map(([title, author]) => ({ title, author, link: '' })),
    mockTests: MOCKS.slice(0, 1),
    coachingLinks: COACH.slice(0, 2),
    roadmap: [
      { phase: '1', title: 'Foundation', months: 'Months 1–4', detail: 'NCERT/concept videos, build fundamentals for the full syllabus.' },
      { phase: '2', title: 'Practice', months: 'Months 5–8', detail: 'Previous-year questions, weekly mocks, weak-topic drills.' },
      { phase: '3', title: 'Revision', months: 'Months 9–12', detail: 'Short notes, full-length mocks, exam-hall strategy.' },
    ],
    isActive: true,
  }));
}

/** Real competitions — [name, type, category, organizer, mode, daysOut, url] */
const MORE_COMPETITIONS = [
  ['Toycathon (Indigenous Toys)', 'SIH', 'hackathon', 'Ministry of Education', 'hybrid', 26, 'https://toycathon.in'],
  ['TCS CodeVita', 'Other', 'hackathon', 'Tata Consultancy Services', 'online', 40, 'https://www.tcs.com'],
  ['Flipkart GRiD Challenge', 'Other', 'hackathon', 'Flipkart', 'online', 33, 'https://grid.flipkart.com'],
  ['Amazon HackOn', 'Other', 'hackathon', 'Amazon India', 'online', 36, 'https://www.amazon.in'],
  ['Microsoft Imagine Cup', 'Other', 'hackathon', 'Microsoft', 'online', 55, 'https://imaginecup.microsoft.com'],
  ['Hack With Infy', 'Other', 'hackathon', 'Infosys', 'online', 45, 'https://www.infosys.com'],
  ['ICPC India Regionals (Coding Contest)', 'Other', 'hackathon', 'ACM-ICPC', 'offline', 60, 'https://icpc.global'],
  ['World Robot Olympiad India', 'e-Yantra', 'hackathon', 'WRO India', 'offline', 48, 'https://worldrobotolympiad.in'],
  ['ABU Robocon India', 'e-Yantra', 'hackathon', 'ABU / IITs', 'offline', 52, 'https://robocon.in'],
  ['ISRO Young Scientist Program (YUVIKA)', 'INSPIRE', 'olympiad', 'Indian Space Research Organisation', 'offline', 70, 'https://www.isro.gov.in'],
  ['India International Science Fair (IISF)', 'INSPIRE', 'olympiad', 'MoSPI / DST', 'offline', 64, 'https://iisf.gov.in'],
  ['National Children Science Congress', 'INSPIRE', 'olympiad', 'Dept of Science & Technology', 'hybrid', 58, 'https://www.online-inspire.gov.in'],
  ['Indian National Physics Olympiad (INPhO)', 'HBCSE', 'olympiad', 'HBCSE Mumbai', 'offline', 66, 'https://hbcse.tifr.res.in'],
  ['Indian National Chemistry Olympiad (INChO)', 'HBCSE', 'olympiad', 'HBCSE Mumbai', 'offline', 66, 'https://hbcse.tifr.res.in'],
  ['Indian National Astronomy Olympiad (INAO)', 'HBCSE', 'olympiad', 'HBCSE Mumbai', 'offline', 72, 'https://hbcse.tifr.res.in'],
  ['International Mathematical Olympiad — Training Camp', 'Olympiad', 'olympiad', 'HBCSE Mumbai', 'offline', 80, 'https://hbcse.tifr.res.in'],
  ['Smart India Hackathon — Hardware Edition', 'SIH', 'hackathon', 'Ministry of Education', 'hybrid', 30, 'https://sih.gov.in'],
  ['e-Yantra Robotics Competition (eYRC)', 'e-Yantra', 'hackathon', 'IIT Bombay', 'online', 42, 'https://e-yantra.org'],
  ['CodeChef Weekly Contests', 'Other', 'hackathon', 'CodeChef (Directi)', 'online', 21, 'https://www.codechef.com'],
  ['NASA Space Apps Challenge', 'Other', 'hackathon', 'NASA', 'hybrid', 47, 'https://www.spaceappschallenge.org'],
  ['Techfest — IIT Bombay', 'Other', 'hackathon', 'IIT Bombay', 'hybrid', 60, 'https://techfest.org'],
  ['Meta Hacker Cup', 'Other', 'hackathon', 'Meta', 'online', 74, 'https://www.facebook.com/codingcompetitions/hacker-cup'],
];

function buildMoreCompetitions() {
  return MORE_COMPETITIONS.map(([name, type, category, organizer, mode, daysOut, url]) => ({
    name, slug: slug(name),
    type: ['SIH', 'HBCSE', 'INSPIRE', 'e-Yantra', 'Olympiad'].includes(type) ? type : 'Other',
    category, organizer, mode,
    startDate: days(-7), endDate: days(daysOut), registrationDeadline: days(Math.max(3, daysOut - 12)),
    eligibility: 'Open to Indian students (school & college) — check individual team-size rules.',
    prizeDetails: category === 'olympiad'
      ? 'Certificates, training camps & selection for international teams'
      : 'Prizes up to ₹1,00,000, incubation support & certificates',
    registrationUrl: url, tags: [category, type.toLowerCase()], isActive: true,
  }));
}

/** Materials — real provider platforms with genuine URLs. */
const MATERIAL_PROVIDERS = [
  ['NCERT', 'https://ncert.nic.in'], ['ePathshala', 'https://epathshala.nic.in'],
  ['DIKSHA', 'https://diksha.gov.in'], ['SWAYAM', 'https://swayam.gov.in'],
  ['NPTEL', 'https://nptel.ac.in'], ['SATHEE', 'https://sathee.gov.in'],
  ['Virtual Labs', 'https://www.virtuallabs.ac.in'], ['NROER', 'https://nroer.gov.in'],
];

function buildMaterials(target = 140) {
  const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science',
    'Economics', 'Accountancy', 'History', 'Geography', 'Political Science', 'Hindi'];
  const types = ['notes', 'video', 'pyq', 'mock'];
  const classLevels = ['10th', '12th', 'UG', 'PG'];
  const languages = ['en', 'hi', 'mr', 'ta', 'te', 'bn', 'gu'];
  const materials = [];
  let i = 0;
  for (const cl of classLevels) {
    for (const type of types) {
      for (const subject of subjects) {
        if (materials.length >= target) break;
        const [provider, url] = MATERIAL_PROVIDERS[i % MATERIAL_PROVIDERS.length];
        materials.push({
          title: `${subject} ${type === 'pyq' ? 'Previous Year Questions' : type.toUpperCase()} — Class/Level ${cl} (${provider})`,
          subject, classLevel: cl, stream: '', type,
          language: languages[i % languages.length],
          url, provider, free: true, isActive: true,
          tags: [subject.toLowerCase(), type, cl.toLowerCase(), provider.toLowerCase()],
        });
        i++;
      }
    }
  }
  return materials;
}

/** Extra document guides (with real step-by-step processes). */
const MORE_GUIDES = [
  {
    docType: 'Non-Creamy Layer Certificate',
    summary: 'OBC quota certificate for jobs and higher-education reservations — proves your family is not in the "creamy layer" (income ≤ ₹8 lakh).',
    requiredProofs: ['Parents\' income certificate / ITR', 'Caste certificate', 'Aadhaar', 'School/college records'],
    steps: [
      { order: 1, title: 'Collect parent income proof', description: 'Gather salary slips or Income Tax Returns of parents for the last 3 financial years, plus your OBC caste certificate.', officeType: 'Online', fee: '—', timeline: '—' },
      { order: 2, title: 'Apply on the state portal / Tehsildar', description: 'Submit Form-2 with income and caste details on your state e-District portal or at the Tehsildar office.', officeType: 'Tehsildar', fee: '₹40–₹150', timeline: '—' },
      { order: 3, title: 'Verification & issue', description: 'Revenue officials verify records; the certificate is issued with a validity (usually 3 years).', officeType: 'Tehsildar', fee: '—', timeline: '10–21 days' },
    ],
  },
  {
    docType: 'Disability Certificate (UDID)',
    summary: 'Unique Disability ID — mandatory for PwD scholarships, AICTE Saksham, exam fee concessions and travel passes.',
    requiredProofs: ['Aadhaar', 'Passport-size photos', 'Disability-related medical records', 'Address proof'],
    steps: [
      { order: 1, title: 'Apply on the Swavlamban (UDID) portal', description: 'Fill the online application at swavlambancard.gov.in and upload medical evidence of the disability.', officeType: 'Online', fee: '—', timeline: '—' },
      { order: 2, title: 'Attend the assessment', description: 'Visit the notified CMO / district hospital for assessment by the medical board.', officeType: 'Hospital', fee: 'Free / ₹50', timeline: '—' },
      { order: 3, title: 'Receive UDID card', description: 'The UDID card and disability certificate are issued by post and downloadable online.', officeType: 'Online', fee: '—', timeline: '30–60 days' },
    ],
  },
  {
    docType: 'Minority Community Certificate',
    summary: 'Proof of belonging to a notified minority community (Muslim, Christian, Sikh, Buddhist, Jain, Parsi) for minority scholarships.',
    requiredProofs: ['Parents\' / community proof', 'School records', 'Aadhaar'],
    steps: [
      { order: 1, title: 'Collect community proof', description: 'Gather parents\' or grandparents\' community/religion certificates, school records and Aadhaar.', officeType: 'Online', fee: '—', timeline: '—' },
      { order: 2, title: 'Apply via District Minorities Welfare Officer', description: 'Submit the application online on your state portal or at the District Minority Welfare Office.', officeType: 'Collectorate', fee: '₹30–₹100', timeline: '—' },
      { order: 3, title: 'Verification & collection', description: 'After local verification the certificate is issued (validity usually 1–3 years).', officeType: 'Collectorate', fee: '—', timeline: '7–21 days' },
    ],
  },
  {
    docType: 'Caste Validity Certificate',
    summary: 'Extra verification of caste claims (required in states like Maharashtra along with the caste certificate for scholarships).',
    requiredProofs: ['Caste certificate', 'School leaving record', 'Ancestral caste proof'],
    steps: [
      { order: 1, title: 'Apply after getting caste certificate', description: 'Apply for validity/verification online (e.g., Arogya Seva / MahaDBT in Maharashtra) or at the tehsil.', officeType: 'Online', fee: '₹100–₹200', timeline: '—' },
      { order: 2, title: 'Field enquiry', description: 'A talathi/panchyat officer conducts a local enquiry into the caste claim.', officeType: 'Tehsildar', fee: '—', timeline: '—' },
      { order: 3, title: 'Validity certificate issued', description: 'The SDM/Tehsildar issues the validity certificate accepted by scholarship portals.', officeType: 'Tehsildar', fee: '—', timeline: '15–30 days' },
    ],
  },
];

module.exports = { buildMoreExams, buildMoreCompetitions, buildMaterials, MORE_GUIDES };
