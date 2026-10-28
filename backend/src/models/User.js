const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const LANGUAGES = ['en', 'hi', 'mr', 'ta', 'te', 'bn', 'gu'];
const CATEGORIES = ['SC', 'ST', 'OBC', 'General', 'EWS'];
const CLASS_LEVELS = ['10th', '12th', 'UG', 'PG'];

const documentSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    number: { type: String, trim: true },
    fileUrl: { type: String },
    verified: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', ''] },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    category: { type: String, enum: CATEGORIES },
    classLevel: { type: String, enum: CLASS_LEVELS },
    annualIncome: { type: Number, default: 0, min: 0 },
    aadhaarLinked: { type: Boolean, default: false },
    preferredLanguage: { type: String, enum: LANGUAGES, default: 'en' },
    documents: [documentSchema],
    savedSchemes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scheme' }],
    savedExams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }],
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    isDemo: { type: Boolean, default: false },
    lastLogin: { type: Date },
    notificationPrefs: {
      email: { type: Boolean, default: true },
      deadline: { type: Boolean, default: true },
      newScheme: { type: Boolean, default: true },
      exam: { type: Boolean, default: true },
    },
    resetToken: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.index({ state: 1 });
userSchema.index({ category: 1 });
userSchema.index({ classLevel: 1 });

userSchema.methods.setPassword = async function setPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(plain, salt);
};

userSchema.methods.comparePassword = async function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
module.exports.LANGUAGES = LANGUAGES;
module.exports.CATEGORIES = CATEGORIES;
module.exports.CLASS_LEVELS = CLASS_LEVELS;
