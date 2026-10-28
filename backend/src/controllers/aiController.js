const AiQuery = require('../models/AiQuery');
const asyncHandler = require('../utils/asyncHandler');
const { answer } = require('../utils/aiEngine');

// POST /api/ai/query  { query, lang }
const query = asyncHandler(async (req, res) => {
  const { query: q } = req.body;
  const lang = req.body.lang || req.lang || 'en';
  const result = await answer(q, lang);

  await AiQuery.create({
    userId: req.user?._id,
    query: q,
    language: lang,
    response: result.response,
    intent: result.intent,
    roadmapSteps: result.roadmapSteps,
    source: result.source,
  });

  res.json({ success: true, data: result });
});

// GET /api/ai/suggestions
const suggestions = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [
      { label: 'suggestions.scholarships', query: 'Which scholarships can I get?' },
      { label: 'suggestions.incomeCert', query: 'How to get income certificate?' },
      { label: 'suggestions.neet', query: 'Give me a NEET roadmap' },
      { label: 'suggestions.exams', query: 'Which entrance exams should I take?' },
      { label: 'suggestions.documents', query: 'What documents am I missing?' },
      { label: 'suggestions.office', query: 'Find my nearest office' },
    ],
  });
});

// GET /api/ai/history  (current user)
const history = asyncHandler(async (req, res) => {
  const items = await AiQuery.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ success: true, data: items });
});

module.exports = { query, suggestions, history };
