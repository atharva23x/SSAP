const Exam = require('../models/Exam');
const Competition = require('../models/Competition');
const StudyMaterial = require('../models/StudyMaterial');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { localizeDocs, localizeDoc } = require('../utils/localize');

// GET /api/exams?stream=&q=&page=
const listExams = asyncHandler(async (req, res) => {
  const { stream, q } = req.query;
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(60, Math.max(1, parseInt(req.query.limit || '20', 10)));
  const filter = { isActive: true };
  if (stream) filter.stream = stream;
  if (q) filter.$text = { $search: q };

  const [items, total] = await Promise.all([
    Exam.find(filter).sort({ examDate: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Exam.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: localizeDocs(items, req.lang),
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// GET /api/exams/:id
const getExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id).lean();
  if (!exam) throw new ApiError(404, 'EXAM_NOT_FOUND');
  const saved = (req.user.savedExams || []).some((s) => s.toString() === req.params.id);
  res.json({ success: true, data: { ...localizeDoc(exam, req.lang), saved } });
});

// POST /api/exams/:id/save
const saveExam = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(req.user._id);
  const exists = user.savedExams.some((s) => s.toString() === id);
  if (exists) user.savedExams = user.savedExams.filter((s) => s.toString() !== id);
  else user.savedExams.push(id);
  await user.save();
  res.json({ success: true, saved: !exists, savedExams: user.savedExams });
});

// GET /api/competitions?status=ongoing|upcoming|past&type=&mode=
const listCompetitions = asyncHandler(async (req, res) => {
  const { status, type, mode } = req.query;
  const now = new Date();
  const filter = { isActive: true };
  if (type) filter.category = type;
  if (mode) filter.mode = mode;
  if (status === 'ongoing') filter.startDate = { $lte: now };
  if (status === 'upcoming') filter.startDate = { $gt: now };
  if (status === 'past') filter.endDate = { $lt: now };

  const items = await Competition.find(filter).sort({ registrationDeadline: 1 }).limit(100).lean();
  res.json({ success: true, data: localizeDocs(items, req.lang, ['name']) });
});

// GET /api/materials?subject=&class=&type=&language=&q=
const listMaterials = asyncHandler(async (req, res) => {
  const { subject, class: classLevel, type, language, q } = req.query;
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(60, Math.max(1, parseInt(req.query.limit || '24', 10)));
  const filter = { isActive: true };
  if (subject) filter.subject = subject;
  if (classLevel) filter.classLevel = classLevel;
  if (type) filter.type = type;
  if (language) filter.language = language;
  if (q) filter.$text = { $search: q };

  const [items, total] = await Promise.all([
    StudyMaterial.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    StudyMaterial.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

module.exports = { listExams, getExam, saveExam, listCompetitions, listMaterials };
