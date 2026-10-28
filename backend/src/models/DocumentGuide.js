const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema(
  {
    order: Number,
    title: { type: String, required: true },
    description: String,
    officeType: { type: String, enum: ['Tehsildar', 'CSC', 'Setu', 'e-Seva', 'Collectorate', 'Municipal', 'Hospital', 'Online'] },
    fee: String,
    timeline: String,
  },
  { _id: false }
);

const documentGuideSchema = new mongoose.Schema(
  {
    docType: { type: String, required: true, unique: true, index: true },
    docTypeLocalized: {
      hi: String,
      mr: String,
      ta: String,
      te: String,
      bn: String,
      gu: String,
    },
    summary: String,
    steps: [stepSchema],
    requiredProofs: [{ type: String }],
    eligibilityNote: String,
    officialPortal: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('DocumentGuide', documentGuideSchema);
