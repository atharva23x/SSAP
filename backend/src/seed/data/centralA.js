/**
 * Central schemes — Part A (verified against NSP scholarships.gov.in, AY 2026-27;
 * NSP last date for pre/post-matric schemes: 31 Oct 2026 -> inDays: 3).
 * Social Justice & Empowerment | Tribal Affairs | Minority Affairs
 */
const { NSP_URL, NSP, NSP_DOCS, CASTE_DOCS } = require('./consts');

module.exports = [
  /* ---------------- Ministry of Social Justice & Empowerment ---------------- */
  {
    name: 'Pre-Matric Scholarship for Scheduled Caste Students (Class 9 & 10)',
    provider: 'Ministry of Social Justice & Empowerment', inDays: 3,
    desc: 'Tuition fee reimbursement and annual maintenance allowance for SC students in Class 9 and 10 at government and recognised private schools. Paid via DBT.',
    categories: ['SC'], classLevels: ['9th', '10th'], income: 250000, amount: 10000,
    docs: NSP_DOCS, url: NSP_URL, portal: NSP, tags: ['sc', 'pre-matric', 'nsp', 'school'],
  },
  {
    name: 'Post-Matric Scholarship for Scheduled Caste Students',
    provider: 'Ministry of Social Justice & Empowerment', inDays: 3,
    desc: 'Full course fee support plus maintenance allowance for SC students studying at post-matriculation level (Class 11 to PhD) in recognised institutions.',
    categories: ['SC'], classLevels: UGPG(), income: 250000, amount: 12000,
    docs: CASTE_DOCS, url: NSP_URL, portal: NSP, tags: ['sc', 'post-matric', 'nsp'],
  },
  {
    name: 'Central Sector Scholarship of Top Class Education for SC Students',
    provider: 'Ministry of Social Justice & Empowerment', inDays: 3,
    desc: 'Full tuition fee support and maintenance allowance for SC students in premier institutions — IITs, NITs, AIIMS, IIITs, NLUs and top universities.',
    categories: ['SC'], classLevels: ['UG', 'PG'], income: 800000, amount: 100000,
    docs: CASTE_DOCS, url: NSP_URL, portal: NSP, tags: ['sc', 'top-class', 'nsp', 'merit'],
  },
  {
    name: 'PM YASASVI Central Sector Scheme of Top Class Education in College for OBC, EBC and DNT Students',
    provider: 'Ministry of Social Justice & Empowerment', inDays: 3,
    desc: 'Fee support and stipend for OBC, EBC and DNT students studying in top colleges and notified institutions; family income limit ₹8 lakh per year.',
    categories: ['OBC', 'EWS', 'General'], classLevels: ['UG', 'PG'], income: 800000, amount: 60000,
    docs: NSP_DOCS, url: NSP_URL, portal: NSP, tags: ['obc', 'top-class', 'yasasvi', 'nsp'],
  },
  {
    name: 'PM-YASASVI Pre-Matric Scholarship for OBC, EBC and DNT Students (Class 9 & 10)',
    provider: 'Ministry of Social Justice & Empowerment', inDays: 3,
    desc: 'Pre-matric support for OBC, EBC and DNT students of Class 9 and 10 — tuition and maintenance allowance for families with income up to ₹2.5 lakh.',
    categories: ['OBC', 'EWS', 'General'], classLevels: ['9th', '10th'], income: 250000, amount: 12000,
    docs: NSP_DOCS, url: NSP_URL, portal: NSP, tags: ['obc', 'pre-matric', 'yasasvi', 'nsp'],
  },
  {
    name: 'Post-Matric Scholarship for OBC Students',
    provider: 'Ministry of Social Justice & Empowerment', inDays: 3,
    desc: 'Fee reimbursement and maintenance allowance for Other Backward Class students at post-matriculation level across India.',
    categories: ['OBC'], classLevels: UGPG(), income: 250000, amount: 10000,
    docs: CASTE_DOCS, url: NSP_URL, portal: NSP, tags: ['obc', 'post-matric', 'nsp'],
  },
  {
    name: 'Pre-Matric Scholarship for OBC Students (Class 9 & 10)',
    provider: 'Ministry of Social Justice & Empowerment', inDays: 3,
    desc: 'Tuition and maintenance support for OBC students in Class 9 and 10 in recognised schools.',
    categories: ['OBC'], classLevels: ['9th', '10th'], income: 250000, amount: 8000,
    docs: CASTE_DOCS, url: NSP_URL, portal: NSP, tags: ['obc', 'pre-matric', 'nsp'],
  },
  {
    name: 'Free Coaching Scheme for SC & OBC Candidates',
    provider: 'Ministry of Social Justice & Empowerment', inDays: 45,
    desc: 'Coaching fee reimbursement and stipend at empanelled institutes for SC/OBC students preparing for UPSC, SSC, banking, railways and other competitive examinations.',
    categories: ['SC', 'OBC'], classLevels: ['11th', '12th', 'UG', 'PG'], income: 300000, amount: 20000,
    url: NSP_URL, portal: 'Ministry of Social Justice & Empowerment', tags: ['coaching', 'sc', 'obc', 'competitive-exam'],
  },

  /* ----------------------- Ministry of Tribal Affairs ---------------------- */
  {
    name: 'National Fellowship and Scholarship for Higher Education of ST Students',
    provider: 'Ministry of Tribal Affairs', inDays: 3,
    desc: 'Junior/Senior Research Fellowship for ST scholars — ₹37,000/month in year 1 and ₹42,000/month thereafter, plus contingency — alongside the Top Class scholarship for ST students.',
    categories: ['ST'], classLevels: ['UG', 'PG'], income: 800000, amount: 37000, duration: 'per month',
    docs: CASTE_DOCS, url: NSP_URL, portal: NSP, tags: ['st', 'fellowship', 'nsp', 'research'],
  },
  {
    name: 'Post-Matric Scholarship for Scheduled Tribe Students',
    provider: 'Ministry of Tribal Affairs', inDays: 3,
    desc: 'Full fee reimbursement and maintenance allowance for ST students at post-matriculation level (Class 11 to PhD).',
    categories: ['ST'], classLevels: UGPG(), income: 200000, amount: 12000,
    docs: CASTE_DOCS, url: NSP_URL, portal: NSP, tags: ['st', 'post-matric', 'nsp'],
  },
  {
    name: 'Pre-Matric Scholarship for Scheduled Tribe Students (Class 9 & 10)',
    provider: 'Ministry of Tribal Affairs', inDays: 3,
    desc: 'Tuition and annual maintenance support for ST students in Class 9 and 10 studying in government or recognised private schools.',
    categories: ['ST'], classLevels: ['9th', '10th'], income: 200000, amount: 9000,
    docs: CASTE_DOCS, url: NSP_URL, portal: NSP, tags: ['st', 'pre-matric', 'nsp'],
  },
  {
    name: 'National Overseas Scholarship Scheme for ST Students',
    provider: 'Ministry of Tribal Affairs', inDays: 30,
    desc: 'Funds ST students for Master\'s, M.Phil and PhD degrees abroad — tuition and living costs at foreign university rates, with air fare to selected candidates.',
    categories: ['ST'], classLevels: ['PG'], income: 800000, amount: 2500000, duration: 'full course',
    docs: CASTE_DOCS, url: 'https://socialjustice.gov.in', portal: 'Ministry of Tribal Affairs', tags: ['st', 'overseas', 'abroad', 'pg'],
  },

  /* ---------------------- Ministry of Minority Affairs --------------------- */
  {
    name: 'Pre-Matric Scholarship for Minority Students (Class 1–10)',
    provider: 'Ministry of Minority Affairs', inDays: 3,
    desc: 'Fee support and maintenance for students of notified minority communities in Class 1 to Class 10, paid through the National Scholarship Portal.',
    categories: ALL_LEVELS_PRE(), classLevels: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'],
    income: 200000, amount: 6000, docs: NSP_DOCS, url: NSP_URL, portal: NSP,
    tags: ['minority', 'pre-matric', 'nsp', 'school'],
  },
  {
    name: 'Post-Matric Scholarship for Minority Students',
    provider: 'Ministry of Minority Affairs', inDays: 3,
    desc: 'Tuition and maintenance support for minority community students at Class 11, 12, undergraduate and postgraduate levels.',
    categories: ['General', 'OBC', 'SC', 'ST'], classLevels: UGPG(), income: 250000, amount: 12000,
    docs: NSP_DOCS, url: NSP_URL, portal: NSP, tags: ['minority', 'post-matric', 'nsp'],
  },
  {
    name: 'Merit-Cum-Means Scholarship for Minority Students (Professional & Technical Courses)',
    provider: 'Ministry of Minority Affairs', inDays: 3,
    desc: 'Reimbursement of course fees plus maintenance allowance for minority students in professional and technical degree programmes at approved institutions.',
    categories: ['General', 'OBC', 'SC', 'ST'], classLevels: ['UG', 'PG'], income: 250000, amount: 20000,
    docs: NSP_DOCS, url: NSP_URL, portal: NSP, tags: ['minority', 'merit', 'professional', 'nsp'],
  },
  {
    name: 'Begum Hazrat Mahal Scholarship for Minority Girl Students',
    provider: 'Ministry of Minority Affairs', inDays: 3,
    desc: 'Scholarship for meritorious girl students from notified minority communities in Class 9 to Class 12 — tuition and maintenance support.',
    gender: 'female', categories: ['General', 'OBC', 'SC', 'ST'],
    classLevels: ['9th', '10th', '11th', '12th'], income: 200000, amount: 12000,
    docs: NSP_DOCS, url: NSP_URL, portal: NSP, tags: ['girl', 'female', 'minority', 'nsp'],
  },
  {
    name: 'Maulana Azad National Fellowship for Minority Students',
    provider: 'Ministry of Minority Affairs / UGC', inDays: 45,
    desc: 'Junior Research Fellowship for minority scholars pursuing M.Phil and PhD — ₹37,000/month in year 1, ₹42,000/month thereafter, plus contingency grant.',
    categories: ['General', 'OBC', 'SC', 'ST'], classLevels: ['PG'], income: 600000, amount: 37000, duration: 'per month',
    url: 'https://www.ugc.gov.in', portal: 'UGC / Ministry of Minority Affairs', tags: ['minority', 'fellowship', 'research', 'phd'],
  },
  {
    name: 'Free Coaching and Allied Scheme (Naya Savera)',
    provider: 'Ministry of Minority Affairs', inDays: 45,
    desc: 'Free coaching for civil services, banking, SSC and other competitive examinations at empanelled institutes, with a monthly stipend for minority students.',
    categories: ['General', 'OBC', 'SC', 'ST'], classLevels: ['11th', '12th', 'UG', 'PG'], income: 300000,
    amount: 5000, duration: 'per month', url: NSP_URL, portal: NSP,
    tags: ['minority', 'coaching', 'competitive-exam'],
  },
];

function UGPG() { return ['11th', '12th', 'UG', 'PG']; }
function ALL_LEVELS_PRE() { return ['General', 'OBC', 'SC', 'ST', 'EWS']; }
