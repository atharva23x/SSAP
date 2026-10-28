/**
 * Flagship state schemes — genuinely named state programmes (verified names),
 * plus the North Eastern Council (NEC) scholarship replicated for each NE state.
 */
const { MYSCHEME_URL, MYSCHEME, ALL, UGPG, CASTE_DOCS, SCH_DOCS } = require('./consts');

const FLAGSHIP = [
  {
    name: 'Mukhyamantri Medhavi Vidyarthi Yojana (MMVY)',
    provider: 'Higher Education Department, Madhya Pradesh', type: 'state', state: 'Madhya Pradesh', inDays: 25,
    desc: 'Fee reimbursement up to ₹1 lakh per year for meritorious students from families with income up to ₹2.5 lakh in professional and higher-education courses in Madhya Pradesh.',
    classLevels: ['12th', 'UG', 'PG'], income: 250000, amount: 100000,
    docs: ['Income Certificate', 'Mark Sheet', 'Aadhaar', 'Domicile Certificate', 'Bank Passbook'],
    url: 'https://mmsy.mponline.gov.in', portal: 'MMVY / MP Online', tags: ['state', 'madhya-pradesh', 'merit', 'fee-waiver'],
  },
  {
    name: 'Kanyashree Prakalpa (Kanyashree)',
    provider: 'Women & Child Development Dept, Government of West Bengal', type: 'state', state: 'West Bengal', inDays: 30, gender: 'female',
    desc: '₹750 per year for unmarried girls in Class 8–12 plus a one-time ₹25,000 grant on turning 18 — the UN-award-winning girl-child scheme of West Bengal (family income limit ₹1.2 lakh).',
    classLevels: ['8th', '9th', '10th', '11th', '12th'], income: 120000, amount: 750,
    docs: ['Aadhaar', 'Mark Sheet', 'Bank Passbook', 'Income Certificate'],
    url: 'https://kanyashree.wb.gov.in', portal: 'Kanyashree (WB)',
    tags: ['state', 'west-bengal', 'girl', 'female', 'school'],
  },
  {
    name: 'Aikyashree Scholarship (Minorities, West Bengal)',
    provider: 'Backward Classes Welfare Dept, Government of West Bengal', type: 'state', state: 'West Bengal', inDays: 20,
    desc: 'Pre-matric to PhD scholarship for minority students of West Bengal — one of the largest state minority scholarship programmes in India.',
    categories: ALL, classLevels: UGPG, income: 200000, amount: 12000,
    docs: ['Minority Certificate', 'Income Certificate', 'Aadhaar', 'Domicile Certificate'],
    url: 'https://aikyashree.wb.gov.in', portal: 'Aikyashree (WB)', tags: ['state', 'west-bengal', 'minority'],
  },
  {
    name: 'Swami Vivekananda Merit Cum Means Scholarship (SVMCM)',
    provider: 'Higher Education Dept, Government of West Bengal', type: 'state', state: 'West Bengal', inDays: 22,
    desc: 'Merit-cum-means scholarships for students of West Bengal at higher-secondary, undergraduate, postgraduate and diploma levels.',
    categories: ALL, classLevels: ['11th', '12th', 'UG', 'PG'], income: 250000, amount: 15000,
    docs: ['Income Certificate', 'Mark Sheet', 'Aadhaar', 'Bank Passbook'],
    url: 'https://svmcs.wb.gov.in', portal: 'SVMCM (WB)', tags: ['state', 'west-bengal', 'merit', 'means'],
  },
  {
    name: 'Mukhyamantri Kanya Sumangala Yojana (Uttar Pradesh)',
    provider: 'Government of Uttar Pradesh', type: 'state', state: 'Uttar Pradesh', inDays: 35, gender: 'female',
    desc: 'Six financial instalments from birth through graduation for every girl child of the family in Uttar Pradesh — promoting education and the girl child.',
    classLevels: ['11th', '12th', 'UG'], income: 300000, amount: 15000, duration: 'total (6 instalments)',
    docs: ['Aadhaar', 'Birth Certificate', 'Bank Passbook', 'Domicile Certificate'],
    url: 'https://mksy.up.gov.in', portal: 'Kanya Sumangala (UP)', tags: ['state', 'up', 'girl', 'female'],
  },
  {
    name: 'Mukhyamantri Kanya Utthan Yojana (Bihar)',
    provider: 'Government of Bihar', type: 'state', state: 'Bihar', inDays: 30, gender: 'female',
    desc: 'Financial assistance at every milestone of a girl\'s education in Bihar — admission, examination, hygiene kits and graduation-level support.',
    classLevels: ['11th', '12th', 'UG', 'PG'], income: 300000, amount: 20000, duration: 'total support',
    docs: ['Aadhaar', 'Mark Sheet', 'Bank Passbook', 'Domicile Certificate'],
    url: 'https://medhasoft.bih.nic.in', portal: 'Medhasoft (Bihar)', tags: ['state', 'bihar', 'girl', 'female'],
  },
  {
    name: 'Medhabruti e-Scholarship (Odisha)',
    provider: 'Higher Education Dept, Government of Odisha', type: 'state', state: 'Odisha', inDays: 24,
    desc: 'Merit scholarships for Odisha students at intermediate, undergraduate, postgraduate and executive-education levels, disbursed through the Odisha State Scholarship Portal.',
    categories: ALL, classLevels: ['11th', '12th', 'UG', 'PG'], income: 600000, amount: 15000,
    url: 'https://scholarship.odisha.gov.in', portal: 'Odisha State Scholarship Portal',
    tags: ['state', 'odisha', 'merit'],
  },
  {
    name: 'E-Kalyan Post Matric Scholarship (Jharkhand)',
    provider: 'SC/ST/OBC Welfare Dept, Government of Jharkhand', type: 'state', state: 'Jharkhand', inDays: 18,
    desc: 'Post-matric scholarship for SC/ST/OBC and minority students of Jharkhand — fee reimbursement plus maintenance allowance paid via DBT after institute verification.',
    categories: ALL, classLevels: UGPG, income: 250000, amount: 12000,
    docs: CASTE_DOCS, url: 'https://ekalyan.jharkhand.gov.in', portal: 'E-Kalyan (Jharkhand)',
    tags: ['state', 'jharkhand', 'post-matric'],
  },
  {
    name: 'Higher Education Scholarship (HES), Kerala',
    provider: 'Government of Kerala', type: 'state', state: 'Kerala', inDays: 26,
    desc: 'State scholarship for Kerala students in professional and general higher-education courses, with fee support for eligible families.',
    categories: ALL, classLevels: ['11th', '12th', 'UG', 'PG'], income: 250000, amount: 10000,
    url: 'https://socialsecurity.kerala.gov.in', portal: 'Kerala e-Scholarship',
    tags: ['state', 'kerala', 'higher-education'],
  },
  {
    name: 'Mukhyamantri Yuva Swavalamban Yojana (MYSY), Gujarat',
    provider: 'Education Department, Government of Gujarat', type: 'state', state: 'Gujarat', inDays: 28, bType: 'fee-waiver',
    desc: 'Tuition and exam fee support up to ₹50,000 per year plus hostel and book allowances for students from families with income up to ₹6 lakh in Gujarat.',
    classLevels: ['11th', '12th', 'UG', 'PG'], income: 600000, amount: 50000,
    docs: ['Income Certificate', 'Mark Sheet', 'Aadhaar', 'Domicile Certificate', 'Bank Passbook'],
    url: 'https://www.mysy.gujarat.gov.in', portal: 'MYSY (Gujarat)',
    tags: ['state', 'gujarat', 'fee-waiver', 'hostel'],
  },
  {
    name: 'Rajarshi Chhatrapati Shahu Maharaj Merit Scholarship (SC), Maharashtra',
    provider: 'Social Justice Dept, Government of Maharashtra', type: 'state', state: 'Maharashtra', inDays: 16,
    desc: 'Merit scholarships for SC students of Maharashtra notified through MahaDBT, supporting tuition and maintenance in professional and general courses.',
    categories: ['SC'], classLevels: UGPG, income: 250000, amount: 15000,
    docs: CASTE_DOCS, url: 'https://mahadbt.maharashtra.gov.in', portal: 'MahaDBT',
    tags: ['state', 'maharashtra', 'sc', 'merit'],
  },
  {
    name: 'Dr. Panjabrao Deshmukh Hostel Maintenance Allowance (Maharashtra)',
    provider: 'Social Justice Dept, Government of Maharashtra', type: 'state', state: 'Maharashtra', inDays: 16,
    desc: 'Hostel maintenance allowance for students of Maharashtra staying in hostels or rented accommodation away from their home district for study.',
    classLevels: ['11th', '12th', 'UG', 'PG'], income: 300000, amount: 24000,
    docs: ['Income Certificate', 'Hostel / Rent Receipt', 'Aadhaar', 'Bank Passbook'],
    url: 'https://mahadbt.maharashtra.gov.in', portal: 'MahaDBT',
    tags: ['state', 'maharashtra', 'hostel', 'maintenance'],
  },
];

/** North Eastern Council merit scholarships — real, replicated per NE state. */
const NE_STATES = ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'];

function necScholarships() {
  return NE_STATES.map((state) => ({
    name: `NEC Merit Scholarship for Higher Education — ${state}`,
    provider: 'North Eastern Council (NEC)', type: 'state', state, inDays: 32,
    desc: `Merit scholarship for students of ${state} pursuing undergraduate and postgraduate degrees — funded by the North Eastern Council for the eight North Eastern states.`,
    categories: ALL, classLevels: ['11th', '12th', 'UG', 'PG'], income: 600000, amount: 10000,
    docs: SCH_DOCS, url: 'https://nec.nic.in', portal: 'North Eastern Council (NEC)',
    tags: ['state', 'north-east', 'nec', 'merit', state.toLowerCase().replace(/\s+/g, '-')],
  }));
}

module.exports = { FLAGSHIP, NE_STATES, necScholarships };
