const Scheme = require('../models/Scheme');
const DocumentGuide = require('../models/DocumentGuide');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { documentGap } = require('../utils/eligibility');
const { pickLocalized } = require('../utils/localize');

// GET /api/documents/gap?schemeId=
const gap = asyncHandler(async (req, res) => {
  const { schemeId } = req.query;
  if (!schemeId) throw new ApiError(400, 'SCHEME_ID_REQUIRED');
  const scheme = await Scheme.findById(schemeId).lean();
  if (!scheme) throw new ApiError(404, 'SCHEME_NOT_FOUND');

  const required = scheme.requiredDocuments || [];
  const user = req.user;
  const have = new Map((user.documents || []).map((d) => [d.type.toLowerCase().trim(), d]));
  const rows = required.map((doc) => {
    const key = String(doc).toLowerCase().trim();
    const uploaded = have.get(key);
    return {
      docType: doc,
      status: uploaded ? (uploaded.verified ? 'verified' : 'uploaded') : 'missing',
      uploadedAt: uploaded?.uploadedAt || null,
      fileUrl: uploaded?.fileUrl || null,
    };
  });

  res.json({
    success: true,
    data: {
      schemeId: scheme._id,
      schemeName: pickLocalized(scheme.nameLocalized, req.lang, scheme.name),
      requiredDocuments: rows,
      missingCount: rows.filter((r) => r.status === 'missing').length,
    },
  });
});

// GET /api/documents/guide/:docType
const guide = asyncHandler(async (req, res) => {
  const docType = decodeURIComponent(req.params.docType);
  const doc = await DocumentGuide.findOne({
    docType: { $regex: new RegExp(`^${docType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  }).lean();
  if (!doc) throw new ApiError(404, 'GUIDE_NOT_FOUND');
  res.json({
    success: true,
    data: { ...doc, docTypeDisplay: pickLocalized(doc.docTypeLocalized, req.lang, doc.docType) },
  });
});

// GET /api/documents/guides  (list all guides)
const listGuides = asyncHandler(async (req, res) => {
  const docs = await DocumentGuide.find({}).lean();
  res.json({
    success: true,
    data: docs.map((d) => ({
      docType: d.docType,
      docTypeDisplay: pickLocalized(d.docTypeLocalized, req.lang, d.docType),
      summary: d.summary,
    })),
  });
});

// POST /api/documents/mark  { docType } -> mark a doc as obtained (no file)
const markObtained = asyncHandler(async (req, res) => {
  const { docType } = req.body;
  if (!docType) throw new ApiError(400, 'DOC_TYPE_REQUIRED');
  const user = await User.findById(req.user._id);
  const exists = user.documents.find((d) => d.type.toLowerCase() === docType.toLowerCase());
  if (!exists) {
    user.documents.push({ type: docType, verified: false, uploadedAt: new Date() });
  }
  await user.save();
  res.json({ success: true, documents: user.documents });
});

module.exports = { gap, guide, listGuides, markObtained };
