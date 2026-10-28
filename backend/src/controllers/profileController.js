const User = require('../models/User');
const Scheme = require('../models/Scheme');
const Exam = require('../models/Exam');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { localizeDocs } = require('../utils/localize');
const { upload } = require('../middleware/upload');

// PUT /api/profile
const updateProfile = asyncHandler(async (req, res) => {
  const allowed = [
    'name', 'phone', 'dob', 'gender', 'state', 'district', 'category',
    'classLevel', 'annualIncome', 'aadhaarLinked', 'preferredLanguage', 'notificationPrefs',
  ];
  const user = await User.findById(req.user._id);
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) user[k] = req.body[k];
  });
  await user.save();
  res.json({ success: true, user: user.toSafeJSON() });
});

// PUT /api/profile/password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, 'INVALID_CREDENTIALS');
  }
  await user.setPassword(newPassword);
  await user.save();
  res.json({ success: true });
});

// GET /api/profile/saved
const saved = asyncHandler(async (req, res) => {
  const [schemes, exams] = await Promise.all([
    Scheme.find({ _id: { $in: req.user.savedSchemes || [] } }).lean(),
    Exam.find({ _id: { $in: req.user.savedExams || [] } }).lean(),
  ]);
  res.json({
    success: true,
    data: {
      schemes: localizeDocs(schemes, req.lang),
      exams: localizeDocs(exams, req.lang),
    },
  });
});

// POST /api/profile/documents  (multipart, field "file", ?type=Income Certificate)
const uploadDocument = asyncHandler(async (req, res) => {
  const docType = req.body.type || req.query.type || req.file?.originalname;
  if (!req.file) throw new ApiError(400, 'FILE_REQUIRED');
  if (!docType) throw new ApiError(400, 'DOC_TYPE_REQUIRED');

  const fileUrl = req.file.path
    ? `/uploads/${req.file.filename}`
    : `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  const user = await User.findById(req.user._id);
  const existing = user.documents.find((d) => d.type.toLowerCase() === String(docType).toLowerCase());
  if (existing) {
    existing.fileUrl = fileUrl;
    existing.uploadedAt = new Date();
    existing.verified = false;
  } else {
    user.documents.push({ type: docType, fileUrl, uploadedAt: new Date(), verified: false });
  }
  await user.save();
  res.status(201).json({ success: true, documents: user.documents });
});

// DELETE /api/profile/documents/:docType
const removeDocument = asyncHandler(async (req, res) => {
  const docType = decodeURIComponent(req.params.docType);
  const user = await User.findById(req.user._id);
  user.documents = user.documents.filter((d) => d.type.toLowerCase() !== docType.toLowerCase());
  await user.save();
  res.json({ success: true, documents: user.documents });
});

module.exports = {
  updateProfile,
  changePassword,
  saved,
  uploadDocument: [upload.single('file'), uploadDocument],
  removeDocument,
};
