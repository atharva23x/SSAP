const mongoose = require('mongoose');

const localizedSchema = new mongoose.Schema(
  {
    hi: String,
    mr: String,
    ta: String,
    te: String,
    bn: String,
    gu: String,
  },
  { _id: false }
);

const eligibilitySchema = new mongoose.Schema(
  {
    minAge: Number,
    maxAge: Number,
    categories: [{ type: String }],
    classLevels: [{ type: String }],
    maxIncome: Number,
    gender: { type: String, enum: ['male', 'female', 'any', ''], default: 'any' },
    domicileState: { type: String, default: 'ALL' },
  },
  { _id: false }
);

const benefitsSchema = new mongoose.Schema(
  {
    amount: Number,
    duration: String,
    type: { type: String, enum: ['scholarship', 'grant', 'fee-waiver', 'stipend', 'loan'], default: 'scholarship' },
  },
  { _id: false }
);

const schemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    nameLocalized: localizedSchema,
    slug: { type: String, unique: true, sparse: true },
    type: { type: String, enum: ['central', 'state', 'private'], default: 'central' },
    provider: { type: String, required: true, trim: true },
    state: { type: String, default: 'ALL', index: true },
    description: { type: String, required: true },
    descriptionLocalized: localizedSchema,
    eligibility: eligibilitySchema,
    benefits: benefitsSchema,
    requiredDocuments: [{ type: String }],
    applicationUrl: { type: String },
    officialPortal: { type: String },
    deadline: { type: Date, index: true },
    startDate: { type: Date },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schemeSchema.index({ name: 'text', description: 'text', provider: 'text', tags: 'text' });
schemeSchema.index({ state: 1, deadline: 1 });

module.exports = mongoose.model('Scheme', schemeSchema);
module.exports.localizedSchema = localizedSchema;
