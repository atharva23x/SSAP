const mongoose = require('mongoose');

const aiQuerySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    query: { type: String, required: true },
    language: { type: String, default: 'en' },
    response: String,
    intent: String,
    roadmapSteps: [String],
    source: { type: String, enum: ['rule', 'openai', 'gemini'], default: 'rule' },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

aiQuerySchema.index({ createdAt: -1 });

module.exports = mongoose.model('AiQuery', aiQuerySchema);
