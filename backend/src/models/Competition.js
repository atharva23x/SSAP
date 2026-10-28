const mongoose = require('mongoose');
const { localizedSchema } = require('./Scheme');

const competitionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    nameLocalized: localizedSchema,
    slug: { type: String, unique: true, sparse: true },
    type: {
      type: String,
      enum: ['SIH', 'HBCSE', 'INSPIRE', 'e-Yantra', 'Olympiad', 'Other'],
      default: 'Other',
    },
    category: { type: String, enum: ['hackathon', 'olympiad'], default: 'hackathon' },
    organizer: String,
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'online' },
    startDate: Date,
    endDate: Date,
    registrationDeadline: Date,
    eligibility: String,
    prizeDetails: String,
    registrationUrl: String,
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

competitionSchema.index({ registrationDeadline: 1 });
competitionSchema.index({ name: 'text', organizer: 'text', tags: 'text' });

module.exports = mongoose.model('Competition', competitionSchema);
