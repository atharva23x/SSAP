const User = require('../models/User');
const Scheme = require('../models/Scheme');
const Exam = require('../models/Exam');
const Competition = require('../models/Competition');
const StudyMaterial = require('../models/StudyMaterial');
const Office = require('../models/Office');
const DocumentGuide = require('../models/DocumentGuide');
const AiQuery = require('../models/AiQuery');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// factory for simple CRUD resources
function crud(Model, name) {
  return {
    list: asyncHandler(async (req, res) => {
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const limit = Math.min(100, parseInt(req.query.limit || '25', 10));
      const [items, total] = await Promise.all([
        Model.find({}).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Model.countDocuments({}),
      ]);
      res.json({ success: true, data: items, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
    }),
    create: asyncHandler(async (req, res) => {
      const doc = await Model.create(req.body);
      res.status(201).json({ success: true, data: doc });
    }),
    update: asyncHandler(async (req, res) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!doc) throw new ApiError(404, `${name.toUpperCase()}_NOT_FOUND`);
      res.json({ success: true, data: doc });
    }),
    remove: asyncHandler(async (req, res) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) throw new ApiError(404, `${name.toUpperCase()}_NOT_FOUND`);
      res.json({ success: true });
    }),
  };
}

const schemes = crud(Scheme, 'scheme');
const exams = crud(Exam, 'exam');
const competitions = crud(Competition, 'competition');
const materials = crud(StudyMaterial, 'material');
const offices = crud(Office, 'office');
const guides = crud(DocumentGuide, 'guide');

// GET /api/admin/stats
const stats = asyncHandler(async (req, res) => {
  const [users, schemesN, examsN, competitionsN, materialsN, officesN, queries, unreadAlerts] =
    await Promise.all([
      User.countDocuments({}),
      Scheme.countDocuments({ isActive: true }),
      Exam.countDocuments({ isActive: true }),
      Competition.countDocuments({ isActive: true }),
      StudyMaterial.countDocuments({ isActive: true }),
      Office.countDocuments({ isActive: true }),
      AiQuery.countDocuments({}),
      Notification.countDocuments({ read: false }),
    ]);
  res.json({
    success: true,
    data: {
      users, schemes: schemesN, exams: examsN, competitions: competitionsN,
      materials: materialsN, offices: officesN, aiQueries: queries, unreadAlerts,
    },
  });
});

// GET /api/admin/users
const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ success: true, data: users.map(({ passwordHash, ...u }) => u) });
});

// PATCH /api/admin/users/:id/verify-doc
const verifyDoc = asyncHandler(async (req, res) => {
  const { docIndex, verified } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'USER_NOT_FOUND');
  if (user.documents[docIndex]) user.documents[docIndex].verified = verified !== false;
  await user.save();
  res.json({ success: true, documents: user.documents });
});

module.exports = {
  schemes, exams, competitions, materials, offices, guides,
  stats, listUsers, verifyDoc,
};
