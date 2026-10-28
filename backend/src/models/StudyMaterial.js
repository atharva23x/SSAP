const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, index: true },
    classLevel: { type: String, enum: ['6th', '8th', '10th', '12th', 'UG', 'PG', 'Other'], index: true },
    stream: String,
    type: { type: String, enum: ['notes', 'video', 'pyq', 'mock'], default: 'notes', index: true },
    language: { type: String, default: 'en' },
    url: String,
    provider: { type: String, default: 'NCERT' },
    free: { type: Boolean, default: true },
    thumbnail: String,
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Use a non-existent language_override field so the `language` column is treated
// as a normal field, not MongoDB's text-index language selector (which would
// reject values like "hi"/"ta").
studyMaterialSchema.index(
  { title: 'text', subject: 'text', provider: 'text' },
  { language_override: '_textLang' }
);

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
