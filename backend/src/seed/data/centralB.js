/**
 * Central schemes — Part B (verified names/amounts where noted):
 *  - Dept of School Education & Literacy (NMMS ₹12,000/yr confirmed)
 *  - UGC / Ministry of Education (CSSS, IG Single Girl Child ₹36,200/yr confirmed)
 *  - AICTE (PRAGATI/Saksham/Swanath ₹50,000/yr confirmed)
 *  - DST INSPIRE, Ministry of Labour, D/o Empowerment of PwD
 *  - MHA / Railways / Kendriya Sainik Board PM Scholarship schemes
 */
const { NSP_URL, NSP, ALL, UGPG, SCH_DOCS, CASTE_DOCS, NSP_DOCS, DISABILITY_DOCS } = require('./consts');

module.exports = [
  /* ------------------- Dept of School Education & Literacy ------------------ */
  {
    name: 'National Means-cum-Merit Scholarship Scheme (NMMS)',
    provider: 'Dept of School Education & Literacy, Ministry of Education', inDays: 3,
    desc: '₹12,000/year (₹1,000/month) for Class 9–12 students who clear the state NMMS selection test in Class 8 and study in government, government-aided or local-body schools. 1 lakh fresh scholarships every year; family income limit ₹3.5 lakh.',
    categories: ALL, classLevels: ['9th', '10th', '11th', '12th'], income: 350000, amount: 12000,
    docs: ['Income Certificate', 'Mark Sheet', 'Aadhaar', 'School Bonafide', 'Bank Passbook'],
    url: NSP_URL, portal: NSP, tags: ['nmms', 'merit', 'school', 'nsp'],
  },
  {
    name: 'National Scheme of Incentive to Girls for Secondary Education (NSIGSE)',
    provider: 'Dept of School Education & Literacy, Ministry of Education', inDays: 30,
    desc: 'One-time fixed deposit made in the name of each SC/ST girl on completion of Class 9, to keep secondary-school girls from dropping out.',
    gender: 'female', categories: ['SC', 'ST'], classLevels: ['9th', '10th'], income: 250000,
    amount: 300, duration: 'one-time', url: NSP_URL, portal: NSP,
    tags: ['girl', 'female', 'sc', 'st', 'secondary'],
  },

  /* ---------------- UGC / Ministry of Education (higher education) ----------- */
  {
    name: 'Central Sector Scheme of Scholarships for College and University Students (CSSS)',
    provider: 'Dept of Higher Education, Ministry of Education', inDays: 40,
    desc: 'For students in the top 1% of board examinations — ₹10,000 per year at undergraduate level and ₹20,000 per year at postgraduate level, subject to income up to ₹8 lakh.',
    categories: ALL, classLevels: ['UG', 'PG'], income: 800000, amount: 10000,
    docs: ['Income Certificate', 'Mark Sheet', 'Aadhaar', 'Bank Passbook'],
    url: NSP_URL, portal: NSP, tags: ['merit', 'csss', 'topper', 'nsp'],
  },
  {
    name: 'PG Indira Gandhi Scholarship for Single Girl Child',
    provider: 'University Grants Commission (UGC)', inDays: 45,
    desc: '₹36,200 per year (₹3,100/month × 10 months) for a two-year full-time PG programme for single girl children; about 3,000 scholarships a year.',
    gender: 'female', categories: ALL, classLevels: ['PG'], income: 800000, amount: 36200,
    url: NSP_URL, portal: NSP, tags: ['girl', 'female', 'pg', 'single-girl', 'ugc'],
  },
  {
    name: 'PG Scholarship for University Rank Holders',
    provider: 'University Grants Commission (UGC)', inDays: 45,
    desc: '₹3,100 per month for the full duration of the PG course for students who secured first or second position in their university in the qualifying undergraduate examination.',
    categories: ALL, classLevels: ['PG'], income: 800000, amount: 31000, duration: 'per year',
    url: NSP_URL, portal: NSP, tags: ['merit', 'rank-holder', 'pg', 'ugc'],
  },
  {
    name: 'PG Scholarship for SC & ST Students for Pursuing Professional Courses',
    provider: 'University Grants Commission (UGC)', inDays: 45,
    desc: '₹7,800 per month for ME/MTech scholars and ₹4,500 per month for other professional postgraduate courses (engineering, medicine, law, pharmacy).',
    categories: ['SC', 'ST'], classLevels: ['PG'], income: 800000, amount: 7800, duration: 'per month',
    url: NSP_URL, portal: NSP, tags: ['sc', 'st', 'professional', 'pg', 'ugc'],
  },
  {
    name: 'UGC NET Junior Research Fellowship (JRF) & Lectureship',
    provider: 'University Grants Commission (UGC)', inDays: 40,
    desc: 'JRF award of ₹37,000/month in year 1 and ₹42,000/month thereafter, plus annual contingency, for research in universities and colleges after clearing UGC NET.',
    categories: ALL, classLevels: ['PG'], income: 800000, amount: 37000, duration: 'per month',
    url: 'https://ugcnet.nta.nic.in', portal: 'UGC NET (NTA)', tags: ['fellowship', 'research', 'net', 'ugc'],
  },
  {
    name: 'CSIR NET Junior Research Fellowship (Science)',
    provider: 'CSIR – Human Resource Development Group', inDays: 40,
    desc: 'Junior Research Fellowship for research in engineering, physical, chemical, life and mathematical sciences after clearing CSIR NET — ₹37,000/month in year 1.',
    categories: ALL, classLevels: ['PG'], income: 800000, amount: 37000, duration: 'per month',
    url: 'https://csirnet.nta.nic.in', portal: 'CSIR NET (NTA)', tags: ['fellowship', 'science', 'research', 'net'],
  },
  {
    name: "Prime Minister's Research Fellowship (PMRF)",
    provider: 'Ministry of Education / IITs, IISc, NITs', inDays: 50,
    desc: '₹70,000–₹1,25,000 per month plus ₹2 lakh per year research contingency for direct PhD admission at India\'s top research institutions through the PMRF route.',
    categories: ALL, classLevels: ['PG'], income: 800000, amount: 70000, duration: 'per month (up to ₹1.25 lakh)',
    url: 'https://pmrf.in', portal: 'PMRF Portal', tags: ['fellowship', 'phd', 'research', 'merit'],
  },

  /* ------------------------------- AICTE ---------------------------------- */
  {
    name: 'AICTE PRAGATI Scholarship Scheme for Girl Students (Technical Degree)',
    provider: 'All India Council for Technical Education (AICTE)', inDays: 3,
    desc: '₹50,000 per year as a lump sum (college fee, computer, books, stationery) for girls admitted to the first year of AICTE-approved degree courses; 5,000+ scholarships, DBT payout.',
    gender: 'female', categories: ALL, classLevels: ['UG'], income: 800000, amount: 50000,
    docs: NSP_DOCS, url: NSP_URL, portal: NSP, tags: ['girl', 'female', 'aicte', 'degree', 'technical'],
  },
  {
    name: 'AICTE PRAGATI Scholarship Scheme for Girl Students (Technical Diploma)',
    provider: 'All India Council for Technical Education (AICTE)', inDays: 3,
    desc: '₹50,000 per year for girls in the first year (or lateral entry) of AICTE-approved diploma courses in engineering and technology.',
    gender: 'female', categories: ALL, classLevels: ['Diploma'], income: 800000, amount: 50000,
    docs: NSP_DOCS, url: NSP_URL, portal: NSP, tags: ['girl', 'female', 'aicte', 'diploma', 'technical'],
  },
  {
    name: 'AICTE Saksham Scholarship Scheme for Specially Abled Students (Technical Degree)',
    provider: 'All India Council for Technical Education (AICTE)', inDays: 3,
    desc: '₹50,000 per year for differently-abled students with 40%+ disability admitted to AICTE-approved degree courses; 1,000+ scholarships.',
    categories: ALL, classLevels: ['UG'], income: 800000, amount: 50000,
    docs: DISABILITY_DOCS, url: NSP_URL, portal: NSP, tags: ['disability', 'pwd', 'aicte', 'degree', 'technical'],
  },
  {
    name: 'AICTE Saksham Scholarship Scheme for Specially Abled Students (Technical Diploma)',
    provider: 'All India Council for Technical Education (AICTE)', inDays: 3,
    desc: '₹50,000 per year for differently-abled students in AICTE-approved diploma programmes, disbursed through Direct Benefit Transfer.',
    categories: ALL, classLevels: ['Diploma'], income: 800000, amount: 50000,
    docs: DISABILITY_DOCS, url: NSP_URL, portal: NSP, tags: ['disability', 'pwd', 'aicte', 'diploma', 'technical'],
  },
  {
    name: 'AICTE Swanath Scholarship Scheme (Technical Degree)',
    provider: 'All India Council for Technical Education (AICTE)', inDays: 3,
    desc: '₹50,000 per year for orphan students and children who lost a parent, studying in AICTE-approved degree courses.',
    categories: ALL, classLevels: ['UG'], income: 800000, amount: 50000,
    docs: NSP_DOCS, url: NSP_URL, portal: NSP, tags: ['swanath', 'orphan', 'aicte', 'degree'],
  },
  {
    name: 'AICTE Swanath Scholarship Scheme (Technical Diploma)',
    provider: 'All India Council for Technical Education (AICTE)', inDays: 3,
    desc: '₹50,000 per year for orphan students studying in AICTE-approved diploma institutions.',
    categories: ALL, classLevels: ['Diploma'], income: 800000, amount: 50000,
    docs: NSP_DOCS, url: NSP_URL, portal: NSP, tags: ['swanath', 'orphan', 'aicte', 'diploma'],
  },
  {
    name: 'AICTE Saraswati Scholarship for Girls (BBA / BCA / BMS)',
    provider: 'All India Council for Technical Education (AICTE)', inDays: 35,
    desc: 'For EWS girl students admitted to the first year of BBA, BCA and BMS programmes at AICTE-approved institutions.',
    gender: 'female', categories: ['EWS', 'General'], classLevels: ['UG'], income: 800000, amount: 50000,
    url: NSP_URL, portal: NSP, tags: ['girl', 'female', 'ews', 'management', 'aicte'],
  },

  /* ------------------------- Science & fellowships ------------------------- */
  {
    name: 'INSPIRE Scholarship for Higher Education (SHE)',
    provider: 'Department of Science & Technology (DST)', inDays: 40,
    desc: '₹80,000 per year for up to 5 years for students in the top 1% of board exams pursuing natural and central science degrees (BSc/MSc and integrated programmes).',
    categories: ALL, classLevels: ['12th', 'UG', 'PG'], income: 800000, amount: 80000,
    url: 'https://www.online-inspire.gov.in', portal: 'INSPIRE (DST)', tags: ['science', 'merit', 'inspire', 'stem'],
  },
  {
    name: 'INSPIRE Awards (MANAK)',
    provider: 'Department of Science & Technology (DST)', inDays: 60,
    desc: '₹10,000 seed support per student for original science and technology project ideas selected at district and state-level science fairs.',
    categories: ALL, classLevels: ['6th', '7th', '8th', '9th', '10th', '11th', '12th'], income: 800000,
    amount: 10000, duration: 'one-time', url: 'https://www.online-inspire.gov.in',
    portal: 'INSPIRE (DST)', tags: ['school', 'innovation', 'science', 'manak'],
  },

  /* ------------------- Ministry of Labour & Employment --------------------- */
  {
    name: 'Financial Assistance for Education to the Wards of Beedi/Cine/IOMC/LSDM Workers (Pre-Matric)',
    provider: 'Ministry of Labour & Employment', inDays: 3,
    desc: 'Tuition and maintenance support for Class 9 and 10 children of Beedi, Cine, Iron-Ore Manganese, Chrome and Lignite/Soap-stone/Dolomite/Mica mine workers.',
    categories: ALL, classLevels: ['9th', '10th'], income: 100000, amount: 6000,
    docs: NSP_DOCS, url: NSP_URL, portal: NSP, tags: ['labour', 'pre-matric', 'beedi', 'nsp'],
  },
  {
    name: 'Financial Assistance for Education to the Wards of Beedi/Cine/IOMC/LSDM Workers (Post-Matric)',
    provider: 'Ministry of Labour & Employment', inDays: 3,
    desc: 'Course fee reimbursement and maintenance allowance for children of Beedi and Cine/IOMC/LSDM workers studying at post-matriculation level.',
    categories: ALL, classLevels: UGPG, income: 100000, amount: 18000,
    docs: NSP_DOCS, url: NSP_URL, portal: NSP, tags: ['labour', 'post-matric', 'beedi', 'nsp'],
  },

  /* ------------- D/o Empowerment of Persons with Disabilities --------------- */
  {
    name: 'Pre-Matric Scholarship for Students with Disabilities (Class 9 & 10)',
    provider: 'Department of Empowerment of Persons with Disabilities', inDays: 3,
    desc: 'Tuition and maintenance support for students with 40%+ disability in Class 9 and 10; includes a one-time assistive-device allowance.',
    categories: ALL, classLevels: ['9th', '10th'], income: 300000, amount: 10000,
    docs: DISABILITY_DOCS, url: NSP_URL, portal: NSP, tags: ['disability', 'pwd', 'pre-matric', 'nsp'],
  },
  {
    name: 'Post-Matric Scholarship for Students with Disabilities',
    provider: 'Department of Empowerment of Persons with Disabilities', inDays: 3,
    desc: 'Fee reimbursement, maintenance allowance and assistive-device support for students with disabilities at Class 11 through postgraduate level.',
    categories: ALL, classLevels: UGPG, income: 300000, amount: 15000,
    docs: DISABILITY_DOCS, url: NSP_URL, portal: NSP, tags: ['disability', 'pwd', 'post-matric', 'nsp'],
  },
  {
    name: 'Scholarship for Top Class Education for Students with Disabilities',
    provider: 'Department of Empowerment of Persons with Disabilities', inDays: 3,
    desc: 'Full tuition and maintenance support for students with disabilities in premier institutions — IIMs, NITs, NLUs and other notified top institutions.',
    categories: ALL, classLevels: ['UG', 'PG'], income: 800000, amount: 100000,
    docs: DISABILITY_DOCS, url: NSP_URL, portal: NSP, tags: ['disability', 'pwd', 'top-class', 'nsp'],
  },

  /* ------------- Defence / CAPF / Railways (PM Scholarship schemes) --------- */
  {
    name: "Prime Minister's Scholarship Scheme for Wards of CAPF & Assam Rifles Personnel",
    provider: 'Ministry of Home Affairs', inDays: 40,
    desc: 'Monthly scholarship for wards of CRPF, BSF, CISF, SSB, ITBP and Assam Rifles personnel pursuing professional degree courses — about 2,000 awards a year.',
    categories: ALL, classLevels: ['UG'], income: 800000, amount: 3000, duration: 'per month',
    url: 'https://cdseonline.gov.in', portal: 'Kendriya Sainik Board', tags: ['defence', 'capf', 'pmss', 'professional'],
  },
  {
    name: "Prime Minister's Scholarship Scheme for Wards of Railway Employees",
    provider: 'Ministry of Railways', inDays: 40,
    desc: 'Monthly scholarship for wards of serving and deceased railway employees pursuing professional degree courses across India.',
    categories: ALL, classLevels: ['UG'], income: 800000, amount: 3000, duration: 'per month',
    url: 'https://indianrailways.gov.in', portal: 'Ministry of Railways', tags: ['railways', 'pmss', 'professional'],
  },
  {
    name: "Prime Minister's Scholarship Scheme for Wards of Ex-Servicemen",
    provider: 'Kendriya Sainik Board, Ministry of Defence', inDays: 40,
    desc: 'Monthly scholarship for wards of ex-servicemen and ex-air force personnel studying in professional degree courses; higher award for girls.',
    categories: ALL, classLevels: ['UG'], income: 800000, amount: 3000, duration: 'per month',
    url: 'https://www.kendriyasainikboard.gov.in', portal: 'Kendriya Sainik Board',
    tags: ['defence', 'ex-servicemen', 'pmss', 'professional'],
  },
];
