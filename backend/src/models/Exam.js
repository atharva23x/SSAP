const mongoose = require('mongoose');
const { localizedSchema } = require('./Scheme');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: String,
    provider: { type: String, default: 'NCERT' },
  },
  { _id: false }
);

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: String,
    link: String,
  },
  { _id: false }
);

const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    nameLocalized: localizedSchema,
    slug: { type: String, unique: true, sparse: true },
    stream: {
      type: String,
      enum: ['JEE', 'NEET', 'MHT-CET', 'GATE', 'CLAT', 'CA', 'UPSC', 'SSC', 'Banking', 'Defence', 'Management', 'Olympiad', 'Other'],
      default: 'Other',
      index: true,
    },
    conductingBody: String,
    examDate: { type: Date, index: true },
    registrationDeadline: { type: Date },
    eligibility: String,
    syllabusUrl: String,
    freeResources: [resourceSchema],
    recommendedBooks: [bookSchema],
    mockTests: [resourceSchema],
    coachingLinks: [resourceSchema],
    state: { type: String, default: 'ALL' },
    officialUrl: String,
    roadmap: [
      {
        phase: String,
        title: String,
        months: String,
        detail: String,
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

examSchema.index({ name: 'text', stream: 'text', conductingBody: 'text' });

module.exports = mongoose.model('Exam', examSchema);
