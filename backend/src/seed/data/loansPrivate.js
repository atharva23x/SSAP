/**
 * Education-loan & interest-subvention schemes + well-known private/CSR scholarships.
 * Loan facts verified (PIB / Canara Bank PM-Vidyalaxmi page / Vidya Lakshmi guide):
 *  - PM-Vidyalaxmi: 3% interest subvention on loans ≤ ₹10 lakh (family income ≤ ₹8 lakh),
 *    75% credit guarantee enables collateral-free loans up to ₹7.5 lakh.
 *  - CSIS (PM-USP): 100% interest subsidy during moratorium — income ≤ ₹4.5 lakh,
 *    technical/professional courses, loans up to ₹10 lakh.
 */
const { MYSCHEME_URL, MYSCHEME, ALL, UGPG, SCH_DOCS } = require('./consts');

const LOANS = [
  {
    name: 'PM-Vidyalaxmi — Education Loan with Interest Subvention',
    provider: 'Ministry of Education', type: 'central', inDays: 60, bType: 'loan',
    desc: 'Education loans up to ₹10 lakh from any bank with a 3% interest subvention during the moratorium for family income up to ₹8 lakh; 75% credit guarantee makes loans up to ₹7.5 lakh collateral-free. Apply on the PM-Vidyalaxmi portal.',
    classLevels: UGPG, income: 800000, amount: 1000000, duration: 'up to ₹10 lakh',
    url: 'https://pmvidyalaxmi.moe.gov.in', portal: 'PM-Vidyalaxmi Portal',
    tags: ['loan', 'education-loan', 'interest-subvention', 'collateral-free'],
  },
  {
    name: 'Vidya Lakshmi Portal — Common Education Loan Application Form (CELAF)',
    provider: 'Dept of Higher Education + Indian Banks\' Association', type: 'central', inDays: 60, bType: 'loan',
    desc: 'Single Common Education Loan Application Form to compare interest rates and apply to multiple banks at once — 40+ banks on one login, with status tracking.',
    classLevels: UGPG, income: 800000, amount: 2000000, duration: 'varies by bank',
    url: 'https://www.vidyalakshmi.co.in', portal: 'Vidya Lakshmi',
    tags: ['loan', 'education-loan', 'portal', 'compare'],
  },
  {
    name: 'PM-USP Central Sector Interest Subsidy (CSIS)',
    provider: 'Dept of Higher Education, Ministry of Education', type: 'central', inDays: 60, bType: 'loan',
    desc: '100% interest subsidy during the moratorium period on education loans up to ₹10 lakh for technical and professional courses for students whose family income is up to ₹4.5 lakh.',
    classLevels: UGPG, income: 450000, amount: 1000000, duration: 'up to ₹10 lakh',
    url: MYSCHEME_URL, portal: MYSCHEME, tags: ['loan', 'education-loan', 'subsidy', 'csis', 'economically-weaker'],
  },
  {
    name: 'Credit Guarantee Fund Scheme for Education Loans (CGFSEL)',
    provider: 'Dept of Financial Services / CGTMSE', type: 'central', inDays: 60, bType: 'loan',
    desc: 'Government gives banks a 75% credit guarantee on education loans up to ₹7.5 lakh — which is how banks can offer collateral-free education loans to students.',
    classLevels: UGPG, income: 800000, amount: 750000, duration: 'up to ₹7.5 lakh',
    url: MYSCHEME_URL, portal: MYSCHEME, tags: ['loan', 'education-loan', 'collateral-free', 'guarantee'],
  },
  {
    name: 'PM Mudra Yojana — Shishu (up to ₹50,000)',
    provider: 'Dept of Financial Services', type: 'central', inDays: 60, bType: 'loan',
    desc: 'Collateral-free loans up to ₹50,000 for small ventures and self-employment — commonly used by students for laptops, certification courses and micro-businesses.',
    classLevels: ['11th', '12th', 'UG', 'PG'], income: 800000, amount: 50000, duration: 'up to ₹50,000',
    url: 'https://www.mudra.org.in', portal: 'MUDRA', tags: ['loan', 'mudra', 'shishu', 'startup'],
  },
  {
    name: 'Stand-Up India Loan for SC/ST and Women Entrepreneurs',
    provider: 'Dept of Financial Services / SIDBI', type: 'central', inDays: 60, bType: 'loan',
    desc: 'Composite bank loans of ₹10 lakh to ₹1 crore for at least one SC/ST borrower and one woman borrower per bank branch, for greenfield enterprises.',
    categories: ['SC', 'ST'], classLevels: ['11th', '12th', 'UG', 'PG'], income: 800000,
    amount: 1000000, duration: '₹10 lakh – ₹1 crore',
    url: 'https://www.standupmitra.in', portal: 'Stand-Up India (SIDBI)',
    tags: ['loan', 'entrepreneur', 'sc', 'st', 'startup'],
  },
  {
    name: 'Bihar Student Credit Card — ₹4 Lakh Education Loan',
    provider: 'Bihar Education Project Council', type: 'state', state: 'Bihar', inDays: 60, bType: 'loan',
    desc: 'Education loan up to ₹4 lakh at 4% annual interest (1% for girls, students with disabilities and transgender students) for higher studies in Bihar; repayment starts after course completion.',
    classLevels: UGPG, income: 800000, amount: 400000, duration: 'up to ₹4 lakh',
    url: 'https://scss.bihar.gov.in', portal: 'Student Credit Card, Bihar',
    tags: ['loan', 'education-loan', 'bihar', 'state', 'interest-subvention'],
  },
  {
    name: 'SBI Scholar Loan Scheme',
    provider: 'State Bank of India', type: 'private', inDays: 60, bType: 'loan',
    desc: 'Concessional education loans for students of premier institutions with simplified processing and largely collateral-free limits up to ₹7.5 lakh.',
    classLevels: UGPG, income: 800000, amount: 750000, duration: 'up to ₹7.5 lakh collateral-free',
    url: 'https://sbi.co.in', portal: 'State Bank of India', tags: ['loan', 'education-loan', 'bank'],
  },
  {
    name: 'Canara Bank Education Loan (IBA Model)',
    provider: 'Canara Bank', type: 'private', inDays: 60, bType: 'loan',
    desc: 'IBA-model education loan with course-period moratorium; eligible students get subvention benefits under PM-Vidyalaxmi/CSIS, plus Sec 80E tax benefit.',
    classLevels: UGPG, income: 800000, amount: 1000000, duration: 'up to ₹10 lakh',
    url: 'https://canarabank.com', portal: 'Canara Bank', tags: ['loan', 'education-loan', 'bank'],
  },
  {
    name: 'HDFC Credila Education Loan',
    provider: 'HDFC Credila (HDFC Ltd)', type: 'private', inDays: 60, bType: 'loan',
    desc: 'Dedicated education financier with collateral-free options for UG/PG study in India and abroad, custom repayment plans and Sec 80E tax benefit.',
    classLevels: UGPG, income: 800000, amount: 2000000, duration: 'up to ₹20 lakh',
    url: 'https://www.hdfccredila.com', portal: 'HDFC Credila', tags: ['loan', 'education-loan', 'nbfc', 'abroad'],
  },
  {
    name: 'ICICI Bank Education Loan',
    provider: 'ICICI Bank', type: 'private', inDays: 60, bType: 'loan',
    desc: 'Education loans for UG, PG and professional courses in India and abroad with fully digital processing and Sec 80E tax benefit on interest paid.',
    classLevels: UGPG, income: 800000, amount: 2000000, duration: 'up to ₹20 lakh',
    url: 'https://www.icicibank.com', portal: 'ICICI Bank', tags: ['loan', 'education-loan', 'bank'],
  },
];

const PRIVATE = [
  {
    name: 'Vidyasaarathi Scholarship Portal (NSDL)',
    provider: 'NSDL e-Governance Infrastructure', type: 'private', inDays: 30,
    desc: 'Corporate-funded scholarships across diploma, degree and professional courses — one eligibility-matched application reaches many sponsors.',
    classLevels: ['11th', '12th', 'UG', 'PG'], income: 800000, amount: 50000,
    url: 'https://www.vidyasaarathi.com', portal: 'Vidyasaarathi', tags: ['private', 'csr', 'platform'],
  },
  {
    name: 'HDFC Bank Parivartan\'s Spark Scholarship',
    provider: 'HDFC Bank (CSR)', type: 'private', inDays: 25,
    desc: 'Need-cum-merit scholarships for students in Class 11, 12 and undergraduate programmes from families with limited means.',
    classLevels: ['11th', '12th', 'UG'], income: 600000, amount: 100000,
    url: 'https://www.hdfcbank.com', portal: 'HDFC Bank Parivartan', tags: ['private', 'csr', 'merit'],
  },
  {
    name: 'Kotak Kanya Scholarship',
    provider: 'Kotak Education Foundation', type: 'private', inDays: 20, gender: 'female',
    desc: 'Scholarships for meritorious young women from underprivileged backgrounds pursuing undergraduate degrees across India.',
    classLevels: ['UG'], income: 600000, amount: 60000,
    url: 'https://www.kotak.com', portal: 'Kotak Education Foundation', tags: ['private', 'girl', 'female', 'ug'],
  },
  {
    name: 'L\'Oréal India for Young Women in Science Scholarship',
    provider: 'L\'Oréal India', type: 'private', inDays: 25, gender: 'female',
    desc: 'For young women who have passed Class 12 and are pursuing undergraduate degrees in basic and natural sciences in India.',
    classLevels: ['12th', 'UG'], income: 600000, amount: 100000,
    url: 'https://www.loreal.in', portal: 'L\'Oréal India', tags: ['private', 'girl', 'female', 'science', 'stem'],
  },
  {
    name: 'Azim Premji Foundation Scholarship',
    provider: 'Azim Premji Foundation', type: 'private', inDays: 35,
    desc: 'Need-based scholarships for students in government colleges and universities, covering tuition and study costs through the degree.',
    classLevels: UGPG, income: 800000, amount: 50000,
    url: 'https://www.azimpremjifoundation.org', portal: 'Azim Premji Foundation', tags: ['private', 'need-based', 'government-college'],
  },
  {
    name: 'Aditya Birla Group Scholarship Program',
    provider: 'Aditya Birla Group', type: 'private', inDays: 30,
    desc: 'Merit scholarships for students at IITs, NITs and top management institutes, renewed year on year on academic performance.',
    classLevels: ['UG', 'PG'], income: 800000, amount: 100000,
    url: 'https://www.adityabirla.com', portal: 'Aditya Birla Group', tags: ['private', 'merit', 'engineering', 'management'],
  },
  {
    name: 'Foundation for Excellence (FFE) Scholarship',
    provider: 'Foundation for Excellence', type: 'private', inDays: 30,
    desc: 'Need-cum-merit scholarships for academically strong students from financially constrained families across professional courses in India.',
    classLevels: ['11th', '12th', 'UG', 'PG'], income: 600000, amount: 75000,
    url: 'https://www.ffe.org', portal: 'Foundation for Excellence', tags: ['private', 'need-based', 'professional'],
  },
  {
    name: 'Buddy4Study India Scholarship Support',
    provider: 'Buddy4Study', type: 'private', inDays: 30,
    desc: 'Scholarship discovery platform matching students to 1,000+ live scholarships, with eligibility checks and application assistance.',
    classLevels: ['11th', '12th', 'UG', 'PG'], income: 800000, amount: 50000,
    url: 'https://www.buddy4study.com', portal: 'Buddy4Study', tags: ['private', 'platform', 'discovery'],
  },
];

module.exports = { LOANS, PRIVATE };
