/**
 * One-off: merge the expanded-landing i18n keys into en.json.
 * Run: node scripts/add-landing-en.js
 */
const fs = require('fs');
const path = require('path');

const ADD = {
  /* Hero stats strip */
  statsTitle: 'SSAP by the numbers',
  stat1Label: 'Government schemes in one search',
  stat2Label: 'Indian languages supported',
  stat3Label: 'Entrance exams with roadmaps',
  stat4Label: 'Step-by-step document guides',

  /* Trust / sources */
  trustTitle: 'Aligned with official sources',
  trustNote:
    'Scheme data is modeled on the National Scholarship Portal (NSP), myScheme, AICTE, UGC, DST and state scholarship portals — so what you see here is what you can verify on the official site.',

  /* Features 4–9 */
  feature4Title: 'AI Assistant, 24×7',
  feature4Body:
    'Ask anything in your own language — the assistant explains schemes, documents and next steps across 20+ intents, with an optional OpenAI/Gemini upgrade.',
  feature5Title: 'Exam Central',
  feature5Body:
    '68 real entrance and competitive exams — JEE, NEET, CUET, UPSC, SSC, CAT and state CETs — with phase-wise roadmaps, free resources and mock tests.',
  feature6Title: 'Competitions & Olympiads',
  feature6Body:
    'Smart India Hackathon, TCS CodeVita, national olympiads, robot contests and science fairs — every deadline and prize in one timeline.',
  feature7Title: 'Free Study Material',
  feature7Body:
    '140 curated resources from NCERT, DIKSHA, SWAYAM, NPTEL and SATHEE — notes, videos, previous-year papers and mocks in 7 languages.',
  feature8Title: 'Document Gap Checker',
  feature8Body:
    '10 step-by-step document guides — income, caste, domicile, UDID and more — that show exactly what is missing before you apply.',
  feature9Title: 'Nearby Government Offices',
  feature9Body:
    'An interactive map of 150 tehsil, CSC, e-Seva and collectorate offices with addresses, timings and the services each office offers.',

  /* Categories grid */
  catTitle: 'Find schemes for every kind of student',
  cat1Label: 'Scheduled Castes & Tribes',
  cat2Label: 'Other Backward Classes',
  cat3Label: 'Minority communities',
  cat4Label: 'Girls & women',
  cat5Label: 'Persons with disabilities',
  cat6Label: 'Meritorious students',
  cat7Label: 'Education loans & fee support',
  cat8Label: 'State scholarships (all 36 states & UTs)',

  /* How it works — step 4 */
  step4Title: 'Apply & track',
  step4Body:
    'Apply on the official portal, then track deadlines, renewals, document gaps and payment status from one dashboard.',

  /* Eligibility engine explainer */
  engineTitle: 'How the Eligibility Engine scores you',
  engineBody:
    'Every scheme is scored against your profile on six checks — age, gender, category, class level, income and domicile. Your match percentage maps to a clear verdict:',
  statusEligible: 'Eligible',
  statusEligibleBody: '80–100% match — you clear every check. Apply now.',
  statusAction: 'Action Needed',
  statusActionBody: '50–79% match — one or two documents or details are pending.',
  statusNot: 'Not Eligible',
  statusNotBody: 'Below 50% — key criteria do not match yet.',

  /* Languages */
  langTitle: 'Built for every corner of India',
  langBody:
    'SSAP works fully in 7 languages — the interface, scheme names and the AI assistant switch together, so no student is left behind.',

  /* Success stories */
  storyTitle: 'Students who found their funding',
  story1Quote:
    'I found the merit-cum-means scholarship I never knew existed. The eligibility engine matched me in seconds and told me exactly which document was missing.',
  story1Name: 'Priya S.',
  story1Role: 'B.Tech 2nd year · Pune, Maharashtra',
  story2Quote:
    'The CUET exam roadmap and deadline alerts kept me on track. My parents finally understood how we would pay for college.',
  story2Name: 'Arjun K.',
  story2Role: 'Class 12 · Lucknow, Uttar Pradesh',
  story3Quote:
    'I applied in Hindi with the AI assistant on my phone and tracked everything. ₹12,000 was credited straight to my bank via DBT.',
  story3Name: 'Fatima R.',
  story3Role: 'Nursing student · Hyderabad, Telangana',

  /* Why SSAP */
  whyTitle: 'Built for Bharat',
  why1Title: 'Mobile-first & accessible',
  why1Body: 'A 8px design grid, WCAG AA contrast, keyboard navigation and large tap targets — great on a ₹7,000 phone too.',
  why2Title: 'AI that speaks your language',
  why2Body: 'A 20-intent rule engine answers in 7 Indian languages out of the box, with an optional LLM upgrade.',
  why3Title: 'Never miss a deadline',
  why3Body: 'A cron engine watches every scheme and exam date and pushes in-app alerts 7, 3 and 1 day before closing.',
  why4Title: 'Verifiable, official data',
  why4Body: 'Every scheme links to its official portal — NSP, myScheme, MahaDBT, UP Scholarship and more — so trust is one click away.',

  /* FAQ */
  faqTitle: 'Frequently asked questions',
  faq1Q: 'Is SSAP free for students?',
  faq1A: 'Yes — 100% free. SSAP never charges students; it only helps you discover official schemes and guides you to the government portal to apply.',
  faq2Q: 'How does the eligibility matching work?',
  faq2A: 'Six checks — age, gender, category, class level, family income and domicile state — are scored against each scheme. 80%+ means Eligible, 50–79% means Action Needed, below 50% means Not Eligible.',
  faq3Q: 'Is the scheme data real and official?',
  faq3A: 'Yes. The catalogue is modeled on the National Scholarship Portal, myScheme (5,000+ GoI schemes), AICTE, UGC and state portals, and every scheme links out to its official application site.',
  faq4Q: 'Which languages are supported?',
  faq4A: 'English, Hindi, Marathi, Tamil, Telugu, Bengali and Gujarati — switch any time with the 🌐 button; the assistant follows your language too.',
  faq5Q: 'Does SSAP apply on my behalf?',
  faq5A: 'No. Applications always happen on the official government portal — SSAP prepares you with eligibility, document checklists, step-by-step guides and direct links.',
  faq6Q: 'How do deadline alerts work?',
  faq6A: 'A background job checks every scheme and exam you follow and raises in-app notifications 7, 3 and 1 day before the deadline, plus “closing soon” badges in your dashboard.',

  /* CTA */
  ctaSub: 'Create your free profile and see your eligible schemes in 30 seconds.',
};

const file = path.join(__dirname, '..', 'backend', 'src', 'locales', 'en.json');
const en = JSON.parse(fs.readFileSync(file, 'utf8'));
en.landing = { ...en.landing, ...ADD };
en.landing.featuresTitle = 'Everything in One Portal';
fs.writeFileSync(file, JSON.stringify(en, null, 2) + '\n', 'utf8');
console.log('en.json updated — landing keys:', Object.keys(en.landing).length, '| total top-level:', Object.keys(en).length);
