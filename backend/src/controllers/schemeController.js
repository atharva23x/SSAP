const Scheme = require('../models/Scheme');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { localizeDocs, localizeDoc } = require('../utils/localize');
const { matchSchemes } = require('../utils/eligibility');

// GET /api/schemes?state=&category=&income=&class=&type=&q=&page=&limit=&sort=
const listSchemes = asyncHandler(async (req, res) => {
  const { state, category, income, class: classLevel, type, q, tag } = req.query;
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(60, Math.max(1, parseInt(req.query.limit || '12', 10)));
  const sort = req.query.sort === 'name' ? { name: 1 } : { deadline: 1 };

  const filter = { isActive: true };
  if (state && state !== 'ALL') filter.state = { $in: ['ALL', state] };
  if (type) filter.type = type;
  if (tag) filter.tags = tag;
  if (q) filter.$text = { $search: q };
  if (classLevel) filter['eligibility.classLevels'] = classLevel;
  if (category) filter['eligibility.categories'] = category;
  if (income) filter['eligibility.maxIncome'] = { $gte: Number(income) };

  const [items, total] = await Promise.all([
    Scheme.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Scheme.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: localizeDocs(items, req.lang),
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// GET /api/schemes/match  (Eligibility Engine)
const matchForUser = asyncHandler(async (req, res) => {
  const user = req.user;
  const { state, limit } = req.query;
  const filter = { isActive: true };
  if (state && state !== 'ALL') filter.state = { $in: ['ALL', state] };

  const schemes = await Scheme.find(filter).lean();
  let results = matchSchemes(user, schemes);
  if (req.query.status) results = results.filter((r) => r.status === req.query.status);
  const cap = Math.min(100, parseInt(limit || '50', 10));
  results = results.slice(0, cap);

  res.json({
    success: true,
    data: results.map((r) => ({
      ...localizeDoc(r.scheme, req.lang),
      matchPercent: r.matchPercent,
      status: r.status,
      checks: r.checks,
      deadlineDays: r.deadlineDays,
    })),
    meta: {
      eligible: results.filter((r) => r.status === 'eligible').length,
      actionNeeded: results.filter((r) => r.status === 'action_needed').length,
      notEligible: results.filter((r) => r.status === 'not_eligible').length,
    },
  });
});

// GET /api/schemes/:id
const getScheme = asyncHandler(async (req, res) => {
  const scheme = await Scheme.findById(req.params.id).lean();
  if (!scheme) throw new ApiError(404, 'SCHEME_NOT_FOUND');

  const { evaluateScheme } = require('../utils/eligibility');
  const evaluation = evaluateScheme(req.user, scheme);
  const saved = (req.user.savedSchemes || []).some((s) => s.toString() === req.params.id);

  res.json({
    success: true,
    data: {
      ...localizeDoc(scheme, req.lang, ['name', 'description']),
      matchPercent: evaluation.percent,
      status: evaluation.status,
      checks: evaluation.checks,
      saved,
    },
  });
});

// POST /api/schemes/:id/save  (toggle bookmark)
const saveScheme = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(req.user._id);
  const exists = user.savedSchemes.some((s) => s.toString() === id);
  if (exists) {
    user.savedSchemes = user.savedSchemes.filter((s) => s.toString() !== id);
  } else {
    user.savedSchemes.push(id);
  }
  await user.save();
  res.json({ success: true, saved: !exists, savedSchemes: user.savedSchemes });
});

module.exports = { listSchemes, matchForUser, getScheme, saveScheme };
