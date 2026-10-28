/**
 * Rule-based AI assistant engine.
 * Matches the query against ~20 intents, then builds a 3-step roadmap:
 *   1) Student & AI   2) Match & Alert   3) Docs & Apply
 * Optionally falls back to OpenAI / Gemini when an API key is configured.
 */

const env = require('../config/env');

const INTENTS = [
  {
    id: 'scholarship_eligibility',
    keywords: ['scholarship', 'scholarships', 'fee', 'funding', 'money', 'stipend', 'financial help', 'padhai', 'छात्रवृत्ति'],
    match: (q) => /scholarship|funding|stipend|fee waiver|छात्रवृत्ति|पैसे|आर्थिक/i.test(q),
    roadmap: [
      'Open your Dashboard and let the Eligibility Engine score every scheme for you.',
      'Go to /schemes and sort by Match % — shortlist the ones marked Eligible (green).',
      'Open each scheme, complete the Document Checklist, then Apply on the official portal.',
    ],
    reply:
      'I can help you find scholarships you actually qualify for. We score your age, category, class, income and state against every live scheme.',
  },
  {
    id: 'income_certificate',
    keywords: ['income certificate', 'income cert', 'आय प्रमाणपत्र', 'income proof'],
    match: (q) => /income cert|आय प्रमाण/i.test(q),
    roadmap: [
      'Gather proof: Aadhaar, ration card, salary slip or self-declaration.',
      'Visit your Tehsildar office or the nearest CSC / e-Seva centre with the proofs.',
      'Pay the small fee, note the application number, and collect the certificate in ~7-15 days.',
    ],
    reply:
      'An Income Certificate is issued by the Tehsildar / Mandal office. You can also get it at a CSC (Common Service Centre).',
  },
  {
    id: 'caste_certificate',
    keywords: ['caste certificate', 'sc', 'st', 'obc', 'जाति प्रमाणपत्र'],
    match: (q) => /caste cert|jati|जाति/i.test(q),
    roadmap: [
      'Collect proof of parents\' / ancestor\'s caste and your birth proof.',
      'Apply at the Tehsildar office or CSC in your district.',
      'Track the application and collect the certificate (usually 15-30 days).',
    ],
    reply:
      'Caste certificates (SC/ST/OBC) are issued by the Tehsildar / SDM office. Keep school records ready.',
  },
  {
    id: 'domicile_certificate',
    keywords: ['domicile', 'residence certificate', 'निवास प्रमाणपत्र'],
    match: (q) => /domicile|residence cert|निवास/i.test(q),
    roadmap: [
      'Gather address proof (Aadhaar, electricity bill) and school records.',
      'Apply online on your state portal or at the Tehsildar / e-Seva centre.',
      'Collect the domicile certificate once approved (7-21 days).',
    ],
    reply:
      'A Domicile / Residence certificate proves you live in a state — needed for most state scholarships.',
  },
  {
    id: 'jee_roadmap',
    keywords: ['jee', 'jee main', 'jee advanced', 'iit'],
    match: (q) => /\bjee\b|iit\b/i.test(q),
    roadmap: [
      'Download the NCERT + JEE syllabus and take a diagnostic mock to find weak topics.',
      'Follow a 12-month plan: 6 months concept build, 4 months practice, 2 months revision.',
      'Register on the official NTA portal before the deadline and attempt free mock tests weekly.',
    ],
    reply:
      'For JEE, NCERT is the foundation. Use SATHEE (free, from IIT) for concept videos and previous-year papers.',
  },
  {
    id: 'neet_roadmap',
    keywords: ['neet', 'medical', 'mbbs', 'biology'],
    match: (q) => /neet|mbbs|medical entrance/i.test(q),
    roadmap: [
      'Master NCERT Biology (Class 11 & 12) — ~50% of the paper comes from there.',
      'Add Physics numericals and Organic/Inorganic Chemistry revision cycles.',
      'Register on the NTA NEET portal and solve 10+ years of PYQs.',
    ],
    reply:
      'NEET is NCERT-first. Free coaching exists on SATHEE and through government schemes for SC/ST/EWS.',
  },
  {
    id: 'upsc_prep',
    keywords: ['upsc', 'ias', 'civil services', 'csat'],
    match: (q) => /upsc|civil service|\bias\b/i.test(q),
    roadmap: [
      'Read the NCERTs (6-12) for History, Geography, Polity, Economy, Environment.',
      'Pick one optional subject and start newspaper + answer-writing practice daily.',
      'Attempt free UPSC PYQs and a mock each month; revise with short notes.',
    ],
    reply:
      'UPSC needs consistency. Free resources: NCERT, NCERT-derived summaries, and previous-year papers.',
  },
  {
    id: 'exam_list',
    keywords: ['exams', 'entrance exams', 'which exam', 'list of exams'],
    match: (q) => /entrance exam|which exam|exams after|list of exam/i.test(q),
    roadmap: [
      'Go to /exams and filter by your stream (JEE, NEET, CLAT, GATE, CA, UPSC).',
      'Check registration deadlines — they are color-coded (red = closing soon).',
      'Open an exam for the timeline, free resources, books and mock tests.',
    ],
    reply:
      'We track major Indian entrance exams with timelines and free study resources. Which stream are you in?',
  },
  {
    id: 'hackathon',
    keywords: ['hackathon', 'hackathons', 'sih', 'competition', 'olympiad'],
    match: (q) => /hackathon|olympiad|competition|sih|e-yantra/i.test(q),
    roadmap: [
      'Open /competitions and toggle Ongoing / Upcoming.',
      'Filter by Hackathon or Olympiad and check eligibility + prize.',
      'Register before the deadline and form your team (many need 4-6 members).',
    ],
    reply:
      'Smart India Hackathon, HBCSE Olympiads, INSPIRE and e-Yantra are all listed on the Competitions page.',
  },
  {
    id: 'study_material',
    keywords: ['study material', 'notes', 'books', 'resources', 'free books', 'pyq'],
    match: (q) => /study material|notes|free book|previous year|resources|pyq/i.test(q),
    roadmap: [
      'Open /materials and filter by subject, class and type (Notes / Video / PYQ / Mock).',
      'Start with NCERT notes for your class, then add PYQs.',
      'Use SATHEE and NPTEL for free video lectures.',
    ],
    reply:
      'The Materials page aggregates free NCERT, SATHEE and NPTEL resources. What subject do you need?',
  },
  {
    id: 'documents_gap',
    keywords: ['missing documents', 'documents needed', 'what documents', 'docs'],
    match: (q) => /document|missing doc|what doc|docs needed/i.test(q),
    roadmap: [
      'Pick a target scheme on /documents — the Gap Detector lists exactly what is missing.',
      'Follow the step-by-step guide (office, fee, timeline) for each missing document.',
      'Use "Find Nearest Office" to open the map filtered to that document type.',
    ],
    reply:
      'The Document Gap detector compares your uploaded docs against a scheme\'s requirements and tells you what is missing.',
  },
  {
    id: 'nearby_office',
    keywords: ['office', 'near me', 'csc', 'tehsildar', 'setu', 'eseva', 'where to go'],
    match: (q) => /office|near me|csc|tehsildar|setu|e-seva|nearest/i.test(q),
    roadmap: [
      'Open /offices and tap "Use my location" (or pick your state).',
      'Filter by service (Income / Caste / Domicile) to find the right office.',
      'Tap "Get Directions" to open Google Maps.',
    ],
    reply:
      'I can point you to the nearest Tehsildar, CSC, Setu or e-Seva centre that issues your document.',
  },
  {
    id: 'deadline',
    keywords: ['deadline', 'last date', 'due', 'closing soon'],
    match: (q) => /deadline|last date|closing|due date/i.test(q),
    roadmap: [
      'Check the Deadline Radar on your Dashboard (next 30 days).',
      'Open /schemes and sort by Deadline to see what closes first.',
      'Enable notifications so we remind you 7 / 3 / 1 day before.',
    ],
    reply:
      'I track deadlines for schemes, exams and competitions. Your Dashboard shows a 30-day radar.',
  },
  {
    id: 'profile_setup',
    keywords: ['profile', 'update details', 'edit profile', 'set up'],
    match: (q) => /profile|update my|edit my|set up my/i.test(q),
    roadmap: [
      'Go to /profile and fill in Personal info (state, category, class, income).',
      'Upload your documents so the Gap Detector can verify them.',
      'Pick your preferred language in Preferences.',
    ],
    reply:
      'A complete profile makes the Eligibility Engine far more accurate. Let\'s update it.',
  },
  {
    id: 'language',
    keywords: ['language', 'hindi', 'tamil', 'telugu', 'bengali', 'marathi', 'gujarati', 'translate'],
    match: (q) => /language|hindi|tamil|telugu|bengali|marathi|gujarati|change lang/i.test(q),
    roadmap: [
      'Tap the globe icon in the top bar to switch language instantly.',
      'Your choice is saved to your profile and remembered across devices.',
      'Scheme and exam names also appear in your language where available.',
    ],
    reply:
      'The portal supports English, हिंदी, मराठी, தமிழ், తెలుగు, বাংলা and ગુજરાતી.',
  },
  {
    id: 'apply_help',
    keywords: ['how to apply', 'apply', 'application', 'form'],
    match: (q) => /how to apply|apply for|application form|fill form/i.test(q),
    roadmap: [
      'Open the scheme detail page and read the Eligibility tab (✅ / ❌ per criterion).',
      'Complete the Documents tab first — most rejections are document issues.',
      'Click Apply to open the official portal in a new tab, then "Mark as Applied".',
    ],
    reply:
      'Each scheme page has an official Apply link. I recommend completing documents first to avoid rejection.',
  },
  {
    id: 'saving_schemes',
    keywords: ['save', 'bookmark', 'saved'],
    match: (q) => /save|bookmark|saved scheme/i.test(q),
    roadmap: [
      'Tap the bookmark icon on any scheme or exam card.',
      'Find everything you saved under Profile → Saved items.',
      'We will alert you if a saved item\'s deadline is near.',
    ],
    reply:
      'You can bookmark schemes and exams; they appear in your Profile and on the Dashboard.',
  },
  {
    id: 'coaching',
    keywords: ['coaching', 'free coaching', 'tutoring', 'help classes'],
    match: (q) => /coaching|free classes|tutoring/i.test(q),
    roadmap: [
      'Check the exam detail page for Govt Coaching links (free, for eligible students).',
      'Look for scholarship schemes that cover coaching fees.',
      'Use SATHEE / NPTEL free video lectures as a coaching substitute.',
    ],
    reply:
      'Several government schemes fund free coaching for SC/ST/OBC/EWS students for JEE, NEET and UPSC.',
  },
  {
    id: 'greeting',
    keywords: ['hi', 'hello', 'namaste', 'hey', 'vanakkam'],
    match: (q) => /^(hi|hello|namaste|hey|vanakkam|नमस्ते)\b/i.test(q.trim()),
    roadmap: [
      'Ask me about scholarships, exams, documents or nearby offices.',
      'Or open the Dashboard to see your matched schemes.',
    ],
    reply:
      'Namaste! I\'m your student assistant. Ask me about scholarships, exams, documents, or nearby offices.',
  },
  {
    id: 'out_of_scope',
    keywords: [],
    match: () => true,
    roadmap: [
      'Try asking about scholarships, exams, documents or nearby offices.',
      'For anything else, contact support via the footer link.',
    ],
    reply:
      'I\'m not sure about that one. Here\'s how to reach a human: email support@ssap.in or use the Contact link in the footer.',
  },
];

function detectIntent(query) {
  const q = String(query || '').toLowerCase();
  for (const intent of INTENTS) {
    if (intent.match(q)) return intent;
  }
  return INTENTS[INTENTS.length - 1];
}

/** Build the structured answer the frontend renders. */
function ruleAnswer(query) {
  const intent = detectIntent(query);
  return {
    source: 'rule',
    intent: intent.id,
    response: intent.reply,
    roadmapSteps: intent.roadmap,
    suggestions: [
      { label: 'Scholarships for me', query: 'Which scholarships can I get?' },
      { label: 'Income certificate', query: 'How to get income certificate?' },
      { label: 'NEET roadmap', query: 'Give me a NEET roadmap' },
    ],
  };
}

async function openaiAnswer(query, lang = 'en') {
  if (!env.OPENAI_API_KEY) return null;
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant for Indian students on the Smart Student Assistance Portal. ' +
              'Answer in the requested language. Keep answers under 120 words and end with a 3-step action roadmap.',
          },
          { role: 'user', content: `Language: ${lang}\nQuery: ${query}` },
        ],
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) return null;
    return { source: 'openai', intent: 'llm', response: text, roadmapSteps: [] };
  } catch {
    return null;
  }
}

async function answer(query, lang = 'en', { allowLLM = true } = {}) {
  const rule = ruleAnswer(query);
  if (allowLLM && env.OPENAI_API_KEY) {
    const llm = await openaiAnswer(query, lang);
    if (llm) return { ...llm, suggestions: rule.suggestions };
  }
  return rule;
}

module.exports = { answer, ruleAnswer, detectIntent, INTENTS };
